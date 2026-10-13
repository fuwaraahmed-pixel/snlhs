# সার্ভার অ্যাকশন সুরক্ষা ও অডিট মেট্রিক্স (Server Actions Matrix)

`lib/actions/*` ডিরেক্টরির প্রতিটি ফাইল ও সার্ভার অ্যাকশন ফাংশনের সম্পূর্ণ অডিট ম্যাট্রিক্স নিচে উপস্থাপন করা হলো। প্রতিটি ফাংশনের প্রমাণ (file:line) সহ নিরাপত্তা ও টেন্যান্ট আইসোলেশন পরীক্ষা করা হয়েছে।

---

## ১. সারসংক্ষেপ সারণী (Summary Table)

| ফাইল ও ফাংশন | Admin Session Check | Role Check | School ID Scoping | Input Validation | Uses Service Role | Verdict |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **`contact-actions.ts`** | | | | | | |
| `submitContactMessage` | ❌ No (Public) | ❌ No (Public) | ⚠️ Partial (`schools.slug = 'snlhs'`) | ✅ Yes (`ContactMessageSchema`) | ❌ No (Anon key) | **PASS (Intended Public)** |
| `getAdminContactMessages` | ✅ Yes (`verifyAdminAuth`) | ✅ Yes (`role === 'admin'`) | ✅ Yes (`eq('school_id', profile.school_id)`) | ➖ N/A (No input) | ❌ No | **PASS** |
| `markContactMessageReadAction` | ✅ Yes (`verifyAdminAuth`) | ✅ Yes (`role === 'admin'`) | ✅ Yes (`eq('school_id', profile.school_id)`) | ⚠️ Partial (Primitives only) | ❌ No | **PASS** |
| `deleteContactMessageAction` | ✅ Yes (`verifyAdminAuth`) | ✅ Yes (`role === 'admin'`) | ✅ Yes (`eq('school_id', profile.school_id)`) | ⚠️ Partial (Primitives only) | ❌ No | **PASS** |
| **`dashboard-actions.ts`** | | | | | | |
| `getAdminDashboardStats` | ✅ Yes (`auth.getUser()`) | ✅ Yes (`role === 'admin'`) | ✅ Yes (`eq('school_id', schoolId)`) | ➖ N/A | ❌ No | **PASS** |
| **`events-actions.ts`** | | | | | | |
| `getAdminEvents` | ✅ Yes (`verifyAdminAuth`) | ✅ Yes (`role === 'admin'`) | ✅ Yes (`eq('school_id', profile.school_id)`) | ➖ N/A | ❌ No | **PASS** |
| `createEventAction` | ✅ Yes (`verifyAdminAuth`) | ✅ Yes (`role === 'admin'`) | ✅ Yes (`school_id: profile.school_id`) | ✅ Yes (`EventSchema`) | ❌ No | **PASS** |
| `updateEventAction` | ✅ Yes (`verifyAdminAuth`) | ✅ Yes (`role === 'admin'`) | ✅ Yes (`eq('school_id', profile.school_id)`) | ✅ Yes (`EventSchema`) | ❌ No | **PASS** |
| `deleteEventAction` | ✅ Yes (`verifyAdminAuth`) | ✅ Yes (`role === 'admin'`) | ✅ Yes (`eq('school_id', profile.school_id)`) | ⚠️ Partial (Primitives) | ❌ No | **PASS** |
| `toggleEventPublishAction` | ✅ Yes (`verifyAdminAuth`) | ✅ Yes (`role === 'admin'`) | ✅ Yes (`eq('school_id', profile.school_id)`) | ⚠️ Partial (Primitives) | ❌ No | **PASS** |
| **`gallery-actions.ts`** | | | | | | |
| `getAdminGalleryAlbums` | ✅ Yes (`verifyAdminAuth`) | ✅ Yes (`role === 'admin'`) | ✅ Yes (`eq('school_id', profile.school_id)`) | ➖ N/A | ❌ No | **PASS** |
| `createGalleryAlbumAction` | ✅ Yes (`verifyAdminAuth`) | ✅ Yes (`role === 'admin'`) | ✅ Yes (`school_id: profile.school_id`) | ⚠️ Partial (Manual string check) | ❌ No | **PASS** |
| `deleteGalleryAlbumAction` | ✅ Yes (`verifyAdminAuth`) | ✅ Yes (`role === 'admin'`) | ⚠️ Partial (Album checked, but child images deleted without school_id) | ⚠️ Partial (Primitives) | ❌ No | **WARNING** |
| `toggleAlbumPublishAction` | ✅ Yes (`verifyAdminAuth`) | ✅ Yes (`role === 'admin'`) | ✅ Yes (`eq('school_id', profile.school_id)`) | ⚠️ Partial (Primitives) | ❌ No | **PASS** |
| `addGalleryImageAction` | ✅ Yes (`verifyAdminAuth`) | ✅ Yes (`role === 'admin'`) | ⚠️ Partial (Image inserts user's `school_id`, but no verification if `album_id` belongs to user's school) | ⚠️ Partial (Manual check) | ❌ No | **WARNING** |
| `deleteGalleryImageAction` | ✅ Yes (`verifyAdminAuth`) | ✅ Yes (`role === 'admin'`) | ✅ Yes (`eq('school_id', profile.school_id)`) | ⚠️ Partial (Primitives) | ❌ No | **PASS** |
| **`notices-actions.ts`** | | | | | | |
| `getAdminNotices` | ✅ Yes (`verifyAdminAuth`) | ✅ Yes (`role === 'admin'`) | ✅ Yes (`eq('school_id', profile.school_id)`) | ⚠️ Partial (Page/pageSize numbers) | ❌ No | **PASS** |
| `createNoticeAction` | ✅ Yes (`verifyAdminAuth`) | ✅ Yes (`role === 'admin'`) | ✅ Yes (`school_id: profile.school_id`) | ✅ Yes (`NoticeSchema`) | ❌ No | **PASS** |
| `updateNoticeAction` | ✅ Yes (`verifyAdminAuth`) | ✅ Yes (`role === 'admin'`) | ✅ Yes (`eq('school_id', profile.school_id)`) | ✅ Yes (`NoticeSchema`) | ❌ No | **PASS** |
| `deleteNoticeAction` | ✅ Yes (`verifyAdminAuth`) | ✅ Yes (`role === 'admin'`) | ✅ Yes (`eq('school_id', profile.school_id)`) | ⚠️ Partial (Primitives) | ❌ No | **PASS** |
| `toggleNoticePublishAction` | ✅ Yes (`verifyAdminAuth`) | ✅ Yes (`role === 'admin'`) | ✅ Yes (`eq('school_id', profile.school_id)`) | ⚠️ Partial (Primitives) | ❌ No | **PASS** |
| **`settings-actions.ts`** | | | | | | |
| `getAdminSchoolSettings` | ✅ Yes (`verifyAdminAuth`) | ✅ Yes (`role === 'admin'`) | ✅ Yes (`eq('id', profile.school_id)`) | ➖ N/A | ❌ No | **PASS** |
| `updateSchoolSettingsAction` | ✅ Yes (`verifyAdminAuth`) | ✅ Yes (`role === 'admin'`) | ✅ Yes (`eq('id', profile.school_id)`) | ✅ Yes (`SchoolSettingsSchema`) | ❌ No | **PASS** |
| **`teachers-actions.ts`** | | | | | | |
| `getAdminTeachers` | ✅ Yes (`verifyAdminAuth`) | ✅ Yes (`role === 'admin'`) | ✅ Yes (`eq('school_id', profile.school_id)`) | ⚠️ Partial (Page/pageSize numbers) | ❌ No | **PASS** |
| `createTeacherAction` | ✅ Yes (`verifyAdminAuth`) | ✅ Yes (`role === 'admin'`) | ✅ Yes (`school_id: profile.school_id`) | ✅ Yes (`TeacherSchema`) | ❌ No | **PASS** |
| `updateTeacherAction` | ✅ Yes (`verifyAdminAuth`) | ✅ Yes (`role === 'admin'`) | ✅ Yes (`eq('school_id', profile.school_id)`) | ✅ Yes (`TeacherSchema`) | ❌ No | **PASS** |
| `deleteTeacherAction` | ✅ Yes (`verifyAdminAuth`) | ✅ Yes (`role === 'admin'`) | ✅ Yes (`eq('school_id', profile.school_id)`) | ⚠️ Partial (Primitives) | ❌ No | **PASS** |
| `toggleTeacherPublishAction` | ✅ Yes (`verifyAdminAuth`) | ✅ Yes (`role === 'admin'`) | ✅ Yes (`eq('school_id', profile.school_id)`) | ⚠️ Partial (Primitives) | ❌ No | **PASS** |
| **`upload-actions.ts`** | | | | | | |
| `validateFileUploadServerAction` | ❌ No (Public helper) | ❌ No | ❌ No (Utility) | ✅ MIME & Extension validation | ❌ No | **PASS (Helper)** |
| `uploadTeacherPhotoAction` | ✅ Yes (`auth.getUser()`) | ✅ Yes (`role === 'admin'`) | ✅ Yes (`${profile.school_id}/...`) | ✅ MIME & Size checks | ❌ No | **PASS** |
| `uploadEventImageAction` | ✅ Yes (`auth.getUser()`) | ✅ Yes (`role === 'admin'`) | ✅ Yes (`${profile.school_id}/...`) | ✅ MIME & Size checks | ❌ No | **PASS** |
| `uploadNoticeAttachmentAction` | ✅ Yes (`auth.getUser()`) | ✅ Yes (`role === 'admin'`) | ✅ Yes (`${profile.school_id}/...`) | ✅ MIME & Size checks | ❌ No | **PASS** |
| `uploadGalleryImageAction` | ✅ Yes (`auth.getUser()`) | ✅ Yes (`role === 'admin'`) | ⚠️ Partial (`albumId` ownership not checked before insert) | ✅ MIME & Size checks | ❌ No | **WARNING** |

