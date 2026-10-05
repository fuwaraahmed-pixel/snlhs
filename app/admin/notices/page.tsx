'use client';

import React, { useState, useEffect } from 'react';
import {
  Plus, Search, Trash2, Edit3, CheckCircle, XCircle, FileText,
  Download, Loader2, AlertCircle, Bell, X, Filter
} from 'lucide-react';
import { uploadFileToStorage } from '@/lib/storage/upload';
import { getStoragePublicUrl } from '@/lib/storage/url-builder';
import { validateFileUploadServerAction } from '@/lib/actions/upload-actions';
import {
  getAdminNotices,
  createNoticeAction,
  updateNoticeAction,
  deleteNoticeAction,
  toggleNoticePublishAction,
} from '@/lib/actions/notices-actions';

interface NoticeItem {
  id: string;
  title: string;
  description: string | null;
  category: string;
  pub_date: string;
  attachment_url: string | null;
  attachment_original_name: string | null;
  is_important: boolean;
  is_published: boolean;
}

const CATEGORIES = ['সব', 'সাধারণ', 'পরীক্ষা', 'ভর্তি', 'ইভেন্ট'];

const categoryBadgeClass: Record<string, string> = {
  'সাধারণ': 'badge-academic',
  'পরীক্ষা': 'badge-exam',
  'ভর্তি': 'badge-admission',
  'ইভেন্ট': 'badge-event',
};

