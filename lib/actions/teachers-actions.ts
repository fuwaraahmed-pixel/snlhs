'use server';

import { createClient } from '../db/supabase-server';
import { TeacherSchema } from '../validation/schemas';
import { revalidatePath } from 'next/cache';

export interface TeacherActionState {
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

// 1. Get Admin Teachers
export async function getAdminTeachers(): Promise<{ teachers: any[]; schoolId?: string; error?: string }> {
  try {
    const { error: authError, profile, supabase } = await verifyAdminAuth();
    if (authError || !profile) {
      return { teachers: [], error: authError || 'অনুমতি নেই' };
    }

    const { data, error } = await supabase
      .from('teachers')
      .select('*')
      .eq('school_id', profile.school_id)
      .order('display_order', { ascending: true });

    if (error) {
      return { teachers: [], error: `শিক্ষকদের তালিকা লোড করতে ব্যর্থ: ${error.message}` };
    }

    return { teachers: data || [], schoolId: profile.school_id };
  } catch (err: any) {
    return { teachers: [], error: `সার্ভার এরর: ${err.message}` };
  }
}

// 2. Create Teacher Action
export async function createTeacherAction(formData: {
  name: string;
  designation: string;
  subject?: string;
  department?: string;
  phone?: string;
  email?: string;
  photo_url?: string | null;
  biography?: string;
  display_order?: number;
  is_published?: boolean;
}): Promise<TeacherActionState> {
  try {
    const { error: authError, user, profile, supabase } = await verifyAdminAuth();
    if (authError || !profile) {
      return { success: false, error: authError || 'অনুমতি নেই' };
    }

    const validation = TeacherSchema.safeParse(formData);
    if (!validation.success) {
      const firstError = validation.error.issues[0]?.message || 'ভ্যালিডেশন এরর';
      return { success: false, error: firstError };
    }

    const { name, designation, subject, department, phone, email, photo_url, biography, display_order, is_published } = validation.data;

    const { data, error } = await supabase
      .from('teachers')
      .insert({
        school_id: profile.school_id,
        name,
        designation,
        subject: subject || null,
        department: department || 'সাধারণ',
        phone: phone || null,
        email: email || null,
        photo_url: photo_url || null,
        biography: biography || null,
        display_order: display_order ?? 0,
        is_published: is_published ?? true,
        created_by: user ? user.id : undefined,
      })
      .select()
      .single();

    if (error) {
      return { success: false, error: `শিক্ষক তথ্য যোগ করতে ব্যর্থ: ${error.message}` };
    }

    revalidatePath('/admin/teachers');
    revalidatePath('/teachers');
    revalidatePath('/');

    return { success: true, data };
  } catch (err: any) {
    return { success: false, error: `সার্ভার এরর: ${err.message}` };
  }
}

// 3. Update Teacher Action
export async function updateTeacherAction(
  id: string,
  formData: {
    name: string;
    designation: string;
    subject?: string;
    department?: string;
    phone?: string;
    email?: string;
    photo_url?: string | null;
    biography?: string;
    display_order?: number;
    is_published?: boolean;
  }
): Promise<TeacherActionState> {
  try {
    const { error: authError, profile, supabase } = await verifyAdminAuth();
    if (authError || !profile) {
      return { success: false, error: authError || 'অনুমতি নেই' };
    }

    const validation = TeacherSchema.safeParse(formData);
    if (!validation.success) {
      const firstError = validation.error.issues[0]?.message || 'ভ্যালিডেশন এরর';
      return { success: false, error: firstError };
    }

    const { name, designation, subject, department, phone, email, photo_url, biography, display_order, is_published } = validation.data;

    const { data, error } = await supabase
      .from('teachers')
      .update({
        name,
        designation,
        subject: subject || null,
        department: department || 'সাধারণ',
        phone: phone || null,
        email: email || null,
        photo_url: photo_url || null,
        biography: biography || null,
        display_order: display_order ?? 0,
        is_published: is_published ?? true,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .eq('school_id', profile.school_id)
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return { success: false, error: 'শিক্ষক তথ্য পাওয়া যায়নি বা এটি আপনার স্কুলের নয়।' };
      }
      return { success: false, error: `শিক্ষক তথ্য আপডেট করতে ব্যর্থ: ${error.message}` };
    }

    revalidatePath('/admin/teachers');
    revalidatePath('/teachers');
    revalidatePath('/');

    return { success: true, data };
  } catch (err: any) {
    return { success: false, error: `সার্ভার এরর: ${err.message}` };
  }
}

// 4. Delete Teacher Action
export async function deleteTeacherAction(id: string): Promise<TeacherActionState> {
  try {
    const { error: authError, profile, supabase } = await verifyAdminAuth();
    if (authError || !profile) {
      return { success: false, error: authError || 'অনুমতি নেই' };
    }

    // First fetch the record to check if it has a photo to clean up
    const { data: teacherToDel } = await supabase
      .from('teachers')
      .select('photo_url')
      .eq('id', id)
      .eq('school_id', profile.school_id)
      .maybeSingle();

    const { data, error } = await supabase
      .from('teachers')
      .delete()
      .eq('id', id)
      .eq('school_id', profile.school_id)
      .select();

    if (error) {
      return { success: false, error: `শিক্ষক তথ্য মুছতে ব্যর্থ: ${error.message}` };
    }

    if (!data || data.length === 0) {
      return { success: false, error: 'শিক্ষক তথ্য পাওয়া যায়নি বা এটি আপনার স্কুলের নয়।' };
    }

    // If teacher had a stored photo, remove it from teacher-images storage bucket
    if (teacherToDel?.photo_url) {
      try {
        const { extractStoragePath } = await import('../storage/cleanup');
        const storagePath = extractStoragePath(teacherToDel.photo_url, 'teacher-images');
        if (storagePath) {
          await supabase.storage.from('teacher-images').remove([storagePath]);
        }
      } catch (storageErr) {
        console.warn('Could not remove teacher photo from storage:', storageErr);
      }
    }

    revalidatePath('/admin/teachers');
    revalidatePath('/teachers');
    revalidatePath('/');

    return { success: true };
  } catch (err: any) {
    return { success: false, error: `সার্ভার এরর: ${err.message}` };
  }
}

// 5. Toggle Teacher Publish Action
export async function toggleTeacherPublishAction(id: string, currentStatus: boolean): Promise<TeacherActionState> {
  try {
    const { error: authError, profile, supabase } = await verifyAdminAuth();
    if (authError || !profile) {
      return { success: false, error: authError || 'অনুমতি নেই' };
    }

    const { data, error } = await supabase
      .from('teachers')
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
        return { success: false, error: 'শিক্ষক তথ্য পাওয়া যায়নি বা এটি আপনার স্কুলের নয়।' };
      }
      return { success: false, error: `পাবলিশ স্ট্যাটাস পরিবর্তন করতে ব্যর্থ: ${error.message}` };
    }

    revalidatePath('/admin/teachers');
    revalidatePath('/teachers');
    revalidatePath('/');

    return { success: true, data };
  } catch (err: any) {
    return { success: false, error: `সার্ভার এরর: ${err.message}` };
  }
}
