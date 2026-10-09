import React, { useState } from 'react';
import { ChevronDown, HelpCircle } from 'lucide-react';
import { APP_NAME, DAILY_LIMIT } from '../config';

export const FAQ: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
      q: 'Are my uploaded photos sent to any server?',
      a: 'Never. Everything runs 100% inside your browser or device using modern WebCodecs and the Canvas API. There is no database, no server processing, and no accounts. Your photos never leave your hardware.',
    },
    {
      q: `How does the ${DAILY_LIMIT} free daily upload limit work?`,
      a: `Every device gets ${DAILY_LIMIT} fresh photo uploads per day. The counter resets automatically at local midnight. Once an image is uploaded, you can re-edit, test different mask presets, and export videos as many times as you want without consuming additional credits.`,
    },
    {
      q: 'Which video formats are exported?',
      a: 'Exports are encoded in high-definition H.264 MP4 (1080x1920 for 9:16 vertical, and 1080x1080 for 1:1 square). These work out of the box with Instagram Reels, TikTok, YouTube Shorts, and WhatsApp.',
    },
    {
      q: 'Can I export still images instead of video?',
      a: 'Yes! You can export a "Before & After" PNG pair with one click, giving you a masked challenge photo and the revealed answer photo for carousel posts.',
    },
    {
      q: 'Why does the export have a frame around the photo?',
      a: `The styled frame keeps your video looking polished and intentional on social media while carrying a subtle attribution link ("Made with ${APP_NAME}"). The frame is designed with safe zones so it never collides with TikTok or Reels interface buttons.`,
    },
    {
      q: 'Does this app use face recognition or celebrity AI identification?',
      a: 'No. The app strictly provides creative blackout brushes and mask presets. We do not run facial recognition or store biometric identities, keeping your workflow completely safe, private, and compliant.',
    },
  ];

  return (
    <section className="w-full py-16 px-4 sm:px-6 max-w-4xl mx-auto">
      <div className="text-center mb-12">
        <h2 className="text-xs uppercase tracking-widest text-indigo-400 font-bold mb-2 flex items-center justify-center gap-1.5">
          <HelpCircle className="w-4 h-4 text-indigo-400" /> Got Questions?
        </h2>
        <p className="text-2xl sm:text-3xl font-black text-white tracking-tight">
          Frequently Asked Questions
        </p>
      </div>

      <div className="flex flex-col gap-3">
        {faqs.map((faq, idx) => {
          const isOpen = openIndex === idx;
          return (
            <div
              key={idx}
              className="rounded-2xl border border-slate-800 bg-slate-900/60 backdrop-blur-sm overflow-hidden transition-all"
            >
              <button
                type="button"
                onClick={() => setOpenIndex(isOpen ? null : idx)}
                className="w-full px-5 py-4 text-left flex items-center justify-between gap-4 font-bold text-sm sm:text-base text-white hover:text-indigo-300 transition-colors"
              >
                <span>{faq.q}</span>
                <ChevronDown
                  className={`w-5 h-5 shrink-0 text-slate-400 transition-transform duration-200 ${
                    isOpen ? 'rotate-180 text-indigo-400' : ''
                  }`}
                />
              </button>
              {isOpen && (
                <div className="px-5 pb-5 pt-1 text-sm text-slate-400 leading-relaxed border-t border-slate-800/60">
                  {faq.a}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
};
