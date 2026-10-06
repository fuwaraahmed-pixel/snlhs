import React from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { createPublicClient } from '@/lib/db/supabase-public';
import {
  Users, Award, Calendar, ArrowRight, GraduationCap,
  Laptop, FlaskConical, ShieldCheck, Trophy, Library,
  Bell, Sparkles, ChevronRight, CheckCircle2, Megaphone, School
} from 'lucide-react';

export const revalidate = 60;

export default async function PublicHomePage() {
  // Institutional Defaults
  let schoolInfo = {
    name: 'সাহেরা নায়েব ল্যাবরেটরি হাই স্কুল',
    phone: '01531927956',
    email: 'snlschool07@gmail.com',
    address: 'হবিরবাড়ী, সিড্‌স্টোর বাজার, ভালুকা, ময়মনসিংহ।',
    eiin: '138293',
    established: '১৯৯৮',
    board: 'ঢাকা শিক্ষা বোর্ড',
    motto: 'শিক্ষা • শৃঙ্খলা • চরিত্র',
    principal_name: 'নূর মোহাম্মদ সরকার (সাগর)',
    principal_message: 'শিক্ষা কেবল বইয়ের পাতায় সীমাবদ্ধ নয়, বরং চরিত্র গঠন এবং সামাজিক দায়িত্ববোধ অর্জনের মূল চাবিকাঠি। আমরা প্রতিটি শিক্ষার্থীর অন্তর্নিহিত মেধা ও সৃজনশীলতাকে বিকশিত করে আদর্শ সুনাগরিক গড়ে তুলতে নিরলস কাজ করে যাচ্ছি।',
    hero_badge: '২০২৬ শিক্ষাবর্ষের ভর্তি কার্যক্রম শুরু',
    hero_title: 'মেধা, শৃঙ্খলা ও উন্নত ভবিষ্যতের সঠিক দিশারী',
    hero_subtitle: 'সাহেরা নায়েব ল্যাবরেটরি হাই স্কুল শিক্ষার্থীদের জন্য আধুনিক শিক্ষা, নৈতিক মূল্যবোধ ও সৃজনশীল বিকাশের এক নিরাপদ পরিবেশ গড়ে তুলতে প্রতিশ্রুতিবদ্ধ।',
    announcement: '২০২৬ শিক্ষাবর্ষে ৬ষ্ঠ থেকে ৯ম শ্রেণীতে নতুন শিক্ষার্থী ভর্তির তথ্য এবং আবেদন ফরম উন্মুক্ত করা হয়েছে।',
    stats: {
      students: '১২০০+',
      teachers: '৪৫+',
      passRate: '৯৮%',
      experience: '২৫+',
    }
  };

  let recentNotices: any[] = [];
  let recentEvents: any[] = [];

  try {
    const supabase = createPublicClient();

    // 1. Fetch School Settings
    const { data: schoolData } = await supabase
      .from('schools')
      .select('name, phone, email, address, settings')
      .limit(1)
      .maybeSingle();

    if (schoolData) {
      const st = (schoolData.settings as Record<string, any>) || {};
      schoolInfo.name = schoolData.name || schoolInfo.name;
      schoolInfo.phone = schoolData.phone || schoolInfo.phone;
      schoolInfo.email = schoolData.email || schoolInfo.email;
      schoolInfo.address = schoolData.address || schoolInfo.address;
      schoolInfo.eiin = st.eiin || schoolInfo.eiin;
      schoolInfo.established = st.established || schoolInfo.established;
      schoolInfo.board = st.board || schoolInfo.board;
      schoolInfo.motto = st.motto || schoolInfo.motto;
      schoolInfo.principal_name = st.principal_name || schoolInfo.principal_name;
      schoolInfo.principal_message = st.principal_message || schoolInfo.principal_message;
      schoolInfo.hero_badge = st.hero_badge || schoolInfo.hero_badge;
      schoolInfo.hero_title = st.hero_title || schoolInfo.hero_title;
      schoolInfo.hero_subtitle = st.hero_subtitle || schoolInfo.hero_subtitle;
      schoolInfo.announcement = st.announcement || schoolInfo.announcement;

      if (Array.isArray(st.stats) && st.stats.length > 0) {
        const std = st.stats.find((item: any) => item.id === 'students');
        const tch = st.stats.find((item: any) => item.id === 'teachers');
        const psr = st.stats.find((item: any) => item.id === 'passRate');
        const exp = st.stats.find((item: any) => item.id === 'experience');
        if (std?.value) schoolInfo.stats.students = `${std.value}${std.suffix || '+'}`;
        if (tch?.value) schoolInfo.stats.teachers = `${tch.value}${tch.suffix || '+'}`;
        if (psr?.value) schoolInfo.stats.passRate = `${psr.value}${psr.suffix || '%'}`;
        if (exp?.value) schoolInfo.stats.experience = `${exp.value}${exp.suffix || '+'}`;
      }
    }

    // 2. Fetch Latest Published Notices (Top 4)
    const { data: noticesData } = await supabase
      .from('notices')
      .select('id, title, description, category, pub_date, is_important')
      .eq('is_published', true)
      .order('pub_date', { ascending: false })
      .limit(4);

    if (noticesData) {
      recentNotices = noticesData;
    }

    // 3. Fetch Latest Published Events (Top 3)
    const { data: eventsData } = await supabase
      .from('events')
      .select('id, title, description, event_date, location, featured_image, is_featured')
      .eq('is_published', true)
      .order('event_date', { ascending: false })
      .limit(3);

    if (eventsData) {
      recentEvents = eventsData;
    }
  } catch (err) {
    console.error('Error fetching homepage data:', err);
  }

  // Format Bengali Date parts
  const formatNoticeDate = (dateStr?: string) => {
    if (!dateStr) return { day: '০১', month: 'জানু', full: '' };
    try {
      const d = new Date(dateStr);
      const day = d.toLocaleDateString('bn-BD', { day: 'numeric' });
      const month = d.toLocaleDateString('bn-BD', { month: 'short' });
      const full = d.toLocaleDateString('bn-BD', { year: 'numeric', month: 'long', day: 'numeric' });
      return { day, month, full };
    } catch {
      return { day: '০১', month: 'তারিখ', full: dateStr };
    }
  };

  const getBadgeStyle = (category?: string) => {
    switch (category) {
      case 'ভর্তি': return { bg: '#dbeafe', color: '#1e40af' };
      case 'পরীক্ষা': return { bg: '#fef3c7', color: '#92400e' };
      case 'ইভেন্ট': return { bg: '#dcfce7', color: '#166534' };
      case 'একাডেমিক': return { bg: '#f3e8ff', color: '#6b21a8' };
      default: return { bg: '#e0e7ff', color: '#3730a3' };
    }
  };

  return (
    <div style={{ fontFamily: 'var(--font-bengali), var(--font-english)', minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#f8fafc' }}>
      {/* 01. Dynamic Responsive Navigation Header */}
      <Navbar activePage="home" schoolName={schoolInfo.name} />

      {/* 02. Institutional Hero Section */}
      <section style={{
        background: 'linear-gradient(135deg, #09172e 0%, #152c52 50%, #1b365d 100%)',
        color: '#ffffff',
        padding: '56px 0 64px 0',
        position: 'relative',
        overflow: 'hidden',
        borderBottom: '4px solid #c59b27'
      }}>
        {/* Subtle Decorative Ambient Circles */}
        <div style={{ position: 'absolute', top: '-60px', right: '-60px', width: '300px', height: '300px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(197,155,39,0.15) 0%, rgba(255,255,255,0) 70%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: '-40px', left: '-40px', width: '260px', height: '260px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(27,54,93,0.4) 0%, rgba(255,255,255,0) 70%)', pointerEvents: 'none' }} />

        <div className="container" style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px', position: 'relative', zIndex: 1 }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '40px',
            alignItems: 'center'
          }}>
            {/* Left Content */}
            <div>
              {/* Admission Badge */}
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '6px 14px',
                borderRadius: '30px',
                background: 'rgba(197, 155, 39, 0.15)',
                border: '1px solid rgba(197, 155, 39, 0.4)',
                color: '#f6d878',
                fontSize: '13px',
                fontWeight: 600,
                marginBottom: '18px'
              }}>
                <Sparkles size={14} color="#f6d878" />
                <span>{schoolInfo.hero_badge}</span>
              </div>

              {/* Main Headline */}
              <h1 style={{
                fontSize: 'clamp(28px, 4vw, 42px)',
                fontWeight: 800,
                lineHeight: 1.25,
                color: '#ffffff',
                marginBottom: '16px',
                textShadow: '0 2px 10px rgba(0,0,0,0.3)'
              }}>
                {schoolInfo.hero_title}
              </h1>

              {/* Subtitle */}
              <p style={{
                fontSize: '16px',
                color: '#cbd5e1',
                lineHeight: 1.7,
                marginBottom: '28px',
                maxWidth: '560px'
              }}>
                {schoolInfo.hero_subtitle}
              </p>

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap', alignItems: 'center' }}>
                <Link
                  href="/admission"
                  style={{
                    backgroundColor: '#c59b27',
                    color: '#0f1d38',
                    padding: '12px 26px',
                    borderRadius: '8px',
                    fontWeight: 700,
                    fontSize: '14.5px',
                    textDecoration: 'none',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    boxShadow: '0 4px 14px rgba(197, 155, 39, 0.35)',
                    transition: 'transform 0.15s, background-color 0.15s'
                  }}
                >
                  <GraduationCap size={18} />
                  <span>অনলাইন ভর্তি তথ্য</span>
                </Link>

                <Link
                  href="/about"
                  style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    color: '#ffffff',
                    border: '1px solid rgba(255, 255, 255, 0.3)',
                    padding: '12px 22px',
                    borderRadius: '8px',
                    fontWeight: 600,
                    fontSize: '14.5px',
                    textDecoration: 'none',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    transition: 'background-color 0.15s'
                  }}
                >
                  <span>আমাদের সম্পর্কে</span>
                  <ArrowRight size={15} />
                </Link>

                <Link
                  href="/notices"
                  style={{
                    color: '#f6d878',
                    padding: '12px 16px',
                    fontSize: '14px',
                    fontWeight: 600,
                    textDecoration: 'underline',
                    textUnderlineOffset: '4px'
                  }}
                >
                  নোটিশ বোর্ড
                </Link>
              </div>
            </div>

            {/* Right Quick Notice / Info Card */}
            <div>
              <div style={{
                background: 'rgba(255, 255, 255, 0.07)',
                backdropFilter: 'blur(12px)',
                borderRadius: '16px',
                border: '1px solid rgba(255, 255, 255, 0.16)',
                padding: '28px',
                boxShadow: '0 12px 30px rgba(0, 0, 0, 0.25)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
                  <div style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '8px',
                    background: '#c59b27',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#0f1d38'
                  }}>
                    <Megaphone size={18} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#ffffff', margin: 0 }}>
                      জরুরী ঘোষণা ও আপডেট
                    </h3>
                    <p style={{ fontSize: '11.5px', color: '#cbd5e1', margin: 0 }}>শিক্ষাবর্ষ ২০২৬</p>
                  </div>
                </div>

                <p style={{
                  fontSize: '14px',
                  color: '#e2e8f0',
                  lineHeight: 1.65,
                  marginBottom: '20px',
                  borderLeft: '3px solid #c59b27',
                  paddingLeft: '12px'
                }}>
                  {schoolInfo.announcement}
                </p>

                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                  <Link
                    href="/admission"
                    style={{
                      background: '#ffffff',
                      color: '#0f1d38',
                      padding: '8px 16px',
                      borderRadius: '6px',
                      fontSize: '13px',
                      fontWeight: 700,
                      textDecoration: 'none',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '5px'
                    }}
                  >
                    <span>আবেদন প্রক্রিয়া</span>
                    <ChevronRight size={14} />
                  </Link>
                  <Link
                    href="/notices"
                    style={{
                      background: 'rgba(255,255,255,0.12)',
                      color: '#ffffff',
                      border: '1px solid rgba(255,255,255,0.25)',
                      padding: '8px 16px',
                      borderRadius: '6px',
                      fontSize: '13px',
                      fontWeight: 600,
                      textDecoration: 'none'
                    }}
                  >
                    সকল নোটিশ
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 03. Key Statistics Counter Bar */}
      <section style={{ backgroundColor: '#0f1d38', color: '#ffffff', padding: '36px 0', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
        <div className="container" style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px' }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '24px',
            textAlign: 'center'
          }}>
            {/* Stat 1: Students */}
            <div style={{ padding: '16px', background: 'rgba(255, 255, 255, 0.03)', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '8px' }}>
                <Users size={24} color="#c59b27" />
              </div>
              <div style={{ fontSize: '32px', fontWeight: 800, color: '#c59b27', lineHeight: 1.1, marginBottom: '6px' }}>
                {schoolInfo.stats.students}
              </div>
              <div style={{ fontSize: '13.5px', color: '#cbd5e1', fontWeight: 600 }}>
                বর্তমান শিক্ষার্থী
              </div>
            </div>

            {/* Stat 2: Teachers */}
            <div style={{ padding: '16px', background: 'rgba(255, 255, 255, 0.03)', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '8px' }}>
                <GraduationCap size={24} color="#c59b27" />
              </div>
              <div style={{ fontSize: '32px', fontWeight: 800, color: '#c59b27', lineHeight: 1.1, marginBottom: '6px' }}>
                {schoolInfo.stats.teachers}
              </div>
              <div style={{ fontSize: '13.5px', color: '#cbd5e1', fontWeight: 600 }}>
                অভিজ্ঞ শিক্ষক মণ্ডলী
              </div>
            </div>

            {/* Stat 3: Pass Rate */}
            <div style={{ padding: '16px', background: 'rgba(255, 255, 255, 0.03)', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '8px' }}>
                <Award size={24} color="#c59b27" />
              </div>
              <div style={{ fontSize: '32px', fontWeight: 800, color: '#c59b27', lineHeight: 1.1, marginBottom: '6px' }}>
                {schoolInfo.stats.passRate}
              </div>
              <div style={{ fontSize: '13.5px', color: '#cbd5e1', fontWeight: 600 }}>
                পাসের সাফল্য হার
              </div>
            </div>

            {/* Stat 4: Experience */}
            <div style={{ padding: '16px', background: 'rgba(255, 255, 255, 0.03)', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '8px' }}>
                <Calendar size={24} color="#c59b27" />
              </div>
              <div style={{ fontSize: '32px', fontWeight: 800, color: '#c59b27', lineHeight: 1.1, marginBottom: '6px' }}>
                {schoolInfo.stats.experience}
              </div>
              <div style={{ fontSize: '13.5px', color: '#cbd5e1', fontWeight: 600 }}>
                বছরের গৌরবময় ঐতিহ্য
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 04. Principal's Message Spotlight */}
      <section style={{ padding: '56px 0', backgroundColor: '#ffffff' }}>
        <div className="container" style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 20px' }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '36px',
            alignItems: 'center',
            background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
            padding: '36px',
            borderRadius: '16px',
            border: '1px solid #e2e8f0',
            boxShadow: '0 4px 20px rgba(0,0,0,0.04)'
          }}>
            {/* Principal Photo / Visual Frame */}
            <div style={{ textAlign: 'center' }}>
              <div style={{
                width: '180px',
                height: '180px',
                margin: '0 auto 16px',
                borderRadius: '50%',
                overflow: 'hidden',
                border: '4px solid #c59b27',
                boxShadow: '0 8px 24px rgba(197, 155, 39, 0.25)',
                background: 'linear-gradient(135deg, #1b365d, #0f1d38)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <img
                  src="/assets/images/principal.jpg"
                  alt={schoolInfo.principal_name}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </div>
              <h3 style={{ fontSize: '17px', fontWeight: 700, color: '#0f1d38', margin: '0 0 4px' }}>
                {schoolInfo.principal_name}
              </h3>
              <p style={{ fontSize: '13px', color: '#c59b27', fontWeight: 700, margin: 0 }}>
                প্রধান শিক্ষক, {schoolInfo.name}
              </p>
            </div>

            {/* Principal Quote & Bio */}
            <div>
              <div style={{
                display: 'inline-block',
                background: '#e0f2fe',
                color: '#0369a1',
                padding: '4px 12px',
                borderRadius: '20px',
                fontSize: '12px',
                fontWeight: 700,
                marginBottom: '14px'
              }}>
                প্রধান শিক্ষকের বাণী
              </div>
              <blockquote style={{
                fontSize: '16px',
                lineHeight: 1.75,
                color: '#334155',
                margin: '0 0 20px 0',
                fontStyle: 'italic',
                borderLeft: '4px solid #c59b27',
                paddingLeft: '16px'
              }}>
                "{schoolInfo.principal_message}"
              </blockquote>
              <Link
                href="/about"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  color: '#1b365d',
                  fontWeight: 700,
                  fontSize: '13.5px',
                  textDecoration: 'none'
                }}
              >
                <span>আমাদের ইতিহাস ও বিস্তারিত লক্ষ্য পড়ুন</span>
                <ArrowRight size={15} color="#c59b27" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 05. Key Facilities & Campus Features */}
      <section style={{ padding: '64px 0', backgroundColor: '#f8fafc' }}>
        <div className="container" style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px' }}>
          <div style={{ textAlign: 'center', marginBottom: '44px' }}>
            <span style={{
              display: 'inline-block',
              background: '#fef3c7',
              color: '#92400e',
              padding: '4px 14px',
              borderRadius: '20px',
              fontSize: '12.5px',
              fontWeight: 700,
              marginBottom: '8px'
            }}>
              আমাদের বিশেষত্ব ও সুবিধা
            </span>
            <h2 style={{ fontSize: '28px', fontWeight: 800, color: '#0f1d38', margin: '0 0 8px' }}>
              কেন আমাদের স্কুলে ভর্তি করবেন?
            </h2>
            <p style={{ fontSize: '15px', color: '#64748b', maxWidth: '600px', margin: '0 auto' }}>
              একটি আদর্শ ভবিষ্যৎ গঠনে শিক্ষার্থীদের জন্য আমাদের ক্যাম্পাসের আধুনিক সুবিধাসমূহ
            </p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '24px'
          }}>
            {/* Feature 1 */}
            <div style={{ background: '#ffffff', padding: '28px', borderRadius: '14px', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
              <div style={{ width: '46px', height: '46px', borderRadius: '10px', background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
                <Laptop size={22} color="#1d4ed8" />
              </div>
              <h3 style={{ fontSize: '17px', fontWeight: 700, color: '#0f1d38', marginBottom: '8px' }}>
                আধুনিক মাল্টিমিডিয়া শ্রেণীকক্ষ
              </h3>
              <p style={{ fontSize: '13.5px', color: '#64748b', lineHeight: 1.6, margin: 0 }}>
                প্রজেক্টর ও প্রযুক্তি নির্ভর ভিজ্যুয়াল লার্নিং ব্যবস্থা, যা শিক্ষার্থীদের বিষয়বস্তু সহজে অনুধাবনে সহায়তা করে।
              </p>
            </div>

            {/* Feature 2 */}
            <div style={{ background: '#ffffff', padding: '28px', borderRadius: '14px', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
              <div style={{ width: '46px', height: '46px', borderRadius: '10px', background: '#ecfdf5', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
                <FlaskConical size={22} color="#059669" />
              </div>
              <h3 style={{ fontSize: '17px', fontWeight: 700, color: '#0f1d38', marginBottom: '8px' }}>
                সুসজ্জিত বিজ্ঞানাগার
              </h3>
              <p style={{ fontSize: '13.5px', color: '#64748b', lineHeight: 1.6, margin: 0 }}>
                পদার্থ, রসায়ন এবং জীববিজ্ঞানের আধুনিক ও মানসম্মত যন্ত্রপাতি সমৃদ্ধ সুসজ্জিত ব্যবহারিক ল্যাব।
              </p>
            </div>

            {/* Feature 3 */}
            <div style={{ background: '#ffffff', padding: '28px', borderRadius: '14px', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
              <div style={{ width: '46px', height: '46px', borderRadius: '10px', background: '#f5f3ff', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
                <Library size={22} color="#7c3aed" />
              </div>
              <h3 style={{ fontSize: '17px', fontWeight: 700, color: '#0f1d38', marginBottom: '8px' }}>
                সমৃদ্ধ কেন্দ্রীয় পাঠাগার
              </h3>
              <p style={{ fontSize: '13.5px', color: '#64748b', lineHeight: 1.6, margin: 0 }}>
                সহস্রাধিক জ্ঞানগর্ভ বই, রেফারেন্স গাইড, দৈনিক পত্রিকা এবং মুক্ত জ্ঞানচর্চার সুশৃঙ্খল পরিবেশ।
              </p>
            </div>

            {/* Feature 4 */}
            <div style={{ background: '#ffffff', padding: '28px', borderRadius: '14px', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
              <div style={{ width: '46px', height: '46px', borderRadius: '10px', background: '#fffbeb', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
                <Trophy size={22} color="#b45309" />
              </div>
              <h3 style={{ fontSize: '17px', fontWeight: 700, color: '#0f1d38', marginBottom: '8px' }}>
                সহ-শিক্ষা ও ক্রীড়া কার্যক্রম
              </h3>
              <p style={{ fontSize: '13.5px', color: '#64748b', lineHeight: 1.6, margin: 0 }}>
                বার্ষিক ক্রীড়া প্রতিযোগিতা, বিতর্ক প্রতিযোগিতা, বিজ্ঞান ক্লাব, স্কাউটিং ও সাংস্কৃতিক চর্চা।
              </p>
            </div>

            {/* Feature 5 */}
            <div style={{ background: '#ffffff', padding: '28px', borderRadius: '14px', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
              <div style={{ width: '46px', height: '46px', borderRadius: '10px', background: '#fef2f2', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
                <ShieldCheck size={22} color="#dc2626" />
              </div>
              <h3 style={{ fontSize: '17px', fontWeight: 700, color: '#0f1d38', marginBottom: '8px' }}>
                সিসিটিভি ও নিরাপদ ক্যাম্পাস
              </h3>
              <p style={{ fontSize: '13.5px', color: '#64748b', lineHeight: 1.6, margin: 0 }}>
                ২৪ ঘণ্টা সিসিটিভি ক্যামেরা নজরদারি, সুদৃঢ় ফটক এবং নিরাপদ, রাজনীতিমুক্ত শান্ত শিক্ষা পরিবেশ।
              </p>
            </div>

            {/* Feature 6 */}
            <div style={{ background: '#ffffff', padding: '28px', borderRadius: '14px', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
              <div style={{ width: '46px', height: '46px', borderRadius: '10px', background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
                <Users size={22} color="#0284c7" />
              </div>
              <h3 style={{ fontSize: '17px', fontWeight: 700, color: '#0f1d38', marginBottom: '8px' }}>
                অভিজ্ঞ ও নিবেদিত শিক্ষক
              </h3>
              <p style={{ fontSize: '13.5px', color: '#64748b', lineHeight: 1.6, margin: 0 }}>
                বিশ্ববিদ্যালয় ও বিএড ডিগ্রিধারী প্রশিক্ষণপ্রাপ্ত শিক্ষকদের নিবিড় পাঠদান ও অভিভাবক যোগাযোগ।
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 06. Live Recent Notices Grid */}
      <section style={{ padding: '60px 0', backgroundColor: '#ffffff', borderTop: '1px solid #e2e8f0' }}>
        <div className="container" style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px' }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-end',
            marginBottom: '32px',
            flexWrap: 'wrap',
            gap: '16px'
          }}>
            <div>
              <span style={{
                display: 'inline-block',
                background: '#e0e7ff',
                color: '#3730a3',
                padding: '4px 12px',
                borderRadius: '20px',
                fontSize: '12px',
                fontWeight: 700,
                marginBottom: '6px'
              }}>
                নোটিশ ও বিজ্ঞপ্তি
              </span>
              <h2 style={{ fontSize: '26px', fontWeight: 800, color: '#0f1d38', margin: 0 }}>
                সর্বশেষ নোটিশ ও ঘোষণা
              </h2>
            </div>
            <Link
              href="/notices"
              style={{
                color: '#1b365d',
                fontWeight: 700,
                fontSize: '14px',
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <span>সকল নোটিশ দেখুন</span>
              <ArrowRight size={15} color="#c59b27" />
            </Link>
          </div>

          {recentNotices.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', background: '#f8fafc', borderRadius: '12px', border: '1px dashed #cbd5e1' }}>
              <Bell size={32} color="#94a3b8" style={{ margin: '0 auto 12px' }} />
              <p style={{ color: '#64748b', margin: 0 }}>বর্তমানে কোনো নতুন নোটিশ নেই।</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {recentNotices.map((notice) => {
                const dateParts = formatNoticeDate(notice.pub_date);
                const badge = getBadgeStyle(notice.category);
                return (
                  <div
                    key={notice.id}
                    style={{
                      background: '#ffffff',
                      border: notice.is_important ? '1px solid #c59b27' : '1px solid #e2e8f0',
                      borderRadius: '12px',
                      padding: '16px 20px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '16px',
                      flexWrap: 'wrap',
                      transition: 'all 0.15s ease',
                      boxShadow: '0 2px 6px rgba(0,0,0,0.03)'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flex: '1 1 300px' }}>
                      {/* Date Badge */}
                      <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        minWidth: '58px',
                        padding: '6px 8px',
                        background: '#eff6ff',
                        color: '#1b365d',
                        borderRadius: '8px',
                        border: '1px solid #dbeafe',
                        fontWeight: 700
                      }}>
                        <span style={{ fontSize: '18px', lineHeight: 1 }}>{dateParts.day}</span>
                        <span style={{ fontSize: '11px', color: '#64748b' }}>{dateParts.month}</span>
                      </div>

                      {/* Content */}
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                          <span style={{
                            fontSize: '11px',
                            fontWeight: 700,
                            padding: '2px 8px',
                            borderRadius: '12px',
                            backgroundColor: badge.bg,
                            color: badge.color
                          }}>
                            {notice.category || 'সাধারণ'}
                          </span>
                          {notice.is_important && (
                            <span style={{ fontSize: '11px', fontWeight: 700, padding: '2px 8px', borderRadius: '12px', background: '#fee2e2', color: '#b91c1c' }}>
                              জরুরী
                            </span>
                          )}
                        </div>
                        <h3 style={{ fontSize: '15.5px', fontWeight: 600, color: '#0f1d38', margin: 0 }}>
                          {notice.title}
                        </h3>
                      </div>
                    </div>

                    <Link
                      href="/notices"
                      style={{
                        padding: '6px 14px',
                        borderRadius: '6px',
                        border: '1px solid #cbd5e1',
                        color: '#1b365d',
                        fontSize: '13px',
                        fontWeight: 600,
                        textDecoration: 'none',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}
                    >
                      <span>বিস্তারিত</span>
                      <ChevronRight size={14} />
                    </Link>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* 07. Upcoming Events Preview (if events exist) */}
      {recentEvents.length > 0 && (
        <section style={{ padding: '56px 0', backgroundColor: '#f8fafc', borderTop: '1px solid #e2e8f0' }}>
          <div className="container" style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px', flexWrap: 'wrap', gap: '14px' }}>
              <div>
                <span style={{ fontSize: '12px', fontWeight: 700, color: '#059669', background: '#d1fae5', padding: '3px 12px', borderRadius: '16px', display: 'inline-block', marginBottom: '6px' }}>
                  কার্যক্রম ও অনুষ্ঠান
                </span>
                <h2 style={{ fontSize: '26px', fontWeight: 800, color: '#0f1d38', margin: 0 }}>
                  সাম্প্রতিক ও আসন্ন ইভেন্ট
                </h2>
              </div>
              <Link href="/events" style={{ color: '#1b365d', fontWeight: 700, fontSize: '14px', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span>সকল ইভেন্ট দেখুন</span>
                <ArrowRight size={15} color="#c59b27" />
              </Link>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
              {recentEvents.map((event) => (
                <div key={event.id} style={{ background: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', display: 'flex', flexDirection: 'column' }}>
                  {event.featured_image ? (
                    <img src={event.featured_image} alt={event.title} style={{ width: '100%', height: '170px', objectFit: 'cover' }} />
                  ) : (
                    <div style={{ height: '120px', background: 'linear-gradient(135deg, #1b365d, #0f1d38)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#c59b27' }}>
                      <Calendar size={36} />
                    </div>
                  )}
                  <div style={{ padding: '20px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                    <div style={{ fontSize: '12px', color: '#c59b27', fontWeight: 700, marginBottom: '6px' }}>
                      📅 {event.event_date}
                    </div>
                    <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#0f1d38', marginBottom: '8px', lineHeight: 1.35 }}>
                      {event.title}
                    </h3>
                    {event.description && (
                      <p style={{ fontSize: '13px', color: '#64748b', lineHeight: 1.5, margin: '0 0 16px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                        {event.description}
                      </p>
                    )}
                    <div style={{ marginTop: 'auto' }}>
                      <Link href="/events" style={{ fontSize: '13px', color: '#1b365d', fontWeight: 700, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                        <span>বিস্তারিত জানুন</span>
                        <ChevronRight size={14} />
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 08. Admission Call-to-Action Banner */}
      <section style={{ padding: '64px 0', backgroundColor: '#ffffff' }}>
        <div className="container" style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 20px' }}>
          <div style={{
            background: 'linear-gradient(135deg, #09172e 0%, #152c52 50%, #1b365d 100%)',
            color: '#ffffff',
            borderRadius: '18px',
            padding: '48px 36px',
            textAlign: 'center',
            border: '2px solid #c59b27',
            boxShadow: '0 12px 30px rgba(15, 29, 56, 0.2)'
          }}>
            <h2 style={{ fontSize: 'clamp(24px, 3.5vw, 34px)', fontWeight: 800, color: '#ffffff', marginBottom: '14px' }}>
              ২০২৬ শিক্ষাবর্ষে ভর্তি চলছে
            </h2>
            <p style={{ fontSize: '15.5px', color: '#cbd5e1', maxWidth: '640px', margin: '0 auto 28px', lineHeight: 1.7 }}>
              আপনার সন্তানের ভবিষ্যৎ গঠনে মানসম্মত ও নৈতিক শিক্ষাদানে আমরা অঙ্গীকারবদ্ধ। সীমিত আসনে ভর্তি চলছে।
            </p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '14px', flexWrap: 'wrap' }}>
              <Link
                href="/admission"
                style={{
                  backgroundColor: '#c59b27',
                  color: '#0f1d38',
                  padding: '12px 28px',
                  borderRadius: '8px',
                  fontWeight: 700,
                  fontSize: '14.5px',
                  textDecoration: 'none',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                <span>ভর্তি প্রক্রিয়া জানুন</span>
                <ArrowRight size={16} />
              </Link>
              <Link
                href="/contact"
                style={{
                  backgroundColor: 'transparent',
                  color: '#ffffff',
                  border: '1px solid rgba(255,255,255,0.4)',
                  padding: '12px 24px',
                  borderRadius: '8px',
                  fontWeight: 600,
                  fontSize: '14.5px',
                  textDecoration: 'none'
                }}
              >
                যোগাযোগ করুন
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 09. Institutional 4-Column Footer */}
      <Footer schoolInfo={schoolInfo} />
    </div>
  );
}
