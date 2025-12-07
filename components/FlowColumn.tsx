import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Zap, SendHorizontal } from 'lucide-react';
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
  const { tasks, addTask, activePopoverId, isMobileInputOpen, setMobileInputOpen } = useSparkStore();
  const [inputValue, setInputValue] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

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

      // 1. Inactive/Completed chains go to TOP (return -1)
      // 2. Active chains go to BOTTOM (return 1)
      if (aActive && !bActive) return 1;
      if (!aActive && bActive) return -1;

      const aTime = a.completedAt ?? a.createdAt;
      const bTime = b.completedAt ?? b.createdAt;

      // 3. Within groups, sort by Time ASC (Oldest -> Newest)
      // This creates a timeline effect where the newest active task is at the very bottom
      return aTime - bTime;
    });

  // Auto-scroll to bottom when tasks change
  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [tasks.length, rootTasks.length]);

  const handleMainSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim()) {
      addTask(inputValue, null);
      setInputValue('');
      setMobileInputOpen(false); // Close mobile input on submit
    }
  };

  return (
    <div className="h-full flex flex-col bg-slate-50 relative overflow-hidden">
      {/* Global Backdrop for Popovers */}
      {activePopoverId && (
        <div className="fixed inset-0 z-45 bg-transparent" />
      )}

      {/* Header */}
      <div className="p-6 bg-slate-50 z-40 sticky top-0 border-transparent">
         <h2 className="text-indigo-600 font-bold uppercase tracking-wider text-xs flex items-center gap-2">
           <Zap size={14} />
           THE FLOW
         </h2>
      </div>

      {/* Task Stream */}
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4 relative z-10 scroll-smooth pb-24 md:pb-4">
        <AnimatePresence mode='popLayout'>
          {rootTasks.map((task) => (
             <TaskChain key={task.id} task={task} allTasks={tasks} />
          ))}
        </AnimatePresence>
        
        {/* Invisible element to scroll to */}
        <div ref={bottomRef} className="h-4" /> 
      </div>

      {/* Desktop Input Area (Hidden on Mobile) */}
      <div className="hidden md:block px-6 pt-2 pb-6 z-30 bg-slate-50 border-t border-transparent">
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

      {/* Mobile Floating Action Button (FAB) */}
      <AnimatePresence>
        {!isMobileInputOpen && (
          <motion.button
            initial={{ scale: 0, rotate: 45 }}
            animate={{ scale: 1, rotate: 0 }}
            exit={{ scale: 0, rotate: 45 }}
            onClick={() => setMobileInputOpen(true)}
            className="md:hidden absolute bottom-6 right-6 z-40 w-14 h-14 bg-indigo-600 text-white rounded-full shadow-lg shadow-indigo-600/30 flex items-center justify-center hover:bg-indigo-700 active:scale-95 transition-all"
          >
            <Plus size={28} />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Mobile Input Overlay */}
      <AnimatePresence>
        {isMobileInputOpen && (
          <>
            {/* Backdrop - Higher Z-Index to cover tabs */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileInputOpen(false)}
              className="md:hidden fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-[55]"
            />
            
            {/* Input Modal - Highest Z-Index to cover tabs */}
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="md:hidden fixed bottom-0 left-0 right-0 z-[60] px-4 pt-0"
              style={{ paddingBottom: 'max(16px, env(safe-area-inset-bottom))' }} 
            >
              <form onSubmit={handleMainSubmit} className="flex gap-2 items-center bg-white p-2 rounded-2xl shadow-xl">
                <input
                  ref={inputRef}
                  autoFocus
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="What needs to happen now?"
                  className="flex-1 bg-transparent text-slate-800 placeholder-slate-400 px-3 py-3 rounded-xl focus:outline-none"
                />
                <button 
                  type="submit" 
                  disabled={!inputValue.trim()}
                  className="bg-indigo-600 text-white p-3 rounded-xl disabled:opacity-50 disabled:grayscale transition-all active:scale-95 flex-shrink-0"
                >
                  <SendHorizontal size={24} />
                </button>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};