import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion';
import { Trash2, Check, CornerDownRight, Grab, MessageSquare, Hammer, Snowflake } from 'lucide-react';
import confetti from 'canvas-confetti';
import { SparkNode, TaskFeeling } from '../types';
import { useSparkStore } from '../store/useSparkStore';
import { cn, playSuccessSound, playFreezeSound, playSplitSound, formatDuration } from '../utils';

interface SparkCardProps {
  task: SparkNode;
  isChild?: boolean;
}

const springTransition = {
  type: "spring",
  stiffness: 300, // Softer stiffness to reduce jumpiness
  damping: 30,
} as const;

export const SparkCard: React.FC<SparkCardProps> = ({ task, isChild = false }) => {
  const { 
    completeTask, 
    freezeTask, 
    deleteTask, 
    addTask, 
    updateTaskReflection, 
    splitTask, 
    updateTaskContent, 
    updateTaskFeeling,
    activePopoverId,
    setActivePopoverId
  } = useSparkStore();

  const [showNextInput, setShowNextInput] = useState(false);
  const [nextInputVal, setNextInputVal] = useState('');
  
  // Reflection state
  const [isEditingReflection, setIsEditingReflection] = useState(false);
  const [reflectionVal, setReflectionVal] = useState(task.reflection || '');
  
  // Content Edit state
  const [isEditingContent, setIsEditingContent] = useState(task.content === '');
  const [contentVal, setContentVal] = useState(task.content);

  // Derived state for popover
  const showFeelingSelector = activePopoverId === task.id;

  const inputRef = useRef<HTMLInputElement>(null);
  const reflectionInputRef = useRef<HTMLTextAreaElement>(null);
  const contentInputRef = useRef<HTMLInputElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);

  const isNew = useRef(Date.now() - task.createdAt < 1000).current;

  // Drag logic
  const x = useMotionValue(0);
  const opacity = useTransform(x, [-200, -100, 0], [0, 1, 1]);
  const freezeIndicatorOpacity = useTransform(x, [-150, -50], [1, 0]);
  
  const isCompleted = task.status === 'completed';

  useEffect(() => {
    if (showNextInput && inputRef.current) {
      inputRef.current.focus();
    }
  }, [showNextInput]);

  useEffect(() => {
    if (isEditingReflection && reflectionInputRef.current) {
        reflectionInputRef.current.focus();
    }
  }, [isEditingReflection]);

  useEffect(() => {
    if (isEditingContent && contentInputRef.current) {
      contentInputRef.current.focus();
    }
  }, [isEditingContent]);

  // Handle click outside to close popover
  useEffect(() => {
    if (showFeelingSelector) {
      const handleClickOutside = (event: MouseEvent) => {
        if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
          setActivePopoverId(null);
        }
      };
      
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showFeelingSelector, setActivePopoverId]);

  const triggerConfetti = (rect: DOMRect) => {
    const x = (rect.left + rect.width / 2) / window.innerWidth;
    const y = (rect.top + rect.height / 2) / window.innerHeight;

    confetti({
      particleCount: 100,
      spread: 70,
      origin: { x, y },
      colors: ['#6366f1', '#ec4899', '#f59e0b'],
      disableForReducedMotion: true,
      zIndex: 100,
    });
  };

  const triggerShatter = (rect: DOMRect) => {
    const x = (rect.left + rect.width / 2) / window.innerWidth;
    const y = (rect.top + rect.height / 2) / window.innerHeight;

    confetti({
      particleCount: 15,
      spread: 40,
      origin: { x, y },
      colors: ['#94a3b8', '#cbd5e1'], // Slate dust
      shapes: ['square'],
      gravity: 4.0,
      scalar: 0.5,
      startVelocity: 15,
      ticks: 50,
      disableForReducedMotion: true,
      zIndex: 100,
    });
  };

  const handleComplete = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!isCompleted) {
      const rect = e.currentTarget.getBoundingClientRect();
      triggerConfetti(rect);
      playSuccessSound();
      
      completeTask(task.id, '🙂');
      setShowNextInput(true);
    }
  };

  const handleNextInputSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (nextInputVal.trim()) {
      addTask(nextInputVal, task.id);
      setNextInputVal('');
      setShowNextInput(false);
    }
  };

  const handleReflectionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateTaskReflection(task.id, reflectionVal);
    setIsEditingReflection(false);
  };
  
  const handleContentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (contentVal.trim()) {
      updateTaskContent(task.id, contentVal);
      setIsEditingContent(false);
    } else {
      if (!task.content) {
        deleteTask(task.id);
      } else {
        setContentVal(task.content);
        setIsEditingContent(false);
      }
    }
  };

  const handleDragEnd = (event: any, info: any) => {
    if (info.offset.x < -100 && !isCompleted) {
      playFreezeSound();
      freezeTask(task.id);
    }
  };

  const handleSplit = (e: React.MouseEvent<HTMLButtonElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    triggerShatter(rect);
    playSplitSound();
    splitTask(task.id);
  };

  return (
    <>
      <div className="relative group">
        {/* Freeze Indicator (Behind the card) */}
        <motion.div 
          style={{ opacity: freezeIndicatorOpacity }}
          className="absolute right-full top-0 bottom-0 pr-4 flex items-center justify-end pointer-events-none z-0"
        >
          <span className="text-cyan-500 font-bold text-sm tracking-wider">Release to Freeze</span>
        </motion.div>

        <motion.div
          layout
          initial={isNew ? { opacity: 0, scale: 0.95 } : false}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
          transition={springTransition}
          style={{ x, opacity }}
          drag={!isCompleted ? "x" : false}
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={{ left: 0.5, right: 0.1 }}
          onDragEnd={handleDragEnd}
          className={cn(
            "relative z-10 p-4 rounded-2xl touch-pan-y",
            isCompleted
              ? "bg-slate-50 border border-slate-100 text-slate-400"
              : "bg-white border border-transparent text-slate-700 shadow-sm hover:shadow-md hover:border-indigo-100"
          )}
        >
          {/* Connector Line (Curved) */}
          {isChild && (
            <div 
              className="absolute -left-5 top-0 w-5 h-8 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            >
              <div className="absolute inset-0 border-b-2 border-l-2 border-slate-200 rounded-bl-xl -translate-y-1/2" />
            </div>
          )}

          <div className="flex items-start gap-3">
            {/* Checkbox */}
            <button
              onClick={handleComplete}
              disabled={isCompleted}
              className={cn(
                "mt-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all flex-shrink-0",
                isCompleted
                  ? "bg-indigo-100 border-indigo-100 text-indigo-500"
                  : "border-slate-300 hover:border-indigo-400 text-transparent"
              )}
            >
              <Check size={12} strokeWidth={3} />
            </button>

            {/* Content Wrapper */}
            <div className="flex-1 min-w-0">
              {isEditingContent ? (
                <form onSubmit={handleContentSubmit}>
                  <input
                    ref={contentInputRef}
                    value={contentVal}
                    onChange={(e) => setContentVal(e.target.value)}
                    onBlur={handleContentSubmit}
                    className="w-full text-base bg-transparent text-indigo-700 border-b-2 border-indigo-100 focus:border-indigo-500 focus:outline-none px-1 -ml-1 transition-colors"
                    placeholder="Type a step..."
                  />
                </form>
              ) : (
                <p 
                  onClick={() => !isCompleted && setIsEditingContent(true)}
                  className={cn(
                    "text-base leading-relaxed break-words cursor-text",
                    isCompleted && "line-through opacity-80"
                  )}
                >
                  {task.content}
                </p>
              )}
              
              {/* Metadata */}
              <div className="mt-1 flex items-center gap-2 text-xs text-slate-400 select-none flex-wrap">
                <span title="Created">{new Date(task.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                
                {isCompleted && task.completedAt && (
                  <>
                    <span className="text-slate-300">→</span>
                    <span title="Finished">{new Date(task.completedAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                    <span className="bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded text-[10px] font-medium" title="Duration">
                      {formatDuration(task.completedAt - task.createdAt)}
                    </span>
                  </>
                )}

                {isCompleted && (
                  <div className="relative inline-block ml-1">
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        setActivePopoverId(showFeelingSelector ? null : task.id);
                      }}
                      className="p-0.5 rounded hover:bg-slate-100 transition-colors opacity-70 hover:opacity-100 grayscale hover:grayscale-0"
                      title="Change feeling"
                    >
                        {task.feeling || '🙂'}
                    </button>
                    
                    {/* Popover Menu */}
                    <AnimatePresence>
                      {showFeelingSelector && (
                        <motion.div 
                          ref={popoverRef}
                          initial={{ opacity: 0, scale: 0.95, y: -5 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.95, y: -5 }}
                          transition={{ duration: 0.1 }}
                          className="absolute top-full left-0 mt-1 bg-white shadow-xl border border-slate-100 rounded-lg p-1 flex gap-1 z-50 min-w-max"
                        >
                          {(['😐', '🙂', '🤩'] as TaskFeeling[]).map((f) => (
                            <button
                              key={f}
                              onClick={(e) => {
                                e.stopPropagation();
                                updateTaskFeeling(task.id, f);
                                setActivePopoverId(null);
                              }}
                              className={cn(
                                "p-1.5 rounded-md hover:bg-slate-50 text-base transition-colors",
                                task.feeling === f ? "bg-indigo-50" : ""
                              )}
                            >
                              {f}
                            </button>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )}
              </div>

              {/* Reflection Display */}
              {(task.reflection && !isEditingReflection) && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }} 
                  animate={{ opacity: 1, height: 'auto' }}
                  className="mt-2 relative pl-3"
                >
                  <div className="absolute left-0 top-1 bottom-1 w-0.5 bg-indigo-200 rounded-full" />
                  <p className="text-sm text-slate-500 italic leading-relaxed">
                    {task.reflection}
                  </p>
                </motion.div>
              )}

              {/* Reflection Edit Form */}
              {isEditingReflection && (
                <motion.form
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="mt-2"
                    onSubmit={handleReflectionSubmit}
                >
                  <textarea
                      ref={reflectionInputRef}
                      value={reflectionVal}
                      onChange={(e) => setReflectionVal(e.target.value)}
                      placeholder="How did this make you feel?"
                      className="w-full text-sm bg-slate-50 text-slate-600 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-indigo-100 resize-none min-h-[60px]"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleReflectionSubmit(e);
                        }
                      }}
                  />
                  <div className="flex justify-end gap-2 mt-1">
                    <button 
                      type="button" 
                      onClick={() => setIsEditingReflection(false)}
                      className="text-xs text-slate-400 hover:text-slate-600 px-2 py-1"
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit" 
                      className="text-xs bg-indigo-500 text-white px-3 py-1 rounded-full font-medium hover:bg-indigo-600"
                    >
                      Save
                    </button>
                  </div>
                </motion.form>
              )}
            </div>

            {/* Actions */}
            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
              <button
                onClick={() => setIsEditingReflection(!isEditingReflection)}
                className={cn(
                  "p-1.5 rounded-lg transition-colors",
                  (task.reflection || isEditingReflection) 
                    ? "text-indigo-500 bg-indigo-50" 
                    : "text-slate-300 hover:text-indigo-500 hover:bg-indigo-50"
                )}
              >
                <MessageSquare size={16} />
              </button>

              {!isCompleted ? (
                <>
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={handleSplit}
                    className="p-1.5 text-slate-300 hover:text-amber-500 hover:bg-amber-50 rounded-lg transition-colors"
                    title="Split into smaller steps"
                  >
                    <Hammer size={16} />
                  </motion.button>
                  <button
                    onClick={() => { playFreezeSound(); freezeTask(task.id); }}
                    className="p-1.5 text-slate-300 hover:text-cyan-500 hover:bg-cyan-50 rounded-lg transition-colors"
                    title="Freeze for later"
                  >
                    <Snowflake size={16} />
                  </button>
                  <button
                    onClick={() => deleteTask(task.id)}
                    className="p-1.5 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                  <div className="hidden md:flex p-1.5 text-slate-300 cursor-grab active:cursor-grabbing">
                    <Grab size={16} />
                  </div>
                </>
              ) : (
                <button
                  onClick={() => setShowNextInput(true)}
                  className="p-1.5 text-indigo-400 hover:text-indigo-600 bg-indigo-50 rounded-lg transition-colors"
                  title="Continue chain"
                >
                  <CornerDownRight size={16} />
                </button>
              )}
            </div>
          </div>

          {/* Next Step Input Popup */}
          <AnimatePresence>
            {showNextInput && (
              <motion.form
                initial={{ opacity: 0, height: 0, marginTop: 0 }}
                animate={{ opacity: 1, height: 'auto', marginTop: 12 }}
                exit={{ opacity: 0, height: 0, marginTop: 0 }}
                onSubmit={handleNextInputSubmit}
                className="overflow-hidden"
              >
                <div className="flex items-center gap-2">
                  <div className="w-5 flex justify-center">
                    <CornerDownRight size={14} className="text-indigo-300" />
                  </div>
                  <input
                    ref={inputRef}
                    type="text"
                    value={nextInputVal}
                    onChange={(e) => setNextInputVal(e.target.value)}
                    placeholder="趁热打铁想做什么？"
                    className="flex-1 bg-indigo-50/50 text-sm rounded-lg px-3 py-2 text-indigo-700 placeholder-indigo-300 focus:outline-none focus:ring-1 focus:ring-indigo-200"
                    onBlur={() => !nextInputVal && setShowNextInput(false)}
                  />
                  <button type="submit" className="text-xs font-bold text-indigo-500 hover:text-indigo-700 px-2">
                      GO
                  </button>
                </div>
              </motion.form>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </>
  );
};