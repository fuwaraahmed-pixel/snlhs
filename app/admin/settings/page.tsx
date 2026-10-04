'use client';

import React, { useState, useEffect } from 'react';
import { Save, CheckCircle2, Loader2, AlertCircle } from 'lucide-react';
import { getAdminSchoolSettings, updateSchoolSettingsAction } from '@/lib/actions/settings-actions';

export default function SchoolSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const [name, setName] = useState('সাহেরা নায়েব ল্যাবরেটরি হাই স্কুল');
  const [phone, setPhone] = useState('01531927956');
  const [email, setEmail] = useState('snlschool07@gmail.com');
  const [address, setAddress] = useState('হবিরবাড়ী, সিড্‌স্টোর বাজার, ভালুকা, ময়মনসিংহ।');
  
  // Settings JSONB fields
  const [eiin, setEiin] = useState('138293');
  const [established, setEstablished] = useState('১৯৯৮');
  const [board, setBoard] = useState('ঢাকা শিক্ষা বোর্ড');
  const [motto, setMotto] = useState('শিক্ষা • শৃঙ্খলা • চরিত্র');
  const [principalName, setPrincipalName] = useState('নূর মোহাম্মদ সরকার (সাগর)');
  const [principalMessage, setPrincipalMessage] = useState('');

  const loadSettings = async () => {
    setLoading(true);
    setErrorMsg(null);
    const res = await getAdminSchoolSettings();
    if (res.error) {
      setErrorMsg(res.error);
    } else if (res.school) {
      const s = res.school;
      const st = s.settings || {};
      setName(s.name || '');
      setPhone(s.phone || '');
      setEmail(s.email || '');
      setAddress(s.address || '');
      setEiin(st.eiin || '138293');
      setEstablished(st.established || '১৯৯৮');
      setBoard(st.board || 'ঢাকা শিক্ষা বোর্ড');
      setMotto(st.motto || 'শিক্ষা • শৃঙ্খলা • চরিত্র');
      setPrincipalName(st.principal_name || 'নূর মোহাম্মদ সরকার (সাগর)');
      setPrincipalMessage(st.principal_message || '');
    }
    setLoading(false);
  };

  useEffect(() => {
    loadSettings();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    const payload = {
      name,
      phone,
      email,
      address,
      settings: {
        eiin,
        established,
        board,
        motto,
        principal_name: principalName,
        principal_message: principalMessage,
      },
    };

    const res = await updateSchoolSettingsAction(payload);
    setSubmitting(false);

    if (res.success) {
      setSuccessMsg('স্কুলের সেটিংস সফলভাবে আপগ্রেড ও সংরক্ষণ করা হয়েছে!');
      setTimeout(() => setSuccessMsg(null), 4000);
      loadSettings();
    } else {
      setErrorMsg(res.error || 'সেটিংস সংরক্ষণ করতে ব্যর্থ হয়েছে');
    }
  };

  return (
    <div>
      <div style={{ marginBottom: 'var(--space-6)' }}>
        <h2 style={{ fontSize: 'var(--text-xl)', color: 'var(--primary-900)', margin: 0 }}>
          স্কুলের তথ্য ও সেটিংস
        </h2>
        <p style={{ fontSize: 'var(--text-sm)', color: 'var(--neutral-600)', margin: 0 }}>
          প্রতিষ্ঠানের মৌলিক তথ্য, ইআইআইএন, পরিচিতি ও প্রাতিষ্ঠানিক বাণী আপডেট করুন
        </p>
      </div>

      {errorMsg && (
        <div style={{ padding: 'var(--space-3) var(--space-4)', backgroundColor: '#fde8e8', color: '#9b1c1c', borderRadius: 'var(--radius-md)', marginBottom: 'var(--space-4)', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <AlertCircle size={18} />
          <span>{errorMsg}</span>
        </div>
      )}

      {successMsg && (
        <div style={{ padding: 'var(--space-3) var(--space-4)', backgroundColor: '#def7ec', color: '#03543f', borderRadius: 'var(--radius-md)', marginBottom: 'var(--space-4)', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <CheckCircle2 size={18} />
          <span>{successMsg}</span>
        </div>
      )}

      <div className="admin-card" style={{ maxWidth: '750px' }}>
        {loading ? (
          <div style={{ padding: 'var(--space-8)', textAlign: 'center', color: 'var(--neutral-500)' }}>
            <Loader2 className="animate-spin" size={24} style={{ margin: '0 auto var(--space-2)' }} />
            <p>স্কুল সেটিংস লোড হচ্ছে...</p>
          </div>
        ) : (
          <form onSubmit={handleSave}>
            <div className="form-group">
              <label className="form-label">স্কুলের পূর্ণ নাম *</label>
              <input type="text" required className="form-input" value={name} onChange={(e) => setName(e.target.value)} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 'var(--space-4)' }}>
              <div className="form-group">
                <label className="form-label">EIIN নম্বর</label>
                <input type="text" className="form-input" value={eiin} onChange={(e) => setEiin(e.target.value)} />
              </div>

              <div className="form-group">
                <label className="form-label">স্থাপিত সাল</label>
                <input type="text" className="form-input" value={established} onChange={(e) => setEstablished(e.target.value)} />
              </div>

              <div className="form-group">
                <label className="form-label">শিক্ষা বোর্ড</label>
                <input type="text" className="form-input" value={board} onChange={(e) => setBoard(e.target.value)} />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">স্কুলের মূল বাণী (Motto)</label>
              <input type="text" className="form-input" value={motto} onChange={(e) => setMotto(e.target.value)} placeholder="যেমন: শিক্ষা • শৃঙ্খলা • চরিত্র" />
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
              <textarea className="form-textarea" rows={2} value={address} onChange={(e) => setAddress(e.target.value)} />
            </div>

            <div className="form-group">
              <label className="form-label">প্রধান শিক্ষকের নাম</label>
              <input type="text" className="form-input" value={principalName} onChange={(e) => setPrincipalName(e.target.value)} />
            </div>

            <div className="form-group">
              <label className="form-label">প্রধান শিক্ষকের বাণী (Principal Message)</label>
              <textarea className="form-textarea" rows={4} value={principalMessage} onChange={(e) => setPrincipalMessage(e.target.value)} placeholder="প্রধান শিক্ষকের বাণী এখানে লিখুন..." />
            </div>

            <div style={{ marginTop: 'var(--space-6)' }}>
              <button
                type="submit"
                disabled={submitting}
                className="btn btn-primary"
                style={{ backgroundColor: 'var(--primary-700)', color: 'var(--white)', display: 'inline-flex', alignItems: 'center', gap: 'var(--space-2)' }}
              >
                {submitting ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                <span>{submitting ? 'সংরক্ষণ হচ্ছে...' : 'পরিবর্তনসমূহ সংরক্ষণ করুন'}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
