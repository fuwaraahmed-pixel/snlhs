'use server';

import { createClient } from '../db/supabase-server';
import { EventSchema } from '../validation/schemas';
import { revalidatePath } from 'next/cache';

export interface EventActionState {
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

// 1. Get Admin Events
export async function getAdminEvents(): Promise<{ events: any[]; schoolId?: string; error?: string }> {
  try {
    const { error: authError, profile, supabase } = await verifyAdminAuth();
    if (authError || !profile) {
      return { events: [], error: authError || 'অনুমতি নেই' };
    }

    const { data, error } = await supabase
      .from('events')
      .select('*')
      .eq('school_id', profile.school_id)
      .order('event_date', { ascending: false });

    if (error) {
      return { events: [], error: `ইভেন্ট তালিকা লোড করতে ব্যর্থ: ${error.message}` };
    }

    return { events: data || [], schoolId: profile.school_id };
  } catch (err: any) {
    return { events: [], error: `সার্ভার এরর: ${err.message}` };
  }
}

// 2. Create Event Action
export async function createEventAction(formData: {
  title: string;
  description?: string;
  event_date: string;
  start_time?: string;
  end_time?: string;
  location?: string;
  featured_image?: string | null;
  is_featured?: boolean;
  is_published?: boolean;
}): Promise<EventActionState> {
  try {
    const { error: authError, profile, supabase } = await verifyAdminAuth();
    if (authError || !profile) {
      return { success: false, error: authError || 'অনুমতি নেই' };
    }

    const validation = EventSchema.safeParse(formData);
    if (!validation.success) {
      const firstError = validation.error.issues[0]?.message || 'ভ্যালিডেশন এরর';
      return { success: false, error: firstError };
    }

    const { title, description, event_date, start_time, end_time, location, featured_image, is_featured, is_published } = validation.data;

    const { data, error } = await supabase
      .from('events')
      .insert({
        school_id: profile.school_id,
        title,
        description: description || null,
        event_date,
        start_time: start_time || null,
        end_time: end_time || null,
        location: location || null,
        featured_image: featured_image || null,
        is_featured: is_featured ?? false,
        is_published: is_published ?? true,
      })
      .select()
      .single();

    if (error) {
      return { success: false, error: `ইভেন্ট যোগ করতে ব্যর্থ: ${error.message}` };
    }

    revalidatePath('/admin/events');
    revalidatePath('/events');

    return { success: true, data };
  } catch (err: any) {
    return { success: false, error: `সার্ভার এরর: ${err.message}` };
  }
}

// 3. Update Event Action
export async function updateEventAction(
  id: string,
  formData: {
    title: string;
    description?: string;
    event_date: string;
    start_time?: string;
    end_time?: string;
    location?: string;
    featured_image?: string | null;
    is_featured?: boolean;
    is_published?: boolean;
  }
): Promise<EventActionState> {
  try {
    const { error: authError, profile, supabase } = await verifyAdminAuth();
    if (authError || !profile) {
      return { success: false, error: authError || 'অনুমতি নেই' };
    }

    const validation = EventSchema.safeParse(formData);
    if (!validation.success) {
      const firstError = validation.error.issues[0]?.message || 'ভ্যালিডেশন এরর';
      return { success: false, error: firstError };
    }

    const { title, description, event_date, start_time, end_time, location, featured_image, is_featured, is_published } = validation.data;

    const { data, error } = await supabase
      .from('events')
      .update({
        title,
        description: description || null,
        event_date,
        start_time: start_time || null,
        end_time: end_time || null,
        location: location || null,
        featured_image: featured_image || null,
        is_featured: is_featured ?? false,
        is_published: is_published ?? true,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .eq('school_id', profile.school_id)
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return { success: false, error: 'ইভেন্টটি পাওয়া যায়নি বা এটি আপনার স্কুলের নয়।' };
      }
      return { success: false, error: `ইভেন্ট আপডেট করতে ব্যর্থ: ${error.message}` };
    }

    revalidatePath('/admin/events');
    revalidatePath('/events');

    return { success: true, data };
  } catch (err: any) {
    return { success: false, error: `সার্ভার এরর: ${err.message}` };
  }
}

// 4. Delete Event Action
export async function deleteEventAction(id: string): Promise<EventActionState> {
  try {
    const { error: authError, profile, supabase } = await verifyAdminAuth();
    if (authError || !profile) {
      return { success: false, error: authError || 'অনুমতি নেই' };
    }

    const { data, error } = await supabase
      .from('events')
      .delete()
      .eq('id', id)
      .eq('school_id', profile.school_id)
      .select();

    if (error) {
      return { success: false, error: `ইভেন্ট মুছতে ব্যর্থ: ${error.message}` };
    }

    if (!data || data.length === 0) {
      return { success: false, error: 'ইভেন্টটি পাওয়া যায়নি বা এটি আপনার স্কুলের নয়।' };
    }

    revalidatePath('/admin/events');
    revalidatePath('/events');

    return { success: true };
  } catch (err: any) {
    return { success: false, error: `সার্ভার এরর: ${err.message}` };
  }
}

// 5. Toggle Event Publish Action
export async function toggleEventPublishAction(id: string, currentStatus: boolean): Promise<EventActionState> {
  try {
    const { error: authError, profile, supabase } = await verifyAdminAuth();
    if (authError || !profile) {
      return { success: false, error: authError || 'অনুমতি নেই' };
    }

    const { data, error } = await supabase
      .from('events')
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
        return { success: false, error: 'ইভেন্টটি পাওয়া যায়নি বা এটি আপনার স্কুলের নয়।' };
      }
      return { success: false, error: `পাবলিশ স্ট্যাটাস পরিবর্তন করতে ব্যর্থ: ${error.message}` };
    }

    revalidatePath('/admin/events');
    revalidatePath('/events');

    return { success: true, data };
  } catch (err: any) {
    return { success: false, error: `সার্ভার এরর: ${err.message}` };
  }
}
