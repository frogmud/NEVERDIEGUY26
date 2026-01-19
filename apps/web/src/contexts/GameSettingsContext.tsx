/**
 * GameSettingsContext - Global game settings for NEVER DIE GUY
 *
 * Provides game settings to all components.
 * Persists settings to localStorage.
 *
 * NEVER DIE GUY
 */

import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';

// Storage keys
const GAME_SPEED_KEY = 'ndg-game-speed';
const ANIMATIONS_ENABLED_KEY = 'ndg-animations-enabled';
const MUSIC_ENABLED_KEY = 'ndg-music-enabled';
const MASTER_VOLUME_KEY = 'ndg-master-volume';
const SOUND_THEME_KEY = 'ndg-sound-theme';
const ASCII_MODE_KEY = 'ndg-ascii-mode';

// Sound theme options
export type SoundTheme = 'synth' | 'medieval' | 'wooden' | 'stone';

// Default values
const DEFAULT_GAME_SPEED = 1;
const DEFAULT_ANIMATIONS_ENABLED = true;
const DEFAULT_MUSIC_ENABLED = true;
const DEFAULT_MASTER_VOLUME = 0.15; // Chess.com-style subtle volume
const DEFAULT_SOUND_THEME: SoundTheme = 'synth';
const DEFAULT_ASCII_MODE = true; // ASCII art rendering enabled by default

interface GameSettingsContextValue {
  // Game speed (0.5 to 2)
  gameSpeed: number;
  setGameSpeed: (speed: number) => void;

  // Animations enabled
  animationsEnabled: boolean;
  setAnimationsEnabled: (enabled: boolean) => void;

  // Music enabled
  musicEnabled: boolean;
  setMusicEnabled: (enabled: boolean) => void;

  // Master volume (0 to 1)
  masterVolume: number;
  setMasterVolume: (volume: number) => void;

  // Sound theme
  soundTheme: SoundTheme;
  setSoundTheme: (theme: SoundTheme) => void;

  // ASCII art rendering mode
  asciiMode: boolean;
  setAsciiMode: (enabled: boolean) => void;

  // Helper to adjust delay based on game speed
  // Lower game speed = slower animations (higher delay)
  // Higher game speed = faster animations (lower delay)
  adjustDelay: (baseDelay: number) => number;
}

const GameSettingsContext = createContext<GameSettingsContextValue | null>(null);

export function GameSettingsProvider({ children }: { children: ReactNode }) {
  // Game speed state with localStorage persistence
  const [gameSpeed, setGameSpeedState] = useState(() => {
    const stored = localStorage.getItem(GAME_SPEED_KEY);
    if (stored) {
      const parsed = parseFloat(stored);
      if (!isNaN(parsed) && parsed >= 0.5 && parsed <= 2) {
        return parsed;
      }
    }
    return DEFAULT_GAME_SPEED;
  });

  // Animations enabled state
  const [animationsEnabled, setAnimationsEnabledState] = useState(() => {
    const stored = localStorage.getItem(ANIMATIONS_ENABLED_KEY);
    return stored !== 'false'; // Default to true
  });

  // Music enabled state
  const [musicEnabled, setMusicEnabledState] = useState(() => {
    const stored = localStorage.getItem(MUSIC_ENABLED_KEY);
    return stored !== 'false'; // Default to true
  });

  // Master volume state (0 to 1)
  const [masterVolume, setMasterVolumeState] = useState(() => {
    const stored = localStorage.getItem(MASTER_VOLUME_KEY);
    if (stored) {
      const parsed = parseFloat(stored);
      if (!isNaN(parsed) && parsed >= 0 && parsed <= 1) {
        return parsed;
      }
    }
    return DEFAULT_MASTER_VOLUME;
  });

  // Sound theme state
  const [soundTheme, setSoundThemeState] = useState<SoundTheme>(() => {
    const stored = localStorage.getItem(SOUND_THEME_KEY);
    if (stored && ['synth', 'medieval', 'wooden', 'stone'].includes(stored)) {
      return stored as SoundTheme;
    }
    return DEFAULT_SOUND_THEME;
  });

  // ASCII mode state
  const [asciiMode, setAsciiModeState] = useState(() => {
    const stored = localStorage.getItem(ASCII_MODE_KEY);
    if (stored !== null) {
      return stored === 'true';
    }
    return DEFAULT_ASCII_MODE;
  });

  // Setters with localStorage persistence
  const setGameSpeed = useCallback((speed: number) => {
    const clampedSpeed = Math.max(0.5, Math.min(2, speed));
    setGameSpeedState(clampedSpeed);
    localStorage.setItem(GAME_SPEED_KEY, String(clampedSpeed));
  }, []);

  const setAnimationsEnabled = useCallback((enabled: boolean) => {
    setAnimationsEnabledState(enabled);
    localStorage.setItem(ANIMATIONS_ENABLED_KEY, String(enabled));
  }, []);

  const setMusicEnabled = useCallback((enabled: boolean) => {
    setMusicEnabledState(enabled);
    localStorage.setItem(MUSIC_ENABLED_KEY, String(enabled));
  }, []);

  const setMasterVolume = useCallback((volume: number) => {
    const clampedVolume = Math.max(0, Math.min(1, volume));
    setMasterVolumeState(clampedVolume);
    localStorage.setItem(MASTER_VOLUME_KEY, String(clampedVolume));
  }, []);

  const setSoundTheme = useCallback((theme: SoundTheme) => {
    setSoundThemeState(theme);
    localStorage.setItem(SOUND_THEME_KEY, theme);
  }, []);

  const setAsciiMode = useCallback((enabled: boolean) => {
    setAsciiModeState(enabled);
    localStorage.setItem(ASCII_MODE_KEY, String(enabled));
  }, []);

  // Helper to adjust delays based on game speed
  // gameSpeed 2 = delays cut in half (faster)
  // gameSpeed 0.5 = delays doubled (slower)
  const adjustDelay = useCallback((baseDelay: number): number => {
    if (!animationsEnabled) return 0; // Skip animations entirely
    return baseDelay / gameSpeed;
  }, [gameSpeed, animationsEnabled]);

  return (
    <GameSettingsContext.Provider
      value={{
        gameSpeed,
        setGameSpeed,
        animationsEnabled,
        setAnimationsEnabled,
        musicEnabled,
        setMusicEnabled,
        masterVolume,
        setMasterVolume,
        soundTheme,
        setSoundTheme,
        asciiMode,
        setAsciiMode,
        adjustDelay,
      }}
    >
      {children}
    </GameSettingsContext.Provider>
  );
}

export function useGameSettings(): GameSettingsContextValue {
  const context = useContext(GameSettingsContext);
  if (!context) {
    throw new Error('useGameSettings must be used within a GameSettingsProvider');
  }
  return context;
}
