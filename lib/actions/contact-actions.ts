'use server';

import { createPublicClient } from '../db/supabase-public';
import { ContactMessageSchema } from '../validation/schemas';
import { checkRateLimit } from '../utils/rate-limiter';
import { headers } from 'next/headers';

export interface ContactActionState {
  success: boolean;
  message?: string;
  error?: string;
}

export async function submitContactMessage(formData: {
  name: string;
  phone: string;
  email?: string;
  subject: string;
  message: string;
}): Promise<ContactActionState> {
  try {
    // 0. Rate limiting check (Max 5 requests per 10 minutes per IP/phone)
    const headerList = await headers();
    const forwardedFor = headerList.get('x-forwarded-for');
    const realIp = headerList.get('x-real-ip');
    const clientIp = (forwardedFor ? forwardedFor.split(',')[0].trim() : realIp) || 'unknown-client';
    const rateLimitKey = `contact_${clientIp}_${formData.phone || ''}`;

    const limitCheck = checkRateLimit(rateLimitKey, 5, 10 * 60 * 1000);
    if (!limitCheck.isAllowed) {
      return {
        success: false,
        error: 'অতিরিক্ত অনুরোধ পাঠানো হয়েছে। অনুগ্রহ করে কিছুক্ষণ পর আবার চেষ্টা করুন।',
      };
    }

    // 1. Validation with Zod
    const validation = ContactMessageSchema.safeParse(formData);
    if (!validation.success) {
      const errorMsg = validation.error.errors[0]?.message || 'ভুল বা অসম্পূর্ণ তথ্য দেওয়া হয়েছে।';
      return { success: false, error: errorMsg };
    }

    const { name, phone, email, subject, message } = validation.data;
    const supabase = createPublicClient();

    // 2. Fetch school_id for snlhs
    const { data: school } = await supabase
      .from('schools')
      .select('id')
      .eq('slug', 'snlhs')
      .limit(1)
      .maybeSingle();

    const schoolId = school?.id || null;

    // 3. Attempt insert into contact_messages table
    const { error: dbError } = await supabase
      .from('contact_messages')
      .insert({
        school_id: schoolId,
        name,
        phone,
        email: email || null,
        subject,
        message,
        is_read: false,
        created_at: new Date().toISOString(),
      });

    if (dbError) {
      console.error('contact_messages insert error:', dbError.message);
      return {
        success: false,
        error: 'বার্তাটি সিস্টেমে সংরক্ষণ করতে সমস্যা হয়েছে। অনুগ্রহ করে সরাসরি ফোন নম্বরে যোগাযোগ করুন।',
      };
    }

    return {
      success: true,
      message: 'আপনার বার্তাটি সফলভাবে পাঠানো হয়েছে। বিদ্যালয় কর্তৃপক্ষ শীঘ্রই আপনার সাথে যোগাযোগ করবে।',
    };
  } catch (err: any) {
    console.error('Contact submit error:', err);
    return {
      success: false,
      error: 'বার্তা পাঠাতে সমস্যা হয়েছে। অনুগ্রহ করে সরাসরি ফোন নম্বরে যোগাযোগ করুন।',
    };
  }
}

// ─── ADMIN ACTIONS ──────────────────────────────────────────

import { createClient } from '../db/supabase-server';
import { revalidatePath } from 'next/cache';

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

export async function getAdminContactMessages(): Promise<{ messages: any[]; error?: string }> {
  try {
    const { error: authError, profile, supabase } = await verifyAdminAuth();
    if (authError || !profile) {
      return { messages: [], error: authError || 'অনুমতি নেই' };
    }

    const { data, error } = await supabase
      .from('contact_messages')
      .select('*')
      .eq('school_id', profile.school_id)
      .order('created_at', { ascending: false });

    if (error) {
      // If table has not yet received messages or has schema note, handle gracefully
      return { messages: [], error: `বার্তা লোড করতে ব্যর্থ: ${error.message}` };
    }

    return { messages: data || [] };
  } catch (err: any) {
    return { messages: [], error: `সার্ভার এরর: ${err.message}` };
  }
}

export async function markContactMessageReadAction(id: string, isRead: boolean): Promise<{ success: boolean; error?: string }> {
  try {
    const { error: authError, profile, supabase } = await verifyAdminAuth();
    if (authError || !profile) {
      return { success: false, error: authError || 'অনুমতি নেই' };
    }

    const { error } = await supabase
      .from('contact_messages')
      .update({ is_read: isRead })
      .eq('id', id)
      .eq('school_id', profile.school_id);

    if (error) {
      return { success: false, error: `স্ট্যাটাস পরিবর্তন ব্যর্থ: ${error.message}` };
    }

    revalidatePath('/admin/messages');
    return { success: true };
  } catch (err: any) {
    return { success: false, error: `সার্ভার এরর: ${err.message}` };
  }
}

export async function deleteContactMessageAction(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    const { error: authError, profile, supabase } = await verifyAdminAuth();
    if (authError || !profile) {
      return { success: false, error: authError || 'অনুমতি নেই' };
    }

    const { error } = await supabase
      .from('contact_messages')
      .delete()
      .eq('id', id)
      .eq('school_id', profile.school_id);

    if (error) {
      return { success: false, error: `বার্তা মুছতে ব্যর্থ: ${error.message}` };
    }

    revalidatePath('/admin/messages');
    return { success: true };
  } catch (err: any) {
    return { success: false, error: `সার্ভার এরর: ${err.message}` };
  }
}

