/**
 * SoundContext - Global sound system for NEVER DIE GUY
 *
 * Provides sound functions to all components.
 * Supports multiple sound themes: synth (Web Audio), medieval, wooden, stone
 * Persists enabled state to localStorage.
 *
 * NEVER DIE GUY
 */

import { createContext, useContext, useState, useCallback, useEffect, useRef, type ReactNode } from 'react';
import { useGameSettings, type SoundTheme } from './GameSettingsContext';

// Synth sound configuration (for 'synth' theme)
const SYNTH_CONFIG = {
  diceRoll: {
    clicks: 5,
    duration: 0.05,
    baseFreq: 800,
    variance: 200,
  },

  impact: {
    duration: 0.15,
    frequency: 80,
  },

  uiClick: {
    duration: 0.05,
    frequency: 600,
  },

  victory: {
    notes: [523, 659, 784, 1047],
    noteDuration: 0.15,
    noteGap: 0.1,
  },

  defeat: {
    notes: [294, 262, 233, 196],
    noteDuration: 0.2,
    noteGap: 0.15,
  },
};

// Theme sound paths
const THEME_SOUNDS: Record<Exclude<SoundTheme, 'synth'>, {
  diceRoll: string;
  impact: string;
  click: string;
  victory: string;
  defeat: string;
}> = {
  medieval: {
    diceRoll: '/sfx/themes/medieval/dice-roll.wav',
    impact: '/sfx/themes/medieval/impact.wav',
    click: '/sfx/themes/medieval/click.wav',
    victory: '/sfx/themes/medieval/victory.wav',
    defeat: '/sfx/themes/medieval/defeat.wav',
  },
  wooden: {
    diceRoll: '/sfx/themes/wooden/dice-roll.wav',
    impact: '/sfx/themes/wooden/impact.wav',
    click: '/sfx/themes/wooden/click.wav',
    victory: '/sfx/themes/wooden/victory.wav',
    defeat: '/sfx/themes/wooden/defeat.wav',
  },
  stone: {
    diceRoll: '/sfx/themes/stone/dice-roll.wav',
    impact: '/sfx/themes/stone/impact.wav',
    click: '/sfx/themes/stone/click.wav',
    victory: '/sfx/themes/stone/victory.wav',
    defeat: '/sfx/themes/stone/defeat.wav',
  },
};

// Explosion audio files (shared across all themes)
const EXPLOSION_SOUNDS = [
  '/sfx/explosion-01.wav',
  '/sfx/explosion-02.wav',
  '/sfx/explosion-03.wav',
];

interface SoundContextValue {
  playDiceRoll: () => void;
  playImpact: () => void;
  playUIClick: () => void;
  playVictory: () => void;
  playDefeat: () => void;
  playExplosion: () => void;
  soundEnabled: boolean;
  setSoundEnabled: (enabled: boolean) => void;
}

const SoundContext = createContext<SoundContextValue | null>(null);

const STORAGE_KEY = 'ndg-sound-enabled';

