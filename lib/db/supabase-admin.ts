import { createClient } from '@supabase/supabase-js';

// WARNING: SUPABASE_SERVICE_ROLE_KEY must ONLY be used on the server side
export function createAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!serviceRoleKey || serviceRoleKey === 'placeholder-service-role-key') {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY is required for admin server actions.');
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}
