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
    <div className="flex h-screen w-screen bg-slate-50 text-slate-800 font-sans overflow-hidden flex-col md:flex-row pb-16 md:pb-0">
      
      {/* Left Column: Freezer */}
      <aside className={cn(
        "flex-col bg-slate-50 transition-all md:border-r border-slate-200",
        activeTab === 'freezer' ? 'flex flex-1' : 'hidden',
        "md:flex md:flex-none md:w-72 lg:w-80 z-20"
      )}>
        <FreezerColumn />
      </aside>

      {/* Middle Column: Flow */}
      <main className={cn(
        "flex-col bg-slate-50 relative z-10 transition-all",
        activeTab === 'flow' ? 'flex flex-1' : 'hidden',
        "md:flex md:flex-1 md:min-w-0"
      )}>
        <FlowColumn />
      </main>

      {/* Right Column: Flame */}
      <aside className={cn(
        "flex-col bg-slate-50 transition-all md:border-l border-slate-200",
        activeTab === 'flame' ? 'flex flex-1' : 'hidden',
        "lg:flex lg:flex-none lg:w-72 z-20"
      )}>
        <FlameColumn />
      </aside>

      {/* Mobile Navigation (TabBar) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-white border-t border-slate-200 flex items-center justify-around z-50">
        <button 
          onClick={() => setActiveTab('freezer')}
          className={cn("flex flex-col items-center justify-center w-full h-full transition-colors", activeTab === 'freezer' ? "text-cyan-500" : "text-slate-400")}
        >
          <Snowflake size={20} />
          <span className="text-[10px] font-medium mt-1">Freezer</span>
        </button>
        
        <button 
          onClick={() => setActiveTab('flow')}
          className={cn("flex flex-col items-center justify-center w-full h-full transition-colors", activeTab === 'flow' ? "text-indigo-600" : "text-slate-400")}
        >
          <Zap size={20} />
          <span className="text-[10px] font-medium mt-1">Flow</span>
        </button>
        
        <button 
          onClick={() => setActiveTab('flame')}
          className={cn("flex flex-col items-center justify-center w-full h-full transition-colors", activeTab === 'flame' ? "text-orange-500" : "text-slate-400")}
        >
          <Flame size={20} />
          <span className="text-[10px] font-medium mt-1">Flame</span>
        </button>
      </div>
    </div>
  );
};

export default App;