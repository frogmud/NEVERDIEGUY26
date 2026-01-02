/**
 * Design System Hooks
 *
 * Reusable hooks extracted from Homepage patterns
 */

import { useState, useEffect } from 'react';

/**
 * useMidnightCountdown - Returns a countdown string to midnight EST
 *
 * @returns HH:MM:SS formatted countdown string
 *
 * @example
 * const countdown = useMidnightCountdown();
 * // Returns "05:23:41" (5 hours, 23 minutes, 41 seconds until midnight EST)
 */
export function useMidnightCountdown(): string {
  const [countdown, setCountdown] = useState('');

  useEffect(() => {
    const calculateTimeToMidnight = () => {
      const now = new Date();
      // Get current time in EST
      const estTime = new Date(
        now.toLocaleString('en-US', { timeZone: 'America/New_York' })
      );
      // Calculate midnight EST
      const midnightEST = new Date(estTime);
      midnightEST.setHours(24, 0, 0, 0);
      // Get difference in seconds
      const diffMs = midnightEST.getTime() - estTime.getTime();
      const diffSec = Math.floor(diffMs / 1000);
      const hours = Math.floor(diffSec / 3600);
      const minutes = Math.floor((diffSec % 3600) / 60);
      const seconds = diffSec % 60;
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    };

    setCountdown(calculateTimeToMidnight());
    const interval = setInterval(() => {
      setCountdown(calculateTimeToMidnight());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return countdown;
}
