import { createClient } from '../db/supabase-client';
import type { BucketName } from './upload';

/**
 * Dynamically constructs the public URL for a storage object using bucket-relative path.
 * Avoids hardcoding full domain URLs inside database tables.
 */
export function getStoragePublicUrl(bucket: BucketName, relativePath?: string | null): string {
  if (!relativePath) return '';

  // If path is already an external URL (e.g. legacy fallback placeholder or external link), return as is
  if (relativePath.startsWith('http://') || relativePath.startsWith('https://')) {
    return relativePath;
  }

  const supabase = createClient();
  const { data } = supabase.storage.from(bucket).getPublicUrl(relativePath);
  return data?.publicUrl || '';
}
