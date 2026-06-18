/**
 * Institutional notification chimes for the public service board.
 * Web Audio API synthesis — zero external files.
 * Designed for government/public service environments:
 * clear, audible across a room, professional, with appropriate urgency levels.
 *
 * Sound levels calibrated for ~60-70dB @ 1m in typical office.
 */

class BoardNotification {
  private static ctx: AudioContext | null = null;

  static unlock(): void {
    try {
      if (!this.ctx || this.ctx.state === 'closed') {
        this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      if (this.ctx.state === 'suspended') {
        this.ctx.resume();
      }
    } catch { /* silent */ }
  }

  private static getCtx(): AudioContext {
    if (!this.ctx || this.ctx.state === 'closed') {
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  /** Single pure note with ADSR-like envelope */
  private static note(
    ctx: AudioContext,
    freq: number,
    start: number,
    duration: number,
    vol: number = 0.18,
    type: OscillatorType = 'sine',
  ): void {
    const o = ctx.createOscillator();
    o.type = type;
    o.frequency.setValueAtTime(freq, start);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0, start);
    g.gain.linearRampToValueAtTime(vol, start + 0.015);
    g.gain.setValueAtTime(vol * 0.75, start + duration * 0.4);
    g.gain.exponentialRampToValueAtTime(0.001, start + duration);
    o.connect(g).connect(ctx.destination);
    o.start(start);
    o.stop(start + duration);
  }

  /** Chord: multiple notes starting at same time */
  private static chord(
    ctx: AudioContext,
    freqs: number[],
    start: number,
    duration: number,
    vol: number = 0.12,
    type: OscillatorType = 'sine',
  ): void {
    for (const f of freqs) {
      this.note(ctx, f, start, duration, vol, type);
    }
  }

  // ===================================================================
  //  INSTITUTIONAL SOUND PALETTE
  //  Frequencies from C4 (261.63) to C7 (2093.0) range
  // ===================================================================

  private static readonly C4 = 261.63;
  private static readonly D4 = 293.66;
  private static readonly E4 = 329.63;
  private static readonly F4 = 349.23;
  private static readonly G4 = 392.0;
  private static readonly A4 = 440.0;
  private static readonly B4 = 493.88;
  private static readonly C5 = 523.25;
  private static readonly D5 = 587.33;
  private static readonly E5 = 659.25;
  private static readonly F5 = 698.46;
  private static readonly G5 = 783.99;
  private static readonly A5 = 880.0;
  private static readonly C6 = 1046.5;
  private static readonly D6 = 1174.66;
  private static readonly E6 = 1318.51;
  private static readonly Gb5 = 739.99;

  static playSound(type: 'new_ticket' | 'lunch_started' | 'lunch_ended' | 'lunch' | 'assistance' | 'closed' | 'returned'): void {
    try {
      const ctx = this.getCtx();
      const t = ctx.currentTime;

      switch (type) {

        // ═══ NEW TICKET — C-E-G ascending triad, positive announcement chime ═══
        case 'new_ticket': {
          this.note(ctx, this.C5, t, 0.30, 0.16);
          this.note(ctx, this.E5, t + 0.12, 0.30, 0.14);
          this.chord(ctx, [this.G5, this.C6], t + 0.24, 0.45, 0.10);
          // Subtle reverb tail
          this.note(ctx, this.C6, t + 0.28, 0.50, 0.06);
          break;
        }

        // ═══ LUNCH STARTED — gentle two-tone descent, warm triangle wave ═══
        case 'lunch_started':
        case 'lunch': {
          this.note(ctx, this.A4, t, 0.55, 0.10, 'triangle');
          this.note(ctx, this.E4, t + 0.30, 0.55, 0.09, 'triangle');
          break;
        }

        // ═══ LUNCH ENDED — ascending two-tone, welcoming return ═══
        case 'lunch_ended': {
          this.note(ctx, this.A4, t + 0.22, 0.45, 0.10, 'triangle');
          this.note(ctx, this.C5, t, 0.50, 0.11, 'triangle');
          break;
        }

        // ═══ ASSISTANCE — tense minor second + C diminished pattern (urgent alarm) ═══
        case 'assistance': {
          for (let i = 0; i < 3; i++) {
            const off = i * 0.28;
            this.note(ctx, this.E5, t + off, 0.20, 0.16);
            this.note(ctx, this.G5, t + off + 0.12, 0.20, 0.13);
          }
          break;
        }

        // ═══ TICKET CLOSED — G-E-C descending major (satisfying resolution fanfare) ═══
        case 'closed': {
          this.note(ctx, this.G5, t, 0.20, 0.15);
          this.note(ctx, this.E5, t + 0.10, 0.25, 0.13);
          this.note(ctx, this.C5, t + 0.20, 0.45, 0.10);
          break;
        }

        // ═══ RETURNED (INCONFORMITY) — alarm tritone + octave tremolo (high urgency) ═══
        case 'returned': {
          // Phase 1: dissonant alarm
          for (let i = 0; i < 2; i++) {
            const off = i * 0.38;
            this.note(ctx, this.F5, t + off, 0.25, 0.18, 'square');
            this.note(ctx, this.Gb5, t + off, 0.25, 0.15, 'square');
            this.note(ctx, this.F5, t + off + 0.14, 0.20, 0.14, 'square');
            this.note(ctx, this.Gb5, t + off + 0.14, 0.20, 0.12, 'square');
          }
          // Phase 2: resolution fanfare (still attention-grabbing)
          this.chord(ctx, [this.C5, this.E5, this.G5], t + 0.85, 0.50, 0.10);
          this.note(ctx, this.C6, t + 0.90, 0.60, 0.08);
          break;
        }
      }
    } catch { /* non-critical */ }
  }
}

export default BoardNotification;
