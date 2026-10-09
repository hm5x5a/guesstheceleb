import { renderCompositeFrame, type FrameRenderOptions } from './renderFrame';

export interface ImagePairBlobs {
  beforeBlob: Blob;
  afterBlob: Blob;
}

/**
 * Generates a PNG pair: 'Before' (masked blackout) and 'After' (unmasked reveal),
 * both bearing the subtle promo frame.
 */
export async function exportImagePair(
  options: FrameRenderOptions
): Promise<ImagePairBlobs> {
  const { width, height } = options;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Failed to create canvas context');

  // 1. Render 'Before' frame (at t = 0, fully masked)
  renderCompositeFrame(ctx, 0, 6, options);
  const beforeBlob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('Canvas toBlob failed'))), 'image/png');
  });

  // 2. Render 'After' frame (at t = 5, fully revealed)
  renderCompositeFrame(ctx, 5, 6, options);
  const afterBlob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('Canvas toBlob failed'))), 'image/png');
  });

  return { beforeBlob, afterBlob };
}

/**
 * Triggers a browser download of a given Blob.
 */
export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 4000);
}

/**
 * Shares a file using the Native Web Share API if supported.
 * Falls back to direct download if sharing is unsupported or declined.
 */
export async function shareOrDownloadFile(
  fileBlob: Blob,
  fileName: string,
  title = 'Guess The Celeb Reveal',
  text = 'Can you guess who this is? Made with GuessTheCelebMaker'
): Promise<'shared' | 'downloaded'> {
  if (
    typeof navigator !== 'undefined' &&
    navigator.share &&
    navigator.canShare
  ) {
    try {
      const file = new File([fileBlob], fileName, { type: fileBlob.type });
      if (navigator.canShare({ files: [file] })) {
        await navigator.share({
          title,
          text,
          files: [file],
        });
        return 'shared';
      }
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        console.warn('Share API failed, falling back to download:', err);
      } else {
        // User cancelled share dialog
        return 'shared';
      }
    }
  }

  downloadBlob(fileBlob, fileName);
  return 'downloaded';
}
