# 📋 Shahera Nayeb Laboratory High School (SNLHS) - Master Audit Report
> **সর্বশেষ হালনাগাদ সময়**: ১ অক্টোবর ২০২৬  
> **প্রজেক্টের ধরন**: Multi-Tenant SaaS School Platform (Next.js 15 App Router + Supabase RLS DB)  
> **নথির উদ্দেশ্য**: প্রজেক্টের শুরু থেকে বর্তমান পর্যন্ত সম্পন্ন হওয়া সকল কাজ এবং ভবিষ্যতে বাকী থাকা প্রতিটি কাজের চূড়ান্ত চিরুনি অভিযান অডিট রিপোর্ট।

---

## 📊 Phase-by-Phase ওভারভিউ (Master Roadmap Status)

| Phase | বিষয়ের নাম | স্ট্যাটাস | সারসংক্ষেপ |
| :-: | :--- | :-: | :--- |
| **Phase 1** | Tech Stack & Base Architecture Setup | ✅ **১০০% সম্পন্ন** | Next.js 15 App Router, TypeScript, Custom CSS Design Tokens, Font (Hind Siliguri), Lucide Icons |
| **Phase 2** | Database Schema & Granular RLS Security | ✅ **১০০% সম্পন্ন** | 7 Core Tables (`schools`, `profiles`, `notices`, `teachers`, `events`, `gallery_albums`, `gallery_images`), SQL Schema, Indexes, RLS Policies |
| **Phase 3** | Authentication & Session Middleware Guard | ✅ **১০০% সম্পন্ন** | `@supabase/ssr` দিয়ে `/admin/login`, Cookie Handling, `middleware.ts` দিয়ে `/admin/:path*` রুট সুরক্ষিতকরণ |
| **Phase 4** | Multi-Tenant Data Isolation & Security Test | ✅ **১০০% সম্পন্ন** | `public.current_school_id()`, `public.current_user_role()` RLS হেল্পার; 7/7 RLS Security Tests Passed |
| **Phase 5** | Admin Dashboard Infrastructure & Management | 🟡 **৫০% সম্পন্ন** | Admin Login, Notices (Server Actions + `revalidatePath`) সম্পন্ন; Teachers, Events, Settings & Gallery-তে Server Actions যুক্ত করা বাকি |
| **Phase 6** | File Upload & Storage Bucket Management | ✅ **১০০% সম্পন্ন** | Supabase Storage Buckets (`teacher-images`, `gallery-images`, `notice-attachments`), Upload Utility & relative pathing |
| **Phase 7** | Public Website & Dynamic Routes | 🟡 **৪০% সম্পন্ন** | Public navigation redirect fix, Public Server Components (`/notices`, `/teachers`, `/events`) লিঙ্কড; বাকী পাবলিক পেজ (`/about`, `/academics`, `/admission`, `/contact`, `/gallery`) এবং ফাইনাল রেসপন্সিভ রিচ UI বাকি |
| **Phase 8** | School Settings & JSONB Migration | ✅ **১০০% সম্পন্ন** | `schools.settings` JSONB সেলফ-কনফিগারেশন, `scripts/migrate-json-to-supabase.ts` চালনা করে লাইভ DB ডাটা সিঙ্ক |
| **Phase 9** | Production Security Audit & Verification | 🟡 **৫০% সম্পন্ন** | RLS টেস্ট সম্পন্ন; Prod Supabase key rotation ও Password Hardening বাকি |
| **Phase 10** | Production Deployment & Domain Setup | ❌ **০% বাকী** | Vercel Deployment, Custom Domain DNS, SSL & Environment Variables সেটআপ |

---

## 🛠️ ১. এ পর্যন্ত সফলভাবে সম্পন্ন হওয়া কাজের বিস্তারিত তালিকা (Completed Tasks)

### 🔒 ক. সিকিউরিটি ও ডাটাবেজ (Database & RLS Security):
1. **Supabase Schema Creation (`supabase/full_setup.sql`)**:
   - `schools`, `profiles`, `notices`, `teachers`, `events`, `gallery_albums`, `gallery_images` - ৭টি মূল টেবিল তৈরি করা হয়েছে।
   - RLS হেল্পার ফাংশন `public.current_school_id()` এবং `public.current_user_role()` সক্রিয় করা হয়েছে।
2. **Multi-Tenant RLS isolation**:
   - সকল টেবিলে `school_id` অনুযায়ী কঠোর কাস্টম RLS Policy সেট করা হয়েছে।
3. **RLS Security Test suite (`scripts/test-rls-security.ts`)**:
   - ৭টির মধ্যে **৭টিতেই PASS** প্রাপ্ত (অন্য স্কুলের এডমিন কোনো তথ্য দেখতে/এডিট করতে পারে না, ভিউয়ার রোল এডিট করতে পারে না, আনপাবলিশড কনটেন্ট লগআউট অবস্থায় সম্পূর্ণ অদৃশ্য থাকে)।
