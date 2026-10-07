'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalErrorPage({ error, reset }: ErrorProps) {
  useEffect(() => {
    // Log unexpected runtime errors for tracing
    console.error('Unhandled Application Error:', error);
  }, [error]);

  return (
    <div
      style={{
        minHeight: '70vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '30px 20px',
        fontFamily: 'var(--font-bengali), var(--font-english), sans-serif',
      }}
    >
      <div
        style={{
          maxWidth: '520px',
          width: '100%',
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          padding: '40px 32px',
          textAlign: 'center',
          boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.05)',
          border: '1px solid #fee2e2',
        }}
      >
        <div
          style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            backgroundColor: '#fef2f2',
            color: '#dc2626',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 20px',
            boxShadow: '0 4px 12px rgba(220, 38, 38, 0.15)',
          }}
        >
          <AlertTriangle size={32} />
        </div>

        <h2
          style={{
            fontSize: '22px',
            fontWeight: 800,
            color: '#0f1d38',
            marginBottom: '10px',
          }}
        >
          একটি অপ্রত্যাশিত সমস্যা হয়েছে
        </h2>

        <p
          style={{
            fontSize: '14px',
            color: '#64748b',
            lineHeight: 1.6,
            marginBottom: '28px',
          }}
        >
          সার্ভারের সাথে যোগাযোগ করতে সাময়িক বিঘ্ন ঘটেছে। দয়া করে পৃষ্ঠাটি রিফ্রেশ করুন অথবা মূল পাতায় ফিরে যান।
        </p>

        <div
          style={{
            display: 'flex',
            gap: '12px',
            justifyContent: 'center',
            flexWrap: 'wrap',
          }}
        >
          <button
            onClick={() => reset()}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              backgroundColor: '#1b365d',
              color: '#ffffff',
              border: 'none',
              borderRadius: '8px',
              padding: '12px 24px',
              fontSize: '14px',
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'background-color 0.2s',
            }}
          >
            <RefreshCw size={16} />
            <span>আবার চেষ্টা করুন</span>
          </button>

          <Link
            href="/"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              backgroundColor: '#f8fafc',
              color: '#0f1d38',
              border: '1px solid #cbd5e1',
              borderRadius: '8px',
              padding: '12px 20px',
              fontSize: '14px',
              fontWeight: 600,
              textDecoration: 'none',
              transition: 'background-color 0.2s',
            }}
          >
            <Home size={16} />
            <span>মূল পাতায় ফিরুন</span>
          </Link>
        </div>

        {process.env.NODE_ENV === 'development' && error?.message && (
          <div
            style={{
              marginTop: '28px',
              padding: '12px',
              backgroundColor: '#f1f5f9',
              borderRadius: '8px',
              textAlign: 'left',
              fontSize: '12px',
              color: '#475569',
              overflowX: 'auto',
            }}
          >
            <strong>Dev Trace:</strong> {error.message}
          </div>
        )}
      </div>
    </div>
  );
}
