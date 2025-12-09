import React from 'react';
import { Flame, Activity, Download, Cpu } from 'lucide-react';
import { useSparkStore } from '../store/useSparkStore';
import { motion } from 'framer-motion';
import { cn } from '../utils';

export const FlameColumn: React.FC = () => {
  const { tasks } = useSparkStore();
  
  const today = new Date().setHours(0, 0, 0, 0);
  const completedToday = tasks.filter(
    (t) => t.status === 'completed' && t.completedAt && t.completedAt > today
  ).length;
  const totalCompleted = tasks.filter((t) => t.status === 'completed').length;

  const maxHeat = 8; // Target daily tasks
  const heatPercentage = Math.min((completedToday / maxHeat) * 100, 100);
  // Determine intensity level (0-3) for legacy labels
  const intensityLevel = heatPercentage >= 100 ? 3 : heatPercentage >= 50 ? 2 : heatPercentage > 0 ? 1 : 0;

  const intensity = Math.min(completedToday, 5);

  const flameColors = [
    'text-retro-dim', // 0
    'text-retro-amber opacity-40', // 1
    'text-retro-amber', // 2
    'text-retro-red opacity-80', // 3
    'text-retro-red', // 4
    'text-white drop-shadow-[0_0_10px_rgba(255,51,51,1)]', // 5
  ];

  const handleExport = () => {
    try {
      const dataStr = JSON.stringify(tasks, null, 2);
      const blob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `SPARK_DUMP_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Export failed:', error);
      alert('DUMP_FAIL');
    }
  };

  return (
    <div className="h-full bg-retro-bg flex flex-col items-center font-mono border-l-2 border-retro-surface relative overflow-hidden">
       {/* Background Grid - Red Tint */}
       <div className="absolute inset-0 z-0 opacity-[0.05] pointer-events-none" 
           style={{ backgroundImage: 'linear-gradient(#ff3333 1px, transparent 1px), linear-gradient(90deg, #ff3333 1px, transparent 1px)', backgroundSize: '40px 40px' }}>
      </div>

      <div className="p-4 w-full z-10 border-b-2 border-retro-surface bg-retro-bg flex justify-between items-center">
        <h2 className="text-retro-red text-xs font-bold uppercase tracking-widest flex items-center gap-2">
          <Activity size={14} />
          SYSTEM_HEAT
        </h2>
        <span className="text-[10px] text-retro-red font-bold animate-pulse">{completedToday} / {maxHeat} UNITS</span>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center w-full gap-4 z-10 p-5 overflow-y-auto">
        
        {/* Pixel Flame Visual */}
        <div className="relative border-4 border-retro-surface bg-black p-3 shadow-hard-sm">
             {/* "Screen" Effect */}
             <div className="absolute inset-0 bg-retro-red/10 pointer-events-none" />
             
             <motion.div
                 animate={{
                     scale: [1, 1.1, 1],
                     opacity: [0.8, 1, 0.8],
                 }}
                 transition={{
                     duration: 0.2, // Fast glitch flicker
                     repeat: Infinity,
                     repeatType: "reverse"
                 }}
                 className={`transition-colors duration-1000 ${flameColors[intensity]}`}
             >
                 {/* Using standard icon but framing it to look like a sprite */}
                 <Flame size={64} strokeWidth={2} fill="currentColor" />
             </motion.div>
        </div>

         {/* Big Number Display for SPARKLE_COUNT */}
         <div className="relative flex flex-col items-center gap-1.5 mt-3 px-3 py-2 overflow-hidden text-center">
            {/* Scanline overlay (lighter for clarity) */}
            <div className="pointer-events-none absolute inset-0 opacity-35 mix-blend-screen"
              style={{ backgroundImage: 'repeating-linear-gradient(to bottom, rgba(255,255,255,0.08) 0px, rgba(255,255,255,0.08) 2px, transparent 2px, transparent 5px)' }} />
 
            {/* Prism/Sparkle layers - Pure white base with intense RGB split edges */}
            <div className="relative inline-block leading-none text-[clamp(44px,6vw,60px)] font-extrabold tracking-tight drop-shadow-[0_0_15px_rgba(255,255,255,0.4)]">
              {/* Cyan/Blue Shift */}
              <motion.span
                className="absolute inset-0 text-cyan-400 mix-blend-screen select-none"
                animate={{ x: [-2, 2, -1], opacity: [0.6, 0.8, 0.5] }}
                transition={{ duration: 2.5, repeat: Infinity, repeatType: "mirror", ease: "easeInOut" }}
              >
                {totalCompleted.toString().padStart(2, '0')}
              </motion.span>
              
              {/* Magenta/Pink Shift */}
              <motion.span
                className="absolute inset-0 text-fuchsia-500 mix-blend-screen select-none"
                animate={{ x: [2, -2, 1], opacity: [0.6, 0.8, 0.5] }}
                transition={{ duration: 3, repeat: Infinity, repeatType: "mirror", ease: "easeInOut" }}
              >
                {totalCompleted.toString().padStart(2, '0')}
              </motion.span>

              {/* Yellow/Gold Shift (Vertical) */}
              <motion.span
                className="absolute inset-0 text-yellow-300 mix-blend-screen select-none"
                animate={{ y: [-1, 1.5, -0.5], opacity: [0.5, 0.7, 0.4] }}
                transition={{ duration: 4, repeat: Infinity, repeatType: "mirror", ease: "easeInOut" }}
              >
                {totalCompleted.toString().padStart(2, '0')}
              </motion.span>

              {/* Base White Text */}
              <span className="relative text-white z-10">
                {totalCompleted.toString().padStart(2, '0')}
              </span>
            </div>
 
            <div className="w-14 border-t border-retro-dim/60" />
            <div className="text-[10px] text-retro-dim uppercase tracking-[0.25em] drop-shadow-[0_0_6px_rgba(255,72,72,0.35)]">
              SPARKLE_COUNT
            </div>
         </div>

      </div>
      
      {/* Footer */}
      <div className="w-full p-5 border-t border-retro-surface bg-retro-bg z-10">
        <button 
          onClick={handleExport}
          className="group w-full border-2 border-dashed border-gray-700 hover:border-retro-red p-3 flex items-center justify-center gap-2 text-gray-500 hover:text-retro-red transition-all hover:bg-retro-red/5"
        >
          <Download size={16} />
          <span className="text-xs font-bold uppercase tracking-widest group-hover:animate-pulse">DUMP_MEMORY</span>
        </button>
        <p className="text-[9px] text-gray-800 text-center mt-2 uppercase font-mono">
          v1.0.4 // SPARK_OS
        </p>
      </div>
    </div>
  );
};