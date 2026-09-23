# Master Plan — School Website & Admin SaaS (Phase 1: 1–5 Schools)

## Project: Shahera Nayeb Laboratory High School (প্রথম টেন্যান্ট)
## Scope: Production-ready, but scoped for 1–5 schools now, architected so 6+ schools require no restructuring later.

---

# 0. এই ডকুমেন্ট কীভাবে ব্যবহার করবেন

এই প্ল্যানটা Antigravity IDE agent-কে দেওয়ার জন্য বানানো। এজেন্ট কাজ শুরুর আগে নিচের নিয়মগুলো মেনে চলবে:

1. প্রথমে পুরো existing project (HTML/CSS/JS/JSON) inspect করবে।
2. Existing ডিজাইন টোকেন, কম্পোনেন্ট, JSON data structure বুঝে নেবে।
3. এই ডকুমেন্টের Phase অনুযায়ী ধাপে ধাপে কাজ করবে — একসাথে সব বানাবে না।
4. প্রতিটা Phase শেষে `npm run build` + basic manual check চালাবে।
5. Existing পাবলিক ওয়েবসাইটের ভিজ্যুয়াল ডিজাইন ভাঙবে না।
6. কোনো business logic-এ স্কুলের নাম/কালার/কনফিগ হার্ডকোড করবে না — সবকিছু DB/config থেকে আসবে।
7. Security/RLS/tenant isolation-কে কখনো "পরে ঠিক করব" বলে স্কিপ করবে না — এটা Phase 2-তেই বসাতে হবে।
8. স্কোপের বাইরের ফিচার (নিচের "এখন যা বানাচ্ছি না" অংশ) নিজে থেকে যোগ করবে না।

---

# 1. Scope Decision (দুই প্ল্যান মেলানোর ফলাফল)

| বিষয় | সিদ্ধান্ত |
|---|---|
| Tenancy model | Multi-tenant DB (`school_id` + RLS) — **রাখা হচ্ছে**, এটাই ভিত্তি |
| স্কুল সংখ্যা (এখন) | ১–৫টা |
| Domain/subdomain routing | **বাদ**, slug-based route ব্যবহার হবে (`/school/[slug]`) |
| Roles/Permissions টেবিল (dynamic) | **বাদ**, শুধু ২টা রোল enum: `admin`, `viewer` |
| Platform-level `/platform` panel | **বাদ**, আপনি নিজে Supabase dashboard দিয়ে school onboard করবেন |
| Audit logs | **বাদ** (Phase 1-এ), পরে সহজে যোগ করা যাবে কারণ schema তৈরিই আছে |
| Optional future modules (Admissions, Fees, Attendance...) | **সম্পূর্ণ বাদ** |
| Design system | Design tokens (color/font/logo) per school — **রাখা হচ্ছে**; layout variants **বাদ** (Phase 1-এ একটাই লেআউট, শুধু রঙ/লোগো আলাদা) |
| Admin Login (Supabase Auth) | **রাখা হচ্ছে**, পুরোপুরি প্রয়োজনীয় |
| File upload security, validation | **রাখা হচ্ছে** |
| Testing | Manual checklist যথেষ্ট Phase 1-এ, automated test পরে |

---

# 2. Tech Stack

- **Frontend:** Next.js (App Router), React, TypeScript, Server Components (ডিফল্ট), Client Components শুধু interaction লাগলে
- **Backend:** Supabase (PostgreSQL + Auth + Storage)
- **UI:** Existing design system + Tailwind CSS (integrate করা গেলে), Lucide React icons, Bengali-first typography
- **Validation:** Zod (সব server action-এ server-side validation বাধ্যতামূলক)

---

# 3. Database Schema (চূড়ান্ত, সরলীকৃত)

