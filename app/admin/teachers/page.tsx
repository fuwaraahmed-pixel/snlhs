'use client';

import React, { useState } from 'react';
import { Plus, Search, Trash2, Edit3, UserCheck, ShieldAlert } from 'lucide-react';

export default function TeacherManagementPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [name, setName] = useState('');
  const [designation, setDesignation] = useState('');
  const [department, setDepartment] = useState('সাধারণ');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');

  const [teachers, setTeachers] = useState([
    { id: '1', name: 'নূর মোহাম্মদ সরকার (সাগর)', designation: 'ভারপ্রাপ্ত প্রধান শিক্ষক', department: 'প্রশাসন', phone: '01700000000', email: 'principal@school.edu.bd' },
    { id: '2', name: 'মো: জহিরুল ইসলাম', designation: 'সহকারী প্রধান শিক্ষক', department: 'গণিত বিভাগ', phone: '01800000000', email: 'zahirul@school.edu.bd' },
    { id: '3', name: 'প্রান্তর স্নাল', designation: 'সহকারী শিক্ষক', department: 'ইংরেজি বিভাগ', phone: '01900000000', email: 'prantor@school.edu.bd' },
  ]);

  const handleOpenModal = (teacher?: any) => {
    if (teacher) {
      setEditingId(teacher.id);
      setName(teacher.name);
      setDesignation(teacher.designation);
      setDepartment(teacher.department || 'সাধারণ');
      setPhone(teacher.phone || '');
      setEmail(teacher.email || '');
    } else {
      setEditingId(null);
      setName('');
      setDesignation('');
      setDepartment('সাধারণ');
      setPhone('');
      setEmail('');
    }
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      setTeachers(teachers.map(t => t.id === editingId ? { ...t, name, designation, department, phone, email } : t));
    } else {
      setTeachers([...teachers, { id: String(Date.now()), name, designation, department, phone, email }]);
    }
    setIsModalOpen(false);
  };

  const handleDelete = (id: string) => {
    if (confirm('আপনি কি নিশ্চিত যে এই শিক্ষকের প্রোফাইল মুছে ফেলতে চান?')) {
      setTeachers(teachers.filter(t => t.id !== id));
    }
  };

  const filteredTeachers = teachers.filter(t =>
    t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.department.toLowerCase().includes(searchTerm.toLowerCase())
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
              <th style={{ textAlign: 'right' }}>অ্যাকশন</th>
            </tr>
          </thead>
          <tbody>
            {filteredTeachers.map((t) => (
              <tr key={t.id}>
                <td>
                  <div style={{ fontWeight: 600, color: 'var(--primary-900)' }}>{t.name}</div>
                </td>
                <td><span style={{ fontSize: 'var(--text-xs)', color: 'var(--accent-gold-hover)', fontWeight: 600 }}>{t.designation}</span></td>
                <td><span className="badge badge-academic">{t.department}</span></td>
                <td>
                  <div style={{ fontSize: 'var(--text-xs)', color: 'var(--neutral-600)' }}>{t.phone}</div>
                  <div style={{ fontSize: 'var(--text-xs)', color: 'var(--neutral-500)' }}>{t.email}</div>
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
            ))}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: 'var(--space-4)' }}>
          <div className="admin-card" style={{ width: '100%', maxWidth: '500px' }}>
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
                <label className="form-label">বিভাগ</label>
                <input type="text" className="form-input" value={department} onChange={(e) => setDepartment(e.target.value)} placeholder="যেমন: গণিত বিভাগ" />
              </div>

              <div className="form-group">
                <label className="form-label">ফোন নম্বর</label>
                <input type="text" className="form-input" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="01531927956" />
              </div>

              <div className="form-group">
                <label className="form-label">ইমেইল এড্রেস</label>
                <input type="email" className="form-input" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="teacher@school.edu.bd" />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-3)', marginTop: 'var(--space-6)' }}>
                <button type="button" onClick={() => setIsModalOpen(false)} className="btn btn-outline">বাতিল</button>
                <button type="submit" className="btn btn-primary" style={{ backgroundColor: 'var(--primary-700)', color: 'var(--white)' }}>সংরক্ষণ</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
