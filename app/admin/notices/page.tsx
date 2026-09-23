'use client';

import React, { useState } from 'react';
import { Plus, Search, Trash2, Edit3, Eye, FileText, CheckCircle, XCircle } from 'lucide-react';

export default function NoticeManagementPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form states
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('সাধারণ');
  const [isImportant, setIsImportant] = useState(false);
  const [isPublished, setIsPublished] = useState(true);

  // Sample notices list
  const [notices, setNotices] = useState([
    {
      id: '1',
      title: 'বার্ষিক ক্রীড়া প্রতিযোগিতা ২০২৬ সংক্রান্ত বিজ্ঞপ্তি',
      description: 'আগামী ১৫ আগস্ট স্কুলে বার্ষিক ক্রীড়া প্রতিযোগিতা অনুষ্ঠিত হবে।',
      category: 'ইভেন্ট',
      pub_date: '2026-08-15',
      is_important: true,
      is_published: true,
    },
    {
      id: '2',
      title: 'অর্ধ-বার্ষিক পরীক্ষা ২০২৬ এর সময়সূচী',
      description: 'অর্ধ-বার্ষিক পরীক্ষার পূর্ণাঙ্গ রুটিন প্রকাশিত হলো।',
      category: 'পরীক্ষা',
      pub_date: '2026-08-10',
      is_important: false,
      is_published: true,
    },
  ]);

  const handleOpenModal = (notice?: any) => {
    if (notice) {
      setEditingId(notice.id);
      setTitle(notice.title);
      setDescription(notice.description || '');
      setCategory(notice.category || 'সাধারণ');
      setIsImportant(notice.is_important);
      setIsPublished(notice.is_published);
    } else {
      setEditingId(null);
      setTitle('');
      setDescription('');
      setCategory('সাধারণ');
      setIsImportant(false);
      setIsPublished(true);
    }
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      setNotices(notices.map(n => n.id === editingId ? {
        ...n, title, description, category, is_important: isImportant, is_published: isPublished
      } : n));
    } else {
      setNotices([
        {
          id: String(Date.now()),
          title,
          description,
          category,
          pub_date: new Date().toISOString().split('T')[0],
          is_important: isImportant,
          is_published: isPublished,
        },
        ...notices
      ]);
    }
    setIsModalOpen(false);
  };

  const handleDelete = (id: string) => {
    if (confirm('আপনি কি নিশ্চিত যে এই নোটিশটি মুছে ফেলতে চান?')) {
      setNotices(notices.filter(n => n.id !== id));
    }
  };

  const togglePublish = (id: string) => {
    setNotices(notices.map(n => n.id === id ? { ...n, is_published: !n.is_published } : n));
  };

  const filteredNotices = notices.filter(n =>
    n.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    n.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      {/* Header & Actions */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-6)', flexWrap: 'wrap', gap: 'var(--space-4)' }}>
        <div>
          <h2 style={{ fontSize: 'var(--text-xl)', color: 'var(--primary-900)', margin: 0 }}>
            নোটিশ ব্যবস্থাপনা
          </h2>
          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--neutral-600)', margin: 0 }}>
            স্কুলের নোটিশ বোর্ড ও ফাইল আপলোড পরিচালনা করুন
          </p>
        </div>

        <button
          onClick={() => handleOpenModal()}
          className="btn btn-primary"
          style={{ backgroundColor: 'var(--primary-700)', color: 'var(--white)', display: 'inline-flex', alignItems: 'center', gap: 'var(--space-2)' }}
        >
          <Plus size={18} />
          <span>নতুন নোটিশ প্রকাশ করুন</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="admin-card" style={{ marginBottom: 'var(--space-6)', padding: 'var(--space-4)' }}>
        <div style={{ position: 'relative', maxWidth: '400px' }}>
          <input
            type="text"
            className="form-input"
            placeholder="নোটিশ খুঁজুন..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ paddingLeft: '40px' }}
          />
          <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--neutral-400)' }} />
        </div>
      </div>

      {/* Table */}
      <div className="admin-table-wrapper">
        <table className="admin-table">
          <thead>
            <tr>
              <th>তারিখ</th>
              <th>শিরোনাম</th>
              <th>ক্যাটাগরি</th>
              <th>গুরুত্বপূর্ণ</th>
              <th>স্ট্যাটাস</th>
              <th style={{ textAlign: 'right' }}>অ্যাকশন</th>
            </tr>
          </thead>
          <tbody>
            {filteredNotices.map((notice) => (
              <tr key={notice.id}>
                <td>{notice.pub_date}</td>
                <td>
                  <div style={{ fontWeight: 600, color: 'var(--primary-900)' }}>{notice.title}</div>
                  <div style={{ fontSize: 'var(--text-xs)', color: 'var(--neutral-500)' }}>{notice.description}</div>
                </td>
                <td><span className="badge badge-academic">{notice.category}</span></td>
                <td>
                  {notice.is_important ? (
                    <span className="badge badge-admission">গুরুত্বপূর্ণ</span>
                  ) : (
                    <span style={{ color: 'var(--neutral-400)', fontSize: 'var(--text-xs)' }}>সাধারণ</span>
                  )}
                </td>
                <td>
                  <button
                    onClick={() => togglePublish(notice.id)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                  >
                    {notice.is_published ? (
                      <span style={{ color: 'var(--success)', display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: 'var(--text-xs)', fontWeight: 600 }}>
                        <CheckCircle size={16} /> প্রকাশিত
                      </span>
                    ) : (
                      <span style={{ color: 'var(--neutral-400)', display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: 'var(--text-xs)' }}>
                        <XCircle size={16} /> খসড়া
                      </span>
                    )}
                  </button>
                </td>
                <td style={{ textAlign: 'right' }}>
                  <div style={{ display: 'inline-flex', gap: 'var(--space-2)' }}>
                    <button
                      onClick={() => handleOpenModal(notice)}
                      style={{ background: 'none', border: 'none', color: 'var(--primary-700)', cursor: 'pointer', padding: '4px' }}
                    >
                      <Edit3 size={18} />
                    </button>
                    <button
                      onClick={() => handleDelete(notice.id)}
                      style={{ background: 'none', border: 'none', color: 'var(--error)', cursor: 'pointer', padding: '4px' }}
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal Form */}
      {isModalOpen && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 100,
          padding: 'var(--space-4)'
        }}>
          <div className="admin-card" style={{ width: '100%', maxWidth: '550px' }}>
            <h3 style={{ fontSize: 'var(--text-lg)', color: 'var(--primary-900)', marginBottom: 'var(--space-4)' }}>
              {editingId ? 'নোটিশ এডিট করুন' : 'নতুন নোটিশ যুক্ত করুন'}
            </h3>

            <form onSubmit={handleSave}>
              <div className="form-group">
                <label className="form-label">নোটিশের শিরোনাম *</label>
                <input
                  type="text"
                  required
                  className="form-input"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="যেমন: অর্ধ-বার্ষিক পরীক্ষা ২০২৬ এর সময়সূচী"
                />
              </div>

              <div className="form-group">
                <label className="form-label">ক্যাটাগরি</label>
                <select
                  className="form-select"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                >
                  <option value="সাধারণ">সাধারণ</option>
                  <option value="পরীক্ষা">পরীক্ষা</option>
                  <option value="ভর্তি">ভর্তি</option>
                  <option value="ইভেন্ট">ইভেন্ট</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">বিস্তারিত বিবরণ</label>
                <textarea
                  className="form-textarea"
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="নোটিশের বিস্তারিত অংশ এখানে লিখুন..."
                />
              </div>

              <div className="form-group" style={{ display: 'flex', gap: 'var(--space-6)', marginTop: 'var(--space-4)' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', cursor: 'pointer', fontSize: 'var(--text-sm)' }}>
                  <input
                    type="checkbox"
                    checked={isImportant}
                    onChange={(e) => setIsImportant(e.target.checked)}
                  />
                  গুরুত্বপূর্ণ নোটিশ হিসেবে চিহ্নিত করুন
                </label>

                <label style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', cursor: 'pointer', fontSize: 'var(--text-sm)' }}>
                  <input
                    type="checkbox"
                    checked={isPublished}
                    onChange={(e) => setIsPublished(e.target.checked)}
                  />
                  সরাসরি প্রকাশ করুন
                </label>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-3)', marginTop: 'var(--space-6)' }}>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="btn btn-outline"
                >
                  বাতিল করুন
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ backgroundColor: 'var(--primary-700)', color: 'var(--white)' }}
                >
                  সংরক্ষণ করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