export default function NoticeManagementPage() {
  const [notices, setNotices] = useState<NoticeItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('সব');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form states
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('সাধারণ');
  const [isImportant, setIsImportant] = useState(false);
  const [isPublished, setIsPublished] = useState(true);

  // Attachment states
  const [attachmentRelativePath, setAttachmentRelativePath] = useState<string | null>(null);
  const [attachmentOriginalName, setAttachmentOriginalName] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [schoolId, setSchoolId] = useState<string | null>(null);

  const loadNotices = async () => {
    setLoading(true);
    setErrorMsg(null);
    const res = await getAdminNotices();
    if (res.error) {
      setErrorMsg(res.error);
    } else {
      setNotices(res.notices || []);
      if (res.schoolId) setSchoolId(res.schoolId);
    }
    setLoading(false);
  };

  useEffect(() => { loadNotices(); }, []);

  const handleOpenModal = (notice?: NoticeItem) => {
    setUploadError(null);
    setErrorMsg(null);
    if (notice) {
      setEditingId(notice.id);
      setTitle(notice.title);
      setDescription(notice.description || '');
      setCategory(notice.category || 'সাধারণ');
      setIsImportant(notice.is_important);
      setIsPublished(notice.is_published);
      setAttachmentRelativePath(notice.attachment_url);
      setAttachmentOriginalName(notice.attachment_original_name);
    } else {
      setEditingId(null);
      setTitle(''); setDescription(''); setCategory('সাধারণ');
      setIsImportant(false); setIsPublished(true);
      setAttachmentRelativePath(null); setAttachmentOriginalName(null);
    }
    setIsModalOpen(true);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!schoolId) { setUploadError('স্কুল আইডি লোড করতে ব্যর্থ।'); return; }
    setUploadError(null);
    setIsUploading(true);
    try {
      const sv = await validateFileUploadServerAction('notice-files', file.name, file.size, file.type);
      if (!sv.success) { setUploadError(sv.error || 'ভ্যালিডেশন ব্যর্থ।'); setIsUploading(false); return; }
      const res = await uploadFileToStorage({ file, bucket: 'notice-files', folder: 'notices', schoolId });
      setAttachmentRelativePath(res.relativePath);
      setAttachmentOriginalName(res.originalName);
    } catch (err: any) {
      setUploadError(err.message || 'ফাইল আপলোড ব্যর্থ।');
    }
    setIsUploading(false);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg(null); setSuccessMsg(null);
    const payload = { title, description, category, is_important: isImportant, is_published: isPublished, attachment_url: attachmentRelativePath, attachment_original_name: attachmentOriginalName };
    const result = editingId ? await updateNoticeAction(editingId, payload) : await createNoticeAction(payload);
    setIsSubmitting(false);
    if (result.success) {
      setSuccessMsg(editingId ? 'নোটিশ আপডেট হয়েছে।' : 'নতুন নোটিশ প্রকাশিত হয়েছে।');
      setIsModalOpen(false);
      loadNotices();
      setTimeout(() => setSuccessMsg(null), 4000);
    } else {
      setErrorMsg(result.error || 'অপারেশন ব্যর্থ।');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('এই নোটিশটি মুছে ফেলবেন?')) return;
    setErrorMsg(null); setSuccessMsg(null);
    const res = await deleteNoticeAction(id);
    if (res.success) { setSuccessMsg('নোটিশ মুছে ফেলা হয়েছে।'); loadNotices(); setTimeout(() => setSuccessMsg(null), 4000); }
    else setErrorMsg(res.error || 'মুছতে ব্যর্থ।');
  };

  const handleTogglePublish = async (id: string, currentStatus: boolean) => {
    const res = await toggleNoticePublishAction(id, currentStatus);
    if (res.success) loadNotices();
    else setErrorMsg(res.error || 'স্ট্যাটাস পরিবর্তন ব্যর্থ।');
  };

  const filteredNotices = notices.filter((n) => {
    const matchSearch = n.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchCat = activeCategory === 'সব' || n.category === activeCategory;
    return matchSearch && matchCat;
  });

  return (
    <div>
      {/* Page Header */}
      <div className="page-header">
        <div className="page-header-left">
          <h1 className="page-title">
            নোটিশ বোর্ড
            <span className="page-title-count">{notices.length}টি</span>
          </h1>
          <p className="page-subtitle">স্কুলের নোটিশ ও পিডিএফ ফাইল পরিচালনা করুন</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="btn btn-primary"
        >
          <Plus size={17} />
          নতুন নোটিশ প্রকাশ করুন
        </button>
      </div>

      {/* Alerts */}
      {errorMsg && (
        <div className="alert alert-error">
          <AlertCircle size={17} /> {errorMsg}
        </div>
      )}
      {successMsg && (
        <div className="alert alert-success">
          <CheckCircle size={17} /> {successMsg}
        </div>
      )}

      {/* Search + Filter Bar */}
      <div className="admin-card card-sm" style={{ marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
          <div className="search-bar-wrap" style={{ flex: 1, minWidth: '220px', maxWidth: '360px' }}>
            <Search size={16} className="search-bar-icon" />
            <input
              type="text"
              className="search-bar-input"
              placeholder="নোটিশ খুঁজুন..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
            <Filter size={14} color="#94a3b8" />
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                style={{
                  padding: '5px 14px',
                  borderRadius: '9999px',
                  fontSize: '12px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  border: '1px solid',
                  transition: 'all 0.13s',
                  background: activeCategory === cat ? '#1b365d' : '#f8fafc',
                  color: activeCategory === cat ? '#fff' : '#475569',
                  borderColor: activeCategory === cat ? '#1b365d' : '#d4dde9',
                }}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="spinner-wrap">
          <Loader2 size={30} className="animate-spin" style={{ color: '#1b365d' }} />
          <p style={{ marginTop: '10px', fontSize: '13px' }}>নোটিশ তালিকা লোড হচ্ছে...</p>
        </div>
      ) : filteredNotices.length === 0 ? (
        <div className="admin-card">
          <div className="empty-state">
            <div className="empty-state-icon">📋</div>
            <p className="empty-state-title">কোনো নোটিশ পাওয়া যায়নি</p>
            <p className="empty-state-desc">নতুন নোটিশ যোগ করতে উপরের বাটনে ক্লিক করুন।</p>
            <button className="btn btn-primary" onClick={() => handleOpenModal()}>
              <Plus size={16} /> নোটিশ প্রকাশ করুন
            </button>
          </div>
        </div>
      ) : (
        <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>তারিখ</th>
                <th>শিরোনাম</th>
                <th>ক্যাটাগরি</th>
                <th>সংযুক্তি</th>
                <th>স্ট্যাটাস</th>
                <th style={{ textAlign: 'right' }}>অ্যাকশন</th>
              </tr>
            </thead>
            <tbody>
              {filteredNotices.map((notice) => {
                const publicDownloadUrl = getStoragePublicUrl('notice-files', notice.attachment_url);
                return (
                  <tr key={notice.id}>
                    <td>
                      <span style={{ fontSize: '12px', color: '#64748b', whiteSpace: 'nowrap' }}>
                        {notice.pub_date}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', maxWidth: '300px' }}>
                        {notice.is_important && (
                          <span style={{ color: '#e11d48', fontSize: '10px', fontWeight: 800, background: '#fff1f2', border: '1px solid #fecdd3', borderRadius: '4px', padding: '1px 5px', whiteSpace: 'nowrap', marginTop: '2px', flexShrink: 0 }}>
                            ★ গুরুত্বপূর্ণ
                          </span>
                        )}
                        <div>
                          <div style={{ fontWeight: 600, color: '#0f1d38', fontSize: '13.5px', lineHeight: 1.4 }}>
                            {notice.title}
                          </div>
                          {notice.description && (
                            <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '240px' }}>
                              {notice.description}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className={`badge ${categoryBadgeClass[notice.category] || 'badge-academic'}`}>
                        {notice.category}
                      </span>
                    </td>
                    <td>
                      {notice.attachment_url ? (
                        <a
                          href={publicDownloadUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="btn btn-outline btn-sm"
                          style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}
                        >
                          <FileText size={13} color="#1b365d" />
                          <span style={{ maxWidth: '100px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {notice.attachment_original_name || 'PDF'}
                          </span>
                          <Download size={11} />
                        </a>
                      ) : (
                        <span style={{ fontSize: '12px', color: '#cbd5e1' }}>—</span>
                      )}
                    </td>
                    <td>
                      <button
                        onClick={() => handleTogglePublish(notice.id, notice.is_published)}
                        className={`status-toggle ${notice.is_published ? 'published' : 'draft'}`}
                      >
                        {notice.is_published ? <CheckCircle size={13} /> : <XCircle size={13} />}
                        {notice.is_published ? 'প্রকাশিত' : 'খসড়া'}
                      </button>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '4px', justifyContent: 'flex-end' }}>
                        <button className="action-btn edit" onClick={() => handleOpenModal(notice)} title="এডিট">
                          <Edit3 size={16} />
                        </button>
                        <button className="action-btn delete" onClick={() => handleDelete(notice.id)} title="মুছুন">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-box" style={{ maxWidth: '560px' }}>
            <div className="modal-header">
              <h2 className="modal-title">
                {editingId ? '📝 নোটিশ এডিট করুন' : '📢 নতুন নোটিশ প্রকাশ করুন'}
              </h2>
              <button className="modal-close-btn" onClick={() => setIsModalOpen(false)}>
                <X size={17} />
              </button>
            </div>
            <div className="modal-body">
              {errorMsg && (
                <div className="alert alert-error" style={{ marginBottom: '16px' }}>
                  <AlertCircle size={16} /> {errorMsg}
                </div>
              )}
              <form onSubmit={handleSave}>
                <div className="form-group">
                  <label className="form-label">নোটিশের শিরোনাম *</label>
                  <input
                    type="text"
                    required
                    className="form-input"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="যেমন: অর্ধ-বার্ষিক পরীক্ষার সময়সূচী"
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">ক্যাটাগরি</label>
                    <select className="form-select" value={category} onChange={(e) => setCategory(e.target.value)}>
                      <option value="সাধারণ">সাধারণ</option>
                      <option value="পরীক্ষা">পরীক্ষা</option>
                      <option value="ভর্তি">ভর্তি</option>
                      <option value="ইভেন্ট">ইভেন্ট</option>
                    </select>
                  </div>
                  <div style={{ margin: 0 }}>
                    <label className="form-label">বিকল্পসমূহ</label>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', paddingTop: '4px' }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '13px', color: '#334155' }}>
                        <input type="checkbox" checked={isImportant} onChange={(e) => setIsImportant(e.target.checked)} style={{ accentColor: '#e11d48' }} />
                        ⭐ গুরুত্বপূর্ণ নোটিশ
                      </label>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '13px', color: '#334155' }}>
                        <input type="checkbox" checked={isPublished} onChange={(e) => setIsPublished(e.target.checked)} style={{ accentColor: '#059669' }} />
                        ✅ সরাসরি প্রকাশ করুন
                      </label>
                    </div>
                  </div>
                </div>

                {/* File Upload */}
                <div className="form-group" style={{ marginTop: '14px' }}>
                  <label className="form-label">পিডিএফ / ফাইল সংযুক্তি</label>
                  <div style={{
                    border: '2px dashed #d4dde9', borderRadius: '10px',
                    padding: '16px', textAlign: 'center', background: '#f8fafc',
                    transition: 'border-color 0.15s',
                  }}>
                    <input
                      type="file"
                      accept=".pdf,.docx"
                      onChange={handleFileChange}
                      id="notice-file-upload"
                      style={{ display: 'none' }}
                    />
                    {attachmentOriginalName && !isUploading ? (
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                        <FileText size={18} color="#059669" />
                        <span style={{ fontSize: '13px', fontWeight: 600, color: '#059669' }}>
                          {attachmentOriginalName}
                        </span>
                        <button type="button" onClick={() => { setAttachmentRelativePath(null); setAttachmentOriginalName(null); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#dc2626', padding: '2px' }}>
                          <X size={14} />
                        </button>
                      </div>
                    ) : isUploading ? (
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', color: '#1b365d' }}>
                        <Loader2 size={18} className="animate-spin" />
                        <span style={{ fontSize: '13px' }}>আপলোড হচ্ছে...</span>
                      </div>
                    ) : (
                      <label htmlFor="notice-file-upload" style={{ cursor: 'pointer' }}>
                        <Download size={22} color="#94a3b8" style={{ margin: '0 auto 6px' }} />
                        <p style={{ fontSize: '13px', color: '#64748b', margin: 0 }}>
                          <span style={{ color: '#1b365d', fontWeight: 600 }}>ফাইল বেছে নিন</span> বা এখানে ড্র্যাগ করুন
                        </p>
                        <p style={{ fontSize: '11px', color: '#94a3b8', margin: '4px 0 0' }}>PDF, DOCX • সর্বোচ্চ ১০MB</p>
                      </label>
                    )}
                    {uploadError && (
                      <p style={{ fontSize: '12px', color: '#dc2626', marginTop: '8px', margin: '8px 0 0' }}>⚠️ {uploadError}</p>
                    )}
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">বিস্তারিত বিবরণ (ঐচ্ছিক)</label>
                  <textarea
                    className="form-textarea"
                    rows={3}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="নোটিশের বিস্তারিত বিবরণ..."
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', paddingTop: '8px' }}>
                  <button type="button" onClick={() => setIsModalOpen(false)} className="btn btn-outline">
                    বাতিল
                  </button>
                  <button
                    type="submit"
                    disabled={isUploading || isSubmitting}
                    className="btn btn-primary"
                  >
                    {isSubmitting && <Loader2 size={15} className="animate-spin" />}
                    {isSubmitting ? 'সংরক্ষণ হচ্ছে...' : 'সংরক্ষণ করুন'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
