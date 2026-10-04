'use server';

import { createClient } from '../db/supabase-server';
import { SchoolSettingsSchema } from '../validation/schemas';
import { revalidatePath } from 'next/cache';

export interface SettingsActionState {
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

// 1. Get Admin School Settings
export async function getAdminSchoolSettings(): Promise<{ school: any; error?: string }> {
  try {
    const { error: authError, profile, supabase } = await verifyAdminAuth();
    if (authError || !profile) {
      return { school: null, error: authError || 'অনুমতি নেই' };
    }

    const { data, error } = await supabase
      .from('schools')
      .select('*')
      .eq('id', profile.school_id)
      .single();

    if (error) {
      return { school: null, error: `স্কুলের তথ্য লোড করতে ব্যর্থ: ${error.message}` };
    }

    return { school: data };
  } catch (err: any) {
    return { school: null, error: `সার্ভার এরর: ${err.message}` };
  }
}

// 2. Update School Settings Action
export async function updateSchoolSettingsAction(formData: {
  name: string;
  primary_color?: string;
  secondary_color?: string;
  address?: string;
  phone?: string;
  email?: string;
  logo_url?: string | null;
  favicon_url?: string | null;
  settings?: {
    eiin?: string;
    established?: string;
    board?: string;
    motto?: string;
    principal_message?: string;
    principal_name?: string;
    stats?: any[];
  };
}): Promise<SettingsActionState> {
  try {
    const { error: authError, profile, supabase } = await verifyAdminAuth();
    if (authError || !profile) {
      return { success: false, error: authError || 'অনুমতি নেই' };
    }

    const validation = SchoolSettingsSchema.safeParse(formData);
    if (!validation.success) {
      const firstError = validation.error.issues[0]?.message || 'ভ্যালিডেশন এরর';
      return { success: false, error: firstError };
    }

    const { name, primary_color, secondary_color, address, phone, email, logo_url, favicon_url, settings } = validation.data;

    // Fetch existing settings JSONB to merge intelligently
    const { data: existingSchool } = await supabase
      .from('schools')
      .select('settings')
      .eq('id', profile.school_id)
      .single();

    const mergedSettings = {
      ...(existingSchool?.settings || {}),
      ...(settings || {}),
    };

    const { data, error } = await supabase
      .from('schools')
      .update({
        name,
        primary_color: primary_color || '#1b365d',
        secondary_color: secondary_color || '#c59b27',
        address: address || null,
        phone: phone || null,
        email: email || null,
        logo_url: logo_url || null,
        favicon_url: favicon_url || null,
        settings: mergedSettings,
        updated_at: new Date().toISOString(),
      })
      .eq('id', profile.school_id)
      .select()
      .single();

    if (error) {
      return { success: false, error: `স্কুলের তথ্য আপডেট করতে ব্যর্থ: ${error.message}` };
    }

    // Revalidate all public and admin pages
    revalidatePath('/admin/settings');
    revalidatePath('/');
    revalidatePath('/about');
    revalidatePath('/contact');
    revalidatePath('/academics');
    revalidatePath('/admission');
    revalidatePath('/notices');
    revalidatePath('/teachers');
    revalidatePath('/events');

    return { success: true, data };
  } catch (err: any) {
    return { success: false, error: `সার্ভার এরর: ${err.message}` };
  }
}
