import React, { useState } from 'react';
import { FlowColumn } from './components/FlowColumn';
import { FreezerColumn } from './components/FreezerColumn';
import { FlameColumn } from './components/FlameColumn';
import { Snowflake, Zap, Flame } from 'lucide-react';
import { cn } from './utils';
import { useSparkStore } from './store/useSparkStore';

type Tab = 'freezer' | 'flow' | 'flame';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('flow');
  const { tasks, isMobileInputOpen } = useSparkStore();

  // Calculate stats for badge
  const today = new Date().setHours(0, 0, 0, 0);
  const sparkCount = tasks.filter(
    (t) => t.status === 'completed' && t.completedAt && t.completedAt > today
  ).length;

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
      {!isMobileInputOpen && (
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
            className={cn("flex flex-col items-center justify-center w-full h-full transition-colors relative", activeTab === 'flame' ? "text-orange-500" : "text-slate-400")}
          >
            <div className="relative">
              <Flame size={20} />
              {sparkCount > 0 && (
                <span className="absolute -top-1.5 -right-2 bg-orange-500 text-white text-[9px] font-bold px-1 min-w-[14px] h-[14px] rounded-full flex items-center justify-center border border-white">
                  {sparkCount > 99 ? '99+' : sparkCount}
                </span>
              )}
            </div>
            <span className="text-[10px] font-medium mt-1">Flame</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default App;