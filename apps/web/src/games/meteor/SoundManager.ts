// Web Audio API based sound synthesizer for Dice Meteor
// All sounds are generated programmatically - no external files needed

class SoundManagerClass {
  private ctx: AudioContext | null = null;
  private enabled: boolean = true;
  private volume: number = 0.3;

  private getContext(): AudioContext {
    if (!this.ctx) {
      this.ctx = new AudioContext();
    }
    // Resume if suspended (browser autoplay policy)
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
  }

  setVolume(volume: number): void {
    this.volume = Math.max(0, Math.min(1, volume));
  }

  // Low thump + noise burst for meteor impacts
  playImpact(intensity: number = 1): void {
    if (!this.enabled) return;
    const ctx = this.getContext();
    const now = ctx.currentTime;

    // Low frequency thump
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(80 * intensity, now);
    osc.frequency.exponentialRampToValueAtTime(30, now + 0.15);
    gain.gain.setValueAtTime(this.volume * 0.8, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
    osc.connect(gain).connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.2);

    // Noise burst
    const bufferSize = ctx.sampleRate * 0.1;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.3));
    }
    const noise = ctx.createBufferSource();
    const noiseGain = ctx.createGain();
    noise.buffer = buffer;
    noiseGain.gain.setValueAtTime(this.volume * 0.3, now);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
    noise.connect(noiseGain).connect(ctx.destination);
    noise.start(now);
  }

  // Pop/squelch sound for NPC squish
  playSquish(): void {
    if (!this.enabled) return;
    const ctx = this.getContext();
    const now = ctx.currentTime;

    // Quick pop
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(400, now);
    osc.frequency.exponentialRampToValueAtTime(100, now + 0.08);
    gain.gain.setValueAtTime(this.volume * 0.5, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
    osc.connect(gain).connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.1);

    // Squelch noise
    const bufferSize = ctx.sampleRate * 0.05;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.sin(i / bufferSize * Math.PI);
    }
    const noise = ctx.createBufferSource();
    const noiseGain = ctx.createGain();
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 2000;
    noise.buffer = buffer;
    noiseGain.gain.setValueAtTime(this.volume * 0.2, now);
    noise.connect(filter).connect(noiseGain).connect(ctx.destination);
    noise.start(now);
  }

  // Rising arpeggio for combo detection
  playCombo(comboType: string): void {
    if (!this.enabled) return;
    const ctx = this.getContext();
    const now = ctx.currentTime;

    // Different arpeggios for different combos
    let notes: number[];
    let duration = 0.1;

    switch (comboType) {
      case '456':
        notes = [523, 659, 784, 1047]; // C5, E5, G5, C6 - triumphant
        duration = 0.12;
        break;
      case 'trips':
        notes = [392, 494, 587]; // G4, B4, D5
        break;
      case 'pair':
        notes = [330, 415]; // E4, G#4
        break;
      case '123':
        notes = [262, 196, 147]; // C4, G3, D3 - descending sad
        duration = 0.15;
        break;
      default:
        notes = [440]; // A4
    }

    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.value = freq;
      const startTime = now + i * duration;
      gain.gain.setValueAtTime(0, startTime);
      gain.gain.linearRampToValueAtTime(this.volume * 0.4, startTime + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration + 0.1);
      osc.connect(gain).connect(ctx.destination);
      osc.start(startTime);
      osc.stop(startTime + duration + 0.15);
    });
  }

  // Deep boom + sweep for shockwave (4-5-6)
  playShockwave(): void {
    if (!this.enabled) return;
    const ctx = this.getContext();
    const now = ctx.currentTime;

    // Deep boom
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(60, now);
    osc.frequency.exponentialRampToValueAtTime(20, now + 0.4);
    gain.gain.setValueAtTime(this.volume * 1.0, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
    osc.connect(gain).connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.5);

    // Rising sweep
    const sweep = ctx.createOscillator();
    const sweepGain = ctx.createGain();
    sweep.type = 'sawtooth';
    sweep.frequency.setValueAtTime(100, now);
    sweep.frequency.exponentialRampToValueAtTime(800, now + 0.3);
    sweepGain.gain.setValueAtTime(this.volume * 0.3, now);
    sweepGain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
    sweep.connect(sweepGain).connect(ctx.destination);
    sweep.start(now);
    sweep.stop(now + 0.4);
  }

  // Descending whimper for fizzle (1-2-3)
  playFizzle(): void {
    if (!this.enabled) return;
    const ctx = this.getContext();
    const now = ctx.currentTime;

    // Sad descending tone
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(300, now);
    osc.frequency.exponentialRampToValueAtTime(80, now + 0.4);
    gain.gain.setValueAtTime(this.volume * 0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
    osc.connect(gain).connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.5);

    // Puff noise
    const bufferSize = ctx.sampleRate * 0.2;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.5)) * 0.3;
    }
    const noise = ctx.createBufferSource();
    const noiseGain = ctx.createGain();
    noise.buffer = buffer;
    noiseGain.gain.value = this.volume * 0.2;
    noise.connect(noiseGain).connect(ctx.destination);
    noise.start(now);
  }

  // Quick blip for UI clicks
  playClick(): void {
    if (!this.enabled) return;
    const ctx = this.getContext();
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.value = 800;
    gain.gain.setValueAtTime(this.volume * 0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
    osc.connect(gain).connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.05);
  }

  // Signature NDG transition wipe sound
  // Quick whoosh with low thump - matches skull wipe animation
  playTransition(): void {
    if (!this.enabled) return;
    const ctx = this.getContext();
    const now = ctx.currentTime;

    // Rising sweep (whoosh)
    const sweep = ctx.createOscillator();
    const sweepGain = ctx.createGain();
    const sweepFilter = ctx.createBiquadFilter();
    sweep.type = 'sawtooth';
    sweep.frequency.setValueAtTime(150, now);
    sweep.frequency.exponentialRampToValueAtTime(600, now + 0.15);
    sweep.frequency.exponentialRampToValueAtTime(100, now + 0.3);
    sweepFilter.type = 'lowpass';
    sweepFilter.frequency.setValueAtTime(800, now);
    sweepFilter.frequency.exponentialRampToValueAtTime(2000, now + 0.15);
    sweepFilter.frequency.exponentialRampToValueAtTime(400, now + 0.3);
    sweepGain.gain.setValueAtTime(0, now);
    sweepGain.gain.linearRampToValueAtTime(this.volume * 0.4, now + 0.05);
    sweepGain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
    sweep.connect(sweepFilter).connect(sweepGain).connect(ctx.destination);
    sweep.start(now);
    sweep.stop(now + 0.35);

    // Low thump at peak
    const thump = ctx.createOscillator();
    const thumpGain = ctx.createGain();
    thump.type = 'sine';
    thump.frequency.setValueAtTime(80, now + 0.1);
    thump.frequency.exponentialRampToValueAtTime(40, now + 0.25);
    thumpGain.gain.setValueAtTime(0, now);
    thumpGain.gain.linearRampToValueAtTime(this.volume * 0.6, now + 0.12);
    thumpGain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
    thump.connect(thumpGain).connect(ctx.destination);
    thump.start(now + 0.08);
    thump.stop(now + 0.35);

    // Noise burst for texture
    const bufferSize = ctx.sampleRate * 0.15;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      // Rising then falling envelope
      const t = i / bufferSize;
      const env = t < 0.3 ? t / 0.3 : (1 - t) / 0.7;
      data[i] = (Math.random() * 2 - 1) * env * 0.3;
    }
    const noise = ctx.createBufferSource();
    const noiseGain = ctx.createGain();
    const noiseFilter = ctx.createBiquadFilter();
    noiseFilter.type = 'bandpass';
    noiseFilter.frequency.value = 1000;
    noiseFilter.Q.value = 0.5;
    noise.buffer = buffer;
    noiseGain.gain.value = this.volume * 0.25;
    noise.connect(noiseFilter).connect(noiseGain).connect(ctx.destination);
    noise.start(now);
  }

  // Victory fanfare for win
  playVictory(): void {
    if (!this.enabled) return;
    const ctx = this.getContext();
    const now = ctx.currentTime;

    // Triumphant arpeggio
    const notes = [523, 659, 784, 1047, 1319]; // C5, E5, G5, C6, E6
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.value = freq;
      const startTime = now + i * 0.15;
      gain.gain.setValueAtTime(0, startTime);
      gain.gain.linearRampToValueAtTime(this.volume * 0.5, startTime + 0.05);
      gain.gain.setValueAtTime(this.volume * 0.5, startTime + 0.2);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.5);
      osc.connect(gain).connect(ctx.destination);
      osc.start(startTime);
      osc.stop(startTime + 0.6);
    });
  }

  // Sad trombone for lose
  playDefeat(): void {
    if (!this.enabled) return;
    const ctx = this.getContext();
    const now = ctx.currentTime;

    // Descending sad notes
    const notes = [293, 277, 262, 196]; // D4, C#4, C4, G3
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.value = freq;
      const startTime = now + i * 0.3;
      gain.gain.setValueAtTime(this.volume * 0.3, startTime);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.4);
      osc.connect(gain).connect(ctx.destination);
      osc.start(startTime);
      osc.stop(startTime + 0.5);
    });
  }

  // Gold/score earned jingle
  playGold(): void {
    if (!this.enabled) return;
    const ctx = this.getContext();
    const now = ctx.currentTime;

    // Quick coin sound
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(1200, now);
    osc.frequency.setValueAtTime(1600, now + 0.05);
    gain.gain.setValueAtTime(this.volume * 0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
    osc.connect(gain).connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.15);
  }
}

// Export singleton instance
export const SoundManager = new SoundManagerClass();
