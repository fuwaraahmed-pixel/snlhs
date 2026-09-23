'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/db/supabase-client';
import { KeyRound, Mail, ArrowLeft, CheckCircle2, ShieldAlert } from 'lucide-react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleResetRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);
    setIsLoading(true);

    try {
      const supabase = createClient();
      const redirectUrl = `${window.location.origin}/admin/reset-password`;
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: redirectUrl,
      });

      if (error) {
        setErrorMsg(error.message);
        setIsLoading(false);
        return;
      }

      setSuccessMsg('পাসওয়ার্ড রিসেট লিংক আপনার ইমেইলে পাঠানো হয়েছে। অনুগ্রহ করে ইনবক্স চেক করুন।');
      setIsLoading(false);
    } catch (err: any) {
      setErrorMsg(err?.message || 'অনুরোধ পাঠাতে সমস্যা হয়েছে।');
      setIsLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'var(--primary-900)',
      padding: 'var(--space-4)',
      fontFamily: 'var(--font-bengali), var(--font-english)'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '420px',
        backgroundColor: 'var(--white)',
        borderRadius: 'var(--radius-xl)',
        padding: 'var(--space-8)',
        boxShadow: 'var(--shadow-xl)'
      }}>
        <div style={{ textAlign: 'center', marginBottom: 'var(--space-6)' }}>
          <div style={{
            width: '56px',
            height: '56px',
            borderRadius: 'var(--radius-full)',
            backgroundColor: 'var(--primary-50)',
            color: 'var(--primary-700)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 'var(--space-3)'
          }}>
            <KeyRound size={28} />
          </div>
          <h1 style={{ fontSize: 'var(--text-2xl)', color: 'var(--primary-900)', marginBottom: 'var(--space-1)' }}>
            পাসওয়ার্ড রিসেট
          </h1>
          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--neutral-600)' }}>
            আপনার অ্যাকাউন্টের নিবন্ধিত ইমেইল লিখুন
          </p>
        </div>

        {errorMsg && (
          <div style={{
            backgroundColor: 'var(--error-bg)',
            color: 'var(--error)',
            padding: 'var(--space-3) var(--space-4)',
            borderRadius: 'var(--radius-md)',
            fontSize: 'var(--text-sm)',
            marginBottom: 'var(--space-4)',
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-2)'
          }}>
            <ShieldAlert size={18} />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div style={{
            backgroundColor: 'var(--success-bg)',
            color: 'var(--success)',
            padding: 'var(--space-3) var(--space-4)',
            borderRadius: 'var(--radius-md)',
            fontSize: 'var(--text-sm)',
            marginBottom: 'var(--space-4)',
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-2)'
          }}>
            <CheckCircle2 size={18} />
            <span>{successMsg}</span>
          </div>
        )}

        <form onSubmit={handleResetRequest}>
          <div className="form-group">
            <label className="form-label">ইমেইল এড্রেস</label>
            <div style={{ position: 'relative' }}>
              <input
                type="email"
                required
                className="form-input"
                placeholder="admin@school.edu.bd"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{ paddingLeft: '40px' }}
              />
              <Mail size={18} style={{
                position: 'absolute',
                left: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--neutral-400)'
              }} />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="btn btn-primary"
            style={{
              width: '100%',
              marginTop: 'var(--space-4)',
              justifyContent: 'center',
              backgroundColor: 'var(--primary-700)',
              color: 'var(--white)',
              padding: 'var(--space-3)'
            }}
          >
            {isLoading ? 'পাঠানো হচ্ছে...' : 'রিসেট লিংক পাঠান'}
          </button>
        </form>

        <div style={{ marginTop: 'var(--space-6)', textAlign: 'center' }}>
          <Link href="/admin/login" style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 'var(--space-2)',
            fontSize: 'var(--text-sm)',
            color: 'var(--primary-700)',
            fontWeight: 600
          }}>
            <ArrowLeft size={16} />
            লগইন পৃষ্ঠায় ফিরে যান
          </Link>
        </div>
      </div>
    </div>
  );
}
