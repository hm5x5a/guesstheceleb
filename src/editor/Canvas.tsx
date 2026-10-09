import React, { useRef, useEffect, useCallback, useState } from 'react';
import type { Stroke, StrokeMode, ToolShape, RevealStyle } from './types';
import { drawStroke, renderAllStrokes, simplifyPoints } from './maskEngine';
import { revealState } from './reveal';

interface CanvasProps {
  imageElement: CanvasImageSource | null;
  imageWidth: number;
  imageHeight: number;
  strokes: Stroke[];
  onAddStroke: (stroke: Stroke) => void;
  currentTool: ToolShape;
  currentMode: StrokeMode;
  brushSize: number;       // 0.01 .. 0.3
  brushHardness: number;   // 0 .. 1
  isPreviewMode: boolean;
  revealStyle: RevealStyle;
  holdSeconds: number;
  previewTime: number;     // Current time in seconds during animation preview
  onTapCanvasPreview?: () => void;
  maskCanvasRef: React.RefObject<HTMLCanvasElement | null>;
}

export const Canvas: React.FC<CanvasProps> = ({
  imageElement,
  imageWidth,
  imageHeight,
  strokes,
  onAddStroke,
  currentTool,
  currentMode,
  brushSize,
  brushHardness,
  isPreviewMode,
  revealStyle,
  holdSeconds,
  previewTime,
  onTapCanvasPreview,
  maskCanvasRef,
}) => {
  const displayCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Active in-progress stroke points during pointer drag
  const activePointsRef = useRef<[number, number][]>([]);
  const isPointerDownRef = useRef(false);
  const [isDrawing, setIsDrawing] = useState(false);

  // Normalized cursor coordinate for brush outline circle
  const [cursorPos, setCursorPos] = useState<{ x: number; y: number } | null>(null);

  // 1. Maintain offscreen mask canvas whenever strokes change or image dimension changes
  useEffect(() => {
    if (!maskCanvasRef.current || imageWidth <= 0 || imageHeight <= 0) return;
    const maskCanvas = maskCanvasRef.current;
    if (maskCanvas.width !== imageWidth || maskCanvas.height !== imageHeight) {
      maskCanvas.width = imageWidth;
      maskCanvas.height = imageHeight;
    }
    const maskCtx = maskCanvas.getContext('2d');
    if (maskCtx) {
      renderAllStrokes(maskCtx, strokes, imageWidth, imageHeight);
    }
  }, [strokes, imageWidth, imageHeight, maskCanvasRef]);

  // 2. Render display canvas
  const renderDisplay = useCallback(() => {
    const canvas = displayCanvasRef.current;
    const maskCanvas = maskCanvasRef.current;
    if (!canvas || !imageElement || imageWidth <= 0 || imageHeight <= 0) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const W = canvas.width;
    const H = canvas.height;

    // In preview mode, calculate reveal animation properties
    let maskAlpha = 1;
    let wipeProgress: number | undefined;
    let scale = 1;

    if (isPreviewMode) {
      const rev = revealState(revealStyle, previewTime, holdSeconds, 0.6);
      maskAlpha = rev.maskAlpha;
      wipeProgress = rev.wipe;
      if (rev.scale) scale = rev.scale;
    }

    ctx.save();

    // If zoom effect applies
    if (scale !== 1) {
      ctx.translate(W / 2, H / 2);
      ctx.scale(scale, scale);
      ctx.translate(-W / 2, -H / 2);
    }

    // Draw base photo
    ctx.drawImage(imageElement, 0, 0, W, H);

    // Draw masked region if visible
    if (maskCanvas && maskAlpha > 0.001) {
      ctx.save();
      ctx.globalAlpha = maskAlpha;

      if (wipeProgress !== undefined) {
        // Left-to-right wipe clip
        const wipeX = W * wipeProgress;
        ctx.beginPath();
        ctx.rect(wipeX, 0, W - wipeX, H);
        ctx.clip();
      }

      ctx.drawImage(maskCanvas, 0, 0, W, H);
      ctx.restore();
    }

    ctx.restore();

    // 3. Render active in-progress drawing stroke if user is dragging
    if (isPointerDownRef.current && activePointsRef.current.length > 0 && !isPreviewMode) {
      const liveStroke: Stroke = {
        id: 'active_live',
        mode: currentMode,
        shape: currentTool,
        size: brushSize,
        hardness: brushHardness,
        points: activePointsRef.current,
      };
      drawStroke(ctx, liveStroke, W, H);
    }
  }, [
    imageElement,
    imageWidth,
    imageHeight,
    isPreviewMode,
    revealStyle,
    previewTime,
    holdSeconds,
    currentMode,
    currentTool,
    brushSize,
    brushHardness,
    maskCanvasRef,
  ]);

  // Redraw whenever relevant state changes or animation ticks
  useEffect(() => {
    let animId: number;
    const tick = () => {
      renderDisplay();
      if (isPreviewMode) {
        // Redraw during preview playback
        animId = requestAnimationFrame(tick);
      }
    };
    tick();
    return () => {
      if (animId) cancelAnimationFrame(animId);
    };
  }, [renderDisplay, isPreviewMode]);

  // Convert client pointer event coordinates to normalized [0..1, 0..1]
  const getNormalizedPoint = (e: React.PointerEvent<HTMLCanvasElement>): [number, number] | null => {
    const canvas = displayCanvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    const clientX = e.clientX;
    const clientY = e.clientY;

    if (
      clientX < rect.left ||
      clientX > rect.right ||
      clientY < rect.top ||
      clientY > rect.bottom
    ) {
      // Clamped normalized coords
      const nx = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
      const ny = Math.max(0, Math.min(1, (clientY - rect.top) / rect.height));
      return [nx, ny];
    }

    const nx = (clientX - rect.left) / rect.width;
    const ny = (clientY - rect.top) / rect.height;
    return [Math.max(0, Math.min(1, nx)), Math.max(0, Math.min(1, ny))];
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (isPreviewMode) {
      onTapCanvasPreview?.();
      return;
    }

    // Capture pointer to receive drag events even outside canvas boundaries
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);

    const pt = getNormalizedPoint(e);
    if (!pt) return;

    isPointerDownRef.current = true;
    setIsDrawing(true);
    activePointsRef.current = [pt];
    renderDisplay();
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const pt = getNormalizedPoint(e);
    if (pt) {
      setCursorPos({ x: pt[0], y: pt[1] });
    }

    if (!isPointerDownRef.current || isPreviewMode) return;
    if (!pt) return;

    if (currentTool === 'brush' || currentTool === 'lasso') {
      activePointsRef.current.push(pt);
    } else if (currentTool === 'rect' || currentTool === 'ellipse') {
      // In rect/ellipse mode, points[0] is start point, points[1] is current drag end point
      if (activePointsRef.current.length === 1) {
        activePointsRef.current.push(pt);
      } else {
        activePointsRef.current[1] = pt;
      }
    }

    renderDisplay();
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (isPreviewMode || !isPointerDownRef.current) return;
    isPointerDownRef.current = false;
    setIsDrawing(false);

    try {
      (e.target as HTMLElement).releasePointerCapture?.(e.pointerId);
    } catch {
      // Ignore if not supported
    }

    if (activePointsRef.current.length === 0) return;

    // Simplify points for brush strokes
    let finalPoints = activePointsRef.current;
    if (currentTool === 'brush' && finalPoints.length > 3) {
      finalPoints = simplifyPoints(finalPoints, 0.002);
    }

    const newStroke: Stroke = {
      id: `stroke_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      mode: currentMode,
      shape: currentTool,
      size: brushSize,
      hardness: brushHardness,
      points: finalPoints,
    };

    activePointsRef.current = [];
    onAddStroke(newStroke);
  };

  const handlePointerLeave = () => {
    setCursorPos(null);
  };

  // Determine display dimensions while fitting nicely within parent container
  const canvasAspect = imageWidth > 0 && imageHeight > 0 ? imageWidth / imageHeight : 9 / 16;

  return (
    <div
      ref={containerRef}
      className="relative flex items-center justify-center w-full h-full max-h-full max-w-full overflow-hidden select-none"
      style={{ touchAction: 'none' }}
    >
      {/* Hidden offscreen mask canvas */}
      <canvas
        ref={maskCanvasRef as any}
        style={{ display: 'none' }}
        width={imageWidth || 1080}
        height={imageHeight || 1920}
      />

      {/* Main Interactive Display Canvas */}
      <canvas
        ref={displayCanvasRef}
        width={imageWidth || 1080}
        height={imageHeight || 1920}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onPointerLeave={handlePointerLeave}
        className={`touch-none rounded-xl shadow-2xl transition-shadow ${
          isPreviewMode ? 'cursor-pointer ring-2 ring-primary-500' : 'cursor-crosshair'
        }`}
        style={{
          width: 'auto',
          height: 'auto',
          maxWidth: '100%',
          maxHeight: '100%',
          aspectRatio: `${canvasAspect}`,
          objectFit: 'contain',
        }}
      />

      {/* Preview Tap Hint Overlay */}
      {isPreviewMode && (
        <div
          onClick={onTapCanvasPreview}
          className="absolute inset-0 flex items-center justify-center bg-black/20 pointer-events-auto cursor-pointer group transition-opacity"
        >
          <div className="px-4 py-2 text-sm font-semibold text-white bg-black/60 backdrop-blur-md rounded-full shadow-lg flex items-center gap-2 group-hover:scale-105 transition-transform">
            <span>✨ Tap to replay reveal</span>
          </div>
        </div>
      )}

      {/* Brush cursor indicator */}
      {!isPreviewMode && cursorPos && currentTool === 'brush' && !isDrawing && (
        <div
          className="pointer-events-none absolute -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/80 bg-white/10 shadow-sm"
          style={{
            left: `${cursorPos.x * 100}%`,
            top: `${cursorPos.y * 100}%`,
            width: `${brushSize * 100}%`,
            paddingBottom: `${brushSize * 100}%`,
          }}
        />
      )}
    </div>
  );
};
