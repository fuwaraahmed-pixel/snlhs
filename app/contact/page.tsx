import React from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { createPublicClient } from '@/lib/db/supabase-public';

export const revalidate = 3600;

export default async function PublicContactPage() {
  let schoolInfo: any = {
    name: 'সাহেরা নায়েব ল্যাবরেটরি হাই স্কুল',
    phone: '01531927956',
    email: 'snlschool07@gmail.com',
    address: 'হবিরবাড়ী, সিড্‌স্টোর বাজার, ভালুকা, ময়মনসিংহ।',
    motto: 'শিক্ষা • শৃঙ্খলা • চরিত্র',
    principal_name: 'নূর মোহাম্মদ সরকার (সাগর)',
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
        motto: settings.motto || schoolInfo.motto,
        principal_name: settings.principal_name || schoolInfo.principal_name,
      };
    }
  } catch (err) {
    console.error('Error fetching contact page data:', err);
  }

  return (
    <div style={{ fontFamily: 'var(--font-bengali), var(--font-english)', minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: 'var(--neutral-50)' }}>
      {/* Header */}
      <Navbar activePage="contact" schoolName={schoolInfo.name} />

      {/* Hero Banner */}
      <section style={{ backgroundColor: 'var(--primary-900)', color: 'var(--white)', padding: 'var(--space-12) 0', textAlign: 'center' }}>
        <div className="container">
          <h2 style={{ fontSize: 'var(--text-3xl)', color: 'var(--white)', marginBottom: 'var(--space-2)' }}>
            📞 যোগাযোগ করুন
          </h2>
          <p style={{ color: 'var(--neutral-200)', maxWidth: '600px', margin: '0 auto' }}>
            যেকোনো তথ্য বা প্রয়োজনে আমাদের সাথে যোগাযোগ করুন।
          </p>
        </div>
      </section>

      {/* Main Content */}
      <main className="container" style={{ padding: 'var(--space-12) 0', flex: 1 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 'var(--space-8)' }}>
          
          {/* Contact Info */}
          <div>
            <div style={{ backgroundColor: 'var(--white)', padding: 'var(--space-8)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--neutral-200)', marginBottom: 'var(--space-6)' }}>
              <h3 style={{ color: 'var(--primary-900)', fontSize: 'var(--text-xl)', marginBottom: 'var(--space-6)', borderBottom: '2px solid var(--accent-gold)', paddingBottom: 'var(--space-2)' }}>
                📋 যোগাযোগের তথ্যাবলী
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--space-4)' }}>
                  <div style={{ width: '44px', height: '44px', backgroundColor: 'var(--primary-100)', borderRadius: 'var(--radius-full)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: '20px' }}>
                    📍
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, color: 'var(--primary-900)', marginBottom: '4px' }}>ঠিকানা</div>
                    <div style={{ color: 'var(--neutral-600)', fontSize: 'var(--text-sm)', lineHeight: '1.6' }}>{schoolInfo.address}</div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--space-4)' }}>
                  <div style={{ width: '44px', height: '44px', backgroundColor: 'var(--primary-100)', borderRadius: 'var(--radius-full)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: '20px' }}>
                    📞
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, color: 'var(--primary-900)', marginBottom: '4px' }}>ফোন নম্বর</div>
                    <a href={`tel:${schoolInfo.phone}`} style={{ color: 'var(--primary-700)', fontSize: 'var(--text-sm)', fontWeight: 600, textDecoration: 'none' }}>
                      {schoolInfo.phone}
                    </a>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--space-4)' }}>
                  <div style={{ width: '44px', height: '44px', backgroundColor: 'var(--primary-100)', borderRadius: 'var(--radius-full)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: '20px' }}>
                    ✉️
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, color: 'var(--primary-900)', marginBottom: '4px' }}>ইমেইল</div>
                    <a href={`mailto:${schoolInfo.email}`} style={{ color: 'var(--primary-700)', fontSize: 'var(--text-sm)', fontWeight: 600, textDecoration: 'none' }}>
                      {schoolInfo.email}
                    </a>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--space-4)' }}>
                  <div style={{ width: '44px', height: '44px', backgroundColor: 'var(--primary-100)', borderRadius: 'var(--radius-full)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: '20px' }}>
                    🕐
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, color: 'var(--primary-900)', marginBottom: '4px' }}>অফিস সময়</div>
                    <div style={{ color: 'var(--neutral-600)', fontSize: 'var(--text-sm)', lineHeight: '1.6' }}>
                      রবি – বৃহস্পতি: সকাল ৮টা – বিকাল ৪টা<br />
                      শুক্র – শনি: বন্ধ
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Principal Contact */}
            <div style={{ backgroundColor: 'var(--primary-900)', padding: 'var(--space-6)', borderRadius: 'var(--radius-lg)', color: 'var(--white)' }}>
              <h4 style={{ color: 'var(--accent-gold)', fontSize: 'var(--text-lg)', marginBottom: 'var(--space-3)' }}>
                🎓 প্রধান শিক্ষকের সাথে যোগাযোগ
              </h4>
              <p style={{ color: 'var(--neutral-200)', fontSize: 'var(--text-sm)', marginBottom: 'var(--space-3)' }}>
                {schoolInfo.principal_name}
              </p>
              <a
                href={`tel:${schoolInfo.phone}`}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 'var(--space-2)',
                  backgroundColor: 'var(--accent-gold)',
                  color: 'var(--primary-900)',
                  padding: 'var(--space-2) var(--space-4)',
                  borderRadius: 'var(--radius-md)',
                  fontWeight: 700,
                  textDecoration: 'none',
                  fontSize: 'var(--text-sm)',
                }}
              >
                📞 এখনই কল করুন
              </a>
            </div>
          </div>

          {/* Map & Message Form */}
          <div>
            {/* Google Maps Embed */}
            <div style={{ backgroundColor: 'var(--white)', padding: 'var(--space-6)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--neutral-200)', marginBottom: 'var(--space-6)' }}>
              <h3 style={{ color: 'var(--primary-900)', fontSize: 'var(--text-lg)', marginBottom: 'var(--space-4)' }}>
                🗺️ আমাদের অবস্থান
              </h3>
              <div style={{ borderRadius: 'var(--radius-md)', overflow: 'hidden', border: '1px solid var(--neutral-200)' }}>
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3637.5!2d90.4!3d24.3!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMjTCsDE4JzAwLjAiTiA5MMKwMjQnMDAuMCJF!5e0!3m2!1sbn!2sbd!4v1234567890"
                  width="100%"
                  height="280"
                  style={{ border: 0, display: 'block' }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="স্কুলের অবস্থান - ভালুকা, ময়মনসিংহ"
                ></iframe>
              </div>
              <p style={{ fontSize: 'var(--text-xs)', color: 'var(--neutral-500)', marginTop: 'var(--space-2)', textAlign: 'center' }}>
                ভালুকা, ময়মনসিংহ, বাংলাদেশ
              </p>
            </div>

            {/* Quick Contact Links */}
            <div style={{ backgroundColor: 'var(--white)', padding: 'var(--space-6)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--neutral-200)' }}>
              <h3 style={{ color: 'var(--primary-900)', fontSize: 'var(--text-lg)', marginBottom: 'var(--space-4)' }}>
                ⚡ দ্রুত যোগাযোগ
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                <a
                  href={`tel:${schoolInfo.phone}`}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 'var(--space-3)',
                    padding: 'var(--space-3) var(--space-4)',
                    backgroundColor: 'var(--neutral-50)',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--neutral-200)',
                    color: 'var(--primary-900)',
                    textDecoration: 'none',
                    fontWeight: 600,
                    fontSize: 'var(--text-sm)',
                    transition: 'background-color 0.2s',
                  }}
                >
                  📞 ফোনে কল করুন: {schoolInfo.phone}
                </a>
                <a
                  href={`mailto:${schoolInfo.email}`}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 'var(--space-3)',
                    padding: 'var(--space-3) var(--space-4)',
                    backgroundColor: 'var(--neutral-50)',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--neutral-200)',
                    color: 'var(--primary-900)',
                    textDecoration: 'none',
                    fontWeight: 600,
                    fontSize: 'var(--text-sm)',
                  }}
                >
                  ✉️ ইমেইল পাঠান: {schoolInfo.email}
                </a>
                <Link
                  href="/notices"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 'var(--space-3)',
                    padding: 'var(--space-3) var(--space-4)',
                    backgroundColor: 'var(--neutral-50)',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--neutral-200)',
                    color: 'var(--primary-900)',
                    textDecoration: 'none',
                    fontWeight: 600,
                    fontSize: 'var(--text-sm)',
                  }}
                >
                  📢 নোটিশ বোর্ড দেখুন
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Institutional Footer */}
      <Footer schoolInfo={schoolInfo} />
    </div>
  );
}
