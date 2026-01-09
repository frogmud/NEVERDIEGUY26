/**
 * SoundContext - Global sound system for NEVER DIE GUY
 *
 * Provides sound functions to all components.
 * Persists enabled state to localStorage.
 *
 * NEVER DIE GUY
 */

import { createContext, useContext, useState, useCallback, useEffect, useRef, type ReactNode } from 'react';

// Sound configuration
const SOUND_CONFIG = {
  masterVolume: 0.3,

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

interface SoundContextValue {
  playDiceRoll: () => void;
  playImpact: () => void;
  playUIClick: () => void;
  playVictory: () => void;
  playDefeat: () => void;
  soundEnabled: boolean;
  setSoundEnabled: (enabled: boolean) => void;
}

const SoundContext = createContext<SoundContextValue | null>(null);

const STORAGE_KEY = 'ndg-sound-enabled';

export function SoundProvider({ children }: { children: ReactNode }) {
  const [soundEnabled, setSoundEnabledState] = useState(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored !== 'false'; // Default to true
  });

  const audioContextRef = useRef<AudioContext | null>(null);

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
    const adjustedVolume = volume * SOUND_CONFIG.masterVolume;

    gainNode.gain.setValueAtTime(0, now);
    gainNode.gain.linearRampToValueAtTime(adjustedVolume, now + 0.01);
    gainNode.gain.exponentialRampToValueAtTime(0.01, now + duration);

    oscillator.start(now);
    oscillator.stop(now + duration);
  }, [soundEnabled, getAudioContext]);

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
    const adjustedVolume = volume * SOUND_CONFIG.masterVolume;
    gainNode.gain.setValueAtTime(adjustedVolume, now);
    gainNode.gain.exponentialRampToValueAtTime(0.01, now + duration);

    source.start(now);
  }, [soundEnabled, getAudioContext]);

  // Dice roll sound
  const playDiceRoll = useCallback(() => {
    if (!soundEnabled) return;

    const { clicks, duration, baseFreq, variance } = SOUND_CONFIG.diceRoll;

    for (let i = 0; i < clicks; i++) {
      setTimeout(() => {
        const freq = baseFreq + (Math.random() - 0.5) * variance;
        playTone(freq, duration, 'square', 0.3);
        playNoise(duration * 0.5, 0.2);
      }, i * 50 + Math.random() * 30);
    }
  }, [soundEnabled, playTone, playNoise]);

  // Impact sound
  const playImpact = useCallback(() => {
    if (!soundEnabled) return;

    const { duration, frequency } = SOUND_CONFIG.impact;
    playTone(frequency, duration, 'sine', 0.6);
    playTone(frequency * 3, duration * 0.3, 'triangle', 0.3);
  }, [soundEnabled, playTone]);

  // UI click sound
  const playUIClick = useCallback(() => {
    if (!soundEnabled) return;

    const { duration, frequency } = SOUND_CONFIG.uiClick;
    playTone(frequency, duration, 'square', 0.2);
  }, [soundEnabled, playTone]);

  // Victory sound
  const playVictory = useCallback(() => {
    if (!soundEnabled) return;

    const { notes, noteDuration, noteGap } = SOUND_CONFIG.victory;

    notes.forEach((freq, i) => {
      setTimeout(() => {
        playTone(freq, noteDuration, 'square', 0.4);
      }, i * (noteDuration + noteGap) * 1000);
    });
  }, [soundEnabled, playTone]);

  // Defeat sound
  const playDefeat = useCallback(() => {
    if (!soundEnabled) return;

    const { notes, noteDuration, noteGap } = SOUND_CONFIG.defeat;

    notes.forEach((freq, i) => {
      setTimeout(() => {
        playTone(freq, noteDuration, 'sawtooth', 0.3);
      }, i * (noteDuration + noteGap) * 1000);
    });
  }, [soundEnabled, playTone]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close();
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
