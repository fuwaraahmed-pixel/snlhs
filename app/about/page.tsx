import React from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import { createPublicClient } from '@/lib/db/supabase-public';

export default async function PublicAboutPage() {
  let schoolInfo: any = {
    name: 'সাহেরা নায়েব ল্যাবরেটরি হাই স্কুল',
    phone: '01531927956',
    email: 'snlschool07@gmail.com',
    eiin: '138293',
    established: '১৯৯৮',
    board: 'ঢাকা শিক্ষা বোর্ড',
    motto: 'শিক্ষা • শৃঙ্খলা • চরিত্র',
    address: 'হবিরবাড়ী, সিড্‌স্টোর বাজার, ভালুকা, ময়মনসিংহ।',
    principal_name: 'নূর মোহাম্মদ সরকার (সাগর)',
    principal_message: `শিক্ষা শুধু জ্ঞান অর্জনের মাধ্যম নয়; এটি একজন শিক্ষার্থীর চিন্তা, নৈতিকতা, মূল্যবোধ ও ভবিষ্যৎ গঠনের ভিত্তি। আমাদের বিদ্যালয়ের মূল লক্ষ্য হলো প্রতিটি শিক্ষার্থীকে আধুনিক, মানবিক, সৃজনশীল ও দায়িত্বশীল নাগরিক হিসেবে গড়ে তোলা।

বর্তমান বিশ্বের দ্রুত পরিবর্তনশীল বাস্তবতায় শিক্ষার্থীদের একাডেমিক শিক্ষার পাশাপাশি প্রযুক্তি, নৈতিকতা, নেতৃত্ব, সৃজনশীলতা ও মানবিক মূল্যবোধে সমৃদ্ধ হওয়া অত্যন্ত গুরুত্বপূর্ণ। আমরা বিশ্বাস করি, একজন শিক্ষার্থীর প্রতিভা বিকাশের জন্য একটি নিরাপদ, আনন্দময় ও শিক্ষাবান্ধব পরিবেশ অপরিহার্য।`,
  };

  try {
    const supabase = createPublicClient();
    const { data: schoolData } = await supabase
      .from('schools')
      .select('name, phone, email, address, settings')
      .limit(1)
      .single();

    if (schoolData) {
      const settings = schoolData.settings || {};
      schoolInfo = {
        name: schoolData.name || schoolInfo.name,
        phone: schoolData.phone || schoolInfo.phone,
        email: schoolData.email || schoolInfo.email,
        address: schoolData.address || schoolInfo.address,
        eiin: settings.eiin || schoolInfo.eiin,
        established: settings.established || schoolInfo.established,
        board: settings.board || schoolInfo.board,
        motto: settings.motto || schoolInfo.motto,
        principal_name: settings.principal_name || schoolInfo.principal_name,
        principal_message: settings.principal_message || schoolInfo.principal_message,
      };
    }
  } catch (err) {
    console.error('Error fetching about page data:', err);
  }

  return (
    <div style={{ fontFamily: 'var(--font-bengali), var(--font-english)', minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: 'var(--neutral-50)' }}>
      {/* Header */}
      <Navbar activePage="about" schoolName={schoolInfo.name} />

      {/* Hero Banner */}
      <section style={{ backgroundColor: 'var(--primary-900)', color: 'var(--white)', padding: 'var(--space-12) 0', textAlign: 'center' }}>
        <div className="container">
          <h2 style={{ fontSize: 'var(--text-3xl)', color: 'var(--white)', marginBottom: 'var(--space-2)' }}>
            আমাদের কথা ও দৃষ্টিভঙ্গি
          </h2>
          <p style={{ color: 'var(--neutral-200)', maxWidth: '600px', margin: '0 auto' }}>
            সুশৃঙ্খল ও গুণগত মানসম্পন্ন আধুনিক শিক্ষার বিশ্বস্ত ক্ষেত্র।
          </p>
        </div>
      </section>

      {/* Main Content */}
      <main className="container" style={{ padding: 'var(--space-12) 0', flex: 1 }}>
        {/* Principal Message */}
        <div style={{ backgroundColor: 'var(--white)', padding: 'var(--space-8)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--neutral-200)', marginBottom: 'var(--space-8)' }}>
          <h3 style={{ fontSize: 'var(--text-2xl)', color: 'var(--primary-900)', marginBottom: 'var(--space-4)', borderBottom: '2px solid var(--accent-gold)', paddingBottom: 'var(--space-2)' }}>
            💬 প্রধান শিক্ষকের বাণী
          </h3>
          <p style={{ fontSize: 'var(--text-base)', color: 'var(--neutral-800)', lineHeight: '1.8', whiteSpace: 'pre-line', marginBottom: 'var(--space-4)' }}>
            {schoolInfo.principal_message}
          </p>
          <div style={{ fontWeight: 700, color: 'var(--primary-900)', marginTop: 'var(--space-4)' }}>
            {schoolInfo.principal_name}
          </div>
          <div style={{ fontSize: 'var(--text-sm)', color: 'var(--accent-gold-hover)' }}>
            প্রধান শিক্ষক, {schoolInfo.name}
          </div>
        </div>

        {/* Institutional Baseline Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 'var(--space-6)' }}>
          <div style={{ backgroundColor: 'var(--white)', padding: 'var(--space-6)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--neutral-200)' }}>
            <h4 style={{ color: 'var(--primary-900)', fontSize: 'var(--text-lg)', marginBottom: 'var(--space-2)' }}>🎯 আমাদের লক্ষ্য ও উদ্দেশ্য</h4>
            <p style={{ color: 'var(--neutral-700)', fontSize: 'var(--text-sm)', lineHeight: '1.6' }}>
              প্রতিটি শিক্ষার্থীকে সুশিক্ষা, সততা, শৃঙ্খলা ও মানবিক মূল্যবোধে সমৃদ্ধ করে বিশ্বমানের নাগরিক হিসেবে গড়ে তোলা।
            </p>
          </div>

          <div style={{ backgroundColor: 'var(--white)', padding: 'var(--space-6)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--neutral-200)' }}>
            <h4 style={{ color: 'var(--primary-900)', fontSize: 'var(--text-lg)', marginBottom: 'var(--space-2)' }}>🏛️ প্রাতিষ্ঠানিক তথ্য</h4>
            <ul style={{ paddingLeft: '20px', color: 'var(--neutral-700)', fontSize: 'var(--text-sm)', lineHeight: '1.8' }}>
              <li><strong>EIIN:</strong> {schoolInfo.eiin}</li>
              <li><strong>স্থাপিত:</strong> {schoolInfo.established}</li>
              <li><strong>শিক্ষা বোর্ড:</strong> {schoolInfo.board}</li>
              <li><strong>ঠিকানা:</strong> {schoolInfo.address}</li>
            </ul>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer style={{ backgroundColor: 'var(--primary-900)', color: 'var(--neutral-300)', padding: 'var(--space-6) 0', marginTop: 'auto' }}>
        <div className="container" style={{ textAlign: 'center', fontSize: 'var(--text-sm)' }}>
          <p>© ২০২৬ {schoolInfo.name}। সর্বস্বত্ব সংরক্ষিত।</p>
        </div>
      </footer>
    </div>
  );
}
