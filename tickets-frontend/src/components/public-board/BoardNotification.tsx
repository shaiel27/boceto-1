/**
 * Institutional notification chimes for the public service board.
 * Web Audio API synthesis — zero external files.
 * Always-on: auto-unlocks, auto-recovers from suspended/closed state.
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

  static playSound(type: 'new_ticket' | 'lunch' | 'assistance' | 'closed' | 'returned'): void {
    try {
      const ctx = this.getCtx();
      const t = ctx.currentTime;
      switch (type) {
        case 'returned':
          for (let i = 0; i < 3; i++) {
            const offset = i * 0.32;
            this.note(ctx, 587.33, t + offset, 0.34, 0.24, 'square');
            this.note(ctx, 554.37, t + offset + 0.10, 0.34, 0.20, 'square');
          }
          break;
        case 'new_ticket':
          this.note(ctx, 659.25, t,        0.40, 0.20);
          this.note(ctx, 1046.5, t + 0.15, 0.55, 0.12);
          break;
        case 'lunch':
          this.note(ctx, 440,   t,        0.35, 0.14, 'triangle');
          this.note(ctx, 349.23, t + 0.22, 0.40, 0.12, 'triangle');
          break;
        case 'assistance':
          this.note(ctx, 523.25, t,        0.18, 0.18);
          this.note(ctx, 523.25, t + 0.28, 0.18, 0.18);
          break;
        case 'closed':
          this.note(ctx, 392, t, 0.45, 0.16);
          break;
      }
    } catch { /* non-critical */ }
  }
}

export default BoardNotification;
