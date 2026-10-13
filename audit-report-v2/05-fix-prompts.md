# লঞ্চ ব্লকার সমাধান প্রম্পট নির্দেশিকা (Fix Prompts)

এই নথিতে অডিটে চিহ্নিত লঞ্চ ব্লকারগুলোর জন্য সুনির্দিষ্ট, নিরাপদ এবং সংকীর্ণ পরিধির (Narrowly scoped) ফিক্স প্রম্পট প্রদান করা হলো। প্রতিটি প্রম্পট আলাদাভাবে রান করে ব্লকারগুলো অবিলম্বে সমাধান করা যাবে।

---

## প্রম্পট ১: পাসওয়ার্ড রিসেট রাউট মিডলওয়্যার ফিক্স (Fix for BLK-01)

```markdown
Title: Fix password reset middleware redirect loop
Target: middleware.ts

Instruction:
In middleware.ts, when an authenticated user (or a user arriving via a Supabase recovery token session) accesses the `/admin/reset-password` path, the middleware currently redirects them to `/admin/dashboard` because `/admin/reset-password` is classified under `isPublicAdminRoute`. This prevents users from ever setting their new password via recovery links.

Modify ONLY the file:
- middleware.ts

Requirements:
1. Allow authenticated users to view `/admin/reset-password` without automatically redirecting them to `/admin/dashboard`.
2. Keep the redirect to `/admin/dashboard` for other public routes like `/admin/login` and `/admin/forgot-password`.
3. Do not modify any other logic or change any other files.
```

---

## প্রম্পট ২: `contact_messages` মাইগ্রেশন স্ক্রিপ্ট তৈরি (Fix for BLK-02)

```markdown
Title: Add migration file for contact_messages table and RLS
Target: supabase/migrations/20261012000000_create_contact_messages.sql

Instruction:
The codebase has Server Actions in `lib/actions/contact-actions.ts` and an admin UI in `app/admin/messages/page.tsx` that interact with the `public.contact_messages` table. However, no database migration defines this table or its Row Level Security policies.

Create ONLY this new file:
- supabase/migrations/20261012000000_create_contact_messages.sql

Requirements:
1. Define `create table if not exists public.contact_messages` with:
   - `id uuid primary key default gen_random_uuid()`
   - `school_id uuid references public.schools(id) on delete cascade`
   - `name text not null`
   - `phone text not null`
   - `email text`
   - `subject text not null`
   - `message text not null`
   - `is_read boolean default false`
   - `created_at timestamptz default now()`
2. Add index on `school_id`: `create index if not exists idx_contact_messages_school_id on public.contact_messages(school_id);`
3. Enable RLS: `alter table public.contact_messages enable row level security;`
4. Create policies:
   - Public insert policy allowing anonymous site visitors to insert contact inquiries.
   - Admin select policy: `auth.role() = 'authenticated' and school_id = public.current_school_id() and public.current_user_role() = 'admin'`
   - Admin update policy: same admin condition.
   - Admin delete policy: same admin condition.
5. Do not modify any other existing files.
```

---

## প্রম্পট ৩: সিআই/সিডি লিন্টার কনফিগারেশন ফিক্স (Fix for OPS-01)

```markdown
Title: Fix ESLint non-interactive configuration for CI
Target: .eslintrc.json

Instruction:
Running `npm run lint` currently blocks with an interactive terminal prompt asking how to configure ESLint, causing automated CI checks to fail with exit code 1.

Create ONLY this file:
- .eslintrc.json

Requirements:
1. Provide standard Next.js ESLint configuration:
   ```json
   {
     "extends": "next/core-web-vitals"
   }
   ```
2. Confirm `npm run lint` can run cleanly in non-interactive environments without asking user input.
```

---

## প্রম্পট ৪: ডিপেনডেন্সি ভালনারেবিলিটি আপডেট (Fix for SEC-03)

```markdown
Title: Resolve high severity dependency vulnerabilities
Target: package.json / package-lock.json

Instruction:
The command `npm audit --omit=dev` identified 4 runtime vulnerabilities (3 high, 1 moderate) in dependencies `sharp`, `postcss`, `source-map-js`, and `next`.

Action:
Run in terminal:
```bash
npm audit fix
```
Verify that `npm audit --omit=dev` returns 0 high vulnerabilities and `npm run build` continues to pass.
```
