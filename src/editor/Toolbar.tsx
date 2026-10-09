import React from 'react';
import {
  Paintbrush,
  Eraser,
  Square,
  Circle,
  Lasso,
  Undo2,
  Redo2,
  Play,
  Pencil,
  Trash2,
  Sparkles,
  Download,
  ImagePlus,
} from 'lucide-react';
import type { ToolShape, StrokeMode, RevealStyle, AspectRatio } from './types';

interface ToolbarProps {
  currentTool: ToolShape;
  currentMode: StrokeMode;
  onSelectTool: (shape: ToolShape, mode: StrokeMode) => void;
  brushSize: number;
  onChangeBrushSize: (size: number) => void;
  brushHardness: number;
  onChangeBrushHardness: (hardness: number) => void;
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  onClear: () => void;
  onApplyPreset: (preset: 'hairline' | 'beard' | 'eyes' | 'sides') => void;
  isPreviewMode: boolean;
  onTogglePreview: () => void;
  revealStyle: RevealStyle;
  onChangeRevealStyle: (style: RevealStyle) => void;
  holdSeconds: number;
  onChangeHoldSeconds: (seconds: number) => void;
  aspect: AspectRatio;
  onChangeAspect: (aspect: AspectRatio) => void;
  onOpenExport: () => void;
  onUploadNew: () => void;
}

