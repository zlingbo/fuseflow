import React, { useState } from 'react';
import { FlowColumn } from './components/FlowColumn';
import { FreezerColumn } from './components/FreezerColumn';
import { FlameColumn } from './components/FlameColumn';
import { Snowflake, Zap, Flame } from 'lucide-react';
import { cn } from './utils';

type Tab = 'freezer' | 'flow' | 'flame';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('flow');

  return (
    <div className="flex h-screen w-screen bg-retro-bg text-retro-amber font-mono overflow-hidden flex-col md:flex-row pb-16 md:pb-0 selection:bg-retro-amber selection:text-black">
      
      {/* CRT Overlay Effects */}
      <div className="scanlines" />
      <div className="crt-flicker" />

      {/* Main Chassis Border (Desktop) */}
      <div className="absolute inset-0 pointer-events-none border-[8px] border-retro-surface z-50 hidden md:block rounded-xl m-2 shadow-hard" />

      {/* Left Column: Freezer */}
      <aside className={cn(
        "flex-col bg-retro-bg transition-all md:border-r-2 md:border-retro-surface",
        activeTab === 'freezer' ? 'flex flex-1' : 'hidden',
        "md:flex md:flex-none md:w-72 lg:w-80 z-20"
      )}>
        <FreezerColumn />
      </aside>

      {/* Middle Column: Flow */}
      <main className={cn(
        "flex-col bg-retro-bg relative z-10 transition-all",
        activeTab === 'flow' ? 'flex flex-1' : 'hidden',
        "md:flex md:flex-1 md:min-w-0"
      )}>
        <FlowColumn />
      </main>

      {/* Right Column: Flame */}
      <aside className={cn(
        "flex-col bg-retro-bg transition-all md:border-l-2 md:border-retro-surface",
        activeTab === 'flame' ? 'flex flex-1' : 'hidden',
        "lg:flex lg:flex-none lg:w-72 z-20"
      )}>
        <FlameColumn />
      </aside>

      {/* Mobile Mechanical Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-retro-surface border-t-4 border-retro-dim flex items-center justify-around z-50 px-4">
        <button 
          onClick={() => setActiveTab('freezer')}
          className={cn(
            "flex flex-col items-center justify-center w-20 h-12 border-2 rounded-sm transition-all active:translate-y-1 shadow-hard-sm",
            activeTab === 'freezer' 
              ? "bg-retro-teal text-black border-retro-teal" 
              : "bg-retro-bg text-retro-dim border-retro-dim"
          )}
        >
          <Snowflake size={18} />
          <span className="text-[9px] uppercase font-bold mt-1">Freezer</span>
        </button>
        
        <button 
          onClick={() => setActiveTab('flow')}
          className={cn(
            "flex flex-col items-center justify-center w-20 h-12 border-2 rounded-sm transition-all active:translate-y-1 shadow-hard-sm",
            activeTab === 'flow' 
              ? "bg-retro-amber text-black border-retro-amber" 
              : "bg-retro-bg text-retro-dim border-retro-dim"
          )}
        >
          <Zap size={18} />
          <span className="text-[9px] uppercase font-bold mt-1">Flow</span>
        </button>
        
        <button 
          onClick={() => setActiveTab('flame')}
          className={cn(
            "flex flex-col items-center justify-center w-20 h-12 border-2 rounded-sm transition-all active:translate-y-1 shadow-hard-sm",
            activeTab === 'flame' 
              ? "bg-retro-red text-black border-retro-red" 
              : "bg-retro-bg text-retro-dim border-retro-dim"
          )}
        >
          <Flame size={18} />
          <span className="text-[9px] uppercase font-bold mt-1">Core</span>
        </button>
      </div>
    </div>
  );
};

export default App;