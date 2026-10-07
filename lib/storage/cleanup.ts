/**
 * Utility to extract storage relative path from a full Supabase public URL or relative path.
 * Example URL:
 * https://xxx.supabase.co/storage/v1/object/public/notice-files/snlhs/notices/123.pdf
 * Extracted path:
 * snlhs/notices/123.pdf
 */
export function extractStoragePath(fileUrlOrPath: string | null | undefined, bucket: string): string | null {
  if (!fileUrlOrPath || typeof fileUrlOrPath !== 'string') return null;

  const trimmed = fileUrlOrPath.trim();
  if (!trimmed) return null;

  // If it's a full Supabase storage URL
  const bucketMarker = `/storage/v1/object/public/${bucket}/`;
  if (trimmed.includes(bucketMarker)) {
    return trimmed.substring(trimmed.indexOf(bucketMarker) + bucketMarker.length);
  }

  // If already relative or formatted
  if (!trimmed.startsWith('http://') && !trimmed.startsWith('https://')) {
    return trimmed;
  }

  return null;
}
