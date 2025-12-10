import React, { useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wind, Database } from 'lucide-react';
import { useSparkStore } from '../store/useSparkStore';
import { playDeleteSound } from '../utils';

export const FreezerColumn: React.FC<{ isActive?: boolean }> = ({ isActive = true }) => {
  const { tasks, unfreezeTask, deleteTask } = useSparkStore();
  const frozenTasks = tasks.filter((t) => t.status === 'frozen');
  const touchRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const swipeBlockRef = useRef<string | null>(null); // prevent click after swipe
  const [swipeId, setSwipeId] = useState<string | null>(null);
  const [swipeX, setSwipeX] = useState(0);

  const handleTouchStart = (e: React.TouchEvent) => {
    const t = e.touches[0];
    touchRef.current = { x: t.clientX, y: t.clientY };
    setSwipeX(0);
  };

  const handleTouchMove = (taskId: string, e: React.TouchEvent) => {
    if (swipeId && swipeId !== taskId) return;
    const t = e.touches[0];
    const dx = t.clientX - touchRef.current.x;
    const dy = t.clientY - touchRef.current.y;
    if (Math.abs(dx) < Math.abs(dy) * 1.2) return; // vertical scroll dominates
    setSwipeId(taskId);
    setSwipeX(Math.max(-140, Math.min(0, dx)));
  };

  const handleTouchEnd = (taskId: string, e: React.TouchEvent) => {
    const t = e.changedTouches[0];
    const dx = t.clientX - touchRef.current.x;
    const dy = t.clientY - touchRef.current.y;

    // Only delete on clear left swipe, avoid accidental vertical scroll
    const horizontalDominant = Math.abs(dx) > Math.abs(dy) * 1.2;
    if (horizontalDominant && dx <= -64) {
      playDeleteSound();
      deleteTask(taskId);
    }
    setSwipeId(null);
    setSwipeX(0);
    if (horizontalDominant && Math.abs(dx) > 24) {
      swipeBlockRef.current = taskId;
      setTimeout(() => {
        if (swipeBlockRef.current === taskId) swipeBlockRef.current = null;
      }, 250);
    }
  };

  const handleCardClick = (taskId: string) => {
    // Skip click action if a swipe gesture just occurred
    if (swipeBlockRef.current === taskId) return;
    unfreezeTask(taskId);
  };

  // Desktop swipe with mouse drag
  const handleMouseDown = (taskId: string, e: React.MouseEvent) => {
    touchRef.current = { x: e.clientX, y: e.clientY };
    setSwipeX(0);
    // do not set swipeId yet; wait for horizontal movement
  };

  const handleMouseMove = (taskId: string, e: React.MouseEvent) => {
    if (swipeId && swipeId !== taskId) return;
    if (e.buttons !== 1) return; // only when dragging with primary button
    const dx = e.clientX - touchRef.current.x;
    const dy = e.clientY - touchRef.current.y;
    if (Math.abs(dx) < Math.abs(dy) * 1.2) return;
    setSwipeId(taskId);
    setSwipeX(Math.max(-140, Math.min(0, dx)));
  };

  const handleMouseUp = (taskId: string, e: React.MouseEvent) => {
    const dx = e.clientX - touchRef.current.x;
    const dy = e.clientY - touchRef.current.y;
    const horizontalDominant = Math.abs(dx) > Math.abs(dy) * 1.2;
    if (horizontalDominant && dx <= -64) {
      playDeleteSound();
      deleteTask(taskId);
    }
    setSwipeId(null);
    setSwipeX(0);
    if (horizontalDominant && Math.abs(dx) > 24) {
      swipeBlockRef.current = taskId;
      setTimeout(() => {
        if (swipeBlockRef.current === taskId) swipeBlockRef.current = null;
      }, 250);
    }
  };

  return (
    <div className="h-full bg-retro-bg flex flex-col border-r-2 border-retro-surface">
      <div className="p-4 bg-retro-bg border-b-2 border-retro-surface pt-[calc(env(safe-area-inset-top)+10px)] sticky top-[env(safe-area-inset-top)] z-10">
        <h2 className="text-retro-cyan font-bold tracking-widest text-sm flex items-center gap-2 text-glow-cyan">
          <Database size={16} />
          // COLD_STORAGE
        </h2>
        <p className="text-gray-600 text-[10px] mt-1 font-mono uppercase">Status: Frozen Tasks</p>
      </div>

      <div className="flex-1 overflow-y-auto px-4 pb-24 md:pb-10 space-y-3 pt-4 no-scrollbar pb-[calc(24px+env(safe-area-inset-bottom))]">
        <AnimatePresence>
          {frozenTasks.length === 0 ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center h-48 text-gray-700 gap-3 font-mono">
              <span className="text-4xl opacity-20">[ ]</span>
              <span className="text-xs">[EMPTY_SECTOR]</span>
            </motion.div>
          ) : (
            frozenTasks.map((task) => {
              const progress = task.id === swipeId ? Math.min(Math.abs(swipeX) / 120, 1) : 0;
              return (
                <motion.div
                  layout={isActive}
                  transition={isActive ? { layout: { type: "spring", damping: 25, stiffness: 300 } } : { layout: { duration: 0 } }}
                  key={task.id}
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="group relative p-3 border-2 border-retro-cyan/60 bg-[#071018] overflow-hidden cursor-pointer font-mono shadow-[0_0_12px_rgba(0,255,255,0.2)] hover:shadow-[0_0_18px_rgba(0,255,255,0.35)] transition-all touch-pan-y"
                  onClick={() => handleCardClick(task.id)}
                  onTouchStart={handleTouchStart}
                  onTouchMove={(e) => handleTouchMove(task.id, e)}
                  onTouchEnd={(e) => handleTouchEnd(task.id, e)}
                  onMouseDown={(e) => handleMouseDown(task.id, e)}
                  onMouseMove={(e) => handleMouseMove(task.id, e)}
                  onMouseUp={(e) => handleMouseUp(task.id, e)}
                  style={{
                    transform: task.id === swipeId ? `translateX(${swipeX}px)` : undefined,
                    transition: swipeId === task.id ? 'transform 0s' : 'transform 0.2s ease-out',
                  }}
                >
                  {/* Drag feedback layer (delete) */}
                  <div
                    className="pointer-events-none absolute inset-0 bg-gradient-to-r from-transparent via-[#1a0a0a] to-[#2b0c0c]"
                    style={{
                      opacity: progress > 0 ? progress : 0,
                    }}
                  />
                  <div
                    className="pointer-events-none absolute inset-y-0 right-0 w-16 flex items-center justify-center text-[10px] font-bold tracking-[0.12em] text-retro-red"
                    style={{
                      opacity: progress,
                      transform: `translateX(${Math.min(0, swipeX + 80)}px)`,
                    }}
                  >
                    DELETE
                  </div>

                  {/* Glow layers for frozen effect */}
                  <div className="pointer-events-none absolute inset-[-8px] bg-[radial-gradient(circle_at_20%_20%,rgba(0,255,255,0.12),transparent_35%),radial-gradient(circle_at_80%_30%,rgba(0,186,255,0.16),transparent_40%),radial-gradient(circle_at_50%_90%,rgba(0,255,213,0.12),transparent_45%)] opacity-80 blur-[2px]" />
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-cyan-400/8 via-transparent to-cyan-300/5 mix-blend-screen" />

                  <div className="flex justify-between items-start gap-2 relative z-10">
                    <p className="text-xs text-retro-cyan truncate w-full font-bold drop-shadow-[0_0_6px_rgba(0,255,255,0.35)]">
                      {task.content}
                    </p>
                  </div>

                  <div className="mt-2 flex justify-between items-end border-t border-cyan-900/50 pt-2 text-[9px] relative z-10">
                     <span className="text-gray-500">ID: {task.id.slice(0,4)}</span>
                     <span className="px-1 text-cyan-200 bg-cyan-900/40 border border-cyan-500/40 rounded-sm tracking-[0.08em]">
                      FROZEN
                     </span>
                  </div>
                </motion.div>
              );
            })
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
