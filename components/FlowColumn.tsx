
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Zap } from 'lucide-react';
import { useSparkStore } from '../store/useSparkStore';
import { SparkCard } from './SparkCard';
import { SparkNode } from '../types';

// Helper: Check if a task or any of its descendants are active
const isChainActive = (taskId: string, allTasks: SparkNode[]): boolean => {
  const task = allTasks.find(t => t.id === taskId);
  // If task missing or frozen, it's not active contextually
  if (!task || task.status === 'frozen') return false;
  
  // If the task itself is active, the whole chain is active
  if (task.status === 'active') return true;

  // If this task is completed, check if any immediate children start an active path
  // We use .some() for early exit recursion
  return allTasks.some(t => t.parentId === taskId && isChainActive(t.id, allTasks));
};

// Recursive component to render task chains
const TaskChain: React.FC<{ task: SparkNode; allTasks: SparkNode[]; depth?: number }> = ({ task, allTasks, depth = 0 }) => {
  // Find immediate children of this task that are not frozen
  const children = allTasks
    .filter(t => t.parentId === task.id && t.status !== 'frozen')
    .sort((a, b) => a.createdAt - b.createdAt);

  return (
    <div className="flex flex-col gap-3">
      {/* SparkCard handles its own layoutId animation */}
      <SparkCard task={task} isChild={depth > 0} />
      
      {children.length > 0 && (
        <div className="pl-6 ml-3 border-l-2 border-slate-200 flex flex-col gap-3">
          <AnimatePresence mode="popLayout">
            {children.map(child => (
              <TaskChain key={child.id} task={child} allTasks={allTasks} depth={depth + 1} />
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
};

export const FlowColumn: React.FC = () => {
  const { tasks, addTask } = useSparkStore();
  const [inputValue, setInputValue] = useState('');

  // Get root tasks (active/completed) that either have no parent OR their parent is frozen/deleted
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

      // Priority 1: Active chains first
      if (aActive && !bActive) return -1;
      if (!aActive && bActive) return 1;

      // Priority 2: Newest time first (based on completion time if completed, or creation time if active)
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
    <div className="h-full flex flex-col bg-background relative overflow-hidden">
      {/* Header / Main Input */}
      <div className="p-6 pb-2 z-40 bg-gradient-to-b from-background via-background/95 to-transparent backdrop-blur-md sticky top-0">
        <h2 className="text-secondary text-xs font-bold uppercase tracking-widest mb-4 flex items-center gap-2">
          <Zap size={14} className="text-primary fill-primary/20" />
          The Flow
        </h2>
        
        <form onSubmit={handleMainSubmit} className="relative group">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="What needs to happen now?"
            className="w-full bg-surface border border-slate-200 rounded-xl px-4 py-4 pr-12 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary/50 transition-all shadow-lg shadow-slate-200/50"
          />
          <button
            type="submit"
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 bg-primary text-white rounded-lg hover:bg-indigo-600 hover:scale-105 transition-all disabled:opacity-0 disabled:scale-75 shadow-md shadow-primary/30"
            disabled={!inputValue.trim()}
          >
            <Plus size={20} />
          </button>
        </form>
      </div>

      {/* Task Stream */}
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6">
        <AnimatePresence mode='popLayout'>
          {rootTasks.map((task) => (
             <TaskChain key={task.id} task={task} allTasks={tasks} />
          ))}
          
          {rootTasks.length === 0 && (
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }}
              className="h-full flex flex-col items-center justify-center text-slate-400 gap-4 opacity-70"
            >
              <div className="w-16 h-16 rounded-full border-2 border-dashed border-slate-300 flex items-center justify-center bg-white">
                <Plus size={24} className="text-slate-300" />
              </div>
              <p className="text-sm">Start a new chain above</p>
            </motion.div>
          )}
        </AnimatePresence>
        
        <div className="h-20" />
      </div>
    </div>
  );
};
