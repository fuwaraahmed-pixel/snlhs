'use server';

import { createClient } from '../db/supabase-server';
import { revalidatePath } from 'next/cache';

interface ActionResult {
  success: boolean;
  error?: string;
  data?: any;
}

async function verifyAdminAuth() {
  const supabase = await createClient();
  const { data: { user }, error: userError } = await supabase.auth.getUser();

  if (userError || !user) {
    return { error: 'অনুগ্রহ করে প্রথমে অ্যাডমিন হিসেবে লগইন করুন।', user: null, profile: null, supabase };
  }

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('role, school_id')
    .eq('id', user.id)
    .single();

  if (profileError || !profile || profile.role !== 'admin') {
    return { error: 'আপনার এই কাজটি করার পর্যাপ্ত অ্যাডমিন অনুমতি নেই।', user: null, profile: null, supabase };
  }

  return { error: null, user, profile, supabase };
}

// ─── ALBUM ACTIONS ─────────────────────────────────────────

export async function getAdminGalleryAlbums(): Promise<{ albums: any[]; error?: string }> {
  try {
    const { error: authError, profile, supabase } = await verifyAdminAuth();
    if (authError || !profile) return { albums: [], error: authError || 'অনুমতি নেই' };

    const { data, error } = await supabase
      .from('gallery_albums')
      .select('*, cover_image, gallery_images(id, image_url, caption, display_order)')
      .eq('school_id', profile.school_id)
      .order('created_at', { ascending: false });

    if (error) return { albums: [], error: `অ্যালবাম লোড করতে ব্যর্থ: ${error.message}` };

    return { albums: data || [] };
  } catch (err: any) {
    return { albums: [], error: `সার্ভার এরর: ${err.message}` };
  }
}

export async function createGalleryAlbumAction(payload: {
  title: string;
  description?: string;
}): Promise<ActionResult> {
  try {
    const { error: authError, profile, supabase } = await verifyAdminAuth();
    if (authError || !profile) return { success: false, error: authError || 'অনুমতি নেই' };

    if (!payload.title?.trim()) {
      return { success: false, error: 'অ্যালবামের শিরোনাম দিতে হবে।' };
    }

    const { data, error } = await supabase
      .from('gallery_albums')
      .insert({
        school_id: profile.school_id,
        title: payload.title.trim(),
        description: payload.description?.trim() || null,
        is_published: false,
      })
      .select()
      .single();

    if (error) return { success: false, error: `অ্যালবাম তৈরি করতে ব্যর্থ: ${error.message}` };

    revalidatePath('/admin/gallery');
    revalidatePath('/gallery');

    return { success: true, data };
  } catch (err: any) {
    return { success: false, error: `সার্ভার এরর: ${err.message}` };
  }
}

export async function deleteGalleryAlbumAction(id: string): Promise<ActionResult> {
  try {
    const { error: authError, profile, supabase } = await verifyAdminAuth();
    if (authError || !profile) return { success: false, error: authError || 'অনুমতি নেই' };

    // First delete all images in the album
    await supabase
      .from('gallery_images')
      .delete()
      .eq('album_id', id);

    const { error } = await supabase
      .from('gallery_albums')
      .delete()
      .eq('id', id)
      .eq('school_id', profile.school_id);

    if (error) return { success: false, error: `অ্যালবাম মুছতে ব্যর্থ: ${error.message}` };

    revalidatePath('/admin/gallery');
    revalidatePath('/gallery');

    return { success: true };
  } catch (err: any) {
    return { success: false, error: `সার্ভার এরর: ${err.message}` };
  }
}

export async function toggleAlbumPublishAction(id: string, currentStatus: boolean): Promise<ActionResult> {
  try {
    const { error: authError, profile, supabase } = await verifyAdminAuth();
    if (authError || !profile) return { success: false, error: authError || 'অনুমতি নেই' };

    const { data, error } = await supabase
      .from('gallery_albums')
      .update({ is_published: !currentStatus })
      .eq('id', id)
      .eq('school_id', profile.school_id)
      .select()
      .single();

    if (error) return { success: false, error: `স্ট্যাটাস পরিবর্তন করতে ব্যর্থ: ${error.message}` };

    revalidatePath('/admin/gallery');
    revalidatePath('/gallery');

    return { success: true, data };
  } catch (err: any) {
    return { success: false, error: `সার্ভার এরর: ${err.message}` };
  }
}

// ─── IMAGE ACTIONS ─────────────────────────────────────────

export async function addGalleryImageAction(payload: {
  albumId: string;
  imageUrl: string;
  caption?: string;
}): Promise<ActionResult> {
  try {
    const { error: authError, profile, supabase } = await verifyAdminAuth();
    if (authError || !profile) return { success: false, error: authError || 'অনুমতি নেই' };

    const { data, error } = await supabase
      .from('gallery_images')
      .insert({
        album_id: payload.albumId,
        school_id: profile.school_id,
        image_url: payload.imageUrl,
        caption: payload.caption || null,
      })
      .select()
      .single();

    if (error) return { success: false, error: `ছবি যোগ করতে ব্যর্থ: ${error.message}` };

    revalidatePath('/admin/gallery');
    revalidatePath('/gallery');

    return { success: true, data };
  } catch (err: any) {
    return { success: false, error: `সার্ভার এরর: ${err.message}` };
  }
}

export async function deleteGalleryImageAction(imageId: string): Promise<ActionResult> {
  try {
    const { error: authError, profile, supabase } = await verifyAdminAuth();
    if (authError || !profile) return { success: false, error: authError || 'অনুমতি নেই' };

    // Fetch image record first to extract image_url
    const { data: imgToDel } = await supabase
      .from('gallery_images')
      .select('image_url')
      .eq('id', imageId)
      .eq('school_id', profile.school_id)
      .maybeSingle();

    const { error } = await supabase
      .from('gallery_images')
      .delete()
      .eq('id', imageId)
      .eq('school_id', profile.school_id);

    if (error) return { success: false, error: `ছবি মুছতে ব্যর্থ: ${error.message}` };

    if (imgToDel?.image_url) {
      try {
        const { extractStoragePath } = await import('../storage/cleanup');
        const storagePath = extractStoragePath(imgToDel.image_url, 'gallery-images');
        if (storagePath) {
          await supabase.storage.from('gallery-images').remove([storagePath]);
        }
      } catch (storageErr) {
        console.warn('Could not remove gallery image from storage:', storageErr);
      }
    }

    revalidatePath('/admin/gallery');
    revalidatePath('/gallery');

    return { success: true };
  } catch (err: any) {
    return { success: false, error: `সার্ভার এরর: ${err.message}` };
  }
}
