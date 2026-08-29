const fs = require('fs');
const path = require('path');

// Helper to create WAV buffer
function createWavBuffer(sampleRate, samples) {
  const numChannels = 1;
  const bitsPerSample = 16;
  const byteRate = (sampleRate * numChannels * bitsPerSample) / 8;
  const blockAlign = (numChannels * bitsPerSample) / 8;
  const dataSize = samples.length * 2;
  const buffer = Buffer.alloc(44 + dataSize);

  // RIFF identifier
  buffer.write('RIFF', 0);
  buffer.writeUInt32LE(36 + dataSize, 4);
  buffer.write('WAVE', 8);
  buffer.write('fmt ', 12);
  buffer.writeUInt32LE(16, 16); // Subchunk1Size (16 for PCM)
  buffer.writeUInt16LE(1, 20); // AudioFormat (1 for PCM)
  buffer.writeUInt16LE(numChannels, 22);
  buffer.writeUInt32LE(sampleRate, 24);
  buffer.writeUInt32LE(byteRate, 28);
  buffer.writeUInt16LE(blockAlign, 32);
  buffer.writeUInt16LE(bitsPerSample, 34);
  buffer.write('data', 36);
  buffer.writeUInt32LE(dataSize, 40);

  for (let i = 0; i < samples.length; i++) {
    let s = Math.max(-1, Math.min(1, samples[i]));
    buffer.writeInt16LE(Math.floor(s < 0 ? s * 0x8000 : s * 0x7fff), 44 + i * 2);
  }
  return buffer;
}

const sampleRate = 44100;
const soundsDir = path.join(__dirname, 'public', 'sounds');

// 1. WOLF HOWL (Hurlement de loup réaliste, organique et menaçant avec souffle et vibrato)
function generateWolfHowl() {
  const duration = 4.2;
  const totalSamples = Math.floor(sampleRate * duration);
  const samples = new Float32Array(totalSamples);

  let phase = 0;
  for (let i = 0; i < totalSamples; i++) {
    const t = i / sampleRate;
    
    // Pitch curve: montée lente, tenue avec vibrato, descente
    let freq = 190;
    if (t < 0.8) {
      freq = 190 + (520 - 190) * Math.pow(t / 0.8, 1.8);
    } else if (t < 2.8) {
      const vibrato = Math.sin(2 * Math.PI * 4.5 * t) * 14;
      freq = 520 - (t - 0.8) * 45 + vibrato;
    } else {
      const vibrato = Math.sin(2 * Math.PI * 3.8 * t) * 10;
      freq = 430 * Math.exp(-(t - 2.8) * 1.5) + vibrato;
    }

    // Envelope
    let env = 0;
    if (t < 0.6) env = t / 0.6;
    else if (t < 2.5) env = 1.0;
    else env = Math.max(0, 1 - (t - 2.5) / 1.7);

    // Formants & timbres (loup : fondamental + harmonique 2 + sub + bruit de vent)
    phase += (2 * Math.PI * freq) / sampleRate;
    const osc1 = Math.sin(phase);
    const osc2 = Math.sin(phase * 2) * 0.45;
    const osc3 = Math.sin(phase * 3) * 0.25;
    const noise = (Math.random() * 2 - 1) * 0.08;

    samples[i] = (osc1 + osc2 + osc3 + noise) * env * 0.75;
  }
  return createWavBuffer(sampleRate, samples);
}

// 2. BELL (Cloche de village authentique avec harmoniques d'airain et longue réverbération)
function generateVillageBell() {
  const duration = 4.0;
  const totalSamples = Math.floor(sampleRate * duration);
  const samples = new Float32Array(totalSamples);

  const partials = [
    { freq: 440, gain: 0.8, decay: 2.8 },
    { freq: 880, gain: 0.5, decay: 2.0 },
    { freq: 1046.5, gain: 0.35, decay: 1.8 },
    { freq: 1318.5, gain: 0.25, decay: 1.2 },
    { freq: 1760, gain: 0.15, decay: 0.9 },
    { freq: 2637, gain: 0.08, decay: 0.5 }
  ];

  for (let i = 0; i < totalSamples; i++) {
    const t = i / sampleRate;
    let sample = 0;

    for (const p of partials) {
      const env = Math.exp(-t / p.decay);
      sample += Math.sin(2 * Math.PI * p.freq * t) * p.gain * env;
    }
    
    // Frappe initiale de marteau
    if (t < 0.03) {
      sample += (Math.random() * 2 - 1) * (1 - t / 0.03) * 0.5;
    }

    samples[i] = sample * 0.7;
  }
  return createWavBuffer(sampleRate, samples);
}

// 3. GUNSHOT (Coup de fusil puissant du chasseur avec impact et écho lointain)
function generateGunshot() {
  const duration = 2.2;
  const totalSamples = Math.floor(sampleRate * duration);
  const samples = new Float32Array(totalSamples);

  for (let i = 0; i < totalSamples; i++) {
    const t = i / sampleRate;
    let sample = 0;

    // Déflagration initiale (bruit blanc avec décroissance explosive)
    if (t < 0.15) {
      const expEnv = Math.exp(-t * 35);
      sample += (Math.random() * 2 - 1) * expEnv * 1.0;
    }

    // Impact basse sourde
    const subEnv = Math.exp(-t * 8);
    sample += Math.sin(2 * Math.PI * 65 * Math.exp(-t * 12) * t) * subEnv * 0.8;

    // Écho dans les bois / réverb
    if (t > 0.08) {
      const echoEnv = Math.exp(-(t - 0.08) * 2.2);
      const filteredNoise = (Math.random() * 2 - 1) * echoEnv * 0.25;
      sample += filteredNoise;
    }

    samples[i] = sample * 0.85;
  }
  return createWavBuffer(sampleRate, samples);
}

