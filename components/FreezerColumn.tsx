import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Snowflake, Wind } from 'lucide-react';
import { useSparkStore } from '../store/useSparkStore';

export const FreezerColumn: React.FC = () => {
  const { tasks, unfreezeTask, deleteTask } = useSparkStore();
  const frozenTasks = tasks.filter((t) => t.status === 'frozen');

  return (
    <div className="h-full bg-slate-50 flex flex-col">
      <div className="p-6 bg-slate-50">
        <h2 className="text-cyan-600 font-bold uppercase tracking-wider text-xs flex items-center gap-2">
          <Snowflake size={14} />
          THE FREEZER
        </h2>
        <p className="text-slate-400 text-xs mt-1">Drag items here to cool down</p>
      </div>

      <div className="flex-1 overflow-y-auto px-4 pb-10 space-y-3 pt-4">
        <AnimatePresence>
          {frozenTasks.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center h-48 text-slate-300 gap-3"
            >
              <Wind size={40} strokeWidth={1.5} />
              <span className="text-sm font-medium">It's empty in here...</span>
            </motion.div>
          ) : (
            frozenTasks.map((task) => (
              <motion.div
                key={task.id}
                layout
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.8, transition: { duration: 0.2 } }}
                className="group relative p-4 rounded-xl border border-cyan-100 bg-white/60 backdrop-blur-sm text-slate-600 hover:bg-white hover:shadow-lg hover:shadow-cyan-100/50 hover:border-cyan-200 transition-all cursor-pointer"
                onClick={() => unfreezeTask(task.id)}
              >
                <div className="flex justify-between items-start gap-2">
                  <p className="text-sm font-medium truncate w-full">{task.content}</p>
                </div>
                
                {/* Visual "Frost" effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-cyan-50/40 pointer-events-none rounded-xl" />
                
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteTask(task.id);
                  }}
                  className="absolute -right-2 -top-2 bg-white text-rose-400 shadow-sm border border-rose-100 w-6 h-6 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-rose-50"
                >
                  <span className="sr-only">Delete</span>
                  <span className="text-sm">×</span>
                </button>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};