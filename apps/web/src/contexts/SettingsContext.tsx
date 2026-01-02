/**
 * Settings Context
 *
 * Manages app-wide user preferences for accessibility, display, and localization.
 * All settings are persisted to localStorage.
 *
 * Usage:
 *   import { useSettings } from '../contexts/SettingsContext';
 *   const { language, largeText, setLanguage, setLargeText } = useSettings();
 */

import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react';

// Supported languages
export type Language = 'en' | 'es' | 'fr' | 'de' | 'ja' | 'ko' | 'zh' | 'pt';

export const LANGUAGES: { code: Language; name: string }[] = [
  { code: 'en', name: 'English' },
  { code: 'es', name: 'Spanish' },
  { code: 'fr', name: 'French' },
  { code: 'de', name: 'German' },
  { code: 'ja', name: 'Japanese' },
  { code: 'ko', name: 'Korean' },
  { code: 'zh', name: 'Chinese' },
  { code: 'pt', name: 'Portuguese' },
];

// Settings state shape
interface Settings {
  // Localization
  language: Language;

  // Accessibility
  largeText: boolean;
  reducedMotion: boolean;
  highContrast: boolean;
  screenReader: boolean;

  // Display
  compactMode: boolean;
  colorblindMode: boolean;
  videoFeedEnabled: boolean;

  // Audio
  soundEnabled: boolean;
  musicEnabled: boolean;
  soundVolume: number;
  musicVolume: number;
}

// Default settings
const DEFAULT_SETTINGS: Settings = {
  language: 'en',
  largeText: false,
  reducedMotion: false,
  highContrast: false,
  screenReader: false,
  compactMode: false,
  colorblindMode: false,
  videoFeedEnabled: true,
  soundEnabled: true,
  musicEnabled: true,
  soundVolume: 80,
  musicVolume: 60,
};

// Storage key
const STORAGE_KEY = 'ndg_settings';

interface SettingsContextType extends Settings {
  // Setters
  setLanguage: (lang: Language) => void;
  setLargeText: (enabled: boolean) => void;
  setReducedMotion: (enabled: boolean) => void;
  setHighContrast: (enabled: boolean) => void;
  setScreenReader: (enabled: boolean) => void;
  setCompactMode: (enabled: boolean) => void;
  setColorblindMode: (enabled: boolean) => void;
  setVideoFeedEnabled: (enabled: boolean) => void;
  setSoundEnabled: (enabled: boolean) => void;
  setMusicEnabled: (enabled: boolean) => void;
  setSoundVolume: (volume: number) => void;
  setMusicVolume: (volume: number) => void;
  // Bulk operations
  resetToDefaults: () => void;
}

const SettingsContext = createContext<SettingsContextType | null>(null);

interface SettingsProviderProps {
  children: ReactNode;
}

// Load settings from localStorage
function loadSettings(): Settings {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      // Merge with defaults to handle new settings added over time
      return { ...DEFAULT_SETTINGS, ...parsed };
    }
  } catch {
    // Invalid JSON, use defaults
  }
  return DEFAULT_SETTINGS;
}

// Save settings to localStorage
function saveSettings(settings: Settings): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch {
    // localStorage unavailable or full
  }
}

export function SettingsProvider({ children }: SettingsProviderProps) {
  const [settings, setSettings] = useState<Settings>(loadSettings);

  // Persist settings on change
  useEffect(() => {
    saveSettings(settings);
  }, [settings]);

  // Apply CSS classes to document based on settings
  useEffect(() => {
    const root = document.documentElement;

    // Large text
    if (settings.largeText) {
      root.classList.add('large-text');
    } else {
      root.classList.remove('large-text');
    }

    // Reduced motion
    if (settings.reducedMotion) {
      root.classList.add('reduced-motion');
    } else {
      root.classList.remove('reduced-motion');
    }

    // High contrast
    if (settings.highContrast) {
      root.classList.add('high-contrast');
    } else {
      root.classList.remove('high-contrast');
    }

    // Compact mode
    if (settings.compactMode) {
      root.classList.add('compact-mode');
    } else {
      root.classList.remove('compact-mode');
    }

    // Colorblind mode
    if (settings.colorblindMode) {
      root.classList.add('colorblind-mode');
    } else {
      root.classList.remove('colorblind-mode');
    }

    // Language
    root.setAttribute('lang', settings.language);
  }, [settings]);

  // Individual setters
  const setLanguage = useCallback((language: Language) => {
    setSettings(prev => ({ ...prev, language }));
  }, []);

  const setLargeText = useCallback((largeText: boolean) => {
    setSettings(prev => ({ ...prev, largeText }));
  }, []);

  const setReducedMotion = useCallback((reducedMotion: boolean) => {
    setSettings(prev => ({ ...prev, reducedMotion }));
  }, []);

  const setHighContrast = useCallback((highContrast: boolean) => {
    setSettings(prev => ({ ...prev, highContrast }));
  }, []);

  const setScreenReader = useCallback((screenReader: boolean) => {
    setSettings(prev => ({ ...prev, screenReader }));
  }, []);

  const setCompactMode = useCallback((compactMode: boolean) => {
    setSettings(prev => ({ ...prev, compactMode }));
  }, []);

  const setColorblindMode = useCallback((colorblindMode: boolean) => {
    setSettings(prev => ({ ...prev, colorblindMode }));
  }, []);

  const setVideoFeedEnabled = useCallback((videoFeedEnabled: boolean) => {
    setSettings(prev => ({ ...prev, videoFeedEnabled }));
  }, []);

  const setSoundEnabled = useCallback((soundEnabled: boolean) => {
    setSettings(prev => ({ ...prev, soundEnabled }));
  }, []);

  const setMusicEnabled = useCallback((musicEnabled: boolean) => {
    setSettings(prev => ({ ...prev, musicEnabled }));
  }, []);

  const setSoundVolume = useCallback((soundVolume: number) => {
    setSettings(prev => ({ ...prev, soundVolume: Math.max(0, Math.min(100, soundVolume)) }));
  }, []);

  const setMusicVolume = useCallback((musicVolume: number) => {
    setSettings(prev => ({ ...prev, musicVolume: Math.max(0, Math.min(100, musicVolume)) }));
  }, []);

  const resetToDefaults = useCallback(() => {
    setSettings(DEFAULT_SETTINGS);
  }, []);

  return (
    <SettingsContext.Provider
      value={{
        ...settings,
        setLanguage,
        setLargeText,
        setReducedMotion,
        setHighContrast,
        setScreenReader,
        setCompactMode,
        setColorblindMode,
        setVideoFeedEnabled,
        setSoundEnabled,
        setMusicEnabled,
        setSoundVolume,
        setMusicVolume,
        resetToDefaults,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}