// 4. DEATH GONG (Glas funèbre grave et lugubre)
function generateDeathGong() {
  const duration = 3.5;
  const totalSamples = Math.floor(sampleRate * duration);
  const samples = new Float32Array(totalSamples);

  const partials = [
    { freq: 85, gain: 0.9, decay: 2.8 },
    { freq: 110, gain: 0.7, decay: 2.5 },
    { freq: 170, gain: 0.4, decay: 1.8 },
    { freq: 220, gain: 0.3, decay: 1.4 },
    { freq: 340, gain: 0.15, decay: 1.0 }
  ];

  for (let i = 0; i < totalSamples; i++) {
    const t = i / sampleRate;
    let sample = 0;

    for (const p of partials) {
      const env = Math.exp(-t / p.decay);
      sample += Math.sin(2 * Math.PI * p.freq * t) * p.gain * env;
    }
    // Dissonance lugubre
    sample += Math.sin(2 * Math.PI * 87.5 * t) * 0.35 * Math.exp(-t / 2.2);

    samples[i] = sample * 0.75;
  }
  return createWavBuffer(sampleRate, samples);
}

// 5. MAGIC CHIME (Révélation de la Voyante / Cupidon / Féérie mystique)
function generateMagicChime() {
  const duration = 2.0;
  const totalSamples = Math.floor(sampleRate * duration);
  const samples = new Float32Array(totalSamples);

  const notes = [587.33, 739.99, 880.00, 1174.66, 1479.98, 1760.00];

  for (let i = 0; i < totalSamples; i++) {
    const t = i / sampleRate;
    let sample = 0;

    notes.forEach((freq, idx) => {
      const startTime = idx * 0.08;
      if (t >= startTime) {
        const noteT = t - startTime;
        const env = Math.exp(-noteT / 0.6);
        sample += Math.sin(2 * Math.PI * freq * noteT) * env * 0.2;
        // Brillance
        sample += Math.sin(2 * Math.PI * freq * 2 * noteT) * env * 0.08;
      }
    });

    samples[i] = sample * 0.85;
  }
  return createWavBuffer(sampleRate, samples);
}

// 6. NIGHT AMBIENCE (Ambiance nocturne de village : vent et grillons mystiques)
function generateNightAmbience() {
  const duration = 5.0;
  const totalSamples = Math.floor(sampleRate * duration);
  const samples = new Float32Array(totalSamples);

  for (let i = 0; i < totalSamples; i++) {
    const t = i / sampleRate;
    
    // Souffle de vent lointain
    const windFreq = 120 + Math.sin(t * 1.2) * 40;
    const wind = Math.sin(2 * Math.PI * windFreq * t) * 0.06;

    // Grillons périodiques
    let cricket = 0;
    const cricketPattern = Math.sin(2 * Math.PI * 3.5 * t);
    if (cricketPattern > 0.4) {
      cricket = Math.sin(2 * Math.PI * 4500 * t) * 0.04 * Math.sin(2 * Math.PI * 60 * t);
    }

    samples[i] = wind + cricket;
  }
  return createWavBuffer(sampleRate, samples);
}

// 7. POTION (Bouillonnement et élixir magique de la sorcière)
function generatePotion() {
  const duration = 1.6;
  const totalSamples = Math.floor(sampleRate * duration);
  const samples = new Float32Array(totalSamples);

  for (let i = 0; i < totalSamples; i++) {
    const t = i / sampleRate;
    let sample = 0;

    // Bulles liquides montantes
    const bubbles = [0.1, 0.35, 0.65, 0.95, 1.2];
    bubbles.forEach((bTime, idx) => {
      if (t >= bTime && t < bTime + 0.18) {
        const bT = t - bTime;
        const freq = 400 + bT * 1800 + idx * 80;
        const env = Math.sin((bT / 0.18) * Math.PI);
        sample += Math.sin(2 * Math.PI * freq * bT) * env * 0.3;
      }
    });

    samples[i] = sample * 0.9;
  }
  return createWavBuffer(sampleRate, samples);
}

fs.writeFileSync(path.join(soundsDir, 'wolf-howl.wav'), generateWolfHowl());
fs.writeFileSync(path.join(soundsDir, 'bell.wav'), generateVillageBell());
fs.writeFileSync(path.join(soundsDir, 'gunshot.wav'), generateGunshot());
fs.writeFileSync(path.join(soundsDir, 'death.wav'), generateDeathGong());
fs.writeFileSync(path.join(soundsDir, 'magic.wav'), generateMagicChime());
fs.writeFileSync(path.join(soundsDir, 'night-ambience.wav'), generateNightAmbience());
fs.writeFileSync(path.join(soundsDir, 'potion.wav'), generatePotion());

console.log('✅ Tous les sons haute fidélité ont été générés avec succès dans /public/sounds !');
