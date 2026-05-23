/**
 * Institutional notification sounds for the public board.
 * Uses Web Audio API — no external files.
 *
 * Browser autoplay policy: AudioContext starts suspended.
 * It is unlocked on first user interaction (click on sound toggle).
 */
class BoardNotification {
  private static audioCtx: AudioContext | null = null;
  private static unlocked = false;

  /** Call once per user gesture to unlock the audio context */
  static unlock(): boolean {
    if (this.unlocked) return true;
    try {
      const ctx = this.ensureCtx();
      if (ctx.state === 'suspended') {
        ctx.resume().then(() => { this.unlocked = true; });
        return ctx.state === 'running';
      }
      this.unlocked = true;
      return true;
    } catch {
      return false;
    }
  }

  static isUnlocked(): boolean {
    return this.unlocked;
  }

  private static ensureCtx(): AudioContext {
    if (!this.audioCtx || this.audioCtx.state === 'closed') {
      this.audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
    return this.audioCtx;
  }

  private static chime(
    ctx: AudioContext, freq: number, start: number,
    duration: number, vol: number = 0.28, type: OscillatorType = 'sine',
  ): void {
    const o = ctx.createOscillator();
    o.type = type;
    o.frequency.setValueAtTime(freq, start);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0, start);
    g.gain.linearRampToValueAtTime(vol, start + 0.03);
    g.gain.setValueAtTime(vol, start + duration * 0.55);
    g.gain.exponentialRampToValueAtTime(0.001, start + duration);
    o.connect(g).connect(ctx.destination);
    o.start(start);
    o.stop(start + duration);
  }

  // ── Public sounds ──────────────────────────────────────────────────────

  static playSound(type: 'new_ticket' | 'lunch' | 'assistance' | 'closed'): void {
    try {
      const ctx = this.ensureCtx();
      if (ctx.state !== 'running') {
        ctx.resume();
        if (ctx.state !== 'running') return; // still locked by browser
      }
      const t = ctx.currentTime;

      switch (type) {
        case 'new_ticket': {
          // Clear rising two-tone — C5→E5→G5 (major triad, welcoming)
          this.chime(ctx, 523.25, t,        0.45, 0.24);
          this.chime(ctx, 659.25, t + 0.16, 0.50, 0.22);
          this.chime(ctx, 783.99, t + 0.32, 0.55, 0.20);
          // Bright harmonic
          this.chime(ctx, 1046.5, t + 0.14, 0.65, 0.10, 'sine');
          break;
        }
        case 'lunch': {
          // Warm announcement — F4→D4→C4
          this.chime(ctx, 349.23, t,        0.38, 0.18, 'triangle');
          this.chime(ctx, 293.66, t + 0.20, 0.40, 0.18, 'triangle');
          this.chime(ctx, 261.63, t + 0.40, 0.50, 0.16, 'triangle');
          break;
        }
        case 'assistance': {
          // Urgent alternating pulse — G5/E5 × 5
          for (let i = 0; i < 5; i++) {
            const f = i % 2 === 0 ? 783.99 : 659.25;
            this.chime(ctx, f, t + i * 0.24, 0.20, 0.22, 'sine');
          }
          this.chime(ctx, 196, t, 1.2, 0.08, 'sine');
          break;
        }
        case 'closed': {
          // Resolving — C5→G4
          this.chime(ctx, 523.25, t,        0.40, 0.20);
          this.chime(ctx, 392.00, t + 0.22, 0.50, 0.18);
          this.chime(ctx, 261.63, t + 0.18, 0.65, 0.08, 'sine');
          break;
        }
      }
    } catch (e) {
      console.warn('[BoardNotification] sound failed:', e);
    }
  }
}

export default BoardNotification;
