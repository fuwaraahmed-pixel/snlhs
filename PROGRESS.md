# SNLHS Multi-Tenant SaaS Platform - Progress & Master Tracking

**সর্বশেষ আপডেট সময়**: 2026-09-28  
**প্রজেক্ট নাম**: Shahera Nayeb Laboratory High School (SNLHS) Multi-Tenant SaaS Platform  

---

## 1. আজকের সম্পন্ন কাজ (Completed Work)

- **Database Schema & RLS Policies Setup**:
  - `supabase/full_setup.sql` ফাইল তৈরি ও Supabase SQL Editor-এ সফলভাবে চালানো হয়েছে।
  - `public.current_school_id()` এবং `public.current_user_role()` RLS হেল্পার ফাংশন চালু করা হয়েছে।
  - `schools`, `profiles`, `notices`, `teachers`, `events`, `gallery_albums`, `gallery_images` টেবিলসমূহে Granular RLS Policies এবং `school_id`-এর উপর Performant Indexes যোগ করা হয়েছে।
- **School Settings Migration**:
  - `schools` টেবিলে `settings` JSONB কলাম যোগ করতে migration ফাইল `supabase/migrations/20260928000000_add_school_settings_jsonb.sql` তৈরি ও DB-তে প্রয়োগ করা হয়েছে।
- **Admin User & First School Setup**:
  - `scripts/create-admin-user.ts` চালানো হয়েছে; প্রথম স্কুল (`snlhs`) এবং প্রধান শিক্ষকের জন্য অ্যাডমিন প্রোফাইল তৈরি ও লিঙ্ক করা হয়েছে।
- **Idempotent Data Import**:
  - `scripts/migrate-json-to-supabase.ts` স্ক্রিপ্ট সম্পূর্ণ রিফ্যাক্টর করা হয়েছে:
    - DB ID checks-এর মাধ্যমে duplicate insertion রোধ করে Idempotent করা হয়েছে।
    - `--dry-run` ফ্ল্যাগ যুক্ত করা হয়েছে।
    - Notices (4), Teachers (6 - duplicate মুছে ১ জন করে), Events (3) import করা হয়েছে।
    - Notice-এর ভুয়া attachment URL সাফ করে `null` সেট করা হয়েছে।
    - গ্যালারি অ্যালবামে ছবি ফাইল না থাকলে অ্যালবাম insert বন্ধ রাখার লজিক যোগ করা হয়েছে।
- **RLS Tenant Isolation Security Testing**:
  - `scripts/test-rls-security.ts` তৈরি ও চালানো হয়েছে।

---

## 2. RLS Security Test Results

**ফলাফল**: ৭টির মধ্যে **৭টিই PASS** ✅

1. **B-admin দিয়ে A-র (unpublished) notices/teachers পড়া ও লেখা ব্যর্থ হয়**: ✅ PASS
2. **A-viewer দিয়ে insert/update/delete ব্যর্থ হয়**: ✅ PASS
3. **B-admin দিয়ে A-র album-এ ছবি insert ব্যর্থ হয়**: ✅ PASS
4. **B-admin নিজের profiles.school_id বদলাতে পারে না**: ✅ PASS
5. **লগআউট অবস্থায় unpublished notice ও তার ফাইল পাওয়া যায় না**: ✅ PASS
6. **লগআউট অবস্থায় published কনটেন্ট পাওয়া যায়**: ✅ PASS
7. **B-admin দিয়ে A-র schools row (settings সহ) update করা ব্যর্থ হয়**: ✅ PASS

### মোছা টেস্ট ডেটার তালিকা (Cleanup List):
- `Temporary School B` (ID: `bddd561c-89e7-4744-91d7-1869a6822cf8`)
- `Temporary User B-admin` (`test_b_admin_...`)
- `Temporary User A-viewer` (`test_a_viewer_...`)
- `Temporary Gallery Album School A` (ID: `365c4b11-7050-4b94-898f-0c443db6ff5f`)
- `Temporary Unpublished Notice School A` (ID: `9a3b231f-cede-452a-843d-b0bb66a852ab`)

---

## 3. ডাটাবেজের বর্তমান অবস্থা (Current Database State)

**আসল DB Query থেকে প্রাপ্ত Row Counts**:
- `schools`: **1**
- `profiles`: **1**
- `notices`: **4**
- `teachers`: **6**
- `events`: **3**
- `gallery_albums`: **0**
- `gallery_images`: **0**

**`schools.settings` এর স্থিতি**:
- বর্তমানে `{}` (খালি JSON অবজেক্ট, লাইভ মাইগ্রেশন রান বাকি)।

**Storage (`teacher-images` bucket)**:
- ফাইল: `9bb0525c-150d-4519-9e99-55e45d206be4/teachers/1790578657546_teacher_1.jpg` (১টি ফাইল, প্রধান শিক্ষকের ছবি)।

---

## 4. Master Plan Implementation Status (Phase 1 - 10)

