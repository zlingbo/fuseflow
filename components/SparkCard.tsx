import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion';
import { Check, Snowflake, Trash2, CornerDownRight, Grab, MessageSquare, Save, X, Hammer } from 'lucide-react';
import confetti from 'canvas-confetti';
import { SparkNode } from '../types';
import { useSparkStore } from '../store/useSparkStore';
import { cn, playSuccessSound, playFreezeSound, playSplitSound, triggerVibration } from '../utils';

interface SparkCardProps {
  task: SparkNode;
  isChild?: boolean;
}

// "Shattering" Snap Effect Physics
export const splitSpring = {
  type: "spring" as const,
  stiffness: 500, // Stiffer for a sharper snap
  damping: 30,    // High damping to stop vibration immediately
  mass: 1
};

export const SparkCard: React.FC<SparkCardProps> = ({ task, isChild = false }) => {
  const { completeTask, freezeTask, deleteTask, addTask, updateTaskReflection, splitTask, updateTaskContent } = useSparkStore();
  const [showNextInput, setShowNextInput] = useState(false);
  const [nextInputVal, setNextInputVal] = useState('');
  
  // Reflection state
  const [isEditingReflection, setIsEditingReflection] = useState(false);
  const [reflectionVal, setReflectionVal] = useState(task.reflection || '');
  
  // Content Edit state (for new split tasks or editing)
  const [isEditingContent, setIsEditingContent] = useState(task.content === '');
  const [contentVal, setContentVal] = useState(task.content);

  const inputRef = useRef<HTMLInputElement>(null);
  const reflectionInputRef = useRef<HTMLTextAreaElement>(null);
  const contentInputRef = useRef<HTMLInputElement>(null);

  // Determine if this task was just created (within the last 1 second)
  // This prevents existing tasks from playing the "birth" animation when they just move positions in the list
  const isNew = useRef(Date.now() - task.createdAt < 1000).current;

  // Drag logic
  const x = useMotionValue(0);
  const opacity = useTransform(x, [-200, -100, 0], [0, 1, 1]);
  const scale = useTransform(x, [-200, -100, 0], [0.8, 0.9, 1]);
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

  const triggerConfetti = (rect: DOMRect) => {
    const x = (rect.left + rect.width / 2) / window.innerWidth;
    const y = (rect.top + rect.height / 2) / window.innerHeight;

    confetti({
      particleCount: 60,
      spread: 80,
      origin: { x, y },
      colors: ['#6366f1', '#a855f7', '#ec4899', '#f59e0b'],
      disableForReducedMotion: true,
      zIndex: 100,
      ticks: 200,
      gravity: 1.2,
      scalar: 0.8,
    });
  };

  const triggerShatter = (rect: DOMRect) => {
    const x = (rect.left + rect.width / 2) / window.innerWidth;
    const y = (rect.top + rect.height / 2) / window.innerHeight;

    confetti({
      particleCount: 25,
      spread: 40, // Very narrow
      origin: { x, y },
      colors: ['#fbbf24', '#94a3b8', '#cbd5e1'], // Amber + Stone greys
      shapes: ['square'],
      gravity: 4.0, // Heavy falling
      scalar: 0.5, // Small pieces
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
    triggerVibration([10]); 
    splitTask(task.id);
  };

  return (
    <div className="relative group">
      {/* Freeze Indicator */}
      <motion.div 
        style={{ opacity: freezeIndicatorOpacity }}
        className="absolute right-full top-0 bottom-0 pr-4 flex items-center justify-end pointer-events-none z-0"
      >
        <div className="flex items-center gap-2 text-sky-400 font-bold text-sm bg-sky-50 px-3 py-1.5 rounded-full border border-sky-100 shadow-sm whitespace-nowrap">
          <Snowflake size={16} />
          Release to Freeze
        </div>
      </motion.div>

      <motion.div
        layoutId={task.id} // Critical for Morphing continuity!
        layout
        transition={{
          layout: splitSpring,
          y: { ...splitSpring, damping: 35 }, 
          scale: splitSpring,
          opacity: { duration: 0.2 },
          borderColor: { duration: 0.3 }
        }}
        style={{ x, opacity, scale }}
        drag={!isCompleted ? "x" : false}
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={{ left: 0.5, right: 0.1 }}
        onDragEnd={handleDragEnd}
        // Conditional Initial: Only animate if it's a NEW task.
        // If it's an existing task moving position, initial={false} allows layoutId to handle smooth sliding.
        initial={isNew ? { 
          opacity: 0, 
          y: 4, // Very subtle pop-up (was 24, then 8, now 4)
          scale: 0.99, // Almost unnoticeable squeeze
          borderColor: "#fbbf24",
          rotate: Math.random() * 0.5 - 0.25
        } : false}
        animate={{ 
          opacity: 1, 
          y: 0, 
          scale: 1, 
          borderColor: isCompleted ? "rgba(241, 245, 249, 1)" : "rgba(226, 232, 240, 0.6)",
          rotate: 0
        }}
        exit={{ opacity: 0, scale: 0.95, filter: "blur(2px)" }}
        className={cn(
          "relative z-10 p-4 rounded-xl border touch-pan-y",
          isCompleted
            ? "bg-slate-50/80 border-slate-100 text-slate-400"
            : "bg-surface text-slate-700 shadow-sm hover:border-primary/40 hover:shadow-soft"
        )}
      >
        {/* Connector Line (Moved Inside for Animation Consistency) */}
        {isChild && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.2, delay: 0.15 }} // Hide during the jump, fade in after
            className="absolute -left-5 top-0 w-5 h-8 pointer-events-none"
          >
            <div className="absolute inset-0 border-b-[2px] border-l-[2px] border-slate-200 rounded-bl-xl -translate-y-1/2" />
            {/* Subtle Glow Layer */}
            <div className="absolute inset-0 border-b-[2px] border-l-[2px] border-indigo-100 rounded-bl-xl -translate-y-1/2 blur-[2px] opacity-70" />
          </motion.div>
        )}

        <div className="flex items-start gap-3">
          {/* Checkbox */}
          <button
            onClick={handleComplete}
            disabled={isCompleted}
            className={cn(
              "mt-1 flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all duration-300",
              isCompleted
                ? "bg-primary border-primary text-white scale-100 ring-4 ring-primary/10"
                : "border-slate-300 hover:border-primary hover:scale-110 active:scale-95"
            )}
          >
            {isCompleted && <Check size={12} strokeWidth={4} />}
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
                  className="w-full text-sm font-medium bg-primary/5 text-slate-800 placeholder-slate-300 leading-relaxed px-1 -ml-1 rounded-t-sm border-b-2 border-primary/30 focus:border-primary focus:outline-none transition-colors"
                  placeholder="Type a smaller step..."
                />
              </form>
            ) : (
              <p 
                onClick={() => !isCompleted && setIsEditingContent(true)}
                className={cn(
                  "text-sm leading-relaxed break-words font-medium transition-all duration-500 select-none cursor-text",
                  isCompleted && "line-through text-slate-400 decoration-slate-300"
                )}
              >
                {task.content}
              </p>
            )}
            
            {/* Metadata / Time */}
             <div className="mt-2 flex items-center gap-2 text-xs text-slate-400/80 select-none">
               <span className="tabular-nums">{new Date(task.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
               {isCompleted && task.feeling && <span>{task.feeling}</span>}
             </div>

             {/* Reflection Display */}
             {(task.reflection && !isEditingReflection) && (
               <motion.div 
                 initial={{ opacity: 0, height: 0 }} 
                 animate={{ opacity: 1, height: 'auto' }}
                 className="mt-3 relative"
               >
                 <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-indigo-200 rounded-full" />
                 <p className="pl-3 text-xs text-slate-500 italic leading-relaxed">
                   "{task.reflection}"
                 </p>
               </motion.div>
             )}

             {/* Reflection Edit Form */}
             {isEditingReflection && (
               <motion.form
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="mt-3"
                  onSubmit={handleReflectionSubmit}
               >
                 <textarea
                    ref={reflectionInputRef}
                    value={reflectionVal}
                    onChange={(e) => setReflectionVal(e.target.value)}
                    placeholder="How did it go? / Any thoughts?"
                    className="w-full text-xs p-2 rounded-md bg-slate-50 border border-slate-200 focus:border-primary/50 focus:ring-2 focus:ring-primary/10 outline-none resize-none min-h-[60px]"
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
                     className="text-[10px] px-2 py-1 text-slate-400 hover:text-slate-600 rounded"
                   >
                     Cancel
                   </button>
                   <button 
                     type="submit" 
                     className="text-[10px] px-2 py-1 bg-primary text-white rounded shadow-sm hover:bg-indigo-600"
                   >
                     Save Note
                   </button>
                 </div>
               </motion.form>
             )}
          </div>

          {/* Actions */}
          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
             {/* Reflection Toggle */}
             <button
              onClick={() => setIsEditingReflection(!isEditingReflection)}
              className={cn(
                "p-1.5 rounded-md transition-colors",
                (task.reflection || isEditingReflection) 
                  ? "text-indigo-500 bg-indigo-50" 
                  : "text-slate-400 hover:text-indigo-500 hover:bg-indigo-50"
              )}
              title="Add reflection/note"
            >
              <MessageSquare size={14} />
            </button>

            {!isCompleted ? (
              <>
                {/* Break Down / Hammer */}
                <motion.button
                  whileTap={{ scale: 0.8 }}
                  onClick={handleSplit}
                  className="p-1.5 text-slate-400 hover:text-amber-500 hover:bg-amber-50 rounded-md transition-colors"
                  title="Break down (Split task)"
                >
                  <Hammer size={14} />
                </motion.button>
                <button
                  onClick={() => { playFreezeSound(); freezeTask(task.id); }}
                  className="p-1.5 text-slate-400 hover:text-sky-500 hover:bg-sky-50 rounded-md transition-colors"
                  title="Freeze for later"
                >
                  <Snowflake size={14} />
                </button>
                <button
                  onClick={() => deleteTask(task.id)}
                  className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors"
                  title="Delete"
                >
                  <Trash2 size={14} />
                </button>
                {/* Drag handle hint */}
                <div className="hidden md:flex p-1.5 text-slate-300 cursor-grab active:cursor-grabbing">
                   <Grab size={14} />
                </div>
              </>
            ) : (
              <button
                onClick={() => setShowNextInput(true)}
                className="p-1.5 text-slate-400 hover:text-primary hover:bg-primaryLight rounded-md transition-colors"
                title="Continue chain"
              >
                <CornerDownRight size={14} />
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
              <div className="flex items-center gap-2 text-primary p-2 bg-primary/5 rounded-lg border border-primary/10">
                <CornerDownRight size={16} />
                <input
                  ref={inputRef}
                  type="text"
                  value={nextInputVal}
                  onChange={(e) => setNextInputVal(e.target.value)}
                  placeholder="趁热打铁想做什么？"
                  className="flex-1 bg-transparent border-none p-0 text-sm text-slate-700 placeholder-primary/40 focus:outline-none focus:ring-0"
                  onBlur={() => !nextInputVal && setShowNextInput(false)}
                />
                <button type="submit" className="text-xs font-bold text-primary px-2">
                    GO
                </button>
              </div>
            </motion.form>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};
