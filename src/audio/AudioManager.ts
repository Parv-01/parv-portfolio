type AudioState = {
  ctx: AudioContext | null;
  ambientBuf: AudioBuffer | null;
  ambientSource: AudioBufferSourceNode | null;
  ambientGain: GainNode | null;
  clickBuf: AudioBuffer | null;
  masterGain: GainNode | null;
  muted: boolean;
  loaded: boolean;
  initPromise: Promise<void> | null;
};

const AMBIENT_URL = '/audio/ambient.mp3';
const CLICK_URL = '/audio/click.mp3';
const MUTED_KEY = 'nebula.audio.muted';

class AudioManagerImpl {
  private state: AudioState = {
    ctx: null,
    ambientBuf: null,
    ambientSource: null,
    ambientGain: null,
    clickBuf: null,
    masterGain: null,
    muted: false,
    loaded: false,
    initPromise: null,
  };

  constructor() {
    if (typeof window === 'undefined') return;
    try {
      this.state.muted = window.localStorage.getItem(MUTED_KEY) === '1';
    } catch {
      /* noop */
    }
  }

  private ensureContext(): Promise<void> {
    if (this.state.initPromise) return this.state.initPromise;
    this.state.initPromise = (async () => {
      try {
        const Ctx =
          (window.AudioContext as typeof AudioContext) ||
          ((window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext);
        if (!Ctx) return;
        const ctx = new Ctx();
        this.state.ctx = ctx;

        const master = ctx.createGain();
        master.gain.value = this.state.muted ? 0 : 1;
        master.connect(ctx.destination);
        this.state.masterGain = master;

        const ambGain = ctx.createGain();
        ambGain.gain.value = this.state.muted ? 0 : 0.16;
        ambGain.connect(master);
        this.state.ambientGain = ambGain;

        await Promise.all([this.loadAmbient(), this.loadClick()]);

        if (!this.state.muted && this.state.ambientBuf) this.startAmbient();
        this.state.loaded = true;
      } catch {
        /* noop */
      }
    })();
    return this.state.initPromise;
  }

  private async resumeContext() {
    const ctx = this.state.ctx;
    if (!ctx || ctx.state === 'running') return;
    try {
      await ctx.resume();
    } catch {
      /* noop */
    }
  }

  private async loadAmbient() {
    if (!this.state.ctx) return;
    try {
      const res = await fetch(AMBIENT_URL);
      if (!res.ok) return;
      const arr = await res.arrayBuffer();
      this.state.ambientBuf = await this.state.ctx.decodeAudioData(arr);
    } catch {
      /* noop */
    }
  }

  private async loadClick() {
    if (!this.state.ctx) return;
    try {
      const res = await fetch(CLICK_URL);
      if (!res.ok) return;
      const arr = await res.arrayBuffer();
      this.state.clickBuf = await this.state.ctx.decodeAudioData(arr);
    } catch {
      /* noop */
    }
  }

  private startAmbient() {
    const { ctx, ambientBuf, ambientGain } = this.state;
    if (!ctx || !ambientBuf || !ambientGain) return;
    if (this.state.ambientSource) {
      try {
        this.state.ambientSource.stop();
      } catch {
        /* noop */
      }
    }
    const src = ctx.createBufferSource();
    src.buffer = ambientBuf;
    src.loop = true;
    src.connect(ambientGain);
    src.start();
    this.state.ambientSource = src;
  }

  setAmbientGain(value: number) {
    const g = this.state.ambientGain;
    if (!g || !this.state.ctx) return;
    const target = this.state.muted ? 0 : Math.max(0, Math.min(1, value));
    g.gain.setTargetAtTime(target, this.state.ctx.currentTime, 0.4);
  }

  playClick() {
    if (this.state.muted) return;
    if (!this.state.ctx) {
      void this.ensureContext().then(() => this.resumeContext());
      this.synthClick();
      return;
    }
    void this.resumeContext();
    const { ctx, clickBuf, masterGain } = this.state;
    if (!ctx) return;
    if (!clickBuf) {
      this.synthClick();
      return;
    }
    const src = ctx.createBufferSource();
    const g = ctx.createGain();
    g.gain.value = 0.55;
    src.buffer = clickBuf;
    src.connect(g);
    g.connect(masterGain ?? ctx.destination);
    try {
      src.start();
    } catch {
      /* noop */
    }
  }

  private synthClick() {
    const ctx = this.state.ctx;
    if (!ctx) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(1800, now);
    osc.frequency.exponentialRampToValueAtTime(720, now + 0.06);
    g.gain.setValueAtTime(0.0001, now);
    g.gain.exponentialRampToValueAtTime(0.28, now + 0.005);
    g.gain.exponentialRampToValueAtTime(0.0001, now + 0.09);
    osc.connect(g);
    g.connect(this.state.masterGain ?? ctx.destination);
    osc.start(now);
    osc.stop(now + 0.1);
  }

  async unlock() {
    await this.ensureContext();
    await this.resumeContext();
  }

  toggleMute() {
    this.state.muted = !this.state.muted;
    try {
      window.localStorage.setItem(MUTED_KEY, this.state.muted ? '1' : '0');
    } catch {
      /* noop */
    }
    if (this.state.masterGain && this.state.ctx) {
      this.state.masterGain.gain.setTargetAtTime(
        this.state.muted ? 0 : 1,
        this.state.ctx.currentTime,
        0.15
      );
    }
    if (!this.state.muted && this.state.ambientBuf && !this.state.ambientSource) {
      this.startAmbient();
    }
  }

  isMuted() {
    return this.state.muted;
  }
}

export const audioManager = new AudioManagerImpl();
