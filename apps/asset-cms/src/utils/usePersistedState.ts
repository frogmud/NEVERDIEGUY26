/**
 * Custom hook for persisting state to localStorage
 */

import { useState, useEffect, useCallback } from 'react';

export function usePersistedState<T>(
  key: string,
  defaultValue: T
): [T, (value: T | ((prev: T) => T)) => void] {
  // Initialize from localStorage or default
  const [state, setState] = useState<T>(() => {
    try {
      const stored = localStorage.getItem(`asset-cms:${key}`);
      return stored ? JSON.parse(stored) : defaultValue;
    } catch {
      return defaultValue;
    }
  });

  // Persist to localStorage on change
  useEffect(() => {
    try {
      localStorage.setItem(`asset-cms:${key}`, JSON.stringify(state));
    } catch {
      // Ignore storage errors
    }
  }, [key, state]);

  return [state, setState];
}

/**
 * Batch persist multiple settings
 */
export function loadSettings<T extends Record<string, unknown>>(
  prefix: string,
  defaults: T
): T {
  const result = { ...defaults };
  for (const key of Object.keys(defaults)) {
    try {
      const stored = localStorage.getItem(`asset-cms:${prefix}:${key}`);
      if (stored) {
        result[key as keyof T] = JSON.parse(stored);
      }
    } catch {
      // Use default
    }
  }
  return result;
}

export function saveSettings<T extends Record<string, unknown>>(
  prefix: string,
  settings: T
): void {
  for (const [key, value] of Object.entries(settings)) {
    try {
      localStorage.setItem(`asset-cms:${prefix}:${key}`, JSON.stringify(value));
    } catch {
      // Ignore storage errors
    }
  }
}
