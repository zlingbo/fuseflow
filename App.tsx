import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FlowColumn } from './components/FlowColumn';
import { FreezerColumn } from './components/FreezerColumn';
import { FlameColumn } from './components/FlameColumn';
import { Snowflake, Zap, Flame } from 'lucide-react';
import { cn, unlockAudio } from './utils';
import { useSparkStore } from './store/useSparkStore';

type Tab = 'freezer' | 'flow' | 'flame';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('flow');
  const { tasks, isMobileInputOpen, setMobileInputOpen } = useSparkStore();

  // Calculate stats for badge
  const today = new Date().setHours(0, 0, 0, 0);
  const sparkCount = tasks.filter(
    (t) => t.status === 'completed' && t.completedAt && t.completedAt > today
  ).length;

  // Global Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // CMD+K or CTRL+K to focus input
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        const desktopInput = document.querySelector('input[placeholder="ENTER_COMMAND..."]') as HTMLInputElement;
        if (desktopInput) {
          desktopInput.focus();
        } else {
          setMobileInputOpen(true);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setMobileInputOpen]);

  // Mobile audio unlock: resume AudioContext on first user gesture
  useEffect(() => {
    const unlock = () => unlockAudio();
    const events: (keyof DocumentEventMap)[] = ['touchstart', 'click'];
    events.forEach((ev) => document.addEventListener(ev, unlock, { once: true, passive: true }));
    return () => events.forEach((ev) => document.removeEventListener(ev, unlock));
  }, []);

  return (
    <div className="flex h-[100dvh] w-screen bg-retro-bg text-retro-amber font-mono overflow-hidden flex-col md:flex-row pb-[calc(88px+env(safe-area-inset-bottom))] md:pb-0 relative selection:bg-retro-amber selection:text-black">
      
      {/* CRT Overlay Effects - Cleaned up */}
      <div className="scanlines" />
      <div className="vignette" />

      {/* Left Column: Freezer */}
      <aside className={cn(
        "flex-col bg-retro-bg transition-all md:border-r-2 border-retro-surface",
        activeTab === 'freezer' ? 'flex flex-1' : 'hidden',
        "md:flex md:flex-none md:w-80 z-20"
      )}>
        <FreezerColumn />
      </aside>

      {/* Middle Column: Flow */}
      <main className={cn(
        "flex-col bg-retro-bg relative z-10 transition-all min-h-0",
        activeTab === 'flow' ? 'flex flex-1' : 'hidden',
        "md:flex md:flex-1 md:min-w-0"
      )}>
        <FlowColumn />
      </main>

      {/* Right Column: Flame */}
      <aside className={cn(
        "flex-col bg-retro-bg transition-all md:border-l-2 border-retro-surface",
        activeTab === 'flame' ? 'flex flex-1' : 'hidden',
        "lg:flex lg:flex-none lg:w-80 z-20"
      )}>
        <FlameColumn />
      </aside>

      {/* Mobile Navigation (Mechanical Buttons) */}
      {!isMobileInputOpen && (
        <div
          className="md:hidden fixed bottom-0 left-0 right-0 bg-retro-bg border-t-2 border-retro-amber flex items-center z-50 px-2 gap-2"
          style={{ paddingBottom: 'max(12px, env(safe-area-inset-bottom))', height: '92px' }}
        >
          <motion.button 
            whileTap={{ scale: 0.92 }}
            onClick={() => setActiveTab('freezer')}
            className={cn(
              "flex-1 h-[64px] flex flex-col items-center justify-center border-2 transition-all active:translate-y-0.5 rounded-lg active:bg-zinc-800", 
              activeTab === 'freezer' 
                ? "border-retro-cyan bg-retro-cyan/10 text-retro-cyan shadow-[0_0_10px_rgba(0,255,153,0.35)]" 
                : "border-retro-surface text-gray-600 hover:border-retro-cyan/50"
            )}
            aria-pressed={activeTab === 'freezer'}
          >
            <Snowflake size={20} />
            <span className="text-[11px] uppercase font-bold mt-1 tracking-widest">Freeze</span>
          </motion.button>
          
          <motion.button 
            whileTap={{ scale: 0.92 }}
            onClick={() => setActiveTab('flow')}
            className={cn(
              "flex-1 h-[64px] flex flex-col items-center justify-center border-2 transition-all active:translate-y-0.5 rounded-lg active:bg-zinc-800", 
              activeTab === 'flow' 
                ? "border-retro-amber bg-retro-amber/10 text-retro-amber shadow-[0_0_10px_rgba(255,176,0,0.35)]" 
                : "border-retro-surface text-gray-600 hover:border-retro-amber/50"
            )}
            aria-pressed={activeTab === 'flow'}
          >
            <Zap size={20} />
            <span className="text-[11px] uppercase font-bold mt-1 tracking-widest">Flow</span>
          </motion.button>
          
          <motion.button 
            whileTap={{ scale: 0.92 }}
            onClick={() => setActiveTab('flame')}
            className={cn(
              "flex-1 h-[64px] flex flex-col items-center justify-center border-2 transition-all active:translate-y-0.5 rounded-lg relative active:bg-zinc-800", 
              activeTab === 'flame' 
                ? "border-retro-red bg-retro-red/10 text-retro-red shadow-[0_0_10px_rgba(255,51,51,0.35)]" 
                : "border-retro-surface text-gray-600 hover:border-retro-red/50"
            )}
            aria-pressed={activeTab === 'flame'}
          >
            <div className="relative">
              <Flame size={20} />
              {sparkCount > 0 && (
                <span className="absolute -top-2 -right-3 bg-retro-red text-black text-[10px] font-bold px-1 min-w-[16px] h-[16px] flex items-center justify-center border border-black rounded-sm">
                  {sparkCount > 99 ? '99' : sparkCount}
                </span>
              )}
            </div>
            <span className="text-[11px] uppercase font-bold mt-1 tracking-widest">Heat</span>
          </motion.button>
        </div>
      )}
    </div>
  );
};

export default App;