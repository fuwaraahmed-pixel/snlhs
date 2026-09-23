import fs from 'fs';
import path from 'path';
import { createAdminClient } from '../lib/db/supabase-admin';

async function migrateData() {
  const supabase = createAdminClient();

  // 1. Get or create default school
  const defaultSlug = process.env.DEFAULT_SCHOOL_SLUG || 'snlhs';
  
  let { data: school } = await supabase
    .from('schools')
    .select('*')
    .eq('slug', defaultSlug)
    .single();

  if (!school) {
    console.log(`School ${defaultSlug} not found in DB. Creating...`);
    const schoolRes = await supabase.from('schools').insert({
      name: 'সাহেরা নায়েব ল্যাবরেটরি হাই স্কুল',
      slug: defaultSlug,
      primary_color: '#1b365d',
      secondary_color: '#c59b27',
      address: 'ঢাকা, বাংলাদেশ',
      phone: '01531927956',
      email: 'snlhs07@gmail.com',
      status: 'active'
    }).select().single();

    school = schoolRes.data;
  }

  if (!school) {
    throw new Error('Failed to create/fetch default school.');
  }

  const schoolId = school.id;
  console.log(`Migrating data for School ID: ${schoolId} (${school.name})`);

  // 2. Migrate Teachers
  const teachersPath = path.join(process.cwd(), 'data', 'teachers.json');
  if (fs.existsSync(teachersPath)) {
    const rawTeachers = JSON.parse(fs.readFileSync(teachersPath, 'utf8'));
    for (const [index, t] of rawTeachers.entries()) {
      await supabase.from('teachers').insert({
        school_id: schoolId,
        name: t.name,
        designation: t.designation || 'শিক্ষক',
        department: t.department || 'সাধারণ',
        subject: t.qualification || '',
        photo_url: t.image || null,
        display_order: index + 1,
        is_published: true
      });
    }
    console.log(`Migrated ${rawTeachers.length} teachers.`);
  }

  // 3. Migrate Notices
  const noticesPath = path.join(process.cwd(), 'data', 'notices.json');
  if (fs.existsSync(noticesPath)) {
    const rawNotices = JSON.parse(fs.readFileSync(noticesPath, 'utf8'));
    for (const n of rawNotices) {
      await supabase.from('notices').insert({
        school_id: schoolId,
        title: n.title,
        description: n.description || '',
        category: n.category || 'সাধারণ',
        pub_date: n.date || new Date().toISOString().split('T')[0],
        attachment_url: n.downloadUrl || n.link || null,
        is_published: true
      });
    }
    console.log(`Migrated ${rawNotices.length} notices.`);
  }

  console.log('Migration completed successfully!');
}

migrateData().catch(err => {
  console.error('Migration error:', err);
});
