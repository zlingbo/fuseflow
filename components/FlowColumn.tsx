import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence, MotionConfig } from 'framer-motion';
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

const TaskChain: React.FC<{ task: SparkNode; allTasks: SparkNode[]; depth?: number; isActive?: boolean; justActivated?: boolean }> = ({
  task,
  allTasks,
  depth = 0,
  isActive = true,
  justActivated = false,
}) => {
  const { activePopoverId } = useSparkStore();
  const children = allTasks.filter(t => t.parentId === task.id && t.status !== 'frozen').sort((a, b) => a.createdAt - b.createdAt);
  const shouldBoost = isChainBoosted(task.id, allTasks, activePopoverId);
  const layoutEnabled = isActive && !justActivated;
  const layoutProps = layoutEnabled
    ? { layout: "position" as const, transition: { layout: { type: "spring", damping: 25, stiffness: 300 } } }
    : { layout: false as const, transition: { layout: { duration: 0 } } };

  return (
    <motion.div
      {...layoutProps}
      className="flex flex-col gap-2 group"
      style={{ zIndex: shouldBoost ? 50 : 'auto', position: 'relative' }}
    >
      <SparkCard task={task} isChild={depth > 0} layoutActive={layoutEnabled} />
      {children.length > 0 && (
        <motion.div
          {...layoutProps}
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="pl-6 ml-2 border-l-2 border-gray-800 flex flex-col gap-2"
        >
          <AnimatePresence mode="popLayout" initial={false}>
            {children.map(child => (
              <TaskChain
                key={child.id}
                task={child}
                allTasks={allTasks}
                depth={depth + 1}
                isActive={isActive}
                justActivated={justActivated}
              />
            ))}
          </AnimatePresence>
        </motion.div>
      )}
    </motion.div>
  );
};

