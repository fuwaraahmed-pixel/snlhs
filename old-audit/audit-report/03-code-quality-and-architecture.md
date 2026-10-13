# কোড কোয়ালিটি ও আর্কিটেকচার অডিট (Code Quality & Architecture)

**অডিটর:** Principal Software Architect  
**তারিখ:** ৮ অক্টোবর ২০২৬  

---

## ১. আর্কিটেকচারাল প্যাটার্ন ও মূল্যায়ন

### ইতিবাচক দিকসমূহ (Strengths):
1. **App Router & Server Component First:** Next.js 15 আর্কিটেকচার কঠোরভাবে মেনে চলা হয়েছে। বেশিরভাগ পাবলিক পেজ (যেমন `/`, `/about`, `/academics`, `/notices`, `/events`) সার্ভার কম্পোনেন্টে রেন্ডার হচ্ছে এবং দ্রুত পারফরম্যান্স দিচ্ছে।
2. **ভ্যালিডেশন লেয়ার:** Zod স্কিমা (`lib/validation/schemas.ts`) ব্যবহার করে প্রতিটি সার্ভার অ্যাকশনে ইনপুট স্যানিটাইজ করা হয়েছে। কোনো সরাসরি অনিয়ন্ত্রিত পেলোড ডাটাবেসে যায় না।
3. **ক্যাশিং ও রিভ্যালিডেশন:** ডেটা পরিবর্তনের পর `revalidatePath('/admin/...')` এবং `revalidatePath('/...')` সঠিকভাবে কল করে ক্যাশ সিঙ্ক বজায় রাখা হয়েছে।
4. **CSS আর্কিটেকচার:** ভ্যানিলা সিএসএস ডিজাইন টোকেন (`--primary-900`, `--font-bengali`) খুব চমৎকারভাবে ডিফাইন করা হয়েছে।

---

## ২. আর্কিটেকচারাল ফাইন্ডিংস ও টেকনিক্যাল ডেব্ট

| ফাইন্ডিং আইডি | তীব্রতা | শিরোনাম | ফাইল ও লাইন |
|---|---|---|---|
| **ARCH-001** | **Medium** | পাবলিক ও অ্যাডমিন ক্লায়েন্টের ডুয়ালিটি | `lib/db/supabase-public.ts`, `lib/db/supabase-server.ts` |
| **ARCH-002** | **Medium** | কনসোল এরর মাস্কিং ও ফলব্যাক আচরণ | `lib/actions/contact-actions.ts:55` |
| **ARCH-003** | **Low** | ক্লায়েন্ট কম্পোনেন্টে মনোলিথিক স্টেট হ্যান্ডলিং | `app/admin/settings/page.tsx:22-44` |
| **ARCH-004** | **Low** | `next lint` স্ক্রিপ্ট ডেপ্রিকেশন সতর্কতা | `package.json:9` |

---

## ৩. বিস্তারিত বিবরণ (Detailed Findings)