4. **অ্যাডমিন ইউজার ও প্রথম স্কুল সিঙ্ক**:
   - প্রধান শিক্ষক নূর মোহাম্মদ সরকার (সাগর)-এর জন্য প্রথম স্কুল `snlhs` এবং অ্যাডমিন প্রোফাইল তৈরি ও লিঙ্ক করা হয়েছে।

### 🌐 খ. মিডলওয়্যার ও নেভিগেশন ফিক্স (Middleware & Navigation Routing):
1. **`middleware.ts` সিকিউরিটি গার্ড**:
   - `matcher: ['/admin/:path*']` এবং `!pathname.startsWith('/admin')` কন্ডিশন সেট করে শুধুমাত্র অ্যাডমিন রুটগুলোকে সুরক্ষিত করা হয়েছে।
2. **পাবলিক ভিজিটর রিডাইরেক্ট বাগ ফিক্স**:
   - পাবলিক ভিজিটর কোনো লিংকে ক্লিক করলেই `/admin/login`-এ চলে যাওয়ার আসল কারণ শনাক্ত করে সমাধান করা হয়েছে (`app/page.tsx`-এর লিংকগুলো `/admin/*` থেকে বদলে `/notices`, `/teachers`, `/events`-এ করা হয়েছে)।

### 🎨 গ. ডিজাইন সিস্টেম ও CSS আর্কিটেকচার (Design Tokens & Styling):
1. **কাস্টম সিএসএস থিম টোকেন**:
   - `css/variables.css`, `css/style.css`, `css/components.css`, `css/responsive.css` তৈরি ও সংগঠিত।
2. **Global CSS Bundling (`app/layout.tsx`)**:
   - Next.js App Router-এ সব কাস্টম CSS ফাইল সরাসরি `app/layout.tsx`-এ ইমপোর্ট করে পুরো ওয়েবসাইটে প্রাতিষ্ঠানিক নেভি ব্লু থিম, গোল্ডেন অ্যাক্সেন্ট ও `Hind Siliguri` ফন্ট যুক্ত করা হয়েছে।

### ⚡ ঘ. পাবলিক সার্ভার কম্পোনেন্টস (Public Server Components):
1. **`app/notices/page.tsx`**:
   - Supabase `notices` টেবিল থেকে `is_published = true` ফিল্টার করে লাইভ ৪টি আসল নোটিশ রেন্ডার করা হয়েছে।
2. **`app/teachers/page.tsx`**:
   - Supabase `teachers` টেবিল থেকে `is_published = true` ফিল্টার করে লাইভ ৬ জন শিক্ষকের তালিকা রেন্ডার করা হয়েছে।
3. **`app/events/page.tsx`**:
   - Supabase `events` টেবিল থেকে `is_published = true` ফিল্টার করে লাইভ ৩টি আসল ইভেন্ট রেন্ডার করা হয়েছে।
4. **কুকিমুক্ত পাব্লিক ক্লায়েন্ট (`lib/db/supabase-public.ts`)**:
   - কুকিজ ছাড়াই পাবলিক ডাটা ফেচিং করা হয়েছে যা Next.js Static ISR Build সফলভাবে জেনারেট করে।
5. **জিরো ভুয়া ডাটা পলিসি (Zero Fake Data Enforcement)**:
   - কোনো ডামি/প্লেসহোল্ডার ডেটা না রেখে ডাটা না থাকলে "এই মুহূর্তে কোনো তথ্য যুক্ত করা হয়নি।" এবং এরর হলে "তথ্য লোড করতে সমস্যা হয়েছে।" বার্তা যুক্ত করা হয়েছে।

### ⚙️ ঙ. এডমিন ড্যাশবোর্ড ও সার্ভার অ্যাকশনস (Admin Server Actions):
1. **`lib/actions/notices-actions.ts`**:
   - `createNoticeAction`, `updateNoticeAction`, `deleteNoticeAction`, `toggleNoticePublishAction` তৈরি করা হয়েছে।
   - প্রতিটিতে `revalidatePath('/admin/notices')` এর সাথে `revalidatePath('/notices')` যুক্ত করে অন-ডিমান্ড রিভ্যালিডেশন চালু করা হয়েছে।

---

## 📌 ২. বর্তমানে বাকী থাকা কাজের সম্পূর্ণ তালিকা (Pending Tasks)

