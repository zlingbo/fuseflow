import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Zap } from 'lucide-react';
import { useSparkStore } from '../store/useSparkStore';
import { SparkCard } from './SparkCard';
import { SparkNode } from '../types';

// Helper: Check if a task or any of its descendants are active
const isChainActive = (taskId: string, allTasks: SparkNode[]): boolean => {
  const task = allTasks.find(t => t.id === taskId);
  if (!task || task.status === 'frozen') return false;
  if (task.status === 'active') return true;
  return allTasks.some(t => t.parentId === taskId && isChainActive(t.id, allTasks));
};

// Helper: Check if a task or any of its descendants has the active popover
const isChainBoosted = (taskId: string, allTasks: SparkNode[], activePopoverId: string | null): boolean => {
  if (!activePopoverId) return false;
  if (taskId === activePopoverId) return true;
  return allTasks.some(t => t.parentId === taskId && isChainBoosted(t.id, allTasks, activePopoverId));
};

// Recursive component to render task chains
const TaskChain: React.FC<{ task: SparkNode; allTasks: SparkNode[]; depth?: number }> = ({ task, allTasks, depth = 0 }) => {
  const { activePopoverId } = useSparkStore();
  
  const children = allTasks
    .filter(t => t.parentId === task.id && t.status !== 'frozen')
    .sort((a, b) => a.createdAt - b.createdAt);

  const shouldBoost = isChainBoosted(task.id, allTasks, activePopoverId);

  return (
    <motion.div 
      layout
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className="flex flex-col gap-3 group"
      style={{ zIndex: shouldBoost ? 50 : 'auto', position: 'relative' }}
    >
      <SparkCard task={task} isChild={depth > 0} />
      
      {children.length > 0 && (
        <motion.div
          layout
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          className="pl-8 ml-3 border-l-2 border-slate-100 border-opacity-0 group-hover:border-opacity-100 transition-colors duration-300 flex flex-col gap-3"
        >
          <AnimatePresence mode="popLayout" initial={false}>
            {children.map(child => (
              <TaskChain key={child.id} task={child} allTasks={allTasks} depth={depth + 1} />
            ))}
          </AnimatePresence>
        </motion.div>
      )}
    </motion.div>
  );
};

export const FlowColumn: React.FC = () => {
  const { tasks, addTask, activePopoverId } = useSparkStore();
  const [inputValue, setInputValue] = useState('');

  const rootTasks = tasks
    .filter(t => t.status !== 'frozen')
    .filter(t => {
      if (!t.parentId) return true;
      const parent = tasks.find(p => p.id === t.parentId);
      return !parent || parent.status === 'frozen';
    })
    .sort((a, b) => {
      const aActive = isChainActive(a.id, tasks);
      const bActive = isChainActive(b.id, tasks);

      if (aActive && !bActive) return -1;
      if (!aActive && bActive) return 1;

      const aTime = a.completedAt ?? a.createdAt;
      const bTime = b.completedAt ?? b.createdAt;

      return bTime - aTime;
    });

  const handleMainSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim()) {
      addTask(inputValue, null);
      setInputValue('');
    }
  };

  return (
    <div className="h-full flex flex-col bg-slate-50 relative overflow-hidden">
      {/* Global Backdrop for Popovers */}
      {activePopoverId && (
        <div className="fixed inset-0 z-45 bg-transparent" />
      )}

      {/* Header */}
      <div className="p-6 bg-slate-50 z-40 sticky top-0">
         <h2 className="text-indigo-600 font-bold uppercase tracking-wider text-xs flex items-center gap-2">
           <Zap size={14} />
           THE FLOW
         </h2>
      </div>

      {/* Input Area */}
      <div className="px-6 pb-2 z-30 bg-slate-50">
        <form onSubmit={handleMainSubmit}>
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="What needs to happen now?"
            className="w-full bg-white text-slate-700 placeholder-slate-400 px-5 py-4 rounded-xl shadow-sm border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
          />
        </form>
      </div>

      {/* Task Stream */}
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4 relative z-10">
        <AnimatePresence mode='popLayout'>
          {rootTasks.map((task) => (
             <TaskChain key={task.id} task={task} allTasks={tasks} />
          ))}
          
          {rootTasks.length === 0 && (
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }}
              className="h-full flex flex-col items-center justify-center text-slate-400 gap-4 opacity-50 pb-20"
            >
              <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center">
                <Plus size={32} />
              </div>
              <p>No active sparks. Start something new.</p>
            </motion.div>
          )}
        </AnimatePresence>
        
        <div className="h-20" /> {/* Spacer */}
      </div>
    </div>
  );
};