---

## ২. বিস্তারিত পর্যবেক্ষণ ও অডিট ফাইন্ডিংস

### ১. আনঅথেন্টিকেটেড এক্সপোজার (Unauthenticated Exposure)
- `lib/actions/*` ডিরেক্টরির সমস্ত প্রশাসনিক অ্যাকশনে অত্যন্ত দৃঢ় ও কনসিস্টেন্ট `verifyAdminAuth()` হেলপার প্যাটার্ন প্রয়োগ করা হয়েছে। 
- শুধুমাত্র `submitContactMessage` ও `validateFileUploadServerAction` পাবলিক অ্যাকশন হিসেবে কাজ করে, যা পাবলিক পোর্টাল ব্যবহারকারীদের জন্য স্বাভাবিক ও প্রত্যাশিত।

### ২. সার্ভিস রোল কী (service_role) এর অনুপস্থিতি
- অডিট অনুযায়ী কোনো সার্ভার অ্যাকশন ফাইলে `createAdminClient()` বা `SUPABASE_SERVICE_ROLE_KEY` ইমপোর্ট বা ব্যবহার করা হয়নি। 
- সকল সার্ভার অ্যাকশন ক্লায়েন্টের কুকিজভিত্তিক Supabase SSR ক্লায়েন্ট (`createClient()` from `supabase-server.ts`) ব্যবহার করে চলে, যার ফলে ডাটাবেস লেভেলে Row Level Security (RLS) কার্যকর থাকে।

