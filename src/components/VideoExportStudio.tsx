import React, { useState } from 'react';
import {
  Video,
  Download,
  Share2,
  CheckCircle2,
  Play,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import type { CelebrityCard } from '../types/game';
import { exportMp4, isWebCodecsSupported } from '../export/exportMp4';
import { exportFallback } from '../export/exportFallback';
import { downloadBlob, shareOrDownloadFile } from '../export/exportImages';
import { DOMAIN, APP_NAME } from '../config';

interface VideoExportStudioProps {
  cards: CelebrityCard[];
}

export const VideoExportStudio: React.FC<VideoExportStudioProps> = ({ cards }) => {
  const [selectedCardId, setSelectedCardId] = useState<string>(cards[0]?.id || '');
  const [isExporting, setIsExporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState('');
  const [exportedBlob, setExportedBlob] = useState<Blob | null>(null);
  const [exportedUrl, setExportedUrl] = useState<string | null>(null);

  const activeCard = cards.find((c) => c.id === selectedCardId) || cards[0];

  const handleStartExport = async () => {
    if (!activeCard) return;

    setIsExporting(true);
    setProgress(10);
    setStatusText('Preparing 1080x1920 video canvas...');
    setExportedBlob(null);

    try {
      // Load raw image element
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.src = activeCard.imageUrl;
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
      });

      const W = 1080;
      const H = 1920;
      const fps = 30;
      const seconds = 6;
      const holdTime = 3; // 3 seconds hold on crop, then reveal

      const crop = activeCard.crop || { x: 0.15, y: 0.15, width: 0.7, height: 0.3 };
      const scale = 1 / Math.max(0.1, crop.width);
      const originX = (crop.x + crop.width / 2) * 100;
      const originY = (crop.y + crop.height / 2) * 100;

      const renderFrame = (
        ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D,
        t: number,
        _totalSecs: number
      ) => {
        // Clear background
        ctx.fillStyle = '#0a0d14';
        ctx.fillRect(0, 0, W, H);

        const isRevealed = t >= holdTime;

        // Container bounds
        const contW = W * 0.9;
        const contH = H * 0.68;
        const contX = (W - contW) / 2;
        const contY = (H - contH) / 2;
        const radius = 32;

        // Draw card shadow
        ctx.save();
        ctx.shadowColor = isRevealed ? 'rgba(16, 185, 129, 0.4)' : 'rgba(0, 0, 0, 0.8)';
        ctx.shadowBlur = 30;
        ctx.fillStyle = '#11141e';
        drawRoundedRect(ctx, contX, contY, contW, contH, radius);
        ctx.fill();
        ctx.restore();

        // Clip photo inside container
        ctx.save();
        drawRoundedRect(ctx, contX, contY, contW, contH, radius);
        ctx.clip();

        if (isRevealed) {
          // Full Image Draw
          ctx.drawImage(img, contX, contY, contW, contH);
        } else {
          // Cropped Feature Draw (zoomed to crop box)
          ctx.save();
          const cx = contX + (contW * originX) / 100;
          const cy = contY + (contH * originY) / 100;
          ctx.translate(cx, cy);
          ctx.scale(scale, scale);
          ctx.translate(-cx, -cy);
          ctx.drawImage(img, contX, contY, contW, contH);
          ctx.restore();
        }
        ctx.restore();

        // Card Border
        ctx.save();
        ctx.strokeStyle = isRevealed ? '#10b981' : 'rgba(255, 255, 255, 0.15)';
        ctx.lineWidth = 4;
        drawRoundedRect(ctx, contX, contY, contW, contH, radius);
        ctx.stroke();
        ctx.restore();

        // Top Header Strip
        ctx.save();
        ctx.font = '900 48px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
        ctx.fillStyle = '#ffffff';
        ctx.textAlign = 'center';
        ctx.fillText(
          activeCard.category === 'hair'
            ? 'Guess the Celebrity by their HAIR'
            : activeCard.category === 'beard'
            ? 'Guess the Celebrity by their BEARD'
            : 'Guess the Celebrity by their EYES',
          W / 2,
          contY - 50
        );
        ctx.restore();

        // Bottom Reveal Name Tag or Countdown Hint
        ctx.save();
        if (isRevealed) {
          ctx.font = '900 64px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
          ctx.fillStyle = '#10b981';
          ctx.textAlign = 'center';
          ctx.fillText(activeCard.name.toUpperCase(), W / 2, contY + contH + 85);
        } else {
          const timeLeft = Math.max(1, Math.ceil(holdTime - t));
          ctx.font = '700 36px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
          ctx.fillStyle = '#94a3b8';
          ctx.textAlign = 'center';
          ctx.fillText(`Revealing in ${timeLeft}s... 👀`, W / 2, contY + contH + 75);
        }
        ctx.restore();

        // Subtle Promo Tagline at bottom safe zone
        ctx.save();
        ctx.font = '600 28px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
        ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
        ctx.textAlign = 'center';
        ctx.fillText(`Made with ${APP_NAME} · ${DOMAIN}`, W / 2, H - 70);
        ctx.restore();
      };

      const hasWebCodecs = await isWebCodecsSupported(W, H);
      let blob: Blob;

      if (hasWebCodecs) {
        setStatusText('Encoding 1080p MP4 via hardware WebCodecs...');
        blob = await exportMp4(renderFrame, {
          w: W,
          h: H,
          fps,
          seconds,
          onProgress: (p) => setProgress(p),
        });
      } else {
        setStatusText('Rendering video via browser engine...');
        blob = await exportFallback(renderFrame, {
          w: W,
          h: H,
          fps,
          seconds,
          onProgress: (p) => setProgress(p),
        });
      }

      setExportedBlob(blob);
      const url = URL.createObjectURL(blob);
      setExportedUrl(url);
      setProgress(100);
      setStatusText('Video Ready for TikTok / Reels!');

      confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
    } catch (err: any) {
      console.error('Export error:', err);
      setStatusText(`Export failed: ${err.message || 'Unknown error'}`);
    } finally {
      setIsExporting(false);
    }
  };

  const handleShareOrDownload = async () => {
    if (!exportedBlob || !activeCard) return;
    const filename = `guess-${activeCard.name.toLowerCase().replace(/\s+/g, '-')}-reveal.mp4`;
    await shareOrDownloadFile(
      exportedBlob,
      filename,
      `Guess Who: ${activeCard.name}`,
      `Can you guess the celebrity? Made with ${APP_NAME}`
    );
  };

  return (
    <div className="w-full max-w-xl mx-auto flex flex-col items-center gap-5 animate-fadeIn">
      {/* Header */}
      <div className="w-full text-center">
        <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center justify-center gap-2">
          <Video className="w-6 h-6 text-emerald-400" /> Viral TikTok & Reels Exporter
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Export full 1080x1920 (9:16) MP4 video with cropped guessing phase and instant reveal.
        </p>
      </div>

      {/* Select Celebrity from Deck */}
      <div className="w-full bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col gap-2.5">
        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
          Select Celebrity from Deck:
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {cards.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => {
                setSelectedCardId(c.id);
                setExportedBlob(null);
                setExportedUrl(null);
              }}
              className={`p-2.5 rounded-xl border text-left flex items-center gap-2 transition-all ${
                selectedCardId === c.id
                  ? 'border-emerald-400 bg-emerald-500/10 text-white font-bold'
                  : 'border-slate-800 bg-slate-950 text-slate-400 hover:text-white'
              }`}
            >
              <img
                src={c.imageUrl}
                alt={c.name}
                className="w-7 h-7 rounded-lg object-cover shrink-0"
              />
              <span className="text-xs truncate">{c.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Progress Bar during Export */}
      {isExporting && (
        <div className="w-full bg-slate-900 border border-slate-800 p-4 rounded-2xl flex flex-col gap-2">
          <div className="flex items-center justify-between text-xs font-bold text-slate-300">
            <span>{statusText}</span>
            <span className="font-mono text-emerald-400">{progress}%</span>
          </div>
          <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-400 rounded-full transition-all duration-150"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {/* Video Player Preview if Ready */}
      {exportedUrl && (
        <div className="w-full bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col items-center gap-3">
          <video
            src={exportedUrl}
            controls
            autoPlay
            loop
            playsInline
            className="max-h-80 rounded-xl shadow-2xl border border-slate-800"
          />
          <div className="flex items-center gap-2 text-emerald-400 text-xs font-black">
            <CheckCircle2 className="w-4 h-4" /> 1080x1920 MP4 Video Ready!
          </div>
        </div>
      )}

      {/* Export / Download Buttons */}
      <div className="w-full flex flex-col gap-2.5">
        {!exportedBlob ? (
          <button
            type="button"
            onClick={handleStartExport}
            disabled={isExporting}
            className="w-full py-3.5 px-4 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/25 transition-all active:scale-95 disabled:opacity-50"
          >
            <Play className="w-4 h-4 fill-current" /> Render 9:16 Video for TikTok
          </button>
        ) : (
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleShareOrDownload}
              className="flex-1 py-3.5 px-4 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/25 transition-all active:scale-95"
            >
              <Share2 className="w-4 h-4" /> Share to TikTok / Reels
            </button>
            <button
              type="button"
              onClick={() => {
                if (exportedBlob && activeCard) {
                  downloadBlob(exportedBlob, `guess-${activeCard.name}.mp4`);
                }
              }}
              className="py-3.5 px-4 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-sm border border-slate-700 flex items-center justify-center gap-2 transition-all active:scale-95"
            >
              <Download className="w-4 h-4" /> Save
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

function drawRoundedRect(
  ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
): void {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}
