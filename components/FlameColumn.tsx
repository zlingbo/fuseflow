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

      <div className="flex-1 flex flex-col items-center justify-start w-full gap-8 z-10 p-6 overflow-y-auto">
        
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

        {/* Stats Grid */}
        <div className="w-full grid grid-cols-2 gap-2 mt-4">
           <div className="bg-black border border-gray-800 p-2 flex flex-col items-center justify-center">
             <span className="text-gray-600 text-[9px] uppercase">Active</span>
             <span className="text-retro-amber font-bold text-lg">{tasks.filter(t => t.status === 'active').length}</span>
           </div>
           <div className="bg-black border border-gray-800 p-2 flex flex-col items-center justify-center">
             <span className="text-gray-600 text-[9px] uppercase">Frozen</span>
             <span className="text-retro-cyan font-bold text-lg">{tasks.filter(t => t.status === 'frozen').length}</span>
           </div>
        </div>

        <div className="mt-auto w-full pt-6">
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
    </div>
  );
};