# ডাটাবেস নিরাপত্তা ও টেন্যান্ট আইসোলেশন অডিট (RLS & Tenant Isolation)

এই নথিতে Supabase ডাটাবেসের মাইগ্রেশন ফাইলসমূহ, Row Level Security (RLS) পলিসি এবং মাল্টি-টেন্যান্ট আইসোলেশনের পুঙ্খানুপুঙ্খ বিশ্লেষণ উপস্থাপন করা হয়েছে।

---

## ১. লাইভ পলিসি স্ট্যাটাস (`/audit-input/live-policies.txt`)

- **অবস্থা:** `/audit-input/` ডিরেক্টরিটি ফাঁকা। `/audit-input/live-policies.txt` ফাইলটি পাওয়া যায়নি।
- **ফলাফল:** লাইভ ডাটাবেসের অভ্যন্তরীণ রিয়েল-টাইম স্টেট **UNVERIFIED**। 
- **বিশ্লেষণ পদ্ধতি:** সম্পূর্ণ অডিট লোকাল মাইগ্রেশন ফাইলসমূহ (`supabase/migrations/*.sql`) এবং স্কিমা ফাইলসমূহের গভীর পর্যালোচনার ওপর ভিত্তি করে সম্পন্ন করা হয়েছে।

---

## ২. মাইগ্রেশনের ধারাবাহিক ইতিহাস ও দ্বন্দ্ব (Migration Conflicts & History)

কোডবেসে মোট ৫টি ক্রমানুসারে মাইগ্রেশন ফাইল পাওয়া গেছে:
1. `20260923000000_rls_policies.sql`
2. `20260927000000_storage_policies.sql`
3. `20260928000000_add_school_settings_jsonb.sql`
4. `20261004000000_add_updated_at_gallery_albums.sql`
5. `20261007000000_production_fix_rls_and_storage.sql`

### প্রধান বৈপরীত্য ও সুপারসিডেড পলিসি (Superseded Policies):
- **হেলপার ফাংশন স্থানান্তর:** `20260923000000` ফাইলে `auth.school_id()` তৈরি করা হয়েছিল। পরবর্তীতে `20261007000000` ফাইলে এটি পরিবর্তন করে `public.current_school_id()` এবং `public.current_user_role()` তৈরি করা হয়েছে।
- **ভূমিকা-ভিত্তিক নিয়ন্ত্রণ (Role Enforcement):** প্রাথমিক পলিসিতে শুধুমাত্র `school_id = auth.school_id()` চেক করা হয়েছিল; কিন্তু `viewer` রোলধারী ব্যবহারকারীও টেবিল এডিট করতে পারত। `20261007000000` ফাইলে এটি ফিক্স করে প্রতিটি INSERT/UPDATE/DELETE অপারেশনে `and public.current_user_role() = 'admin'` যুক্ত করা হয়েছে।
- **স্টোরেজ দৃশ্যমানতা:** `20260927000000` মাইগ্রেশনে `notice-files` বাকেটকে প্রাইভেট রাখার পলিসি দেওয়া হয়েছিল যা URL পাথ পার্থক্যের কারণে অকার্যকর হয়ে পড়েছিল। `20261007000000` এ এটিকে পাবলিক হিসেবে আপডেট করা হয়েছে।
- **গুরুত্বপূর্ণ পর্যবেক্ষণ:** যদি কোনো লাইভ Supabase ইনস্ট্যান্সে শুধুমাত্র `20260923000000` রান করা থাকে এবং `20261007000000` রান করা না হয়ে থাকে, তবে `viewer` রোলধারী ব্যক্তি ডাটাবেসের ডেটা মুছে ফেলতে বা এডিট করতে পারবে।

---

## ৩. টেবিল ও অপারেশন ভিত্তিক RLS ম্যাট্রিক্স (Table-by-Table Evidence)

`supabase/migrations/20261007000000_production_fix_rls_and_storage.sql` ফাইল অনুযায়ী প্রতিটি টেবিলের নিরাপত্তা বিশ্লেষণ:

### ১. `profiles`
- **SELECT:** `id = auth.uid()` — ব্যবহারকারী কেবল নিজের প্রোফাইল দেখতে পাবে।
- **INSERT / UPDATE / DELETE:** কোনো ক্লায়েন্ট পলিসি নেই।
- **সংশ্লিষ্ট ঝুঁকি:** একজন সাধারণ ব্যবহারকারী সরাসরি নিজের `role` বা `school_id` পরিবর্তন করতে পারবে না (ক্লায়েন্ট দিয়ে UPDATE নিষিদ্ধ)।

### ২. `schools`
- **SELECT:** `status = 'active'` — সক্রিয় স্কুল সবার জন্য উন্মুক্ত।
- **UPDATE:** 
  ```sql
  using (id = public.current_school_id() and public.current_user_role() = 'admin')
  with check (id = public.current_school_id() and public.current_user_role() = 'admin');
  ```
  প্রমাণ: শুধুমাত্র সংশ্লিষ্ট স্কুলের অ্যাডমিন আপডেট করতে পারবে।

