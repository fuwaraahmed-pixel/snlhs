# কমান্ড এক্সিকিউশন ও বিল্ড ফলাফল (Raw Command Results)

এই নথিতে অডিট চলাকালীন লোকাল এনভায়রনমেন্টে এক্সিকিউট করা কমান্ডসমূহের প্রকৃত ফলাফল (Actual Results) সংরক্ষিত হলো।

---

## ১. TypeScript কম্পাইলেশন (`npx tsc --noEmit`)

- **কমান্ড:** `powershell -Command "npx tsc --noEmit"`
- **স্ট্যাটাস:** **PASS** (Exit code: 0)
- **এরর সংখ্যা:** 0 টি এরর
- **আউটপুট:**
```text
(কোনো টাইপস্ক্রিপ্ট কম্পাইলেশন বা টাইপিং এরর পাওয়া যায়নি)
```

---

## ২. ESLint ভ্যালিডেশন (`npm run lint`)

- **কমান্ড:** `powershell -Command "npm run lint"`
- **স্ট্যাটাস:** **FAIL** (Exit code: 1 / Interactive prompt blocker)
- **এরর বিবরণ:** Next.js 15 এ `next lint` ইন্টারেক্টিভ কনফিগারেশন প্রম্পট চাইছে এবং `.eslintrc.json` ফাইল অনুপস্থিত থাকায় নন-ইন্টারেক্টিভ মোডে এক্সিকিউট হতে ব্যর্থ হয়েছে।
- **আউটপুট:**
```text
> snlhs-web-portal@1.0.0 lint
> next lint

`next lint` is deprecated and will be removed in Next.js 16.
For new projects, use create-next-app to choose your preferred linter.
For existing projects, migrate to the ESLint CLI:
npx @next/codemod@canary next-lint-to-eslint-cli .

? How would you like to configure ESLint? https://nextjs.org/docs/app/api-reference/config/eslint
❯  Strict (recommended)
   Base
   Cancel ⚠ If you set up ESLint yourself, we recommend adding the Next.js ESLint plugin. See https://nextjs.org/docs/app/api-reference/config/eslint#migrating-existing-config
```

---

## ৩. প্রোডাকশন বিল্ড (`npm run build`)

- **কমান্ড:** `powershell -Command "npm run build"`
- **স্ট্যাটাস:** **PASS** (Exit code: 0)
- **এরর সংখ্যা:** 0 টি এরর
- **বিল্ড সারসংক্ষেপ:** 26/26 পেজ সফলভাবে অপ্টিমাইজড ও স্ট্যাটিকালি প্রি-রেন্ডার হয়েছে।
- **আউটপুট:**
```text
> snlhs-web-portal@1.0.0 build
> next build

   ▲ Next.js 15.5.26
   - Environments: .env.local

   Creating an optimized production build ...
 ✓ Compiled successfully in 21.5s
   Linting and checking validity of types ...
   Collecting page data ...
   Generating static pages (0/26) ...
   Generating static pages (6/26) 
   Generating static pages (12/26) 
   Generating static pages (19/26) 
 ✓ Generating static pages (26/26)
   Finalizing page optimization ...
   Collecting build traces ...

Route (app)                                 Size  First Load JS  Revalidate  Expire
┌ ○ /                                      182 B         177 kB          1m      1y
├ ○ /_not-found                            134 B         103 kB
├ ○ /about                                 200 B         177 kB          1h      1y
├ ○ /academics                             200 B         177 kB          1h      1y
├ ○ /admin/dashboard                     4.29 kB         110 kB
├ ○ /admin/events                        6.66 kB         109 kB
├ ○ /admin/forgot-password               2.23 kB         176 kB
├ ○ /admin/gallery                       6.31 kB         109 kB
├ ○ /admin/login                         2.81 kB         173 kB
├ ○ /admin/messages                      4.89 kB         107 kB
├ ○ /admin/notices                        7.6 kB         178 kB
├ ○ /admin/reset-password                3.17 kB         177 kB
├ ○ /admin/settings                      6.76 kB         109 kB
├ ○ /admin/teachers                      7.26 kB         110 kB
├ ○ /admission                             200 B         177 kB          1h      1y
├ ○ /contact                             2.48 kB         179 kB          1h      1y
├ ○ /events                                200 B         177 kB          1m      1y
├ ○ /gallery                               200 B         177 kB          1m      1y
├ ○ /notices                             3.57 kB         180 kB          1m      1y
├ ○ /privacy-policy                        200 B         177 kB
├ ○ /robots.txt                            134 B         103 kB
├ ○ /sitemap.xml                           134 B         103 kB
├ ○ /teachers                              200 B         177 kB          1m      1y
└ ○ /terms-of-service                      200 B         177 kB
+ First Load JS shared by all             103 kB
  ├ chunks/255-2dbbf79f36f0dfa2.js       46.4 kB
  ├ chunks/4bd1b696-c023c6e3521b1417.js  54.2 kB
  └ other shared chunks (total)          1.99 kB


ƒ Middleware                             93.8 kB

○  (Static)  prerendered as static content
```

---

## ৪. ডিপেনডেন্সি সিকিউরিটি অডিট (`npm audit --omit=dev`)

- **কমান্ড:** `powershell -Command "npm audit --omit=dev"`
- **স্ট্যাটাস:** **FAIL / VULNERABILITIES DETECTED** (Exit code: 1)
- **মোট ভালনারেবিলিটি:** ৪ টি (১টি Moderate, ৩টি High) — রানটাইম প্রোডাকশন প্যাকেজ
- **আউটপুট:**
```text
# npm audit report

next  9.3.4-canary.0 - 16.3.0-preview.10
Severity: moderate
Next.js has cache poisoning of SSG and ISR pages in self-hosted applications - https://github.com/advisories/GHSA-4jqv-mc3x-m676
Next.js has cache poisoning in SSG/ISR rendering that leads to cross-user content substitution and persistent denial of service - https://github.com/advisories/GHSA-mcj8-r9mp-w47p
Depends on vulnerable versions of postcss
fix available via `npm audit fix`
node_modules/next

postcss  <=8.5.22
Severity: high
PostCSS has XSS via Unescaped </style> in its CSS Stringify Output - https://github.com/advisories/GHSA-qx2v-qp2m-jg93
PostCSS: Arbitrary file read and information disclosure via attacker-controlled sourceMappingURL in CSS comments - https://github.com/advisories/GHSA-6g55-p6wh-862q
PostCSS: incomplete fix of GHSA-6g55-p6wh-862q — attacker-controlled sourceMappingURL reads arbitrary .map files when `from` is unset - https://github.com/advisories/GHSA-fxqj-rqcc-2cmp
PostCSS: Path Traversal in Previous Source Map Auto-Loading (sourceMappingURL) leads to Arbitrary .map File Disclosure - https://github.com/advisories/GHSA-r28c-9q8g-f849
fix available via `npm audit fix`
node_modules/postcss

sharp  <0.35.5
Severity: high
sharp : Vulnerability in librsvg dependency CVE-2026-96889 - https://github.com/advisories/GHSA-wq5f-xc86-pv6w
fix available via `npm audit fix`
node_modules/sharp

source-map-js  1.0.0 - 1.2.1
Severity: high
source-map-js allows event-loop denial of service through indexed source-map section offsets - https://github.com/advisories/GHSA-68fv-2mgg-jv7q
fix available via `npm audit fix`
node_modules/source-map-js

4 vulnerabilities (1 moderate, 3 high)

To address all issues, run:
  npm audit fix
```
