import React, { useState, useEffect } from 'react';
import {
  Flame,
  Search,
  CheckCircle2,
  XCircle,
  Share2,
  Clock,
  Sparkles,
  HelpCircle,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import type { CropCategory, CelebrityCard } from '../types/game';
import { getDailyCelebrity, CELEBRITY_NAMES } from '../data/celebrityLibrary';
import { getLocalToday, getTimeUntilReset } from '../storage/usage';
import { CelebrityCardView } from './CelebrityCardView';
import { DOMAIN } from '../config';

export const DailyWordleMode: React.FC = () => {
  const [category, setCategory] = useState<CropCategory>('hair');
  const todayStr = getLocalToday();

  // Load daily celebrity for active category
  const targetCeleb: CelebrityCard = getDailyCelebrity(todayStr, category);

  // Daily game state persistence key
  const storageKey = `gtc_daily_${todayStr}_${category}`;
  const streakKey = 'gtc_streak_count';

  const [guesses, setGuesses] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      return saved ? JSON.parse(saved).guesses || [] : [];
    } catch {
      return [];
    }
  });

  const [isCompleted, setIsCompleted] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      return saved ? JSON.parse(saved).isCompleted || false : false;
    } catch {
      return false;
    }
  });

  const [isWon, setIsWon] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      return saved ? JSON.parse(saved).isWon || false : false;
    } catch {
      return false;
    }
  });

  const [streak, setStreak] = useState<number>(() => {
    try {
      return parseInt(localStorage.getItem(streakKey) || '3', 10);
    } catch {
      return 3;
    }
  });

  // Search input & autocomplete
  const [query, setQuery] = useState('');
  const [filteredNames, setFilteredNames] = useState<string[]>([]);
  const [isCopied, setIsCopied] = useState(false);

  useEffect(() => {
    if (!query.trim()) {
      setFilteredNames([]);
      return;
    }
    const q = query.toLowerCase();
    const matches = CELEBRITY_NAMES.filter(
      (n) => n.toLowerCase().includes(q) && !guesses.includes(n)
    ).slice(0, 5);
    setFilteredNames(matches);
  }, [query, guesses]);

  const maxGuesses = 3;
  const attemptsLeft = maxGuesses - guesses.length;

  const handleMakeGuess = (guessedName: string) => {
    if (isCompleted || !guessedName.trim()) return;

    const trimmed = guessedName.trim();
    const updatedGuesses = [...guesses, trimmed];
    setGuesses(updatedGuesses);
    setQuery('');
    setFilteredNames([]);

    const won = trimmed.toLowerCase() === targetCeleb.name.toLowerCase();
    const done = won || updatedGuesses.length >= maxGuesses;

    if (won) {
      setIsWon(true);
      setIsCompleted(true);
      const newStreak = streak + 1;
      setStreak(newStreak);
      localStorage.setItem(streakKey, newStreak.toString());
      confetti({ particleCount: 90, spread: 70, origin: { y: 0.6 } });
    } else if (done) {
      setIsCompleted(true);
    }

    // Persist progress
    localStorage.setItem(
      storageKey,
      JSON.stringify({
        guesses: updatedGuesses,
        isCompleted: done,
        isWon: won,
      })
    );
  };

  const handleShare = async () => {
    const icon = category === 'hair' ? '💈' : category === 'beard' ? '🧔' : category === 'eyes' ? '👀' : '👃';
    const grid = guesses
      .map((g) => (g.toLowerCase() === targetCeleb.name.toLowerCase() ? '🟩' : '⬛'))
      .join('');

    const text = `GuessTheCeleb ${todayStr} ${icon}\n${grid} (${guesses.length}/${maxGuesses})\n🔥 Streak: ${streak}\nPlay: https://${DOMAIN}`;

    if (navigator.clipboard) {
      await navigator.clipboard.writeText(text);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2500);
    }
  };

  const { hours, minutes } = getTimeUntilReset();

  return (
    <div className="w-full max-w-xl mx-auto flex flex-col items-center gap-5 animate-fadeIn">
      {/* Category Mode Selector Tabs */}
      <div className="w-full flex items-center justify-between gap-1.5 p-1 bg-slate-900/90 border border-slate-800 rounded-2xl backdrop-blur-md">
        {(['hair', 'beard', 'eyes', 'nose'] as CropCategory[]).map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => {
              setCategory(cat);
              setQuery('');
              setFilteredNames([]);
            }}
            className={`flex-1 py-2 sm:py-2.5 px-2 rounded-xl text-xs font-black capitalize transition-all ${
              category === cat
                ? 'bg-emerald-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            {cat === 'hair' && '💈 Hair'}
            {cat === 'beard' && '🧔 Beard'}
            {cat === 'eyes' && '👀 Eyes'}
            {cat === 'nose' && '👃 Nose'}
          </button>
        ))}
      </div>

      {/* Daily Header: Date & Streak Counter */}
      <div className="w-full flex items-center justify-between px-2">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Daily Challenge
          </span>
          <span className="px-2 py-0.5 rounded-md bg-slate-800 text-[11px] font-mono font-bold text-slate-300">
            {todayStr}
          </span>
        </div>

        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-black">
          <Flame className="w-4 h-4 fill-current text-amber-500" />
          <span>{streak} Day Streak</span>
        </div>
      </div>

      {/* Mystery Crop Card (Shows cropped feature until solved) */}
      <div className="w-full aspect-[4/5] sm:aspect-[3/4] max-h-[58vh] min-h-[380px]">
        <CelebrityCardView
          card={targetCeleb}
          isRevealedOverride={isCompleted}
          containerClassName="w-full h-full"
          showNameOnReveal={isCompleted}
          allowHoldToReveal={isCompleted}
        />
      </div>

      {/* Guess Input & Hints Area */}
      {!isCompleted ? (
        <div className="w-full flex flex-col gap-3">
          {/* Progressive Hint Banners based on failed attempts */}
          {guesses.length >= 1 && (
            <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800 text-xs text-slate-300 flex items-start gap-2.5 animate-fadeIn">
              <HelpCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-white">Hint 1: </span>
                {targetCeleb.hint || 'Famous global music and pop-culture icon.'}
              </div>
            </div>
          )}

          {guesses.length >= 2 && (
            <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800 text-xs text-slate-300 flex items-start gap-2.5 animate-fadeIn">
              <Sparkles className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-white">Hint 2: </span>
                First letter starts with <b>"{targetCeleb.name.charAt(0)}"</b> ({targetCeleb.name.length} letters).
              </div>
            </div>
          )}

          {/* Autocomplete Input Form */}
          <div className="relative w-full">
            <div className="relative flex items-center">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && query.trim()) {
                    handleMakeGuess(filteredNames[0] || query);
                  }
                }}
                placeholder="Type celebrity name (e.g. Kanye West, Drake...)"
                className="w-full bg-slate-900 border border-slate-800 rounded-2xl pl-10 pr-24 py-3.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-400 shadow-xl"
              />
              <button
                type="button"
                onClick={() => handleMakeGuess(query)}
                disabled={!query.trim()}
                className="absolute right-2 px-3.5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-40 text-slate-950 font-black text-xs transition-all active:scale-95"
              >
                Guess ({attemptsLeft})
              </button>
            </div>

            {/* Autocomplete Suggestions Dropdown */}
            {filteredNames.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl z-30 flex flex-col">
                {filteredNames.map((name) => (
                  <button
                    key={name}
                    type="button"
                    onClick={() => handleMakeGuess(name)}
                    className="px-4 py-2.5 text-left text-xs font-bold text-slate-200 hover:bg-slate-800 hover:text-emerald-400 transition-colors flex items-center justify-between"
                  >
                    <span>{name}</span>
                    <span className="text-[10px] text-slate-500 font-normal">Select</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Previous Guesses Tags */}
          {guesses.length > 0 && (
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs text-slate-500 font-bold">Guesses:</span>
              {guesses.map((g, i) => (
                <div
                  key={i}
                  className="px-2.5 py-1 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-bold flex items-center gap-1.5"
                >
                  <XCircle className="w-3.5 h-3.5 text-rose-400" />
                  <span>{g}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        /* Completed Card (Win / Loss Screen) */
        <div className="w-full bg-slate-900/90 border border-slate-800 rounded-3xl p-5 flex flex-col items-center text-center gap-4 animate-fadeIn shadow-2xl">
          <div className="flex items-center gap-2">
            {isWon ? (
              <div className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-black flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" /> Correct in {guesses.length}/{maxGuesses} attempts!
              </div>
            ) : (
              <div className="px-3 py-1 rounded-full bg-rose-500/20 text-rose-400 text-xs font-black flex items-center gap-1.5">
                <XCircle className="w-4 h-4" /> Revealed: {targetCeleb.name}
              </div>
            )}
          </div>

          <h3 className="text-xl font-black text-white">
            {targetCeleb.name}
          </h3>

          <div className="flex gap-2 w-full">
            <button
              type="button"
              onClick={handleShare}
              className="flex-1 py-3 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-sm flex items-center justify-center gap-2 transition-all active:scale-95 shadow-lg shadow-emerald-500/20"
            >
              <Share2 className="w-4 h-4" /> {isCopied ? 'Copied to Clipboard! ✅' : 'Share Result'}
            </button>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-slate-400 pt-1">
            <Clock className="w-3.5 h-3.5 text-slate-500" />
            <span>Next daily celebrity in <b>{hours}h {minutes}m</b></span>
          </div>
        </div>
      )}
    </div>
  );
};
