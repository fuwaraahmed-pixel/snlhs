import React from 'react';
import { Metadata } from 'next';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { ShieldCheck } from 'lucide-react';

export const metadata: Metadata = {
  title: 'গোপনীয়তা নীতি | সাহেরা নায়েব ল্যাবরেটরি হাই স্কুল',
  description: 'সাহেরা নায়েব ল্যাবরেটরি হাই স্কুল পোর্টালের গোপনীয়তা নীতি এবং তথ্য সংগ্রহ ও ব্যবহার সম্পর্কিত বিবরণ।',
};

const SCHOOL_NAME = 'সাহেরা নায়েব ল্যাবরেটরি হাই স্কুল';
const SCHOOL_EMAIL = 'snlschool07@gmail.com';
const EFFECTIVE_DATE = '০১ জানুয়ারি ২০২৬';

const sectionStyle: React.CSSProperties = {
  marginBottom: '32px',
};

const headingStyle: React.CSSProperties = {
  fontSize: '18px',
  fontWeight: 700,
  color: '#0f1d38',
  marginBottom: '10px',
  borderLeft: '4px solid #c59b27',
  paddingLeft: '12px',
};

const paraStyle: React.CSSProperties = {
  fontSize: '15px',
  color: '#475569',
  lineHeight: 1.8,
  margin: '0 0 10px',
};

const listStyle: React.CSSProperties = {
  paddingLeft: '20px',
  margin: '8px 0',
  color: '#475569',
  fontSize: '15px',
  lineHeight: 1.9,
};

