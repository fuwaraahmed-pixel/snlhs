'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/db/supabase-client';
import { Lock, Eye, EyeOff, CheckCircle2, ShieldAlert, ArrowLeft, KeyRound } from 'lucide-react';

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isVerifyingSession, setIsVerifyingSession] = useState(true);

  useEffect(() => {
    // Check if the user arrived via a valid recovery link
    async function checkRecoverySession() {
      try {
        const supabase = createClient();
        const { data: { session } } = await supabase.auth.getSession();
        
        // Supabase sets the recovery session automatically from the URL token hash
        if (!session) {
          // Listen to auth state change in case token is being exchanged
          const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
            if (event === 'PASSWORD_RECOVERY' || session) {
              setIsVerifyingSession(false);
            }
          });

          // Allow a short moment for token exchange before displaying warning
          const timer = setTimeout(() => {
            setIsVerifyingSession(false);
          }, 1500);

          return () => {
            subscription.unsubscribe();
            clearTimeout(timer);
          };
        } else {
          setIsVerifyingSession(false);
        }
      } catch (err) {
        setIsVerifyingSession(false);
      }
    }

    checkRecoverySession();
  }, []);

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    // Validation
    if (password.length < 6) {
      setErrorMsg('পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে।');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMsg('উভয় পাসওয়ার্ড একই হতে হবে।');
      return;
    }

    setIsLoading(true);

    try {
      const supabase = createClient();
      const { error } = await supabase.auth.updateUser({
        password: password,
      });

      if (error) {
        setErrorMsg(error.message || 'পাসওয়ার্ড আপডেট করতে সমস্যা হয়েছে। অনুগ্রহ করে আবার রিসেট লিংক পাঠান।');
        setIsLoading(false);
        return;
      }

      setSuccessMsg('আপনার পাসওয়ার্ড সফলভাবে পরিবর্তন করা হয়েছে। এখন নতুন পাসওয়ার্ড দিয়ে লগইন করুন।');
      setIsLoading(false);
    } catch (err: any) {
      setErrorMsg(err?.message || 'সার্ভারে সংযোগে সমস্যা হয়েছে।');
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
        maxWidth: '440px',
        backgroundColor: 'var(--white)',
        borderRadius: 'var(--radius-xl)',
        padding: 'var(--space-8)',
        boxShadow: 'var(--shadow-xl)',
        border: '1px solid rgba(255, 255, 255, 0.1)'
      }}>
        {/* Header */}
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
          <h1 style={{ fontSize: 'var(--text-2xl)', color: 'var(--primary-900)', marginBottom: 'var(--space-1)', fontWeight: 700 }}>
            নতুন পাসওয়ার্ড সেট করুন
          </h1>
          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--neutral-600)' }}>
            আপনার অ্যাকাউন্টের জন্য একটি শক্তিশালী নতুন পাসওয়ার্ড তৈরি করুন
          </p>
        </div>

        {/* Error Alert */}
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
            <ShieldAlert size={18} style={{ flexShrink: 0 }} />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Success Alert */}
        {successMsg && (
          <div style={{
            backgroundColor: 'var(--success-bg)',
            color: 'var(--success)',
            padding: 'var(--space-4)',
            borderRadius: 'var(--radius-md)',
            fontSize: 'var(--text-sm)',
            marginBottom: 'var(--space-6)',
            textAlign: 'center'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-3)' }}>
              <CheckCircle2 size={24} color="var(--success)" />
              <strong style={{ fontSize: 'var(--text-base)' }}>সফল!</strong>
            </div>
            <p style={{ margin: 0, marginBottom: 'var(--space-4)' }}>{successMsg}</p>
            <Link
              href="/admin/login"
              style={{
                display: 'inline-block',
                backgroundColor: 'var(--primary-800)',
                color: 'var(--white)',
                padding: 'var(--space-2) var(--space-6)',
                borderRadius: 'var(--radius-md)',
                textDecoration: 'none',
                fontWeight: 600,
                fontSize: 'var(--text-sm)'
              }}
            >
              লগইন পেজে যান
            </Link>
          </div>
        )}

        {!successMsg && (
          <form onSubmit={handlePasswordUpdate}>
            {/* New Password */}
            <div style={{ marginBottom: 'var(--space-4)' }}>
              <label style={{
                display: 'block',
                fontSize: 'var(--text-sm)',
                fontWeight: 600,
                color: 'var(--neutral-700)',
                marginBottom: 'var(--space-1)'
              }}>
                নতুন পাসওয়ার্ড <span style={{ color: 'var(--error)' }}>*</span>
              </label>
              <div style={{ position: 'relative' }}>
                <span style={{
                  position: 'absolute',
                  left: 'var(--space-3)',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--neutral-400)',
                  display: 'flex',
                  alignItems: 'center'
                }}>
                  <Lock size={18} />
                </span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="কমপক্ষে ৬ অক্ষর লিখুন"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{
                    width: '100%',
                    padding: 'var(--space-3) var(--space-10) var(--space-3) var(--space-10)',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--neutral-300)',
                    fontSize: 'var(--text-sm)',
                    outline: 'none',
                    transition: 'border-color 0.2s',
                    boxSizing: 'border-box'
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: 'var(--space-3)',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    color: 'var(--neutral-400)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    padding: 0
                  }}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div style={{ marginBottom: 'var(--space-6)' }}>
              <label style={{
                display: 'block',
                fontSize: 'var(--text-sm)',
                fontWeight: 600,
                color: 'var(--neutral-700)',
                marginBottom: 'var(--space-1)'
              }}>
                পাসওয়ার্ড নিশ্চিত করুন <span style={{ color: 'var(--error)' }}>*</span>
              </label>
              <div style={{ position: 'relative' }}>
                <span style={{
                  position: 'absolute',
                  left: 'var(--space-3)',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--neutral-400)',
                  display: 'flex',
                  alignItems: 'center'
                }}>
                  <Lock size={18} />
                </span>
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  required
                  placeholder="পুনরায় একই পাসওয়ার্ড লিখুন"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  style={{
                    width: '100%',
                    padding: 'var(--space-3) var(--space-10) var(--space-3) var(--space-10)',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--neutral-300)',
                    fontSize: 'var(--text-sm)',
                    outline: 'none',
                    transition: 'border-color 0.2s',
                    boxSizing: 'border-box'
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  style={{
                    position: 'absolute',
                    right: 'var(--space-3)',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    color: 'var(--neutral-400)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    padding: 0
                  }}
                >
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              style={{
                width: '100%',
                padding: 'var(--space-3)',
                backgroundColor: 'var(--primary-800)',
                color: 'var(--white)',
                border: 'none',
                borderRadius: 'var(--radius-md)',
                fontSize: 'var(--text-base)',
                fontWeight: 600,
                cursor: isLoading ? 'not-allowed' : 'pointer',
                opacity: isLoading ? 0.7 : 1,
                transition: 'background-color 0.2s',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 'var(--space-2)'
              }}
            >
              {isLoading ? 'সংরক্ষণ করা হচ্ছে...' : 'পাসওয়ার্ড পরিবর্তন করুন'}
            </button>
          </form>
        )}

        {/* Back to Login Link */}
        <div style={{ marginTop: 'var(--space-6)', textAlign: 'center' }}>
          <Link
            href="/admin/login"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 'var(--space-1)',
              fontSize: 'var(--text-sm)',
              color: 'var(--primary-700)',
              textDecoration: 'none',
              fontWeight: 500
            }}
          >
            <ArrowLeft size={16} />
            <span>লগইন পেজে ফিরে যান</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