### 🔴 Phase A: অ্যাডমিন প্যানেল সার্ভার অ্যাকশনস ও ফুল ম্যানেজমেন্ট (Immediate Priority)
- [ ] **Teachers Server Actions (`lib/actions/teachers-actions.ts`)**:
  - `getAdminTeachers`, `createTeacherAction`, `updateTeacherAction`, `deleteTeacherAction`, `toggleTeacherPublishAction` যোগ করা এবং `app/admin/teachers/page.tsx`-কে মক স্টেট থেকে সরিয়ে আসল সার্ভার অ্যাকশনে কানেক্ট করা।
  - `revalidatePath('/admin/teachers')` ও `revalidatePath('/teachers')` যুক্ত করা।
- [ ] **Events Server Actions (`lib/actions/events-actions.ts`)**:
  - `getAdminEvents`, `createEventAction`, `updateEventAction`, `deleteEventAction`, `toggleEventPublishAction` যোগ করা এবং `app/admin/events/page.tsx`-কে আসল সার্ভার অ্যাকশনে কানেক্ট করা।
  - `revalidatePath('/admin/events')` ও `revalidatePath('/events')` যুক্ত করা।
- [ ] **School Settings Management (`app/admin/settings/page.tsx`)**:
  - `updateSchoolSettingsAction` তৈরি করে স্কুলের EIIN, ঠিকানা, ফোন, ইমেইল, প্রধান শিক্ষকের বাণী ও সোশ্যাল লিঙ্কস এডমিন থেকে সরাসরি `schools.settings` JSONB টেবিলে সেভ করার ইন্টারফেস চালু করা।
- [ ] **Gallery Album & Image Management UI (`app/admin/gallery/page.tsx`)**:
  - অ্যালবাম তৈরি, অ্যালবামে ছবি আপলোড (Supabase `gallery-images` bucket), অ্যালবামের কভার ফটো সেট ও কাস্টম গ্যালারি ম্যানেজমেন্ট ইউআই তৈরি করা।
- [ ] **Password Reset Page (`app/admin/reset-password/page.tsx`)**:
  - ইমেইল রিসেট লিংকের পর নতুন পাসওয়ার্ড দিয়ে লগইন পাসওয়ার্ড বদলানোর পেজ তৈরি করা।

### 🟡 Phase B: পাবলিক ওয়েবসাইটের পূর্ণাঙ্গ রূপ ও পেজসমূহ (Phase 7 Full Features)
- [ ] **পাবলিক পেজের রিচ ডিজাইন ও ফিচারস**:
  - `/notices`: সার্চ ফিল্টার, ক্যাটাগরি ট্যাব (পরীক্ষা, ইভেন্ট, ছুটির নোটিশ), পিডিএফ অ্যাটাচমেন্ট ডাউনলোড বাটন এবং নোটিশ ডিটেইলস পপআপ/পেজ।
  - `/teachers`: বিভাগ অনুযায়ী ফিল্টার বাটন (প্রশাসন, গণিত, ইংরেজি ইত্যাদি), শিক্ষকের বিস্তারিত বায়ো পেজ।
  - `/events`: ইভেন্টের কাউন্টডাউন, স্থান নির্দেশক ম্যাপ, ছবির প্রিভিউ।
- [ ] **নতুন পাবলিক পেজসমূহ তৈরি (App Router Routes)**:
  - `app/about/page.tsx`: প্রতিষ্ঠানের ইতিহাস, প্রধান শিক্ষকের বাণী, পরিচালনা পর্ষদ ও বৈশিষ্ট্য।
  - `app/academics/page.tsx`: সিলেবাস, ক্লাস রুটিন, পরীক্ষার সময়সূচি ও নিয়মাবলী।
  - `app/admission/page.tsx`: ভর্তি ফি চার্ট, ভর্তির নির্দেশিকা ও অনলাইন আবেদন লিঙ্ক।
  - `app/contact/page.tsx`: যোগাযোগের নম্বর, ইমেইল, মেসেজ পাঠানোর ফর্ম এবং Google Maps Interactive Embed.
  - `app/gallery/page.tsx`: অ্যালবামের তালিকা, ফটো প্রিভিউ এবং Lightbox Photo Viewer.

### 🟢 Phase C: বাস্তব তথ্যাবলী সংযোজন (`NEEDS_CONTENT.md`)
- [ ] প্রধান শিক্ষক নূর মোহাম্মদ সরকার (সাগর)-এর আসল পাসপোর্ট ছবি আপলোড করা।
- [ ] সহ-প্রধান শিক্ষক মো: জহিরুল ইসলাম ও প্রান্তর স্নালের ছবি আপলোড করা।
- [ ] স্কুলের একাডেমিক ফি ও ভর্তির সময়সূচি আপডেট করা।
- [ ] স্কুলের অরিজিনাল ক্যাম্পাস, কম্পিউটার ল্যাব ও ক্রীড়া প্রতিযোগিতার ফটো আপলোড করা।

