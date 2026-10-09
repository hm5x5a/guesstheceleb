import type { FrameRenderer } from './exportMp4';

export interface ExportFallbackOptions {
  w?: number;
  h?: number;
  fps?: number;
  seconds?: number;
  onProgress?: (progressPercent: number) => void;
}

/**
 * Fallback video export using canvas.captureStream() and MediaRecorder
 * for browsers where WebCodecs VideoEncoder is unavailable.
 */
export async function exportFallback(
  renderFrame: FrameRenderer,
  {
    w = 1080,
    h = 1920,
    fps = 30,
    seconds = 6,
    onProgress,
  }: ExportFallbackOptions = {}
): Promise<Blob> {
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Canvas 2D context unavailable for fallback export');
  }

  // Determine optimal supported mime type
  const mimeCandidates = [
    'video/mp4;codecs=avc1',
    'video/mp4',
    'video/webm;codecs=vp9',
    'video/webm;codecs=vp8',
    'video/webm',
  ];

  let selectedMime = 'video/webm';
  for (const mime of mimeCandidates) {
    if (MediaRecorder.isTypeSupported(mime)) {
      selectedMime = mime;
      break;
    }
  }

  const stream = canvas.captureStream(fps);
  const recorder = new MediaRecorder(stream, {
    mimeType: selectedMime,
    videoBitsPerSecond: 6_000_000,
  });

  const chunks: Blob[] = [];
  recorder.ondataavailable = (e) => {
    if (e.data && e.data.size > 0) {
      chunks.push(e.data);
    }
  };

  return new Promise<Blob>((resolve, reject) => {
    recorder.onerror = (e) => reject(e);

    recorder.onstop = () => {
      onProgress?.(100);
      const outputType = selectedMime.includes('mp4') ? 'video/mp4' : 'video/webm';
      resolve(new Blob(chunks, { type: outputType }));
    };

    recorder.start();

    const totalFrames = Math.round(fps * seconds);
    const frameInterval = 1000 / fps;
    let currentFrame = 0;

    const intervalId = setInterval(() => {
      if (currentFrame >= totalFrames) {
        clearInterval(intervalId);
        recorder.stop();
        return;
      }

      const t = currentFrame / fps;
      renderFrame(ctx, t, seconds);
      currentFrame++;

      if (onProgress && currentFrame % 3 === 0) {
        onProgress(Math.round((currentFrame / totalFrames) * 95));
      }
    }, frameInterval);
  });
}
