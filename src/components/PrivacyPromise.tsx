import React from 'react';
import { ShieldCheck, HardDrive, EyeOff, Zap } from 'lucide-react';

export const PrivacyPromise: React.FC = () => {
  return (
    <section className="w-full py-12 px-4 sm:px-6 max-w-7xl mx-auto">
      <div className="relative rounded-3xl bg-gradient-to-br from-indigo-950/60 via-slate-900/80 to-purple-950/60 border border-indigo-500/20 p-8 sm:p-12 overflow-hidden shadow-2xl">
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-bold mb-4">
            <ShieldCheck className="w-4 h-4" /> 100% Client-Side Privacy
          </div>
          <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight mb-4">
            Your photos never leave your device.
          </h2>
          <p className="text-slate-300 text-sm sm:text-base leading-relaxed mb-6">
            Unlike other video generators that send your media to remote cloud servers,
            GuessTheCelebMaker executes all brush compositing, mask rendering, and MP4 video encoding right in your device’s GPU and memory.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-indigo-400 shrink-0">
                <HardDrive className="w-4 h-4" />
              </div>
              <span className="text-xs font-semibold text-slate-200">
                Zero Cloud Uploads
              </span>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-indigo-400 shrink-0">
                <EyeOff className="w-4 h-4" />
              </div>
              <span className="text-xs font-semibold text-slate-200">
                No Accounts or Tracking
              </span>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-indigo-400 shrink-0">
                <Zap className="w-4 h-4" />
              </div>
              <span className="text-xs font-semibold text-slate-200">
                Instant Local Encoding
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
