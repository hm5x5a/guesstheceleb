import React, { useState } from 'react';
import { Eye, EyeOff, Play, Sparkles } from 'lucide-react';

interface DemoItem {
  id: string;
  title: string;
  category: string;
  hint: string;
  // High quality SVG data uri placeholders showcasing stylized silhouettes
  maskedSvg: string;
  revealedSvg: string;
}

const DEMOS: DemoItem[] = [
  {
    id: 'demo-1',
    title: 'The Iconic Fade Haircut',
    category: 'Hairline Guess',
    hint: 'Famous championship forward',
    maskedSvg: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="500" viewBox="0 0 400 500"><defs><linearGradient id="g1" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="%231e293b"/><stop offset="100%" stop-color="%230f172a"/></linearGradient></defs><rect width="400" height="500" fill="url(%23g1)"/><circle cx="200" cy="260" r="110" fill="%23f59e0b"/><path d="M120 400 Q200 320 280 400 L300 500 L100 500 Z" fill="%233b82f6"/><rect x="80" y="80" width="240" height="150" rx="30" fill="%23000000"/><text x="200" y="160" text-anchor="middle" fill="%23ffffff" font-size="20" font-family="sans-serif" font-weight="bold">BLACKED OUT</text></svg>',
    revealedSvg: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="500" viewBox="0 0 400 500"><defs><linearGradient id="g2" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="%231e293b"/><stop offset="100%" stop-color="%230f172a"/></linearGradient></defs><rect width="400" height="500" fill="url(%23g2)"/><path d="M100 210 Q200 60 300 210 Q200 120 100 210" fill="%2318181b"/><circle cx="200" cy="260" r="110" fill="%23f59e0b"/><path d="M120 400 Q200 320 280 400 L300 500 L100 500 Z" fill="%233b82f6"/><circle cx="165" cy="240" r="10" fill="%230f172a"/><circle cx="235" cy="240" r="10" fill="%230f172a"/><path d="M170 290 Q200 320 230 290" stroke="%230f172a" stroke-width="6" fill="none"/></svg>',
  },
  {
    id: 'demo-2',
    title: 'The Legendary Beard',
    category: 'Beard Guess',
    hint: 'Award-winning soundtrack composer',
    maskedSvg: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="500" viewBox="0 0 400 500"><defs><linearGradient id="g3" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="%23312e81"/><stop offset="100%" stop-color="%231e1b4b"/></linearGradient></defs><rect width="400" height="500" fill="url(%23g3)"/><circle cx="200" cy="220" r="100" fill="%23fbbf24"/><circle cx="165" cy="200" r="12" fill="%231e1b4b"/><circle cx="235" cy="200" r="12" fill="%231e1b4b"/><rect x="80" y="270" width="240" height="180" rx="36" fill="%23000000"/><text x="200" y="360" text-anchor="middle" fill="%23ffffff" font-size="20" font-family="sans-serif" font-weight="bold">BLACKED OUT</text></svg>',
    revealedSvg: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="500" viewBox="0 0 400 500"><defs><linearGradient id="g4" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="%23312e81"/><stop offset="100%" stop-color="%231e1b4b"/></linearGradient></defs><rect width="400" height="500" fill="url(%23g4)"/><circle cx="200" cy="220" r="100" fill="%23fbbf24"/><circle cx="165" cy="200" r="12" fill="%231e1b4b"/><circle cx="235" cy="200" r="12" fill="%231e1b4b"/><path d="M120 250 Q200 440 280 250 Q200 320 120 250" fill="%23451a03"/></svg>',
  },
  {
    id: 'demo-3',
    title: 'Eyes Band Blackout',
    category: 'Eyes Strip',
    hint: 'Global pop superstar',
    maskedSvg: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="500" viewBox="0 0 400 500"><defs><linearGradient id="g5" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="%23831843"/><stop offset="100%" stop-color="%23500724"/></linearGradient></defs><rect width="400" height="500" fill="url(%23g5)"/><circle cx="200" cy="250" r="110" fill="%23fed7aa"/><path d="M160 310 Q200 340 240 310" stroke="%23be185d" stroke-width="8" fill="none"/><rect x="50" y="190" width="300" height="75" rx="14" fill="%23000000"/><text x="200" y="235" text-anchor="middle" fill="%23ffffff" font-size="18" font-family="sans-serif" font-weight="bold">WHO IS THIS?</text></svg>',
    revealedSvg: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="500" viewBox="0 0 400 500"><defs><linearGradient id="g6" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="%23831843"/><stop offset="100%" stop-color="%23500724"/></linearGradient></defs><rect width="400" height="500" fill="url(%23g6)"/><circle cx="200" cy="250" r="110" fill="%23fed7aa"/><circle cx="160" cy="225" r="14" fill="%230284c7"/><circle cx="240" cy="225" r="14" fill="%230284c7"/><path d="M160 310 Q200 340 240 310" stroke="%23be185d" stroke-width="8" fill="none"/></svg>',
  },
];

