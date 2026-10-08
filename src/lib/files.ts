// Photo checks for the request form. The browser's MIME type and the file name are
// not trusted on their own: the first bytes must match a real JPEG, PNG or WebP.

export const MAX_FILES = 3;
export const MAX_BYTES = 10 * 1024 * 1024;
export const ACCEPT = '.jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp';

export type ImageKind = 'jpeg' | 'png' | 'webp';
const EXTENSIONS: Record<string, ImageKind> = { jpg: 'jpeg', jpeg: 'jpeg', png: 'png', webp: 'webp' };

const ascii = (b: Uint8Array, from: number, to: number) => String.fromCharCode(...b.subarray(from, to));

export function sniff(b: Uint8Array): ImageKind | null {
  if (b.length >= 3 && b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff) return 'jpeg';
  if (b.length >= 8 && [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a].every((x, i) => b[i] === x)) return 'png';
  if (b.length >= 12 && ascii(b, 0, 4) === 'RIFF' && ascii(b, 8, 12) === 'WEBP') return 'webp';
  return null;
}

export type FileCheck = { ok: true; kind: ImageKind } | { ok: false; reason: string };

export function checkHeader(name: string, size: number, head: Uint8Array): FileCheck {
  const ext = name.toLowerCase().split('.').pop() ?? '';
  if (!(ext in EXTENSIONS)) return { ok: false, reason: 'подходят только фото JPG, PNG или WebP' };
  if (size > MAX_BYTES) return { ok: false, reason: 'файл больше 10 МБ' };
  const kind = sniff(head);
  if (!kind) return { ok: false, reason: 'содержимое не похоже на фото' };
  return { ok: true, kind };
}

export async function checkFile(file: File): Promise<FileCheck> {
  const head = new Uint8Array(await file.slice(0, 12).arrayBuffer());
  return checkHeader(file.name, file.size, head);
}

/**
 * Redraws the photo on a canvas. The result has no EXIF, so no GPS position or camera
 * serial travels with it, and it is no larger than maxSide pixels.
 */
export async function stripMetadata(file: File, maxSide = 1600): Promise<{ blob: Blob; width: number; height: number }> {
  const bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' });
  const k = Math.min(1, maxSide / Math.max(bitmap.width, bitmap.height));
  const width = Math.round(bitmap.width * k);
  const height = Math.round(bitmap.height * k);
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  canvas.getContext('2d')?.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();
  const blob = await new Promise<Blob>((resolve, reject) =>
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('encode failed'))), 'image/jpeg', 0.85),
  );
  return { blob, width, height };
}
