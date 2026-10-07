import React from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { createPublicClient } from '@/lib/db/supabase-public';

export const revalidate = 3600;

export const metadata: Metadata = {
  title: 'একাডেমিক কার্যক্রম ও পাঠ্যক্রম | সাহেরা নায়েব ল্যাবরেটরি হাই স্কুল',
  description: 'সাহেরা নায়েব ল্যাবরেটরি হাই স্কুলের শ্রেণি বিন্যাস, পাঠদান পদ্ধতি, বিজ্ঞান-মানবিক-ব্যবসায় শিক্ষা বিভাগ এবং পরীক্ষা মূল্যায়ন সংক্রান্ত তথ্যাবলী।',
  openGraph: {
    title: 'একাডেমিক কার্যক্রম | সাহেরা নায়েব ল্যাবরেটরি হাই স্কুল',
    description: 'জাতীয় শিক্ষাক্রম ও পাঠ্যপুস্তক বোর্ড (NCTB) অনুসৃত পাঠ্যক্রম ও শ্রেণি বিন্যাস।',
  },
};

export default async function PublicAcademicsPage() {
  let schoolName = 'সাহেরা নায়েব ল্যাবরেটরি হাই স্কুল';
  try {
    const supabase = createPublicClient();
    const { data } = await supabase.from('schools').select('name').limit(1).single();
    if (data?.name) schoolName = data.name;
  } catch (err) {
    console.error('Error fetching school name:', err);
  }

  return (
    <div style={{ fontFamily: 'var(--font-bengali), var(--font-english)', minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: 'var(--neutral-50)' }}>
      {/* Header */}
      <Navbar activePage="academics" schoolName={schoolName} />

      {/* Hero Banner */}
      <section style={{ backgroundColor: 'var(--primary-900)', color: 'var(--white)', padding: 'var(--space-12) 0', textAlign: 'center' }}>
        <div className="container">
          <h2 style={{ fontSize: 'var(--text-3xl)', color: 'var(--white)', marginBottom: 'var(--space-2)' }}>
            📚 একাডেমিক কার্যক্রম ও পাঠ্যক্রম
          </h2>
          <p style={{ color: 'var(--neutral-200)' }}>জাতীয় শিক্ষাক্রম ও পাঠ্যপুস্তক বোর্ড (NCTB) অনুসৃত আধুনিক শিক্ষা ব্যবস্থা।</p>
        </div>
      </section>

      {/* Main Content */}
      <main className="container" style={{ padding: 'var(--space-12) 0', flex: 1 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 'var(--space-6)', marginBottom: 'var(--space-8)' }}>
          <div style={{ backgroundColor: 'var(--white)', padding: 'var(--space-6)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--neutral-200)' }}>
            <h3 style={{ color: 'var(--primary-900)', fontSize: 'var(--text-xl)', marginBottom: 'var(--space-3)' }}>🏫 শ্রেণির বিন্যাস</h3>
            <p style={{ color: 'var(--neutral-700)', fontSize: 'var(--text-sm)', lineHeight: '1.6' }}>
              আমাদের বিদ্যালয়ে ষষ্ঠ শ্রেণী থেকে দশম শ্রেণী পর্যন্ত সুশৃঙ্খল ও পাঠবান্ধব পরিবেশে পাঠদান সম্পন্ন করা হয়।
            </p>
          </div>

          <div style={{ backgroundColor: 'var(--white)', padding: 'var(--space-6)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--neutral-200)' }}>
            <h3 style={{ color: 'var(--primary-900)', fontSize: 'var(--text-xl)', marginBottom: 'var(--space-3)' }}>🧪 বিভাগসমূহ (৯ম - ১০ম)</h3>
            <ul style={{ paddingLeft: '20px', color: 'var(--neutral-700)', fontSize: 'var(--text-sm)', lineHeight: '1.8' }}>
              <li><strong>বিজ্ঞান বিভাগ:</strong> পদার্থ বিজ্ঞান, রসায়ন, জীববিজ্ঞান ও উচ্চতর গণিত</li>
              <li><strong>মানবিক বিভাগ:</strong> ইতিহাস, ভূগোল, পৌরনীতি ও অর্থনীতি</li>
              <li><strong>ব্যবসায় শিক্ষা:</strong> হিসাববিজ্ঞান, ব্যবসায় উদ্যোগ ও ফিন্যান্স</li>
            </ul>
          </div>
        </div>

        {/* Examination Rules */}
        <div style={{ backgroundColor: 'var(--white)', padding: 'var(--space-8)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--neutral-200)' }}>
          <h3 style={{ color: 'var(--primary-900)', fontSize: 'var(--text-2xl)', marginBottom: 'var(--space-4)' }}>📝 পরীক্ষা ও মূল্যায়ন পদ্ধতি</h3>
          <p style={{ color: 'var(--neutral-700)', fontSize: 'var(--text-sm)', lineHeight: '1.8' }}>
            বছরে দুটি প্রধান পরীক্ষা (অর্ধ-বার্ষিক ও বার্ষিক পরীক্ষা) ছাড়াও ধারাবাহিক মূল্যায়নের অংশ হিসেবে প্রতি মাসে ক্লাস টেস্ট ও মডেল টেস্ট গ্রহণ করা হয়। পরীক্ষার সময়সূচী ও রুটিন যথাসময়ে নোটিশ বোর্ডে প্রকাশ করা হয়।
          </p>
        </div>
      </main>

      {/* Institutional Footer */}
      <Footer schoolInfo={{ name: schoolName }} />
    </div>
  );
}
