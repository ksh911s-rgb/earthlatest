/**
 * Web Audio API synthesizer for sound effects and procedural ambient/alarm audio
 */

class SoundEngine {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private sirenOscillator: OscillatorNode | null = null;
  private sirenGain: GainNode | null = null;
  private ambientOscillator: OscillatorNode | null = null;
  private ambientGain: GainNode | null = null;
  private currentStage: number = 1; // 1: green, 2: warning, 3: danger, 4: blackout

  private getContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    if (muted) {
      this.stopContinuousSounds();
    }
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  /**
   * Click / Tap sound (Coin / Pop)
   */
  public playTap(tierLevel: number = 1) {
    if (this.isMuted) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      // Pitch rises with upgrade tier
      const baseFreq = 400 + (tierLevel - 1) * 80;
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(baseFreq, now);
      osc.frequency.exponentialRampToValueAtTime(baseFreq * 1.8, now + 0.08);

      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.1);
    } catch {
      // ignore audio errors
    }
  }

  /**
   * Upgrade Fanfare
   */
  public playUpgrade() {
    if (this.isMuted) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
      const now = ctx.currentTime;

      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const startTime = now + idx * 0.06;

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, startTime);

        gain.gain.setValueAtTime(0.25, startTime);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.18);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(startTime);
        osc.stop(startTime + 0.2);
      });
    } catch {
      // ignore
    }
  }

  /**
   * Plays stage transitions and background ambiance
   */
  public updateStageAudio(stage: number) {
    if (this.isMuted) return;
    if (this.currentStage === stage) return;
    this.currentStage = stage;

    const ctx = this.getContext();
    if (!ctx) return;

    this.stopContinuousSounds();

    if (stage === 1) {
      // Stage 1: Calm harmonic chord
      try {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(220, ctx.currentTime);
        gain.gain.setValueAtTime(0.03, ctx.currentTime);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        this.ambientOscillator = osc;
        this.ambientGain = gain;
      } catch {}
    } else if (stage === 2) {
      // Stage 2: Low mechanical pulsating tension
      try {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(90, ctx.currentTime);
        gain.gain.setValueAtTime(0.04, ctx.currentTime);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        this.ambientOscillator = osc;
        this.ambientGain = gain;
      } catch {}
    } else if (stage === 3) {
      // Stage 3: High alarm siren
      try {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sawtooth';
        const now = ctx.currentTime;
        osc.frequency.setValueAtTime(600, now);
        // Siren warble
        for (let t = 0; t < 30; t++) {
          osc.frequency.linearRampToValueAtTime(880, now + t * 0.8 + 0.4);
          osc.frequency.linearRampToValueAtTime(550, now + t * 0.8 + 0.8);
        }
        gain.gain.setValueAtTime(0.08, now);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        this.sirenOscillator = osc;
        this.sirenGain = gain;
      } catch {}
    }
  }

  /**
   * Dramatic Game Over: Explosion sound followed by continuous 1000Hz test tone "삐---"
   */
  public playBlackout() {
    this.stopContinuousSounds();
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;

      // 1. Noise burst (Explosion / power shut down)
      const bufferSize = ctx.sampleRate * 0.5;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ctx.sampleRate * 0.15));
      }
      const noise = ctx.createBufferSource();
      noise.buffer = buffer;
      const noiseGain = ctx.createGain();
      noiseGain.gain.setValueAtTime(0.4, now);
      noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
      noise.connect(noiseGain);
      noiseGain.connect(ctx.destination);
      noise.start(now);

      // 2. High-pitch eerie CRT/broadcast test tone: 1000Hz Sine wave ("삐---")
      const toneOsc = ctx.createOscillator();
      const toneGain = ctx.createGain();
      toneOsc.type = 'sine';
      toneOsc.frequency.setValueAtTime(1000, now + 0.5); // Starts right after explosion
      toneGain.gain.setValueAtTime(0.001, now);
      toneGain.gain.setValueAtTime(0.18, now + 0.5);
      // Fades out gently after 4 seconds
      toneGain.gain.setValueAtTime(0.18, now + 3.8);
      toneGain.gain.exponentialRampToValueAtTime(0.001, now + 5.5);

      toneOsc.connect(toneGain);
      toneGain.connect(ctx.destination);
      toneOsc.start(now + 0.5);
      toneOsc.stop(now + 5.6);
    } catch {
      // ignore
    }
  }

  public stopContinuousSounds() {
    try {
      if (this.sirenOscillator) {
        this.sirenOscillator.stop();
        this.sirenOscillator.disconnect();
        this.sirenOscillator = null;
      }
      if (this.ambientOscillator) {
        this.ambientOscillator.stop();
        this.ambientOscillator.disconnect();
        this.ambientOscillator = null;
      }
    } catch {
      // ignore
    }
  }
}

export const soundEngine = new SoundEngine();
