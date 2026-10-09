import React from 'react';
import {
  Gamepad2,
  Tv,
  Scissors,
  Download,
  Flame,
  Sun,
  Moon,
} from 'lucide-react';
import type { AppTab } from '../types/game';
import { APP_NAME } from '../config';

interface HeaderProps {
  activeTab: AppTab;
  onChangeTab: (tab: AppTab) => void;
  dailyStreak: number;
  darkMode: boolean;
  onToggleDarkMode: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onChangeTab,
  dailyStreak,
  darkMode,
  onToggleDarkMode,
}) => {
  return (
    <header className="w-full bg-[#0a0c10]/95 backdrop-blur-xl border-b border-slate-800/80 sticky top-0 z-40 px-3 sm:px-6 py-2.5 transition-colors">
      <div className="max-w-6xl mx-auto flex items-center justify-between gap-3">
        {/* Brand */}
        <div
          onClick={() => onChangeTab('daily')}
          className="flex items-center gap-2.5 cursor-pointer select-none group"
        >
          <div className="w-8 h-8 rounded-xl bg-emerald-500 flex items-center justify-center text-slate-950 font-black shadow-md shadow-emerald-500/20 group-hover:scale-105 transition-transform">
            GC
          </div>
          <div>
            <span className="text-sm sm:text-base font-black tracking-tight text-white flex items-center gap-1">
              {APP_NAME}
            </span>
          </div>
        </div>

        {/* Central Segmented Mode Navigation */}
        <nav className="flex items-center gap-1 p-1 bg-slate-900 border border-slate-800 rounded-2xl">
          <button
            type="button"
            onClick={() => onChangeTab('daily')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
              activeTab === 'daily'
                ? 'bg-emerald-500 text-slate-950 shadow-sm font-black'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Gamepad2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Daily Play</span>
            <span className="sm:hidden">Daily</span>
          </button>

          <button
            type="button"
            onClick={() => onChangeTab('host')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
              activeTab === 'host'
                ? 'bg-emerald-500 text-slate-950 shadow-sm font-black'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Tv className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Host Mode</span>
            <span className="sm:hidden">Host</span>
          </button>

          <button
            type="button"
            onClick={() => onChangeTab('maker')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
              activeTab === 'maker'
                ? 'bg-emerald-500 text-slate-950 shadow-sm font-black'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Scissors className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Crop Studio</span>
            <span className="sm:hidden">Studio</span>
          </button>

          <button
            type="button"
            onClick={() => onChangeTab('export')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
              activeTab === 'export'
                ? 'bg-emerald-500 text-slate-950 shadow-sm font-black'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Video Export</span>
            <span className="sm:hidden">Video</span>
          </button>
        </nav>

        {/* Right HUD Badges */}
        <div className="flex items-center gap-2">
          {/* Daily Streak Indicator */}
          <div
            onClick={() => onChangeTab('daily')}
            title="Daily Streak"
            className="px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-black flex items-center gap-1 cursor-pointer select-none"
          >
            <Flame className="w-3.5 h-3.5 fill-current text-amber-500" />
            <span>{dailyStreak}</span>
          </div>

          {/* Theme Toggle */}
          <button
            type="button"
            onClick={onToggleDarkMode}
            title={darkMode ? 'Switch to Light' : 'Switch to Dark'}
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-300" />}
          </button>
        </div>
      </div>
    </header>
  );
};
