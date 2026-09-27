import { createClient } from '../db/supabase-client';

export type BucketName = 'notice-files' | 'teacher-images' | 'gallery-images' | 'event-images' | 'school-assets';

export interface UploadOptions {
  file: File;
  bucket: BucketName;
  folder: 'notices' | 'teachers' | 'gallery' | 'events' | 'assets';
  schoolId: string;
}

export interface UploadResult {
  relativePath: string;
  originalName: string;
  size: number;
  mimeType: string;
}

const MIME_CONFIG: Record<BucketName, { allowedTypes: string[]; maxSizeMB: number }> = {
  'notice-files': {
    allowedTypes: ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
    maxSizeMB: 10,
  },
  'teacher-images': {
    allowedTypes: ['image/jpeg', 'image/png', 'image/webp'],
    maxSizeMB: 5,
  },
  'gallery-images': {
    allowedTypes: ['image/jpeg', 'image/png', 'image/webp'],
    maxSizeMB: 10,
  },
  'event-images': {
    allowedTypes: ['image/jpeg', 'image/png', 'image/webp'],
    maxSizeMB: 10,
  },
  'school-assets': {
    allowedTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/x-icon'],
    maxSizeMB: 5,
  },
};

export async function uploadFileToStorage({
  file,
  bucket,
  folder,
  schoolId,
}: UploadOptions): Promise<UploadResult> {
  const config = MIME_CONFIG[bucket];

  if (!config.allowedTypes.includes(file.type)) {
    throw new Error(`ফাইল ফরম্যাট অননুমোদিত। অনুমোদিত ফরম্যাট: ${config.allowedTypes.join(', ')}`);
  }

  const maxSizeBytes = config.maxSizeMB * 1024 * 1024;
  if (file.size > maxSizeBytes) {
    throw new Error(`ফাইল সাইজ সীমা অতিক্রম করেছে। সর্বোচ্চ সীমা: ${config.maxSizeMB}MB`);
  }

  // Generate safe sanitized filename with relative path format: {schoolId}/{folder}/{timestamp}_{random}.ext
  const ext = file.name.substring(file.name.lastIndexOf('.')).toLowerCase() || '.bin';
  const timestamp = Date.now();
  const randomStr = Math.random().toString(36).substring(2, 8);
  const relativePath = `${schoolId}/${folder}/${timestamp}_${randomStr}${ext}`;

  const supabase = createClient();
  const { error } = await supabase.storage.from(bucket).upload(relativePath, file, {
    cacheControl: '3600',
    upsert: false,
  });

  if (error) {
    throw new Error(`ফাইল আপলোড করতে ব্যর্থ: ${error.message}`);
  }

  return {
    relativePath,
    originalName: file.name,
    size: file.size,
    mimeType: file.type,
  };
}
