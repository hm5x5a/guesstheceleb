import { X, Clock, Smartphone, Sparkles } from 'lucide-react';
import { getTimeUntilReset } from '../storage/usage';
import { PLAY_URL, DAILY_LIMIT } from '../config';

interface LimitModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenSavedProjects: () => void;
}

export const LimitModal: React.FC<LimitModalProps> = ({
  isOpen,
  onClose,
  onOpenSavedProjects,
}) => {
  if (!isOpen) return null;

  const { hours, minutes } = getTimeUntilReset();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-700 rounded-3xl p-6 text-white shadow-2xl flex flex-col items-center text-center gap-4">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="w-14 h-14 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center mt-2">
          <Clock className="w-8 h-8" />
        </div>

        <div className="flex flex-col gap-1">
          <h2 className="text-xl font-bold tracking-tight">Daily Free Limit Reached</h2>
          <p className="text-xs text-slate-400">
            You've used all {DAILY_LIMIT} free photo uploads for today.
          </p>
        </div>

        {/* Countdown to Midnight */}
        <div className="w-full bg-slate-800/80 border border-slate-700/60 rounded-2xl p-4 flex flex-col items-center gap-1">
          <span className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold">
            Uploads Reset In
          </span>
          <span className="text-2xl font-black text-amber-400 font-mono">
            {hours}h {minutes}m
          </span>
          <span className="text-[11px] text-slate-400">
            Resets at midnight local time
          </span>
        </div>

        {/* Good News / Tips */}
        <div className="w-full bg-indigo-950/40 border border-indigo-500/20 rounded-2xl p-3.5 text-left flex items-start gap-3">
          <Sparkles className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
          <div className="text-xs text-indigo-200">
            <span className="font-semibold block text-white mb-0.5">Good news:</span>
            You can still edit, mask, and export your existing saved projects as many times as you like without using any credits!
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-2 w-full pt-1">
          <button
            type="button"
            onClick={() => {
              onClose();
              onOpenSavedProjects();
            }}
            className="w-full py-3 px-4 min-h-[44px] rounded-xl font-bold text-sm bg-indigo-600 hover:bg-indigo-500 text-white transition-all active:scale-[0.99]"
          >
            Open Saved Projects
          </button>

          <a
            href={PLAY_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-2.5 px-4 min-h-[44px] rounded-xl font-medium text-xs bg-slate-800 hover:bg-slate-750 text-slate-300 flex items-center justify-center gap-2 border border-slate-700 transition-all"
          >
            <Smartphone className="w-4 h-4 text-emerald-400" /> Get Android App for Play Store
          </a>
        </div>
      </div>
    </div>
  );
};
