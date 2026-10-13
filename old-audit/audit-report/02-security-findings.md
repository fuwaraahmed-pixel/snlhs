# অ্যাপ্লিকেশন সিকিউরিটি অডিট রিপোর্ট (Application Security Audit — OWASP Top 10 + SaaS)

**অডিটর:** Application Security Engineer (OWASP Specialist)  
**তারিখ:** ৮ অক্টোবর ২০২৬  
**মানদণ্ড:** OWASP Top 10 (2021/2026), Multi-Tenant Data Isolation, Supabase RLS Hardening  

---

## ১. সিকিউরিটি ফাইন্ডিংস সামারি

| ফাইন্ডিং আইডি | তীব্রতা (Severity) | ক্যাটাগরি | শিরোনাম | কনফিডেন্স |
|---|---|---|---|---|
| **SEC-001** | **Critical** | Broken Function Level Auth | রিসেট পাসওয়ার্ড রাউট ও হ্যান্ডলার মিসিং | High |
| **SEC-002** | **High** | Identification and Authentication Failures | ব্রুট-ফোর্স প্রটেকশন ও রেট লিমিটিং অনুপস্থিত | High |
| **SEC-003** | **High** | Security Misconfiguration / Storage | পাবলিক ফাইল আপলোডে ডিপ ম্যাজিক-বাইট চেকের অভাব | Medium |
| **SEC-004** | **Medium** | Security Misconfiguration | ডিপেন্ডেন্সিতে ৮টি হাই সিকিউরিটি ভালনারেবিলিটি | High |
| **SEC-005** | **Medium** | Cryptographic & Secrets Management | `.env.local` ফাইলে প্লেব্যাক পাসওয়ার্ড ও সার্ভিস রোল কি সংরক্ষিত | High |
| **SEC-006** | **Low** | Information Disclosure | আনহ্যান্ডেল্ড এক্সেপশনে কনসোল এরর লিকেজ | Medium |

---

## ২. বিস্তারিত সিকিউরিটি ফাইন্ডিংস (Detailed Findings)

