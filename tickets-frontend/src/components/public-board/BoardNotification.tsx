/**
 * Institutional notification chimes for the public service board.
 * All sounds are calm, short, and dignified — suitable for a government office.
 * Uses Web Audio API synthesis — zero external files.
 *
 * Browser policy: AudioContext starts suspended.
 * Call unlock() on first user click to enable audio.
 */
class BoardNotification {
  private static ctx: AudioContext | null = null;
  private static unlocked = false;

  static unlock(): boolean {
    if (this.unlocked) return true;
    try {
      if (!this.ctx) {
        this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      if (this.ctx.state === 'suspended') {
        this.ctx.resume();
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

  private static ctxRunning(): AudioContext | null {
    if (!this.ctx || this.ctx.state === 'closed') {
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
      return null; // async — will work next time
    }
    return this.ctx.state === 'running' ? this.ctx : null;
  }

  /** Play a single soft chime note */
  private static note(
    ctx: AudioContext,
    freq: number,
    start: number,
    duration: number,
    vol: number = 0.22,
    type: OscillatorType = 'sine',
  ): void {
    const o = ctx.createOscillator();
    o.type = type;
    o.frequency.setValueAtTime(freq, start);

    const g = ctx.createGain();
    g.gain.setValueAtTime(0, start);
    g.gain.linearRampToValueAtTime(vol, start + 0.02);
    g.gain.setValueAtTime(vol * 0.7, start + duration * 0.3);
    g.gain.exponentialRampToValueAtTime(0.001, start + duration);

    o.connect(g).connect(ctx.destination);
    o.start(start);
    o.stop(start + duration);
  }

  // ── Public API ────────────────────────────────────────────────────────

  static playSound(type: 'new_ticket' | 'lunch' | 'assistance' | 'closed'): void {
    try {
      const ctx = this.ctxRunning();
      if (!ctx) return;
      const t = ctx.currentTime;

      switch (type) {
        case 'new_ticket': {
          // Soft two-note chime — E5 → C6 (pleasant, not urgent)
          this.note(ctx, 659.25, t,        0.40, 0.20);
          this.note(ctx, 1046.5, t + 0.15, 0.55, 0.12);
          break;
        }
        case 'lunch': {
          // Gentle descending — A4 → F4 (announcement, not alarm)
          this.note(ctx, 440,   t,        0.35, 0.14, 'triangle');
          this.note(ctx, 349.23, t + 0.22, 0.40, 0.12, 'triangle');
          break;
        }
        case 'assistance': {
          // Polite double-tap — C5 → C5 (attention, not panic)
          this.note(ctx, 523.25, t,        0.18, 0.18);
          this.note(ctx, 523.25, t + 0.28, 0.18, 0.18);
          break;
        }
        case 'closed': {
          // Single resolving tone — G4 (completion, gentle)
          this.note(ctx, 392, t, 0.45, 0.16);
          break;
        }
      }
    } catch (e) {
      // silent — audio is non-critical
    }
  }
}

export default BoardNotification;
