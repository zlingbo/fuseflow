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

  // Determine intensity level (0-3)
  const intensityLevel = heatPercentage >= 100 ? 3 : heatPercentage >= 50 ? 2 : heatPercentage > 0 ? 1 : 0;

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
        
        {/* Reactor Core Visual */}
        <div className="relative mt-8 group cursor-default">
           {/* Outer Ring */}
           <div className={cn(
             "w-32 h-32 rounded-full border-4 border-dashed border-gray-800 flex items-center justify-center transition-all duration-1000",
             intensityLevel > 0 && "border-retro-red/30 animate-[spin_10s_linear_infinite]"
           )}>
              {/* Inner Ring */}
              <div className={cn(
                "w-24 h-24 rounded-full border-2 border-gray-800 flex items-center justify-center transition-all duration-500",
                intensityLevel > 1 && "border-retro-red/60 shadow-[0_0_15px_rgba(255,51,51,0.4)]"
              )}>
                 {/* Core */}
                 <div className={cn(
                   "w-16 h-16 rounded-full bg-gray-900 flex items-center justify-center transition-all duration-300 relative overflow-hidden",
                   intensityLevel > 0 && "bg-retro-red/10",
                   intensityLevel > 2 && "bg-retro-red/20 shadow-[0_0_20px_rgba(255,51,51,0.8)] animate-pulse"
                 )}>
                    <Flame 
                      size={32} 
                      className={cn(
                        "text-gray-800 transition-all duration-500",
                        intensityLevel === 1 && "text-retro-red/60",
                        intensityLevel === 2 && "text-retro-red",
                        intensityLevel === 3 && "text-white drop-shadow-[0_0_5px_rgba(255,51,51,1)] scale-110"
                      )} 
                    />
                    
                    {/* Scanline overlay for core */}
                    <div className="absolute inset-0 bg-black/10 z-10 pointer-events-none" style={{ backgroundSize: '100% 2px', backgroundImage: 'linear-gradient(rgba(0,0,0,0.5) 50%, transparent 50%)' }} />
                 </div>
              </div>
           </div>
           
           <div className="absolute -bottom-6 left-0 right-0 text-center">
             <span className={cn(
               "text-[10px] font-bold uppercase tracking-[0.2em]",
               intensityLevel === 0 && "text-gray-700",
               intensityLevel === 1 && "text-retro-red/60",
               intensityLevel >= 2 && "text-retro-red text-glow-red"
             )}>
               {intensityLevel === 0 ? "IDLE" : intensityLevel === 1 ? "WARMING" : intensityLevel === 2 ? "ACTIVE" : "CRITICAL"}
             </span>
           </div>
        </div>

        {/* Heat Gauge */}
        <div className="w-full max-w-[200px] space-y-2">
           <div className="flex justify-between text-[10px] text-gray-500 uppercase font-bold">
             <span>Efficiency</span>
             <span>{Math.round(heatPercentage)}%</span>
           </div>
           <div className="h-4 bg-black border border-gray-800 p-[2px] flex gap-[2px]">
              {Array.from({ length: 10 }).map((_, i) => (
                <div 
                  key={i}
                  className={cn(
                    "flex-1 transition-all duration-500",
                    (i + 1) * 10 <= heatPercentage 
                      ? i > 7 ? "bg-retro-red shadow-[0_0_5px_rgba(255,51,51,0.8)]" : "bg-retro-red/60"
                      : "bg-gray-900"
                  )}
                />
              ))}
           </div>
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