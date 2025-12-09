import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion';
import { Trash2, CornerDownRight, MessageSquare, Hammer, Snowflake } from 'lucide-react';
import confetti from 'canvas-confetti';
import { SparkNode, TaskFeeling } from '../types';
import { useSparkStore } from '../store/useSparkStore';
import { cn, playSuccessSound, playFreezeSound, playSplitSound, formatDuration } from '../utils';

interface SparkCardProps {
  task: SparkNode;
  isChild?: boolean;
}

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
  const [isEditingReflection, setIsEditingReflection] = useState(false);
  const [reflectionVal, setReflectionVal] = useState(task.reflection || '');
  const [isEditingContent, setIsEditingContent] = useState(task.content === '');
  const [contentVal, setContentVal] = useState(task.content);
  const [isShaking, setIsShaking] = useState(false);
  const [shakeProfile, setShakeProfile] = useState({ scaleAmp: 0.03, rotAmp: 0.8, duration: 0.28 });

  const showFeelingSelector = activePopoverId === task.id;

  const inputRef = useRef<HTMLInputElement>(null);
  const reflectionInputRef = useRef<HTMLTextAreaElement>(null);
  const contentInputRef = useRef<HTMLInputElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);

  const isNew = useRef(Date.now() - task.createdAt < 1000).current;
  const isCompleted = task.status === 'completed';
  const dragCompleteThreshold = 90;
  const dragFreezeThreshold = -90;
  const shakeTimer = useRef<number | null>(null);

  const makeShakeProfile = () => {
    const scaleAmp = 0.02 + Math.random() * 0.03; // 0.02 - 0.05
    const rotAmp = 0.4 + Math.random() * 0.7;    // 0.4 - 1.1 deg
    const duration = 0.22 + Math.random() * 0.12; // 0.22 - 0.34 s
    return { scaleAmp, rotAmp, duration };
  };

  const triggerShake = () => {
    if (shakeTimer.current) {
      clearTimeout(shakeTimer.current);
    }
    const profile = makeShakeProfile();
    setShakeProfile(profile);
    setIsShaking(true);
    shakeTimer.current = window.setTimeout(() => setIsShaking(false), profile.duration * 1000 + 40);
  };

  // Drag logic
  const x = useMotionValue(0);
  const opacity = useTransform(x, [-200, -100, 0], [0, 1, 1]);
  
  // Dynamic Background Colors based on Drag
  const bgCompleteOpacity = useTransform(x, [50, 150], [0, 1]);
  const bgFreezeOpacity = useTransform(x, [-150, -50], [1, 0]);

  // Freeze appears on left drag (negative x)
  const freezeIndicatorOpacity = useTransform(x, [-150, -50], [1, 0]);
  
  // Complete appears on right drag (positive x)
  const completeIndicatorOpacity = useTransform(x, [50, 150], [0, 1]);

  useEffect(() => { if (showNextInput && inputRef.current) inputRef.current.focus(); }, [showNextInput]);
  useEffect(() => { if (isEditingReflection && reflectionInputRef.current) reflectionInputRef.current.focus(); }, [isEditingReflection]);
  useEffect(() => { if (isEditingContent && contentInputRef.current) contentInputRef.current.focus(); }, [isEditingContent]);
  useEffect(() => {
    return () => {
      if (shakeTimer.current) {
        clearTimeout(shakeTimer.current);
      }
    };
  }, []);

  // Newly split child should shake once when it appears (content 为空即来自拆分)
  useEffect(() => {
    if (!task.content && !isCompleted) {
      triggerShake();
    }
  }, [task.content, task.createdAt, isCompleted]);

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
      particleCount: 80,
      spread: 60,
      origin: { x, y },
      colors: ['#ffb000', '#00ff99', '#ff3333'],
      shapes: ['square'],
      disableForReducedMotion: true,
      zIndex: 100,
    });
  };

  const triggerShatter = (rect: DOMRect) => {
    const x = (rect.left + rect.width / 2) / window.innerWidth;
    const y = (rect.top + rect.height / 2) / window.innerHeight;
    confetti({
      particleCount: 20,
      spread: 30,
      origin: { x, y },
      colors: ['#333', '#555'],
      shapes: ['square'],
      gravity: 5.0,
      scalar: 0.8,
      startVelocity: 10,
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
      if (!task.content) { deleteTask(task.id); } 
      else { setContentVal(task.content); setIsEditingContent(false); }
    }
  };

  const handleSplit = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!isShaking) {
      triggerShake();
    }
    const rect = e.currentTarget.getBoundingClientRect();
    triggerShatter(rect);
    playSplitSound();
    splitTask(task.id);
  };

  return (
    <div className="relative group pl-1">
      {/* Connector Line (Dotted Circuit) */}
      {isChild && (
        <div className="absolute -left-4 top-0 w-4 h-6 border-l-2 border-b-2 border-dotted border-retro-amber/40 rounded-bl-none translate-y-[-10px]" />
      )}

      {/* Drag Background Feedback Layers - Placed BEHIND the motion div */}
      <div className="absolute inset-0 z-0 overflow-hidden rounded-sm">
        {/* Right Drag (Complete) - Green */}
        <motion.div 
            style={{ opacity: bgCompleteOpacity }}
            className="absolute inset-0 bg-retro-green/20 border border-retro-green"
        />
        {/* Left Drag (Freeze) - Blue */}
        <motion.div 
            style={{ opacity: bgFreezeOpacity }}
            className="absolute inset-0 bg-retro-cyan/20 border border-retro-cyan"
        />
      </div>

      {/* Freeze Indicator (Left Drag) */}
      <motion.div 
        style={{ opacity: freezeIndicatorOpacity }}
        className="absolute right-0 top-0 bottom-0 pr-4 flex items-center justify-end pointer-events-none z-0"
      >
        <span className="text-retro-cyan font-bold text-xs tracking-widest font-mono text-glow-cyan">[FREEZE_CMD]</span>
      </motion.div>

      {/* Complete Indicator (Right Drag) */}
      <motion.div 
        style={{ opacity: completeIndicatorOpacity }}
        className="absolute left-0 top-0 bottom-0 pl-4 flex items-center justify-start pointer-events-none z-0"
      >
        <span className="text-retro-green font-bold text-xs tracking-widest font-mono text-glow-green">[COMPLETE]</span>
      </motion.div>

      <motion.div
        initial={isNew ? { opacity: 0 } : false}
        animate={
          isShaking
            ? { 
                opacity: 1,
                scale: [1, 1 + shakeProfile.scaleAmp, 1, 1 + shakeProfile.scaleAmp * 0.6, 1],
                rotate: [0, -shakeProfile.rotAmp, shakeProfile.rotAmp * 0.8, -shakeProfile.rotAmp * 0.6, 0]
              }
            : { opacity: 1, scale: 1, rotate: 0 }
        }
        exit={{ opacity: 0, transition: { duration: 0.1 } }}
        transition={{ opacity: { duration: 0.1 }, scale: { duration: shakeProfile.duration }, rotate: { duration: shakeProfile.duration } }}
        style={{ x, opacity, touchAction: 'pan-y' }}
        drag={!isCompleted ? "x" : false}
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={{ left: 0.5, right: 0.5 }}
        onDragEnd={(e, info) => { 
          if (info.offset.x < dragFreezeThreshold && !isCompleted) { 
            playFreezeSound(); 
            freezeTask(task.id); 
          } else if (info.offset.x > dragCompleteThreshold && !isCompleted) {
             // Swipe Right -> Complete
             const target = e.target as HTMLElement;
             const rect = target.getBoundingClientRect();
             triggerConfetti(rect);
             playSuccessSound();
             completeTask(task.id, '🙂');
             setShowNextInput(true);
          }
        }}
        className={cn(
          "relative z-10 p-3 border-2 font-mono transition-colors duration-200",
          // Retro Card Styling: Hard edges, box shadow, colors
          isCompleted
            ? "bg-retro-surface border-gray-700 text-gray-500"
            : "bg-black border-retro-amber text-retro-amber shadow-[4px_4px_0px_0px_#996900] hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[5px_5px_0px_0px_#996900]"
        )}
      >
        <div className="flex items-start gap-3">
          {/* ASCII Checkbox */}
          <button
            onClick={handleComplete}
            disabled={isCompleted}
            className={cn(
              "mt-0.5 font-bold text-xl md:text-lg leading-none hover:text-retro-cyan transition-colors min-w-[36px]",
              isCompleted ? "text-retro-cyan" : "text-retro-amber"
            )}
          >
            {isCompleted ? "[x]" : "[ ]"}
          </button>

          <div className="flex-1 min-w-0">
            {isEditingContent ? (
              <form onSubmit={handleContentSubmit} className="flex items-center">
                 <span className="text-retro-amber mr-1 blink">&gt;</span>
                <input
                  ref={contentInputRef}
                  value={contentVal}
                  onChange={(e) => setContentVal(e.target.value)}
                  onBlur={handleContentSubmit}
                  className="w-full bg-black text-retro-cyan focus:outline-none font-mono placeholder-retro-dim/50 caret-retro-cyan"
                  placeholder="INPUT_COMMAND..."
                />
              </form>
            ) : (
              <p 
                onClick={() => !isCompleted && setIsEditingContent(true)}
                className={cn(
                  "text-sm leading-relaxed break-words cursor-text font-bold transition-all",
                  // Add Glitch Effect on Hover for active tasks
                  !isCompleted && "hover:text-retro-cyan glitch-hover",
                  isCompleted && "line-through opacity-50 decoration-2"
                )}
              >
                {task.content}
              </p>
            )}
            
            {/* Tech Metadata */}
            <div className="mt-2 flex items-center gap-2 text-[10px] tracking-widest opacity-80 select-none flex-wrap uppercase">
              <span className="text-gray-500">T_STAMP:</span>
              <span>{new Date(task.createdAt).toLocaleTimeString([], {hour12: false, hour: '2-digit', minute:'2-digit'})}</span>
              
              {isCompleted && task.completedAt && (
                <>
                  <span className="text-gray-600">»</span>
                  <span className="text-retro-cyan">DONE: {new Date(task.completedAt).toLocaleTimeString([], {hour12: false, hour: '2-digit', minute:'2-digit'})}</span>
                  <span className="border border-gray-700 px-1 text-gray-400">
                    {formatDuration(task.completedAt - task.createdAt)}
                  </span>
                </>
              )}

              {isCompleted && (
                <div className="relative inline-block ml-auto">
                  <button 
                    onClick={(e) => { e.stopPropagation(); setActivePopoverId(showFeelingSelector ? null : task.id); }}
                    className={cn(
                      "hover:text-retro-cyan hover:underline transition-colors grayscale-[0.5] hover:grayscale-0",
                    )}
                  >
                      MOOD: {task.feeling || '🙂'}
                  </button>
                  
                  <AnimatePresence>
                    {showFeelingSelector && (
                      <motion.div 
                        ref={popoverRef}
                        initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
                        className="absolute bottom-full right-0 mb-1 bg-black border-2 border-retro-cyan shadow-[4px_4px_0_0_rgba(0,255,153,0.3)] p-1 flex gap-1 z-50 min-w-max"
                      >
                        {(['😐', '🙂', '🤩'] as TaskFeeling[]).map((f) => (
                          <button
                            key={f}
                            onClick={(e) => { e.stopPropagation(); updateTaskFeeling(task.id, f); setActivePopoverId(null); }}
                            className={cn("p-1 hover:bg-retro-cyan hover:text-black transition-colors", task.feeling === f ? "bg-retro-cyan/20" : "")}
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

            {/* Reflection: Code Comment Style */}
            {(task.reflection && !isEditingReflection) && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mt-2 text-xs text-retro-green/80 font-mono text-glow-green">
                <span className="opacity-50 mr-1">//</span>{task.reflection}
              </motion.div>
            )}

            {isEditingReflection && (
              <motion.form
                  initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
                  className="mt-2 border-l-2 border-retro-green pl-2"
                  onSubmit={handleReflectionSubmit}
              >
                <textarea
                    ref={reflectionInputRef}
                    value={reflectionVal}
                    onChange={(e) => setReflectionVal(e.target.value)}
                    placeholder="// ADD_COMMIT_MSG..."
                    className="w-full text-xs bg-black text-retro-green focus:outline-none resize-none min-h-[40px] font-mono placeholder-retro-green/30"
                    onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleReflectionSubmit(e); }}}
                />
                <div className="flex justify-end gap-2">
                  <button type="button" onClick={() => setIsEditingReflection(false)} className="text-[10px] uppercase text-retro-green/50 hover:text-retro-green">Esc</button>
                  <button type="submit" className="text-[10px] uppercase bg-retro-green text-black px-2 font-bold hover:bg-white">Commit</button>
                </div>
              </motion.form>
            )}
          </div>

          {/* Actions: Text Buttons / ASCII Icons */}
          {!isEditingReflection && (
            <div className="flex flex-col gap-2 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
              <button
                onClick={() => setIsEditingReflection(!isEditingReflection)}
                className="text-gray-600 hover:text-retro-green p-1.5 rounded-md bg-white/0 md:bg-transparent md:p-0"
                title="Comment"
                aria-label="添加备注"
              >
                <MessageSquare size={16} />
              </button>

              {!isCompleted ? (
                <>
                  <button
                    onClick={handleSplit}
                    className="text-gray-600 hover:text-retro-amber p-1.5 rounded-md bg-white/0 md:bg-transparent md:p-0"
                    title="Split"
                    aria-label="拆分任务"
                  >
                    <Hammer size={16} />
                  </button>
                  <button
                    onClick={() => { playFreezeSound(); freezeTask(task.id); }}
                    className="text-gray-600 hover:text-retro-cyan p-1.5 rounded-md bg-white/0 md:bg-transparent md:p-0"
                    title="Freeze"
                    aria-label="冻结任务"
                  >
                    <Snowflake size={16} />
                  </button>
                  <button
                    onClick={() => deleteTask(task.id)}
                    className="text-gray-600 hover:text-retro-red p-1.5 rounded-md bg-white/0 md:bg-transparent md:p-0"
                    title="Delete"
                    aria-label="删除任务"
                  >
                    <Trash2 size={16} />
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setShowNextInput(true)}
                  className="text-gray-600 hover:text-retro-cyan p-1.5 rounded-md bg-white/0 md:bg-transparent md:p-0"
                  title="Continue"
                  aria-label="继续添加子任务"
                >
                  <CornerDownRight size={16} />
                </button>
              )}
            </div>
          )}
        </div>

        {/* Next Step CLI Input */}
        <AnimatePresence>
          {showNextInput && (
            <motion.form
              initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
              onSubmit={handleNextInputSubmit}
              className="mt-2 border-t border-dashed border-gray-800 pt-2 flex items-center gap-2"
            >
              <span className="text-retro-cyan text-xs">GO_TO &gt;</span>
              <input
                ref={inputRef}
                type="text"
                value={nextInputVal}
                onChange={(e) => setNextInputVal(e.target.value)}
                placeholder="NEXT_ACTION..."
                className="flex-1 bg-black text-xs text-white focus:outline-none font-mono caret-retro-cyan"
                onBlur={() => !nextInputVal && setShowNextInput(false)}
              />
              <button type="submit" className="text-[10px] bg-retro-amber text-black px-1 font-bold">EXEC</button>
            </motion.form>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};