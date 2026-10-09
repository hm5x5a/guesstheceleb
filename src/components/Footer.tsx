import React from 'react';
import { Smartphone, Sparkles, Share, PlusSquare } from 'lucide-react';
import { APP_NAME, PLAY_URL, CONTACT_EMAIL, DOMAIN } from '../config';

interface FooterProps {
  onOpenPrivacy: () => void;
  onOpenTerms: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenPrivacy, onOpenTerms }) => {
  return (
    <footer className="w-full bg-slate-950 border-t border-slate-850 py-12 px-4 sm:px-6 mt-16 text-slate-400">
      <div className="max-w-7xl mx-auto flex flex-col gap-10">
        {/* Top Mobile App Callout Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Android Google Play Card */}
          <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
                <Smartphone className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">Get the Android App</h4>
                <p className="text-xs text-slate-400">
                  Instant native sharing to Instagram, TikTok, and Gallery
                </p>
              </div>
            </div>
            <a
              href={PLAY_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs whitespace-nowrap shadow-md shadow-emerald-600/20 transition-all shrink-0 active:scale-95"
            >
              Google Play
            </a>
          </div>

          {/* iOS PWA Add to Home Screen Hint */}
          <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shrink-0">
              <Share className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
                iPhone & iPad Users <span className="text-[10px] font-normal px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300">PWA</span>
              </h4>
              <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                Tap <Share className="w-3 h-3 inline text-slate-300" /> Share then <PlusSquare className="w-3 h-3 inline text-slate-300" /> <b>Add to Home Screen</b> for offline use.
              </p>
            </div>
          </div>
        </div>

        {/* Links and Copyright Row */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-slate-900 text-xs">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-indigo-400" />
            <span className="font-semibold text-slate-300">{APP_NAME}</span>
            <span>·</span>
            <span>© {new Date().getFullYear()} {DOMAIN}</span>
          </div>

          <div className="flex items-center gap-5">
            <button
              type="button"
              onClick={onOpenPrivacy}
              className="hover:text-white transition-colors"
            >
              Privacy Policy
            </button>
            <button
              type="button"
              onClick={onOpenTerms}
              className="hover:text-white transition-colors"
            >
              Terms of Service
            </button>
            <a
              href={`mailto:${CONTACT_EMAIL}`}
              className="hover:text-white transition-colors"
            >
              Contact Support
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};
