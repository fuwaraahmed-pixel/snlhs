import { createAdminClient } from '../lib/db/supabase-admin';

async function createAdminUser() {
  const supabase = createAdminClient();

  const email = process.env.INITIAL_ADMIN_EMAIL || 'admin@school.edu.bd';
  const password = process.env.INITIAL_ADMIN_PASSWORD || 'SchoolAdmin#2026';
  const fullName = 'নূর মোহাম্মদ সরকার (প্রধান শিক্ষক)';

  console.log(`Creating Admin User in Supabase Auth: ${email}`);

  // 1. Create auth user via Supabase Admin Auth API
  const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: fullName }
  });

  if (authError) {
    if (authError.message.includes('already registered')) {
      console.log(`User ${email} already exists.`);
    } else {
      console.error('Error creating auth user:', authError);
      return;
    }
  }

  const userId = authUser?.user?.id;
  if (!userId) {
    console.log('Fetching existing user ID...');
    const { data: users } = await supabase.auth.admin.listUsers();
    const existing = users?.users.find(u => u.email === email);
    if (!existing) {
      throw new Error('User not found.');
    }
  }

  // 2. Fetch default school
  const { data: school } = await supabase
    .from('schools')
    .select('id')
    .eq('slug', process.env.DEFAULT_SCHOOL_SLUG || 'snlhs')
    .single();

  if (!school) {
    console.log('Default school not found. Please run JSON migration script first.');
    return;
  }

  // 3. Insert or update profile in public.profiles table with role = 'admin'
  const finalUserId = userId || (await supabase.auth.admin.listUsers()).data.users.find(u => u.email === email)?.id;

  if (finalUserId) {
    await supabase.from('profiles').upsert({
      id: finalUserId,
      school_id: school.id,
      role: 'admin',
      name: fullName,
      email
    });
    console.log(`Successfully assigned Admin Profile for ${email} with School ID ${school.id}!`);
    console.log('----------------------------------------------------');
    console.log(`LOGIN CREDENTIALS:`);
    console.log(`Email:    ${email}`);
    console.log(`Password: ${password}`);
    console.log('----------------------------------------------------');
  }
}

createAdminUser().catch(console.error);
