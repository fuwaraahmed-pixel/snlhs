'use server';

import type { BucketName } from '../storage/upload';
import { createClient } from '../db/supabase-server';
import { revalidatePath } from 'next/cache';

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

/**
 * Server action: Upload a teacher photo to Supabase Storage (teacher-images bucket).
 * Returns the public URL to be stored in teachers.photo_url.
 */
export async function uploadTeacherPhotoAction(
  formData: FormData
): Promise<{ success: boolean; error?: string; publicUrl?: string }> {
  try {
    const supabase = await createClient();
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) return { success: false, error: 'অনুগ্রহ করে লগইন করুন।' };

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role, school_id')
      .eq('id', user.id)
      .single();
    if (profileError || !profile || profile.role !== 'admin') {
      return { success: false, error: 'অ্যাডমিন অনুমতি প্রয়োজন।' };
    }

    const file = formData.get('file') as File | null;
    if (!file) return { success: false, error: 'কোনো ফাইল পাওয়া যায়নি।' };

    const allowed = ALLOWED_MIME_TYPES['teacher-images'];
    if (!allowed.includes(file.type)) {
      return { success: false, error: `ফাইল ফরম্যাট অননুমোদিত। JPG/PNG/WebP ব্যবহার করুন।` };
    }
    if (file.size > MAX_SIZE_BYTES['teacher-images']) {
      return { success: false, error: 'ছবির সাইজ সর্বোচ্চ ৫MB হতে হবে।' };
    }

    const ext = file.name.substring(file.name.lastIndexOf('.')).toLowerCase() || '.jpg';
    const path = `${profile.school_id}/teachers/${Date.now()}_${Math.random().toString(36).substring(2, 8)}${ext}`;

    const arrayBuffer = await file.arrayBuffer();
    const { error: storageError } = await supabase.storage
      .from('teacher-images')
      .upload(path, arrayBuffer, { contentType: file.type, upsert: false });

    if (storageError) return { success: false, error: `আপলোড ব্যর্থ: ${storageError.message}` };

    const { data: { publicUrl } } = supabase.storage.from('teacher-images').getPublicUrl(path);
    return { success: true, publicUrl };
  } catch (err: any) {
    return { success: false, error: `সার্ভার এরর: ${err.message}` };
  }
}

/**
 * Server action: Upload an event image to Supabase Storage (event-images bucket).
 * Returns the public URL to be stored in events.featured_image.
 */
export async function uploadEventImageAction(
  formData: FormData
): Promise<{ success: boolean; error?: string; publicUrl?: string }> {
  try {
    const supabase = await createClient();
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) return { success: false, error: 'অনুগ্রহ করে লগইন করুন।' };

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role, school_id')
      .eq('id', user.id)
      .single();
    if (profileError || !profile || profile.role !== 'admin') {
      return { success: false, error: 'অ্যাডমিন অনুমতি প্রয়োজন।' };
    }

    const file = formData.get('file') as File | null;
    if (!file) return { success: false, error: 'কোনো ফাইল পাওয়া যায়নি।' };

    const allowed = ALLOWED_MIME_TYPES['event-images'];
    if (!allowed.includes(file.type)) {
      return { success: false, error: `ফাইল ফরম্যাট অননুমোদিত। JPG/PNG/WebP ব্যবহার করুন।` };
    }
    if (file.size > MAX_SIZE_BYTES['event-images']) {
      return { success: false, error: 'ছবির সাইজ সর্বোচ্চ ১০MB হতে হবে।' };
    }

    const ext = file.name.substring(file.name.lastIndexOf('.')).toLowerCase() || '.jpg';
    const path = `${profile.school_id}/events/${Date.now()}_${Math.random().toString(36).substring(2, 8)}${ext}`;

    const arrayBuffer = await file.arrayBuffer();
    const { error: storageError } = await supabase.storage
      .from('event-images')
      .upload(path, arrayBuffer, { contentType: file.type, upsert: false });

    if (storageError) return { success: false, error: `আপলোড ব্যর্থ: ${storageError.message}` };

    const { data: { publicUrl } } = supabase.storage.from('event-images').getPublicUrl(path);
    return { success: true, publicUrl };
  } catch (err: any) {
    return { success: false, error: `সার্ভার এরর: ${err.message}` };
  }
}

/**
 * Server action: Upload a notice attachment (PDF/DOCX) to Supabase Storage (notice-files bucket).
 * Returns the public URL and original filename.
 */
