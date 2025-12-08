import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wind, Database } from 'lucide-react';
import { useSparkStore } from '../store/useSparkStore';

export const FreezerColumn: React.FC = () => {
  const { tasks, unfreezeTask, deleteTask } = useSparkStore();
  const frozenTasks = tasks.filter((t) => t.status === 'frozen');

  return (
    <div className="h-full bg-retro-bg flex flex-col border-r-2 border-retro-surface">
      <div className="p-4 bg-retro-bg border-b-2 border-retro-surface">
        <h2 className="text-retro-cyan font-bold tracking-widest text-sm flex items-center gap-2 text-glow-cyan">
          <Database size={16} />
          // COLD_STORAGE
        </h2>
        <p className="text-gray-600 text-[10px] mt-1 font-mono uppercase">Status: Archiving...</p>
      </div>

      <div className="flex-1 overflow-y-auto px-4 pb-10 space-y-3 pt-4">
        <AnimatePresence>
          {frozenTasks.length === 0 ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center h-48 text-gray-700 gap-3 font-mono">
              <span className="text-4xl opacity-20">[ ]</span>
              <span className="text-xs">[EMPTY_SECTOR]</span>
            </motion.div>
          ) : (
            frozenTasks.map((task) => (
              <motion.div
                key={task.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }}
                className="group relative p-3 border-2 border-gray-800 bg-black hover:border-retro-cyan hover:shadow-[0_0_10px_rgba(0,255,153,0.2)] transition-all cursor-pointer font-mono"
                onClick={() => unfreezeTask(task.id)}
              >
                <div className="flex justify-between items-start gap-2">
                  <p className="text-xs text-retro-cyan truncate w-full font-bold">{task.content}</p>
                </div>
                
                <div className="mt-2 flex justify-between items-end border-t border-gray-900 pt-2">
                   <span className="text-[9px] text-gray-600">ID: {task.id.slice(0,4)}</span>
                   <span className="text-[9px] bg-gray-900 text-gray-500 px-1">FROZEN</span>
                </div>
                
                <button
                  onClick={(e) => { e.stopPropagation(); deleteTask(task.id); }}
                  className="absolute -right-2 -top-2 bg-black text-retro-red border border-retro-red w-5 h-5 flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-retro-red hover:text-black transition-all"
                >
                  <span className="text-xs font-bold">X</span>
                </button>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};