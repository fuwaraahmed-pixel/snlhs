import { createClient } from '../db/supabase-client';
import type { BucketName } from './upload';

/**
 * Dynamically constructs the public URL for a public storage object (teacher-images, gallery-images, etc.)
 */
export function getStoragePublicUrl(bucket: BucketName, relativePath?: string | null): string {
  if (!relativePath) return '';

  if (relativePath.startsWith('http://') || relativePath.startsWith('https://')) {
    return relativePath;
  }

  const supabase = createClient();
  const { data } = supabase.storage.from(bucket).getPublicUrl(relativePath);
  return data?.publicUrl || '';
}

/**
 * Creates a signed URL for private bucket storage objects (notice-files bucket)
 * Valid for 60 minutes by default.
 */
export async function getStorageSignedUrl(
  bucket: BucketName,
  relativePath?: string | null,
  expiresInSeconds: number = 3600
): Promise<string> {
  if (!relativePath) return '';

  if (relativePath.startsWith('http://') || relativePath.startsWith('https://')) {
    return relativePath;
  }

  const supabase = createClient();
  const { data, error } = await supabase.storage
    .from(bucket)
    .createSignedUrl(relativePath, expiresInSeconds);

  if (error || !data?.signedUrl) {
    console.error('Error generating signed URL:', error);
    return '';
  }

  return data.signedUrl;
}

