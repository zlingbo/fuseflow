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
    <div className="flex h-screen w-screen bg-background text-slate-800 overflow-hidden font-sans selection:bg-primary/20 selection:text-primary flex-col md:flex-row pb-16 md:pb-0">
      
      {/* Left Column: Freezer */}
      {/* Mobile: Show only if active. Desktop: Always show (md:flex) */}
      <aside className={cn(
        "flex-col bg-slate-50 transition-all",
        // Mobile styles (flex-1 to take full height)
        activeTab === 'freezer' ? 'flex flex-1' : 'hidden',
        // Desktop styles (override mobile hidden, fixed width)
        "md:flex md:flex-none md:w-64 lg:w-72 md:shadow-[1px_0_20px_rgba(0,0,0,0.02)] z-20"
      )}>
        <FreezerColumn />
      </aside>

      {/* Middle Column: Flow */}
      {/* Mobile: Show only if active. Desktop: Always show */}
      <main className={cn(
        "flex-col bg-background relative z-10 transition-all",
        // Mobile styles
        activeTab === 'flow' ? 'flex flex-1' : 'hidden',
        // Desktop styles
        "md:flex md:flex-1 md:min-w-0 md:shadow-xl md:shadow-slate-200/50"
      )}>
        <FlowColumn />
      </main>

      {/* Right Column: Flame */}
      {/* Mobile: Show only if active. Desktop: Show only on LG screens */}
      <aside className={cn(
        "flex-col bg-slate-50 transition-all",
        // Mobile styles
        activeTab === 'flame' ? 'flex flex-1' : 'hidden',
        // Desktop styles
        "lg:flex lg:flex-none lg:w-72 lg:shadow-[-1px_0_20px_rgba(0,0,0,0.02)] z-20"
      )}>
        <FlameColumn />
      </aside>

      {/* Mobile Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-white border-t border-slate-200 flex items-center justify-around z-50 px-6 shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
        <button 
          onClick={() => setActiveTab('freezer')}
          className="flex flex-col items-center gap-1 min-w-[64px] transition-colors duration-200"
        >
          <Snowflake 
            size={22} 
            className={cn(
              "transition-all duration-300", 
              activeTab === 'freezer' ? "text-sky-500 fill-sky-100 scale-110" : "text-slate-400"
            )} 
          />
          <span className={cn(
            "text-[10px] font-medium transition-colors",
            activeTab === 'freezer' ? "text-sky-500" : "text-slate-400"
          )}>
            Freezer
          </span>
        </button>
        
        <button 
          onClick={() => setActiveTab('flow')}
          className="flex flex-col items-center gap-1 min-w-[64px] transition-colors duration-200"
        >
          <div className={cn(
            "rounded-full p-1 transition-all duration-300",
            activeTab === 'flow' ? "bg-primary/10 -translate-y-2" : ""
          )}>
            <Zap 
              size={24} 
              className={cn(
                "transition-all duration-300", 
                activeTab === 'flow' ? "text-primary fill-primary" : "text-slate-400"
              )} 
            />
          </div>
          {activeTab !== 'flow' && <span className="text-[10px] font-medium text-slate-400">Flow</span>}
        </button>
        
        <button 
          onClick={() => setActiveTab('flame')}
          className="flex flex-col items-center gap-1 min-w-[64px] transition-colors duration-200"
        >
          <Flame 
            size={22} 
            className={cn(
              "transition-all duration-300", 
              activeTab === 'flame' ? "text-orange-500 fill-orange-100 scale-110" : "text-slate-400"
            )} 
          />
          <span className={cn(
            "text-[10px] font-medium transition-colors",
            activeTab === 'flame' ? "text-orange-500" : "text-slate-400"
          )}>
            Flame
          </span>
        </button>
      </div>
    </div>
  );
};

export default App;