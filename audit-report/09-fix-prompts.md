# কোডিং এজেন্টের জন্য রেডি-টু-ইউজ প্রম্পট (Ready-to-Use Fix Prompts)

**ব্যবহারের নিয়ম:** নিচের প্রম্পটগুলো কপি করে যেকোনো কোডিং এজেন্ট (বা Antigravity AI)-কে দিলে সংশ্লিষ্ট সমস্যাটি স্বয়ংক্রিয়ভাবে সমাধান হয়ে যাবে।

---

## প্রম্পট ১ (P0-1): মিসিং `/admin/reset-password` পেজ তৈরি করা

```markdown
Role: Senior Next.js & Supabase Developer
Task: Create the missing password reset completion page at `app/admin/reset-password/page.tsx`.

Context:
In `app/admin/forgot-password/page.tsx`, users request a reset email pointing to `/admin/reset-password`. However, this page currently does not exist, causing a 404 error when users click the reset link in their email.

Requirements:
1. Create `app/admin/reset-password/page.tsx` as a Client Component (`'use client'`).
2. The page must have the same design language as `app/admin/login/page.tsx` and `app/admin/forgot-password/page.tsx` (using CSS variables like `--primary-900`, `--font-bengali`, etc.).
3. Features:
   - Provide two password fields: "নতুন পাসওয়ার্ড" (New Password) and "পাসওয়ার্ড নিশ্চিত করুন" (Confirm Password).
   - Show/hide password toggle using Lucide icons (`Eye`, `EyeOff`, `Lock`, `KeyRound`).
   - Validate that the password is at least 6 characters long and both passwords match.
   - On submit, call `supabase.auth.updateUser({ password: newPassword })` using `@/lib/db/supabase-client`.
   - On success, display a friendly Bengali success alert and provide a button to navigate to `/admin/login`.
   - Handle and display errors gracefully in Bengali.
4. Ensure `middleware.ts` allows this route as a public admin route (it is already included in `isPublicAdminRoute`).
5. Run `npm run build` after creation to verify zero syntax or build errors.
```

---

## প্রম্পট ২ (P0-2): লগইন ও কন্টাক্ট ফর্মে রেট লিমিটিং এবং সিকিউরিটি গার্ড বসানো

```markdown
Role: Senior Fullstack Security Engineer
Task: Implement rate-limiting protection for the Admin Login and Public Contact actions.

Context:
Currently, `/admin/login` and the server action `submitContactMessage` in `lib/actions/contact-actions.ts` have no rate limiting, leaving them open to brute-force credential stuffing and database spamming.

Requirements:
1. Create an in-memory sliding window rate limiter helper in `lib/utils/rate-limiter.ts` (using client IP / user identifier) or integrate Next.js middleware IP limiting.
2. For `submitContactMessage` in `lib/actions/contact-actions.ts`:
   - Limit submissions to maximum 5 requests per 10 minutes per IP.
   - If exceeded, return `{ success: false, error: 'অতিরিক্ত অনুরোধ পাঠানো হয়েছে। অনুগ্রহ করে কিছুক্ষণ পর আবার চেষ্টা করুন।' }`.
3. In `app/admin/login/page.tsx`:
   - Add client-side cooldown handling (after 5 consecutive failed attempts, disable the submit button for 60 seconds with a countdown timer).
4. Run `npm run build` to ensure all types and build checks pass cleanly.
```

---

## প্রম্পট ৩ (P0-3): কন্টাক্ট সাবমিশনের সাইলেন্ট এরর হ্যান্ডলিং সংশোধন

```markdown
Role: Fullstack TypeScript Engineer
Task: Fix silent error masking in `lib/actions/contact-actions.ts`.

Context:
In `lib/actions/contact-actions.ts`, lines 55-59 log `dbError` to console but still return `success: true` to the caller. This causes users to believe their message was received even if the database insert failed.

Requirements:
1. Open `lib/actions/contact-actions.ts`.
2. Update the database insert block so that if `dbError` occurs:
   - Log the error appropriately.
   - Return `{ success: false, error: 'বার্তা পাঠাতে সমস্যা হয়েছে। অনুগ্রহ করে সরাসরি ফোন নম্বরে যোগাযোগ করুন।' }`.
3. Ensure that `success: true` is ONLY returned when the message is genuinely inserted into `contact_messages` without error.
4. Run `npm run build` to verify correctness.
```

---

## প্রম্পট ৪ (P1-1): অ্যাডমিন প্যানেলে কন্টাক্ট মেসেজ ইনবক্স পেজ তৈরি

```markdown
Role: Fullstack Next.js Developer
Task: Build an Admin Contact Messages viewer at `app/admin/messages/page.tsx` and register it in the admin sidebar.

Context:
Users submit contact messages through the public portal which are saved into the `contact_messages` table, but administrators currently have no UI inside the admin dashboard to read, mark as read, or delete these messages.

Requirements:
1. Create server actions in `lib/actions/contact-actions.ts`:
   - `getAdminContactMessages()`: Fetches messages for `profile.school_id` ordered by `created_at DESC` (requires admin auth verification).
   - `markContactMessageReadAction(id: string, isRead: boolean)`: Toggles read status.
   - `deleteContactMessageAction(id: string)`: Deletes message scoped to `profile.school_id`.
2. Create `app/admin/messages/page.tsx`:
   - Display a clean list/table of contact inquiries (Sender Name, Phone, Email, Subject, Date, Read status).
   - Allow expanding a message to read full text.
   - Include actions to mark as read/unread and delete.
3. Update `app/admin/layout.tsx`:
   - Add `{ name: 'যোগাযোগ বার্তা', href: '/admin/messages', icon: Mail }` to `navItems`.
   - Update `pageTitles` map with `/admin/messages`: 'যোগাযোগ বার্তা'.
4. Run `npm run build` to verify there are no compilation or type errors.
```

---

## প্রম্পট ৫ (P1-2): নোটিশ ও শিক্ষক তালিকায় সার্ভার-সাইড পেজিনেশন ও লিমিট যোগ

```markdown
Role: Senior Next.js & PostgreSQL Developer
Task: Add pagination and limit parameters to notices and teachers server actions.

Context:
Currently `getAdminNotices` and `getAdminTeachers` select all rows without limits. As the school records grow, this will cause memory and performance degradation.

Requirements:
1. In `lib/actions/notices-actions.ts`:
   - Update `getAdminNotices(page = 1, pageSize = 20)` to use `.range((page - 1) * pageSize, page * pageSize - 1)`.
   - Return total count alongside notices for pagination calculation.
2. In `app/admin/notices/page.tsx`:
   - Add a pagination footer component with "পূর্ববর্তী" (Previous) and "পরবর্তী" (Next) controls.
3. Apply the same pagination logic to `lib/actions/teachers-actions.ts` if list exceeds 50 entries.
4. Verify with `npm run build`.
```
