import React from 'react';
import { Metadata } from 'next';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { createPublicClient } from '@/lib/db/supabase-public';
import { Bell } from 'lucide-react';
import NoticeListClient, { NoticeItem } from './NoticeListClient';

export const revalidate = 60;

export const metadata: Metadata = {
  title: 'নোটিশ ও সাম্প্রতিক বিজ্ঞপ্তি | সাহেরা নায়েব ল্যাবরেটরি হাই স্কুল',
  description: 'সাহেরা নায়েব ল্যাবরেটরি হাই স্কুলের প্রাতিষ্ঠানিক, একাডেমিক ও পরীক্ষা সংক্রান্ত সকল অফিসিয়াল নোটিশ ও বিজ্ঞপ্তি।',
  openGraph: {
    title: 'নোটিশ বোর্ড | সাহেরা নায়েব ল্যাবরেটরি হাই স্কুল',
    description: 'সাহেরা নায়েব ল্যাবরেটরি হাই স্কুলের প্রাতিষ্ঠানিক ও পরীক্ষা সংক্রান্ত সকল অফিসিয়াল নোটিশ।',
  },
};

export default async function PublicNoticesPage() {
  let notices: NoticeItem[] = [];
  let schoolName = 'সাহেরা নায়েব ল্যাবরেটরি হাই স্কুল';
  let fetchError: string | null = null;

  try {
    const supabase = createPublicClient();

    const [schoolRes, noticesRes] = await Promise.all([
      supabase.from('schools').select('name').eq('slug', 'snlhs').limit(1).maybeSingle(),
      supabase
        .from('notices')
        .select('id, title, description, category, pub_date, is_important, attachment_url, attachment_original_name')
        .eq('is_published', true)
        .order('pub_date', { ascending: false })
        .limit(100),
    ]);

    if (schoolRes.data?.name) {
      schoolName = schoolRes.data.name;
    }

    if (noticesRes.error) {
      console.error('Error fetching public notices:', noticesRes.error);
      fetchError = 'তথ্য লোড করতে সমস্যা হয়েছে। অনুগ্রহ করে কিছুক্ষণ পর আবার চেষ্টা করুন।';
    } else if (noticesRes.data) {
      notices = noticesRes.data;
    }
  } catch (err: any) {
    console.error('Exception fetching public notices:', err);
    fetchError = 'তথ্য লোড করতে সমস্যা হয়েছে।';
  }

  return (
    <div
      style={{
        fontFamily: 'var(--font-bengali), var(--font-english)',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: '#f8fafc',
      }}
    >
      {/* Navigation Header */}
      <Navbar activePage="notices" schoolName={schoolName} />

      {/* Hero Banner */}
      <section
        style={{
          backgroundColor: '#0f1d38',
          color: '#ffffff',
          padding: '48px 0',
          borderBottom: '4px solid #c59b27',
        }}
      >
        <div className="container" style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px', textAlign: 'center' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '6px 16px',
              borderRadius: '20px',
              backgroundColor: 'rgba(197, 155, 39, 0.15)',
              color: '#f6d878',
              fontSize: '13px',
              fontWeight: 600,
              marginBottom: '14px',
            }}
          >
            <Bell size={15} />
            <span>অফিসিয়াল নোটিশ বোর্ড</span>
          </div>
          <h1 style={{ fontSize: 'clamp(26px, 4vw, 36px)', fontWeight: 800, margin: '0 0 10px', color: '#ffffff' }}>
            নোটিশ ও সাম্প্রতিক বিজ্ঞপ্তি
          </h1>
          <p style={{ color: '#cbd5e1', fontSize: '15px', maxWidth: '600px', margin: '0 auto' }}>
            সাহেরা নায়েব ল্যাবরেটরি হাই স্কুলের প্রাতিষ্ঠানিক, একাডেমিক ও পরীক্ষা সংক্রান্ত তথ্যাবলী।
          </p>
        </div>
      </section>

      {/* Main Content with Interactive Search & Filter */}
      <main className="container" style={{ maxWidth: '1200px', margin: '0 auto', padding: '36px 20px', flex: 1, width: '100%' }}>
        <NoticeListClient initialNotices={notices} fetchError={fetchError} />
      </main>

      {/* Institutional Footer */}
      <Footer schoolInfo={{ name: schoolName }} />
    </div>
  );
}
