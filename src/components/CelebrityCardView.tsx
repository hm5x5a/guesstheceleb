import React, { useState, useEffect } from 'react';
import type { CelebrityCard } from '../types/game';

interface CelebrityCardViewProps {
  card: CelebrityCard;
  isRevealedOverride?: boolean;
  onRevealStateChange?: (isRevealing: boolean) => void;
  showNameOnReveal?: boolean;
  containerClassName?: string;
  allowHoldToReveal?: boolean;
}

export const CelebrityCardView: React.FC<CelebrityCardViewProps> = ({
  card,
  isRevealedOverride,
  onRevealStateChange,
  showNameOnReveal = true,
  containerClassName = '',
  allowHoldToReveal = true,
}) => {
  const [isPressing, setIsPressing] = useState(false);
  const isRevealing = isRevealedOverride !== undefined ? isRevealedOverride : isPressing;

  const handlePointerDown = (e: React.PointerEvent) => {
    if (!allowHoldToReveal) return;
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
    setIsPressing(true);
    onRevealStateChange?.(true);
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (!allowHoldToReveal) return;
    try {
      (e.target as HTMLElement).releasePointerCapture?.(e.pointerId);
    } catch {
      // safe fallback
    }
    setIsPressing(false);
    onRevealStateChange?.(false);
  };

  const handlePointerCancel = () => {
    if (!allowHoldToReveal) return;
    setIsPressing(false);
    onRevealStateChange?.(false);
  };

  // Keyboard Spacebar hold support
  useEffect(() => {
    if (!allowHoldToReveal) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' && !e.repeat && (document.activeElement?.tagName !== 'INPUT')) {
        e.preventDefault();
        setIsPressing(true);
        onRevealStateChange?.(true);
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault();
        setIsPressing(false);
        onRevealStateChange?.(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [allowHoldToReveal, onRevealStateChange]);

  // Compute transform and positioning for the cropped viewport
  // If cropped: we zoom and translate the image so the crop box fills the frame
  const crop = card.crop || { x: 0.15, y: 0.15, width: 0.7, height: 0.3 };

  // Scale factor needed to fill the viewport width with crop.width
  const scale = 1 / Math.max(0.1, crop.width);
  // Offsets so the crop box center aligns with container center (50% 50%)
  const originX = (crop.x + crop.width / 2) * 100;
  const originY = (crop.y + crop.height / 2) * 100;

  return (
    <div
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerCancel}
      className={`relative select-none overflow-hidden rounded-3xl border-2 transition-colors cursor-pointer touch-none bg-[#0a0c10] shadow-2xl flex items-center justify-center ${
        isRevealing
          ? 'border-emerald-500 shadow-emerald-500/20'
          : 'border-slate-800 hover:border-slate-700'
      } ${containerClassName}`}
      style={{ touchAction: 'none' }}
    >
      {/* Photo Container */}
      <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
        {isRevealing ? (
          /* Full Image (Instant Reveal) */
          <img
            src={card.imageUrl}
            alt={card.name}
            className="w-full h-full object-contain pointer-events-none animate-fadeIn"
          />
        ) : (
          /* Cropped Feature Viewport (Hair, Beard, Eyes, etc.) */
          <div className="relative w-full h-full overflow-hidden flex items-center justify-center">
            <img
              src={card.imageUrl}
              alt="Cropped Feature"
              className="w-full h-full object-contain pointer-events-none transition-transform duration-75"
              style={{
                transformOrigin: `${originX}% ${originY}%`,
                transform: `scale(${scale})`,
              }}
            />
          </div>
        )}
      </div>

      {/* Top Category Badge */}
      <div className="absolute top-3.5 left-3.5 z-10 pointer-events-none flex items-center gap-2">
        <span className="px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-black/75 backdrop-blur-md border border-white/10 text-white shadow-md">
          {card.category === 'hair' && '💈 Guess by Hair'}
          {card.category === 'beard' && '🧔 Guess by Beard'}
          {card.category === 'eyes' && '👀 Guess by Eyes'}
          {card.category === 'nose' && '👃 Guess by Nose'}
          {card.category === 'mouth' && '👄 Guess by Mouth'}
          {card.category === 'custom' && '✂️ Cropped Feature'}
        </span>
      </div>

      {/* Reveal Overlay Name Tag (TikTok Viral Style Banner as in the user's reference!) */}
      {isRevealing && showNameOnReveal && (
        <div className="absolute bottom-5 inset-x-4 z-20 pointer-events-none flex flex-col items-center animate-fadeIn">
          <div className="px-5 py-2.5 rounded-2xl bg-black/90 border-2 border-emerald-400 shadow-xl shadow-black/80 flex flex-col items-center">
            <span className="text-xl sm:text-2xl font-black tracking-tight text-emerald-400 uppercase drop-shadow-md">
              {card.name}
            </span>
            {card.hint && (
              <span className="text-[11px] text-slate-300 font-medium mt-0.5">
                {card.hint}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Persistent Tactile Prompt when NOT revealing */}
      {!isRevealing && (
        <div className="absolute bottom-4 inset-x-4 z-10 pointer-events-none flex items-center justify-center">
          <div className="px-4 py-1.5 rounded-full bg-black/70 backdrop-blur-md border border-white/10 text-slate-300 text-xs font-bold shadow-lg flex items-center gap-1.5 animate-pulse">
            <span>👆 Press & Hold to Reveal</span>
          </div>
        </div>
      )}
    </div>
  );
};
