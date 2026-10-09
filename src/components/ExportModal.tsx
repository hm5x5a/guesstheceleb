import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { X, Download, Share2, Video, Image as ImageIcon, Sparkles, CheckCircle2 } from 'lucide-react';
import { exportMp4, isWebCodecsSupported } from '../export/exportMp4';
import { exportFallback } from '../export/exportFallback';
import { renderCompositeFrame, type FrameRenderOptions } from '../export/renderFrame';
import { exportImagePair, downloadBlob, shareOrDownloadFile } from '../export/exportImages';
import type { RevealStyle, AspectRatio } from '../editor/types';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  photoImage: CanvasImageSource;
  maskCanvas: HTMLCanvasElement;
  revealStyle: RevealStyle;
  holdSeconds: number;
  initialAspect: AspectRatio;
  caption: string;
  onChangeCaption: (newCaption: string) => void;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  photoImage,
  maskCanvas,
  revealStyle,
  holdSeconds,
  initialAspect,
  caption,
  onChangeCaption,
}) => {
  const [aspect, setAspect] = useState<AspectRatio>(initialAspect === 'original' ? '9:16' : initialAspect);
  const [isExporting, setIsExporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusMessage, setStatusMessage] = useState('');
  const [exportedVideoBlob, setExportedVideoBlob] = useState<Blob | null>(null);
  const [exportedVideoUrl, setExportedVideoUrl] = useState<string | null>(null);
  const [isDone, setIsDone] = useState(false);

  if (!isOpen) return null;

  const handleStartMp4Export = async () => {
    setIsExporting(true);
    setProgress(5);
    setStatusMessage('Preparing high-definition canvas...');
    setIsDone(false);
    setExportedVideoBlob(null);

    try {
      const W = aspect === '1:1' ? 1080 : 1080;
      const H = aspect === '1:1' ? 1080 : 1920;
      const totalSeconds = holdSeconds + 0.6 + 2.4; // hold + reveal + lingering finish

      const frameOptions: FrameRenderOptions = {
        width: W,
        height: H,
        photoImage,
        maskCanvas,
        caption: caption || 'Guess who? 👀',
        style: revealStyle,
        holdSeconds,
        aspect,
        includeFrame: true,
      };

      const renderFrame = (
        ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D,
        t: number,
        secs: number
      ) => {
        renderCompositeFrame(ctx, t, secs, frameOptions);
      };

      const hasWebCodecs = await isWebCodecsSupported(W, H);
      let blob: Blob;

      if (hasWebCodecs) {
        setStatusMessage('Encoding MP4 with hardware WebCodecs...');
        blob = await exportMp4(renderFrame, {
          w: W,
          h: H,
          fps: 30,
          seconds: totalSeconds,
          onProgress: (p) => setProgress(p),
        });
      } else {
        setStatusMessage('Rendering video with browser engine...');
        blob = await exportFallback(renderFrame, {
          w: W,
          h: H,
          fps: 30,
          seconds: totalSeconds,
          onProgress: (p) => setProgress(p),
        });
      }

      setExportedVideoBlob(blob);
      const url = URL.createObjectURL(blob);
      setExportedVideoUrl(url);
      setIsDone(true);
      setStatusMessage('Reveal video ready!');

      // Celebration burst!
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 },
      });
    } catch (err: any) {
      console.error('Video export failed:', err);
      setStatusMessage(`Export failed: ${err.message || 'Unknown error'}`);
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportPngPair = async () => {
    setIsExporting(true);
    setProgress(20);
    setStatusMessage('Generating Before and After framed images...');

    try {
      const W = aspect === '1:1' ? 1080 : 1080;
      const H = aspect === '1:1' ? 1080 : 1920;

      const frameOptions: FrameRenderOptions = {
        width: W,
        height: H,
        photoImage,
        maskCanvas,
        caption: caption || 'Guess who? 👀',
        style: revealStyle,
        holdSeconds,
        aspect,
        includeFrame: true,
      };

      const { beforeBlob, afterBlob } = await exportImagePair(frameOptions);

      downloadBlob(beforeBlob, `guess-who-masked-${Date.now()}.png`);
      setTimeout(() => {
        downloadBlob(afterBlob, `guess-who-revealed-${Date.now()}.png`);
      }, 600);

      setProgress(100);
      setIsDone(true);
      setStatusMessage('Both Before & After images downloaded!');

      confetti({
        particleCount: 60,
        spread: 50,
        origin: { y: 0.7 },
      });
    } catch (err: any) {
      console.error('PNG export failed:', err);
      setStatusMessage(`Image export failed: ${err.message || 'Unknown error'}`);
    } finally {
      setIsExporting(false);
    }
  };

  const handleShareOrDownload = async () => {
    if (!exportedVideoBlob) return;
    const filename = `guess-the-celeb-${Date.now()}.mp4`;
    await shareOrDownloadFile(
      exportedVideoBlob,
      filename,
      caption || 'Guess Who Reveal Video',
      'Can you guess who this is? Made with GuessTheCelebMaker'
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-700/80 rounded-3xl p-6 text-white shadow-2xl flex flex-col gap-5 max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-indigo-400" />
            <h2 className="text-xl font-bold tracking-tight">Export Reveal</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isExporting}
            className="p-1.5 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition-colors disabled:opacity-30"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Frame Caption Customizer */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-slate-300">
            Top Header Caption (Shown in Frame)
          </label>
          <input
            type="text"
            value={caption}
            maxLength={40}
            onChange={(e) => onChangeCaption(e.target.value)}
            placeholder="e.g. Guess who? 👀 or Who is this singer?"
            className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        {/* Format & Aspect Selection */}
        <div className="flex flex-col gap-2">
          <label className="text-xs font-semibold text-slate-300">
            Export Format & Canvas Ratio
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setAspect('9:16')}
              className={`p-3 rounded-xl border text-left flex flex-col gap-1 transition-all ${
                aspect === '9:16'
                  ? 'bg-indigo-600/20 border-indigo-500 text-white shadow-sm'
                  : 'bg-slate-800/60 border-slate-700/60 text-slate-400 hover:text-white'
              }`}
            >
              <span className="text-xs font-bold flex items-center gap-1.5 text-indigo-300">
                <Video className="w-4 h-4" /> 9:16 Vertical
              </span>
              <span className="text-[11px] text-slate-400">
                Reels, TikTok & YouTube Shorts (1080x1920)
              </span>
            </button>

            <button
              type="button"
              onClick={() => setAspect('1:1')}
              className={`p-3 rounded-xl border text-left flex flex-col gap-1 transition-all ${
                aspect === '1:1'
                  ? 'bg-indigo-600/20 border-indigo-500 text-white shadow-sm'
                  : 'bg-slate-800/60 border-slate-700/60 text-slate-400 hover:text-white'
              }`}
            >
              <span className="text-xs font-bold flex items-center gap-1.5 text-purple-300">
                <Video className="w-4 h-4" /> 1:1 Square
              </span>
              <span className="text-[11px] text-slate-400">
                Instagram Feed & Facebook (1080x1080)
              </span>
            </button>
          </div>
        </div>

        {/* Video Preview Player if already exported */}
        {isDone && exportedVideoUrl && (
          <div className="flex flex-col items-center gap-3 bg-slate-950 p-4 rounded-2xl border border-slate-800">
            <video
              src={exportedVideoUrl}
              controls
              autoPlay
              loop
              playsInline
              className="max-h-60 rounded-xl shadow-lg border border-slate-800"
            />
            <div className="flex items-center gap-2 text-emerald-400 text-xs font-semibold">
              <CheckCircle2 className="w-4 h-4" /> MP4 Video Ready (H.264 On-Device)
            </div>
          </div>
        )}

        {/* Progress Bar during render */}
        {isExporting && (
          <div className="flex flex-col gap-2 bg-slate-950 p-4 rounded-2xl border border-slate-800">
            <div className="flex items-center justify-between text-xs font-medium text-slate-300">
              <span>{statusMessage}</span>
              <span className="font-mono text-indigo-400">{progress}%</span>
            </div>
            <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-150"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col gap-2.5 pt-2">
          {!isDone ? (
            <>
              <button
                type="button"
                onClick={handleStartMp4Export}
                disabled={isExporting}
                className="w-full py-3.5 px-4 min-h-[48px] rounded-xl font-bold text-sm bg-gradient-to-r from-indigo-500 via-purple-600 to-pink-600 hover:from-indigo-400 hover:to-pink-500 text-white flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/25 transition-all active:scale-[0.99] disabled:opacity-50"
              >
                <Video className="w-4 h-4" /> Export MP4 Video (Instant)
              </button>

              <button
                type="button"
                onClick={handleExportPngPair}
                disabled={isExporting}
                className="w-full py-3 px-4 min-h-[44px] rounded-xl font-medium text-sm bg-slate-800 hover:bg-slate-750 border border-slate-700 text-slate-200 flex items-center justify-center gap-2 transition-all active:scale-[0.99] disabled:opacity-50"
              >
                <ImageIcon className="w-4 h-4" /> Export Before & After PNG Images
              </button>
            </>
          ) : (
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleShareOrDownload}
                className="flex-1 py-3.5 px-4 min-h-[48px] rounded-xl font-bold text-sm bg-emerald-600 hover:bg-emerald-500 text-white flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/30 transition-all active:scale-[0.99]"
              >
                <Share2 className="w-4 h-4" /> Share / Save MP4
              </button>

              <button
                type="button"
                onClick={() => {
                  if (exportedVideoBlob) {
                    downloadBlob(exportedVideoBlob, `guess-reveal-${Date.now()}.mp4`);
                  }
                }}
                className="py-3.5 px-4 min-h-[48px] rounded-xl font-bold text-sm bg-slate-800 hover:bg-slate-700 text-white flex items-center justify-center gap-2 border border-slate-700 transition-all active:scale-[0.99]"
              >
                <Download className="w-4 h-4" /> Download
              </button>
            </div>
          )}
        </div>

        <p className="text-[11px] text-slate-400 text-center">
          🔒 Export runs 100% on your device with hardware WebCodecs. No photo ever leaves your phone or browser.
        </p>
      </div>
    </div>
  );
};
