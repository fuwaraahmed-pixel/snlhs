'use server';

import type { BucketName } from '../storage/upload';

const ALLOWED_MIME_TYPES: Record<BucketName, string[]> = {
  'notice-files': ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
  'teacher-images': ['image/jpeg', 'image/png', 'image/webp'],
  'gallery-images': ['image/jpeg', 'image/png', 'image/webp'],
  'event-images': ['image/jpeg', 'image/png', 'image/webp'],
  'school-assets': ['image/jpeg', 'image/png', 'image/webp', 'image/x-icon'],
};

const MAX_SIZE_BYTES: Record<BucketName, number> = {
  'notice-files': 10 * 1024 * 1024,
  'teacher-images': 5 * 1024 * 1024,
  'gallery-images': 10 * 1024 * 1024,
  'event-images': 10 * 1024 * 1024,
  'school-assets': 5 * 1024 * 1024,
};

export async function validateFileUploadServerAction(
  bucket: BucketName,
  fileName: string,
  fileSize: number,
  mimeType: string
) {
  const allowed = ALLOWED_MIME_TYPES[bucket];
  if (!allowed || !allowed.includes(mimeType)) {
    return {
      success: false,
      error: `অনুমোদিত ফাইল ফরম্যাট নয় (${mimeType})। অনুমোদিত ফরম্যাট: ${allowed?.join(', ')}`,
    };
  }

  const maxLimit = MAX_SIZE_BYTES[bucket];
  if (fileSize > maxLimit) {
    return {
      success: false,
      error: `ফাইল সাইজ সীমা অতিক্রম করেছে। (সর্বোচ্চ: ${maxLimit / (1024 * 1024)}MB)`,
    };
  }

  const forbiddenExts = ['.exe', '.sh', '.php', '.js', '.bat', '.cmd', '.vbs', '.ps1'];
  const ext = fileName.substring(fileName.lastIndexOf('.')).toLowerCase();
  if (forbiddenExts.includes(ext)) {
    return {
      success: false,
      error: `নিরাপত্তাজনিত কারণে ফাইল ফরম্যাট (${ext}) সম্পূর্ণ নিষিদ্ধ।`,
    };
  }

  return { success: true };
}
