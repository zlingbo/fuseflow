import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Snowflake, Wind } from 'lucide-react';
import { useSparkStore } from '../store/useSparkStore';

export const FreezerColumn: React.FC = () => {
  const { tasks, unfreezeTask, deleteTask } = useSparkStore();
  const frozenTasks = tasks.filter((t) => t.status === 'frozen');

  return (
    <div className="h-full bg-slate-100 border-r border-slate-200 flex flex-col">
      <div className="p-6">
        <h2 className="text-slate-500 text-xs font-bold uppercase tracking-widest flex items-center gap-2 mb-1">
          <Snowflake size={14} className="text-sky-400" />
          The Freezer
        </h2>
        <p className="text-[10px] text-slate-400">Drag items here to cool down</p>
      </div>

      <div className="flex-1 overflow-y-auto px-4 pb-10 space-y-3">
        <AnimatePresence>
          {frozenTasks.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center h-48 text-slate-400 gap-2"
            >
              <Wind size={24} />
              <span className="text-xs">It's empty in here...</span>
            </motion.div>
          ) : (
            frozenTasks.map((task) => (
              <motion.div
                key={task.id}
                layout
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20, scale: 0.8 }}
                className="group relative p-3 rounded-lg border border-slate-200 bg-white shadow-sm text-slate-500 hover:border-sky-300 hover:text-sky-600 hover:shadow-md transition-all cursor-pointer"
                onClick={() => unfreezeTask(task.id)}
              >
                <div className="flex justify-between items-start gap-2">
                  <p className="text-sm font-light truncate w-full">{task.content}</p>
                </div>
                
                {/* Visual "Ice" Overlay */}
                <div className="absolute inset-0 bg-sky-50 rounded-lg opacity-0 group-hover:opacity-40 pointer-events-none transition-opacity mix-blend-multiply" />
                
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteTask(task.id);
                  }}
                  className="absolute -right-1 -top-1 bg-white text-slate-400 border border-slate-200 rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-50 hover:text-red-500 hover:border-red-200 shadow-sm"
                >
                  <span className="sr-only">Delete</span>
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                </button>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};