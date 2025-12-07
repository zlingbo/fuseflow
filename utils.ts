
export const generateId = (): string => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
};

export const cn = (...classes: (string | undefined | null | false)[]) => {
  return classes.filter(Boolean).join(' ');
};

// --- Sound Effects System (Retro Synth) ---

const createAudioContext = () => {
  const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
  if (!AudioContext) return null;
  return new AudioContext();
};

export const playSuccessSound = () => {
  try {
    const ctx = createAudioContext();
    if (!ctx) return;

    const t = ctx.currentTime;
    
    // 8-bit Coin Sound (Square Wave)
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.type = 'square';
    
    // Quick Arpeggio B-D#
    osc.frequency.setValueAtTime(493.88, t); // B4
    osc.frequency.setValueAtTime(622.25, t + 0.08); // D#5
    
    gain.gain.setValueAtTime(0.1, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.4);
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    osc.start(t);
    osc.stop(t + 0.4);

  } catch (e) {
    console.error("Audio play failed", e);
  }
};

export const playFreezeSound = () => {
  try {
    const ctx = createAudioContext();
    if (!ctx) return;
    
    const t = ctx.currentTime;

    // Static Noise (Glitchy)
    const bufferSize = ctx.sampleRate * 0.3;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      // Bitcrush effect: stepped random
      data[i] = Math.round((Math.random() * 2 - 1) * 4) / 4; 
    }

    const noise = ctx.createBufferSource();
    noise.buffer = buffer;
    
    const filter = ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.setValueAtTime(2000, t);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.1, t);
    gain.gain.linearRampToValueAtTime(0, t + 0.3);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    
    noise.start(t);
  } catch (e) {
    console.error("Audio play failed", e);
  }
};

export const playSplitSound = () => {
  try {
    const ctx = createAudioContext();
    if (!ctx) return;
    
    const t = ctx.currentTime;

    // Low bit crunch impact
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.type = 'sawtooth'; 
    osc.frequency.setValueAtTime(120, t); 
    osc.frequency.exponentialRampToValueAtTime(10, t + 0.1); 
    
    gain.gain.setValueAtTime(0.2, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.1);

    osc.connect(gain);
    gain.connect(ctx.destination);
    
    osc.start(t);
    osc.stop(t + 0.1);
  } catch (e) {
    console.error("Audio play failed", e);
  }
};