```sql
-- ১. SCHOOLS
schools (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique not null,
  logo_url text,
  favicon_url text,
  primary_color text default '#1e3a8a',
  secondary_color text default '#f59e0b',
  address text,
  phone text,
  email text,
  status text default 'active', -- active | inactive
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ২. PROFILES (auth.users এর সাথে link)
profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  school_id uuid references schools(id) on delete cascade,
  role text not null default 'admin', -- admin | viewer
  name text,
  email text,
  created_at timestamptz default now()
);

-- ৩. NOTICES
notices (
  id uuid primary key default gen_random_uuid(),
  school_id uuid references schools(id) on delete cascade,
  title text not null,
  description text,
  category text,
  pub_date date default current_date,
  attachment_url text,
  attachment_type text,
  is_important boolean default false,
  is_published boolean default false,
  created_by uuid references profiles(id),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ৪. TEACHERS
teachers (
  id uuid primary key default gen_random_uuid(),
  school_id uuid references schools(id) on delete cascade,
  name text not null,
  designation text,
  subject text,
  phone text,
  email text,
  photo_url text,
  biography text,
  display_order int default 0,
  is_published boolean default true,
  created_by uuid references profiles(id),
  updated_at timestamptz default now()
);

-- ৫. EVENTS
events (
  id uuid primary key default gen_random_uuid(),
  school_id uuid references schools(id) on delete cascade,
  title text not null,
  description text,
  event_date date not null,
  start_time time,
  end_time time,
  location text,
  featured_image text,
  is_featured boolean default false,
  is_published boolean default true,
  created_by uuid references profiles(id),
  updated_at timestamptz default now()
);

-- ৬. GALLERY
gallery_albums (
  id uuid primary key default gen_random_uuid(),
  school_id uuid references schools(id) on delete cascade,
  title text not null,
  description text,
  cover_image text,
  is_published boolean default true,
  created_at timestamptz default now()
);

gallery_images (
  id uuid primary key default gen_random_uuid(),
  school_id uuid references schools(id) on delete cascade,
  album_id uuid references gallery_albums(id) on delete cascade,
  image_url text not null,
  caption text,
  display_order int default 0,
  created_at timestamptz default now()
);
```

---

# 4. Row Level Security (RLS) — একটাই প্যাটার্ন, সব টেবিলে reuse

```sql
-- Helper function
create or replace function auth.school_id() returns uuid as $$
  select school_id from profiles where id = auth.uid()
$$ language sql stable;

-- Enable RLS
alter table notices enable row level security;
alter table teachers enable row level security;
alter table events enable row level security;
alter table gallery_albums enable row level security;
alter table gallery_images enable row level security;

-- Admin/Viewer: শুধু নিজের school_id-র ডেটা
create policy "own_school_access" on notices
  for all using (school_id = auth.school_id());

-- (একই policy pattern teachers, events, gallery_albums, gallery_images-এ বসবে)

-- Public visitors: শুধু published কনটেন্ট দেখতে পাবে
create policy "public_read_published" on notices
  for select using (is_published = true);
```

> ⚠️ প্রতিটা টেবিলে এই দুই ধরনের policy (owner access + public published read) বসাতে হবে। কোনো টেবিল বাদ গেলে সেটাই cross-school leak-এর কারণ হবে।

---

# 5. Storage (Supabase Storage)

```
Buckets:
 - school-assets   (logo, favicon)
 - teacher-images
 - gallery-images
 - event-images
 - notice-files

Path pattern (বাধ্যতামূলক):
 /{school_id}/teachers/xxx.jpg
 /{school_id}/gallery/xxx.jpg
 /{school_id}/notices/xxx.pdf
 /{school_id}/events/xxx.jpg
```

Validation rules:
- File type whitelist: JPG, JPEG, PNG, WEBP, PDF, DOCX
- Size limits: Teacher image 5MB, Gallery image 10MB, Notice attachment 10MB
- Server-side MIME + extension check, filename randomize, executable ফাইল reject

---

# 6. Authentication & Authorization

```
/admin/login
/admin/forgot-password
/admin/reset-password
/admin/dashboard
```

