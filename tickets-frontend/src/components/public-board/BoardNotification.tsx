class BoardNotification {
  private static audioCtx: AudioContext | null = null;

  /**
   * Lazy-resume suspended AudioContext (browsers require user-gesture first).
   */
  private static ensureCtx(): AudioContext {
    if (!this.audioCtx) {
      this.audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
    return this.audioCtx;
  }

  // ── helpers ──────────────────────────────────────────────────────────

  private static gain(
    ctx: AudioContext,
    volume: number,
    start: number,
    duration: number,
  ): GainNode {
    const g = ctx.createGain();
    g.gain.setValueAtTime(volume, start);
    g.gain.exponentialRampToValueAtTime(0.001, start + duration);
    return g;
  }

  private static osc(
    ctx: AudioContext,
    type: OscillatorType,
    freq: number,
    start: number,
    duration: number,
  ): OscillatorNode {
    const o = ctx.createOscillator();
    o.type = type;
    o.frequency.setValueAtTime(freq, start);
    o.start(start);
    o.stop(start + duration);
    return o;
  }

  // ── public API ───────────────────────────────────────────────────────

  static playSound(type: 'new_ticket' | 'lunch' | 'assistance' | 'closed'): void {
    try {
      const ctx = this.ensureCtx();
      const t = ctx.currentTime;

      switch (type) {
        case 'new_ticket': {
          // Bright rising chime — C5 → E5 → G5
          const notes = [523.25, 659.25, 783.99];
          const master = this.gain(ctx, 0.28, t, 1.2);
          master.connect(ctx.destination);

          notes.forEach((f, i) => {
            const o = this.osc(ctx, 'sine', f, t + i * 0.18, 0.6);
            const g = ctx.createGain();
            g.gain.setValueAtTime(0.8, t + i * 0.18);
            g.gain.exponentialRampToValueAtTime(0.001, t + i * 0.18 + 0.5);
            o.connect(g).connect(master);
          });

          // Harmonic overtone
          const o2 = this.osc(ctx, 'triangle', 1046.5, t + 0.15, 0.8);
          const g2 = ctx.createGain();
          g2.gain.setValueAtTime(0.12, t + 0.15);
          g2.gain.exponentialRampToValueAtTime(0.001, t + 0.9);
          o2.connect(g2).connect(ctx.destination);
          break;
        }

        case 'lunch': {
          // Warm descending two-note — F5 → D5 with soft attack
          const notes = [698.46, 587.33];
          const master = this.gain(ctx, 0.22, t, 1.6);
          master.connect(ctx.destination);

          notes.forEach((f, i) => {
            const o = this.osc(ctx, 'triangle', f, t + i * 0.45, 0.9);
            const g = ctx.createGain();
            g.gain.setValueAtTime(0.6, t + i * 0.45);
            g.gain.exponentialRampToValueAtTime(0.001, t + i * 0.45 + 0.7);
            o.connect(g).connect(master);
          });
          break;
        }

        case 'assistance': {
          // Urgent alternating pulse — fast beeps with vibrato
          const master = this.gain(ctx, 0.32, t, 2.0);
          master.connect(ctx.destination);

          for (let i = 0; i < 5; i++) {
            const f = i % 2 === 0 ? 880 : 660;
            const o = this.osc(ctx, 'square', f, t + i * 0.22, 0.4);
            const g = ctx.createGain();
            g.gain.setValueAtTime(0.45, t + i * 0.22);
            g.gain.setValueAtTime(0.15, t + i * 0.22 + 0.08);
            g.gain.setValueAtTime(0.45, t + i * 0.22 + 0.12);
            g.gain.exponentialRampToValueAtTime(0.001, t + i * 0.22 + 0.35);
            o.connect(g).connect(master);
          }
          break;
        }

        case 'closed': {
          // Resolving descending tone — C5 → G4
          const master = this.gain(ctx, 0.24, t, 1.0);
          master.connect(ctx.destination);

          const o = this.osc(ctx, 'sine', 523.25, t, 0.7);
          o.frequency.linearRampToValueAtTime(392, t + 0.5);
          const g = ctx.createGain();
          g.gain.setValueAtTime(0.7, t);
          g.gain.linearRampToValueAtTime(0.3, t + 0.5);
          g.gain.exponentialRampToValueAtTime(0.001, t + 0.7);
          o.connect(g).connect(master);

          // Soft chord
          const o2 = this.osc(ctx, 'sine', 261.63, t + 0.15, 0.7);
          const g2 = ctx.createGain();
          g2.gain.setValueAtTime(0.08, t + 0.15);
          g2.gain.exponentialRampToValueAtTime(0.001, t + 0.8);
          o2.connect(g2).connect(ctx.destination);
          break;
        }
      }
    } catch (e) {
      console.warn('[BoardNotification] sound failed:', e);
    }
  }
}

export default BoardNotification;
