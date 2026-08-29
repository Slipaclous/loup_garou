// Moteur Audio Hybride Professionnel pour Loup-Garou
// Utilise les fichiers audio de haute qualité placés dans /public/sounds/
// et bascule automatiquement sur le synthétiseur Web Audio en secours.

class LoupGarouSoundEngine {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private nightAudio: HTMLAudioElement | null = null;

  constructor() {
    // Initialisation passive
  }

  private getContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  setMuted(muted: boolean) {
    this.isMuted = muted;
    if (muted && this.nightAudio) {
      this.nightAudio.pause();
    }
  }

  // Joue un fichier audio de /public/sounds/ avec fallback synthétique
  private playSoundFile(filename: string, fallbackSynth: () => void, volume: number = 0.8) {
    if (this.isMuted || typeof window === 'undefined') return;

    const audio = new Audio(`/sounds/${filename}`);
    audio.volume = volume;
    audio.play().catch(() => {
      // Si le fichier audio n'est pas encore chargé ou bloqué, on utilise le synthétiseur Web Audio
      fallbackSynth();
    });
  }

  // Boucle de nuit atmosphérique
  startNightLoop() {
    if (this.isMuted || typeof window === 'undefined') return;
    if (!this.nightAudio) {
      this.nightAudio = new Audio('/sounds/night.mp3');
      this.nightAudio.loop = true;
      this.nightAudio.volume = 0.35;
    }
    this.nightAudio.play().catch(() => {
      // Autoplay bloqué ou fichier absent
    });
  }

  stopNightLoop() {
    if (this.nightAudio) {
      this.nightAudio.pause();
      this.nightAudio.currentTime = 0;
    }
  }

  // ==========================================
  // BRUITAGES THÉMATIQUES DU JEU
  // ==========================================

  // 1. HURLEMENT DU LOUP-GAROU
  playWolfHowl() {
    this.playSoundFile('wolf.mp3', () => {
      const ctx = this.getContext();
      if (!ctx) return;
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(140, now);
      osc.frequency.linearRampToValueAtTime(320, now + 0.9);
      osc.frequency.exponentialRampToValueAtTime(120, now + 2.5);

      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(450, now);
      filter.frequency.linearRampToValueAtTime(1100, now + 0.9);
      filter.frequency.exponentialRampToValueAtTime(300, now + 2.5);

      gain.gain.setValueAtTime(0.01, now);
      gain.gain.linearRampToValueAtTime(0.4, now + 0.6);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 2.6);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 2.7);
    });
  }

  // 2. MORSURE / DÉCHIQUETAGE DU LOUP-GAROU
  playBite() {
    this.playSoundFile('bite.mp3', () => {
      this.playDeath();
    });
  }

  // 3. FLÈCHE DE CUPIDON
  playArrow() {
    this.playSoundFile('arrow.mp3', () => {
      this.playMagicChime();
    });
  }

  // 4. MURMURE DE LA VOYANTE (VISION ASTRALE)
  playWhisper() {
    this.playSoundFile('whisper.mp3', () => {
      this.playMagicChime();
    });
  }

  // 5. BÛCHER / CRÉPITEMENT DE FEU (CONDAMNATION DU JOUR)
  playFire() {
    this.playSoundFile('fire.mp3', () => {
      this.playDeath();
    });
  }

  // 6. RETOURNEMENT DE CARTE 3D
  playCardFlip() {
    this.playSoundFile('card-flipping.mp3', () => {
      this.playClick();
    }, 0.6);
  }

  // 7. CLOCHE DU VILLAGE
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

  // 8. TIR DU CHASSEUR
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

  // 9. MORT / GLAS FUNÈBRE
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

  // 10. CARILLON MAGIQUE
  playMagicChime() {
    this.playSoundFile('magic.mp3', () => {
      const ctx = this.getContext();
      if (!ctx) return;
      const now = ctx.currentTime;
      const notes = [587.33, 739.99, 880, 1174.66];
      notes.forEach((freq, idx) => {
        const t = now + idx * 0.12;
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

  // 11. POTION DE LA SORCIÈRE
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

  // 12. BOUCLIER DU SALVATEUR
  playShield() {
    this.playSoundFile('shield.mp3', () => {
      const ctx = this.getContext();
      if (!ctx) return;
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(220, now);
      osc.frequency.exponentialRampToValueAtTime(110, now + 0.3);
      gain.gain.setValueAtTime(0.35, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.36);
    });
  }

  // 13. BATTEMENT DE COEUR (CHRONO / ANGOISSE)
  playHeartbeat() {
    if (this.isMuted) return;
    const ctx = this.getContext();
    if (!ctx) return;
    const now = ctx.currentTime;

    // Double battement (Lub-Dub)
    [0, 0.15].forEach((offset, idx) => {
      const t = now + offset;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(idx === 0 ? 65 : 55, t);
      osc.frequency.exponentialRampToValueAtTime(35, t + 0.12);
      gain.gain.setValueAtTime(0.35, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.14);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(t);
      osc.stop(t + 0.15);
    });
  }

  // 14. GONG DU TRIBUNAL
  playGong() {
    if (this.isMuted) return;
    const ctx = this.getContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const freqs = [180, 240, 320];
    freqs.forEach((f, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(f, now);
      gain.gain.setValueAtTime(0.4 / (idx + 1), now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 4.0);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 4.1);
    });
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
