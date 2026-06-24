/**
 * Design System Hooks
 *
 * Reusable hooks extracted from Homepage patterns
 */

import { useState, useEffect } from 'react';
import useMediaQuery from '@mui/material/useMediaQuery';

/**
 * Responsive layout boundaries (single source of truth).
 *
 * These encode the app's *layout-mode* decisions, NOT MUI's `sx` breakpoints
 * (which keep their default values so existing responsive props are untouched).
 *
 * - MOBILE_MAX_WIDTH (768): at/below this the app uses its mobile layout - the
 *   desktop sidebar is hidden, the bottom tab bar shows, content is single-column.
 *   This is the "below tablet" line. Aligns with the BONES Tablet token (768).
 * - TABLET_MAX_WIDTH (1024): at/below this (but above mobile) the desktop sidebar
 *   collapses to icon-only.
 */
export const MOBILE_MAX_WIDTH = 768;
export const TABLET_MAX_WIDTH = 1024;

/**
 * useIsMobile - true at/below 768px (the "below tablet" mobile layout).
 *
 * Canonical replacement for ad-hoc `useMediaQuery('(max-width: 768px)')` calls.
 * Use this for sidebar-hidden / bottom-nav / single-column decisions.
 */
export function useIsMobile(): boolean {
  return useMediaQuery(`(max-width:${MOBILE_MAX_WIDTH}px)`);
}

/**
 * useIsTablet - true at/below 1024px (sidebar collapses to icon-only).
 * Note: this is also true on mobile; pair with `useIsMobile()` when you need the
 * exclusive 768-1024 band (e.g. `isTablet && !isMobile`).
 */
export function useIsTablet(): boolean {
  return useMediaQuery(`(max-width:${TABLET_MAX_WIDTH}px)`);
}

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
