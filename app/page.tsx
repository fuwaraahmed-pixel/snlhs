import React from 'react';
import Link from 'next/link';
import { Bell, Users, Calendar, Award, Phone, Mail, MapPin, ArrowRight } from 'lucide-react';

export default function PublicHomePage() {
  return (
    <div style={{ fontFamily: 'var(--font-bengali), var(--font-english)', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Top Bar */}
      <div style={{ backgroundColor: 'var(--primary-900)', color: 'var(--white)', padding: 'var(--space-2) 0', fontSize: 'var(--text-xs)' }}>
        <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap' }}>
          <div>EIIN: ১২৩৪৫৬ | স্থাপিত: ১৯৯৮ | ঢাকা শিক্ষা বোর্ড</div>
          <div style={{ display: 'flex', gap: 'var(--space-4)' }}>
            <a href="tel:01531927956" style={{ color: 'var(--neutral-300)' }}>📞 01531927956</a>
            <Link href="/admin/login" style={{ color: 'var(--accent-gold)', fontWeight: 700 }}>🔐 অ্যাডমিন লগইন</Link>
          </div>
        </div>
      </div>

      {/* Main Navigation Header */}
      <header style={{ backgroundColor: 'var(--white)', borderBottom: '2px solid var(--accent-gold)', padding: 'var(--space-4) 0' }}>
        <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ fontSize: 'var(--text-2xl)', color: 'var(--primary-900)', margin: 0 }}>
              সাহেরা নায়েব ল্যাবরেটরি হাই স্কুল
            </h1>
            <p style={{ fontSize: 'var(--text-xs)', color: 'var(--accent-gold-hover)', fontWeight: 600, margin: 0 }}>
              শিক্ষা • শৃঙ্খলা • চরিত্র
            </p>
          </div>
          <nav style={{ display: 'flex', gap: 'var(--space-6)', fontWeight: 600 }}>
            <Link href="/" style={{ color: 'var(--primary-700)' }}>মূল পাতা</Link>
            <Link href="/admin/notices" style={{ color: 'var(--neutral-700)' }}>নোটিশ বোর্ড</Link>
            <Link href="/admin/teachers" style={{ color: 'var(--neutral-700)' }}>শিক্ষকমণ্ডলী</Link>
            <Link href="/admin/events" style={{ color: 'var(--neutral-700)' }}>ইভেন্ট ও গ্যালারি</Link>
            <Link href="/admin/login" className="btn btn-outline btn-sm">অ্যাডমিন প্যানেল</Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section style={{ background: 'linear-gradient(135deg, var(--primary-900), var(--primary-700))', color: 'var(--white)', padding: 'var(--space-16) 0', textAlign: 'center' }}>
        <div className="container">
          <h2 style={{ fontSize: 'var(--text-4xl)', color: 'var(--white)', marginBottom: 'var(--space-4)' }}>
            স্বাগতম সাহেরা নায়েব ল্যাবরেটরি হাই স্কুলে
          </h2>
          <p style={{ fontSize: 'var(--text-lg)', color: 'var(--neutral-200)', maxWidth: '700px', margin: '0 auto var(--space-8)' }}>
            একটি সুশৃঙ্খল, আধুনিক ও গুণগত মানসম্পন্ন শিক্ষা প্রতিষ্ঠান।
          </p>
          <div style={{ display: 'flex', gap: 'var(--space-4)', justifyContent: 'center' }}>
            <Link href="/admin/login" className="btn btn-primary" style={{ backgroundColor: 'var(--accent-gold)', borderColor: 'var(--accent-gold)', color: 'var(--primary-900)', fontWeight: 700 }}>
              অ্যাডমিন ড্যাশবোর্ডে যান
            </Link>
          </div>
        </div>
      </section>

      {/* Notice Board Preview */}
      <section style={{ padding: 'var(--space-12) 0', backgroundColor: 'var(--neutral-50)' }}>
        <div className="container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-6)' }}>
            <h3 style={{ fontSize: 'var(--text-2xl)', color: 'var(--primary-900)' }}>
              📢 সাম্প্রতিক নোটিশ সমুহ
            </h3>
            <Link href="/admin/notices" style={{ color: 'var(--primary-700)', fontWeight: 600 }}>সব নোটিশ দেখুন &rarr;</Link>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 'var(--space-6)' }}>
            <div className="notice-card" style={{ backgroundColor: 'var(--white)', padding: 'var(--space-6)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--neutral-200)' }}>
              <span className="badge badge-event" style={{ marginBottom: 'var(--space-2)' }}>ইভেন্ট</span>
              <h4 style={{ fontSize: 'var(--text-lg)', marginBottom: 'var(--space-2)' }}>বার্ষিক ক্রীড়া প্রতিযোগিতা ২০২৬</h4>
              <p style={{ fontSize: 'var(--text-sm)', color: 'var(--neutral-600)' }}>১৫ আগস্ট ২০২৬</p>
            </div>
            <div className="notice-card" style={{ backgroundColor: 'var(--white)', padding: 'var(--space-6)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--neutral-200)' }}>
              <span className="badge badge-exam" style={{ marginBottom: 'var(--space-2)' }}>পরীক্ষা</span>
              <h4 style={{ fontSize: 'var(--text-lg)', marginBottom: 'var(--space-2)' }}>অর্ধ-বার্ষিক পরীক্ষা ২০২৬ সময়সূচী</h4>
              <p style={{ fontSize: 'var(--text-sm)', color: 'var(--neutral-600)' }}>১০ আগস্ট ২০২৬</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ backgroundColor: 'var(--primary-900)', color: 'var(--neutral-300)', padding: 'var(--space-8) 0', marginTop: 'auto' }}>
        <div className="container" style={{ textAlign: 'center', fontSize: 'var(--text-sm)' }}>
          <p>© ২০২৬ সাহেরা নায়েব ল্যাবরেটরি হাই স্কুল। সর্বস্বত্ব সংরক্ষিত।</p>
          <p style={{ fontSize: 'var(--text-xs)', color: 'var(--neutral-400)' }}>
            <Link href="/admin/login" style={{ color: 'var(--accent-gold)' }}>অ্যাডমিন প্যানেল প্রবেশদ্বারে ক্লিক করুন</Link>
          </p>
        </div>
      </footer>
    </div>
  );
}
