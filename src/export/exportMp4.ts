import { Muxer, ArrayBufferTarget } from 'mp4-muxer';

export type FrameRenderer = (
  ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D,
  t: number,
  totalSeconds: number
) => void;

export interface ExportMp4Options {
  w?: number;
  h?: number;
  fps?: number;
  seconds?: number;
  onProgress?: (progressPercent: number) => void;
}

/**
 * Checks if WebCodecs VideoEncoder is available and supports AVC (H.264).
 */
export async function isWebCodecsSupported(w = 1080, h = 1920): Promise<boolean> {
  if (typeof window === 'undefined') return false;
  const Win = window as any;
  if (typeof Win.VideoEncoder !== 'function' || typeof Win.VideoFrame !== 'function') {
    return false;
  }
  try {
    const config = {
      codec: 'avc1.640032',
      width: w,
      height: h,
      bitrate: 6_000_000,
      framerate: 30,
    };
    const check = await Win.VideoEncoder.isConfigSupported(config);
    return !!check.supported;
  } catch {
    return false;
  }
}

/**
 * Primary fast on-device MP4 export using WebCodecs and mp4-muxer.
 * Produces real H.264 MP4 accepted natively by Instagram, TikTok, and YouTube Shorts.
 */
export async function exportMp4(
  renderFrame: FrameRenderer,
  {
    w = 1080,
    h = 1920,
    fps = 30,
    seconds = 6,
    onProgress,
  }: ExportMp4Options = {}
): Promise<Blob> {
  const muxer = new Muxer({
    target: new ArrayBufferTarget(),
    video: {
      codec: 'avc',
      width: w,
      height: h,
    },
    fastStart: 'in-memory',
  });

  let encoderError: Error | null = null;
  const enc = new (window as any).VideoEncoder({
    output: (chunk: any, meta: any) => muxer.addVideoChunk(chunk, meta),
    error: (e: any) => {
      console.error('VideoEncoder error:', e);
      encoderError = e;
    },
  });

  enc.configure({
    codec: 'avc1.640032',
    width: w,
    height: h,
    bitrate: 6_000_000,
    framerate: fps,
  });

  // Use OffscreenCanvas if supported, else fallback to standard canvas
  const canvas =
    typeof OffscreenCanvas !== 'undefined'
      ? new OffscreenCanvas(w, h)
      : (function () {
          const c = document.createElement('canvas');
          c.width = w;
          c.height = h;
          return c;
        })();

  const ctx = canvas.getContext('2d') as
    | CanvasRenderingContext2D
    | OffscreenCanvasRenderingContext2D;

  if (!ctx) {
    throw new Error('Failed to obtain canvas 2D rendering context');
  }

  const totalFrames = Math.round(fps * seconds);

  for (let i = 0; i < totalFrames; i++) {
    if (encoderError) throw encoderError;

    const t = i / fps;
    renderFrame(ctx, t, seconds);

    const frame = new (window as any).VideoFrame(canvas, {
      timestamp: Math.round((i * 1e6) / fps),
      duration: Math.round(1e6 / fps),
    });

    enc.encode(frame, { keyFrame: i % fps === 0 });
    frame.close();

    // Yield if encoder queue builds up to maintain UI responsiveness
    if (enc.encodeQueueSize > 8) {
      await new Promise((resolve) => setTimeout(resolve, 0));
    }

    if (onProgress && i % 2 === 0) {
      onProgress(Math.round(((i + 1) / totalFrames) * 95));
    }
  }

  await enc.flush();
  muxer.finalize();
  onProgress?.(100);

  return new Blob([muxer.target.buffer], { type: 'video/mp4' });
}
