/**
 * Institutional notification sounds for public display board.
 * Uses Web Audio API to synthesize dignified chimes — no external files.
 *
 * Sound philosophy:
 *   - new_ticket  → gentle rising two-tone chime (reception bell)
 *   - lunch       → warm descending melody (announcement tone)
 *   - assistance  → urgent but formal triple-pulse (attention signal)
 *   - closed      → soft resolving tone (completion chime)
 */
class BoardNotification {
  private static audioCtx: AudioContext | null = null;

  private static ensureCtx(): AudioContext {
    if (!this.audioCtx) {
      this.audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
    return this.audioCtx;
  }

  /** Play a single chime note with gentle envelope */
  private static chime(
    ctx: AudioContext,
    freq: number,
    start: number,
    duration: number,
    vol: number = 0.25,
    type: OscillatorType = 'sine',
  ): void {
    const o = ctx.createOscillator();
    o.type = type;
    o.frequency.setValueAtTime(freq, start);

    const g = ctx.createGain();
    g.gain.setValueAtTime(0, start);
    g.gain.linearRampToValueAtTime(vol, start + 0.04);
    g.gain.setValueAtTime(vol, start + duration * 0.6);
    g.gain.exponentialRampToValueAtTime(0.001, start + duration);

    o.connect(g).connect(ctx.destination);
    o.start(start);
    o.stop(start + duration);
  }

  // ── Public sounds ──────────────────────────────────────────────────────

  static playSound(type: 'new_ticket' | 'lunch' | 'assistance' | 'closed'): void {
    try {
      const ctx = this.ensureCtx();
      const t = ctx.currentTime;

      switch (type) {
        case 'new_ticket': {
          // Dignified two-tone chime — C5 → E5 (major third, welcoming)
          this.chime(ctx, 523.25, t,       0.55, 0.22);
          this.chime(ctx, 659.25, t + 0.18, 0.65, 0.20);

          // Soft harmonic overtone
          this.chime(ctx, 1046.5, t + 0.15, 0.7, 0.08, 'sine');
          break;
        }

        case 'lunch': {
          // Warm announcement — F4 → D4 → C4 (descending, calming)
          this.chime(ctx, 349.23, t,        0.4, 0.16, 'triangle');
          this.chime(ctx, 293.66, t + 0.22, 0.4, 0.16, 'triangle');
          this.chime(ctx, 261.63, t + 0.44, 0.5, 0.14, 'triangle');
          break;
        }

        case 'assistance': {
          // Formal attention signal — alternating G5/E5 pulses (not alarming, but noticeable)
          for (let i = 0; i < 4; i++) {
            const f = i % 2 === 0 ? 783.99 : 659.25;
            this.chime(ctx, f, t + i * 0.28, 0.22, 0.2, 'sine');
          }

          // Gentle undertone for gravitas
          this.chime(ctx, 196, t, 1.1, 0.07, 'sine');
          break;
        }

        case 'closed': {
          // Completion chime — C5 → G4 (resolving fifth)
          this.chime(ctx, 523.25, t,        0.45, 0.18);
          this.chime(ctx, 392.00, t + 0.25, 0.55, 0.16);

          // Soft chord closure
          this.chime(ctx, 261.63, t + 0.20, 0.7, 0.08, 'sine');
          break;
        }
      }
    } catch (e) {
      console.warn('[BoardNotification] sound failed:', e);
    }
  }
}

export default BoardNotification;
