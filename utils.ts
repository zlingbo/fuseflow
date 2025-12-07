
export const generateId = (): string => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
};

export const cn = (...classes: (string | undefined | null | false)[]) => {
  return classes.filter(Boolean).join(' ');
};

export const triggerVibration = (pattern: number | number[] = 50) => {
  if (typeof navigator !== 'undefined' && navigator.vibrate) {
    navigator.vibrate(pattern);
  }
};

// --- Sound Effects System (Web Audio API) ---

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
    
    // Oscillator 1: Main "Ding"
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(523.25, t); // C5
    osc1.frequency.exponentialRampToValueAtTime(1046.5, t + 0.1); // C6
    gain1.gain.setValueAtTime(0.1, t);
    gain1.gain.exponentialRampToValueAtTime(0.001, t + 0.8);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(t);
    osc1.stop(t + 0.8);

    // Oscillator 2: Sparkle high pitch
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(1046.5, t); 
    osc2.frequency.linearRampToValueAtTime(2093, t + 0.1); 
    gain2.gain.setValueAtTime(0.05, t);
    gain2.gain.exponentialRampToValueAtTime(0.001, t + 0.4);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(t);
    osc2.stop(t + 0.4);

  } catch (e) {
    console.error("Audio play failed", e);
  }
};

export const playFreezeSound = () => {
  try {
    const ctx = createAudioContext();
    if (!ctx) return;
    
    const t = ctx.currentTime;

    // White noise buffer for "icy" sound
    const bufferSize = ctx.sampleRate * 0.5; // 0.5 seconds
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = ctx.createBufferSource();
    noise.buffer = buffer;
    
    // Filter to make it sound like wind/ice
    const filter = ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.setValueAtTime(1000, t);
    filter.frequency.linearRampToValueAtTime(4000, t + 0.3);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.05, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.3);

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

    // Sharp "Crack" sound (Sawtooth for jagged edges)
    // Simulating a snap of hard material
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.type = 'sawtooth'; // Sharp wave
    osc.frequency.setValueAtTime(800, t); // Start high
    osc.frequency.exponentialRampToValueAtTime(100, t + 0.1); // Rapid drop (impact)
    
    // Quick attack, quick decay
    gain.gain.setValueAtTime(0.0, t);
    gain.gain.linearRampToValueAtTime(0.4, t + 0.01); 
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.15);

    // Filter out extremely high frequencies
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(3000, t);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    
    osc.start(t);
    osc.stop(t + 0.15);
  } catch (e) {
    console.error("Audio play failed", e);
  }
};