- Supabase Auth (email + password)
- Middleware দিয়ে protected route check — session না থাকলে `/admin/login` এ redirect
- Login-এর পর `profile.school_id` অনুযায়ী শুধু সেই স্কুলের ডেটা লোড হবে
- Role check: `admin` (full CRUD) vs `viewer` (read-only) — server action-এ hard-check, শুধু UI-তে hide করলে চলবে না

---

# 7. Admin Panel (Routes + Sidebar)

```
/admin/dashboard
/admin/notices        /admin/notices/new        /admin/notices/[id]
/admin/teachers       /admin/teachers/new        /admin/teachers/[id]
/admin/events         /admin/events/new          /admin/events/[id]
/admin/gallery        /admin/gallery/[id]
/admin/settings       (school name, logo, color, contact info)
```

Dashboard-এ দেখাবে: Total Notices, Published Notices, Total Teachers, Total Events, Gallery Albums + Quick Actions (নতুন নোটিশ/শিক্ষক/ইভেন্ট/অ্যালবাম)।

Users/Audit Logs UI **নেই** — নতুন এডমিন ইউজার আপনি নিজে Supabase Auth dashboard থেকে বানাবেন।

---

# 8. Public Website Integration

```
Supabase → Next.js Server Components → Public Website
```

- Server-side fetch, `revalidatePath()` দিয়ে cache invalidate — admin publish করলে সাথে সাথে সাইটে reflect হবে, কোনো rebuild লাগবে না
- Existing static ডিজাইন (Bengali typography, current visual layout) হুবহু বজায় থাকবে — শুধু ডেটা সোর্স static JSON থেকে Supabase-এ shift হবে
- Route pattern: `/school/[slug]/...` (আপাতত এক স্কুলের জন্য default slug root `/`-এও ম্যাপ করা যাবে)

---

# 9. JSON → Supabase Migration

Existing sources: `teachers.json`, `notices.json`, `events.json`, `gallery.json`, `school.json`

```
JSON → Validate (Zod) → Transform (school_id inject) → Insert into Supabase
```

- একটা ছোট Node/TS স্ক্রিপ্ট বানানো হবে (`scripts/migrate.ts`) যেটা প্রথম স্কুলের সব JSON ডেটা পড়ে Supabase-এ ইনসার্ট করবে
- ম্যানুয়ালি re-type করা হবে না

---

# 10. এখন যা বানাচ্ছি না (স্কোপ থেকে ইচ্ছাকৃতভাবে বাদ — পরে সহজে যোগ হবে কারণ স্কিমা প্রস্তুত থাকবে)

- `/platform` super-admin panel
- Dynamic roles/permissions টেবিল
- Domain/subdomain auto-mapping middleware
- Audit logs UI
- Layout variants / theme presets library
- Admissions, Students, Results, Fees, Attendance মডিউল
- Automated test suite (Playwright/Vitest)

---

# 11. Implementation Phases (Antigravity Agent Order)

## Phase 1 — Foundation
- Next.js + TypeScript + App Router init
- Existing CSS/design tokens migrate
- Project structure (`lib/auth`, `lib/db`, `lib/validation`, `lib/storage`, `lib/services`)
- `.env.local` + `.env.example` সেটআপ (Supabase URL, anon key)

## Phase 2 — Database + RLS (সবচেয়ে গুরুত্বপূর্ণ)
- Section 3-এর সব টেবিল তৈরি
- Section 4-এর RLS policy সব টেবিলে বসানো
- একটা টেস্ট স্কুল (School A) + ডামি টেস্ট স্কুল (School B) বানিয়ে isolation ম্যানুয়ালি ভেরিফাই করা

## Phase 3 — Auth
- Login/logout/password reset
- Middleware দিয়ে route protection
- Role check (admin/viewer) server action লেভেলে

## Phase 4 — Admin Dashboard UI
- Sidebar, header, dashboard stats, responsive layout
- Loading/empty/error states

