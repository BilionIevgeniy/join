/** Max width/height, in pixels, a task image is downscaled to (never upscaled). */
export const MAX_IMAGE_DIMENSION = 800;

/** JPEG re-encoding quality (0..1) applied on compression; ignored for PNG. */
const JPEG_QUALITY = 0.8;

/**
 * Scales `width`×`height` down to fit within `maxSize`×`maxSize`, preserving
 * aspect ratio. Returns the input unchanged if it already fits — images are
 * never upscaled.
 */
export function calculateScaledDimensions(
  width: number,
  height: number,
  maxSize = MAX_IMAGE_DIMENSION,
): { width: number; height: number } {
  if (width <= maxSize && height <= maxSize) return { width, height };
  const scale = Math.min(maxSize / width, maxSize / height);
  return { width: Math.round(width * scale), height: Math.round(height * scale) };
}

/** Draws `bitmap` onto a new canvas sized `width`×`height`, resampling its pixels. */
function drawToCanvas(bitmap: ImageBitmap, width: number, height: number): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  canvas.getContext('2d')!.drawImage(bitmap, 0, 0, width, height);
  return canvas;
}

/** Promise wrapper around the callback-based `HTMLCanvasElement.toBlob`. */
function canvasToBlob(canvas: HTMLCanvasElement, type: string, quality?: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const onResult = (blob: Blob | null): void =>
      blob ? resolve(blob) : reject(new Error('Canvas toBlob() returned null.'));
    canvas.toBlob(onResult, type, quality);
  });
}

/**
 * Compresses an image file: decodes it, downscales it to at most
 * {@link MAX_IMAGE_DIMENSION}×{@link MAX_IMAGE_DIMENSION} (preserving aspect
 * ratio, never upscaling), and re-encodes it in its original format.
 * JPEGs are additionally re-encoded at reduced quality; PNG stays lossless.
 */
export async function compressImage(file: File): Promise<Blob> {
  const bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' });
  const { width, height } = calculateScaledDimensions(bitmap.width, bitmap.height);
  const canvas = drawToCanvas(bitmap, width, height);
  const quality = file.type === 'image/jpeg' ? JPEG_QUALITY : undefined;
  return canvasToBlob(canvas, file.type, quality);
}
