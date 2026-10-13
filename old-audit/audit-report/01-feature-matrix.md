# ফিচার ম্যাট্রিক্স ও ফাংশনাল অডিট (Feature Completeness Matrix)

**প্রজেক্ট স্কোপ:** Shahera Nayeb Laboratory High School — Multi-Tenant School Portal & Admin CMS  
**অডিটর:** SaaS Product Manager & QA Lead  
**তারিখ:** ৮ অক্টোবর ২০২৬  

---

## ১. অডিট মেথডোলজি
আমরা কেবল ইউআই বা রাউটের নাম দেখে ফিচার নিশ্চিত করিনি। প্রতিটি ফিচার **Frontend UI -> Server Action / API -> Supabase DB / Storage** পর্যন্ত সম্পূর্ণ ট্রেস করে এর স্ট্যাটাস নির্ধারণ করেছি:
- **Done (সম্পন্ন):** ইউআই, সার্ভার অ্যাকশন এবং ডাটাবেস সম্পূর্ণ সংযুক্ত ও কার্যকর।
- **Partial (আংশিক):** কিছু কাজ হয়েছে, তবে সম্পূর্ণ ফ্লো অসম্পূর্ণ।
- **Stub (স্টাব):** শুধু ইন্টারফেস বা ডামি ফাংশন আছে, আসল কার্যকারিতা নেই।
- **Broken (ত্রুটিযুক্ত):** কোড আছে কিন্তু রানটাইমে বা লজিকে ব্যর্থ হচ্ছে।
- **Missing (অনুপস্থিত):** একটি স্ট্যান্ডার্ড প্রোডাকশন SaaS-এ থাকা উচিত কিন্তু প্রজেক্টে নেই।

---

## ২. মডিউল ভিত্তিক ফিচার ম্যাট্রিক্স টেবিল