### SEC-001: Missing Password Reset Action Page (`/admin/reset-password` অনুপস্থিত)
- **আইডি:** SEC-001
- **Severity:** Critical
- **Category:** Broken Function Level Auth / Broken Access Control
- **Location:** [app/admin/forgot-password/page.tsx:22](file:///e:/web/app/admin/forgot-password/page.tsx#L22)
- **Description:**  
  পাসওয়ার্ড পুনরুদ্ধারের জন্য ইউজার যখন ইমেইল সাবমিট করেন, তখন সিস্টেম সুপাবেজকে নির্দেশ দেয় ইউজারকে `${window.location.origin}/admin/reset-password` ঠিকানায় রিডাইরেক্ট করতে। কিন্তু সম্পূর্ণ প্রোজেক্টে `/admin/reset-password` ডিরেক্টরি বা কোনো পেজ কম্পোনেন্ট অস্তিত্বহীন। 
- **Evidence:**  
  ```typescript
  // app/admin/forgot-password/page.tsx
  22: const redirectUrl = `${window.location.origin}/admin/reset-password`;
  23: const { error } = await supabase.auth.resetPasswordForEmail(email, {
  24:   redirectTo: redirectUrl,
  25: });
  ```
  প্রজেক্ট স্ট্রাকচারে `app/admin/reset-password` ফোল্ডার পরীক্ষা করা হয়েছে:
  `DirectoryNotFound: e:\web\app\admin\reset-password`
- **Impact:**  
  স্কুল অ্যাডমিন একবার পাসওয়ার্ড ভুলে গেলে এবং রিসেট রিকোয়েস্ট পাঠালে তিনি ইমেইলের লিঙ্কে ক্লিক করে ৪০৪ (Not Found) স্ক্রিনে পৌঁছাবেন। অ্যাকাউন্ট থেকে চিরতরে লক-আউট হওয়ার ঝুঁকি তৈরি হবে।
- **Recommended Fix:**  
  ১. `app/admin/reset-password/page.tsx` তৈরি করতে হবে।  
  ২. সুপাবেজ ইউআরএল হ্যাশ থেকে এক্সেস টোকেন রিড করে `supabase.auth.updateUser({ password: newPassword })` কল করতে হবে।  
  ৩. `middleware.ts`-এ এই পাথটি পাবলিক অ্যাডমিন রাউট হিসেবে সুরক্ষিত রাখতে হবে (যা ইতোমধ্যে যুক্ত আছে)।
- **Confidence:** High

---

### SEC-002: ব্রুট-ফোর্স প্রটেকশন ও রেট লিমিটিং অনুপস্থিত (No Rate Limiting / Anti-Automation)
- **আইডি:** SEC-002
- **Severity:** High
- **Category:** Identification and Authentication Failures / Denial of Service
- **Location:** [app/admin/login/page.tsx:23](file:///e:/web/app/admin/login/page.tsx#L23), [lib/actions/contact-actions.ts:18](file:///e:/web/lib/actions/contact-actions.ts#L18)
- **Description:**  
  লগইন এন্ডপয়েন্ট, পাসওয়ার্ড রিসেট এবং পাবলিক কন্টাক্ট মেসেজ ফর্মের উপর কোনো ইন-মেমোরি বা রিভার্স-প্রক্সি রেট লিমিটিং (e.g., Upstash Redis, Cloudflare Turnstile, বা IP-based sliding window) নেই।
- **Evidence:**  
  ```typescript
  // app/admin/login/page.tsx
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  // কোনো ব্যর্থ চেষ্টার সংখ্যা বা টাইমাউট হ্যান্ডলিং নেই
  ```
- **Impact:**  
  ১. হামলাকারী বট স্ক্রিপ্ট দিয়ে অ্যাডমিন পাসওয়ার্ডের উপর ডিকশনারি বা ক্রেডেনশিয়াল স্টাফিং অ্যাটাক চালাতে পারবে।  
  ২. পাবলিক কন্টাক্ট ফর্মে লাখ লাখ ভুয়ো মেসেজ পাঠিয়ে ডেটাবেস স্টোরেজ স্প্যাম ও সার্ভিস ডিনায়েল ঘটাতে পারে।
- **Recommended Fix:**  
  ১. Next.js মিডলওয়্যারে বা সার্ভার অ্যাকশনে একটি সহজ স্লাইডিং উইন্ডো রেট লিমিটার (IP ভিত্তিক) বসাতে হবে।  
  ২. সুপাবেজ প্রজেক্ট ড্যাশবোর্ডে Auth Rate Limiting সক্রিয় করতে হবে।  
  ৩. কন্টাক্ট ফর্মে Cloudflare Turnstile বা ক্যাপচা ইন্টিগ্রেশন যোগ করতে হবে।
- **Confidence:** High

---

### SEC-003: আপলোডেড ফাইলের শুধু MIME-Type চেক (No Deep Magic Byte Validation)
- **আইডি:** SEC-003
- **Severity:** High
- **Category:** Security Misconfiguration / Unrestricted File Upload
- **Location:** [lib/actions/upload-actions.ts:29-54](file:///e:/web/lib/actions/upload-actions.ts#L29-L54)
- **Description:**  
  সার্ভার অ্যাকশন শুধুমাত্র ক্লায়েন্ট প্রদত্ত `mimeType` এবং ফাইল নামের এক্সটেনশন চেক করে:
  ```typescript
  const allowed = ALLOWED_MIME_TYPES[bucket];
  if (!allowed || !allowed.includes(mimeType)) { ... }
  ```
  ব্রাউজার থেকে যে কেউ রিকোয়েস্ট ইন্টারসেপ্ট করে একটি স্ক্রিপ্ট ফাইলের Content-Type `image/jpeg` বা `application/pdf` হিসেবে পাঠাতে পারে।
- **Impact:**  
  যদি কোনো অ্যাটাকার এক্সিকিউটেবল পে-লোডকে ইমেজ বা পিডিএফ হিসেবে রিনেম করে আপলোড করে এবং কোনো ইউজার তা ডাউনলোড করে এক্সিকিউট করে, ম্যালওয়্যার সংক্রমণের ঝুঁকি বা ক্লায়েন্ট সাইড এক্সএসএস তৈরি হতে পারে।
- **Recommended Fix:**  
  ১. `file-type` বা বাফার-হেডার চেকার ব্যবহার করে ফাইলের প্রথম ১২৮ বাইটের সিগনেচার (Magic Bytes: e.g. `%PDF` for PDF, `FF D8 FF` for JPEG, `89 50 4E 47` for PNG) ভ্যালিডেট করতে হবে।  
  ২. স্টোরেজ বাকেটে `Content-Disposition: attachment` হেডার বাধ্যতামূলক করা যাতে ব্রাউজারে অপ্রত্যাশিত স্ক্রিপ্ট রান না হয়।
- **Confidence:** Medium

---

### SEC-004: ডিপেন্ডেন্সি ভালনারেবিলিটি (Outdated/Vulnerable Packages)
- **আইডি:** SEC-004
- **Severity:** Medium
- **Category:** Vulnerable and Outdated Components
- **Location:** `package.json`, `package-lock.json`
- **Description:**  
  `npm audit` রান করার পর জানা গেছে ৯টি সিকিউরিটি সতর্কতা রয়েছে যার মধ্যে ৮টি **High Severity**।
- **Evidence:**  
  ```
  braces: Stack-exhaustion denial of service through deeply nested patterns (GHSA-vfj7-8cjw-p6xm)
  postcss: Arbitrary file read and information disclosure via sourceMappingURL (GHSA-6g55-p6wh-862q)
  sharp: librsvg vulnerability CVE-2026-96889 (GHSA-wq5f-xc86-pv6w)
  source-map-js: Event-loop DoS through indexed offsets (GHSA-68fv-2mgg-jv7q)
  Total: 9 vulnerabilities (1 moderate, 8 high)
  ```
- **Impact:**  
  সার্ভার-সাইড বিল্ড বা ইমেজ প্রসেসিংয়ের সময় মেমোরি একজশন বা ডস (DoS) হতে পারে।
- **Recommended Fix:**  
  `npm audit fix` কমান্ড রান করে নন-ব্রেকিং প্যাকেজগুলো আপডেট করা।
- **Confidence:** High

---

### SEC-005: সেনসিটিভ ইনিশিয়াল ক্রেডেনশিয়াল লোকাল এনভায়রনমেন্টে উপস্থিত
- **আইডি:** SEC-005
- **Severity:** Medium
- **Category:** Cryptographic Failures & Hardcoded Credentials
- **Location:** `.env.local:8-9`
- **Description:**  
  `.env.local` ফাইলে প্লেব্যাক অ্যাডমিন ইমেইল ও পাসওয়ার্ড প্লেইনটেক্সটে সংরক্ষিত:
  ```env
  INITIAL_ADMIN_EMAIL=snlhs07@gmail.com
  INITIAL_ADMIN_PASSWORD=Furkan@****
  ```
- **Evidence:**  
  যাচাই করা হয়েছে যে এটি `.gitignore`-এ অন্তর্ভুক্ত রয়েছে এবং গিট হিস্টোরিতে কমিট হয়নি (`git log -S` ফলাফল শুন্য)। তবে প্রোডাকশন সিডিং শেষ হওয়ার পর এই ভ্যারিয়েবলগুলো অবিলম্বে অপসারন করা আবশ্যক।
- **Impact:**  
  ডেভেলপমেন্ট মেশিন কম্প্রোমাইজ হলে বা অন্য কাউকে রিপোজিটরি জিপ করে পাঠালে সরাসরি প্রোডাকশন ড্যাশবোর্ডে অননুমোদিত অ্যাক্সেস পাওয়া যাবে।
- **Recommended Fix:**  
  ডাটাবেস মাইগ্রেশন সম্পন্ন হওয়ার পর `.env.local` থেকে প্লেইনটেক্সট পাসওয়ার্ড সরিয়ে ফেলা এবং সুপাবেজ ড্যাশবোর্ড থেকে পাসওয়ার্ড পরিবর্তন করে নেয়া।
- **Confidence:** High

---

## ৩. টেন্যান্ট আইসোলেশন ও RLS রিভিউ

আমরা `supabase/migrations/20261007000000_production_fix_rls_and_storage.sql` ফাইলটি পুঙ্খানুপুঙ্খভাবে অডিট করেছি:
- **School Scoping:** সমস্ত অ্যাকশনে `school_id = current_school_id()` নিশ্চিত করা হয়েছে।
- **Cross-Tenant Leakage Risk:** **Low**। কুয়েরিগুলো সরাসরি RLS পলিসির অধীন হওয়ায় টেন্যান্ট 'A' কখনোই টেন্যান্ট 'B'-এর ডাটা পড়তে বা আপডেট করতে পারবে না।
- **Storage Scoping:** বাকেটের ফোল্ডার স্ট্রাকচার `current_school_id()` দিয়ে প্রটেক্টেড হওয়ায় ক্রস-স্কুল ফাইল ওভাররাইট অসম্ভব।
