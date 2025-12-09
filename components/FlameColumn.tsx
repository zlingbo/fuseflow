import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Flame, Activity, Download, Cpu } from 'lucide-react';
import { useSparkStore } from '../store/useSparkStore';
import { motion } from 'framer-motion';
import { cn } from '../utils';

type HeatDay = { ts: number; count: number };

export const FlameColumn: React.FC<{ isActive?: boolean }> = () => {
  const { tasks } = useSparkStore();

  const today = new Date().setHours(0, 0, 0, 0);
  const completedToday = tasks.filter(
    (t) => t.status === 'completed' && t.completedAt && t.completedAt > today
  ).length;
  const totalCompleted = tasks.filter((t) => t.status === 'completed').length;
  const completedByDay = useMemo(() => {
    const map = new Map<number, number>();
    tasks.forEach((t) => {
      if (t.status === 'completed' && t.completedAt) {
        const dayStart = new Date(t.completedAt).setHours(0, 0, 0, 0);
        map.set(dayStart, (map.get(dayStart) || 0) + 1);
      }
    });
    return map;
  }, [tasks]);

  const maxHeat = 8; // Target daily tasks
  const heatPercentage = Math.min((completedToday / maxHeat) * 100, 100);
  // Determine intensity level (0-3) for legacy labels
  const intensityLevel = heatPercentage >= 100 ? 3 : heatPercentage >= 50 ? 2 : heatPercentage > 0 ? 1 : 0;

  const intensity = Math.min(completedToday, 5);

  const flameColors = [
    'text-retro-dim', // 0
    'text-retro-amber opacity-40', // 1
    'text-retro-amber', // 2
    'text-retro-red opacity-80', // 3
    'text-retro-red', // 4
    'text-white drop-shadow-[0_0_10px_rgba(255,51,51,1)]', // 5
  ];

  const heatDays = useMemo<HeatDay[]>(() => {
    const days = 28;
    const oneDay = 24 * 60 * 60 * 1000;
    const arr: HeatDay[] = [];
    for (let i = days - 1; i >= 0; i--) {
      const dayStart = new Date(Date.now() - i * oneDay).setHours(0, 0, 0, 0);
      arr.push({
        ts: dayStart,
        count: completedByDay.get(dayStart) || 0,
      });
    }
    return arr;
  }, [completedByDay]);

  const heatWeeks = useMemo<HeatDay[][]>(() => {
    const weeks: HeatDay[][] = [];
    for (let i = 0; i < heatDays.length; i += 7) {
      weeks.push(heatDays.slice(i, i + 7));
    }
    return weeks;
  }, [heatDays]);

  const getHeatStyle = (count: number) => {
    // GitHub-like gradient, transparent fills + brighter borders for visibility
    if (count === 0) {
      return {
        borderColor: '#2f323a',
        backgroundColor: 'rgba(47,50,58,0.55)',
      };
    }
    if (count === 1) {
      return {
        borderColor: '#5a4a23',
        backgroundColor: 'rgba(90,74,35,0.4)',
      };
    }
    if (count === 2) {
      return {
        borderColor: '#8c6b1f',
        backgroundColor: 'rgba(140,107,31,0.4)',
      };
    }
    if (count === 3) {
      return {
        borderColor: '#b88c24',
        backgroundColor: 'rgba(184,140,36,0.45)',
      };
    }
    if (count === 4) {
      return {
        borderColor: '#e7c34a',
        backgroundColor: 'rgba(231,195,74,0.5)',
      };
    }
    return {
      borderColor: '#ff4d4d',
      backgroundColor: 'rgba(255,77,77,0.45)',
      boxShadow: '0 0 10px rgba(255,77,77,0.55)',
    };
  };

  const [hoverDay, setHoverDay] = useState<HeatDay | null>(null);
  const [selectedDay, setSelectedDay] = useState<HeatDay | null>(null);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [isTouch, setIsTouch] = useState(false);
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    const touchCapable = typeof window !== 'undefined' && (
      'ontouchstart' in window ||
      (navigator as any).maxTouchPoints > 0 ||
      (navigator as any).msMaxTouchPoints > 0
    );
    setIsTouch(touchCapable);
  }, []);

  const setActiveSelection = (day: HeatDay, index: number) => {
    setSelectedDay(day);
    setSelectedIndex(index);
  };

  const handleSwipeMove = (direction: 'up' | 'down' | 'left' | 'right') => {
    if (heatDays.length === 0) return;
    const baseIndex = selectedIndex ?? heatDays.length - 1;
    const row = baseIndex % 7;
    const col = Math.floor(baseIndex / 7);
    let nextIndex = baseIndex;

    if (direction === 'up' && row > 0) nextIndex = baseIndex - 1;
    if (direction === 'down' && row < 6) nextIndex = baseIndex + 1;
    if (direction === 'left' && col > 0) nextIndex = baseIndex - 7;
    if (direction === 'right' && col < heatWeeks.length - 1) nextIndex = baseIndex + 7;

    const nextDay = heatDays[nextIndex];
    if (nextDay) {
      setActiveSelection(nextDay, nextIndex);
    }
  };

  const displayDay = isTouch ? selectedDay : hoverDay ?? selectedDay;

  const handleExport = () => {
    try {
      const dataStr = JSON.stringify(tasks, null, 2);
      const blob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `SPARK_DUMP_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Export failed:', error);
      alert('DUMP_FAIL');
    }
  };

  return (
    <div className="h-full bg-retro-bg flex flex-col items-center font-mono border-l-2 border-retro-surface relative overflow-hidden">

      <div className="p-4 w-full z-10 border-b-2 border-retro-surface bg-retro-bg flex justify-between items-center pt-[env(safe-area-inset-top)]">
        <h2 className="text-retro-red text-sm font-bold uppercase tracking-widest flex items-center gap-2">
          <Activity size={16} />
          SYSTEM_HEAT
        </h2>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center w-full gap-4 z-10 p-5 overflow-y-auto no-scrollbar pb-[env(safe-area-inset-bottom)]">

        {/* Pixel Flame Visual */}
        <div className="relative border-4 border-retro-surface bg-black p-3 shadow-hard-sm">
          {/* "Screen" Effect */}
          <div className="absolute inset-0 bg-retro-red/10 pointer-events-none" />

          <motion.div
            animate={{
              scale: [1, 1.1, 1],
              opacity: [0.8, 1, 0.8],
            }}
            transition={{
              duration: 0.2, // Fast glitch flicker
              repeat: Infinity,
              repeatType: "reverse"
            }}
            className={`transition-colors duration-1000 ${flameColors[intensity]}`}
          >
            {/* Using standard icon but framing it to look like a sprite */}
            <Flame size={64} strokeWidth={2} fill="currentColor" />
          </motion.div>
        </div>

        {/* Big Number Display for SPARKLE_COUNT */}
        <div className="relative flex flex-col items-center gap-1.5 mt-3 px-3 py-2 overflow-hidden text-center">
          {/* Prism/Sparkle layers - Pure white base with intense RGB split edges */}
          <div className="relative inline-block leading-none text-[clamp(44px,6vw,60px)] font-extrabold tracking-tight drop-shadow-[0_0_15px_rgba(255,255,255,0.4)]">
            {/* Cyan/Blue Shift */}
            <motion.span
              className="absolute inset-0 text-cyan-400 mix-blend-screen select-none"
              animate={{ x: [-3, 3.5, -2], opacity: [0.7, 0.95, 0.6] }}
              transition={{ duration: 1.8, repeat: Infinity, repeatType: "mirror", ease: "easeInOut" }}
            >
              {totalCompleted.toString().padStart(2, '0')}
            </motion.span>

            {/* Magenta/Pink Shift */}
            <motion.span
              className="absolute inset-0 text-fuchsia-500 mix-blend-screen select-none"
              animate={{ x: [3, -3.5, 2], opacity: [0.65, 0.95, 0.55] }}
              transition={{ duration: 2.1, repeat: Infinity, repeatType: "mirror", ease: "easeInOut" }}
            >
              {totalCompleted.toString().padStart(2, '0')}
            </motion.span>

            {/* Yellow/Gold Shift (Vertical) */}
            <motion.span
              className="absolute inset-0 text-yellow-300 mix-blend-screen select-none"
              animate={{ y: [-2, 2.5, -1], opacity: [0.55, 0.85, 0.45] }}
              transition={{ duration: 2.6, repeat: Infinity, repeatType: "mirror", ease: "easeInOut" }}
            >
              {totalCompleted.toString().padStart(2, '0')}
            </motion.span>

            {/* Base White Text */}
            <span className="relative text-white z-10">
              {totalCompleted.toString().padStart(2, '0')}
            </span>
          </div>

          <div className="w-14 border-t border-retro-dim/60" />
          <div className="text-[10px] text-retro-dim uppercase tracking-[0.25em] drop-shadow-[0_0_6px_rgba(255,72,72,0.35)]">
            SPARKLE_COUNT
          </div>
        </div>

        {/* Contribution-style Heat Map */}
        <div
          className="mt-4 flex flex-col items-center gap-2"
          onClick={() => {
            if (isTouch) {
              setSelectedDay(null);
              setSelectedIndex(null);
            }
          }}
          onTouchStart={(e) => {
            if (!isTouch) return;
            const touch = e.touches[0];
            touchStartRef.current = { x: touch.clientX, y: touch.clientY };
          }}
          onTouchEnd={(e) => {
            if (!isTouch || !touchStartRef.current) return;
            const touch = e.changedTouches[0];
            const dx = touch.clientX - touchStartRef.current.x;
            const dy = touch.clientY - touchStartRef.current.y;
            touchStartRef.current = null;

            const absX = Math.abs(dx);
            const absY = Math.abs(dy);
            const threshold = 24;
            if (Math.max(absX, absY) < threshold) return;

            if (absX > absY) {
              handleSwipeMove(dx < 0 ? 'left' : 'right');
            } else {
              handleSwipeMove(dy < 0 ? 'up' : 'down');
            }
          }}
        >
          <span className="text-[10px] text-retro-dim uppercase tracking-[0.25em]">HEAT MAP</span>
          <div className="flex gap-1">
            {heatWeeks.map((week, wi) => (
              <div key={wi} className="flex flex-col gap-1">
                {week.map((day, di) => {
                  const dayIndex = wi * 7 + di;
                  const isActive = displayDay?.ts === day.ts;
                  return (
                    <div
                      key={day.ts}
                      className={cn(
                        'w-4 h-4 md:w-3 md:h-3 rounded-[3px] md:rounded-[2px] border transition-all duration-150 bg-transparent',
                        (hoverDay?.ts === day.ts || isActive) && 'scale-110'
                      )}
                      style={getHeatStyle(day.count)}
                      onMouseEnter={() => setHoverDay(day)}
                      onMouseLeave={() => setHoverDay(null)}
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveSelection(day, dayIndex);
                      }}
                      title={`${new Date(day.ts).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}: ${day.count}`}
                    />
                  );
                })}
              </div>
            ))}
          </div>
          <div className="text-[10px] text-retro-dim uppercase tracking-[0.15em] text-center flex flex-col items-center min-h-[32px]">
            <div>{isTouch ? 'TAP_OR_SWIPE_FOR_DATA' : 'HOVER_SECTOR_FOR_DATA'}</div>
            <div className={cn("mt-1 text-retro-amber", !displayDay && "opacity-0")}>
              {displayDay
                ? `${new Date(displayDay.ts).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })} : ${displayDay.count}`
                : "placeholder"}
            </div>
          </div>
        </div>

      </div>

      {/* Footer */}
      <div className="w-full p-5 border-t border-retro-surface bg-retro-bg z-10 pb-[env(safe-area-inset-bottom)]">
        <motion.button
          whileTap={{ scale: 0.92 }}
          onClick={handleExport}
          className="group w-full border-2 border-dashed border-gray-700 hover:border-retro-red p-3 flex items-center justify-center gap-2 text-gray-500 hover:text-retro-red transition-all hover:bg-retro-red/5 active:bg-zinc-800"
        >
          <Download size={16} />
          <span className="text-xs font-bold uppercase tracking-widest group-hover:animate-pulse">DUMP_MEMORY</span>
        </motion.button>
        <p className="text-[9px] text-gray-800 text-center mt-2 uppercase font-mono">
          v1.0.4 // SPARK_OS
        </p>
      </div>
    </div>
  );
};