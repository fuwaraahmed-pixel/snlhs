import { createAdminClient } from '../lib/db/supabase-admin';

async function createAdminUser() {
  const supabase = createAdminClient();

  const email = process.env.INITIAL_ADMIN_EMAIL;
  const password = process.env.INITIAL_ADMIN_PASSWORD;
  const fullName = 'নূর মোহাম্মদ সরকার (প্রধান শিক্ষক)';

  if (!email || !password) {
    throw new Error('INITIAL_ADMIN_EMAIL এবং INITIAL_ADMIN_PASSWORD .env.local-এ কনফিগার করা নেই!');
  }

  console.log(`Creating/Updating Admin User in Supabase Auth: ${email}`);

  // 1. Create or update auth user via Supabase Admin Auth API
  let userId: string | undefined;

  const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: fullName }
  });

  if (authError) {
    if (authError.message.includes('already registered')) {
      console.log(`User ${email} already exists in Auth. Fetching user ID & updating password...`);
      const { data: users } = await supabase.auth.admin.listUsers();
      const existing = users?.users.find(u => u.email === email);
      userId = existing?.id;

      if (userId) {
        // Update password for existing user if already present
        await supabase.auth.admin.updateUserById(userId, { password, email_confirm: true });
      }
    } else {
      console.error('Error creating auth user:', authError);
      return;
    }
  } else {
    userId = authUser?.user?.id;
  }

  // 2. Fetch existing default school (snlhs)
  const { data: school, error: schoolErr } = await supabase
    .from('schools')
    .select('id')
    .eq('slug', process.env.DEFAULT_SCHOOL_SLUG || 'snlhs')
    .single();

  if (schoolErr || !school) {
    throw new Error('Default school (snlhs) not found in DB.');
  }

  // 3. Upsert admin profile
  if (userId) {
    await supabase.from('profiles').upsert({
      id: userId,
      school_id: school.id,
      role: 'admin',
      name: fullName,
      email
    });
    console.log(`Successfully assigned Admin Profile for ${email} with School ID ${school.id}!`);

    // 4. Option B: Delete old admin user (admin@school.edu.bd) after successful creation
    console.log('Cleaning up old compromised admin user (admin@school.edu.bd)...');
    const { data: allUsers } = await supabase.auth.admin.listUsers();
    const oldUser = allUsers?.users.find(u => u.email === 'admin@school.edu.bd');

    if (oldUser) {
      const { error: deleteErr } = await supabase.auth.admin.deleteUser(oldUser.id);
      if (deleteErr) {
        console.error(`Failed to delete old user: ${deleteErr.message}`);
      } else {
        console.log('Old user (admin@school.edu.bd) successfully deleted from Supabase Auth & Profiles.');
      }
    } else {
      console.log('Old user (admin@school.edu.bd) not found or already deleted.');
    }
  }
}

createAdminUser().catch(console.error);
