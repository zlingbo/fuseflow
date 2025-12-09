import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Zap, SendHorizontal, Radio } from 'lucide-react';
import { useSparkStore } from '../store/useSparkStore';
import { SparkCard } from './SparkCard';
import { SparkNode } from '../types';

const isChainActive = (taskId: string, allTasks: SparkNode[]): boolean => {
  const task = allTasks.find(t => t.id === taskId);
  if (!task || task.status === 'frozen') return false;
  if (task.status === 'active') return true;
  return allTasks.some(t => t.parentId === taskId && isChainActive(t.id, allTasks));
};

const isChainBoosted = (taskId: string, allTasks: SparkNode[], activePopoverId: string | null): boolean => {
  if (!activePopoverId) return false;
  if (taskId === activePopoverId) return true;
  return allTasks.some(t => t.parentId === taskId && isChainBoosted(t.id, allTasks, activePopoverId));
};

const TaskChain: React.FC<{ task: SparkNode; allTasks: SparkNode[]; depth?: number }> = ({ task, allTasks, depth = 0 }) => {
  const { activePopoverId } = useSparkStore();
  const children = allTasks.filter(t => t.parentId === task.id && t.status !== 'frozen').sort((a, b) => a.createdAt - b.createdAt);
  const shouldBoost = isChainBoosted(task.id, allTasks, activePopoverId);

  return (
    <motion.div 
      // Mechanical Transition: No spring, purely linear/mechanical
      layout transition={{ type: "tween", duration: 0.15, ease: "circOut" }}
      className="flex flex-col gap-2 group"
      style={{ zIndex: shouldBoost ? 50 : 'auto', position: 'relative' }}
    >
      <SparkCard task={task} isChild={depth > 0} />
      {children.length > 0 && (
        <motion.div layout initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="pl-6 ml-2 border-l-2 border-gray-800 flex flex-col gap-2">
          <AnimatePresence mode="popLayout" initial={false}>
            {children.map(child => <TaskChain key={child.id} task={child} allTasks={allTasks} depth={depth + 1} />)}
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
    .filter(t => { if (!t.parentId) return true; const parent = tasks.find(p => p.id === t.parentId); return !parent || parent.status === 'frozen'; })
    .sort((a, b) => {
      const aActive = isChainActive(a.id, tasks);
      const bActive = isChainActive(b.id, tasks);
      if (aActive && !bActive) return 1;
      if (!aActive && bActive) return -1;
      return (a.completedAt ?? a.createdAt) - (b.completedAt ?? b.createdAt);
    });

  useEffect(() => { if (bottomRef.current) bottomRef.current.scrollIntoView({ behavior: 'smooth' }); }, [tasks.length, rootTasks.length]);

  const handleMainSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim()) {
      addTask(inputValue, null);
      setInputValue('');
      setMobileInputOpen(false);
    }
  };

  return (
    <div className="h-full flex flex-col bg-retro-bg relative overflow-hidden">
      {activePopoverId && <div className="fixed inset-0 z-45 bg-transparent" />}

      {/* Header - Fixed Flex Item */}
      <div className="flex-none p-4 bg-retro-bg z-40 border-b-2 border-retro-surface flex justify-between items-center sticky top-0">
         <h2 className="text-retro-amber font-bold text-sm tracking-widest flex items-center gap-2 text-glow">
           <Zap size={16} />
           &gt;_ EXECUTION_LOG
         </h2>
         <div className="flex gap-1">
           <div className="w-1 h-1 bg-retro-amber rounded-full animate-pulse"></div>
           <div className="w-1 h-1 bg-retro-amber rounded-full animate-pulse delay-75"></div>
           <div className="w-1 h-1 bg-retro-amber rounded-full animate-pulse delay-150"></div>
         </div>
      </div>

      {/* Task Stream - Scrollable Flex Item */}
      <div className="flex-1 min-h-0 overflow-y-auto px-4 py-4 space-y-4 relative z-10 pb-24 md:pb-4 scroll-smooth">
        <AnimatePresence mode='popLayout'>
          {rootTasks.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} 
              className="flex flex-col items-center justify-center h-64 text-retro-dim/30 space-y-4"
            >
               {/* Radar Animation */}
               <div className="relative w-24 h-24 border border-retro-dim/30 rounded-full flex items-center justify-center overflow-hidden">
                  <div className="absolute inset-0 border border-retro-dim/20 rounded-full scale-50" />
                  <div className="w-full h-1/2 bg-gradient-to-t from-retro-amber/10 to-transparent absolute top-0 origin-bottom animate-[spin_3s_linear_infinite]" />
               </div>
               <div className="text-center font-mono">
                  <p className="text-sm font-bold tracking-widest">NO_TASKS_DETECTED</p>
                  <p className="text-[10px] mt-1">WAITING_FOR_INPUT...</p>
               </div>
            </motion.div>
          ) : (
            rootTasks.map((task) => <TaskChain key={task.id} task={task} allTasks={tasks} />)
          )}
        </AnimatePresence>
        <div ref={bottomRef} className="h-4" /> 
      </div>

      {/* Desktop Input - CLI Style */}
      <div className="hidden md:block px-4 pt-2 pb-4 z-30 bg-retro-bg border-t-2 border-retro-surface flex-none">
        <form onSubmit={handleMainSubmit} className="flex gap-2 items-center bg-black border-2 border-retro-amber p-2 shadow-[4px_4px_0_0_#996900] group focus-within:shadow-[4px_4px_0_0_#ffb000] transition-shadow">
          <span className="text-retro-cyan font-bold animate-pulse">&gt;</span>
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="ENTER_COMMAND..."
            className="flex-1 bg-black text-retro-amber placeholder-retro-amber/30 focus:outline-none font-mono"
            autoFocus
          />
          <div className="w-2 h-4 bg-retro-amber animate-pulse-fast" />
        </form>
      </div>

      {/* Mobile FAB - Glowing Energy Button */}
      <AnimatePresence>
        {!isMobileInputOpen && (
          <motion.button
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            whileTap={{ y: 2 }}
            onClick={() => setMobileInputOpen(true)}
            className="md:hidden fixed bottom-24 right-6 z-50 w-12 h-12 bg-retro-amber text-black border-2 border-retro-amber shadow-[0_0_15px_rgba(255,176,0,0.6)] flex items-center justify-center transition-all rounded-2xl hover:shadow-[0_0_25px_rgba(255,176,0,0.8)]"
          >
            <Plus size={24} strokeWidth={3} />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Mobile Input - Overlay */}
      <AnimatePresence>
        {isMobileInputOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setMobileInputOpen(false)} className="md:hidden fixed inset-0 bg-black/80 z-[55]" />
            <motion.div
              initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="md:hidden fixed bottom-0 left-0 right-0 z-[60] px-2"
              style={{ paddingBottom: 'max(24px, env(safe-area-inset-bottom))' }} 
            >
              <form onSubmit={handleMainSubmit} className="flex gap-2 items-stretch w-full">
                <div className="flex-1 flex gap-2 items-center bg-black border-2 border-retro-amber p-3 shadow-[4px_4px_0_0_#996900]">
                   <span className="text-retro-cyan font-bold">&gt;</span>
                   <input
                    ref={inputRef}
                    autoFocus
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder="CMD..."
                    className="flex-1 bg-black text-retro-amber placeholder-gray-600 focus:outline-none font-mono"
                  />
                  <div className="w-2 h-4 bg-retro-amber animate-pulse-fast" />
                </div>
                <button type="submit" disabled={!inputValue.trim()} className="bg-retro-cyan text-black border-2 border-white p-3 shadow-[4px_4px_0_0_#fff] active:translate-y-1 active:shadow-none transition-all disabled:opacity-50">
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