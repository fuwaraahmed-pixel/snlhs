'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Search, Trash2, Edit3, Eye, EyeOff, Loader2 } from 'lucide-react';
import {
  getAdminTeachers,
  createTeacherAction,
  updateTeacherAction,
  deleteTeacherAction,
  toggleTeacherPublishAction,
} from '@/lib/actions/teachers-actions';

export default function TeacherManagementPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const [name, setName] = useState('');
  const [designation, setDesignation] = useState('');
  const [subject, setSubject] = useState('');
  const [department, setDepartment] = useState('সাধারণ');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [isPublished, setIsPublished] = useState(true);

  const [teachers, setTeachers] = useState<any[]>([]);

  const loadTeachers = async () => {
    setLoading(true);
    setActionError(null);
    const res = await getAdminTeachers();
    if (res.error) {
      setActionError(res.error);
    } else {
      setTeachers(res.teachers);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadTeachers();
  }, []);

  const handleOpenModal = (teacher?: any) => {
    setActionError(null);
    if (teacher) {
      setEditingId(teacher.id);
      setName(teacher.name || '');
      setDesignation(teacher.designation || '');
      setSubject(teacher.subject || '');
      setDepartment(teacher.department || 'সাধারণ');
      setPhone(teacher.phone || '');
      setEmail(teacher.email || '');
      setIsPublished(teacher.is_published ?? true);
    } else {
      setEditingId(null);
      setName('');
      setDesignation('');
      setSubject('');
      setDepartment('সাধারণ');
      setPhone('');
      setEmail('');
      setIsPublished(true);
    }
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setActionError(null);

    const payload = {
      name,
      designation,
      subject,
      department,
      phone,
      email,
      is_published: isPublished,
    };

    let res;
    if (editingId) {
      res = await updateTeacherAction(editingId, payload);
    } else {
      res = await createTeacherAction(payload);
    }

    if (res.success) {
      setIsModalOpen(false);
      await loadTeachers();
    } else {
      setActionError(res.error || 'সংরক্ষণ করতে ব্যর্থ হয়েছে');
    }
    setSubmitting(false);
  };

  const handleDelete = async (id: string) => {
    if (confirm('আপনি কি নিশ্চিত যে এই শিক্ষকের প্রোফাইল মুছে ফেলতে চান?')) {
      const res = await deleteTeacherAction(id);
      if (res.success) {
        await loadTeachers();
      } else {
        alert(res.error || 'মুছতে ব্যর্থ হয়েছে');
      }
    }
  };

  const handleTogglePublish = async (id: string, currentStatus: boolean) => {
    const res = await toggleTeacherPublishAction(id, currentStatus);
    if (res.success) {
      await loadTeachers();
    } else {
      alert(res.error || 'স্ট্যাটাস পরিবর্তন করতে ব্যর্থ হয়েছে');
    }
  };

  const filteredTeachers = teachers.filter(
    (t) =>
      t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (t.department && t.department.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (t.designation && t.designation.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-6)', flexWrap: 'wrap', gap: 'var(--space-4)' }}>
        <div>
          <h2 style={{ fontSize: 'var(--text-xl)', color: 'var(--primary-900)', margin: 0 }}>
            শিক্ষক ও কর্মচারী ব্যবস্থাপনা
          </h2>
          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--neutral-600)', margin: 0 }}>
            শিক্ষকমণ্ডলী ও স্টাফদের প্রোফাইল যুক্ত এবং এডিট করুন
          </p>
        </div>

        <button
          onClick={() => handleOpenModal()}
          className="btn btn-primary"
          style={{ backgroundColor: 'var(--primary-700)', color: 'var(--white)', display: 'inline-flex', alignItems: 'center', gap: 'var(--space-2)' }}
        >
          <Plus size={18} />
          <span>নতুন শিক্ষক যুক্ত করুন</span>
        </button>
      </div>

      {actionError && (
        <div style={{ backgroundColor: '#fee2e2', color: '#dc2626', padding: 'var(--space-4)', borderRadius: 'var(--radius-md)', marginBottom: 'var(--space-4)' }}>
          {actionError}
        </div>
      )}

      <div className="admin-card" style={{ marginBottom: 'var(--space-6)', padding: 'var(--space-4)' }}>
        <div style={{ position: 'relative', maxWidth: '400px' }}>
          <input
            type="text"
            className="form-input"
            placeholder="শিক্ষকের নাম বা বিভাগ দিয়ে খুঁজুন..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ paddingLeft: '40px' }}
          />
          <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--neutral-400)' }} />
        </div>
      </div>

      <div className="admin-table-wrapper">
        <table className="admin-table">
          <thead>
            <tr>
              <th>শিক্ষকের নাম</th>
              <th>পদবী</th>
              <th>বিভাগ</th>
              <th>যোগাযোগ</th>
              <th>স্ট্যাটাস</th>
              <th style={{ textAlign: 'right' }}>অ্যাকশন</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', padding: 'var(--space-8)' }}>
                  <Loader2 className="animate-spin" size={24} style={{ margin: '0 auto' }} />
                  <p style={{ marginTop: 'var(--space-2)', color: 'var(--neutral-600)' }}>শিক্ষকদের তালিকা লোড হচ্ছে...</p>
                </td>
              </tr>
            ) : filteredTeachers.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', padding: 'var(--space-8)', color: 'var(--neutral-600)' }}>
                  কোনো শিক্ষক তথ্য পাওয়া যায়নি।
                </td>
              </tr>
            ) : (
              filteredTeachers.map((t) => (
                <tr key={t.id}>
                  <td>
                    <div style={{ fontWeight: 600, color: 'var(--primary-900)' }}>{t.name}</div>
                    {t.subject && <div style={{ fontSize: 'var(--text-xs)', color: 'var(--neutral-500)' }}>বিষয়: {t.subject}</div>}
                  </td>
                  <td><span style={{ fontSize: 'var(--text-xs)', color: 'var(--accent-gold-hover)', fontWeight: 600 }}>{t.designation}</span></td>
                  <td><span className="badge badge-academic">{t.department || 'সাধারণ'}</span></td>
                  <td>
                    <div style={{ fontSize: 'var(--text-xs)', color: 'var(--neutral-600)' }}>{t.phone || 'N/A'}</div>
                    <div style={{ fontSize: 'var(--text-xs)', color: 'var(--neutral-500)' }}>{t.email || ''}</div>
                  </td>
                  <td>
                    <button
                      onClick={() => handleTogglePublish(t.id, t.is_published)}
                      style={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        color: t.is_published ? 'var(--success)' : 'var(--neutral-400)',
                        fontSize: 'var(--text-xs)',
                        fontWeight: 600,
                      }}
                    >
                      {t.is_published ? <Eye size={16} /> : <EyeOff size={16} />}
                      <span>{t.is_published ? 'পাবলিশড' : 'খসড়া'}</span>
                    </button>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', gap: 'var(--space-2)' }}>
                      <button onClick={() => handleOpenModal(t)} style={{ background: 'none', border: 'none', color: 'var(--primary-700)', cursor: 'pointer' }}>
                        <Edit3 size={18} />
                      </button>
                      <button onClick={() => handleDelete(t.id)} style={{ background: 'none', border: 'none', color: 'var(--error)', cursor: 'pointer' }}>
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: 'var(--space-4)' }}>
          <div className="admin-card" style={{ width: '100%', maxWidth: '500px', maxHeight: '90vh', overflowY: 'auto' }}>
            <h3 style={{ fontSize: 'var(--text-lg)', color: 'var(--primary-900)', marginBottom: 'var(--space-4)' }}>
              {editingId ? 'শিক্ষকের প্রোফাইল এডিট' : 'নতুন শিক্ষক যুক্ত করুন'}
            </h3>

            <form onSubmit={handleSave}>
              <div className="form-group">
                <label className="form-label">শিক্ষকের পূর্ণ নাম *</label>
                <input type="text" required className="form-input" value={name} onChange={(e) => setName(e.target.value)} placeholder="যেমন: নূর মোহাম্মদ সরকার" />
              </div>

              <div className="form-group">
                <label className="form-label">পদবী *</label>
                <input type="text" required className="form-input" value={designation} onChange={(e) => setDesignation(e.target.value)} placeholder="যেমন: সহকারী শিক্ষক" />
              </div>

              <div className="form-group">
                <label className="form-label">পাঠদানের বিষয়</label>
                <input type="text" className="form-input" value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="যেমন: গণিত" />
              </div>

              <div className="form-group">
                <label className="form-label">বিভাগ</label>
                <input type="text" className="form-input" value={department} onChange={(e) => setDepartment(e.target.value)} placeholder="যেমন: বিজ্ঞান বিভাগ" />
              </div>

              <div className="form-group">
                <label className="form-label">ফোন নম্বর</label>
                <input type="text" className="form-input" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="01531927956" />
              </div>

              <div className="form-group">
                <label className="form-label">ইমেইল এড্রেস</label>
                <input type="email" className="form-input" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="teacher@school.edu.bd" />
              </div>

              <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                <input
                  type="checkbox"
                  id="isPublished"
                  checked={isPublished}
                  onChange={(e) => setIsPublished(e.target.checked)}
                />
                <label htmlFor="isPublished" className="form-label" style={{ margin: 0, cursor: 'pointer' }}>
                  পাবলিক ওয়েবসাইটে প্রদর্শন করুন (Published)
                </label>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-3)', marginTop: 'var(--space-6)' }}>
                <button type="button" onClick={() => setIsModalOpen(false)} className="btn btn-outline" disabled={submitting}>বাতিল</button>
                <button type="submit" className="btn btn-primary" style={{ backgroundColor: 'var(--primary-700)', color: 'var(--white)' }} disabled={submitting}>
                  {submitting ? 'সংরক্ষণ হচ্ছে...' : 'সংরক্ষণ'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