export async function uploadNoticeAttachmentAction(
  formData: FormData
): Promise<{ success: boolean; error?: string; publicUrl?: string; originalName?: string; mimeType?: string }> {
  try {
    const supabase = await createClient();
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) return { success: false, error: 'অনুগ্রহ করে লগইন করুন।' };

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role, school_id')
      .eq('id', user.id)
      .single();
    if (profileError || !profile || profile.role !== 'admin') {
      return { success: false, error: 'অ্যাডমিন অনুমতি প্রয়োজন।' };
    }

    const file = formData.get('file') as File | null;
    if (!file) return { success: false, error: 'কোনো ফাইল পাওয়া যায়নি।' };

    const allowed = ALLOWED_MIME_TYPES['notice-files'];
    if (!allowed.includes(file.type)) {
      return { success: false, error: `শুধু PDF বা Word (DOCX) ফাইল আপলোড করা যাবে।` };
    }
    if (file.size > MAX_SIZE_BYTES['notice-files']) {
      return { success: false, error: 'ফাইল সাইজ সর্বোচ্চ ১০MB হতে হবে।' };
    }

    const ext = file.name.substring(file.name.lastIndexOf('.')).toLowerCase() || '.pdf';
    const path = `${profile.school_id}/notices/${Date.now()}_${Math.random().toString(36).substring(2, 8)}${ext}`;

    const arrayBuffer = await file.arrayBuffer();
    const { error: storageError } = await supabase.storage
      .from('notice-files')
      .upload(path, arrayBuffer, { contentType: file.type, upsert: false });

    if (storageError) return { success: false, error: `আপলোড ব্যর্থ: ${storageError.message}` };

    const { data: { publicUrl } } = supabase.storage.from('notice-files').getPublicUrl(path);
    return { success: true, publicUrl, originalName: file.name, mimeType: file.type };
  } catch (err: any) {
    return { success: false, error: `সার্ভার এরর: ${err.message}` };
  }
}

/**
 * Server action: Upload a gallery image to Supabase Storage and insert a
 * record into gallery_images for the given albumId.
 */
export async function uploadGalleryImageAction(
  formData: FormData
): Promise<{ success: boolean; error?: string; imageUrl?: string }> {
  try {
    const supabase = await createClient();

    // Auth check
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) return { success: false, error: 'অনুগ্রহ করে লগইন করুন।' };

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role, school_id')
      .eq('id', user.id)
      .single();

    if (profileError || !profile || profile.role !== 'admin') {
      return { success: false, error: 'অ্যাডমিন অনুমতি প্রয়োজন।' };
    }

    const file = formData.get('file') as File | null;
    const albumId = formData.get('albumId') as string | null;

    if (!file || !albumId) return { success: false, error: 'ফাইল বা অ্যালবাম আইডি পাওয়া যায়নি।' };

    // Validate mime type
    const allowed = ALLOWED_MIME_TYPES['gallery-images'];
    if (!allowed.includes(file.type)) {
      return { success: false, error: `ফাইল ফরম্যাট অননুমোদিত (${file.type})। JPG/PNG/WebP ব্যবহার করুন।` };
    }
    if (file.size > MAX_SIZE_BYTES['gallery-images']) {
      return { success: false, error: 'ছবির সাইজ সর্বোচ্চ ১০MB হতে হবে।' };
    }

    // Upload to Supabase Storage
    const ext = file.name.substring(file.name.lastIndexOf('.')).toLowerCase() || '.jpg';
    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substring(2, 8);
    const path = `${profile.school_id}/gallery/${timestamp}_${randomStr}${ext}`;

    const arrayBuffer = await file.arrayBuffer();
    const { error: storageError } = await supabase.storage
      .from('gallery-images')
      .upload(path, arrayBuffer, { contentType: file.type, upsert: false });

    if (storageError) return { success: false, error: `আপলোড ব্যর্থ: ${storageError.message}` };

    // Get public URL
    const { data: { publicUrl } } = supabase.storage.from('gallery-images').getPublicUrl(path);

    // Insert image record into gallery_images table
    const { error: insertError } = await supabase.from('gallery_images').insert({
      album_id: albumId,
      school_id: profile.school_id,
      image_url: publicUrl,
    });

    if (insertError) return { success: false, error: `ডেটাবেজে সংরক্ষণ ব্যর্থ: ${insertError.message}` };

    revalidatePath('/admin/gallery');
    revalidatePath('/gallery');

    return { success: true, imageUrl: publicUrl };
  } catch (err: any) {
    return { success: false, error: `সার্ভার এরর: ${err.message}` };
  }
}
