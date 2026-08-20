# Shahera Nayeb Laboratory High School - Institutional Web Portal

Welcome to the official web repository for **সাহেরা নায়েব ল্যাবরেটরি হাই স্কুল (Shahera Nayeb Laboratory High School)**. This website is a modern, responsive, accessible, and high-performance institutional portal designed to present the school's identity, academic programs, notice updates, faculty directory, event gallery, admission procedures, and campus contact details.

---

## 🌟 Key Features & Site Architecture

### 1. 🏠 Homepage (`index.html`)
- **Top Information Bar**: Quick access to contact numbers, official email, schedule, and key action shortcuts.
- **Header & Navigation**: Sticky responsive navigation with logo integration (`assets/images/logo.png`), accessible mobile menu toggle, and instant online admission CTA.
- **Hero Banner**: Institutional slogan, 2026 admission announcement highlight, and primary CTA buttons.
- **Mission & Vision**: Highlights institutional values and holistic student development philosophy.
- **Principal's Spotlight**: Dedicated statement section for institutional leadership.
- **Key Statistics Counter**: Showcase of total active students, faculty count, pass rate, and legacy.
- **Features Grid**: Multi-card display of multimedia classrooms, labs, library, co-curriculars, and safe campus environment.
- **Notice Board Preview**: Real-time display of recent administrative, examination, and academic notices.
- **Footer**: Full site map, quick links, contact details, copyright, and accessibility statement.

### 2. 📖 About & Institutional Identity (`pages/about.html`)
- School history, mission, vision, and campus facilities.
- Detailed infrastructure showcase (ICT Lab, Science Labs, Library).

### 3. 🎓 Academic Information (`pages/academics.html`)
- Curriculum structure (Junior Secondary & Secondary levels - Science, Humanities, Business Studies).
- Examination evaluation rules & academic calendar breakdown.

### 4. 📢 Notice Board & Download Center (`pages/notices.html`)
- Interactive filterable notice categories (*All, Academic, Exam, Admission, Event*).
- Instant search bar for filtering notices by keyword.
- Dedicated download center for syllabi, class routines, exam schedules, and admission forms.

### 5. 👩‍🏫 Faculty & Staff Directory (`pages/faculty.html`)
- Comprehensive departmental teacher directory (Administration, Science, Humanities, Commerce, Mathematics, English, Bangal).
- Student achievement highlights & academic accolades.

### 6. 🖼️ Events & Photo Gallery (`pages/events-gallery.html`)
- Annual event timeline (National Days, Sports Meet, Science Fair, Cultural Week).
- Interactive category-filtered photo gallery (*All, Events, Campus, Sports, Science*) with built-in Lightbox viewer modal.

### 7. 📝 Admission Portal & Criteria (`pages/admission.html`)
- Class-wise eligibility criteria and required documents checklist.
- 4-step structured admission process.
- Interactive online admission application form with instant client-side validation.
- Frequently Asked Questions (FAQ) interactive accordion.

### 8. 📍 Contact & Location Map (`pages/contact.html`)
- Campus contact cards (Address, Phone, Email, Office Hours).
- Departmental contact directory (Headmaster Office, Accounts, Admission Desk).
- Interactive inquiry submission form.
- Google Maps responsive embedded location frame.

---

## 🎨 Design System & Technologies Used

- **HTML5**: Semantic elements (`<main>`, `<header>`, `<nav>`, `<article>`, `<section>`, `<footer>`).
- **CSS3**: Native CSS variables (`css/variables.css`), clean modular architecture (`css/style.css`, `css/components.css`, `css/responsive.css`), flexbox, CSS grid, smoothly transition animations, and custom scrollbars.
- **JavaScript (Vanilla)**: Lightweight native JS (`js/main.js`) handling mobile menu toggle, sticky header dynamic shadow, interactive notice category filters, client-side search filtering, gallery lightboxes, FAQ accordions, and form validation.
- **Typography**: Google Fonts — **Hind Siliguri** (Primary Bengali typeface) & **Inter** (English numerals & UI elements).
- **SEO & Social Sharing**:
  - Schema.org JSON-LD structured metadata (`@type: EducationalOrganization / School`).
  - OpenGraph & Twitter Cards meta tags on all pages.
  - Canonical URLs and proper heading hierarchies (`<h1>`-`<h6>`).
- **Accessibility (WCAG 2.1 AA Compliant)**:
  - Dynamic skip to main content link (`.skip-link`).
  - Keyboard accessible focus rings (`:focus-visible`).
  - High contrast ratio color palette adhering to standards.
  - ARIA attributes (`aria-expanded`, `aria-label`, `aria-controls`, `role="dialog"`).

---

## 🛠️ Content Replacement & Customization Guide

To update placeholders with actual institutional data before live hosting, replace the placeholder texts across the files:

| Placeholder String | Purpose / Target Data | Files to Update |
| :--- | :--- | :--- |
| `[Official Phone Number]` | School landline / official mobile number | All HTML pages (Top Bar & Footer) |
| `[Official Email]` | Primary official school email address | All HTML pages (Top Bar & Footer) |
| `[School Address Placeholder]` | Physical school campus address | All HTML pages & `pages/contact.html` |
| `[Principal Photo]` / `[Principal Name Placeholder]` | Headmaster image & name | `index.html` & `pages/about.html` |
| `[VALUE]+` / `[VALUE]%` | Exact statistics numbers | `index.html` |
| `[MAP_LATITUDE,MAP_LONGITUDE]` | Map query embed coordinates | `pages/contact.html` |

---

## 🚀 Deployment Guide

1. **Static Hosting Compatibility**:
   - The project consists of standard HTML5, CSS3, and JavaScript files.
   - It can be deployed directly to any static web host, such as **GitHub Pages**, **Netlify**, **Vercel**, **Cloudflare Pages**, or a standard **cPanel / Apache / Nginx** web server.

2. **Folder Structure Overview**:
   ```
   web/
   ├── index.html
   ├── PROJECT_STATUS.md
   ├── README.md
   ├── assets/
   │   ├── icons/
   │   │   └── favicon.png
   │   └── images/
   │       ├── logo.png
   │       └── gallery/
   ├── css/
   │   ├── variables.css
   │   ├── style.css
   │   ├── components.css
   │   └── responsive.css
   ├── js/
   │   └── main.js
   └── pages/
       ├── about.html
       ├── academics.html
       ├── admission.html
       ├── contact.html
       ├── events-gallery.html
       ├── faculty.html
       └── notices.html
   ```

3. **Deployment Steps (e.g., GitHub Pages / Netlify)**:
   - Upload or push the repository root directory.
   - Set `index.html` as the entry page.
   - Ensure HTTPS is enabled for secure schema rendering and location maps.

---

## 📄 License & Attribution

© 2026 **সাহেরা নায়েব ল্যাবরেটরি হাই স্কুল (Shahera Nayeb Laboratory High School)**. All rights reserved.
