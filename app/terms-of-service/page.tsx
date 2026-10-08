import React from 'react';
import { Metadata } from 'next';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { FileText } from 'lucide-react';

export const metadata: Metadata = {
  title: 'ব্যবহারের শর্তাবলী | সাহেরা নায়েব ল্যাবরেটরি হাই স্কুল',
  description: 'সাহেরা নায়েব ল্যাবরেটরি হাই স্কুল ওয়েবসাইট ব্যবহারের শর্তাবলী ও নিয়মনীতি।',
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

export default function TermsOfServicePage() {
  return (
    <div style={{ fontFamily: 'var(--font-bengali), var(--font-english)', minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#f8fafc' }}>
      <Navbar schoolName={SCHOOL_NAME} />

      {/* Hero */}
      <section style={{ backgroundColor: '#0f1d38', color: '#fff', padding: '48px 0', borderBottom: '4px solid #c59b27' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px', textAlign: 'center' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '6px 16px', borderRadius: '20px', backgroundColor: 'rgba(197, 155, 39, 0.15)', color: '#f6d878', fontSize: '13px', fontWeight: 600, marginBottom: '14px' }}>
            <FileText size={15} />
            <span>আইনগত তথ্য</span>
          </div>
          <h1 style={{ fontSize: 'clamp(24px, 4vw, 34px)', fontWeight: 800, margin: '0 0 10px', color: '#ffffff' }}>
            ব্যবহারের শর্তাবলী
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
            এই ওয়েবসাইট ব্যবহার করে আপনি এই শর্তাবলীতে সম্মত হচ্ছেন। অনুগ্রহ করে এই শর্তাবলী মনোযোগ সহকারে পড়ুন। আপনি যদি এই শর্তাবলীতে সম্মত না হন, তাহলে এই ওয়েবসাইট ব্যবহার করবেন না।
          </p>

          <div style={sectionStyle}>
            <h2 style={headingStyle}>১. পরিষেবার বিবরণ</h2>
            <p style={paraStyle}>
              {SCHOOL_NAME} একটি সরকারি নিবন্ধিত মাধ্যমিক বিদ্যালয়। আমাদের ওয়েবসাইট (পোর্টাল) নিম্নলিখিত পরিষেবা প্রদান করে:
            </p>
            <ul style={listStyle}>
              <li>স্কুলের নোটিশ ও বিজ্ঞপ্তি প্রকাশ ও প্রদর্শন।</li>
              <li>শিক্ষক, কর্মচারী ও অনুষ্ঠান সম্পর্কিত তথ্য প্রদান।</li>
              <li>অভিভাবক ও শিক্ষার্থীদের সাথে যোগাযোগের সুবিধা।</li>
              <li>অনলাইন ভর্তি সম্পর্কিত তথ্য ও নির্দেশিকা।</li>
            </ul>
          </div>

          <div style={sectionStyle}>
            <h2 style={headingStyle}>২. গ্রহণযোগ্য ব্যবহার</h2>
            <p style={paraStyle}>এই ওয়েবসাইট ব্যবহার করতে গিয়ে আপনি নিম্নলিখিত কাজ করবেন না:</p>
            <ul style={listStyle}>
              <li>কোনো বেআইনি, ক্ষতিকর বা অনৈতিক উদ্দেশ্যে সাইটটি ব্যবহার করা।</li>
              <li>স্বয়ংক্রিয় স্ক্র্যাপার বা বট দিয়ে সাইট থেকে তথ্য সংগ্রহ করা।</li>
              <li>ইচ্ছাকৃতভাবে সার্ভারে অতিরিক্ত লোড তৈরি করার চেষ্টা করা।</li>
              <li>অন্য ব্যবহারকারীর অ্যাকাউন্ট বা তথ্যে অননুমোদিত প্রবেশের চেষ্টা করা।</li>
              <li>মিথ্যা বা বিভ্রান্তিকর তথ্য জমা দেওয়া।</li>
            </ul>
          </div>

          <div style={sectionStyle}>
            <h2 style={headingStyle}>৩. মেধাস্বত্ব ও বিষয়বস্তু</h2>
            <p style={paraStyle}>
              এই ওয়েবসাইটের সকল বিষয়বস্তু — পাঠ্যসামগ্রী, ছবি, লোগো, নকশা ও কোড — {SCHOOL_NAME}-এর সম্পত্তি। পূর্ব লিখিত অনুমতি ছাড়া কোনো বিষয়বস্তু বাণিজ্যিক উদ্দেশ্যে পুনরায় ব্যবহার বা বিতরণ করা নিষিদ্ধ।
            </p>
            <p style={paraStyle}>
              তবে ব্যক্তিগত ও অ-বাণিজ্যিক উদ্দেশ্যে তথ্য পড়া ও সংরক্ষণ করা অনুমোদিত।
            </p>
          </div>

          <div style={sectionStyle}>
            <h2 style={headingStyle}>৪. তৃতীয় পক্ষের লিঙ্ক</h2>
            <p style={paraStyle}>
              আমাদের ওয়েবসাইটে তৃতীয় পক্ষের ওয়েবসাইটের লিঙ্ক থাকতে পারে। এই লিঙ্কগুলো শুধুমাত্র তথ্যের সুবিধার জন্য। তৃতীয় পক্ষের সাইটগুলোর বিষয়বস্তু বা গোপনীয়তা নীতির জন্য আমরা দায়ী নই।
            </p>
          </div>

          <div style={sectionStyle}>
            <h2 style={headingStyle}>৫. দায়বদ্ধতার সীমাবদ্ধতা</h2>
            <p style={paraStyle}>
              আমরা এই ওয়েবসাইটে প্রদত্ত তথ্য সঠিক ও আপডেট রাখার সর্বোচ্চ চেষ্টা করি। তবে নিম্নলিখিত বিষয়ে আমরা কোনো দায় বহন করি না:
            </p>
            <ul style={listStyle}>
              <li>প্রযুক্তিগত ত্রুটির কারণে অস্থায়ী সাইট অনুপলব্ধতা।</li>
              <li>তৃতীয় পক্ষ পরিষেবা (ইন্টারনেট সংযোগ, হোস্টিং) ব্যাহত হওয়া।</li>
              <li>ব্যবহারকারী কর্তৃক প্রদত্ত ভুল তথ্যের ফলে উদ্ভূত সমস্যা।</li>
            </ul>
          </div>

          <div style={sectionStyle}>
            <h2 style={headingStyle}>৬. অ্যাডমিন অ্যাকাউন্ট ও নিরাপত্তা</h2>
            <p style={paraStyle}>
              অ্যাডমিন প্যানেল ব্যবহারকারীরা:
            </p>
            <ul style={listStyle}>
              <li>তাদের লগইন শংসাপত্র (ইমেইল/পাসওয়ার্ড) গোপন রাখতে বাধ্য।</li>
              <li>অ্যাকাউন্টের যেকোনো অননুমোদিত ব্যবহার অবিলম্বে কর্তৃপক্ষকে জানাবেন।</li>
              <li>অ্যাডমিন সুবিধা শুধুমাত্র অনুমোদিত প্রাতিষ্ঠানিক কাজে ব্যবহার করবেন।</li>
            </ul>
          </div>

          <div style={sectionStyle}>
            <h2 style={headingStyle}>৭. পরিবর্তন ও সংশোধন</h2>
            <p style={paraStyle}>
              আমরা যেকোনো সময় এই শর্তাবলী পরিবর্তন করার অধিকার রাখি। পরিবর্তনগুলো এই পেজে প্রকাশ করা হবে এবং কার্যকর তারিখ আপডেট করা হবে। পরিবর্তনের পরেও সাইট ব্যবহার অব্যাহত রাখলে আপনি নতুন শর্তাবলী মেনে নিয়েছেন বলে বিবেচিত হবে।
            </p>
          </div>

          <div style={sectionStyle}>
            <h2 style={headingStyle}>৮. আইন ও বিচারক্ষেত্র</h2>
            <p style={paraStyle}>
              এই শর্তাবলী বাংলাদেশের আইন অনুযায়ী পরিচালিত হবে। যেকোনো বিরোধ বাংলাদেশের উপযুক্ত আদালতে নিষ্পত্তি হবে।
            </p>
          </div>

          <div style={{ ...sectionStyle, marginBottom: 0 }}>
            <h2 style={headingStyle}>৯. যোগাযোগ</h2>
            <p style={paraStyle}>
              এই শর্তাবলী সম্পর্কে কোনো প্রশ্ন থাকলে আমাদের সাথে যোগাযোগ করুন:
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