### ৩. গ্যালারি অ্যালবাম ও ইমেজ ক্রসে-টেন্যান্ট গ্যাপ (Minor Gaps)
- **`gallery-actions.ts:94-98` (`deleteGalleryAlbumAction`)**:
  ```ts
  await supabase.from('gallery_images').delete().eq('album_id', id);
  ```
  এখানে সরাসরি `school_id` ফিল্টার ছাড়াই `gallery_images` ডিলিট করা হচ্ছে। যদি RLS সক্রিয় না থাকে, অন্য কোনো স্কুলের অ্যালবাম আইডির ছবি মুছে যাওয়ার ঝুঁকি তৈরি হতে পারে। (যদিও RLS সক্রিয় থাকলে RLS ব্লক করবে)।
- **`gallery-actions.ts:142-162` (`addGalleryImageAction`)** এবং **`upload-actions.ts:258-264` (`uploadGalleryImageAction`)**:
  ছবি ইনসার্ট করার সময় `album_id` টি বাস্তবিকই বর্তমান ব্যবহারকারীর স্কুলের অন্তর্ভুক্ত কিনা তা অ্যাপ লেভেলে ভ্যালিডেট করা হয়নি। ফলে একজন ক্ষতিকর অ্যাডমিন অন্য স্কুলের `album_id` প্রদান করে তাদের অ্যালবামে ছবি যুক্ত করার চেষ্টা করতে পারে। (ডাটাবেস মাইগ্রেশন `20261007000000` এ RLS এর মাধ্যমে এটি কিছুটা প্রটেক্ট করা থাকলেও অ্যাপ লেভেলে প্রি-চেক না থাকা উদ্বেগের)।