## Phase 5 — Content CRUD
- Notices, Teachers, Events, Gallery — ফুল CRUD + image upload
- School Settings ফর্ম (নাম/লোগো/কালার/কনট্যাক্ট)

## Phase 6 — Storage
- Buckets তৈরি, upload validation, tenant-aware path

## Phase 7 — Public Website Connect
- সব পাবলিক পেজ Supabase থেকে ডেটা টানবে
- `revalidatePath` ইন্টিগ্রেশন
- ভিজ্যুয়াল প্যারিটি ভেরিফাই (আগের static সাইটের সাথে পাশাপাশি তুলনা)

## Phase 8 — JSON Migration
- Section 9 অনুযায়ী স্ক্রিপ্ট চালিয়ে প্রথম স্কুলের ডেটা import

## Phase 9 — Security Pass
- RLS re-verify (School A ↔ School B cross access ব্যর্থ হওয়া বাধ্যতামূলক)
- No service-role key client-এ leak হচ্ছে না তা চেক
- File upload validation টেস্ট

## Phase 10 — Production Deploy
- Vercel + Supabase production project
- Environment variables production-এ সেট
- Backup: Supabase-এর daily backup enable করা

---

# 12. নতুন স্কুল অনবোর্ড করার প্রসেস (Phase 1 শেষে, আপনার ম্যানুয়াল কাজ)

1. Supabase dashboard → `schools` টেবিলে নতুন row (name, slug, color, logo)
2. Supabase Auth → নতুন admin ইউজার তৈরি
3. `profiles` টেবিলে সেই ইউজারের `school_id` সেট
4. লগইন credential ক্লায়েন্টকে দেওয়া
5. ক্লায়েন্ট নিজেই admin panel দিয়ে notices/teachers/events/gallery ভরবে

**সময় লাগবে: ৫–১০ মিনিট, কোনো কোড পরিবর্তন লাগবে না।**

---

# 13. Definition of Done (Phase 1)

- [ ] Multi-tenant schema + RLS সব টেবিলে কাজ করছে (cross-school access ব্যর্থ হচ্ছে টেস্টে)
- [ ] Admin login/logout/password reset কাজ করছে
- [ ] Notices/Teachers/Events/Gallery — ফুল CRUD + publish/unpublish
- [ ] School Settings থেকে নাম/লোগো/কালার বদলালে সাইটে সাথে সাথে reflect হচ্ছে
- [ ] Public website বিদ্যমান ডিজাইনের সাথে visually মিলছে
- [ ] File upload validated, tenant-aware path-এ storage হচ্ছে
- [ ] `SUPABASE_SERVICE_ROLE_KEY` কোথাও client bundle-এ নেই
- [ ] `npm run build` error ছাড়া সম্পন্ন হচ্ছে
- [ ] দ্বিতীয় ডামি স্কুল বানিয়ে ৫ মিনিটে অনবোর্ড করা গেছে (multi-school reusability প্রমাণিত)

---

# 14. Antigravity Agent-এর জন্য চূড়ান্ত নির্দেশ

1. Section 1 (Scope Decision) অনুযায়ী কাজের সীমানা মেনে চলবে — Section 10-এ যা বাদ দেওয়া হয়েছে তা নিজে থেকে বানাবে না।
2. Phase অর্ডার (Section 11) অনুসরণ করবে, একসাথে সব বানাবে না।
3. Security/RLS (Phase 2) সবার আগে, UI-এর সৌন্দর্যের জন্য এটা স্কিপ/দেরি করবে না।
4. প্রতিটা Phase শেষে build ভেরিফাই করবে।
5. Existing ভিজ্যুয়াল ডিজাইন অক্ষত রাখবে, অহেতুক রিডিজাইন করবে না।
6. স্কুলের নাম/রঙ/কনফিগ কোনো reusable business logic-এ hardcode করবে না।
7. কাজ শেষে Section 13-এর checklist দিয়ে যাচাই করবে।
