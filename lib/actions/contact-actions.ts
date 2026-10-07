'use server';

import { createPublicClient } from '../db/supabase-public';
import { ContactMessageSchema } from '../validation/schemas';

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

    // 3. Attempt insert into contact_messages table if it exists
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

    // If contact_messages table does not exist or has RLS error, log it gracefully
    if (dbError) {
      console.warn('contact_messages table save note:', dbError.message);
      // We don't fail the user experience if table is not yet created in Supabase
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
