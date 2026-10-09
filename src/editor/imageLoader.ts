import { MAX_IMAGE_DIMENSION } from '../config';

export interface ProcessedImage {
  bitmap: ImageBitmap | HTMLCanvasElement;
  blob: Blob;
  thumbBlob: Blob;
  width: number;
  height: number;
}

/**
 * Loads and downscales an image file safely while respecting EXIF orientation
 * and stripping sensitive metadata.
 */
export async function processUploadedFile(file: File | Blob): Promise<ProcessedImage> {
  // Try createImageBitmap with imageOrientation first
  let sourceWidth = 0;
  let sourceHeight = 0;
  let rawDrawable: ImageBitmap | HTMLImageElement;

  try {
    if (typeof createImageBitmap === 'function') {
      const bmp = await createImageBitmap(file, { imageOrientation: 'from-image' });
      sourceWidth = bmp.width;
      sourceHeight = bmp.height;
      rawDrawable = bmp;
    } else {
      throw new Error('createImageBitmap not available');
    }
  } catch {
    // Fallback using HTMLImageElement
    rawDrawable = await new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new Image();
      const url = URL.createObjectURL(file);
      img.onload = () => {
        URL.revokeObjectURL(url);
        resolve(img);
      };
      img.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new Error('Failed to load image format. Please use JPG, PNG, or WebP.'));
      };
      img.src = url;
    });
    sourceWidth = rawDrawable.width;
    sourceHeight = rawDrawable.height;
  }

  // Calculate target dimensions capped at MAX_IMAGE_DIMENSION (2048px)
  let targetW = sourceWidth;
  let targetH = sourceHeight;

  if (targetW > MAX_IMAGE_DIMENSION || targetH > MAX_IMAGE_DIMENSION) {
    if (targetW >= targetH) {
      targetH = Math.round((targetH / targetW) * MAX_IMAGE_DIMENSION);
      targetW = MAX_IMAGE_DIMENSION;
    } else {
      targetW = Math.round((targetW / targetH) * MAX_IMAGE_DIMENSION);
      targetH = MAX_IMAGE_DIMENSION;
    }
  }

  // Draw into main canvas (strips EXIF & GPS metadata)
  const mainCanvas = document.createElement('canvas');
  mainCanvas.width = targetW;
  mainCanvas.height = targetH;
  const ctx = mainCanvas.getContext('2d');
  if (!ctx) throw new Error('Failed to get 2D context for image processing');

  ctx.drawImage(rawDrawable, 0, 0, targetW, targetH);

  // Generate clean WebP/JPEG blob
  const mainBlob = await new Promise<Blob>((resolve, reject) => {
    mainCanvas.toBlob(
      (b) => (b ? resolve(b) : reject(new Error('Blob generation failed'))),
      'image/jpeg',
      0.92
    );
  });

  // Generate thumbnail canvas (max 240px)
  const thumbScale = Math.min(240 / targetW, 240 / targetH, 1);
  const thumbW = Math.round(targetW * thumbScale);
  const thumbH = Math.round(targetH * thumbScale);

  const thumbCanvas = document.createElement('canvas');
  thumbCanvas.width = thumbW;
  thumbCanvas.height = thumbH;
  const thumbCtx = thumbCanvas.getContext('2d');
  if (thumbCtx) {
    thumbCtx.drawImage(mainCanvas, 0, 0, thumbW, thumbH);
  }

  const thumbBlob = await new Promise<Blob>((resolve) => {
    thumbCanvas.toBlob((b) => resolve(b || mainBlob), 'image/jpeg', 0.8);
  });

  return {
    bitmap: mainCanvas,
    blob: mainBlob,
    thumbBlob,
    width: targetW,
    height: targetH,
  };
}

/**
 * Reconstitutes an ImageBitmap or HTMLImageElement from a stored Blob.
 */
export async function loadImageFromBlob(blob: Blob): Promise<{
  drawable: CanvasImageSource;
  width: number;
  height: number;
}> {
  if (typeof createImageBitmap === 'function') {
    try {
      const bmp = await createImageBitmap(blob);
      return { drawable: bmp, width: bmp.width, height: bmp.height };
    } catch {
      // fallback to img element
    }
  }

  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(blob);
    img.onload = () => {
      resolve({ drawable: img, width: img.naturalWidth, height: img.naturalHeight });
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to restore image from storage'));
    };
    img.src = url;
  });
}