export function SoundProvider({ children }: { children: ReactNode }) {
  const { masterVolume, soundTheme, musicEnabled } = useGameSettings();

  const [soundEnabled, setSoundEnabledState] = useState(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored !== 'false'; // Default to true
  });

  const audioContextRef = useRef<AudioContext | null>(null);
  const musicAudioRef = useRef<HTMLAudioElement | null>(null);

  // Persist sound enabled state
  const setSoundEnabled = useCallback((enabled: boolean) => {
    setSoundEnabledState(enabled);
    localStorage.setItem(STORAGE_KEY, String(enabled));
  }, []);

  // Initialize AudioContext on first interaction
  const getAudioContext = useCallback(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    }
    if (audioContextRef.current.state === 'suspended') {
      audioContextRef.current.resume();
    }
    return audioContextRef.current;
  }, []);

  // Create oscillator with envelope
  const playTone = useCallback((frequency: number, duration: number, type: OscillatorType = 'sine', volume = 1) => {
    if (!soundEnabled) return;

    const ctx = getAudioContext();
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.type = type;
    oscillator.frequency.value = frequency;
    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    const now = ctx.currentTime;
    const adjustedVolume = volume * masterVolume;

    gainNode.gain.setValueAtTime(0, now);
    gainNode.gain.linearRampToValueAtTime(adjustedVolume, now + 0.01);
    gainNode.gain.exponentialRampToValueAtTime(0.01, now + duration);

    oscillator.start(now);
    oscillator.stop(now + duration);
  }, [soundEnabled, getAudioContext, masterVolume]);

  // Play noise burst
  const playNoise = useCallback((duration: number, volume = 1) => {
    if (!soundEnabled) return;

    const ctx = getAudioContext();
    const bufferSize = ctx.sampleRate * duration;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const source = ctx.createBufferSource();
    const gainNode = ctx.createGain();
    const filter = ctx.createBiquadFilter();

    source.buffer = buffer;
    filter.type = 'highpass';
    filter.frequency.value = 1000;

    source.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(ctx.destination);

    const now = ctx.currentTime;
    const adjustedVolume = volume * masterVolume;
    gainNode.gain.setValueAtTime(adjustedVolume, now);
    gainNode.gain.exponentialRampToValueAtTime(0.01, now + duration);

    source.start(now);
  }, [soundEnabled, getAudioContext, masterVolume]);

  // Play themed audio file
  const playThemeSound = useCallback((soundPath: string, volume = 1) => {
    if (!soundEnabled) return;

    const audio = new Audio(soundPath);
    audio.volume = masterVolume * volume;
    audio.play().catch(() => {
      // Ignore autoplay restrictions
    });
  }, [soundEnabled, masterVolume]);

  // Dice roll sound
  const playDiceRoll = useCallback(() => {
    if (!soundEnabled) return;

    if (soundTheme === 'synth') {
      const { clicks, duration, baseFreq, variance } = SYNTH_CONFIG.diceRoll;
      for (let i = 0; i < clicks; i++) {
        setTimeout(() => {
          const freq = baseFreq + (Math.random() - 0.5) * variance;
          playTone(freq, duration, 'square', 0.3);
          playNoise(duration * 0.5, 0.2);
        }, i * 50 + Math.random() * 30);
      }
    } else {
      playThemeSound(THEME_SOUNDS[soundTheme].diceRoll);
    }
  }, [soundEnabled, soundTheme, playTone, playNoise, playThemeSound]);

  // Impact sound
  const playImpact = useCallback(() => {
    if (!soundEnabled) return;

    if (soundTheme === 'synth') {
      const { duration, frequency } = SYNTH_CONFIG.impact;
      playTone(frequency, duration, 'sine', 0.6);
      playTone(frequency * 3, duration * 0.3, 'triangle', 0.3);
    } else {
      playThemeSound(THEME_SOUNDS[soundTheme].impact);
    }
  }, [soundEnabled, soundTheme, playTone, playThemeSound]);

  // UI click sound
  const playUIClick = useCallback(() => {
    if (!soundEnabled) return;

    if (soundTheme === 'synth') {
      const { duration, frequency } = SYNTH_CONFIG.uiClick;
      playTone(frequency, duration, 'square', 0.2);
    } else {
      playThemeSound(THEME_SOUNDS[soundTheme].click);
    }
  }, [soundEnabled, soundTheme, playTone, playThemeSound]);

  // Victory sound
  const playVictory = useCallback(() => {
    if (!soundEnabled) return;

    if (soundTheme === 'synth') {
      const { notes, noteDuration, noteGap } = SYNTH_CONFIG.victory;
      notes.forEach((freq, i) => {
        setTimeout(() => {
          playTone(freq, noteDuration, 'square', 0.4);
        }, i * (noteDuration + noteGap) * 1000);
      });
    } else {
      playThemeSound(THEME_SOUNDS[soundTheme].victory);
    }
  }, [soundEnabled, soundTheme, playTone, playThemeSound]);

  // Defeat sound
  const playDefeat = useCallback(() => {
    if (!soundEnabled) return;

    if (soundTheme === 'synth') {
      const { notes, noteDuration, noteGap } = SYNTH_CONFIG.defeat;
      notes.forEach((freq, i) => {
        setTimeout(() => {
          playTone(freq, noteDuration, 'sawtooth', 0.3);
        }, i * (noteDuration + noteGap) * 1000);
      });
    } else {
      playThemeSound(THEME_SOUNDS[soundTheme].defeat);
    }
  }, [soundEnabled, soundTheme, playTone, playThemeSound]);

  // Explosion sound (random from pool)
  const playExplosion = useCallback(() => {
    if (!soundEnabled) return;

    const randomIndex = Math.floor(Math.random() * EXPLOSION_SOUNDS.length);
    const audio = new Audio(EXPLOSION_SOUNDS[randomIndex]);
    audio.volume = masterVolume * 0.4; // 40% of master volume
    audio.play().catch(() => {
      // Ignore autoplay restrictions
    });
  }, [soundEnabled, masterVolume]);

  // Background music playback
  const playMusic = useCallback(() => {
    if (!musicAudioRef.current) {
      musicAudioRef.current = new Audio('/music/ambient-loop.mp3');
      musicAudioRef.current.loop = true;
    }
    musicAudioRef.current.volume = masterVolume * 0.3; // 30% of master for background
    musicAudioRef.current.play().catch(() => {
      // Ignore autoplay restrictions
    });
  }, [masterVolume]);

  const stopMusic = useCallback(() => {
    if (musicAudioRef.current) {
      musicAudioRef.current.pause();
    }
  }, []);

  // React to musicEnabled changes
  useEffect(() => {
    if (musicEnabled) {
      playMusic();
    } else {
      stopMusic();
    }
  }, [musicEnabled, playMusic, stopMusic]);

  // Update music volume when masterVolume changes
  useEffect(() => {
    if (musicAudioRef.current) {
      musicAudioRef.current.volume = masterVolume * 0.3;
    }
  }, [masterVolume]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
      if (musicAudioRef.current) {
        musicAudioRef.current.pause();
        musicAudioRef.current = null;
      }
    };
  }, []);

  return (
    <SoundContext.Provider
      value={{
        playDiceRoll,
        playImpact,
        playUIClick,
        playVictory,
        playDefeat,
        playExplosion,
        soundEnabled,
        setSoundEnabled,
      }}
    >
      {children}
    </SoundContext.Provider>
  );
}

export function useSoundContext(): SoundContextValue {
  const context = useContext(SoundContext);
  if (!context) {
    throw new Error('useSoundContext must be used within a SoundProvider');
  }
  return context;
}