export default function PrivacyPolicyPage() {
  return (
    <div style={{ fontFamily: 'var(--font-bengali), var(--font-english)', minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#f8fafc' }}>
      <Navbar schoolName={SCHOOL_NAME} />

      {/* Hero */}
      <section style={{ backgroundColor: '#0f1d38', color: '#fff', padding: '48px 0', borderBottom: '4px solid #c59b27' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px', textAlign: 'center' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '6px 16px', borderRadius: '20px', backgroundColor: 'rgba(197, 155, 39, 0.15)', color: '#f6d878', fontSize: '13px', fontWeight: 600, marginBottom: '14px' }}>
            <ShieldCheck size={15} />
            <span>আইনগত তথ্য</span>
          </div>
          <h1 style={{ fontSize: 'clamp(24px, 4vw, 34px)', fontWeight: 800, margin: '0 0 10px', color: '#ffffff' }}>
            গোপনীয়তা নীতি
          </h1>
          <p style={{ color: '#cbd5e1', fontSize: '14px' }}>
            কার্যকর তারিখ: {EFFECTIVE_DATE}
          </p>
        </div>
      </section>

      {/* Content */}
      <main style={{ maxWidth: '860px', margin: '0 auto', padding: '48px 20px', flex: 1, width: '100%' }}>
        <div style={{ backgroundColor: '#fff', borderRadius: '14px', padding: '40px 48px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', border: '1px solid #e8eef8' }}>

          <p style={{ ...paraStyle, marginBottom: '28px', color: '#334155' }}>
            {SCHOOL_NAME} ("আমরা", "আমাদের") এই গোপনীয়তা নীতি ("নীতি") আপনার ব্যক্তিগত তথ্য কীভাবে সংগ্রহ, ব্যবহার ও সুরক্ষিত রাখা হয় তা বর্ণনা করে। আমাদের ওয়েবসাইট ব্যবহার করে আপনি এই নীতিতে সম্মত হচ্ছেন।
          </p>

          <div style={sectionStyle}>
            <h2 style={headingStyle}>১. কী তথ্য সংগ্রহ করা হয়</h2>
            <p style={paraStyle}>আমরা নিম্নলিখিত ধরনের তথ্য সংগ্রহ করতে পারি:</p>
            <ul style={listStyle}>
              <li><strong>যোগাযোগ ফর্মের তথ্য:</strong> নাম, ইমেইল ঠিকানা, ফোন নম্বর ও বার্তার বিষয়বস্তু।</li>
              <li><strong>ভর্তি সংক্রান্ত তথ্য:</strong> শিক্ষার্থী ও অভিভাবকের নাম, ঠিকানা এবং প্রাসঙ্গিক শিক্ষাগত তথ্য।</li>
              <li><strong>অটোমেটিক তথ্য:</strong> ব্রাউজার ধরন, IP ঠিকানা ও পেজ ভিজিট লগ (সাইট উন্নতির জন্য)।</li>
            </ul>
          </div>

          <div style={sectionStyle}>
            <h2 style={headingStyle}>২. তথ্য কীভাবে ব্যবহার করা হয়</h2>
            <p style={paraStyle}>সংগৃহীত তথ্য শুধুমাত্র নিচের উদ্দেশ্যে ব্যবহার করা হয়:</p>
            <ul style={listStyle}>
              <li>যোগাযোগ বার্তার জবাব দিতে এবং ভর্তি প্রক্রিয়া সম্পন্ন করতে।</li>
              <li>স্কুলের নোটিশ, ইভেন্ট ও গুরুত্বপূর্ণ তথ্য পৌঁছে দিতে।</li>
              <li>ওয়েবসাইটের কার্যকারিতা উন্নত করতে ও প্রযুক্তিগত সমস্যা সমাধান করতে।</li>
              <li>আইনগত বাধ্যবাধকতা পূরণ করতে।</li>
            </ul>
          </div>

          <div style={sectionStyle}>
            <h2 style={headingStyle}>৩. তথ্য শেয়ার ও তৃতীয় পক্ষ</h2>
            <p style={paraStyle}>
              আমরা আপনার ব্যক্তিগত তথ্য কোনো তৃতীয় পক্ষের কাছে বিক্রি বা ভাড়া দিই না। তবে নিম্নলিখিত ক্ষেত্রে শেয়ার হতে পারে:
            </p>
            <ul style={listStyle}>
              <li><strong>পরিষেবা প্রদানকারী:</strong> আমরা Supabase (ডেটাবেজ হোস্টিং) এবং Vercel (ওয়েব হোস্টিং) ব্যবহার করি, যারা সীমিত পরিসরে ডেটা অ্যাক্সেস করতে পারে।</li>
              <li><strong>আইনি প্রয়োজনীয়তা:</strong> আদালত বা সরকারি কর্তৃপক্ষের বৈধ অনুরোধের পরিপ্রেক্ষিতে।</li>
            </ul>
          </div>

          <div style={sectionStyle}>
            <h2 style={headingStyle}>৪. ডেটা সুরক্ষা</h2>
            <p style={paraStyle}>
              আমরা আপনার তথ্য সুরক্ষিত রাখতে শিল্প-মানের নিরাপত্তা ব্যবস্থা গ্রহণ করেছি, যার মধ্যে রয়েছে:
            </p>
            <ul style={listStyle}>
              <li>HTTPS এনক্রিপশন (সকল যোগাযোগ এনক্রিপ্টেড)।</li>
              <li>Row Level Security (RLS) ডেটাবেজ স্তরে অ্যাক্সেস নিয়ন্ত্রণ।</li>
              <li>পাসওয়ার্ড ও সেশন Supabase Auth এর মাধ্যমে সুরক্ষিতভাবে পরিচালিত।</li>
            </ul>
          </div>

          <div style={sectionStyle}>
            <h2 style={headingStyle}>৫. কুকি ব্যবহার</h2>
            <p style={paraStyle}>
              আমাদের ওয়েবসাইট সেশন ম্যানেজমেন্টের জন্য প্রয়োজনীয় কুকি ব্যবহার করে। এই কুকিগুলো অ্যাডমিন লগইন সেশন বজায় রাখতে ব্যবহৃত হয়। আমরা কোনো বিজ্ঞাপন বা ট্র্যাকিং কুকি ব্যবহার করি না।
            </p>
          </div>

          <div style={sectionStyle}>
            <h2 style={headingStyle}>৬. আপনার অধিকার</h2>
            <p style={paraStyle}>আপনার নিম্নলিখিত অধিকার রয়েছে:</p>
            <ul style={listStyle}>
              <li>আমাদের কাছে থাকা আপনার তথ্য দেখার অনুরোধ করতে পারেন।</li>
              <li>ভুল তথ্য সংশোধনের অনুরোধ করতে পারেন।</li>
              <li>আপনার তথ্য মুছে ফেলার অনুরোধ করতে পারেন (বৈধ কারণ সাপেক্ষে)।</li>
            </ul>
          </div>

          <div style={sectionStyle}>
            <h2 style={headingStyle}>৭. শিশু সুরক্ষা</h2>
            <p style={paraStyle}>
              আমাদের পোর্টাল ১৩ বছরের কম বয়সী শিশুদের কাছ থেকে সচেতনভাবে তথ্য সংগ্রহ করে না। অভিভাবকদের মাধ্যমে প্রদত্ত শিক্ষার্থীদের তথ্য শুধুমাত্র প্রাতিষ্ঠানিক উদ্দেশ্যে ব্যবহৃত হয়।
            </p>
          </div>

          <div style={sectionStyle}>
            <h2 style={headingStyle}>৮. নীতি পরিবর্তন</h2>
            <p style={paraStyle}>
              এই গোপনীয়তা নীতি সময়ে সময়ে আপডেট হতে পারে। যেকোনো উল্লেখযোগ্য পরিবর্তন এই পেজে প্রকাশিত হবে এবং কার্যকর তারিখ আপডেট করা হবে।
            </p>
          </div>

          <div style={{ ...sectionStyle, marginBottom: 0 }}>
            <h2 style={headingStyle}>৯. যোগাযোগ</h2>
            <p style={paraStyle}>
              এই গোপনীয়তা নীতি সম্পর্কে কোনো প্রশ্ন থাকলে আমাদের সাথে যোগাযোগ করুন:
            </p>
            <div style={{ backgroundColor: '#f8fafc', border: '1px solid #e8eef8', borderRadius: '10px', padding: '16px 20px', marginTop: '12px' }}>
              <p style={{ margin: '0 0 6px', fontWeight: 700, color: '#0f1d38' }}>{SCHOOL_NAME}</p>
              <p style={{ margin: '0 0 4px', color: '#475569', fontSize: '14px' }}>হবিরবাড়ী, সিড্‌স্টোর বাজার, ভালুকা, ময়মনসিংহ।</p>
              <p style={{ margin: 0, color: '#475569', fontSize: '14px' }}>
                ইমেইল: <a href={`mailto:${SCHOOL_EMAIL}`} style={{ color: '#1b365d', fontWeight: 600 }}>{SCHOOL_EMAIL}</a>
              </p>
            </div>
          </div>
        </div>
      </main>

      <Footer schoolInfo={{ name: SCHOOL_NAME }} />
    </div>
  );
}
