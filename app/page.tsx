import React from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import { Bell, Users, Calendar, Award, Phone, Mail, MapPin, ArrowRight } from 'lucide-react';

export default function PublicHomePage() {
  return (
    <div style={{ fontFamily: 'var(--font-bengali), var(--font-english)', minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: 'var(--neutral-50)' }}>
      {/* Unified Responsive Navigation Bar */}
      <Navbar activePage="home" />

      {/* Hero Section */}
      <section style={{ background: 'linear-gradient(135deg, var(--primary-900), var(--primary-700))', color: 'var(--white)', padding: 'var(--space-16) 0', textAlign: 'center' }}>
        <div className="container">
          <h2 style={{ fontSize: 'var(--text-4xl)', color: 'var(--white)', marginBottom: 'var(--space-4)', fontWeight: 700 }}>
            স্বাগতম সাহেরা নায়েব ল্যাবরেটরি হাই স্কুলে
          </h2>
          <p style={{ fontSize: 'var(--text-lg)', color: 'var(--neutral-200)', maxWidth: '700px', margin: '0 auto var(--space-8)' }}>
            একটি সুশৃঙ্খল, আধুনিক ও গুণগত মানসম্পন্ন শিক্ষা প্রতিষ্ঠান।
          </p>
          <div className="hero-buttons" style={{ display: 'flex', gap: 'var(--space-4)', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/admission" className="btn btn-primary" style={{ backgroundColor: 'var(--accent-gold)', borderColor: 'var(--accent-gold)', color: 'var(--primary-900)', fontWeight: 700 }}>
              অনলাইন ভর্তি তথ্য
            </Link>
            <Link href="/about" className="btn btn-outline" style={{ color: 'var(--white)', borderColor: 'var(--white)' }}>
              আমাদের সম্পর্কে জানুন
            </Link>
          </div>
        </div>
      </section>

      {/* Notice Board & Announcements Preview */}
      <section style={{ padding: 'var(--space-12) 0', backgroundColor: 'var(--neutral-50)' }}>
        <div className="container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-6)', flexWrap: 'wrap', gap: 'var(--space-4)' }}>
            <h3 style={{ fontSize: 'var(--text-2xl)', color: 'var(--primary-900)', margin: 0 }}>
              📢 সাম্প্রতিক নোটিশ সমুহ
            </h3>
            <Link href="/notices" style={{ color: 'var(--primary-700)', fontWeight: 600, textDecoration: 'none' }}>
              সব নোটিশ দেখুন &rarr;
            </Link>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 'var(--space-6)' }}>
            <div className="notice-card" style={{ backgroundColor: 'var(--white)', padding: 'var(--space-6)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--neutral-200)', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
              <span className="badge badge-event" style={{ marginBottom: 'var(--space-2)' }}>ইভেন্ট</span>
              <h4 style={{ fontSize: 'var(--text-lg)', marginBottom: 'var(--space-2)', color: 'var(--primary-900)' }}>বার্ষিক ক্রীড়া প্রতিযোগিতা ২০২৬</h4>
              <p style={{ fontSize: 'var(--text-sm)', color: 'var(--neutral-600)', margin: 0 }}>১৫ আগস্ট ২০২৬</p>
            </div>
            <div className="notice-card" style={{ backgroundColor: 'var(--white)', padding: 'var(--space-6)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--neutral-200)', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
              <span className="badge badge-exam" style={{ marginBottom: 'var(--space-2)' }}>পরীক্ষা</span>
              <h4 style={{ fontSize: 'var(--text-lg)', marginBottom: 'var(--space-2)', color: 'var(--primary-900)' }}>অর্ধ-বার্ষিক পরীক্ষা ২০২৬ সময়সূচী</h4>
              <p style={{ fontSize: 'var(--text-sm)', color: 'var(--neutral-600)', margin: 0 }}>১০ আগস্ট ২০২৬</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ backgroundColor: 'var(--primary-900)', color: 'var(--neutral-300)', padding: 'var(--space-8) 0', marginTop: 'auto' }}>
        <div className="container" style={{ textAlign: 'center', fontSize: 'var(--text-sm)' }}>
          <p>© ২০২৬ সাহেরা নায়েব ল্যাবরেটরি হাই স্কুল। সর্বস্বত্ব সংরক্ষিত।</p>
        </div>
      </footer>
    </div>
  );
}