export const Toolbar: React.FC<ToolbarProps> = ({
  currentTool,
  currentMode,
  onSelectTool,
  brushSize,
  onChangeBrushSize,
  brushHardness,
  onChangeBrushHardness,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  onClear,
  onApplyPreset,
  isPreviewMode,
  onTogglePreview,
  revealStyle,
  onChangeRevealStyle,
  holdSeconds,
  onChangeHoldSeconds,
  aspect,
  onChangeAspect,
  onOpenExport,
  onUploadNew,
}) => {
  return (
    <div className="flex flex-col gap-3 w-full bg-slate-900/90 dark:bg-slate-950/90 backdrop-blur-xl border border-white/10 rounded-2xl p-3 sm:p-4 text-white shadow-2xl">
      {/* Top Action Row: Undo/Redo, Presets, Preview Mode, Export */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        {/* Undo / Redo / Clear */}
        <div className="flex items-center gap-1 bg-white/5 p-1 rounded-xl">
          <button
            type="button"
            onClick={onUndo}
            disabled={!canUndo || isPreviewMode}
            title="Undo (Ctrl+Z)"
            aria-label="Undo"
            className="p-2 min-w-[40px] min-h-[40px] rounded-lg flex items-center justify-center hover:bg-white/10 disabled:opacity-30 disabled:hover:bg-transparent transition-all"
          >
            <Undo2 className="w-5 h-5" />
          </button>
          <button
            type="button"
            onClick={onRedo}
            disabled={!canRedo || isPreviewMode}
            title="Redo (Ctrl+Y)"
            aria-label="Redo"
            className="p-2 min-w-[40px] min-h-[40px] rounded-lg flex items-center justify-center hover:bg-white/10 disabled:opacity-30 disabled:hover:bg-transparent transition-all"
          >
            <Redo2 className="w-5 h-5" />
          </button>
          <button
            type="button"
            onClick={onClear}
            disabled={isPreviewMode}
            title="Clear all strokes"
            aria-label="Clear all strokes"
            className="p-2 min-w-[40px] min-h-[40px] rounded-lg flex items-center justify-center hover:bg-red-500/20 text-red-400 hover:text-red-300 disabled:opacity-30 transition-all"
          >
            <Trash2 className="w-5 h-5" />
          </button>
          <button
            type="button"
            onClick={onUploadNew}
            title="Upload new photo"
            aria-label="Upload new photo"
            className="p-2 min-w-[40px] min-h-[40px] rounded-lg flex items-center justify-center hover:bg-indigo-500/20 text-indigo-300 hover:text-indigo-200 transition-all"
          >
            <ImagePlus className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Presets Bar */}
        {!isPreviewMode && (
          <div className="flex items-center gap-1 overflow-x-auto py-1 scrollbar-none">
            <span className="text-xs text-slate-400 font-medium px-1 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" /> Presets:
            </span>
            <button
              type="button"
              onClick={() => onApplyPreset('hairline')}
              className="px-2.5 py-1.5 min-h-[36px] text-xs font-semibold rounded-lg bg-indigo-500/15 hover:bg-indigo-500/25 border border-indigo-500/30 text-indigo-200 transition-all active:scale-95 whitespace-nowrap"
            >
              💇 Hairline
            </button>
            <button
              type="button"
              onClick={() => onApplyPreset('beard')}
              className="px-2.5 py-1.5 min-h-[36px] text-xs font-semibold rounded-lg bg-indigo-500/15 hover:bg-indigo-500/25 border border-indigo-500/30 text-indigo-200 transition-all active:scale-95 whitespace-nowrap"
            >
              🧔 Beard
            </button>
            <button
              type="button"
              onClick={() => onApplyPreset('eyes')}
              className="px-2.5 py-1.5 min-h-[36px] text-xs font-semibold rounded-lg bg-indigo-500/15 hover:bg-indigo-500/25 border border-indigo-500/30 text-indigo-200 transition-all active:scale-95 whitespace-nowrap"
            >
              👀 Eyes Strip
            </button>
            <button
              type="button"
              onClick={() => onApplyPreset('sides')}
              className="px-2.5 py-1.5 min-h-[36px] text-xs font-semibold rounded-lg bg-indigo-500/15 hover:bg-indigo-500/25 border border-indigo-500/30 text-indigo-200 transition-all active:scale-95 whitespace-nowrap"
            >
              ↔️ Sides
            </button>
          </div>
        )}

        {/* Preview / Export Buttons */}
        <div className="flex items-center gap-2 ml-auto">
          <button
            type="button"
            onClick={onTogglePreview}
            className={`px-3 py-2 min-h-[44px] rounded-xl font-medium text-sm flex items-center gap-2 transition-all shadow-md active:scale-95 ${
              isPreviewMode
                ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold'
                : 'bg-white/10 hover:bg-white/15 text-white border border-white/10'
            }`}
          >
            {isPreviewMode ? (
              <>
                <Pencil className="w-4 h-4" /> Edit Mask
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-current" /> Preview Reveal
              </>
            )}
          </button>

          <button
            type="button"
            onClick={onOpenExport}
            className="px-4 py-2 min-h-[44px] rounded-xl font-bold text-sm bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 text-white flex items-center gap-2 shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 transition-all active:scale-95"
          >
            <Download className="w-4 h-4" /> Export
          </button>
        </div>
      </div>

      {/* Main Editing Controls (Visible in Edit Mode) */}
      {!isPreviewMode ? (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 pt-2 border-t border-white/10 items-center">
          {/* Tool Shape Buttons */}
          <div className="md:col-span-6 flex items-center gap-1.5 flex-wrap">
            <button
              type="button"
              onClick={() => onSelectTool('brush', 'paint')}
              title="Brush Paint"
              aria-label="Brush tool"
              className={`p-2.5 min-w-[44px] min-h-[44px] rounded-xl flex items-center justify-center gap-1.5 text-xs font-semibold transition-all ${
                currentTool === 'brush' && currentMode === 'paint'
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/40 ring-2 ring-indigo-400'
                  : 'bg-white/5 hover:bg-white/10 text-slate-300'
              }`}
            >
              <Paintbrush className="w-4 h-4" /> Brush
            </button>

            <button
              type="button"
              onClick={() => onSelectTool('brush', 'erase')}
              title="Eraser"
              aria-label="Eraser tool"
              className={`p-2.5 min-w-[44px] min-h-[44px] rounded-xl flex items-center justify-center gap-1.5 text-xs font-semibold transition-all ${
                currentMode === 'erase'
                  ? 'bg-rose-600 text-white shadow-lg shadow-rose-600/40 ring-2 ring-rose-400'
                  : 'bg-white/5 hover:bg-white/10 text-slate-300'
              }`}
            >
              <Eraser className="w-4 h-4" /> Eraser
            </button>

            <button
              type="button"
              onClick={() => onSelectTool('rect', 'paint')}
              title="Rectangle Mask"
              aria-label="Rectangle tool"
              className={`p-2.5 min-w-[44px] min-h-[44px] rounded-xl flex items-center justify-center gap-1.5 text-xs font-semibold transition-all ${
                currentTool === 'rect' && currentMode === 'paint'
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/40 ring-2 ring-indigo-400'
                  : 'bg-white/5 hover:bg-white/10 text-slate-300'
              }`}
            >
              <Square className="w-4 h-4" /> Box
            </button>

            <button
              type="button"
              onClick={() => onSelectTool('ellipse', 'paint')}
              title="Ellipse Mask"
              aria-label="Ellipse tool"
              className={`p-2.5 min-w-[44px] min-h-[44px] rounded-xl flex items-center justify-center gap-1.5 text-xs font-semibold transition-all ${
                currentTool === 'ellipse' && currentMode === 'paint'
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/40 ring-2 ring-indigo-400'
                  : 'bg-white/5 hover:bg-white/10 text-slate-300'
              }`}
            >
              <Circle className="w-4 h-4" /> Oval
            </button>

            <button
              type="button"
              onClick={() => onSelectTool('lasso', 'paint')}
              title="Lasso Mask"
              aria-label="Lasso tool"
              className={`p-2.5 min-w-[44px] min-h-[44px] rounded-xl flex items-center justify-center gap-1.5 text-xs font-semibold transition-all ${
                currentTool === 'lasso' && currentMode === 'paint'
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/40 ring-2 ring-indigo-400'
                  : 'bg-white/5 hover:bg-white/10 text-slate-300'
              }`}
            >
              <Lasso className="w-4 h-4" /> Lasso
            </button>
          </div>

          {/* Sliders: Size and Feather/Softness */}
          <div className="md:col-span-6 flex flex-col sm:flex-row items-center gap-3">
            {/* Brush Size */}
            <div className="flex-1 w-full flex items-center gap-2 bg-white/5 px-3 py-2 rounded-xl">
              <span className="text-xs text-slate-400 font-medium whitespace-nowrap min-w-[36px]">
                Size
              </span>
              <input
                type="range"
                min="0.015"
                max="0.25"
                step="0.005"
                value={brushSize}
                onChange={(e) => onChangeBrushSize(parseFloat(e.target.value))}
                className="w-full accent-indigo-500 cursor-pointer h-1.5 bg-slate-700 rounded-lg"
                aria-label="Brush size"
              />
              <span className="text-xs text-slate-300 font-mono w-7 text-right">
                {Math.round(brushSize * 200)}
              </span>
            </div>

            {/* Edge Feather / Softness */}
            <div className="flex-1 w-full flex items-center gap-2 bg-white/5 px-3 py-2 rounded-xl">
              <span className="text-xs text-slate-400 font-medium whitespace-nowrap min-w-[44px]">
                Feather
              </span>
              <input
                type="range"
                min="0.1"
                max="1"
                step="0.05"
                value={1 - brushHardness}
                onChange={(e) => onChangeBrushHardness(1 - parseFloat(e.target.value))}
                className="w-full accent-indigo-500 cursor-pointer h-1.5 bg-slate-700 rounded-lg"
                aria-label="Edge feather softness"
              />
              <span className="text-xs text-slate-300 font-mono w-7 text-right">
                {Math.round((1 - brushHardness) * 100)}%
              </span>
            </div>
          </div>
        </div>
      ) : (
        /* Animation & Video Options (Visible in Preview Mode) */
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-white/10">
          {/* Style Selector */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-xs text-slate-400 font-medium">Reveal Style:</span>
            {(['cut', 'fade', 'wipe', 'zoom'] as RevealStyle[]).map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => onChangeRevealStyle(st)}
                className={`px-3 py-1.5 min-h-[38px] text-xs font-bold rounded-lg capitalize transition-all ${
                  revealStyle === st
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'bg-white/5 hover:bg-white/10 text-slate-300'
                }`}
              >
                {st === 'cut' && '⚡ Instant Cut'}
                {st === 'fade' && '🌊 Smooth Fade'}
                {st === 'wipe' && '➡️ Left-to-Right Wipe'}
                {st === 'zoom' && '🔍 Punch Zoom'}
              </button>
            ))}
          </div>

          {/* Hold duration */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 font-medium">Hold:</span>
            {[2, 3, 4].map((sec) => (
              <button
                key={sec}
                type="button"
                onClick={() => onChangeHoldSeconds(sec)}
                className={`px-2.5 py-1 min-h-[34px] text-xs font-semibold rounded-lg transition-all ${
                  holdSeconds === sec
                    ? 'bg-indigo-500 text-white'
                    : 'bg-white/5 hover:bg-white/10 text-slate-300'
                }`}
              >
                {sec}s
              </button>
            ))}
          </div>

          {/* Aspect Ratio */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 font-medium">Aspect:</span>
            {(['9:16', '1:1', 'original'] as AspectRatio[]).map((asp) => (
              <button
                key={asp}
                type="button"
                onClick={() => onChangeAspect(asp)}
                className={`px-2.5 py-1 min-h-[34px] text-xs font-semibold rounded-lg transition-all ${
                  aspect === asp
                    ? 'bg-purple-600 text-white'
                    : 'bg-white/5 hover:bg-white/10 text-slate-300'
                }`}
              >
                {asp === '9:16' && '9:16 Reel/TikTok'}
                {asp === '1:1' && '1:1 Square'}
                {asp === 'original' && 'Original'}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