### ৩. `notices`
- **SELECT:** 
  ```sql
  is_published = true or (
    auth.role() = 'authenticated'
    and school_id = public.current_school_id()
    and public.current_user_role() = 'admin'
  )
  ```
  প্রমাণ: অজ্ঞাত (Anon) ভিজিটর শুধুমাত্র `is_published = true` নোটিশ দেখতে পাবে। ড্রাফট নোটিশ অন্য টেন্যান্ট বা বহিরাগত দেখতে পারবে না।
- **INSERT / UPDATE / DELETE:**
  ```sql
  auth.role() = 'authenticated'
  and school_id = public.current_school_id()
  and public.current_user_role() = 'admin'
  ```
  প্রমাণ: টেন্যান্ট আইসোলেশন ও অ্যাডমিন রোল কঠোরভাবে আবদ্ধ।

### ৪. `teachers`
- **SELECT:** `is_published = true or (auth.role() = 'authenticated' and school_id = public.current_school_id() and public.current_user_role() = 'admin')`
- **INSERT / UPDATE / DELETE:** `school_id = public.current_school_id() and public.current_user_role() = 'admin'`
  প্রমাণ: টেন্যান্ট আইসোলেশন সুরক্ষিত।

### ৫. `events`
- **SELECT:** `is_published = true or (auth.role() = 'authenticated' and school_id = public.current_school_id() and public.current_user_role() = 'admin')`
- **INSERT / UPDATE / DELETE:** `school_id = public.current_school_id() and public.current_user_role() = 'admin'`
  প্রমাণ: টেন্যান্ট আইসোলেশন সুরক্ষিত।

### ৬. `gallery_albums`
- **SELECT:** `is_published = true or (auth.role() = 'authenticated' and school_id = public.current_school_id() and public.current_user_role() = 'admin')`
- **INSERT / UPDATE / DELETE:** `school_id = public.current_school_id() and public.current_user_role() = 'admin'`
  প্রমাণ: টেন্যান্ট আইসোলেশন সুরক্ষিত।

### ৭. `gallery_images`
- **SELECT:** 
  ```sql
  exists (
    select 1 from public.gallery_albums
    where public.gallery_albums.id = public.gallery_images.album_id
      and public.gallery_albums.is_published = true
  ) or (
    auth.role() = 'authenticated'
    and school_id = public.current_school_id()
    and public.current_user_role() = 'admin'
  )
  ```
- **INSERT / UPDATE / DELETE:**
  ```sql
  auth.role() = 'authenticated'
  and school_id = public.current_school_id()
  and public.current_user_role() = 'admin'
  ```
  প্রমাণ: শুধুমাত্র সংশ্লিষ্ট স্কুলের অ্যাডমিন পরিবর্তন করতে পারবে।

---

## ৪. স্পর্শকাতর টেবিল ও চরম ঝুঁকি: `contact_messages` (CRITICAL BLOCKER)

- **অবস্থান:** `supabase/migrations/` বা `supabase/schema.sql` কোথাও `contact_messages` টেবিল তৈরির কোনো DDL স্টেটমেন্ট নেই!
- **কোড নির্ভরতা:**
  - `lib/actions/contact-actions.ts:59`: `supabase.from('contact_messages').insert(...)`
  - `lib/actions/contact-actions.ts:126`: `supabase.from('contact_messages').select('*').eq('school_id', profile.school_id)`
  - `app/admin/messages/page.tsx`: কন্টাক্ট মেসেজ রেন্ডার করছে।
- **নিরাপত্তা প্রভাব:** 
  1. ফ্রেশ ডাটাবেস সেটআপে এই টেবিলটি একেবারেই তৈরি হবে না, যার ফলে ফ্রন্টএন্ড থেকে যোগাযোগ বার্তা পাঠানো ব্যর্থ হবে।
  2. এই টেবিলের জন্য কোনো আনুষ্ঠানিক RLS পলিসি মাইগ্রেশনে অন্তর্ভুক্ত নেই। ম্যানুয়ালি টেবিল বানানো হলে RLS বন্ধ থাকলে যে কেউ অন্য স্কুলের বার্তা দেখতে বা মুছতে পারবে।

---

## ৫. হেলপার ফাংশন সিকিউরিটি (`current_school_id`, `current_user_role`)

- **কোড প্রমাণ (`20261007000000_production_fix_rls_and_storage.sql:17-36`):**
  ```sql
  create or replace function public.current_school_id()
  returns uuid
  language sql
  stable
  security definer
  set search_path = public
  as $$
    select school_id from public.profiles where id = auth.uid()
  $$;
  ```
- **সিকিউরিটি যাচাই:**
  - `SECURITY DEFINER`: হ্যাঁ, ব্যবহৃত হয়েছে যাতে `profiles` টেবিলের RLS লুপ এড়ানো যায়।
  - `search_path = public`: হ্যাঁ, স্পষ্টভাবে সেট করা আছে, যা Search-Path Hijacking প্রতিরোধ করে।
  - `STABLE`: হ্যাঁ, কুয়েরি এক্সিকিউশনে পারফরম্যান্স ক্যাশিং নিশ্চিত করে।
- **ফলাফল:** হেলপার ফাংশন দুটি স্ট্যান্ডার্ড সিকিউরিটি বেস্ট প্র্যাকটিস মেনে তৈরি করা হয়েছে।
