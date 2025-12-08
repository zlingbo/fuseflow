import React from 'react';
import { Flame, Activity, Download } from 'lucide-react';
import { useSparkStore } from '../store/useSparkStore';
import { motion } from 'framer-motion';

export const FlameColumn: React.FC = () => {
  const { tasks } = useSparkStore();
  
  const today = new Date().setHours(0, 0, 0, 0);
  const completedToday = tasks.filter(
    (t) => t.status === 'completed' && t.completedAt && t.completedAt > today
  ).length;

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

      <div className="p-6 w-full z-10 border-b-2 border-retro-surface bg-retro-bg">
        <h2 className="text-retro-red text-xs font-bold uppercase tracking-widest flex items-center justify-end gap-2 mb-1">
          SYSTEM_HEAT
          <Activity size={14} />
        </h2>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center w-full gap-8 z-10">
        
        {/* Pixel Flame Visual */}
        <div className="relative border-4 border-retro-surface bg-black p-4 shadow-hard-sm">
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

        {/* Stats - Seven Segment Simulation */}
        <div className="text-center relative z-10">
            <motion.div 
                key={completedToday}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-6xl font-bold text-retro-red font-mono tracking-tighter"
                style={{ textShadow: "0 0 10px rgba(255, 51, 51, 0.5)" }}
            >
                {completedToday.toString().padStart(2, '0')}
            </motion.div>
            <p className="text-[10px] text-retro-dim uppercase tracking-widest mt-1 border-t border-retro-dim pt-1 inline-block">
                CYCLE_COUNT
            </p>
        </div>

        {/* System Message */}
        <div className="w-3/4 p-3 border border-retro-dim bg-retro-surface/30 text-center">
            <p className="text-[10px] text-retro-amber leading-relaxed font-bold uppercase">
                {completedToday === 0 
                    ? ">> SYSTEM_IDLE" 
                    : completedToday < 3 
                    ? ">> WARMUP_SEQ" 
                    : completedToday < 5
                    ? ">> OPTIMAL_FLOW"
                    : ">> OVERCLOCKING"}
            </p>
        </div>
      </div>

      {/* Footer / Actions */}
      <div className="p-6 mt-auto z-10 w-full">
        <button 
          onClick={handleExport}
          className="w-full flex items-center justify-center gap-2 text-[10px] font-bold text-black bg-retro-dim hover:bg-retro-amber transition-colors px-3 py-3 border-2 border-transparent hover:border-retro-amber shadow-hard-sm"
        >
          <Download size={12} />
          INIT_DUMP.JSON
        </button>
      </div>
    </div>
  );
};