### 🔵 Phase D: প্রোডাকশন ডিপ্লয়মেন্ট ও সিকিউরিটি লঞ্চ (Phase 9 & 10)
- [ ] **Vercel Deployment**:
  - GitHub Repository থেকে Vercel-এ প্রজেক্ট যুক্ত করা।
  - Environment Variables (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`) সেটআপ করা।
- [ ] **Supabase Security & Key Rotation**:
  - প্রোডাকশনের জন্য কাস্টম সিকিউর ডোমেন ও কাস্টম পাসওয়ার্ড শক্তিশালী করা।
- [ ] **Domain & SSL Setup**:
  - আসল ডোমেনে DNS A/CNAME Record পয়েন্ট করা ও SSL ভেরিফাই করা।

---

## 🔍 ৩. প্রজেক্ট ফাইল স্ট্রাকচার অডিট (Current File Map)

```text
e:\web
├── app/
│   ├── layout.tsx (Root Layout with CSS tokens)
│   ├── page.tsx (Public Homepage)
│   ├── globals.css (Fonts & Admin CSS)
│   ├── notices/page.tsx (Public Notices - Live DB)
│   ├── teachers/page.tsx (Public Teachers - Live DB)
│   ├── events/page.tsx (Public Events - Live DB)
│   └── admin/
│       ├── login/page.tsx (Admin Auth Login)
│       ├── forgot-password/page.tsx
│       ├── dashboard/ (Layout & Overview Page)
│       ├── notices/page.tsx (Admin Notices UI)
│       ├── teachers/page.tsx (Admin Teachers UI)
│       ├── events/page.tsx (Admin Events UI)
│       └── settings/page.tsx (Admin Settings UI)
├── css/
│   ├── variables.css (Design Tokens)
│   ├── style.css (Base Layout)
│   ├── components.css (Buttons, Badges, Cards)
│   └── responsive.css (Mobile Viewports)
├── lib/
│   ├── actions/
│   │   └── notices-actions.ts (Server Actions for Notices + Revalidation)
│   ├── db/
│   │   ├── supabase-server.ts (SSR Client with cookies)
│   │   ├── supabase-client.ts (Browser Client)
│   │   └── supabase-public.ts (Public Static/ISR Client)
│   └── storage/
│       ├── upload.ts (File Upload Handler)
│       └── url-builder.ts (Storage URL Helper)
├── supabase/
│   └── full_setup.sql (Master Database Schema & RLS Policies)
├── scripts/
│   ├── create-admin-user.ts (Admin User Provisioning)
│   ├── migrate-json-to-supabase.ts (Idempotent Data Sync)
│   └── test-rls-security.ts (7/7 Security Audit Script)
├── NEEDS_CONTENT.md (Institutional Data Checklist)
├── PROJECT_MASTER_AUDIT.md (THIS MASTER AUDIT FILE - SINGLE SOURCE OF TRUTH)
├── middleware.ts (Next.js Security Guard for /admin/*)
├── next.config.mjs (Page extensions & Next Config)
└── package.json (Next.js 15, Supabase SSR, Lucide, Zod)
```

---

## 🎯 ৪. পরবর্তী ডেভেলপারের জন্য স্পষ্ট অ্যাকশন প্ল্যান (Immediate Action Steps)

যদি আপনি এই প্রজেক্টের কাজ পরবর্তী ধাপে শুরু করতে চান, তবে সরাসরি এই ক্রমানুসারে কাজ করবেন:

1. **পছন্দ ১ (Admin Server Actions সম্পন্ন করা):**
   - `lib/actions/teachers-actions.ts` ও `lib/actions/events-actions.ts` তৈরি করুন।
   - `app/admin/teachers/page.tsx` ও `app/admin/events/page.tsx`-এ সার্ভার অ্যাকশন যুক্ত করে লাইভ মিউটেশন চালনা নিশ্চিত করুন।
2. **পছন্দ ২ (পাবলিক পেজসমূহ তৈরি করা):**
   - `app/about/page.tsx`, `app/academics/page.tsx`, `app/admission/page.tsx`, `app/contact/page.tsx`, `app/gallery/page.tsx` তৈরি করে নেভিগেশন বার লিঙ্কগুলোর সাথে যুক্ত করুন।
3. **পছন্দ ৩ (প্রোডাকশন ডিপ্লয়মেন্ট):**
   - Vercel-এ ডিপ্লয় করে `npm run build` সম্পূর্ণ পাস করা রিভিশন সার্ভারে লাইভ করুন।

---
**অডিট নোট**: পূর্বে থাকা সকল সাময়িক ও পুরনো অডিট রিপোর্ট (`PROGRESS.md`, `PROJECT_STATUS.md`) ডিলিট করা হয়েছে। বর্তমান ফাইলটিই একমাত্র মাস্টার আপডেট ফাইল।
