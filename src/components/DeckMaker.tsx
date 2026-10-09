import React, { useState, useRef } from 'react';
import {
  Plus,
  Trash2,
  Play,
  Sparkles,
  Undo2,
  Redo2,
  Scissors,
  Upload,
} from 'lucide-react';
import type { CelebrityCard, CropBox, CropCategory } from '../types/game';
import { processUploadedFile } from '../editor/imageLoader';
import { CURATED_CELEBRITIES } from '../data/celebrityLibrary';

interface DeckMakerProps {
  cards: CelebrityCard[];
  onChangeCards: (cards: CelebrityCard[]) => void;
  onStartGame: () => void;
}

export const DeckMaker: React.FC<DeckMakerProps> = ({
  cards,
  onChangeCards,
  onStartGame,
}) => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Undo / Redo history for crops
  const [history, setHistory] = useState<CelebrityCard[][]>([cards]);
  const [historyIndex, setHistoryIndex] = useState(0);

  const activeCard = cards[selectedIndex] || cards[0];

  const pushHistory = (newCards: CelebrityCard[]) => {
    const updatedHistory = history.slice(0, historyIndex + 1);
    updatedHistory.push(newCards);
    setHistory(updatedHistory);
    setHistoryIndex(updatedHistory.length - 1);
    onChangeCards(newCards);
  };

  const handleUndo = () => {
    if (historyIndex > 0) {
      const prev = history[historyIndex - 1];
      setHistoryIndex(historyIndex - 1);
      onChangeCards(prev);
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      const next = history[historyIndex + 1];
      setHistoryIndex(historyIndex + 1);
      onChangeCards(next);
    }
  };

  // Add new image from file input
  const handleUploadFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const newItems: CelebrityCard[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      try {
        const processed = await processUploadedFile(file);
        const url = URL.createObjectURL(processed.blob);
        const nameGuess = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');

        newItems.push({
          id: `card_${Date.now()}_${i}`,
          name: nameGuess.charAt(0).toUpperCase() + nameGuess.slice(1),
          category: 'hair',
          imageUrl: url,
          imageBlob: processed.blob,
          imageWidth: processed.width,
          imageHeight: processed.height,
          crop: { x: 0.15, y: 0.12, width: 0.70, height: 0.28 },
          difficulty: 'medium',
        });
      } catch (err) {
        console.error('Upload error for file:', file.name, err);
      }
    }

    if (newItems.length > 0) {
      const updated = [...cards, ...newItems];
      pushHistory(updated);
      setSelectedIndex(cards.length);
    }
  };

  // Add celebrity from curated library
  const handleAddSample = (celeb: CelebrityCard) => {
    const copy: CelebrityCard = {
      ...celeb,
      id: `card_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    };
    const updated = [...cards, copy];
    pushHistory(updated);
    setSelectedIndex(updated.length - 1);
  };

  const handleDeleteCard = (index: number) => {
    if (cards.length <= 1) {
      alert('Keep at least 1 celebrity card in your deck.');
      return;
    }
    const updated = cards.filter((_, idx) => idx !== index);
    pushHistory(updated);
    setSelectedIndex(Math.max(0, index - 1));
  };

  // Preset crop coordinates
  const applyPresetCrop = (category: CropCategory) => {
    if (!activeCard) return;

    let newCrop: CropBox;
    switch (category) {
      case 'hair':
        newCrop = { x: 0.15, y: 0.10, width: 0.70, height: 0.26 };
        break;
      case 'beard':
        newCrop = { x: 0.20, y: 0.52, width: 0.60, height: 0.30 };
        break;
      case 'eyes':
        newCrop = { x: 0.15, y: 0.35, width: 0.70, height: 0.18 };
        break;
      case 'nose':
        newCrop = { x: 0.28, y: 0.40, width: 0.44, height: 0.24 };
        break;
      default:
        newCrop = { x: 0.15, y: 0.15, width: 0.70, height: 0.30 };
    }

    const updated = cards.map((c, idx) =>
      idx === selectedIndex ? { ...c, category, crop: newCrop } : c
    );
    pushHistory(updated);
  };

  const updateActiveCard = (patch: Partial<CelebrityCard>) => {
    const updated = cards.map((c, idx) =>
      idx === selectedIndex ? { ...c, ...patch } : c
    );
    pushHistory(updated);
  };

  const updateCrop = (patch: Partial<CropBox>) => {
    if (!activeCard) return;
    const newCrop = { ...activeCard.crop, ...patch };
    updateActiveCard({ crop: newCrop });
  };

  return (
    <div className="w-full max-w-6xl mx-auto flex flex-col gap-6 animate-fadeIn">
      {/* Hidden file input supporting multiple files */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/png,image/jpeg,image/webp"
        className="hidden"
        onChange={(e) => handleUploadFiles(e.target.files)}
      />

      {/* Top Deck Action Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-900/90 border border-slate-800 p-4 sm:p-5 rounded-3xl backdrop-blur-md">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <h2 className="text-lg sm:text-xl font-black text-white tracking-tight">
              Deck Maker & Crop Studio
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Crop each celebrity by hair, beard, or eyes, then launch Host Mode to play 1 by 1.
          </p>
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          {/* Undo / Redo */}
          <div className="flex items-center gap-1 bg-slate-800/80 p-1 rounded-xl border border-slate-700/60">
            <button
              type="button"
              onClick={handleUndo}
              disabled={historyIndex <= 0}
              title="Undo Crop"
              className="p-2 rounded-lg text-slate-300 hover:text-white disabled:opacity-30 disabled:hover:text-slate-300 transition-colors"
            >
              <Undo2 className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={handleRedo}
              disabled={historyIndex >= history.length - 1}
              title="Redo Crop"
              className="p-2 rounded-lg text-slate-300 hover:text-white disabled:opacity-30 disabled:hover:text-slate-300 transition-colors"
            >
              <Redo2 className="w-4 h-4" />
            </button>
          </div>

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white font-bold text-xs flex items-center gap-1.5 transition-all active:scale-95"
          >
            <Upload className="w-4 h-4" /> Add Photos
          </button>

          <button
            type="button"
            onClick={onStartGame}
            className="flex-1 sm:flex-initial px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/25 transition-all active:scale-95"
          >
            <Play className="w-4 h-4 fill-current" /> Start Game ({cards.length})
          </button>
        </div>
      </div>

      {/* Deck Thumbnails Horizontal Reel */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between text-xs font-bold text-slate-400 px-1">
          <span>Deck Queue ({cards.length} Celebrities)</span>
          <span>Click to select & crop</span>
        </div>

        <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-none">
          {cards.map((card, idx) => {
            const isSelected = idx === selectedIndex;
            return (
              <div
                key={card.id}
                onClick={() => setSelectedIndex(idx)}
                className={`group relative shrink-0 w-24 sm:w-28 rounded-2xl border-2 overflow-hidden cursor-pointer transition-all ${
                  isSelected
                    ? 'border-emerald-400 ring-2 ring-emerald-400/30 shadow-lg shadow-emerald-400/10'
                    : 'border-slate-800 hover:border-slate-700 bg-slate-900/60'
                }`}
              >
                <div className="aspect-[4/5] bg-slate-950 overflow-hidden relative">
                  <img
                    src={card.imageUrl}
                    alt={card.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-1 left-1 px-1.5 py-0.5 rounded-md bg-black/75 text-[10px] font-black text-white">
                    #{idx + 1}
                  </div>
                </div>

                <div className="p-2 bg-slate-900 flex flex-col">
                  <span className="text-[11px] font-bold text-white truncate">
                    {card.name || 'Untitled'}
                  </span>
                  <span className="text-[10px] text-slate-400 capitalize">
                    {card.category}
                  </span>
                </div>
              </div>
            );
          })}

          {/* Quick Add Button */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="shrink-0 w-24 sm:w-28 aspect-[4/5] rounded-2xl border-2 border-dashed border-slate-800 hover:border-slate-700 hover:bg-slate-900/50 flex flex-col items-center justify-center gap-2 text-slate-400 hover:text-white transition-all"
          >
            <Plus className="w-6 h-6" />
            <span className="text-[11px] font-bold">Add Photo</span>
          </button>
        </div>
      </div>

      {/* Editor Split View: Interactive Crop Box on Left, Controls & Live Preview on Right */}
      {activeCard && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left: Interactive Photo with Visual Crop Overlay */}
          <div className="lg:col-span-7 bg-slate-900/90 border border-slate-800 rounded-3xl p-5 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Scissors className="w-4 h-4 text-emerald-400" />
                <span className="text-sm font-bold text-white">
                  Crop Feature: #{selectedIndex + 1} {activeCard.name}
                </span>
              </div>
              <button
                type="button"
                onClick={() => handleDeleteCard(selectedIndex)}
                className="text-xs text-rose-400 hover:text-rose-300 flex items-center gap-1 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" /> Remove
              </button>
            </div>

            {/* Visual Crop Surface */}
            <div className="relative aspect-[4/5] max-h-[500px] w-full bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden flex items-center justify-center select-none">
              <img
                src={activeCard.imageUrl}
                alt={activeCard.name}
                className="w-full h-full object-contain pointer-events-none"
              />

              {/* Shaded overlay outside crop box */}
              <div className="absolute inset-0 pointer-events-none bg-black/50" />

              {/* Highlighted Crop Area Box */}
              <div
                className="absolute border-2 border-emerald-400 bg-transparent shadow-[0_0_0_9999px_rgba(0,0,0,0.55)] rounded-lg pointer-events-none"
                style={{
                  left: `${activeCard.crop.x * 100}%`,
                  top: `${activeCard.crop.y * 100}%`,
                  width: `${activeCard.crop.width * 100}%`,
                  height: `${activeCard.crop.height * 100}%`,
                }}
              >
                <div className="absolute -top-3 left-2 px-2 py-0.5 rounded bg-emerald-400 text-slate-950 font-black text-[10px] uppercase tracking-wider">
                  {activeCard.category} Crop
                </div>
              </div>
            </div>

            {/* 1-Click Feature Crop Presets */}
            <div className="flex flex-col gap-2">
              <span className="text-xs font-bold text-slate-400">
                1-Click Crop Presets:
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <button
                  type="button"
                  onClick={() => applyPresetCrop('hair')}
                  className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                    activeCard.category === 'hair'
                      ? 'bg-emerald-500 text-slate-950 shadow-md'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  💈 Hair / Fade
                </button>

                <button
                  type="button"
                  onClick={() => applyPresetCrop('beard')}
                  className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                    activeCard.category === 'beard'
                      ? 'bg-emerald-500 text-slate-950 shadow-md'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  🧔 Beard / Jaw
                </button>

                <button
                  type="button"
                  onClick={() => applyPresetCrop('eyes')}
                  className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                    activeCard.category === 'eyes'
                      ? 'bg-emerald-500 text-slate-950 shadow-md'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  👀 Eyes Band
                </button>

                <button
                  type="button"
                  onClick={() => applyPresetCrop('nose')}
                  className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                    activeCard.category === 'nose'
                      ? 'bg-emerald-500 text-slate-950 shadow-md'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  👃 Nose
                </button>
              </div>
            </div>
          </div>

          {/* Right: Fine-Tune Sliders, Card Details & Real-Time Street View Preview */}
          <div className="lg:col-span-5 flex flex-col gap-5">
            {/* Metadata Fields */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 flex flex-col gap-3.5">
              <h3 className="text-sm font-bold text-white">Celebrity Answer Details</h3>

              <div className="flex flex-col gap-1">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Celebrity Name (Displayed on Reveal)
                </label>
                <input
                  type="text"
                  value={activeCard.name}
                  onChange={(e) => updateActiveCard({ name: e.target.value })}
                  placeholder="e.g. Kanye West"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-emerald-400"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Hint or Subtitle (Optional)
                </label>
                <input
                  type="text"
                  value={activeCard.hint || ''}
                  onChange={(e) => updateActiveCard({ hint: e.target.value })}
                  placeholder="e.g. 24-time Grammy winner, rapper"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-emerald-400"
                />
              </div>
            </div>

            {/* Fine-Tune Crop Position Sliders */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 flex flex-col gap-3">
              <h3 className="text-sm font-bold text-white">Fine-Tune Crop Box</h3>

              <div className="flex flex-col gap-1">
                <div className="flex justify-between text-xs text-slate-400">
                  <span>Vertical Position (Y)</span>
                  <span className="font-mono text-emerald-400">
                    {Math.round(activeCard.crop.y * 100)}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="0.8"
                  step="0.02"
                  value={activeCard.crop.y}
                  onChange={(e) => updateCrop({ y: parseFloat(e.target.value) })}
                  className="w-full accent-emerald-400 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
                />
              </div>

              <div className="flex flex-col gap-1">
                <div className="flex justify-between text-xs text-slate-400">
                  <span>Crop Height</span>
                  <span className="font-mono text-emerald-400">
                    {Math.round(activeCard.crop.height * 100)}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0.1"
                  max="0.6"
                  step="0.02"
                  value={activeCard.crop.height}
                  onChange={(e) => updateCrop({ height: parseFloat(e.target.value) })}
                  className="w-full accent-emerald-400 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
                />
              </div>

              <div className="flex flex-col gap-1">
                <div className="flex justify-between text-xs text-slate-400">
                  <span>Crop Width</span>
                  <span className="font-mono text-emerald-400">
                    {Math.round(activeCard.crop.width * 100)}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0.3"
                  max="1.0"
                  step="0.02"
                  value={activeCard.crop.width}
                  onChange={(e) => updateCrop({ width: parseFloat(e.target.value) })}
                  className="w-full accent-emerald-400 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
                />
              </div>
            </div>

            {/* Quick Add From Sample Icons */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 flex flex-col gap-3">
              <span className="text-xs font-bold text-slate-400 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" /> Or Add Iconic Celebrities:
              </span>
              <div className="flex flex-wrap gap-2">
                {CURATED_CELEBRITIES.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => handleAddSample(c)}
                    className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 border border-slate-700/60 flex items-center gap-1 transition-all active:scale-95"
                  >
                    <Plus className="w-3 h-3 text-emerald-400" /> {c.name}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
