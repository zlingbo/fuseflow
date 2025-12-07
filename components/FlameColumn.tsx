import React from 'react';
import { Flame, TrendingUp } from 'lucide-react';
import { useSparkStore } from '../store/useSparkStore';
import { motion } from 'framer-motion';

export const FlameColumn: React.FC = () => {
  const { tasks } = useSparkStore();
  
  // Simple calculation for MVP: Today's completed tasks
  const today = new Date().setHours(0, 0, 0, 0);
  const completedToday = tasks.filter(
    (t) => t.status === 'completed' && t.completedAt && t.completedAt > today
  ).length;

  // Determine flame intensity level (0-5)
  const intensity = Math.min(completedToday, 5);

  const flameColors = [
    'text-slate-300', // 0
    'text-orange-300', // 1
    'text-orange-400', // 2
    'text-orange-500', // 3
    'text-red-500', // 4
    'text-red-600 drop-shadow-[0_0_20px_rgba(239,68,68,0.6)]', // 5
  ];

  return (
    <div className="h-full bg-slate-50 border-l border-slate-200 flex flex-col items-center">
      <div className="p-6 w-full">
        <h2 className="text-slate-500 text-xs font-bold uppercase tracking-widest flex items-center justify-end gap-2 mb-1">
          The Flame
          <Flame size={14} className="text-orange-500" />
        </h2>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center w-full gap-8">
        
        {/* The Flame Visual */}
        <div className="relative">
            {/* Core Flame */}
            <motion.div
                animate={{
                    scale: [1, 1.05 + (intensity * 0.05), 1],
                    opacity: [0.8, 1, 0.8],
                    rotate: [-1, 1, -1]
                }}
                transition={{
                    duration: 2 - (intensity * 0.2), // Faster when intense
                    repeat: Infinity,
                    ease: "easeInOut"
                }}
                className={`transition-colors duration-1000 ${flameColors[intensity]}`}
            >
                <Flame size={80 + intensity * 15} strokeWidth={1.5} fill="currentColor" fillOpacity={intensity > 2 ? 0.1 + (intensity * 0.05) : 0} />
            </motion.div>
            
            {/* Dynamic Particles based on intensity */}
            {intensity > 0 && (
                <div className="absolute inset-0 pointer-events-none">
                     {/* Floating Sparks */}
                     {[...Array(intensity * 2)].map((_, i) => (
                         <motion.div
                            key={i}
                            className="absolute bg-orange-500 rounded-full"
                            style={{
                                width: Math.random() * 4 + 2 + 'px',
                                height: Math.random() * 4 + 2 + 'px',
                                left: '50%',
                                top: '60%',
                            }}
                            animate={{
                                y: -100 - Math.random() * 50,
                                x: (Math.random() - 0.5) * 60,
                                opacity: [1, 0],
                                scale: [1, 0]
                            }}
                            transition={{
                                duration: 1 + Math.random(),
                                repeat: Infinity,
                                repeatDelay: Math.random() * 0.5,
                                ease: "easeOut"
                            }}
                         />
                     ))}
                </div>
            )}
            
            {/* Halo Glow for high intensity */}
            {intensity >= 4 && (
                <motion.div 
                    className="absolute inset-0 bg-red-500/10 rounded-full blur-3xl -z-10"
                    animate={{ opacity: [0.5, 0.8, 0.5], scale: [1, 1.2, 1] }}
                    transition={{ duration: 3, repeat: Infinity }}
                />
            )}
        </div>

        {/* Stats */}
        <div className="text-center relative z-10">
            <motion.div 
                key={completedToday}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="text-4xl font-bold text-slate-800 font-mono"
            >
                {completedToday}
            </motion.div>
            <p className="text-xs text-slate-500 uppercase tracking-widest mt-1">
                Sparks Today
            </p>
        </div>

        {/* Insight Placeholder */}
        <div className="w-3/4 p-4 rounded-xl bg-white border border-slate-200 text-center shadow-sm relative overflow-hidden">
            <div className={`absolute top-0 left-0 w-1 h-full ${intensity > 3 ? 'bg-orange-500' : 'bg-slate-200'}`} />
            <TrendingUp size={16} className={`mx-auto mb-2 ${intensity > 3 ? 'text-orange-500' : 'text-slate-400'}`} />
            <p className="text-[10px] text-slate-500 leading-relaxed font-medium">
                {completedToday === 0 
                    ? "Ignite the first spark." 
                    : completedToday < 3 
                    ? "The engine is warming up." 
                    : completedToday < 5
                    ? "You are in the flow state."
                    : "On fire! Keep the streak alive!"}
            </p>
        </div>

      </div>
    </div>
  );
};