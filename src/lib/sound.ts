// Gestionnaire de sons hybride : Joue les vrais MP3 du dossier /public/sounds/ avec support de boucle d'ambiance nocturne

class LoupGarouSoundEngine {
  public isMuted: boolean = false;
  private ctx: AudioContext | null = null;
  private nightAudio: HTMLAudioElement | null = null;

  private getContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  private playSoundFile(filename: string, fallbackFn: () => void, volume: number = 0.9) {
    if (this.isMuted) return;
    try {
      const audio = new Audio(`/sounds/${filename}`);
      audio.volume = volume;
      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise.catch(() => {
          fallbackFn();
        });
      }
    } catch {
      fallbackFn();
    }
  }

  // 🌙 AMBIANCE DE NUIT EN BOUCLE CONTINUE
  startNightLoop() {
    if (this.isMuted || typeof window === 'undefined') return;
    try {
      if (!this.nightAudio) {
        this.nightAudio = new Audio('/sounds/night.mp3');
        this.nightAudio.loop = true;
      }
      this.nightAudio.volume = 0.45;
      this.nightAudio.currentTime = 0;
      this.nightAudio.play().catch(() => {});
    } catch (e) {
      console.warn('Night audio error', e);
    }
  }

  stopNightLoop() {
    if (this.nightAudio) {
      try {
        this.nightAudio.pause();
        this.nightAudio.currentTime = 0;
      } catch (e) {}
    }
  }

  // 1. HURLEMENT DE LOUP
  playWolfHowl() {
    this.playSoundFile('wolf.mp3', () => {
      const ctx = this.getContext();
      if (!ctx) return;
      const now = ctx.currentTime;
      const dur = 4.0;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const filter = ctx.createBiquadFilter();

      osc.type = 'sawtooth';
      filter.type = 'bandpass';
      filter.Q.setValueAtTime(3.5, now);

      osc.frequency.setValueAtTime(180, now);
      osc.frequency.exponentialRampToValueAtTime(480, now + 1.0);
      osc.frequency.linearRampToValueAtTime(420, now + 2.5);
      osc.frequency.exponentialRampToValueAtTime(140, now + dur);

      filter.frequency.setValueAtTime(350, now);
      filter.frequency.exponentialRampToValueAtTime(950, now + 1.0);
      filter.frequency.exponentialRampToValueAtTime(250, now + dur);

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.exponentialRampToValueAtTime(0.35, now + 0.8);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + dur);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + dur);
    });
  }

  // 2. CLOCHE DU VILLAGE
  playBell() {
    this.playSoundFile('bell.mp3', () => {
      const ctx = this.getContext();
      if (!ctx) return;
      const now = ctx.currentTime;
      const freqs = [435, 875, 1040, 1310];
      freqs.forEach((f, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(f, now);
        gain.gain.setValueAtTime(0.3 / (idx + 1), now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 3.0);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 3.1);
      });
    });
  }

  // 3. TIR DU CHASSEUR
  playGunshot() {
    this.playSoundFile('gunshot.mp3', () => {
      const ctx = this.getContext();
      if (!ctx) return;
      const now = ctx.currentTime;
      const bufLen = ctx.sampleRate * 0.5;
      const buf = ctx.createBuffer(1, bufLen, ctx.sampleRate);
      const data = buf.getChannelData(0);
      for (let i = 0; i < bufLen; i++) data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ctx.sampleRate * 0.05));
      const noise = ctx.createBufferSource();
      noise.buffer = buf;
      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.8, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
      noise.connect(gain);
      gain.connect(ctx.destination);
      noise.start(now);
    });
  }

  // 4. MORT / GLAS FUNÈBRE
  playDeath() {
    this.playSoundFile('death.mp3', () => {
      const ctx = this.getContext();
      if (!ctx) return;
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(85, now);
      gain.gain.setValueAtTime(0.4, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 3.0);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 3.1);
    });
  }

  // 5. CARILLON MAGIQUE (VOYANTE / CUPIDON)
  playMagicChime() {
    this.playSoundFile('magic.mp3', () => {
      const ctx = this.getContext();
      if (!ctx) return;
      const now = ctx.currentTime;
      [587, 740, 880, 1175].forEach((freq, idx) => {
        const t = now + idx * 0.08;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, t);
        gain.gain.setValueAtTime(0.15, t);
        gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.8);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(t);
        osc.stop(t + 0.85);
      });
    });
  }

  // 6. POTION DE LA SORCIÈRE
  playPotion() {
    this.playSoundFile('potion.mp3', () => {
      const ctx = this.getContext();
      if (!ctx) return;
      const now = ctx.currentTime;
      [0, 0.15, 0.3].forEach((offset, idx) => {
        const t = now + offset;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(350 + idx * 100, t);
        osc.frequency.exponentialRampToValueAtTime(900 + idx * 150, t + 0.12);
        gain.gain.setValueAtTime(0.2, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.14);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(t);
        osc.stop(t + 0.15);
      });
    });
  }

  // 7. BRUME NOCTURNE
  playNightAmbience() {
    this.playSoundFile('night.mp3', () => {});
  }

  playClick() {
    if (this.isMuted) return;
    const ctx = this.getContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.frequency.setValueAtTime(800, now);
    gain.gain.setValueAtTime(0.03, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.045);
  }
}

export const sounds = new LoupGarouSoundEngine();
