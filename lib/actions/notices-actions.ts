'use server';

import { createClient } from '../db/supabase-server';
import { NoticeSchema } from '../validation/schemas';
import { revalidatePath } from 'next/cache';

export interface NoticeActionState {
  success: boolean;
  error?: string;
  data?: any;
}

// Auth & Admin authorization helper
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

export async function getAdminNotices(): Promise<{ notices: any[]; schoolId?: string; error?: string }> {
  try {
    const { error: authError, profile, supabase } = await verifyAdminAuth();
    if (authError || !profile) {
      return { notices: [], error: authError || 'অনুমতি নেই' };
    }

    const { data, error } = await supabase
      .from('notices')
      .select('*')
      .eq('school_id', profile.school_id)
      .order('created_at', { ascending: false });

    if (error) {
      return { notices: [], error: `নোটিশ তালিকা লোড করতে ব্যর্থ: ${error.message}` };
    }

    return { notices: data || [], schoolId: profile.school_id };
  } catch (err: any) {
    return { notices: [], error: `সার্ভার এরর: ${err.message}` };
  }
}

// 2. Create Notice Action
export async function createNoticeAction(formData: {
  title: string;
  description?: string;
  category?: string;
  attachment_url?: string | null;
  attachment_original_name?: string | null;
  attachment_type?: string | null;
  is_important?: boolean;
  is_published?: boolean;
}): Promise<NoticeActionState> {
  try {
    const { error: authError, profile, supabase } = await verifyAdminAuth();
    if (authError || !profile) {
      return { success: false, error: authError || 'অনুমতি নেই' };
    }

    const validation = NoticeSchema.safeParse(formData);
    if (!validation.success) {
      const firstError = validation.error.issues[0]?.message || 'ভ্যালিডেশন এরর';
      return { success: false, error: firstError };
    }

    const { title, description, category, attachment_url, is_important, is_published } = validation.data;

    const { data, error } = await supabase
      .from('notices')
      .insert({
        school_id: profile.school_id,
        title,
        description: description || null,
        category: category || 'সাধারণ',
        pub_date: new Date().toISOString().split('T')[0],
        attachment_url: attachment_url || null,
        attachment_original_name: formData.attachment_original_name || null,
        attachment_type: formData.attachment_type || null,
        is_important: is_important ?? false,
        is_published: is_published ?? false,
      })
      .select()
      .single();

    if (error) {
      return { success: false, error: `নোটিশ যোগ করতে ব্যর্থ: ${error.message}` };
    }

    revalidatePath('/admin/notices');
    revalidatePath('/notices');
    revalidatePath('/');

    return { success: true, data };
  } catch (err: any) {
    return { success: false, error: `সার্ভার এরর: ${err.message}` };
  }
}

// 3. Update Notice Action
export async function updateNoticeAction(
  id: string,
  formData: {
    title: string;
    description?: string;
    category?: string;
    attachment_url?: string | null;
    attachment_original_name?: string | null;
    attachment_type?: string | null;
    is_important?: boolean;
    is_published?: boolean;
  }
): Promise<NoticeActionState> {
  try {
    const { error: authError, profile, supabase } = await verifyAdminAuth();
    if (authError || !profile) {
      return { success: false, error: authError || 'অনুমতি নেই' };
    }

    const validation = NoticeSchema.safeParse(formData);
    if (!validation.success) {
      const firstError = validation.error.issues[0]?.message || 'ভ্যালিডেশন এরর';
      return { success: false, error: firstError };
    }

    const { title, description, category, attachment_url, is_important, is_published } = validation.data;

    const { data, error } = await supabase
      .from('notices')
      .update({
        title,
        description: description || null,
        category: category || 'সাধারণ',
        attachment_url: attachment_url || null,
        attachment_original_name: formData.attachment_original_name || null,
        attachment_type: formData.attachment_type || null,
        is_important: is_important ?? false,
        is_published: is_published ?? false,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .eq('school_id', profile.school_id)
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return { success: false, error: 'নোটিশটি পাওয়া যায়নি বা এটি আপনার স্কুলের নয়।' };
      }
      return { success: false, error: `নোটিশ আপডেট করতে ব্যর্থ: ${error.message}` };
    }

    revalidatePath('/admin/notices');
    revalidatePath('/notices');
    revalidatePath('/');

    return { success: true, data };
  } catch (err: any) {
    return { success: false, error: `সার্ভার এরর: ${err.message}` };
  }
}

// 4. Delete Notice Action
export async function deleteNoticeAction(id: string): Promise<NoticeActionState> {
  try {
    const { error: authError, profile, supabase } = await verifyAdminAuth();
    if (authError || !profile) {
      return { success: false, error: authError || 'অনুমতি নেই' };
    }

    // First fetch the record to check if it has an attachment to clean up
    const { data: noticeToDel } = await supabase
      .from('notices')
      .select('attachment_url')
      .eq('id', id)
      .eq('school_id', profile.school_id)
      .maybeSingle();

    const { data, error } = await supabase
      .from('notices')
      .delete()
      .eq('id', id)
      .eq('school_id', profile.school_id)
      .select();

    if (error) {
      return { success: false, error: `নোটিশ মুছতে ব্যর্থ: ${error.message}` };
    }

    if (!data || data.length === 0) {
      return { success: false, error: 'নোটিশটি পাওয়া যায়নি বা এটি আপনার স্কুলের নয়।' };
    }

    // If notice had a stored attachment, remove it from notice-files storage bucket
    if (noticeToDel?.attachment_url) {
      try {
        const { extractStoragePath } = await import('../storage/cleanup');
        const storagePath = extractStoragePath(noticeToDel.attachment_url, 'notice-files');
        if (storagePath) {
          await supabase.storage.from('notice-files').remove([storagePath]);
        }
      } catch (storageErr) {
        console.warn('Could not remove notice attachment from storage:', storageErr);
      }
    }

    revalidatePath('/admin/notices');
    revalidatePath('/notices');
    revalidatePath('/');

    return { success: true };
  } catch (err: any) {
    return { success: false, error: `সার্ভার এরর: ${err.message}` };
  }
}

// 5. Toggle Notice Publish Action
export async function toggleNoticePublishAction(id: string, currentStatus: boolean): Promise<NoticeActionState> {
  try {
    const { error: authError, profile, supabase } = await verifyAdminAuth();
    if (authError || !profile) {
      return { success: false, error: authError || 'অনুমতি নেই' };
    }

    const { data, error } = await supabase
      .from('notices')
      .update({
        is_published: !currentStatus,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .eq('school_id', profile.school_id)
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return { success: false, error: 'নোটিশটি পাওয়া যায়নি বা এটি আপনার স্কুলের নয়।' };
      }
      return { success: false, error: `স্ট্যাটাস পরিবর্তন করতে ব্যর্থ: ${error.message}` };
    }

    revalidatePath('/admin/notices');
    revalidatePath('/notices');
    revalidatePath('/');

    return { success: true, data };
  } catch (err: any) {
    return { success: false, error: `সার্ভার এরর: ${err.message}` };
  }
}
