import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Snowflake, Disc } from 'lucide-react';
import { useSparkStore } from '../store/useSparkStore';

export const FreezerColumn: React.FC = () => {
  const { tasks, unfreezeTask, deleteTask } = useSparkStore();
  const frozenTasks = tasks.filter((t) => t.status === 'frozen');

  return (
    <div className="h-full bg-retro-bg flex flex-col font-mono border-r-2 border-retro-surface">
      {/* Background Grid - Teal Tint */}
      <div className="absolute inset-0 z-0 opacity-[0.05] pointer-events-none" 
           style={{ backgroundImage: 'linear-gradient(#00ffcc 1px, transparent 1px), linear-gradient(90deg, #00ffcc 1px, transparent 1px)', backgroundSize: '40px 40px' }}>
      </div>

      <div className="p-6 border-b-2 border-retro-surface z-10 bg-retro-bg">
        <h2 className="text-retro-teal text-xs font-bold uppercase tracking-widest flex items-center gap-2 mb-1">
          <Disc size={14} />
          DATA_BANK
        </h2>
        <p className="text-[10px] text-retro-dim">ARCHIVED_MEMORY_BLOCKS</p>
      </div>

      <div className="flex-1 overflow-y-auto px-4 pb-10 space-y-3 pt-4 z-10">
        <AnimatePresence>
          {frozenTasks.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center h-48 text-retro-dim gap-2"
            >
              <Snowflake size={24} className="opacity-20" />
              <span className="text-xs">[EMPTY_SECTOR]</span>
            </motion.div>
          ) : (
            frozenTasks.map((task) => (
              <motion.div
                key={task.id}
                layout
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20, scale: 0.8 }}
                className="group relative p-3 border border-retro-teal/30 bg-retro-surface/50 text-retro-teal hover:border-retro-teal hover:bg-retro-teal/10 hover:shadow-glow-teal transition-all cursor-pointer"
                onClick={() => unfreezeTask(task.id)}
              >
                {/* Deco corners */}
                <div className="absolute top-0 left-0 w-1 h-1 bg-retro-teal" />
                <div className="absolute bottom-0 right-0 w-1 h-1 bg-retro-teal" />

                <div className="flex justify-between items-start gap-2">
                  <p className="text-xs truncate w-full font-bold">:: {task.content}</p>
                </div>
                
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteTask(task.id);
                  }}
                  className="absolute -right-2 -top-2 bg-retro-bg text-retro-red border border-retro-red w-5 h-5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-retro-red hover:text-black"
                >
                  <span className="sr-only">Del</span>
                  <span className="text-[10px] font-bold">X</span>
                </button>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
