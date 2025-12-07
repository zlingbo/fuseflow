import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Terminal } from 'lucide-react';
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

// Recursive component to render task chains
const TaskChain: React.FC<{ task: SparkNode; allTasks: SparkNode[]; depth?: number }> = ({ task, allTasks, depth = 0 }) => {
  const children = allTasks
    .filter(t => t.parentId === task.id && t.status !== 'frozen')
    .sort((a, b) => a.createdAt - b.createdAt);

  return (
    <div className="flex flex-col gap-4 group">
      <SparkCard task={task} isChild={depth > 0} />
      
      {children.length > 0 && (
        <div className="pl-6 ml-3 border-l-2 border-transparent border-dotted group-hover:border-retro-dim transition-colors duration-300 flex flex-col gap-4">
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
    <div className="h-full flex flex-col bg-retro-bg relative overflow-hidden font-mono">
      {/* Background Grid */}
      <div className="absolute inset-0 z-0 opacity-10 pointer-events-none" 
           style={{ backgroundImage: 'linear-gradient(#333 1px, transparent 1px), linear-gradient(90deg, #333 1px, transparent 1px)', backgroundSize: '20px 20px' }}>
      </div>

      {/* Header / CLI Input */}
      <div className="p-6 pb-4 z-40 bg-retro-bg border-b-2 border-retro-surface sticky top-0">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-retro-amber text-xs font-bold uppercase tracking-widest flex items-center gap-2">
            <Terminal size={14} />
            EXECUTION_LOG
            <span className="w-2 h-2 bg-retro-amber rounded-full animate-blink ml-2" />
          </h2>
          <span className="text-[10px] text-retro-dim">SYS.READY</span>
        </div>
        
        <form onSubmit={handleMainSubmit} className="relative group">
          <div className="flex items-center bg-black border-2 border-retro-dim group-focus-within:border-retro-amber transition-colors p-3 shadow-hard-sm">
            <span className="text-retro-amber mr-2 font-bold">&gt;_</span>
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="INITIATE_TASK..."
              className="w-full bg-transparent text-retro-amber placeholder-retro-dim focus:outline-none font-mono uppercase"
              autoComplete="off"
            />
          </div>
          <button
            type="submit"
            className="hidden" // Enter key only
            disabled={!inputValue.trim()}
          />
        </form>
      </div>

      {/* Task Stream */}
      <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6 relative z-10">
        <AnimatePresence mode='popLayout'>
          {rootTasks.map((task) => (
             <TaskChain key={task.id} task={task} allTasks={tasks} />
          ))}
          
          {rootTasks.length === 0 && (
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }}
              className="h-full flex flex-col items-center justify-center text-retro-dim gap-4 opacity-50"
            >
              <div className="w-16 h-16 border-2 border-dashed border-retro-dim flex items-center justify-center">
                <span className="animate-pulse">_</span>
              </div>
              <p className="text-xs">NO_ACTIVE_PROCESSES</p>
            </motion.div>
          )}
        </AnimatePresence>
        
        <div className="h-20" />
      </div>
    </div>
  );
};
