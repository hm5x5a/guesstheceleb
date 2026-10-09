import React, { useState, useEffect } from 'react';
import { Header } from '../components/Header';
import { DailyWordleMode } from '../components/DailyWordleMode';
import { HostQuizMode } from '../components/HostQuizMode';
import { DeckMaker } from '../components/DeckMaker';
import { VideoExportStudio } from '../components/VideoExportStudio';
import { HowItWorks } from '../components/HowItWorks';
import { FAQ } from '../components/FAQ';
import { PrivacyPromise } from '../components/PrivacyPromise';
import { Footer } from '../components/Footer';
import { PrivacyModal } from './PrivacyModal';
import { TermsModal } from './TermsModal';
import { CURATED_CELEBRITIES } from '../data/celebrityLibrary';
import type { CelebrityCard, AppTab } from '../types/game';

export const Home: React.FC = () => {
  const [activeTab, setActiveTab] = useState<AppTab>('daily');
  const [cards, setCards] = useState<CelebrityCard[]>(CURATED_CELEBRITIES);

  // Theme state
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('gtc_theme');
      if (saved) return saved === 'dark';
      return window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? true;
    }
    return true;
  });

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      document.body.classList.add('dark');
      localStorage.setItem('gtc_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      document.body.classList.remove('dark');
      localStorage.setItem('gtc_theme', 'light');
    }
  }, [darkMode]);

  // Streak state
  const [streak] = useState<number>(() => {
    try {
      return parseInt(localStorage.getItem('gtc_streak_count') || '3', 10);
    } catch {
      return 3;
    }
  });

  // Modals
  const [isPrivacyModalOpen, setIsPrivacyModalOpen] = useState(false);
  const [isTermsModalOpen, setIsTermsModalOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-[#080a0f] text-slate-100 transition-colors selection:bg-emerald-500 selection:text-slate-950">
      {/* Sleek App Navigation Header */}
      <Header
        activeTab={activeTab}
        onChangeTab={setActiveTab}
        dailyStreak={streak}
        darkMode={darkMode}
        onToggleDarkMode={() => setDarkMode(!darkMode)}
      />

      {/* Main Interactive Workspaces */}
      <main className="flex-1 flex flex-col items-center w-full px-3 sm:px-6 py-6 sm:py-8 max-w-6xl mx-auto">
        {activeTab === 'daily' && <DailyWordleMode />}
        {activeTab === 'host' && (
          <HostQuizMode
            cards={cards}
            onExitToEditor={() => setActiveTab('maker')}
          />
        )}
        {activeTab === 'maker' && (
          <DeckMaker
            cards={cards}
            onChangeCards={setCards}
            onStartGame={() => setActiveTab('host')}
          />
        )}
        {activeTab === 'export' && <VideoExportStudio cards={cards} />}

        {/* Informative Creator & Landing Sections Below */}
        <div className="w-full mt-16 pt-10 border-t border-slate-900">
          <HowItWorks />
          <PrivacyPromise />
          <FAQ />
        </div>
      </main>

      {/* Modern Footer */}
      <Footer
        onOpenPrivacy={() => setIsPrivacyModalOpen(true)}
        onOpenTerms={() => setIsTermsModalOpen(true)}
      />

      {/* Modals */}
      <PrivacyModal
        isOpen={isPrivacyModalOpen}
        onClose={() => setIsPrivacyModalOpen(false)}
      />
      <TermsModal
        isOpen={isTermsModalOpen}
        onClose={() => setIsTermsModalOpen(false)}
      />
    </div>
  );
};
