import { createClient } from '@supabase/supabase-js';
import { createAdminClient } from '../lib/db/supabase-admin';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !anonKey) {
  console.error('Missing Supabase URL or Anon Key');
  process.exit(1);
}

const adminClient = createAdminClient();

// Helper to create an authenticated anon client
async function getAuthClient(email: string, pass: string) {
  const client = createClient(supabaseUrl, anonKey, {
    auth: { persistSession: false, autoRefreshToken: false }
  });
  const { data, error } = await client.auth.signInWithPassword({ email, password: pass });
  if (error) throw new Error(`Auth failed for ${email}: ${error.message}`);
  return client;
}

// Helper to create unauthenticated anon client
function getAnonClient() {
  return createClient(supabaseUrl, anonKey, {
    auth: { persistSession: false, autoRefreshToken: false }
  });
}

async function runSecurityTests() {
  console.log('=== STARTING RLS TENANT ISOLATION SECURITY TESTS ===\n');

  const testResults: Array<{
    id: number;
    testName: string;
    passed: boolean;
    details: string;
  }> = [];

  let schoolBId: string | null = null;
  let userBAdminId: string | null = null;
  let userAViewerId: string | null = null;
  let tempAlbumAId: string | null = null;
  let tempUnpublishedNoticeAId: string | null = null;

  const emailBAdmin = `test_b_admin_${Date.now()}@snlhs.edu.bd`;
  const emailAViewer = `test_a_viewer_${Date.now()}@snlhs.edu.bd`;
  const testPassword = 'TestPassword123!';

  const cleanupList: string[] = [];

  try {
    // ------------------------------------------------------------------------
    // SETUP
    // ------------------------------------------------------------------------
    console.log('[SETUP] Fetching School A (snlhs)...');
    const { data: schoolA } = await adminClient
      .from('schools')
      .select('id, slug')
      .eq('slug', 'snlhs')
      .single();

    if (!schoolA) throw new Error('School A (snlhs) not found');
    const schoolAId = schoolA.id;

    console.log('[SETUP] Creating dummy School B...');
    const { data: schoolB, error: sBErr } = await adminClient
      .from('schools')
      .insert({
        name: 'School B (Dummy Security Test)',
        slug: `school-b-${Date.now()}`,
        status: 'active',
        settings: { motto: 'School B Motto' }
      })
      .select()
      .single();

    if (sBErr || !schoolB) throw new Error(`Failed to create School B: ${sBErr?.message}`);
    schoolBId = schoolB.id;
    cleanupList.push(`Temporary School B (ID: ${schoolBId})`);

    console.log('[SETUP] Creating B-admin auth user...');
    const { data: authBAdmin, error: aBErr } = await adminClient.auth.admin.createUser({
      email: emailBAdmin,
      password: testPassword,
      email_confirm: true
    });
    if (aBErr || !authBAdmin.user) throw new Error(`Failed to create B-admin: ${aBErr?.message}`);
    userBAdminId = authBAdmin.user.id;
    cleanupList.push(`Temporary User B-admin (Email: ${emailBAdmin}, ID: ${userBAdminId})`);

    await adminClient
      .from('profiles')
      .update({ school_id: schoolBId, role: 'admin', name: 'B Admin User' })
      .eq('id', userBAdminId);

    console.log('[SETUP] Creating A-viewer auth user...');
    const { data: authAViewer, error: aAErr } = await adminClient.auth.admin.createUser({
      email: emailAViewer,
      password: testPassword,
      email_confirm: true
    });
    if (aAErr || !authAViewer.user) throw new Error(`Failed to create A-viewer: ${aAErr?.message}`);
    userAViewerId = authAViewer.user.id;
    cleanupList.push(`Temporary User A-viewer (Email: ${emailAViewer}, ID: ${userAViewerId})`);

    await adminClient
      .from('profiles')
      .update({ school_id: schoolAId, role: 'viewer', name: 'A Viewer User' })
      .eq('id', userAViewerId);

    console.log('[SETUP] Creating temporary Album in School A...');
    const { data: tempAlbum, error: albumErr } = await adminClient
      .from('gallery_albums')
      .insert({
        school_id: schoolAId,
        title: 'Temp Security Test Album School A',
        description: 'Temporary album for test #3',
        is_published: true
      })
      .select()
      .single();
    if (albumErr || !tempAlbum) throw new Error(`Failed to create temp album: ${albumErr?.message}`);
    tempAlbumAId = tempAlbum.id;
    cleanupList.push(`Temporary Gallery Album School A (ID: ${tempAlbumAId})`);

    console.log('[SETUP] Creating temporary Unpublished Notice in School A...');
    const { data: tempNotice, error: noticeErr } = await adminClient
      .from('notices')
      .insert({
        school_id: schoolAId,
        title: 'Secret Draft Notice School A',
        description: 'Unpublished draft notice content',
        category: 'সাধারণ',
        pub_date: '2026-09-28',
        attachment_url: 'school_a/notices/secret_file.pdf',
        is_published: false
      })
      .select()
      .single();
    if (noticeErr || !tempNotice) throw new Error(`Failed to create temp notice: ${noticeErr?.message}`);
    tempUnpublishedNoticeAId = tempNotice.id;
    cleanupList.push(`Temporary Unpublished Notice School A (ID: ${tempUnpublishedNoticeAId})`);

    console.log('[SETUP COMPLETE] All test fixtures initialized.\n');

    // Initialize Auth Clients
    const clientBAdmin = await getAuthClient(emailBAdmin, testPassword);
    const clientAViewer = await getAuthClient(emailAViewer, testPassword);
    const clientAnon = getAnonClient();

    // ------------------------------------------------------------------------
    // TEST 1: B-admin reading School A's unpublished notices & writing School A's notices/teachers
    // ------------------------------------------------------------------------
    console.log('--- Running Test 1: B-admin accessing School A draft/writing data ---');
    // Try reading School A's unpublished notice
    const { data: bReadUnpublishedNotice } = await clientBAdmin
      .from('notices')
      .select('*')
      .eq('id', tempUnpublishedNoticeAId);

    // Try writing Notice to School A
    const { data: bWriteNotice, error: bWriteNoticeErr } = await clientBAdmin
      .from('notices')
      .insert({
        school_id: schoolAId,
        title: 'Hacked Notice by B Admin',
        description: 'Unauthorized',
        pub_date: '2026-09-28'
      })
      .select();

    // Try writing Teacher to School A
    const { data: bWriteTeacher, error: bWriteTeacherErr } = await clientBAdmin
      .from('teachers')
      .insert({
        school_id: schoolAId,
        name: 'Hacked Teacher by B Admin',
        designation: 'Test'
      })
      .select();

    const readUnpublishedBlocked = bReadUnpublishedNotice?.length === 0;
    const writeNoticeBlocked = bWriteNoticeErr !== null || bWriteNotice === null || bWriteNotice?.length === 0;
    const writeTeacherBlocked = bWriteTeacherErr !== null || bWriteTeacher === null || bWriteTeacher?.length === 0;

    const test1Passed = readUnpublishedBlocked && writeNoticeBlocked && writeTeacherBlocked;
    testResults.push({
      id: 1,
      testName: "B-admin দিয়ে A-র notices/teachers পড়া ও লেখা ব্যর্থ হয়",
      passed: test1Passed,
      details: test1Passed
        ? `Pass: B-admin standard read for A draft notice returned 0 rows; INSERT into A blocked`
        : `Fail: ReadUnpublishedBlocked=${readUnpublishedBlocked}, WriteNoticeBlocked=${writeNoticeBlocked}, WriteTeacherBlocked=${writeTeacherBlocked}`
    });

    // ------------------------------------------------------------------------
    // TEST 2: A-viewer write (insert/update/delete)
    // ------------------------------------------------------------------------
    console.log('--- Running Test 2: A-viewer write actions ---');
    const { data: vInsert, error: vInsertErr } = await clientAViewer
      .from('notices')
      .insert({ school_id: schoolAId, title: 'Viewer Notice Test', pub_date: '2026-09-28' })
      .select();

    const { data: vUpdate, error: vUpdateErr } = await clientAViewer
      .from('notices')
      .update({ title: 'Viewer Notice Modified' })
      .eq('school_id', schoolAId)
      .select();

    const { data: vDelete, error: vDeleteErr } = await clientAViewer
      .from('notices')
      .delete()
      .eq('school_id', schoolAId)
      .select();

    const viewerInsertBlocked = vInsertErr !== null || vInsert === null || vInsert?.length === 0;
    const viewerUpdateBlocked = vUpdateErr !== null || vUpdate === null || vUpdate?.length === 0;
    const viewerDeleteBlocked = vDeleteErr !== null || vDelete === null || vDelete?.length === 0;

    const test2Passed = viewerInsertBlocked && viewerUpdateBlocked && viewerDeleteBlocked;
    testResults.push({
      id: 2,
      testName: "A-viewer দিয়ে insert/update/delete ব্যর্থ হয়",
      passed: test2Passed,
      details: test2Passed
        ? `Pass: Insert, Update, Delete all blocked for viewer role`
        : `Fail: InsertBlocked=${viewerInsertBlocked}, UpdateBlocked=${viewerUpdateBlocked}, DeleteBlocked=${viewerDeleteBlocked}`
    });

    // ------------------------------------------------------------------------
    // TEST 3: B-admin inserting image into School A's album
    // ------------------------------------------------------------------------
    console.log('--- Running Test 3: B-admin inserting into School A album ---');
    const { data: bAlbumImg, error: bAlbumImgErr } = await clientBAdmin
      .from('gallery_images')
      .insert({
        school_id: schoolBId,
        album_id: tempAlbumAId,
        image_url: 'school_b/gallery/fake.jpg',
        caption: 'Unauthorized Album Image'
      })
      .select();

    const test3Passed = bAlbumImgErr !== null || bAlbumImg === null || bAlbumImg?.length === 0;
    testResults.push({
      id: 3,
      testName: "B-admin দিয়ে A-র album-এ ছবি insert ব্যর্থ হয়",
      passed: test3Passed,
      details: test3Passed
        ? `Pass: Cross-tenant album image insert blocked (Err: ${bAlbumImgErr?.message || 'RLS check failed'})`
        : `Fail: B-admin inserted image into School A album (Inserted: ${bAlbumImg?.length})`
    });

    // ------------------------------------------------------------------------
    // TEST 4: B-admin modifying their own profiles.school_id
    // ------------------------------------------------------------------------
    console.log('--- Running Test 4: B-admin modifying profiles.school_id ---');
    const { data: bProfileUpdate, error: bProfileErr } = await clientBAdmin
      .from('profiles')
      .update({ school_id: schoolAId })
      .eq('id', userBAdminId)
      .select();

    const { data: checkBProfile } = await adminClient
      .from('profiles')
      .select('school_id')
      .eq('id', userBAdminId)
      .single();

    const test4Passed = (bProfileErr !== null || bProfileUpdate === null || bProfileUpdate?.length === 0) || (checkBProfile?.school_id === schoolBId);
    testResults.push({
      id: 4,
      testName: "B-admin নিজের profiles.school_id বদলাতে পারে না",
      passed: test4Passed,
      details: test4Passed
        ? `Pass: Profile school_id mutation blocked (DB school_id remains ${checkBProfile?.school_id})`
        : `Fail: B-admin successfully changed school_id to ${checkBProfile?.school_id}`
    });

    // ------------------------------------------------------------------------
    // TEST 5: Logged-out (anon) accessing unpublished notice & file
    // ------------------------------------------------------------------------
    console.log('--- Running Test 5: Logged-out accessing unpublished content ---');
    const { data: anonNoticeSelect } = await clientAnon
      .from('notices')
      .select('*')
      .eq('id', tempUnpublishedNoticeAId);

    const { data: anonStorageData, error: anonStorageErr } = await clientAnon.storage
      .from('notice-files')
      .download('school_a/notices/secret_file.pdf');

    const noticeSelectBlocked = anonNoticeSelect?.length === 0;
    const storageFileBlocked = anonStorageErr !== null || anonStorageData === null;

    const test5Passed = noticeSelectBlocked && storageFileBlocked;
    testResults.push({
      id: 5,
      testName: "লগআউট অবস্থায় unpublished notice ও তার ফাইল পাওয়া যায় না",
      passed: test5Passed,
      details: test5Passed
        ? `Pass: Unpublished notice hidden from SELECT (0 rows); Storage download blocked`
        : `Fail: Notice select count=${anonNoticeSelect?.length}, Storage file blocked=${storageFileBlocked}`
    });

    // ------------------------------------------------------------------------
    // TEST 6: Logged-out (anon) accessing published content
    // ------------------------------------------------------------------------
    console.log('--- Running Test 6: Logged-out accessing published content ---');
    const { data: anonPubNotices } = await clientAnon
      .from('notices')
      .select('id, title')
      .eq('school_id', schoolAId)
      .eq('is_published', true);

    const { data: anonPubTeachers } = await clientAnon
      .from('teachers')
      .select('id, name')
      .eq('school_id', schoolAId)
      .eq('is_published', true);

    const test6Passed = (anonPubNotices !== null && anonPubNotices.length > 0) &&
                        (anonPubTeachers !== null && anonPubTeachers.length > 0);

    testResults.push({
      id: 6,
      testName: "লগআউট অবস্থায় published কনটент পাওয়া যায়",
      passed: test6Passed,
      details: test6Passed
        ? `Pass: Public user can read published notices (${anonPubNotices?.length}) and teachers (${anonPubTeachers?.length})`
        : `Fail: Published content not readable by public (Notices: ${anonPubNotices?.length}, Teachers: ${anonPubTeachers?.length})`
    });

    // ------------------------------------------------------------------------
    // TEST 7: B-admin updating School A row (including settings)
    // ------------------------------------------------------------------------
    console.log('--- Running Test 7: B-admin updating School A row & settings ---');
    const { data: bSchoolUpdate, error: bSchoolErr } = await clientBAdmin
      .from('schools')
      .update({
        name: 'Hacked School A',
        settings: { motto: 'Hacked Motto' }
      })
      .eq('id', schoolAId)
      .select();

    const test7Passed = bSchoolErr !== null || bSchoolUpdate === null || bSchoolUpdate?.length === 0;
    testResults.push({
      id: 7,
      testName: "B-admin দিয়ে A-র schools row (settings সহ) update করা ব্যর্থ হয়",
      passed: test7Passed,
      details: test7Passed
        ? `Pass: Cross-tenant school row update blocked (Err: ${bSchoolErr?.message || '0 rows affected'})`
        : `Fail: B-admin updated School A row (Updated rows: ${bSchoolUpdate?.length})`
    });

  } catch (err: any) {
    console.error('Test script runtime error:', err.message);
  } finally {
    // ------------------------------------------------------------------------
    // CLEANUP TEMPORARY DATA
    // ------------------------------------------------------------------------
    console.log('\n[CLEANUP] Cleaning up temporary test data...');

    if (tempAlbumAId) {
      await adminClient.from('gallery_albums').delete().eq('id', tempAlbumAId);
    }

    if (tempUnpublishedNoticeAId) {
      await adminClient.from('notices').delete().eq('id', tempUnpublishedNoticeAId);
    }

    if (userBAdminId) {
      await adminClient.from('profiles').delete().eq('id', userBAdminId);
      await adminClient.auth.admin.deleteUser(userBAdminId);
    }

    if (userAViewerId) {
      await adminClient.from('profiles').delete().eq('id', userAViewerId);
      await adminClient.auth.admin.deleteUser(userAViewerId);
    }

    if (schoolBId) {
      await adminClient.from('schools').delete().eq('id', schoolBId);
    }

    console.log('Cleanup completed.\n');

    console.log('JSON_TEST_RESULTS_START');
    console.log(JSON.stringify({ testResults, cleanupList }, null, 2));
    console.log('JSON_TEST_RESULTS_END');
  }
}

runSecurityTests().catch(console.error);
