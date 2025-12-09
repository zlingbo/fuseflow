
export const generateId = (): string => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
};

export const cn = (...classes: (string | undefined | null | false)[]) => {
  return classes.filter(Boolean).join(' ');
};

export const formatDuration = (ms: number): string => {
  const seconds = Math.floor(ms / 1000);
  if (seconds < 60) return '< 1m';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return `${hours}h ${remainingMinutes}m`;
};

// --- Retro Sound Effects System (8-bit) ---

let sharedCtx: AudioContext | null = null;

const createAudioContext = () => {
  const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
  if (!AudioContext) return null;
  if (sharedCtx && sharedCtx.state !== 'closed') return sharedCtx;
  sharedCtx = new AudioContext();
  return sharedCtx;
};

export const unlockAudio = () => {
  try {
    const ctx = createAudioContext();
    if (ctx && ctx.state === 'suspended') {
      ctx.resume();
    }
  } catch (e) {
    // Ignore unlock failures; mobile will retry on next gesture
  }
};

export const playSuccessSound = () => {
  try {
    const ctx = createAudioContext();
    if (!ctx) return;
    const t = ctx.currentTime;
    
    // Retro Coin/Powerup (Square Wave)
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.type = 'square';
    osc.frequency.setValueAtTime(440, t);
    osc.frequency.setValueAtTime(880, t + 0.1); // Jump up an octave
    
    gain.gain.setValueAtTime(0.1, t);
    gain.gain.linearRampToValueAtTime(0.1, t + 0.1);
    gain.gain.linearRampToValueAtTime(0, t + 0.4);
    
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

    // Static Noise / Glitch (Approximated with random high freq triangle)
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(8000, t);
    osc.frequency.exponentialRampToValueAtTime(100, t + 0.2);
    
    gain.gain.setValueAtTime(0.05, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.2);
    
    const filter = ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.value = 2000;

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    
    osc.start(t);
    osc.stop(t + 0.2);
  } catch (e) {
    console.error("Audio play failed", e);
  }
};

export const playSplitSound = () => {
  try {
    const ctx = createAudioContext();
    if (!ctx) return;
    const t = ctx.currentTime;

    // Heavy Thud / Impact (Low frequency sawtooth)
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(150, t);
    osc.frequency.exponentialRampToValueAtTime(40, t + 0.15);
    
    gain.gain.setValueAtTime(0.2, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.15);

    osc.connect(gain);
    gain.connect(ctx.destination);
    
    osc.start(t);
    osc.stop(t + 0.15);
  } catch (e) {
    console.error("Audio play failed", e);
  }
};

export const playDeleteSound = () => {
  try {
    const ctx = createAudioContext();
    if (!ctx) return;
    const t = ctx.currentTime;

    // Short metallic click + low thump
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(220, t);
    osc.frequency.exponentialRampToValueAtTime(140, t + 0.12);

    gain.gain.setValueAtTime(0.18, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.16);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(t);
    osc.stop(t + 0.18);
  } catch (e) {
    console.error("Audio play failed", e);
  }
};