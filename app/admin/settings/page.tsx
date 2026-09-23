'use client';

import React, { useState } from 'react';
import { Save, School, Phone, Mail, MapPin, Award, CheckCircle2 } from 'lucide-react';

export default function SchoolSettingsPage() {
  const [nameBn, setNameBn] = useState('সাহেরা নায়েব ল্যাবরেটরি হাই স্কুল');
  const [nameEn, setNameEn] = useState('Shahera Nayeb Laboratory High School');
  const [eiin, setEiin] = useState('১২৩৪৫৬');
  const [phone, setPhone] = useState('01531927956');
  const [email, setEmail] = useState('snlhs07@gmail.com');
  const [address, setAddress] = useState('সাহেরা নায়েব ল্যাবরেটরি হাই স্কুল ক্যাম্পাস, ঢাকা, বাংলাদেশ');
  const [principalName, setPrincipalName] = useState('নূর মোহাম্মদ সরকার (সাগর)');

  const [isSaved, setIsSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <div>
      <div style={{ marginBottom: 'var(--space-6)' }}>
        <h2 style={{ fontSize: 'var(--text-xl)', color: 'var(--primary-900)', margin: 0 }}>
          স্কুলের তথ্য ও সেটিংস
        </h2>
        <p style={{ fontSize: 'var(--text-sm)', color: 'var(--neutral-600)', margin: 0 }}>
          প্রতিষ্ঠানের মৌলিক তথ্য, ইআইআইএন, পরিচিতি ও সোশ্যাল মিডিয়া লিংক আপডেট করুন
        </p>
      </div>

      {isSaved && (
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
          <span>স্কুলের সেটিংস সফলভাবে আপডেট হয়েছে!</span>
        </div>
      )}

      <div className="admin-card" style={{ maxWidth: '700px' }}>
        <form onSubmit={handleSave}>
          <div className="form-group">
            <label className="form-label">স্কুলের নাম (বাংলা) *</label>
            <input type="text" required className="form-input" value={nameBn} onChange={(e) => setNameBn(e.target.value)} />
          </div>

          <div className="form-group">
            <label className="form-label">School Name (English) *</label>
            <input type="text" required className="form-input" value={nameEn} onChange={(e) => setNameEn(e.target.value)} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
            <div className="form-group">
              <label className="form-label">EIIN নম্বর</label>
              <input type="text" className="form-input" value={eiin} onChange={(e) => setEiin(e.target.value)} />
            </div>

            <div className="form-group">
              <label className="form-label">প্রধান শিক্ষকের নাম</label>
              <input type="text" className="form-input" value={principalName} onChange={(e) => setPrincipalName(e.target.value)} />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
            <div className="form-group">
              <label className="form-label">ফোন নম্বর</label>
              <input type="text" className="form-input" value={phone} onChange={(e) => setPhone(e.target.value)} />
            </div>

            <div className="form-group">
              <label className="form-label">ইমেইল এড্রেস</label>
              <input type="email" className="form-input" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">ক্যাম্পাসের ঠিকানা</label>
            <textarea className="form-textarea" rows={3} value={address} onChange={(e) => setAddress(e.target.value)} />
          </div>

          <div style={{ marginTop: 'var(--space-6)' }}>
            <button type="submit" className="btn btn-primary" style={{ backgroundColor: 'var(--primary-700)', color: 'var(--white)', display: 'inline-flex', alignItems: 'center', gap: 'var(--space-2)' }}>
              <Save size={18} />
              <span>পরিবর্তনসমূহ সংরক্ষণ করুন</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
