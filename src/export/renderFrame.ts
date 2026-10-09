import { APP_NAME, DOMAIN } from '../config';
import { revealState } from '../editor/reveal';
import type { RevealStyle, AspectRatio } from '../editor/types';

export interface FrameRenderOptions {
  width: number;
  height: number;
  photoImage: CanvasImageSource;
  maskCanvas: CanvasImageSource; // offscreen mask canvas containing black strokes
  caption?: string;
  style: RevealStyle;
  holdSeconds: number;
  aspect: AspectRatio;
  includeFrame?: boolean;
}

/**
 * Renders a single frame containing background, styled photo container,
 * animated reveal mask, and the subtle promotional frame.
 * Used identically for live canvas preview, WebCodecs MP4 export, and PNG export.
 */
export function renderCompositeFrame(
  ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D,
  t: number,
  _totalSeconds: number,
  options: FrameRenderOptions
): void {
  const {
    width: W,
    height: H,
    photoImage,
    maskCanvas,
    caption = 'Guess who? 👀',
    style,
    holdSeconds,
    includeFrame = true,
  } = options;

  // Clear canvas
  ctx.clearRect(0, 0, W, H);

  // 1. Draw premium dark gradient background if framed
  if (includeFrame) {
    const bgGrad = ctx.createLinearGradient(0, 0, 0, H);
    bgGrad.addColorStop(0, '#0a0d14');
    bgGrad.addColorStop(0.5, '#0f1422');
    bgGrad.addColorStop(1, '#07090e');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, W, H);

    // Subtle ambient glow in center
    const glow = ctx.createRadialGradient(W / 2, H / 2, 50, W / 2, H / 2, W * 0.7);
    glow.addColorStop(0, 'rgba(99, 102, 241, 0.08)');
    glow.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, W, H);
  } else {
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, W, H);
  }

  // 2. Compute Photo Area Layout
  // Safe zone margins for vertical 9:16 or square 1:1
  const isVertical = H > W;
  const topBarH = includeFrame ? (isVertical ? Math.round(H * 0.085) : Math.round(H * 0.07)) : 0;
  const bottomBarH = includeFrame ? (isVertical ? Math.round(H * 0.09) : Math.round(H * 0.075)) : 0;
  const sideMargin = includeFrame ? Math.round(W * 0.045) : 0;

  const availableW = W - sideMargin * 2;
  const availableH = H - topBarH - bottomBarH;

  const photoNativeW = (photoImage as any).naturalWidth || (photoImage as any).width || 1080;
  const photoNativeH = (photoImage as any).naturalHeight || (photoImage as any).height || 1080;
  const photoAspect = photoNativeW / photoNativeH;

  let drawW = availableW;
  let drawH = drawW / photoAspect;

  if (drawH > availableH) {
    drawH = availableH;
    drawW = drawH * photoAspect;
  }

  const drawX = (W - drawW) / 2;
  const drawY = topBarH + (availableH - drawH) / 2;
  const cornerRadius = includeFrame ? Math.min(28, drawW * 0.04) : 0;

  // 3. Compute reveal state
  const rev = revealState(style, t, holdSeconds, 0.6);

  ctx.save();

  // Draw photo container border & shadow
  if (includeFrame) {
    ctx.save();
    ctx.shadowColor = 'rgba(0, 0, 0, 0.6)';
    ctx.shadowBlur = 24;
    ctx.shadowOffsetY = 8;
    ctx.fillStyle = '#141824';
    drawRoundedRect(ctx, drawX, drawY, drawW, drawH, cornerRadius);
    ctx.fill();
    ctx.restore();
  }

  // Clip to rounded photo container
  ctx.save();
  drawRoundedRect(ctx, drawX, drawY, drawW, drawH, cornerRadius);
  ctx.clip();

  // Handle zoom animation scale
  const scale = rev.scale || 1;
  if (scale !== 1) {
    ctx.translate(drawX + drawW / 2, drawY + drawH / 2);
    ctx.scale(scale, scale);
    ctx.translate(-(drawX + drawW / 2), -(drawY + drawH / 2));
  }

  // Draw underlying photo
  ctx.drawImage(photoImage, drawX, drawY, drawW, drawH);

  // 4. Draw Mask over photo if mask is active
  if (rev.maskAlpha > 0.001) {
    ctx.save();
    ctx.globalAlpha = Math.max(0, Math.min(1, rev.maskAlpha));

    if (style === 'wipe' && typeof rev.wipe === 'number') {
      // Wipe from left to right: only render mask to the right of wipe line
      const wipeX = drawX + drawW * rev.wipe;
      ctx.beginPath();
      ctx.rect(wipeX, drawY, drawW - (wipeX - drawX), drawH);
      ctx.clip();
    }

    ctx.drawImage(maskCanvas, drawX, drawY, drawW, drawH);
    ctx.restore();
  }

  ctx.restore(); // end photo container clip

  // Thin clean border around the photo container
  if (includeFrame) {
    ctx.save();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
    ctx.lineWidth = 2;
    drawRoundedRect(ctx, drawX, drawY, drawW, drawH, cornerRadius);
    ctx.stroke();
    ctx.restore();
  }

  // 5. Draw Frame Header & Promotional Footer
  if (includeFrame) {
    // Top Caption
    if (caption.trim()) {
      ctx.save();
      const fontSize = Math.max(22, Math.round(W * 0.044));
      ctx.font = `700 ${fontSize}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
      ctx.fillStyle = '#ffffff';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      // Subtle drop shadow for caption readability
      ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
      ctx.shadowBlur = 8;
      ctx.shadowOffsetY = 2;

      const captionY = topBarH / 2 + 4;
      ctx.fillText(caption, W / 2, captionY);
      ctx.restore();
    }

    // Bottom Promotional Tagline (Subtle & clean)
    ctx.save();
    const footerFontSize = Math.max(14, Math.round(W * 0.026));
    ctx.font = `500 ${footerFontSize}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
    ctx.fillStyle = 'rgba(255, 255, 255, 0.65)';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    const brandText = `Made with ${APP_NAME} · ${DOMAIN}`;
    const footerY = H - bottomBarH / 2 - 2;

    // Small spark/dot indicator
    ctx.fillText(`✨ ${brandText}`, W / 2, footerY);
    ctx.restore();
  }

  ctx.restore();
}

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
