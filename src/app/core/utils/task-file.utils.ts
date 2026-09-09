import { TaskFile } from '@core/models/task.model';
import { blobToBase64 } from './file.utils';
import { compressImage } from './image.utils';

/**
 * Builds a {@link TaskFile} from an already-validated file: compresses it
 * (see {@link compressImage}), Base64-encodes the result, and attaches
 * metadata. `size` is the *compressed* byte size — what actually gets stored
 * and later downloaded, not the original upload size.
 */
export async function buildTaskFile(file: File): Promise<TaskFile> {
  const compressed = await compressImage(file);
  const data = await blobToBase64(compressed);
  return {
    id: crypto.randomUUID(),
    name: file.name,
    type: file.type,
    size: compressed.size,
    createdAt: new Date().toISOString(),
    data,
  };
}