### ARCH-001: একাধিক সুপাবেজ ক্লায়েন্ট ইনস্ট্যান্স ও অথেনটিকেশন স্টেট
- **Location:** [lib/db/supabase-public.ts](file:///e:/web/lib/db/supabase-public.ts), [lib/db/supabase-server.ts](file:///e:/web/lib/db/supabase-server.ts), [lib/db/supabase-client.ts](file:///e:/web/lib/db/supabase-client.ts)
- **Description:**  
  প্রজেক্টে চারটি পৃথক সুপাবেজ ক্লায়েন্ট তৈরি করা হয়েছে:
  - `supabase-server.ts`: কুকি-ভিত্তিক SSR ক্লায়েন্ট (সার্ভার কম্পোনেন্ট ও অ্যাকশনের জন্য)।
  - `supabase-client.ts`: ব্রাউজার সাইড ক্লায়েন্ট।
  - `supabase-public.ts`: নো-কুকি অ্যানোনিমাস ক্লায়েন্ট।
  - `supabase-admin.ts`: সার্ভিস রোল ক্লায়েন্ট।
  পাবলিক পেজগুলোতে কখনো `supabase-public.ts` আবার কোথাও সরাসরি রিকোয়েস্ট কল করা হচ্ছে। এতে পাবলিক ইউজার যদি লগইন অবস্থায় থাকে তবে তার অথ স্টেট পাবলিক পেজে শেয়ার হয় না।
- **Impact:**  
  ক্লিন আর্কিটেকচার তবে মাল্টি-টেন্যান্ট স্লাগ পার্সিং ডাইনামিক করতে গেলে সেন্ট্রালাইজড মিডলওয়্যার কনটেক্সট ব্যবহার করা শ্রেয়।
- **Confidence:** High

---

### ARCH-002: কন্টাক্ট সাবমিশনে সাইলেন্ট ডিবি এরর মাস্কিং
- **Location:** [lib/actions/contact-actions.ts:55-58](file:///e:/web/lib/actions/contact-actions.ts#L55-L58)
- **Description:**  
  কন্টাক্ট মেসেজ ইনসার্ট করার সময় যদি ডাটাবেস টেবিল বা RLS-এ এরর হয়, তা সাইলেন্টলি কনসোলে লক করা হয় এবং ইউজারকে দেখানো হয় যে বার্তাটি সফলভাবে পাঠানো হয়েছে:
  ```typescript
  if (dbError) {
    console.warn('contact_messages table save note:', dbError.message);
    // We don't fail the user experience if table is not yet created in Supabase
  }
  return {
    success: true,
    message: 'আপনার বার্তাটি সফলভাবে পাঠানো হয়েছে।...',
  };
  ```
- **Impact:**  
  যদি প্রোডাকশনে `contact_messages` টেবিলে কোনো পারমিশন ইস্যু থাকে, অভিভাবক ভাববেন স্কুল বার্তা পেয়েছে, কিন্তু আসলে বার্তা ডাটাবেসেই জমা পড়েনি।
- **Recommended Fix:**  
  ডিবি এরর হলে নিশ্চিতভাবে ফলস রিটার্ন করতে হবে এবং ব্যবহারকারীকে সরাসরি ফোনে যোগাযোগ করতে বলতে হবে।
- **Confidence:** High

---

### ARCH-003: সেটিংস পেজে মনোলিথিক স্টেট হ্যান্ডলিং
- **Location:** [app/admin/settings/page.tsx:22-44](file:///e:/web/app/admin/settings/page.tsx#L22-L44)
- **Description:**  
  স্কুল সেটিংসের প্রায় ১৫টি ফিল্ডের জন্য পৃথক পৃথক `useState` হুক কল করা হয়েছে (`name`, `phone`, `email`, `address`, `eiin`, `established`, `principalName`, `heroBadge`, `studentCount` ইত্যাদি)।
- **Impact:**  
  কোড ভারি ও পরিবর্তনযোগ্যতা কঠিন হয়। রি-রেন্ডার অপটিমাইজেশন বাধাগ্রস্ত হয়।
- **Recommended Fix:**  
  একটি ইউনিফাইড স্টেট অবজেক্ট (`formData`) বা React Hook Form ব্যবহার করে কোড ক্লিন করা।
- **Confidence:** Medium

---

### ARCH-004: Next.js 15 Deprecation Warning on `next lint`
- **Location:** [package.json:9](file:///e:/web/package.json#L9)
- **Evidence:**  
  `npm run lint` কমান্ড চালালে টার্মিনালে ওয়ার্নিং আসে:  
  `next lint is deprecated and will be removed in Next.js 16. Use ESLint CLI instead.`
- **Recommended Fix:**  
  `package.json`-এ স্ক্রিপ্ট পরিবর্তন করে `"lint": "eslint ."` এ রূপান্তর করা।
