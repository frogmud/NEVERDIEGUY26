/**
 * useSound - Web Audio API sound system for NEVER DIE GUY
 *
 * Generates retro-style synthesized sounds:
 * - Dice rolls (rattling clicks)
 * - Combat impacts (bass thuds)
 * - UI clicks (short blips)
 *
 * NEVER DIE GUY
 */

import { useCallback, useEffect, useRef } from 'react';

// Sound configuration
const SOUND_CONFIG = {
  // Master volume (0-1)
  masterVolume: 0.3,

  // Dice roll settings
  diceRoll: {
    clicks: 5,       // Number of click sounds
    duration: 0.05,  // Duration of each click
    baseFreq: 800,   // Base frequency
    variance: 200,   // Frequency variance
  },

  // Impact settings
  impact: {
    duration: 0.15,
    frequency: 80,   // Low bass thud
    decay: 0.1,
  },

  // UI click settings
  uiClick: {
    duration: 0.05,
    frequency: 600,
  },

  // Victory settings
  victory: {
    notes: [523, 659, 784, 1047], // C5, E5, G5, C6 (C major chord arpeggio)
    noteDuration: 0.15,
    noteGap: 0.1,
  },

  // Defeat settings
  defeat: {
    notes: [294, 262, 233, 196], // D4, C4, Bb3, G3 (descending)
    noteDuration: 0.2,
    noteGap: 0.15,
  },
};

export interface SoundHook {
  playDiceRoll: () => void;
  playImpact: () => void;
  playUIClick: () => void;
  playVictory: () => void;
  playDefeat: () => void;
  setEnabled: (enabled: boolean) => void;
  isEnabled: boolean;
}

export function useSound(): SoundHook {
  const audioContextRef = useRef<AudioContext | null>(null);
  const enabledRef = useRef(true);

  // Initialize AudioContext on first interaction
  const getAudioContext = useCallback(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    }
    // Resume if suspended (browsers require user interaction)
    if (audioContextRef.current.state === 'suspended') {
      audioContextRef.current.resume();
    }
    return audioContextRef.current;
  }, []);

  // Create oscillator with envelope
  const playTone = useCallback((frequency: number, duration: number, type: OscillatorType = 'sine', volume = 1) => {
    if (!enabledRef.current) return;

    const ctx = getAudioContext();
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.type = type;
    oscillator.frequency.value = frequency;
    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    const now = ctx.currentTime;
    const adjustedVolume = volume * SOUND_CONFIG.masterVolume;

    // Attack and decay envelope
    gainNode.gain.setValueAtTime(0, now);
    gainNode.gain.linearRampToValueAtTime(adjustedVolume, now + 0.01);
    gainNode.gain.exponentialRampToValueAtTime(0.01, now + duration);

    oscillator.start(now);
    oscillator.stop(now + duration);
  }, [getAudioContext]);

  // Play noise burst (for dice clicks)
  const playNoise = useCallback((duration: number, volume = 1) => {
    if (!enabledRef.current) return;

    const ctx = getAudioContext();
    const bufferSize = ctx.sampleRate * duration;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);

    // Generate white noise
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
  }, [getAudioContext]);

  // Dice roll sound - multiple rapid clicks
  const playDiceRoll = useCallback(() => {
    if (!enabledRef.current) return;

    const { clicks, duration, baseFreq, variance } = SOUND_CONFIG.diceRoll;

    for (let i = 0; i < clicks; i++) {
      setTimeout(() => {
        const freq = baseFreq + (Math.random() - 0.5) * variance;
        playTone(freq, duration, 'square', 0.3);
        playNoise(duration * 0.5, 0.2);
      }, i * 50 + Math.random() * 30);
    }
  }, [playTone, playNoise]);

  // Impact sound - bass thud
  const playImpact = useCallback(() => {
    if (!enabledRef.current) return;

    const { duration, frequency } = SOUND_CONFIG.impact;

    // Low bass hit
    playTone(frequency, duration, 'sine', 0.6);
    // Add some punch with a quick higher hit
    playTone(frequency * 3, duration * 0.3, 'triangle', 0.3);
  }, [playTone]);

  // UI click sound
  const playUIClick = useCallback(() => {
    if (!enabledRef.current) return;

    const { duration, frequency } = SOUND_CONFIG.uiClick;
    playTone(frequency, duration, 'square', 0.2);
  }, [playTone]);

  // Victory sound - ascending arpeggio
  const playVictory = useCallback(() => {
    if (!enabledRef.current) return;

    const { notes, noteDuration, noteGap } = SOUND_CONFIG.victory;

    notes.forEach((freq, i) => {
      setTimeout(() => {
        playTone(freq, noteDuration, 'square', 0.4);
      }, i * (noteDuration + noteGap) * 1000);
    });
  }, [playTone]);

  // Defeat sound - descending notes
  const playDefeat = useCallback(() => {
    if (!enabledRef.current) return;

    const { notes, noteDuration, noteGap } = SOUND_CONFIG.defeat;

    notes.forEach((freq, i) => {
      setTimeout(() => {
        playTone(freq, noteDuration, 'sawtooth', 0.3);
      }, i * (noteDuration + noteGap) * 1000);
    });
  }, [playTone]);

  // Set enabled state
  const setEnabled = useCallback((enabled: boolean) => {
    enabledRef.current = enabled;
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  return {
    playDiceRoll,
    playImpact,
    playUIClick,
    playVictory,
    playDefeat,
    setEnabled,
    isEnabled: enabledRef.current,
  };
}
