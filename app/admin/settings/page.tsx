'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Save, CheckCircle2, Loader2, AlertCircle,
  Building2, Phone, Mail, MapPin, BookOpen, User, GraduationCap
} from 'lucide-react';
import { getAdminSchoolSettings, updateSchoolSettingsAction } from '@/lib/actions/settings-actions';

type Tab = 'basic' | 'contact' | 'principal';

export default function SchoolSettingsPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Tab>('basic');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const [name, setName] = useState('সাহেরা নায়েব ল্যাবরেটরি হাই স্কুল');
  const [phone, setPhone] = useState('01531927956');
  const [email, setEmail] = useState('snlschool07@gmail.com');
  const [address, setAddress] = useState('হবিরবাড়ী, সিড্‌স্টোর বাজার, ভালুকা, ময়মনসিংহ।');
  const [eiin, setEiin] = useState('138293');
  const [established, setEstablished] = useState('১৯৯৮');
  const [board, setBoard] = useState('ঢাকা শিক্ষা বোর্ড');
  const [motto, setMotto] = useState('শিক্ষা • শৃঙ্খলা • চরিত্র');
  const [principalName, setPrincipalName] = useState('নূর মোহাম্মদ সরকার (সাগর)');
  const [principalMessage, setPrincipalMessage] = useState('');

  const loadSettings = async () => {
    setLoading(true); setErrorMsg(null);
    const res = await getAdminSchoolSettings();
    if (res.error) setErrorMsg(res.error);
    else if (res.school) {
      const s = res.school; const st = s.settings || {};
      setName(s.name || ''); setPhone(s.phone || '');
      setEmail(s.email || ''); setAddress(s.address || '');
      setEiin(st.eiin || '138293'); setEstablished(st.established || '১৯৯৮');
      setBoard(st.board || 'ঢাকা শিক্ষা বোর্ড'); setMotto(st.motto || 'শিক্ষা • শৃঙ্খলা • চরিত্র');
      setPrincipalName(st.principal_name || ''); setPrincipalMessage(st.principal_message || '');
    }
    setLoading(false);
  };

  useEffect(() => { loadSettings(); }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault(); setSubmitting(true); setErrorMsg(null); setSuccessMsg(null);
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
      setSuccessMsg('সেটিংস সফলভাবে সংরক্ষণ হয়েছে!');
      setTimeout(() => setSuccessMsg(null), 5000);
      router.refresh();
      loadSettings();
    } else {
      setErrorMsg(res.error || 'সেটিংস সংরক্ষণ ব্যর্থ');
    }
  };

  const tabs: { id: Tab; label: string; icon: React.ElementType }[] = [
    { id: 'basic', label: 'মৌলিক তথ্য', icon: Building2 },
    { id: 'contact', label: 'যোগাযোগ ও ঠিকানা', icon: Phone },
    { id: 'principal', label: 'প্রধান শিক্ষকের বাণী', icon: GraduationCap },
  ];

  return (
    <div>
      {/* Page Header */}
      <div className="page-header">
        <div className="page-header-left">
          <h1 className="page-title">স্কুল সেটিংস</h1>
          <p className="page-subtitle">প্রতিষ্ঠানের তথ্য, যোগাযোগ ও প্রাতিষ্ঠানিক বাণী আপডেট করুন</p>
        </div>
      </div>

      {errorMsg && <div className="alert alert-error"><AlertCircle size={16} /> {errorMsg}</div>}
      {successMsg && <div className="alert alert-success"><CheckCircle2 size={16} /> {successMsg}</div>}

      {loading ? (
        <div className="spinner-wrap">
          <Loader2 size={30} className="animate-spin" style={{ color: '#1b365d' }} />
          <p style={{ marginTop: '10px', fontSize: '13px' }}>সেটিংস লোড হচ্ছে...</p>
        </div>
      ) : (
        <form onSubmit={handleSave}>
          {/* Tab Navigation */}
          <div style={{ display: 'flex', gap: '4px', marginBottom: '20px', background: '#f1f5f9', borderRadius: '12px', padding: '5px' }}>
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '7px',
                    padding: '9px 18px', borderRadius: '9px', border: 'none',
                    cursor: 'pointer', fontSize: '13px', fontWeight: isActive ? 700 : 500,
                    transition: 'all 0.15s',
                    background: isActive ? '#fff' : 'transparent',
                    color: isActive ? '#0f1d38' : '#64748b',
                    boxShadow: isActive ? '0 1px 6px rgba(15,28,56,0.08)' : 'none',
                    flex: 1, justifyContent: 'center',
                  }}
                >
                  <Icon size={15} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Basic Info Tab */}
          {activeTab === 'basic' && (
            <div className="admin-card">
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px', paddingBottom: '16px', borderBottom: '1px solid #f1f5f9' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Building2 size={18} color="#1b365d" />
                </div>
                <div>
                  <h3 style={{ fontSize: '14px', fontWeight: 700, color: '#0f1d38', margin: 0 }}>মৌলিক তথ্য</h3>
                  <p style={{ fontSize: '12px', color: '#94a3b8', margin: 0 }}>স্কুলের নাম, বোর্ড ও মূল তথ্য</p>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">স্কুলের পূর্ণ নাম *</label>
                <input type="text" required className="form-input" value={name} onChange={(e) => setName(e.target.value)} />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">EIIN নম্বর</label>
                  <input type="text" className="form-input" value={eiin} onChange={(e) => setEiin(e.target.value)} />
                </div>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">স্থাপিত সাল</label>
                  <input type="text" className="form-input" value={established} onChange={(e) => setEstablished(e.target.value)} />
                </div>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">শিক্ষা বোর্ড</label>
                  <input type="text" className="form-input" value={board} onChange={(e) => setBoard(e.target.value)} />
                </div>
              </div>

              <div className="form-group" style={{ marginTop: '16px' }}>
                <label className="form-label">
                  <BookOpen size={13} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '5px' }} />
                  স্কুলের মূল বাণী (Motto)
                </label>
                <input type="text" className="form-input" value={motto} onChange={(e) => setMotto(e.target.value)} placeholder="যেমন: শিক্ষা • শৃঙ্খলা • চরিত্র" />
                {motto && (
                  <div style={{ marginTop: '10px', padding: '12px 16px', background: 'linear-gradient(135deg, #0f1d38, #1b365d)', borderRadius: '10px', textAlign: 'center' }}>
                    <p style={{ color: '#c59b27', fontSize: '15px', fontWeight: 700, margin: 0, letterSpacing: '0.05em' }}>{motto}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Contact Tab */}
          {activeTab === 'contact' && (
            <div className="admin-card">
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px', paddingBottom: '16px', borderBottom: '1px solid #f1f5f9' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#f0fdf4', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Phone size={18} color="#15803d" />
                </div>
                <div>
                  <h3 style={{ fontSize: '14px', fontWeight: 700, color: '#0f1d38', margin: 0 }}>যোগাযোগ ও ঠিকানা</h3>
                  <p style={{ fontSize: '12px', color: '#94a3b8', margin: 0 }}>ফোন, ইমেইল এবং ক্যাম্পাসের ঠিকানা</p>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">
                    <Phone size={12} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '4px' }} />
                    ফোন নম্বর
                  </label>
                  <input type="text" className="form-input" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="01XXXXXXXXX" />
                </div>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">
                    <Mail size={12} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '4px' }} />
                    ইমেইল এড্রেস
                  </label>
                  <input type="email" className="form-input" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="school@email.com" />
                </div>
              </div>

              <div className="form-group" style={{ marginTop: '16px' }}>
                <label className="form-label">
                  <MapPin size={12} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '4px' }} />
                  ক্যাম্পাসের ঠিকানা
                </label>
                <textarea className="form-textarea" rows={3} value={address} onChange={(e) => setAddress(e.target.value)} placeholder="সম্পূর্ণ ঠিকানা লিখুন..." />
              </div>

              {/* Contact Preview */}
              <div style={{ marginTop: '16px', padding: '16px', background: '#f8fafc', borderRadius: '10px', border: '1px solid #e8eef8' }}>
                <p style={{ fontSize: '11px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 10px' }}>প্রিভিউ</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {phone && <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#334155' }}><Phone size={13} color="#94a3b8" /> {phone}</div>}
                  {email && <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#334155' }}><Mail size={13} color="#94a3b8" /> {email}</div>}
                  {address && <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '13px', color: '#334155' }}><MapPin size={13} color="#94a3b8" style={{ marginTop: '2px', flexShrink: 0 }} /> {address}</div>}
                </div>
              </div>
            </div>
          )}

          {/* Principal Tab */}
          {activeTab === 'principal' && (
            <div className="admin-card">
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px', paddingBottom: '16px', borderBottom: '1px solid #f1f5f9' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#fffbeb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <GraduationCap size={18} color="#c59b27" />
                </div>
                <div>
                  <h3 style={{ fontSize: '14px', fontWeight: 700, color: '#0f1d38', margin: 0 }}>প্রধান শিক্ষকের বাণী</h3>
                  <p style={{ fontSize: '12px', color: '#94a3b8', margin: 0 }}>প্রধান শিক্ষকের নাম ও বার্তা</p>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">
                  <User size={12} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '4px' }} />
                  প্রধান শিক্ষকের নাম
                </label>
                <input type="text" className="form-input" value={principalName} onChange={(e) => setPrincipalName(e.target.value)} placeholder="প্রধান শিক্ষকের পূর্ণ নাম" />
              </div>

              <div className="form-group">
                <label className="form-label">প্রধান শিক্ষকের বাণী</label>
                <textarea className="form-textarea" rows={6} value={principalMessage} onChange={(e) => setPrincipalMessage(e.target.value)} placeholder="প্রধান শিক্ষকের বাণী এখানে লিখুন..." />
                <p style={{ fontSize: '11.5px', color: '#94a3b8', marginTop: '6px' }}>এই বার্তাটি স্কুলের পাবলিক ওয়েবসাইটে প্রদর্শিত হবে।</p>
              </div>

              {/* Preview */}
              {(principalName || principalMessage) && (
                <div style={{ marginTop: '8px', padding: '18px', background: 'linear-gradient(135deg, #f8fafc, #f0f4fb)', borderRadius: '12px', border: '1px solid #e8eef8' }}>
                  <p style={{ fontSize: '11px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 12px' }}>প্রিভিউ</p>
                  {principalMessage && (
                    <blockquote style={{ margin: '0 0 12px', padding: '0 0 0 14px', borderLeft: '3px solid #c59b27', fontStyle: 'italic', color: '#334155', fontSize: '13.5px', lineHeight: 1.6 }}>
                      "{principalMessage}"
                    </blockquote>
                  )}
                  {principalName && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'linear-gradient(135deg, #1b365d, #335c9b)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <User size={16} color="#fff" />
                      </div>
                      <div>
                        <p style={{ fontWeight: 700, color: '#0f1d38', fontSize: '13px', margin: 0 }}>{principalName}</p>
                        <p style={{ fontSize: '11px', color: '#94a3b8', margin: 0 }}>প্রধান শিক্ষক</p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Save Button */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px' }}>
            <button
              type="submit"
              disabled={submitting}
              className="btn btn-primary"
              style={{ padding: '11px 28px', fontSize: '14px' }}
            >
              {submitting ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
              {submitting ? 'সংরক্ষণ হচ্ছে...' : 'পরিবর্তনসমূহ সংরক্ষণ করুন'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
