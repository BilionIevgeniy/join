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
  // <canvas> is never attached to the DOM — it only exists in memory as a
  // pixel buffer we draw into and then export from, below.
  const canvas = document.createElement('canvas');
  canvas.width = width; // sets the canvas's actual pixel buffer size, not CSS display size
  canvas.height = height;
  // drawImage(source, x, y, targetWidth, targetHeight) stretches/resamples
  // the source into the target rectangle — this is the actual resize step.
  canvas.getContext('2d')!.drawImage(bitmap, 0, 0, width, height);
  return canvas;
}

/** Promise wrapper around the callback-based `HTMLCanvasElement.toBlob`. */
function canvasToBlob(canvas: HTMLCanvasElement, type: string, quality?: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const onResult = (blob: Blob | null): void =>
      blob ? resolve(blob) : reject(new Error('Canvas toBlob() returned null.'));
    // toBlob() re-encodes the canvas's current pixels into `type` (e.g.
    // image/jpeg) and hands the result to a callback, not a return value —
    // hence the Promise wrapper above. `quality` only affects lossy formats
    // (JPEG/WebP); it's silently ignored for PNG.
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
  // createImageBitmap: native, no import needed. Decodes the file's raw
  // bytes into actual pixel data (a "bitmap") the canvas can draw. Returns a
  // Promise, unlike the classic `new Image(); img.onload = ...` approach.
  // `imageOrientation: 'from-image'` reads embedded EXIF rotation (common in
  // phone photos) and applies it, so the decoded bitmap comes out upright.
  const bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' });
  const { width, height } = calculateScaledDimensions(bitmap.width, bitmap.height);
  const canvas = drawToCanvas(bitmap, width, height);
  const quality = file.type === 'image/jpeg' ? JPEG_QUALITY : undefined;
  return canvasToBlob(canvas, file.type, quality);
}
