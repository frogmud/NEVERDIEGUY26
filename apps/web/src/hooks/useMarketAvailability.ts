/**
 * Market Availability Hook
 *
 * Manages time-based NPC availability for the Market.
 * Time periods: Dawn (6am-12pm), Day (12pm-6pm), Dusk (6pm-12am), Night (12am-6am)
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import type { TimeOfDay, MarketAvailability } from '../data/wiki/types';

// Time period boundaries (hours in 24h format)
const TIME_BOUNDARIES = {
  dawn: { start: 6, end: 12 },   // 6am - 12pm
  day: { start: 12, end: 18 },   // 12pm - 6pm
  dusk: { start: 18, end: 24 },  // 6pm - 12am
  night: { start: 0, end: 6 },   // 12am - 6am
} as const;

// Get display name for time period
const TIME_LABELS: Record<TimeOfDay, string> = {
  dawn: 'Dawn',
  day: 'Day',
  dusk: 'Dusk',
  night: 'Night',
};

// Get time range display
const TIME_RANGES: Record<TimeOfDay, string> = {
  dawn: '6am - 12pm',
  day: '12pm - 6pm',
  dusk: '6pm - 12am',
  night: '12am - 6am',
};

// Order of time periods (for "next appearance" calculations)
const TIME_ORDER: TimeOfDay[] = ['dawn', 'day', 'dusk', 'night'];

/**
 * Get current time period based on actual time
 */
function getCurrentTimeOfDay(): TimeOfDay {
  const hour = new Date().getHours();

  if (hour >= 6 && hour < 12) return 'dawn';
  if (hour >= 12 && hour < 18) return 'day';
  if (hour >= 18 && hour < 24) return 'dusk';
  return 'night';
}

/**
 * Get next time period
 */
function getNextTimeOfDay(current: TimeOfDay): TimeOfDay {
  const idx = TIME_ORDER.indexOf(current);
  return TIME_ORDER[(idx + 1) % TIME_ORDER.length];
}

/**
 * Calculate time until next period starts
 */
function getTimeUntilNextPeriod(): { hours: number; minutes: number; nextPeriod: TimeOfDay } {
  const now = new Date();
  const hour = now.getHours();
  const minutes = now.getMinutes();

  let nextBoundary: number;
  let nextPeriod: TimeOfDay;

  if (hour >= 6 && hour < 12) {
    nextBoundary = 12;
    nextPeriod = 'day';
  } else if (hour >= 12 && hour < 18) {
    nextBoundary = 18;
    nextPeriod = 'dusk';
  } else if (hour >= 18 && hour < 24) {
    nextBoundary = 24;
    nextPeriod = 'night';
  } else {
    nextBoundary = 6;
    nextPeriod = 'dawn';
  }

  // Calculate remaining time
  let hoursLeft = nextBoundary - hour - 1;
  let minutesLeft = 60 - minutes;

  if (minutesLeft === 60) {
    minutesLeft = 0;
    hoursLeft++;
  }

  return { hours: hoursLeft, minutes: minutesLeft, nextPeriod };
}

/**
 * Check if an NPC is available based on their availability config
 */
function checkAvailability(
  availability: MarketAvailability | undefined,
  currentTime: TimeOfDay,
  currentDay: number
): { isAvailable: boolean; reason?: string } {
  // No availability config = always available
  if (!availability) {
    return { isAvailable: true };
  }

  // Always available flag
  if (availability.always) {
    return { isAvailable: true };
  }

  // Check day of week (0 = Sunday)
  if (availability.days && availability.days.length > 0) {
    if (!availability.days.includes(currentDay)) {
      const nextDay = availability.days.find(d => d > currentDay) ?? availability.days[0];
      const daysUntil = nextDay > currentDay ? nextDay - currentDay : 7 - currentDay + nextDay;
      return {
        isAvailable: false,
        reason: `Returns in ${daysUntil} day${daysUntil > 1 ? 's' : ''}`,
      };
    }
  }

  // Check time of day
  if (availability.times && availability.times.length > 0) {
    if (!availability.times.includes(currentTime)) {
      // Find next available time
      const currentIdx = TIME_ORDER.indexOf(currentTime);
      for (let i = 1; i <= 4; i++) {
        const nextTime = TIME_ORDER[(currentIdx + i) % 4];
        if (availability.times.includes(nextTime)) {
          return {
            isAvailable: false,
            reason: `Returns at ${TIME_LABELS[nextTime]}`,
          };
        }
      }
      return { isAvailable: false, reason: 'Currently unavailable' };
    }
  }

  // Check chance (random availability)
  if (availability.chance !== undefined && availability.chance < 100) {
    // Use a seeded random based on date + NPC for consistency within the day
    // For prototype, we'll use a simple approach
    const seed = new Date().toDateString();
    const seededRandom = Math.abs(hashCode(seed)) % 100;
    if (seededRandom >= availability.chance) {
      return {
        isAvailable: false,
        reason: `${availability.chance}% chance to appear`,
      };
    }
  }

  return { isAvailable: true };
}

// Simple hash function for seeded randomness
function hashCode(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }
  return hash;
}

/**
 * Main hook for market availability
 */
export function useMarketAvailability() {
  const [currentTime, setCurrentTime] = useState<TimeOfDay>(getCurrentTimeOfDay);
  const [currentDay, setCurrentDay] = useState(() => new Date().getDay());

  // Update time period when it changes
  useEffect(() => {
    const checkTime = () => {
      const newTime = getCurrentTimeOfDay();
      const newDay = new Date().getDay();

      if (newTime !== currentTime) {
        setCurrentTime(newTime);
      }
      if (newDay !== currentDay) {
        setCurrentDay(newDay);
      }
    };

    // Check every minute
    const interval = setInterval(checkTime, 60000);

    return () => clearInterval(interval);
  }, [currentTime, currentDay]);

  // Memoized time info
  const timeInfo = useMemo(() => {
    const until = getTimeUntilNextPeriod();
    return {
      current: currentTime,
      label: TIME_LABELS[currentTime],
      range: TIME_RANGES[currentTime],
      next: until.nextPeriod,
      nextLabel: TIME_LABELS[until.nextPeriod],
      hoursUntilNext: until.hours,
      minutesUntilNext: until.minutes,
    };
  }, [currentTime]);

  // Check availability function
  const isAvailable = useCallback(
    (availability: MarketAvailability | undefined) => {
      return checkAvailability(availability, currentTime, currentDay);
    },
    [currentTime, currentDay]
  );

  return {
    currentTime,
    currentDay,
    timeInfo,
    isAvailable,
    TIME_LABELS,
    TIME_RANGES,
  };
}

/**
 * Utility to get when an NPC will next be available
 */
export function getNextAvailableTime(
  availability: MarketAvailability | undefined,
  currentTime: TimeOfDay
): TimeOfDay | null {
  if (!availability?.times || availability.times.length === 0) {
    return null; // Always available
  }

  const currentIdx = TIME_ORDER.indexOf(currentTime);
  for (let i = 0; i <= 4; i++) {
    const checkTime = TIME_ORDER[(currentIdx + i) % 4];
    if (availability.times.includes(checkTime)) {
      return checkTime;
    }
  }

  return null;
}

export { TIME_LABELS, TIME_RANGES, TIME_ORDER, getCurrentTimeOfDay };
