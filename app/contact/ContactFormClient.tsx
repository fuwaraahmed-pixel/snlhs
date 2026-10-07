'use client';

import React, { useState } from 'react';
import { Send, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { submitContactMessage } from '@/lib/actions/contact-actions';

export default function ContactFormClient() {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    subject: '',
    message: '',
  });

  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<{
    type: 'success' | 'error' | null;
    message: string;
  }>({ type: null, message: '' });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setStatus({ type: null, message: '' });

    try {
      const result = await submitContactMessage(formData);
      if (result.success) {
        setStatus({
          type: 'success',
          message:
            result.message ||
            'আপনার বার্তা সফলভাবে গ্রহণ করা হয়েছে। ধন্যবাদ!',
        });
        setFormData({
          name: '',
          phone: '',
          email: '',
          subject: '',
          message: '',
        });
      } else {
        setStatus({
          type: 'error',
          message: result.error || 'বার্তা পাঠানো সম্ভব হয়নি।',
        });
      }
    } catch {
      setStatus({
        type: 'error',
        message: 'সার্ভারের সাথে সংযোগে সমস্যা হয়েছে।',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      style={{
        backgroundColor: '#ffffff',
        padding: '32px',
        borderRadius: '16px',
        border: '1px solid #e2e8f0',
        boxShadow: '0 4px 15px rgba(0, 0, 0, 0.04)',
      }}
    >
      <h3
        style={{
          color: '#0f1d38',
          fontSize: '20px',
          fontWeight: 700,
          marginBottom: '6px',
        }}
      >
        ✉️ সরাসরি বার্তা পাঠান
      </h3>
      <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '24px' }}>
        ভর্তি, তথ্য বা যেকোনো পরামর্শের জন্য ফর্মটি পূরণ করে পাঠান।
      </p>

      {status.type === 'success' && (
        <div
          style={{
            backgroundColor: '#ecfdf5',
            color: '#065f46',
            border: '1px solid #a7f3d0',
            padding: '14px 18px',
            borderRadius: '10px',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            fontSize: '14px',
          }}
        >
          <CheckCircle2 size={18} color="#059669" />
          <span>{status.message}</span>
        </div>
      )}

      {status.type === 'error' && (
        <div
          style={{
            backgroundColor: '#fef2f2',
            color: '#991b1b',
            border: '1px solid #fecaca',
            padding: '14px 18px',
            borderRadius: '10px',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            fontSize: '14px',
          }}
        >
          <AlertCircle size={18} color="#dc2626" />
          <span>{status.message}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
          <div>
            <label
              htmlFor="name"
              style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}
            >
              আপনার নাম <span style={{ color: '#dc2626' }}>*</span>
            </label>
            <input
              id="name"
              name="name"
              type="text"
              required
              placeholder="যেমন: মোঃ কামরুল ইসলাম"
              value={formData.name}
              onChange={handleChange}
              style={{
                width: '100%',
                padding: '11px 14px',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                fontSize: '14px',
                outline: 'none',
                backgroundColor: '#f8fafc',
              }}
            />
          </div>

          <div>
            <label
              htmlFor="phone"
              style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}
            >
              মোবাইল নম্বর <span style={{ color: '#dc2626' }}>*</span>
            </label>
            <input
              id="phone"
              name="phone"
              type="tel"
              required
              placeholder="যেমন: 017xxxxxxxx"
              value={formData.phone}
              onChange={handleChange}
              style={{
                width: '100%',
                padding: '11px 14px',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                fontSize: '14px',
                outline: 'none',
                backgroundColor: '#f8fafc',
              }}
            />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
          <div>
            <label
              htmlFor="email"
              style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}
            >
              ইমেইল (ঐচ্ছিক)
            </label>
            <input
              id="email"
              name="email"
              type="email"
              placeholder="example@gmail.com"
              value={formData.email}
              onChange={handleChange}
              style={{
                width: '100%',
                padding: '11px 14px',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                fontSize: '14px',
                outline: 'none',
                backgroundColor: '#f8fafc',
              }}
            />
          </div>

          <div>
            <label
              htmlFor="subject"
              style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}
            >
              বিষয় <span style={{ color: '#dc2626' }}>*</span>
            </label>
            <input
              id="subject"
              name="subject"
              type="text"
              required
              placeholder="যেমন: ভর্তি সংক্রান্ত তথ্য"
              value={formData.subject}
              onChange={handleChange}
              style={{
                width: '100%',
                padding: '11px 14px',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                fontSize: '14px',
                outline: 'none',
                backgroundColor: '#f8fafc',
              }}
            />
          </div>
        </div>

        <div>
          <label
            htmlFor="message"
            style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}
          >
            আপনার বার্তা <span style={{ color: '#dc2626' }}>*</span>
          </label>
          <textarea
            id="message"
            name="message"
            required
            rows={4}
            placeholder="আপনার বক্তব্য বা প্রশ্ন বিস্তারিতভাবে লিখুন..."
            value={formData.message}
            onChange={handleChange}
            style={{
              width: '100%',
              padding: '12px 14px',
              borderRadius: '8px',
              border: '1px solid #cbd5e1',
              fontSize: '14px',
              outline: 'none',
              resize: 'vertical',
              fontFamily: 'inherit',
              backgroundColor: '#f8fafc',
            }}
          />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            backgroundColor: '#1b365d',
            color: '#ffffff',
            padding: '12px 24px',
            borderRadius: '10px',
            fontSize: '15px',
            fontWeight: 700,
            border: 'none',
            cursor: isLoading ? 'not-allowed' : 'pointer',
            opacity: isLoading ? 0.7 : 1,
            transition: 'background-color 0.15s, transform 0.1s',
            marginTop: '6px',
            alignSelf: 'flex-start',
          }}
        >
          {isLoading ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              <span>বার্তা পাঠানো হচ্ছে...</span>
            </>
          ) : (
            <>
              <Send size={16} />
              <span>বার্তা পাঠান</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
}
