import React from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Home, ArrowLeft } from 'lucide-react';

export default function NotFoundPage() {
  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: '#f8fafc',
        fontFamily: 'var(--font-bengali), var(--font-english), sans-serif',
      }}
    >
      <Navbar />

      <main
        style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '60px 20px',
        }}
      >
        <div
          style={{
            maxWidth: '560px',
            width: '100%',
            backgroundColor: '#ffffff',
            borderRadius: '16px',
            padding: '48px 32px',
            textAlign: 'center',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)',
            border: '1px solid #e2e8f0',
          }}
        >
          <div
            style={{
              fontSize: '72px',
              fontWeight: 900,
              color: '#1b365d',
              lineHeight: 1,
              marginBottom: '12px',
              letterSpacing: '-0.02em',
            }}
          >
            ৪০৪
          </div>

          <h2
            style={{
              fontSize: '22px',
              fontWeight: 800,
              color: '#0f1d38',
              marginBottom: '10px',
            }}
          >
            পৃষ্ঠাটি খুঁজে পাওয়া যায়নি
          </h2>

          <p
            style={{
              fontSize: '14.5px',
              color: '#64748b',
              lineHeight: 1.6,
              marginBottom: '32px',
            }}
          >
            আপনি যে পৃষ্ঠাটি খুঁজছেন তা মুছে ফেলা হয়েছে, স্থানান্তরিত হয়েছে অথবা লিঙ্কটিতে ভুল রয়েছে।
          </p>

          <div
            style={{
              display: 'flex',
              gap: '12px',
              justifyContent: 'center',
              flexWrap: 'wrap',
            }}
          >
            <Link
              href="/"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                backgroundColor: '#1b365d',
                color: '#ffffff',
                borderRadius: '8px',
                padding: '12px 24px',
                fontSize: '14px',
                fontWeight: 700,
                textDecoration: 'none',
                boxShadow: '0 4px 12px rgba(27, 54, 93, 0.25)',
              }}
            >
              <Home size={16} />
              <span>মূল পাতায় যান</span>
            </Link>

            <Link
              href="/notices"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                backgroundColor: '#f1f5f9',
                color: '#0f1d38',
                borderRadius: '8px',
                padding: '12px 20px',
                fontSize: '14px',
                fontWeight: 600,
                textDecoration: 'none',
                border: '1px solid #cbd5e1',
              }}
            >
              <ArrowLeft size={16} />
              <span>নোটিশ বোর্ড দেখুন</span>
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
