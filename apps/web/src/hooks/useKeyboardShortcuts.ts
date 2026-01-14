/**
 * useKeyboardShortcuts - Combat keyboard shortcuts
 *
 * Shortcuts:
 * - Space: Throw dice
 * - R: Reset throw (release all holds)
 * - 1-6: Toggle hold on dice slot
 * - Esc: Open pause menu
 * - ?: Show shortcuts help
 *
 * NEVER DIE GUY
 */

import { useEffect, useCallback } from 'react';

interface KeyboardShortcutHandlers {
  onThrow?: () => void;
  onReset?: () => void;
  onToggleDie?: (index: number) => void;
  onPause?: () => void;
  onShowShortcuts?: () => void;
  /** Whether shortcuts are enabled (disabled in lobby, menus, etc.) */
  enabled?: boolean;
}

export function useKeyboardShortcuts({
  onThrow,
  onReset,
  onToggleDie,
  onPause,
  onShowShortcuts,
  enabled = true,
}: KeyboardShortcutHandlers) {
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    // Ignore if shortcuts disabled or typing in an input
    if (!enabled) return;
    if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) {
      return;
    }

    const key = event.key.toLowerCase();

    switch (key) {
      case ' ':
        event.preventDefault();
        onThrow?.();
        break;

      case 'r':
        event.preventDefault();
        onReset?.();
        break;

      case '1':
      case '2':
      case '3':
      case '4':
      case '5':
      case '6':
        event.preventDefault();
        onToggleDie?.(parseInt(key) - 1); // Convert to 0-indexed
        break;

      case 'escape':
        event.preventDefault();
        onPause?.();
        break;

      case '?':
        event.preventDefault();
        onShowShortcuts?.();
        break;

      default:
        break;
    }
  }, [enabled, onThrow, onReset, onToggleDie, onPause, onShowShortcuts]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);
}
