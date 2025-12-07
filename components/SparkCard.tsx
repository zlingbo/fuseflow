
import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion';
import { Trash2, CornerDownRight, Grab, MessageSquare, Hammer, X } from 'lucide-react';
import confetti from 'canvas-confetti';
import { SparkNode } from '../types';
import { useSparkStore } from '../store/useSparkStore';
import { cn, playSuccessSound, playFreezeSound, playSplitSound } from '../utils';

interface SparkCardProps {
  task: SparkNode;
  isChild?: boolean;
}

export const SparkCard: React.FC<SparkCardProps> = ({ task, isChild = false }) => {
  const { completeTask, freezeTask, deleteTask, addTask, updateTaskReflection, splitTask, updateTaskContent } = useSparkStore();
  const [showNextInput, setShowNextInput] = useState(false);
  const [nextInputVal, setNextInputVal] = useState('');
  
  // Reflection state
  const [isEditingReflection, setIsEditingReflection] = useState(false);
  const [reflectionVal, setReflectionVal] = useState(task.reflection || '');
  
  // Content Edit state
  const [isEditingContent, setIsEditingContent] = useState(task.content === '');
  const [contentVal, setContentVal] = useState(task.content);

  const inputRef = useRef<HTMLInputElement>(null);
  const reflectionInputRef = useRef<HTMLTextAreaElement>(null);
  const contentInputRef = useRef<HTMLInputElement>(null);

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

  const triggerConfetti = (rect: DOMRect) => {
    const x = (rect.left + rect.width / 2) / window.innerWidth;
    const y = (rect.top + rect.height / 2) / window.innerHeight;

    confetti({
      particleCount: 60,
      spread: 80,
      origin: { x, y },
      colors: ['#ffb000', '#00ffcc', '#ffffff'],
      shapes: ['square'], // Retro pixels
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
      particleCount: 15,
      spread: 40,
      origin: { x, y },
      colors: ['#444', '#666'], // Dust
      shapes: ['square'],
      gravity: 4.0,
      scalar: 0.4,
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
    <div className="relative group">
      {/* Retro Freeze Indicator */}
      <motion.div 
        style={{ opacity: freezeIndicatorOpacity }}
        className="absolute right-full top-0 bottom-0 pr-4 flex items-center justify-end pointer-events-none z-0"
      >
        <div className="text-retro-teal font-mono text-xs border border-retro-teal bg-black px-2 py-1 shadow-[2px_2px_0px_rgba(0,255,204,0.5)]">
          &lt;&lt; ARCHIVE_DATA
        </div>
      </motion.div>

      <motion.div
        layoutId={task.id}
        layout
        initial={isNew ? { opacity: 0 } : false}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0, scale: 0.95, filter: "blur(2px)" }}
        style={{ x, opacity }}
        drag={!isCompleted ? "x" : false}
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={{ left: 0.5, right: 0.1 }}
        onDragEnd={handleDragEnd}
        className={cn(
          "relative z-10 p-4 border-2 touch-pan-y transition-all",
          isCompleted
            ? "bg-retro-surface/50 border-retro-dim text-retro-dim"
            : "bg-retro-bg border-retro-amber text-retro-amber shadow-hard hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[5px_5px_0px_rgba(255,176,0,0.3)]"
        )}
      >
        {/* Connector Line: Dotted Circuit Style */}
        {isChild && (
          <div 
            className="absolute -left-6 top-0 w-6 h-8 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          >
            <div className="absolute inset-0 border-b-2 border-l-2 border-dotted border-retro-dim rounded-bl-sm -translate-y-1/2" />
          </div>
        )}

        <div className="flex items-start gap-3">
          {/* ASCII Checkbox */}
          <button
            onClick={handleComplete}
            disabled={isCompleted}
            className="mt-1 flex-shrink-0 font-mono text-lg leading-none hover:text-white transition-colors"
          >
            {isCompleted ? '[x]' : '[ ]'}
          </button>

          {/* Content Wrapper */}
          <div className="flex-1 min-w-0 font-mono">
            {isEditingContent ? (
              <form onSubmit={handleContentSubmit}>
                <div className="flex items-center">
                  <span className="text-retro-dim mr-2">&gt;</span>
                  <input
                    ref={contentInputRef}
                    value={contentVal}
                    onChange={(e) => setContentVal(e.target.value)}
                    onBlur={handleContentSubmit}
                    className="w-full text-sm font-mono bg-transparent text-retro-amber placeholder-retro-dim/50 border-b border-retro-amber focus:outline-none focus:bg-retro-amber/10"
                    placeholder="ENTER_COMMAND..."
                  />
                </div>
              </form>
            ) : (
              <p 
                onClick={() => !isCompleted && setIsEditingContent(true)}
                className={cn(
                  "text-sm leading-relaxed break-words cursor-text",
                  isCompleted && "line-through opacity-50"
                )}
              >
                {task.content}
              </p>
            )}
            
            {/* Metadata */}
             <div className="mt-2 flex items-center gap-2 text-[10px] text-retro-dim select-none uppercase tracking-widest">
               <span>T_STAMP: {new Date(task.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit', hour12: false})}</span>
               {isCompleted && task.feeling && <span className="text-retro-teal">MOOD: {task.feeling}</span>}
             </div>

             {/* Reflection Display */}
             {(task.reflection && !isEditingReflection) && (
               <motion.div 
                 initial={{ opacity: 0, height: 0 }} 
                 animate={{ opacity: 1, height: 'auto' }}
                 className="mt-3 relative border-l border-retro-teal pl-3"
               >
                 <p className="text-xs text-retro-teal italic leading-relaxed font-mono">
                   //{task.reflection}
                 </p>
               </motion.div>
             )}

             {/* Reflection Edit Form */}
             {isEditingReflection && (
               <motion.form
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="mt-3 border border-retro-teal p-2 bg-retro-bg"
                  onSubmit={handleReflectionSubmit}
               >
                 <textarea
                    ref={reflectionInputRef}
                    value={reflectionVal}
                    onChange={(e) => setReflectionVal(e.target.value)}
                    placeholder="LOG_REFLECTION..."
                    className="w-full text-xs font-mono bg-transparent text-retro-teal placeholder-retro-teal/30 focus:outline-none resize-none min-h-[40px]"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleReflectionSubmit(e);
                      }
                    }}
                 />
                 <div className="flex justify-end gap-2 mt-1 border-t border-retro-teal/30 pt-1">
                   <button 
                     type="button" 
                     onClick={() => setIsEditingReflection(false)}
                     className="text-[10px] px-2 py-1 text-retro-dim hover:text-white"
                   >
                     CANCEL
                   </button>
                   <button 
                     type="submit" 
                     className="text-[10px] px-2 py-1 bg-retro-teal text-black font-bold hover:bg-white"
                   >
                     SAVE_LOG
                   </button>
                 </div>
               </motion.form>
             )}
          </div>

          {/* Actions - Mechanical Buttons */}
          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
             <button
              onClick={() => setIsEditingReflection(!isEditingReflection)}
              className={cn(
                "p-1 border border-transparent hover:border-retro-teal hover:text-retro-teal hover:bg-retro-teal/10",
                (task.reflection || isEditingReflection) && "text-retro-teal border-retro-teal"
              )}
              title="ADD_NOTE"
            >
              <MessageSquare size={14} />
            </button>

            {!isCompleted ? (
              <>
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={handleSplit}
                  className="p-1 text-retro-dim hover:text-retro-amber hover:border hover:border-retro-amber hover:bg-retro-amber/10 transition-colors"
                  title="SPLIT_PROCESS"
                >
                  <Hammer size={14} />
                </motion.button>
                <button
                  onClick={() => { playFreezeSound(); freezeTask(task.id); }}
                  className="p-1 text-retro-dim hover:text-retro-teal hover:border hover:border-retro-teal hover:bg-retro-teal/10 transition-colors"
                  title="ARCHIVE"
                >
                  {/* Custom 'Freeze' Icon */}
                  <span className="font-bold text-xs">[F]</span>
                </button>
                <button
                  onClick={() => deleteTask(task.id)}
                  className="p-1 text-retro-dim hover:text-retro-red hover:border hover:border-retro-red hover:bg-retro-red/10 transition-colors"
                  title="TERMINATE"
                >
                  <Trash2 size={14} />
                </button>
                <div className="hidden md:flex p-1 text-retro-dim cursor-grab active:cursor-grabbing">
                   <Grab size={14} />
                </div>
              </>
            ) : (
              <button
                onClick={() => setShowNextInput(true)}
                className="p-1 text-retro-dim hover:text-white hover:border hover:border-white transition-colors"
                title="CONTINUE_SEQ"
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
              className="overflow-hidden border-t-2 border-dotted border-retro-amber pt-2"
            >
              <div className="flex items-center gap-2 text-retro-amber">
                <span className="animate-blink">_</span>
                <input
                  ref={inputRef}
                  type="text"
                  value={nextInputVal}
                  onChange={(e) => setNextInputVal(e.target.value)}
                  placeholder="EXECUTE_NEXT..."
                  className="flex-1 bg-transparent border-none p-0 text-sm font-mono text-retro-amber placeholder-retro-amber/40 focus:outline-none focus:ring-0 uppercase"
                  onBlur={() => !nextInputVal && setShowNextInput(false)}
                />
                <button type="submit" className="text-xs font-bold bg-retro-amber text-black px-2 hover:bg-white">
                    RUN
                </button>
              </div>
            </motion.form>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};
