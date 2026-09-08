/**
 * Image MIME types accepted for task file uploads, per the Figma design
 * ("Allowed file types are JPEG and PNG"). SVG is deliberately excluded even
 * though it's an image format — it's XML and can embed scripts/event
 * handlers, a known stored-XSS vector for file uploads.
 */
export const ALLOWED_FILE_TYPES = ['image/jpeg', 'image/png'] as const;

/** Max size, in bytes, of a single uploaded task file (1 MB, per the checklist). */
export const MAX_FILE_SIZE_BYTES = 1024 * 1024;

/** Result of validating one file selected for upload. */
export interface FileValidationResult {
  valid: boolean;
  error?: string;
}

/** True when the file's MIME type is in the {@link ALLOWED_FILE_TYPES} whitelist. */
export function isAllowedFileType(file: File): boolean {
  return (ALLOWED_FILE_TYPES as readonly string[]).includes(file.type);
}

/** True when the file's (uncompressed) size does not exceed `maxBytes`. */
export function isFileSizeValid(file: File, maxBytes = MAX_FILE_SIZE_BYTES): boolean {
  return file.size <= maxBytes;
}

/**
 * Validates a single file selected for upload — format first, then size —
 * and returns a user-facing error message for the first check that fails.
 */
export function validateFile(file: File): FileValidationResult {
  if (!isAllowedFileType(file)) {
    return { valid: false, error: `${file.name}: only JPEG or PNG images are allowed.` };
  }
  if (!isFileSizeValid(file)) {
    return { valid: false, error: `${file.name}: exceeds the 1 MB size limit.` };
  }
  return { valid: true };
}