| ক্যাটাগরি | ফিচার বিবরণ | স্ট্যাটাস | প্রমাণ (Evidence & Location) | অডিট মন্তব্য ও নোটস |
|---|---|---|---|---|
| **Auth** | অ্যাডমিন ইমেইল/পাসওয়ার্ড লগইন | **Done** | [app/admin/login/page.tsx:23](file:///e:/web/app/admin/login/page.tsx#L23) | Supabase `signInWithPassword` সফলভাবে সেশন তৈরি ও কুকি সেট করছে। |
| **Auth** | অ্যাডমিন লগআউট ফ্লো | **Done** | [app/admin/layout.tsx:74](file:///e:/web/app/admin/layout.tsx#L74) | `supabase.auth.signOut()` সফলভাবে কল হচ্ছে ও রিডাইরেক্ট করছে। |
| **Auth** | পাসওয়ার্ড ভুলে যাওয়া (রিকোয়েস্ট) | **Done** | [app/admin/forgot-password/page.tsx:23](file:///e:/web/app/admin/forgot-password/page.tsx#L23) | সুপাবেজ `resetPasswordForEmail` সফলভাবে ট্রিগার হচ্ছে। |
| **Auth** | পাসওয়ার্ড রিসেট ফর্ম ও আপডেট | **Broken** | [app/admin/forgot-password/page.tsx:22](file:///e:/web/app/admin/forgot-password/page.tsx#L22) | `/admin/reset-password` রাউটে কোনো পেজ বা `updateUser` লজিক নেই। লিঙ্ক ক্লিক করলে ৪০৪ হবে। |
| **Auth** | সেলফ-রেজিস্ট্রেশন / সাইনআপ | **Missing** | Scoped Out | মাস্টারপ্ল্যান অনুযায়ী Phase 1-এ স্কুল অ্যাডমিন শুধুমাত্র সুপারঅ্যাডমিন দ্বারা অনবোর্ড হবে। |
| **Auth** | সোশ্যাল লগইন (Google/OAuth) | **Missing** | N/A | কোনো OAuth কনফিগারেশন নেই। |
| **Auth** | টু-ফ্যাক্টর অথেনটিকেশন (2FA/MFA) | **Missing** | N/A | এসএমএস বা টিওটিপি (TOTP) ভিত্তিক ২এফএ অনুপস্থিত। |
| **Auth** | ইমেইল ভেরিফিকেশন ও ট্র্যাকিং | **Missing** | Supabase Auth Default | ডিফল্ট কনফিগারেশন ছাড়া কাস্টম ইমেইল কনফার্মেশন ট্র্যাকিং নেই। |
| **Multi-Tenancy** | ডাটাবেস লেভেল টেন্যান্ট আইসোলেশন | **Done** | [supabase/migrations/20261007000000_production_fix_rls_and_storage.sql:110](file:///e:/web/supabase/migrations/20261007000000_production_fix_rls_and_storage.sql#L110) | প্রতিটি টেবিলে `school_id = current_school_id()` পলিসি সক্রিয়। |
| **Multi-Tenancy** | স্টোরেজ লেভেল টেন্যান্ট আইসোলেশন | **Done** | [supabase/migrations/20261007000000_production_fix_rls_and_storage.sql:351](file:///e:/web/supabase/migrations/20261007000000_production_fix_rls_and_storage.sql#L351) | ফাইল পাথে `(storage.foldername(name))[1] = current_school_id()` পলিসি প্রযোজ্য। |
| **Multi-Tenancy** | সাব-ডোমেন ভিত্তিক টেন্যান্ট রাউটিং | **Missing** | [master-plan-school-saas.md:29](file:///e:/web/master-plan-school-saas.md#L29) | বর্তমানে ডিফল্ট স্কুল স্লাগ (`snlhs`) হার্ডকোডেড; সাবডোমেন বা ডায়নামিক রাউটিং বাদ দেওয়া হয়েছে। |
| **Multi-Tenancy** | টেন্যান্ট মেম্বার ইনভাইটেশন ও RBAC | **Partial** | [lib/actions/notices-actions.ts:28](file:///e:/web/lib/actions/notices-actions.ts#L28) | শুধু `admin` রোল চেক করা হয়, নতুন স্টাফ ইনভাইট করার ইন্টারফেস নেই। |
| **Billing & SaaS** | সাবস্ক্রিপশন প্ল্যান, পেমেন্ট ও ট্রায়াল | **Missing** | Scoped Out | কোনো পেমেন্ট গেটওয়ে (Stripe / SSLCommerz / bKash) বা বিলিং মডিউল নেই। |
| **CMS - Notices** | নোটিশ তৈরি, সম্পাদন ও ডিলিট (CRUD) | **Done** | [lib/actions/notices-actions.ts:59](file:///e:/web/lib/actions/notices-actions.ts#L59) | সম্পুর্ণ সার্ভার অ্যাকশন এবং রিভ্যালিডেশন পাথসহ কার্যকর। |
| **CMS - Notices** | নোটিশে ফাইল অ্যাটাচমেন্ট ও ডাউনলোড | **Done** | [lib/actions/upload-actions.ts:106](file:///e:/web/lib/actions/upload-actions.ts#L106) | PDF ও Docx আপলোড এবং সুপাবেজ পাবলিক বাকেটে সংরক্ষণ কার্যকর। |
| **CMS - Notices** | নোটিশ পাবলিশ টগল ও গুরুত্বপূর্ণ পিন | **Done** | [lib/actions/notices-actions.ts:200](file:///e:/web/lib/actions/notices-actions.ts#L200) | অ্যাডমিন ড্যাশবোর্ড থেকে তাৎক্ষণিক টগল করা যায়। |
| **CMS - Teachers** | শিক্ষক তালিকা CRUD ও প্রদর্শন | **Done** | [lib/actions/teachers-actions.ts:59](file:///e:/web/lib/actions/teachers-actions.ts#L59) | নাম, পদবি, বিভাগ, ছবি, ডিসপ্লে অর্ডারসহ সম্পূর্ণ ফাংশনাল। |
| **CMS - Teachers** | শিক্ষকের ছবি আপলোড ও অপটিমাইজেশন | **Done** | [lib/actions/upload-actions.ts:61](file:///e:/web/lib/actions/upload-actions.ts#L61) | স্টোরেজ বাকেট আপলোড ও স্বয়ংক্রিয় ক্লিনআপ পাথ লজিক রয়েছে। |
| **CMS - Events** | একাডেমিক ক্যালেন্ডার ও ইভেন্ট CRUD | **Done** | [lib/actions/events-actions.ts:60](file:///e:/web/lib/actions/events-actions.ts#L60) | তারিখ, সময়, লোকেশন ও ফিচারড ছবিসহ পূর্ণাঙ্গ লজিক। |
| **CMS - Gallery** | ফটো গ্যালারি অ্যালবাম ও ছবি ব্যবস্থাপনা | **Done** | [lib/actions/gallery-actions.ts:54](file:///e:/web/lib/actions/gallery-actions.ts#L54) | অ্যালবাম তৈরি, একাধিক ছবি আপলোড ও অ্যালবামের কভার ব্যবস্থাপনা সম্পন্ন। |
| **Settings** | স্কুলের নাম, ঠিকানা, EIIN ও যোগাযোগ তথ্য | **Done** | [lib/actions/settings-actions.ts:60](file:///e:/web/lib/actions/settings-actions.ts#L60) | JSONB সেটিংসে হোমপেজ স্ট্যাটস, হেডমাস্টারের বাণী ইত্যাদি সংরক্ষিত। |
| **Public Site** | ডায়নামিক হোমপেজ ও কাউন্টার | **Done** | [app/page.tsx:47](file:///e:/web/app/page.tsx#L47) | ডিবি থেকে নোটিশ, ইভেন্ট ও স্ট্যাটস সরাসরি ফেচ হচ্ছে। |
| **Public Site** | পাবলিক নোটিশ সার্চ ও ক্যাটাগরি ফিল্টার | **Done** | [app/notices/NoticeListClient.tsx:32](file:///e:/web/app/notices/NoticeListClient.tsx#L32) | তাৎক্ষণিক ক্লায়েন্ট-সাইড ফিল্টারিং ও সার্চিং কার্যকর। |
| **Public Site** | পাবলিক যোগাযোগ ফর্ম (Contact Form) | **Partial** | [lib/actions/contact-actions.ts:41](file:///e:/web/lib/actions/contact-actions.ts#L41) | ফরম ডাটা `contact_messages` টেবিলে ইনসার্ট হয়, কিন্তু অ্যাডমিন প্যানেলে এটি দেখার কোনো ইন্টারফেস নেই! |
| **General** | ৪০৪ এবং গ্লোবাল এরর পেজ | **Done** | [app/not-found.tsx:7](file:///e:/web/app/not-found.tsx#L7), [app/error.tsx:12](file:///e:/web/app/error.tsx#L12) | চমৎকার ডিজাইন ও ইউজার-ফ্রেন্ডলি বাংলা ইন্টারফেস সংযুক্ত। |
| **Compliance** | টার্মস ও প্রাইভেসি পলিসি পেজ | **Missing** | Footer Links | ফুটারে লিংক থাকলেও কোনো পেজ বিদ্যমান নেই। |
| **DevOps/Ops** | অডিট লগিং ও অ্যাক্টিভিটি ট্র্যাকিং | **Missing** | Scoped Out | কে কোন নোটিশ ডিলিট বা এডিট করল তার হিস্ট্রি নেই। |

---

## ৩. অনুপস্থিত প্রধান SaaS ফিচারসমূহ (Missing Standard Features)

একটি কমার্শিয়াল বি২বি (B2B) এডু-টেক SaaS প্ল্যাটফর্মের জন্য নিচের ফিচারগুলো অত্যন্ত প্রয়োজনীয় হলেও বর্তমান কোডবেসে অনুপস্থিত:
1. **কন্টাক্ট মেসেজ ইনবক্স (Contact Inbox in Admin):** অভিভাবক বা দর্শকদের পাঠানো বার্তা দেখার জন্য অ্যাডমিন প্যানেলে কোনো পেজ নেই।
2. **পাসওয়ার্ড রিসেট কমপ্লিশন পেজ (`/admin/reset-password`):** টোকেন ভ্যালিডেট করে নতুন পাসওয়ার্ড সেভ করার ইন্টারফেস অনুপস্থিত।
3. **মাল্টি-স্কুল সুইচিং ইন্টারফেস:** একজন সুপার অ্যাডমিন বা ম্যানেজারের একাধিক স্কুলের মধ্যে পরিবর্তনের সুবিধা নেই।
4. **ইমেইল নোটিফিকেশন ডেলিভারি (Resend / SendGrid):** নতুন বার্তা আসলে বা নোটিশ প্রকাশ হলে কোনো ইমেইল পাঠানো হয় না।
5. **এক্সপোর্ট / ব্যাকআপ অপশন (CSV/Excel Download):** শিক্ষার্থী, শিক্ষক বা নোটিশের তালিকা এক্সপোর্ট করার কোনো ব্যবস্থা নেই।
