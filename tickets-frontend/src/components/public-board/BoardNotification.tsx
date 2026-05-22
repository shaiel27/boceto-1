class BoardNotification {
  static audioCtx: AudioContext | null = null;

  static ensureCtx(): AudioContext {
    if (!this.audioCtx) {
      this.audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    return this.audioCtx;
  }

  static playSound(type: 'new_ticket'|'lunch'|'assistance'|'closed') {
    try {
      const ctx = this.ensureCtx();
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.connect(ctx.destination);

      const osc = ctx.createOscillator();
      osc.type = 'sine';
      osc.connect(gain);

      switch (type) {
        case 'new_ticket':
          osc.frequency.setValueAtTime(523.25, ctx.currentTime);
          osc.start();
          osc.frequency.setValueAtTime(659.25, ctx.currentTime + 0.15);
          osc.frequency.setValueAtTime(783.99, ctx.currentTime + 0.3);
          osc.stop(ctx.currentTime + 0.6);
          gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.6);
          break;
        case 'lunch':
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(440, ctx.currentTime);
          osc.start();
          osc.frequency.setValueAtTime(880, ctx.currentTime + 0.3);
          osc.stop(ctx.currentTime + 0.8);
          gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.8);
          break;
        case 'assistance':
          osc.start();
          for (let i = 0; i < 3; i++) {
            osc.frequency.setValueAtTime(800 - i * 150, ctx.currentTime + i * 0.3);
          }
          osc.stop(ctx.currentTime + 1.2);
          gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 1.2);
          break;
        case 'closed':
          osc.start();
          osc.frequency.setValueAtTime(392, ctx.currentTime);
          osc.frequency.setValueAtTime(330, ctx.currentTime + 0.2);
          osc.stop(ctx.currentTime + 0.5);
          gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
          break;
      }
    } catch (e) {
      console.warn('Sound play failed', e);
    }
  }
}

export default BoardNotification;
