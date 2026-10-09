import React, { useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Minimize2,
  RotateCcw,
  CheckCircle,
  XCircle,
  Sparkles,
  SlidersHorizontal,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import type { CelebrityCard } from '../types/game';
import { CelebrityCardView } from './CelebrityCardView';

interface HostQuizModeProps {
  cards: CelebrityCard[];
  onExitToEditor: () => void;
}

export const HostQuizMode: React.FC<HostQuizModeProps> = ({
  cards,
  onExitToEditor,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [scores, setScores] = useState<Record<string, 'correct' | 'wrong'>>({});
  const [isFullscreen, setIsFullscreen] = useState(false);

  const activeCard = cards[currentIndex] || cards[0];
  const isFinished = currentIndex >= cards.length;

  const handleNext = () => {
    if (currentIndex < cards.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      setCurrentIndex(cards.length); // trigger finished screen
      confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  const handleMark = (status: 'correct' | 'wrong') => {
    if (!activeCard) return;
    setScores((prev) => ({ ...prev, [activeCard.id]: status }));
    if (status === 'correct') {
      confetti({ particleCount: 40, spread: 45, origin: { y: 0.7 } });
    }
    handleNext();
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  const correctCount = Object.values(scores).filter((s) => s === 'correct').length;

  if (isFinished) {
    return (
      <div className="w-full max-w-xl mx-auto flex flex-col items-center justify-center p-8 bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl text-center gap-6 animate-fadeIn">
        <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center">
          <Sparkles className="w-8 h-8" />
        </div>

        <div className="flex flex-col gap-1">
          <h2 className="text-2xl font-black text-white">Quiz Completed!</h2>
          <p className="text-sm text-slate-400">
            Street game finished with {correctCount} of {cards.length} correct guesses.
          </p>
        </div>

        <div className="w-full bg-slate-950 p-4 rounded-2xl border border-slate-800 flex items-center justify-around font-mono text-lg">
          <div className="flex flex-col items-center">
            <span className="text-xs text-slate-400 font-sans">Correct</span>
            <span className="text-emerald-400 font-black">{correctCount}</span>
          </div>
          <div className="w-px h-8 bg-slate-800" />
          <div className="flex flex-col items-center">
            <span className="text-xs text-slate-400 font-sans">Total Cards</span>
            <span className="text-white font-black">{cards.length}</span>
          </div>
        </div>

        <div className="flex gap-3 w-full">
          <button
            type="button"
            onClick={() => {
              setCurrentIndex(0);
              setScores({});
            }}
            className="flex-1 py-3 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-sm flex items-center justify-center gap-2 transition-all active:scale-95"
          >
            <RotateCcw className="w-4 h-4" /> Play Again
          </button>
          <button
            type="button"
            onClick={onExitToEditor}
            className="flex-1 py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-sm border border-slate-700 transition-all active:scale-95"
          >
            Edit Deck
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-xl mx-auto flex flex-col items-center gap-4 animate-fadeIn">
      {/* Top Street Quiz HUD */}
      <div className="w-full flex items-center justify-between px-2">
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-xl bg-slate-900 border border-slate-800 text-xs font-black text-emerald-400 font-mono">
            {currentIndex + 1} / {cards.length}
          </span>
          <span className="text-xs font-semibold text-slate-400 hidden sm:inline">
            Celebrity Deck
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={toggleFullscreen}
            title="Toggle Fullscreen"
            className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
          <button
            type="button"
            onClick={onExitToEditor}
            className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-bold text-slate-300 hover:text-white flex items-center gap-1.5 transition-colors"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" /> Deck Maker
          </button>
        </div>
      </div>

      {/* Main Celebrity Card (Crop view + Instant Hold to Reveal) */}
      <div className="w-full aspect-[4/5] sm:aspect-[3/4] max-h-[68vh] min-h-[420px]">
        {activeCard && (
          <CelebrityCardView
            card={activeCard}
            containerClassName="w-full h-full"
            showNameOnReveal={true}
            allowHoldToReveal={true}
          />
        )}
      </div>

      {/* Host Street Controls Bar */}
      <div className="w-full flex items-center justify-between gap-3 pt-1">
        <button
          type="button"
          onClick={handlePrev}
          disabled={currentIndex === 0}
          className="p-3 rounded-2xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white disabled:opacity-30 disabled:hover:bg-slate-900 transition-colors"
          title="Previous celebrity"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>

        {/* Quick Scoring Buttons */}
        <div className="flex items-center gap-2 flex-1 justify-center">
          <button
            type="button"
            onClick={() => handleMark('wrong')}
            className="flex-1 py-3 px-3 rounded-2xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-400 font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-all active:scale-95"
          >
            <XCircle className="w-4 h-4" /> Wrong
          </button>

          <button
            type="button"
            onClick={() => handleMark('correct')}
            className="flex-1 py-3 px-3 rounded-2xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-400 font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-all active:scale-95"
          >
            <CheckCircle className="w-4 h-4" /> Correct
          </button>
        </div>

        <button
          type="button"
          onClick={handleNext}
          className="p-3 rounded-2xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white transition-colors"
          title="Next celebrity"
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      </div>

      <p className="text-[11px] text-slate-500 text-center font-medium">
        💡 Hold screen or Spacebar to reveal answer. Release to hide.
      </p>
    </div>
  );
};
