# 🛡️ AGENT.MD — প্রোডাকশন অপারেশন ও সমস্যা সমাধান হ্যান্ডবুক (Master Operations Guide)

**প্রজেক্ট:** Shahera Nayeb Laboratory High School (Multi-Tenant School SaaS Web Portal)  
**স্ট্যাক:** Next.js 15.1.7 (App Router), React 19, TypeScript 5.7, Tailwind CSS, Supabase (PostgreSQL 15+, Auth, Storage)  
**ভার্সন:** 2.0 (Audited & Production Hardened)  
**তারিখ:** ১১ অক্টোবর ২০২৬  

---

## 📑 সূচিপত্র (Table of Contents)
1. [প্রজেক্ট ওভারভিউ ও ভেরিফাইড আর্কিটেকচার](#১-প্রজেক্ট-ওভারভিউ-ও-ভেরিফাইড-আর্কিটেকচার)
2. [এনভায়রনমেন্ট ভেরিয়েবলস ও সিক্রেট হ্যান্ডলিং রুলস](#২-এনভায়রনমেন্ট-ভেরিয়েবলস-ও-সিক্রেট-হ্যান্ডলিং-রুলস)
3. [ডায়াগনস্টিক ট্রাবলশুটিং ডিসিশন ট্রি (Diagnostic Decision Tree)](#৩-ডায়াগনস্টিক-ট্রাবলশুটিং-ডিসিশন-ট্রি-diagnostic-decision-tree)
4. [অথেন্টিকেশন ও সেশন ট্রাবলশুটিং (Auth, Session & Recovery)](#৪-অথেন্টিকেশন-ও-সেশন-ট্রাবলশুটিং-auth-session--recovery)
5. [টেন্যান্ট আইসোলেশন ও RLS পারমিশন গাইড (Tenant Isolation & RLS)](#৫-টেন্যান্ট-আইসোলেশন-ও-rls-পারমিশন-গাইড-tenant-isolation--rls)
6. [স্টোরেজ ও ফাইল আপলোড সিকিউরিটি (Storage & Uploads)](#৬-স্টোরেজ-ও-ফাইল-আপলোড-সিকিউরিটি-storage--uploads)
7. [ক্যাশিং ডায়াগনোসিস ও টেন্যান্ট-অ্যাওয়ার ইনভ্যালিডেশন (Caching & ISR)](#৭-ক্যাশিং-ডায়াগনোসিস-ও-টেন্যান্ট-অ্যাওয়ার-ইনভ্যালিডেশন-caching--isr)
8. [রেট লিমিটিং ও ৪২৯ লকআউট ট্রাবলশুটিং (Rate Limiting)](#৮-রেট-লিমিটিং-ও-৪২৯-লকআউট-ট্রাবলশুটিং-rate-limiting)
9. [ডাটাবেস মাইগ্রেশন ওয়ার্কফ্লো ও হিস্ট্রি রিকভারি (Migrations)](#৯-ডাটাবেস-মাইগ্রেশন-ওয়ার্কফ্লো-ও-হিস্ট্রি-রিকভারি-migrations)
10. [ব্যাকআপ, রিস্টোর ও ডিজাস্টার রিকভারি (Disaster Recovery & Backups)](#১০-ব্যাকআপ-রিস্টোর-ও-ডিজাস্টার-রিকভারি-disaster-recovery--backups)
11. [বিল্ড, টাইপ-চেক ও ডিপেন্ডেন্সি অডিট কমান্ডস (Windows & Unix)](#১১-বিল্ড-টাইপ-চেক-ও-ডিপেন্ডেন্সি-অডিট-কমান্ডস-windows--unix)
12. [ডিপ্লয়মেন্ট, স্মোক টেস্ট ও রোলব্যাক প্রসিডিউর (Deployment & Rollback)](#১২-ডিপ্লয়মেন্ট-স্মোক-টেস্ট-ও-রোলব্যাক-প্রসিডিউর-deployment--rollback)
13. [লগিং, মনিটরিং ও ইন্সিডেন্ট রেসপন্স (Logging & APM)](#১৩-লগিং-মনিটরিং-ও-ইন্সিডেন্ট-রেসপন্স-logging--apm)
14. [AI কোডিং-এজেন্ট অপারেটিং রুলস (Rules for AI Agents)](#১৪-ai-কোডিং-এজেন্ট-অপারেটিং-রুলস-rules-for-ai-agents)
15. [প্রোডাকশন রেডিনেস চেকলিস্ট (Production Readiness Checklist)](#১৫-প্রোডাকশন-রেডিনেস-চেকলিস্ট-production-readiness-checklist)

---

## ১. প্রজেক্ট ওভারভিউ ও ভেরিফাইড আর্কিটেকচার

### কোর আর্কিটেকচারাল কম্পোনেন্টস
- **ফ্রন্টএন্ড:** Next.js 15 App Router। পাবলিক পেজগুলোতে ISR (`revalidate: 60` সেকেন্ড বা ১ ঘণ্টা) ব্যবহার করা হয়েছে দ্রুত লোডিং ও এসইও নিশ্চিত করার জন্য।
- **অথেন্টিকেশন গেটওয়ে:** [`middleware.ts`](file:///e:/web/middleware.ts) শুধুমাত্র `/admin/*` রাউটগুলোতে হস্তক্ষেপ করে। 
  - পাবলিক অ্যাডমিন পাথ: `/admin/login`, `/admin/forgot-password`, `/admin/reset-password`।
  - প্রোটেক্টেড পাথ: `/admin/dashboard`, `/admin/notices`, `/admin/teachers`, `/admin/messages`, ইত্যাদিতে অননুমোদিত রিকোয়েস্ট সরাসরি `/admin/login`-এ রিডাইরেক্ট হয়।
- **ডাটাবেস এক্সেস ও রোল ম্যানেজমেন্ট:**
  - `auth.users` টেবিলে অ্যাকাউন্ট সংরক্ষিত থাকে।
  - `public.profiles` টেবিলে ইউজার রোল (`admin` অথবা `viewer`) এবং নির্দিষ্ট `school_id` অ্যাসাইন করা থাকে।
  - **সার্ভার অ্যাকশন ক্লায়েন্ট:**
    - [`lib/db/supabase-server.ts`](file:///e:/web/lib/db/supabase-server.ts): কুকি-ভিত্তিক সেশন ক্লায়েন্ট (RLS সক্রিয় থাকে)।
    - [`lib/db/supabase-client.ts`](file:///e:/web/lib/db/supabase-client.ts): ব্রাউজার-সাইড ক্লায়েন্ট।
    - [`lib/db/supabase-public.ts`](file:///e:/web/lib/db/supabase-public.ts): পাবলিক ভিউয়ার ক্লায়েন্ট (সার্ভার মেমোরিতে কুকিলেস)।
    - [`lib/db/supabase-admin.ts`](file:///e:/web/lib/db/supabase-admin.ts): সার্ভিস রোল কি (RLS বাইপাস করে; শুধুমাত্র ব্যাকগ্রাউন্ড সিডিং ও সিকিউর টেস্টে ব্যবহার্য)।

---

## ২. এনভায়রনমেন্ট ভেরিয়েবলস ও সিক্রেট হ্যান্ডলিং রুলস

### আবশ্যক কনফিগারেশন (`.env.local`)

```env
# 1. Supabase ক্লাউড সংযোগ (ব্রাউজারে এক্সপোজড - Public)
NEXT_PUBLIC_SUPABASE_URL=https://<your-project-id>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOi...

# 2. প্রিভিলেজড সার্ভিস রোল (কখনো ক্লায়েন্টে ব্যবহার করবেন না - Private)
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOi...

# 3. অ্যাপ্লিকেশন ক্যানোনিকাল ইউআরএল
NEXT_PUBLIC_APP_URL=https://yourdomain.com   # লোকাল ডেভেলপমেন্টে: http://localhost:3000

# 4. ডিফল্ট টেন্যান্ট আইডেন্টিফায়ার
NEXT_PUBLIC_DEFAULT_SCHOOL_SLUG=snlhs
```

### ⚠️ সিক্রেট হ্যান্ডলিংয়ের কঠোর নিয়মাবলি:
1. **কখনো কমিট করবেন না:** `.env.local` গিটইগনোরে থাকতে হবে। গিট লগ বা কোনো ডকুমেন্টে আসল কি পেস্ট করা যাবে না।
2. **সার্ভিস রোল কি আইসোলেশন:** `SUPABASE_SERVICE_ROLE_KEY` কখনোই কোনো Client Component (`'use client'`) বা ব্রাউজার থেকে কল হওয়া ফাংশনে ইমপোর্ট বা পাঠানো যাবে না।
3. **প্রোডাকশন ইনজেকশন:** Vercel বা হোস্টিং প্রোভাইডারের এনভায়রনমেন্ট ভেরিয়েবল সেটিংসে এই কি-গুলো এনক্রিপ্টেড আকারে যুক্ত করুন।

---

## ৩. ডায়াগনস্টিক ট্রাবলশুটিং ডিসিশন ট্রি (Diagnostic Decision Tree)

যেকোনো সমস্যার সম্মুখীন হলে অন্ধের মতো কোড বা ডাটাবেস পরিবর্তন না করে নিচের ধাপগুলো অনুসরণ করুন:

```
                  [ব্যবহারকারী বা সিস্টেমে ত্রুটি লক্ষ্য করা গেল]
                                       │
                  ┌────────────────────┴────────────────────┐
           [UI / বিল্ড ত্রুটি]                      [ডাটাবেস / অথেন্টিকেশন ত্রুটি]
                  │                                         │
        ┌─────────┴─────────┐                     ┌─────────┴─────────┐
    [টাইপ বা লিন্ট এরর]    [ক্যাশিং বা লোডিং]   [RLS / 403 / খালি ডাটা]  [লগইন / রিসেট ব্যর্থ]
        │                   │                     │                     │
  npx tsc --noEmit    Ctrl+F5 হার্ড রিফ্রেশ  user.role & school_id   Supabase Auth Logs ও
  রান করে লাইন চেক     revalidatePath চেক     যাচাই করুন (profiles)   কুকি ভেরিফাই করুন
```

---

## ৪. অথেন্টিকেশন ও সেশন ট্রাবলশুটিং (Auth, Session & Recovery)

### ক. লগইন ফেইলিওর বা রিডাইরেক্ট লুপ
- **লক্ষণ:** ইউজার ক্রেডেনশিয়াল দেওয়ার পরও `/admin/login`-এ ফিরে আসছে।
- **ডায়াগনোসিস:**
  1. ব্রাউজার DevTools -> Application -> Cookies-এ দেখুন `sb-<project-ref>-auth-token` কুকি সেট হচ্ছে কি না।
  2. টার্মিনালে চেক করুন `NEXT_PUBLIC_SUPABASE_URL` সঠিক কি না নাকি প্লেসহোল্ডার স্ট্রিং দেওয়া আছে।
- **সমাধান:**
  1. নিশ্চিত করুন `middleware.ts`-এ কুকি কপি করার লজিক ঠিক আছে।
  2. ডাটাবেসের `public.profiles` টেবিলে ইউজারের রো এন্ট্রি আছে কি না চেক করুন:
     ```sql
     select id, role, school_id from public.profiles where email = 'user@example.com';
     ```

### খ. পাসওয়ার্ড রিসেট কাজ না করা (404 বা ইনভ্যালিড সেশন)
- **লক্ষণ:** রিসেট ইমেইলের লিঙ্কে ক্লিক করলে সেশন পাওয়া যাচ্ছে না বা ৪০৪ দিচ্ছে।
- **সমাধান:**
  1. প্রজেক্টে [`app/admin/reset-password/page.tsx`](file:///e:/web/app/admin/reset-password/page.tsx) সক্রিয় রয়েছে।
  2. Supabase Dashboard -> **Authentication** -> **URL Configuration**-এ যান।
  3. **Site URL:** `https://yourdomain.com`
  4. **Redirect URLs:** তালিকায় যোগ করুন:
     - `http://localhost:3000/admin/reset-password`
     - `https://yourdomain.com/admin/reset-password`
  5. Supabase Free Tier-এ ঘণ্টায় মাত্র ৩-৪টি ইমেইল যায়; প্রোডাকশনে অবশ্যই কাস্টম SMTP (Resend/SendGrid) কনফিগার করুন।

---

## ৫. টেন্যান্ট আইসোলেশন ও RLS পারমিশন গাইড (Tenant Isolation & RLS)

### ক. টেন্যান্ট ডাটা আইসোলেশন নীতি
আমাদের স্কিমায় প্রতিটি মূল রিসোর্স (`notices`, `teachers`, `events`, `gallery_albums`, `gallery_images`) সরাসরি `school_id` ধারণ করে।
- পাবলিক ইউজাররা শুধুমাত্র `is_published = true` এবং সক্রিয় স্কুলের ডাটা পড়তে পারে।
- স্কুল অ্যাডমিনরা শুধুমাত্র তাদের নিজস্ব `public.current_school_id()`-এর ডাটা দেখতে, যোগ বা পরিবর্তন করতে পারে।

### খ. RLS এরর ডায়াগনোসিস: "new row violates row-level security policy"
- **কখন ঘটে:** যখন কোনো অ্যাডমিন ইউজার ডাটা ইনসার্ট করার চেষ্টা করে কিন্তু তার প্রোফাইলে `role != 'admin'` অথবা ইনসার্ট করা রো-এর `school_id` ইউজারের `profiles.school_id`-এর সাথে মেলে না।
- **যাচাইয়ের SQL কোড:**
  ```sql
  -- ১. ইউজারের প্রোফাইল স্টেট চেক
  select id, school_id, role from public.profiles where id = auth.uid();

  -- ২. হেল্পার ফাংশনের রিটার্ন চেক
  select public.current_school_id(), public.current_user_role();
  ```
- **নিরাপত্তা সতর্কতা:** সমস্যা মেটানোর জন্য **কখনোই RLS বন্ধ (`DISABLE ROW LEVEL SECURITY`) করবেন না** বা পাবলিক `INSERT` পারমিশন দেবেন না!

---

## ৬. স্টোরেজ ও ফাইল আপলোড সিকিউরিটি (Storage & Uploads)

### ক. বাকেট কনফিগারেশন
| বাকেট নাম | অ্যাক্সেস লেভেল | সর্বোচ্চ সাইজ | অনুমোদিত টাইপ |
|---|---|---|---|
| `notice-files` | Public Read / Admin Write | 10 MB | PDF, DOCX |
| `teacher-images` | Public Read / Admin Write | 5 MB | JPEG, PNG, WEBP |
| `gallery-images` | Public Read / Admin Write | 10 MB | JPEG, PNG, WEBP |
| `event-images` | Public Read / Admin Write | 10 MB | JPEG, PNG, WEBP |
| `school-assets` | Public Read / Admin Write | 5 MB | JPEG, PNG, WEBP, ICO |

### খ. পাথ স্ট্রাকচার ও আইসোলেশন
ফাইলের পাথ অবশ্যই নিচের ফরম্যাটে তৈরি হয়:
`{school_id}/{folder}/{timestamp}_{random}.ext`
স্টোরেজ RLS পলিসি [`admin_only_upload`](file:///e:/web/supabase/migrations/20261007000000_production_fix_rls_and_storage.sql#L351) নিশ্চিত করে যে কোনো অ্যাডমিন অন্য কোনো স্কুলের ফোল্ডারে ফাইল আপলোড করতে পারবে না।

---

## ৭. ক্যাশিং ডায়াগনোসিস ও টেন্যান্ট-অ্যাওয়ার ইনভ্যালিডেশন (Caching & ISR)

- **সমস্যা:** অ্যাডমিন প্যানেল থেকে কোনো নোটিশ বা শিক্ষক আপডেট করার পর পাবলিক পেজে পরিবর্তন আসছে না।
- **কারণ:** Next.js ISR ক্যাশ ধরে রেখেছে।
- **প্রতিরোধ:**
  সার্ভার অ্যাকশনে মিউটেশনের পর সংশ্লিষ্ট পাথ ইনভ্যালিডেট করুন:
  ```typescript
  revalidatePath('/notices');
  revalidatePath('/');
  ```
- **মাল্টি-স্কুল ফিউচার প্র্যাকটিস:** ভবিষ্যতে সাবডোমেন বা মাল্টি-স্কুল আর্কিটেকচারে পাথ-বেসড ইনভ্যালিডেশনের পরিবর্তে ট্যাগ-বেসড ইনভ্যালিডেশন (`revalidateTag(`school-${schoolId}-notices`)`) ব্যবহার করা বাধ্যতামূলক।

---

## ৮. রেট লিমিটিং ও ৪২৯ লকআউট ট্রাবলশুটিং (Rate Limiting)

- **বর্তমান মেকানিজম:** [`lib/utils/rate-limiter.ts`](file:///e:/web/lib/utils/rate-limiter.ts) ইন-মেমোরি টোকেন বাকেট।
  - পাবলিক কন্টাক্ট ফর্ম: প্রতি আইপিতে ১০ মিনিটে সর্বোচ্চ ৫ বার।
  - লগইন প্রচেষ্টা: প্রতি আইপিতে ১৫ মিনিটে সর্বোচ্চ ৫ বার।
- **সীমাবদ্ধতা:** এটি সিঙ্গেল সার্ভার প্রসেসে কার্যকর। ক্লাউড সার্ভারলেস (যেমন Vercel)-এ মেমোরি শেয়ার হয় না।
- **প্রোডাকশন আপগ্রেড গাইড:** প্রোডাকশনে হাই-ট্রাফিক সিকিউরিটির জন্য **Upstash Redis** (`@upstash/ratelimit`) বা Supabase RPC টেবিল ব্যবহার করুন।
- **লকআউট আনলক:** ডেভেলপমেন্টের সময় রেট লিমিট লকআউট হলে ডেভ সার্ভার রিস্টার্ট দিন অথবা টেস্ট আইপি পরিবর্তন করুন।

---

## ৯. ডাটাবেস মাইগ্রেশন ওয়ার্কফ্লো ও হিস্ট্রি রিকভারি (Migrations)

### ক. মাইগ্রেশন এক্সিকিউশন সিকোয়েন্স
একটি সম্পূর্ণ ডাটাবেস প্রস্তুত করতে নিচের ফাইলগুলো সুনির্দিষ্ট ক্রমে রান করতে হবে:
1. [`supabase/schema.sql`](file:///e:/web/supabase/schema.sql) (বেস টেবিল ও রিলেশন)
2. [`supabase/migrations/20261007000000_production_fix_rls_and_storage.sql`](file:///e:/web/supabase/migrations/20261007000000_production_fix_rls_and_storage.sql) (সম্পূর্ণ RLS ও স্টোরেজ ফিক্স)
3. কন্টাক্ট মেসেজের জন্য:
   ```sql
   create table if not exists public.contact_messages (
     id uuid primary key default gen_random_uuid(),
     school_id uuid references public.schools(id) on delete cascade,
     name text not null,
     phone text not null,
     email text,
     subject text not null,
     message text not null,
     is_read boolean default false,
     created_at timestamptz default now()
   );
   alter table public.contact_messages enable row level security;
   create policy "contact_messages_public_insert" on public.contact_messages for insert with check (true);
   create policy "contact_messages_admin_select" on public.contact_messages for select using (
     school_id = public.current_school_id() and public.current_user_role() = 'admin'
   );
   ```

---

## ১০. ব্যাকআপ, রিস্টোর ও ডিজাস্টার রিকভারি (Disaster Recovery & Backups)

1. **অটোমেটেড ক্লাউড ব্যাকআপ:** Supabase Pro টায়ারে দৈনিক অটোমেটিক ব্যাকআপ সক্রিয় থাকে।
2. **ম্যানুয়াল ব্যাকআপ নেওয়া (PostgreSQL Dump):**
   ```bash
   # ডাটাবেসের সম্পূর্ণ ব্যাকআপ সংরক্ষণ
   pg_dump "postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres" > backup_snlhs_$(date +%F).sql
   ```
3. **জরুরি রিস্টোর পদ্ধতি:**
   ```bash
   psql "postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres" < backup_file.sql
   ```
4. **স্টোরেজ ব্যাকআপ:** Supabase স্টোরেজের ফাইলগুলো প্রতি সপ্তাহে স্থানীয় ক্লাউড বা কোল্ড স্টোরেজে সিঙ্ক করে রাখুন।

---

## ১১. বিল্ড, টাইপ-চেক ও ডিপেন্ডেন্সি অডিট কমান্ডস (Windows & Unix)

### উইন্ডোজ পাওয়ারশেল (PowerShell) ও বাশ (Bash) কমান্ড গাইড:

| কাজ | উইন্ডোজ (PowerShell) | লিনাক্স / ম্যাক (Bash) |
|---|---|---|
| **লোকাল সার্ভার চালু** | `npm run dev` | `npm run dev` |
| **টাইপস্ক্রিপ্ট টাইপ চেক** | `npx tsc --noEmit` | `npx tsc --noEmit` |
| **প্রোডাকশন বিল্ড** | `npm run build` | `npm run build` |
| **বিল্ড ক্যাশ ক্লিয়ার** | `Remove-Item -Recurse -Force .next` | `rm -rf .next` |
| **সিকিউরিটি ডিপেন্ডেন্সি চেক** | `npm audit` | `npm audit` |
| **ডিপেন্ডেন্সি ভালনারেবিলিটি ফিক্স** | `npm audit fix` | `npm audit fix` |

---

## ১২. ডিপ্লয়মেন্ট, স্মোক টেস্ট ও রোলব্যাক প্রসিডিউর (Deployment & Rollback)

### ক. ডিপ্লয়মেন্টের পূর্বশর্ত (Pre-Flight Checks)
1. `npx tsc --noEmit` সফল হতে হবে।
2. `npm run build` লোকাল মেশিনে কোনো এরর ছাড়া সম্পন্ন হতে হবে।
3. সমস্ত সিক্রেট ভেরিয়েবল হোস্টিং প্যানেলে (Vercel Settings) যুক্ত থাকতে হবে।

### খ. পোস্ট-ডিপ্লয়মেন্ট স্মোক টেস্ট (Smoke Tests)
- [ ] হোমপেজ (`/`) ঠিকমতো লোড হচ্ছে এবং স্ট্যাটস ডাইনামিক।
- [ ] নোটিশ পাতা (`/notices`) ও পিডিএফ ডাউনলোড কাজ করছে।
- [ ] অ্যাডমিন লগইন (`/admin/login`) এবং ড্যাশবোর্ড লোড হচ্ছে।
- [ ] নতুন একটি ড্রাফট নোটিশ তৈরি করে পাবলিশ টেস্ট।
- [ ] পাবলিক যোগাযোগ ফর্ম (`/contact`) থেকে একটি টেস্ট বার্তা পাঠানো ও অ্যাডমিন ইনবক্সে (`/admin/messages`) তা দৃশ্যমান হওয়া।

### গ. দ্রুত রোলব্যাক (Instant Rollback)
Vercel বা Netlify ড্যাশবোর্ডে গিয়ে পূর্ববর্তী সফল ডেপ্লয়মেন্ট সিলেক্ট করে **"Rollback to this deployment"** বাটনে ক্লিক করুন (সময় লাগবে < ৩০ সেকেন্ড)।

---

## ১৩. লগিং, মনিটরিং ও ইন্সিডেন্ট রেসপন্স (Logging & APM)

1. **রানটাইম এরর ট্র্যাকিং:** প্রোডাকশন লঞ্চের পর [Sentry.io](https://sentry.io)-এর Next.js SDK যুক্ত করুন (`npx @sentry/wizard@latest -i nextjs`)।
2. **Supabase লগস পর্যবেক্ষণ:** 
   - Supabase Dashboard -> **Logs** -> **Postgres Logs** ও **Auth Logs** নিয়মিত মনিটর করুন।
   - বিশেষ করে RLS violations ও Auth 401 এরর খেয়াল রাখুন।
3. **ইন্সিডেন্ট রেসপন্স:**
   - যদি ডাটাবেস ডাউন হয় -> Supabase Status পেজ চেক করুন।
   - যদি আনঅথরাইজড ডাটা লিক সন্দেহ হয় -> অবিলম্বে Supabase API Settings থেকে Anon ও Service কি রোটেট করুন।

---

## ১৪. AI কোডিং-এজেন্ট অপারেটিং রুলস (Rules for AI Agents)

ভবিষ্যতে যেকোনো AI বা অটোমেটেড ডেভেলপার এই রিপোজিটরিতে কাজ করার সময় নিচের নিয়মগুলো মেনে চলবে:

1. **অনুমতিহীন কোনো RLS শিথিল নয়:** কোনো এরর দূর করার উদ্দেশ্যে RLS ডিসেবল করা বা `for all using (true)` দেওয়া সম্পূর্ণ নিষিদ্ধ।
2. **সার্ভিস কি সুরক্ষা:** কোনো কোড পরিবর্তনের সময় `SUPABASE_SERVICE_ROLE_KEY` কে ক্লায়েন্ট সাইড ফাইলে কল করা যাবে না।
3. **অপরিহার্য Zod ভ্যালিডেশন:** যেকোনো নতুন সার্ভার অ্যাকশনে অবশ্যই Zod স্কিমা দিয়ে ইনপুট ভ্যালিডেট করতে হবে।
4. **সাইলেন্ট এরর নিষিদ্ধ:** ডাটাবেস এরর হলে ক্যাচ ব্লকে সাইলেন্টলি সফল বার্তা রিটার্ন করা যাবে না; বিস্তারিত সার্ভার কনসোলে লগ করে ইউজারকে উপযুক্ত মেসেজ দিতে হবে।
5. **উইন্ডোজ সামঞ্জস্যতা:** কমান্ড সাজেস্ট করার সময় ক্রস-প্ল্যাটফর্ম বা পাওয়ারশেল ফ্রেন্ডলি কমান্ড দিতে হবে।

---

## ১৫. প্রোডাকশন রেডিনেস চেকলিস্ট (Production Readiness Checklist)

- [x] Next.js 15 প্রোডাকশন বিল্ড শতভাগ সফল (`npm run build`).
- [x] টাইপস্ক্রিপ্ট কম্পাইলেশন ভেরিফাইড (`npx tsc --noEmit` - 0 Errors).
- [x] অ্যাডমিন পাসওয়ার্ড রিসেট ও রিকভারি পেজ সক্রিয়।
- [x] রেট লিমিটিং প্রটেকশন কোডবেসে অন্তর্ভুক্ত।
- [x] নোটিশ ও টিচার তালিকায় পেজিনেশন কনফিগার করা।
- [x] প্রাইভেসি পলিসি ও টার্মস অব সার্ভিস পেজ ও ফুটার লিঙ্ক সক্রিয়।
- [x] অ্যাডমিন মেসেজ ইনবক্স ইন্টারফেস বিদ্যমান।
- [ ] রিমোট Supabase-এ কাস্টম SMTP কনফিগারেশন ভেরিফিকেশন (ম্যানুয়াল চেকিং প্রয়োজন)।
- [ ] ডিস্ট্রিবিউটেড রেট লিমিটিং (Upstash Redis) ইন্টিগ্রেশন (হাই-ট্রাফিকের জন্য রিকমেন্ডেড)।
