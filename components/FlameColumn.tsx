import React from 'react';
import { Flame, Download } from 'lucide-react';
import { useSparkStore } from '../store/useSparkStore';
import { motion } from 'framer-motion';

export const FlameColumn: React.FC = () => {
  const { tasks } = useSparkStore();
  
  const today = new Date().setHours(0, 0, 0, 0);
  const completedToday = tasks.filter(
    (t) => t.status === 'completed' && t.completedAt && t.completedAt > today
  ).length;

  // Calculate "Chain Bonus"
  // If a task is completed, and its parent was ALSO completed today, add extra heat
  let heatScore = 0;
  tasks.forEach(t => {
      if (t.status === 'completed' && t.completedAt && t.completedAt > today) {
          heatScore += 1; // Base score
          if (t.parentId) {
              const parent = tasks.find(p => p.id === t.parentId);
              if (parent && parent.status === 'completed' && parent.completedAt && parent.completedAt > today) {
                  heatScore += 1; // Chain bonus
              }
          }
      }
  });

  const intensity = Math.min(heatScore, 10); // Cap at 10 for visuals

  const flameColors = [
    'text-slate-300', // 0
    'text-orange-300', // 1-2
    'text-orange-400', // 3-4
    'text-orange-500', // 5-6
    'text-red-500',    // 7-8
    'text-rose-600',   // 9-10
  ];
  
  const currentColor = flameColors[Math.min(Math.floor(intensity / 2), 5)];

  const handleExport = () => {
    try {
      const dataStr = JSON.stringify(tasks, null, 2);
      const blob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `spark-data-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Export failed:', error);
      alert('Failed to export data');
    }
  };

  return (
    <div className="h-full bg-slate-50 flex flex-col items-center">
      <div className="p-6 w-full bg-slate-50">
        <h2 className="text-orange-600 font-bold uppercase tracking-wider text-xs flex items-center gap-2">
          <Flame size={14} />
          THE FLAME
        </h2>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center w-full gap-8">
        
        {/* Dynamic Flame Visual */}
        <div className="relative">
             {/* Glow */}
            <motion.div 
                animate={{ opacity: [0.2, 0.4, 0.2], scale: [1, 1.1, 1] }}
                transition={{ duration: 3, repeat: Infinity }}
                className={`absolute inset-0 blur-2xl rounded-full ${currentColor.replace('text-', 'bg-').replace('600', '200').replace('500', '200')}`}
            />
            
            <motion.div
                animate={{
                    scale: [1, 1.05, 1],
                    rotate: [0, 2, -2, 0],
                }}
                transition={{
                    duration: 2 - (intensity * 0.1), // Faster when hotter
                    repeat: Infinity,
                }}
                className={`relative z-10 ${currentColor} transition-colors duration-1000`}
            >
                <Flame size={80 + (intensity * 5)} strokeWidth={1.5} fill="currentColor" fillOpacity={0.2 + (intensity * 0.05)} />
            </motion.div>
            
            {/* Particles */}
            <div className="absolute inset-0 pointer-events-none">
                 {[...Array(intensity * 2)].map((_, i) => (
                     <motion.div
                        key={i}
                        className={`absolute w-1 h-1 rounded-full ${currentColor.replace('text-', 'bg-')}`}
                        initial={{ opacity: 0, y: 0, x: 0 }}
                        animate={{ 
                            opacity: [0, 1, 0], 
                            y: -60 - Math.random() * 40, 
                            x: (Math.random() - 0.5) * 40 
                        }}
                        transition={{ 
                            duration: 1 + Math.random(), 
                            repeat: Infinity, 
                            delay: Math.random() * 2 
                        }}
                        style={{ left: '50%', top: '60%' }}
                     />
                 ))}
            </div>
        </div>

        {/* Stats */}
        <div className="text-center">
            <motion.div 
                key={completedToday}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className={`text-5xl font-bold tracking-tighter ${currentColor} transition-colors duration-1000`}
            >
                {completedToday}
            </motion.div>
            <p className="text-xs text-slate-400 font-medium uppercase tracking-widest mt-2">SPARKS TODAY</p>
        </div>

        {/* Encouragement */}
        <div className="w-2/3 text-center">
            <p className="text-sm text-slate-500 font-medium italic">
                {heatScore === 0 
                    ? "Ignite your first spark." 
                    : heatScore < 5 
                    ? "The flame is kindling..." 
                    : "You're on fire! Keep the flow."}
            </p>
        </div>
      </div>

      {/* Footer / Actions */}
      <div className="p-6 mt-auto w-full">
        <button 
          onClick={handleExport}
          className="w-full flex items-center justify-center gap-2 text-xs font-bold text-slate-500 bg-white hover:bg-slate-100 hover:text-slate-800 transition-colors px-4 py-3 rounded-xl border border-slate-200 shadow-sm"
        >
          <Download size={14} />
          Export Data JSON
        </button>
      </div>
    </div>
  );
};