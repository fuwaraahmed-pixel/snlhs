import React from 'react';
import Link from 'next/link';
import { School, Phone, Mail, MapPin, Clock, ArrowRight, ShieldCheck } from 'lucide-react';

interface FooterProps {
  schoolInfo?: {
    name?: string;
    phone?: string;
    email?: string;
    address?: string;
    eiin?: string;
    board?: string;
    motto?: string;
  };
}

export default function Footer({ schoolInfo }: FooterProps) {
  const name = schoolInfo?.name || 'সাহেরা নায়েব ল্যাবরেটরি হাই স্কুল';
  const phone = schoolInfo?.phone || '01531927956';
  const email = schoolInfo?.email || 'snlschool07@gmail.com';
  const address = schoolInfo?.address || 'হবিরবাড়ী, সিড্‌স্টোর বাজার, ভালুকা, ময়মনসিংহ।';
  const eiin = schoolInfo?.eiin || '138293';
  const board = schoolInfo?.board || 'ঢাকা শিক্ষা বোর্ড';
  const motto = schoolInfo?.motto || 'শিক্ষা • শৃঙ্খলা • চরিত্র';

  return (
    <footer className="site-footer" style={{ backgroundColor: 'var(--primary-900, #0f1d38)', color: 'var(--neutral-300, #cbd5e1)', marginTop: 'auto', borderTop: '4px solid var(--accent-gold, #c59b27)' }}>
      {/* Top 4-Column Section */}
      <div style={{ padding: '48px 0 36px 0' }}>
        <div className="container" style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px' }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '36px'
          }}>
            {/* Column 1: School Identity */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px' }}>
                <div style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '10px',
                  background: 'linear-gradient(135deg, #c59b27, #e0b84c)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#0f1d38',
                  boxShadow: '0 2px 8px rgba(197, 155, 39, 0.3)',
                  flexShrink: 0
                }}>
                  <School size={22} />
                </div>
                <div>
                  <h3 style={{ color: '#fff', fontSize: '16px', fontWeight: 700, margin: 0, lineHeight: 1.3 }}>
                    {name}
                  </h3>
                  <p style={{ color: '#c59b27', fontSize: '11px', margin: '2px 0 0', fontWeight: 600 }}>
                    {motto}
                  </p>
                </div>
              </div>
              <p style={{ fontSize: '13px', color: '#94a3b8', lineHeight: 1.65, margin: '0 0 16px' }}>
                শিক্ষার্থীদের মেধা, নৈতিকতা ও সৃজনশীলতার বিকাশ ঘটিয়ে একবিংশ শতাব্দীর চ্যালেঞ্জ মোকাবেলায় যোগ্য ও দেশপ্রেমিক নাগরিক হিসেবে গড়ে তোলাই আমাদের মূল লক্ষ্য।
              </p>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '11.5px', background: 'rgba(255,255,255,0.08)', padding: '3px 10px', borderRadius: '6px', color: '#e2e8f0', border: '1px solid rgba(255,255,255,0.1)' }}>
                  EIIN: {eiin}
                </span>
                <span style={{ fontSize: '11.5px', background: 'rgba(255,255,255,0.08)', padding: '3px 10px', borderRadius: '6px', color: '#e2e8f0', border: '1px solid rgba(255,255,255,0.1)' }}>
                  {board}
                </span>
              </div>
            </div>

            {/* Column 2: Quick Links */}
            <div>
              <h4 style={{
                color: '#fff',
                fontSize: '15px',
                fontWeight: 700,
                marginBottom: '18px',
                position: 'relative',
                paddingBottom: '8px',
                borderBottom: '2px solid #c59b27',
                display: 'inline-block'
              }}>
                দ্রুত লিঙ্ক
              </h4>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <li>
                  <Link href="/about" style={{ color: '#cbd5e1', textDecoration: 'none', fontSize: '13.5px', transition: 'color 0.15s', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <ArrowRight size={13} color="#c59b27" /> আমাদের কথা
                  </Link>
                </li>
                <li>
                  <Link href="/academics" style={{ color: '#cbd5e1', textDecoration: 'none', fontSize: '13.5px', transition: 'color 0.15s', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <ArrowRight size={13} color="#c59b27" /> একাডেমিক কারিকুলাম
                  </Link>
                </li>
                <li>
                  <Link href="/teachers" style={{ color: '#cbd5e1', textDecoration: 'none', fontSize: '13.5px', transition: 'color 0.15s', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <ArrowRight size={13} color="#c59b27" /> শিক্ষক ও কর্মচারী
                  </Link>
                </li>
                <li>
                  <Link href="/admission" style={{ color: '#cbd5e1', textDecoration: 'none', fontSize: '13.5px', transition: 'color 0.15s', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <ArrowRight size={13} color="#c59b27" /> ভর্তি প্রক্রিয়া ও ফি
                  </Link>
                </li>
                <li>
                  <Link href="/notices" style={{ color: '#cbd5e1', textDecoration: 'none', fontSize: '13.5px', transition: 'color 0.15s', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <ArrowRight size={13} color="#c59b27" /> নোটিশ বোর্ড
                  </Link>
                </li>
              </ul>
            </div>

            {/* Column 3: Important Services */}
            <div>
              <h4 style={{
                color: '#fff',
                fontSize: '15px',
                fontWeight: 700,
                marginBottom: '18px',
                position: 'relative',
                paddingBottom: '8px',
                borderBottom: '2px solid #c59b27',
                display: 'inline-block'
              }}>
                গুরুত্বপূর্ণ সেবা
              </h4>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <li>
                  <Link href="/admission" style={{ color: '#cbd5e1', textDecoration: 'none', fontSize: '13.5px', transition: 'color 0.15s', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <ArrowRight size={13} color="#c59b27" /> অনলাইন ভর্তি আবেদন
                  </Link>
                </li>
                <li>
                  <Link href="/notices" style={{ color: '#cbd5e1', textDecoration: 'none', fontSize: '13.5px', transition: 'color 0.15s', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <ArrowRight size={13} color="#c59b27" /> পরীক্ষার সময়সূচী
                  </Link>
                </li>
                <li>
                  <Link href="/events" style={{ color: '#cbd5e1', textDecoration: 'none', fontSize: '13.5px', transition: 'color 0.15s', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <ArrowRight size={13} color="#c59b27" /> ইভেন্ট ক্যালেন্ডার
                  </Link>
                </li>
                <li>
                  <Link href="/gallery" style={{ color: '#cbd5e1', textDecoration: 'none', fontSize: '13.5px', transition: 'color 0.15s', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <ArrowRight size={13} color="#c59b27" /> ফটো গ্যালারি
                  </Link>
                </li>
                <li>
                  <Link href="/admin" style={{ color: '#cbd5e1', textDecoration: 'none', fontSize: '13.5px', transition: 'color 0.15s', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <ShieldCheck size={13} color="#c59b27" /> অ্যাডমিন প্যানেল
                  </Link>
                </li>
              </ul>
            </div>

            {/* Column 4: Contact & Office Hours */}
            <div>
              <h4 style={{
                color: '#fff',
                fontSize: '15px',
                fontWeight: 700,
                marginBottom: '18px',
                position: 'relative',
                paddingBottom: '8px',
                borderBottom: '2px solid #c59b27',
                display: 'inline-block'
              }}>
                যোগাযোগ ও সময়সূচী
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '13px' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                  <MapPin size={16} color="#c59b27" style={{ marginTop: '2px', flexShrink: 0 }} />
                  <span style={{ color: '#cbd5e1', lineHeight: 1.5 }}>{address}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Phone size={15} color="#c59b27" style={{ flexShrink: 0 }} />
                  <a href={`tel:${phone}`} style={{ color: '#cbd5e1', textDecoration: 'none' }}>{phone}</a>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Mail size={15} color="#c59b27" style={{ flexShrink: 0 }} />
                  <a href={`mailto:${email}`} style={{ color: '#cbd5e1', textDecoration: 'none' }}>{email}</a>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Clock size={15} color="#c59b27" style={{ flexShrink: 0 }} />
                  <span style={{ color: '#cbd5e1' }}>রবি - বৃহস্পতি: সকাল ৮:০০ - বিকাল ৪:৩০</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Copyright Strip */}
      <div style={{
        backgroundColor: 'rgba(0, 0, 0, 0.35)',
        padding: '16px 0',
        borderTop: '1px solid rgba(255, 255, 255, 0.08)',
        fontSize: '12.5px',
        color: '#94a3b8'
      }}>
        <div className="container" style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '0 20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px'
        }}>
          <div>
            © ২০২৬ <strong style={{ color: '#e2e8f0' }}>{name}</strong>। সর্বস্বত্ব সংরক্ষিত।
          </div>
          <div style={{ display: 'flex', gap: '16px' }}>
            <Link href="/admission" style={{ color: '#94a3b8', textDecoration: 'none' }}>ভর্তি প্রক্রিয়া</Link>
            <Link href="/contact" style={{ color: '#94a3b8', textDecoration: 'none' }}>যোগাযোগ</Link>
            <Link href="/admin" style={{ color: '#c59b27', textDecoration: 'none', fontWeight: 600 }}>প্রশাসনিক লগইন</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
