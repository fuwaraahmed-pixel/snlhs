import React from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { createPublicClient } from '@/lib/db/supabase-public';
import { MapPin, Phone, Mail, Clock, GraduationCap, ChevronRight, MessageSquare } from 'lucide-react';
import ContactFormClient from './ContactFormClient';

export const revalidate = 3600;

export const metadata: Metadata = {
  title: 'যোগাযোগ | সাহেরা নায়েব ল্যাবরেটরি হাই স্কুল',
  description: 'সাহেরা নায়েব ল্যাবরেটরি হাই স্কুলের ঠিকানা, ফোন নম্বর, ইমেইল এবং সরাসরি যোগাযোগের ফর্ম।',
  openGraph: {
    title: 'যোগাযোগ ও অবস্থান | সাহেরা নায়েব ল্যাবরেটরি হাই স্কুল',
    description: 'হবিরবাড়ী, সিড্‌স্টোর বাজার, ভালুকা, ময়মনসিংহ। যোগাযোগের নম্বর: 01531927956',
  },
};

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
      .maybeSingle();

    if (schoolData) {
      const settings = (schoolData.settings as any) || {};
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
    <div
      style={{
        fontFamily: 'var(--font-bengali), var(--font-english)',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: '#f8fafc',
      }}
    >
      {/* Navigation Bar */}
      <Navbar activePage="contact" schoolName={schoolInfo.name} />

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
            <MessageSquare size={15} />
            <span>অফিসিয়াল যোগাযোগ ও সহায়তা</span>
          </div>
          <h1 style={{ fontSize: 'clamp(26px, 4vw, 36px)', fontWeight: 800, margin: '0 0 10px', color: '#ffffff' }}>
            যোগাযোগ করুন
          </h1>
          <p style={{ color: '#cbd5e1', fontSize: '15px', maxWidth: '600px', margin: '0 auto' }}>
            ভর্তি তথ্য, একাডেমিক পরামর্শ বা যেকোনো প্রয়োজনে আমাদের সাথে যোগাযোগ করুন।
          </p>
        </div>
      </section>

      {/* Main Content Area */}
      <main className="container" style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 20px', flex: 1, width: '100%' }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '32px',
          }}
        >
          {/* Left Column: Direct Info & Principal Card */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* Contact Details Card */}
            <div
              style={{
                backgroundColor: '#ffffff',
                padding: '30px',
                borderRadius: '16px',
                border: '1px solid #e2e8f0',
                boxShadow: '0 4px 15px rgba(0, 0, 0, 0.04)',
              }}
            >
              <h2
                style={{
                  color: '#0f1d38',
                  fontSize: '19px',
                  fontWeight: 700,
                  marginBottom: '20px',
                  borderBottom: '2px solid #c59b27',
                  paddingBottom: '8px',
                }}
              >
                📋 প্রাতিষ্ঠানিক যোগাযোগের তথ্য
              </h2>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {/* Address */}
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
                  <div
                    style={{
                      width: '44px',
                      height: '44px',
                      backgroundColor: '#eff6ff',
                      color: '#1b365d',
                      borderRadius: '10px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <MapPin size={22} />
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, color: '#0f1d38', fontSize: '14px', marginBottom: '3px' }}>
                      বিদ্যালয়ের ঠিকানা
                    </div>
                    <div style={{ color: '#475569', fontSize: '14px', lineHeight: '1.6' }}>
                      {schoolInfo.address}
                    </div>
                  </div>
                </div>

                {/* Phone */}
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
                  <div
                    style={{
                      width: '44px',
                      height: '44px',
                      backgroundColor: '#eff6ff',
                      color: '#1b365d',
                      borderRadius: '10px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <Phone size={22} />
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, color: '#0f1d38', fontSize: '14px', marginBottom: '3px' }}>
                      ফোন নম্বর
                    </div>
                    <a
                      href={`tel:${schoolInfo.phone}`}
                      style={{ color: '#1b365d', fontSize: '15px', fontWeight: 700, textDecoration: 'none' }}
                    >
                      {schoolInfo.phone}
                    </a>
                  </div>
                </div>

                {/* Email */}
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
                  <div
                    style={{
                      width: '44px',
                      height: '44px',
                      backgroundColor: '#eff6ff',
                      color: '#1b365d',
                      borderRadius: '10px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <Mail size={22} />
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, color: '#0f1d38', fontSize: '14px', marginBottom: '3px' }}>
                      অফিসিয়াল ইমেইল
                    </div>
                    <a
                      href={`mailto:${schoolInfo.email}`}
                      style={{ color: '#1b365d', fontSize: '14.5px', fontWeight: 600, textDecoration: 'none' }}
                    >
                      {schoolInfo.email}
                    </a>
                  </div>
                </div>

                {/* Office Hours */}
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
                  <div
                    style={{
                      width: '44px',
                      height: '44px',
                      backgroundColor: '#eff6ff',
                      color: '#1b365d',
                      borderRadius: '10px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <Clock size={22} />
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, color: '#0f1d38', fontSize: '14px', marginBottom: '3px' }}>
                      অফিস সময়সূচী
                    </div>
                    <div style={{ color: '#475569', fontSize: '14px', lineHeight: '1.6' }}>
                      রবিবার – বৃহস্পতিবার: সকাল ৮:০০টা – বিকাল ৪:০০টা<br />
                      <span style={{ color: '#94a3b8' }}>শুক্রবার ও শনিবার: সাপ্তাহিক ছুটি</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Principal Contact Card */}
            <div
              style={{
                backgroundColor: '#0f1d38',
                padding: '24px',
                borderRadius: '16px',
                color: '#ffffff',
                borderLeft: '5px solid #c59b27',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                <GraduationCap size={20} color="#f6d878" />
                <h3 style={{ color: '#f6d878', fontSize: '16px', fontWeight: 700, margin: 0 }}>
                  প্রধান শিক্ষকের কার্যালয়
                </h3>
              </div>
              <p style={{ color: '#cbd5e1', fontSize: '14px', marginBottom: '16px', lineHeight: '1.6' }}>
                <strong>{schoolInfo.principal_name}</strong><br />
                সাহেরা নায়েব ল্যাবরেটরি হাই স্কুল
              </p>
              <a
                href={`tel:${schoolInfo.phone}`}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  backgroundColor: '#c59b27',
                  color: '#0f1d38',
                  padding: '10px 18px',
                  borderRadius: '8px',
                  fontWeight: 700,
                  textDecoration: 'none',
                  fontSize: '13.5px',
                }}
              >
                <Phone size={14} />
                <span>সরাসরি কল করুন</span>
              </a>
            </div>

            {/* Google Maps Location */}
            <div
              style={{
                backgroundColor: '#ffffff',
                padding: '20px',
                borderRadius: '16px',
                border: '1px solid #e2e8f0',
              }}
            >
              <h3 style={{ color: '#0f1d38', fontSize: '16px', fontWeight: 700, marginBottom: '12px' }}>
                🗺️ আমাদের ভৌগোলিক অবস্থান
              </h3>
              <div style={{ borderRadius: '10px', overflow: 'hidden', border: '1px solid #e2e8f0' }}>
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3637.5!2d90.4!3d24.3!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMjTCsDE4JzAwLjAiTiA5MMKwMjQnMDAuMCJF!5e0!3m2!1sbn!2sbd!4v1234567890"
                  width="100%"
                  height="220"
                  style={{ border: 0, display: 'block' }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="স্কুলের অবস্থান - হবিরবাড়ী, সিড্‌স্টোর বাজার, ভালুকা, ময়মনসিংহ"
                />
              </div>
              <p style={{ fontSize: '12.5px', color: '#64748b', marginTop: '10px', textAlign: 'center', margin: '10px 0 0' }}>
                হবিরবাড়ী, সিড্‌স্টোর বাজার, ভালুকা, ময়মনসিংহ, বাংলাদেশ
              </p>
            </div>
          </div>

          {/* Right Column: Functional Contact Form & Quick Links */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <ContactFormClient />

            {/* Quick Links Card */}
            <div
              style={{
                backgroundColor: '#ffffff',
                padding: '24px',
                borderRadius: '16px',
                border: '1px solid #e2e8f0',
              }}
            >
              <h4 style={{ color: '#0f1d38', fontSize: '16px', fontWeight: 700, marginBottom: '14px' }}>
                ⚡ গুরুত্বপূর্ণ লিংক
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <Link
                  href="/notices"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px 16px',
                    borderRadius: '8px',
                    backgroundColor: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    color: '#1b365d',
                    fontWeight: 600,
                    fontSize: '14px',
                    textDecoration: 'none',
                  }}
                >
                  <span>📢 সাম্প্রতিক নোটিশ বোর্ড</span>
                  <ChevronRight size={16} />
                </Link>

                <Link
                  href="/teachers"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px 16px',
                    borderRadius: '8px',
                    backgroundColor: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    color: '#1b365d',
                    fontWeight: 600,
                    fontSize: '14px',
                    textDecoration: 'none',
                  }}
                >
                  <span>👨‍🏫 শিক্ষক ও কর্মচারী তালিকা</span>
                  <ChevronRight size={16} />
                </Link>

                <Link
                  href="/events"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px 16px',
                    borderRadius: '8px',
                    backgroundColor: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    color: '#1b365d',
                    fontWeight: 600,
                    fontSize: '14px',
                    textDecoration: 'none',
                  }}
                >
                  <span>🏆 বার্ষিক ইভেন্ট ও অনুষ্ঠানমালা</span>
                  <ChevronRight size={16} />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <Footer schoolInfo={schoolInfo} />
    </div>
  );
}