interface DemoGalleryProps {
  onLoadSample?: (url: string) => void;
}

export const DemoGallery: React.FC<DemoGalleryProps> = ({ onLoadSample }) => {
  const [revealedMap, setRevealedMap] = useState<Record<string, boolean>>({});

  const toggleReveal = (id: string) => {
    setRevealedMap((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <section className="w-full py-16 px-4 sm:px-6 max-w-7xl mx-auto">
      <div className="text-center max-w-2xl mx-auto mb-12">
        <h2 className="text-xs uppercase tracking-widest text-indigo-400 font-bold mb-2 flex items-center justify-center gap-1.5">
          <Sparkles className="w-4 h-4 text-amber-400" /> Interactive Gallery
        </h2>
        <p className="text-2xl sm:text-3xl font-black text-white tracking-tight">
          Trending Formats on TikTok & Reels
        </p>
        <p className="text-sm text-slate-400 mt-2">
          Tap each card below to test the instant reveal animation.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {DEMOS.map((d) => {
          const isRevealed = !!revealedMap[d.id];
          return (
            <div
              key={d.id}
              className="bg-slate-900/60 border border-slate-800 rounded-3xl overflow-hidden shadow-xl flex flex-col group hover:border-slate-700 transition-all"
            >
              {/* Image Preview Box */}
              <div
                onClick={() => toggleReveal(d.id)}
                className="relative aspect-[4/5] bg-slate-950 overflow-hidden cursor-pointer select-none"
              >
                <img
                  src={isRevealed ? d.revealedSvg : d.maskedSvg}
                  alt={d.title}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-102"
                />

                {/* Interactive Tap Hint */}
                <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-full text-xs font-semibold text-white flex items-center gap-1.5 shadow-md">
                  {isRevealed ? (
                    <>
                      <EyeOff className="w-3.5 h-3.5 text-slate-400" /> Mask
                    </>
                  ) : (
                    <>
                      <Eye className="w-3.5 h-3.5 text-indigo-400" /> Tap to Reveal
                    </>
                  )}
                </div>

                <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-lg text-[11px] font-medium text-slate-300">
                  {d.category}
                </div>
              </div>

              {/* Card Meta */}
              <div className="p-5 flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-base text-white">{d.title}</h3>
                </div>
                <p className="text-xs text-slate-400">
                  <span className="text-indigo-400 font-semibold">Hint:</span> {d.hint}
                </p>

                {onLoadSample && (
                  <button
                    type="button"
                    onClick={() => onLoadSample(d.revealedSvg)}
                    className="mt-2 w-full py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-750 text-xs font-semibold text-slate-200 border border-slate-700/60 flex items-center justify-center gap-1.5 transition-all active:scale-98"
                  >
                    <Play className="w-3 h-3 fill-current text-indigo-400" /> Try this sample in editor
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