export const FlowColumn: React.FC<{ isActive?: boolean }> = ({ isActive = true }) => {
  const { tasks, addTask, archiveCompleted, activePopoverId, isMobileInputOpen, setMobileInputOpen } = useSparkStore();
  const [inputValue, setInputValue] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const prevActiveRef = useRef(isActive);
  const justActivated = isActive && !prevActiveRef.current;
  useEffect(() => {
    prevActiveRef.current = isActive;
  }, [isActive]);

  const visibleTasks = tasks.filter(t => !t.archived);

  const rootTasks = visibleTasks
    .filter(t => t.status !== 'frozen')
    .filter(t => { if (!t.parentId) return true; const parent = visibleTasks.find(p => p.id === t.parentId); return !parent || parent.status === 'frozen'; })
    .sort((a, b) => {
      const aActive = isChainActive(a.id, visibleTasks);
      const bActive = isChainActive(b.id, visibleTasks);
      if (aActive && !bActive) return 1;
      if (!aActive && bActive) return -1;
      return (a.completedAt ?? a.createdAt) - (b.completedAt ?? b.createdAt);
    });

  useEffect(() => { if (bottomRef.current) bottomRef.current.scrollIntoView({ behavior: 'smooth' }); }, [visibleTasks.length, rootTasks.length]);

  const handleMainSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim()) {
      addTask(inputValue, null);
      setInputValue('');
      setMobileInputOpen(false);
    }
  };

  return (
    <MotionConfig transition={justActivated ? { duration: 0 } : undefined}>
      <div className="h-full flex flex-col bg-retro-bg relative overflow-hidden">
        {activePopoverId && <div className="fixed inset-0 z-45 bg-transparent" />}

        {/* Header - Fixed Flex Item */}
        <div className="flex-none p-4 bg-retro-bg z-40 border-b-2 border-retro-surface flex justify-between items-center sticky top-[env(safe-area-inset-top)] pt-[env(safe-area-inset-top)]">
          <h2 className="text-retro-amber font-bold text-sm tracking-widest flex items-center gap-2 text-glow">
            <Zap size={16} />
            &gt;_ EXECUTION_LOG
          </h2>
          <div className="flex items-center gap-3">
            <motion.button
              type="button"
              whileTap={{ scale: 0.92 }}
              onClick={archiveCompleted}
              className="text-xs md:text-[10px] uppercase tracking-widest text-retro-amber transition-colors border border-retro-amber/50 px-3 py-2 md:px-2 md:py-1 rounded md:rounded-sm active:bg-zinc-800 focus-visible:outline-none focus-visible:ring-0"
              title="Archive completed tasks (kept for dump)"
            >
              ARCHIVE
            </motion.button>
            <div className="flex gap-1">
              <div className="w-1 h-1 bg-retro-amber rounded-full animate-pulse"></div>
              <div className="w-1 h-1 bg-retro-amber rounded-full animate-pulse delay-75"></div>
              <div className="w-1 h-1 bg-retro-amber rounded-full animate-pulse delay-150"></div>
            </div>
          </div>
        </div>

        {/* Task Stream - Scrollable Flex Item */}
        <div className="flex-1 min-h-0 overflow-y-auto px-4 py-4 space-y-4 relative z-10 pb-[calc(170px+env(safe-area-inset-bottom))] md:pb-4 scroll-smooth no-scrollbar">
          <AnimatePresence mode='popLayout' initial={false}>
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
              rootTasks.map((task) => (
                <TaskChain
                  key={task.id}
                  task={task}
                  allTasks={visibleTasks}
                  isActive={isActive}
                  justActivated={justActivated}
                />
              ))
            )}
          </AnimatePresence>
          <div ref={bottomRef} className="h-4" />
        </div>

        {/* Desktop Input - CLI Style */}
        <div className="hidden md:block px-4 pt-2 pb-4 z-30 bg-retro-bg border-t-2 border-retro-surface flex-none">
          <form
            onSubmit={handleMainSubmit}
            className="flex gap-2 items-center bg-black border-2 border-retro-amber p-2 shadow-[4px_4px_0_0_#996900] group transition-shadow focus-within:border-amber-500/50 focus-within:shadow-[4px_4px_0_0_#ffb000,0_0_15px_rgba(245,158,11,0.1)]"
          >
            <span className="text-retro-cyan font-bold animate-pulse">&gt;</span>
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="ENTER_COMMAND..."
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="sentences"
            className="flex-1 bg-black text-retro-amber placeholder-retro-amber/30 focus:outline-none font-mono select-text text-base"
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
              whileTap={{ scale: 0.92 }}
              onClick={() => setMobileInputOpen(true)}
              className="md:hidden fixed right-5 z-50 w-14 h-14 bg-retro-amber text-black border-2 border-retro-amber shadow-[0_0_15px_rgba(255,176,0,0.6)] flex items-center justify-center transition-all rounded-3xl hover:shadow-[0_0_25px_rgba(255,176,0,0.8)] active:bg-zinc-800"
              style={{ bottom: 'calc(108px + env(safe-area-inset-bottom))' }}
              aria-label="创建新任务"
            >
              <Plus size={26} strokeWidth={3} />
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
                className="md:hidden fixed bottom-0 left-0 right-0 z-[60] px-3"
                style={{ paddingBottom: 'max(28px, env(safe-area-inset-bottom))' }}
              >
                <form onSubmit={handleMainSubmit} className="flex gap-3 items-stretch w-full">
                  <div className="flex-1 flex gap-2 items-center bg-black border-2 border-retro-amber p-3.5 shadow-[4px_4px_0_0_#996900] rounded-xl transition-shadow focus-within:border-amber-500/50 focus-within:shadow-[4px_4px_0_0_#996900,0_0_15px_rgba(245,158,11,0.1)]">
                    <span className="text-retro-cyan font-bold">&gt;</span>
                    <input
                      ref={inputRef}
                      autoFocus
                      type="text"
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      placeholder="WHAT NEED TO HAPPEN NOW?"
                      autoComplete="off"
                      autoCorrect="off"
                      autoCapitalize="sentences"
                      className="flex-1 bg-black text-retro-amber placeholder-gray-600 focus:outline-none font-mono text-base select-text"
                    />
                    <div className="w-2 h-4 bg-retro-amber animate-pulse-fast" />
                  </div>
                  <motion.button
                    whileTap={{ scale: 0.92 }}
                    type="submit"
                    disabled={!inputValue.trim()}
                    className="bg-retro-cyan text-black border-2 border-white px-4 min-w-[58px] shadow-[4px_4px_0_0_#fff] active:translate-y-1 active:shadow-none transition-all disabled:opacity-50 rounded-xl flex items-center justify-center active:bg-zinc-800"
                    aria-label="提交任务"
                  >
                    <SendHorizontal size={24} />
                  </motion.button>
                </form>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </MotionConfig>
  );
};