| Phase | নাম | স্ট্যাটাস | সংক্ষিপ্ত বিবরণ |
| :-: | :--- | :-: | :--- |
| **Phase 1** | Tech Stack & Project Setup | ✅ **পাস** | Next.js, Tailwind, TypeScript, Supabase Client সেটআপ |
| **Phase 2** | Database Schema & RLS Policies | ✅ **পাস** | 7 Core Tables, Index, SQL Schema (`full_setup.sql`) সম্পূর্ণ |
| **Phase 3** | Authentication & Multi-Tenant Context | 🟡 **আংশিক** | Admin Login/User তৈরি সম্পন্ন; `/admin/reset-password` বাকি |
| **Phase 4** | Multi-Tenant Data Isolation | ✅ **পাস** | RLS Tenant Isolation এবং Helper functions সম্পূর্ণ সুরক্ষিত |
| **Phase 5** | Admin Dashboard Infrastructure | 🟡 **আংশিক** | Admin UI UI layout আছে, তবে mock state-এ রয়েছে; Gallery UI বাকি |
| **Phase 6** | File Upload & Storage Management | ✅ **পাস** | Storage Buckets, Upload Utility & Relative pathing সম্পূর্ণ |
| **Phase 7** | Public Portal & Dynamic Rendering | 🟡 **আংশিক** | পাব্লিক পেজগুলো বর্তমানে Static HTML/React state-এ রয়েছে |
| **Phase 8** | Settings & Customization Engine | 🟡 **আংশিক** | `schools.settings` কলাম যুক্ত, লাইভ রান বাকি |
| **Phase 9** | Security, Performance & Audit | 🟡 **আংশিক** | RLS 7/7 টেস্ট পাস; অন্যান্য সিকিউরিটি অডিট বাকি |
| **Phase 10** | Production Deployment & Launch | ❌ **বাকি** | Vercel Deployment ও Production Verification বাকি |

---

## 5. পরবর্তী কাজের ক্রম (Next Action Items)

1. **`schools.settings` লাইভ রান সম্পন্ন করা**:
   - `npx tsx --env-file=.env.local scripts/migrate-json-to-supabase.ts` চালিয়ে স্কুলে সেটিংস আপডেট করা।
2. **Phase 5: Admin Dashboard-এ Supabase Integration**:
   - Mock State সরিয়ে Server Actions এবং Supabase Client দিয়ে `notices`, `teachers`, `events`, `settings` পেজ কানেক্ট করা।
   - Gallery Management UI পেজ তৈরি করা।
   - `/admin/reset-password` পেজ তৈরি করা।
3. **ব্রাউজার টেস্ট**:
   - Agent Browser Subagent দিয়ে সম্পূর্ণ Admin UI ফ্লো টেস্ট করা।
4. **Phase 7: Public Frontend Supabase Connection**:
   - পাব্লিক ওয়েবসাইটকে static থেকে Supabase DB-র সাথে যুক্ত করা এবং `revalidatePath` যোগ করা।
5. **Phase 10: Production Deployment**:
   - Vercel-এ Environment Variables সেটআপ করে ডিপ্লয় করা।

---

## 6. জানা সমস্যা ও ঝুঁকি (Known Issues)

- অ্যাডমিন ড্যাশবোর্ড পেজগুলো এখনো Mock State ব্যবহার করছে (Supabase DB থেকে ডাটা সরাসরি লোড/মিউটেট হচ্ছে না)।
- পাব্লিক ওয়েবসাইট পেজগুলো Static state-এ রয়েছে।
- শিক্ষকদের ডাটা নমুনা ডাটা (ভবিষ্যতে আসল নাম ও ছবি বসাতে হবে)।
- গ্যালারির আসল ছবি লোকাল ডিস্কে নেই।
- `migrate-json-to-supabase.ts` স্ক্রিপ্টটি এক-বারের প্রাথমিক ইম্পোর্টের জন্য। পরবর্তীতে লাইভ চালালে অ্যাডমিন প্যানেলে ম্যানুয়ালি করা এডিট Overwrite হতে পারে।
- প্রোডাকশন লঞ্চের আগে Supabase Key rotate করতে হবে এবং অ্যাডমিন পাসওয়ার্ড শক্ত করতে হবে।

---

## 7. এজেন্টের নির্দেশিকা (Rules for Agent)

1. **কোনো ডেটা বা টেবিল ব্যবহারকারীর সুস্পষ্ট অনুমতি ছাড়া ডিলিট করা যাবে না।**
2. **ব্যবহারকারীর অনুমতি ছাড়া কোনো লাইভ মিউটেশন স্ক্রিপ্ট বা ডিলিট কমান্ড চালানো যাবে না।**
3. **স্কোপের বাইরে আনরিকোয়েস্টেড কোনো নতুন ফিচার বানানো যাবে না।**
4. **`SUPABASE_SERVICE_ROLE_KEY` কখনোই Client-side Bundle বা Client Code-এ ব্যবহার করা যাবে না।**
5. **RLS ও Multi-tenant Security সর্বদা সকল কোড এডিটে অগ্রাধিকার পাবে।**

---

## 8. কালকের সেশনের প্রথম কাজ (Tomorrow's First Step)

- `PROGRESS.md` পড়া এবং Read-only কোয়েরির মাধ্যমে বর্তমান অবস্থা যাচাই করা।
