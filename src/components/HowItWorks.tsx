import React from 'react';
import { UploadCloud, Paintbrush, Share2 } from 'lucide-react';

export const HowItWorks: React.FC = () => {
  const steps = [
    {
      num: '01',
      icon: UploadCloud,
      title: 'Upload or Paste Photo',
      desc: 'Drag & drop any portrait, paste from clipboard, or pick from your phone gallery. Zero signup required.',
      color: 'from-blue-500 to-indigo-600',
    },
    {
      num: '02',
      icon: Paintbrush,
      title: 'Blackout Key Features',
      desc: 'Use one-tap presets (Hairline, Beard, Eyes) or paint blackout masks with feathered brushes & shape tools.',
      color: 'from-indigo-500 to-purple-600',
    },
    {
      num: '03',
      icon: Share2,
      title: 'Reveal & Export Video',
      desc: 'Choose your reveal animation (Fade, Wipe, Zoom, or Instant Cut) and export a 1080p MP4 ready for Reels & TikTok.',
      color: 'from-purple-500 to-pink-600',
    },
  ];

  return (
    <section className="w-full py-16 px-4 sm:px-6 max-w-7xl mx-auto">
      <div className="text-center max-w-2xl mx-auto mb-12">
        <h2 className="text-xs uppercase tracking-widest text-indigo-400 font-bold mb-2">
          Simple 30-Second Flow
        </h2>
        <p className="text-2xl sm:text-3xl font-black text-white tracking-tight">
          How to Create Viral Guess Who Content
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {steps.map((st) => {
          const Icon = st.icon;
          return (
            <div
              key={st.num}
              className="relative p-6 rounded-3xl bg-slate-900/60 border border-slate-800 backdrop-blur-sm flex flex-col gap-4 group hover:border-slate-700 transition-all"
            >
              <div className="flex items-center justify-between">
                <div
                  className={`w-12 h-12 rounded-2xl bg-gradient-to-tr ${st.color} flex items-center justify-center text-white shadow-lg`}
                >
                  <Icon className="w-6 h-6" />
                </div>
                <span className="text-3xl font-black text-slate-700/60 font-mono">
                  {st.num}
                </span>
              </div>
              <div>
                <h3 className="text-lg font-bold text-white mb-1.5">{st.title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed">{st.desc}</p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
