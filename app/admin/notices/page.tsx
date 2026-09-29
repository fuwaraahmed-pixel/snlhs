'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Search, Trash2, Edit3, CheckCircle, XCircle, FileText, Download, Loader2, AlertCircle } from 'lucide-react';
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

export default function NoticeManagementPage() {
  const [notices, setNotices] = useState<NoticeItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form states
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('সাধারণ');
  const [isImportant, setIsImportant] = useState(false);
  const [isPublished, setIsPublished] = useState(true);

  // Attachment file upload states
  const [attachmentRelativePath, setAttachmentRelativePath] = useState<string | null>(null);
  const [attachmentOriginalName, setAttachmentOriginalName] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const [schoolId, setSchoolId] = useState<string | null>(null);

  // Load notices from Supabase
  const loadNotices = async () => {
    setLoading(true);
    setErrorMsg(null);
    const res = await getAdminNotices();
    if (res.error) {
      setErrorMsg(res.error);
    } else {
      setNotices(res.notices || []);
      if (res.schoolId) {
        setSchoolId(res.schoolId);
      }
    }
    setLoading(false);
  };

  useEffect(() => {
    loadNotices();
  }, []);

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
      setTitle('');
      setDescription('');
      setCategory('সাধারণ');
      setIsImportant(false);
      setIsPublished(true);
      setAttachmentRelativePath(null);
      setAttachmentOriginalName(null);
    }
    setIsModalOpen(true);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!schoolId) {
      setUploadError('স্কুল আইডি লোড করতে ব্যর্থ হয়েছে। অনুগ্রহ করে পেজ রিফ্রেশ করুন।');
      return;
    }

    setUploadError(null);
    setIsUploading(true);

    try {
      // 1. Server action validation
      const serverValidation = await validateFileUploadServerAction(
        'notice-files',
        file.name,
        file.size,
        file.type
      );

      if (!serverValidation.success) {
        setUploadError(serverValidation.error || 'সার্ভার ভ্যালিডেশন ব্যর্থ হয়েছে।');
        setIsUploading(false);
        return;
      }

      // 2. Upload file & store bucket-relative path {schoolId}/notices/{timestamp}_{random}.ext
      const uploadRes = await uploadFileToStorage({
        file,
        bucket: 'notice-files',
        folder: 'notices',
        schoolId,
      });

      setAttachmentRelativePath(uploadRes.relativePath);
      setAttachmentOriginalName(uploadRes.originalName);
      setIsUploading(false);
    } catch (err: any) {
      setUploadError(err.message || 'ফাইল আপলোড ব্যর্থ হয়েছে।');
      setIsUploading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    const payload = {
      title,
      description,
      category,
      is_important: isImportant,
      is_published: isPublished,
      attachment_url: attachmentRelativePath,
      attachment_original_name: attachmentOriginalName,
    };

    let result;
    if (editingId) {
      result = await updateNoticeAction(editingId, payload);
    } else {
      result = await createNoticeAction(payload);
    }

    setIsSubmitting(false);

    if (result.success) {
      setSuccessMsg(editingId ? 'নোটিশ সফলভাবে আপডেট করা হয়েছে।' : 'নতুন নোটিশ সফলভাবে প্রকাশ করা হয়েছে।');
      setIsModalOpen(false);
      loadNotices();
    } else {
      setErrorMsg(result.error || 'অপারেশন ব্যর্থ হয়েছে।');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('আপনি কি নিশ্চিত যে এই নোটিশটি মুছে ফেলতে চান?')) return;

    setErrorMsg(null);
    setSuccessMsg(null);
    const res = await deleteNoticeAction(id);
    if (res.success) {
      setSuccessMsg('নোটিশ সফলভাবে মুছে ফেলা হয়েছে।');
      loadNotices();
    } else {
      setErrorMsg(res.error || 'নোটিশ মুছতে ব্যর্থ হয়েছে।');
    }
  };

  const handleTogglePublish = async (id: string, currentStatus: boolean) => {
    setErrorMsg(null);
    setSuccessMsg(null);
    const res = await toggleNoticePublishAction(id, currentStatus);
    if (res.success) {
      setSuccessMsg('নোটিশের প্রকাশনা স্থিতি পরিবর্তন করা হয়েছে।');
      loadNotices();
    } else {
      setErrorMsg(res.error || 'স্থিতি পরিবর্তন করতে ব্যর্থ হয়েছে।');
    }
  };

  const filteredNotices = notices.filter((n) =>
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
            স্কুলের নোটিশ বোর্ড ও পিডিএফ ফাইল আপলোড পরিচালনা করুন
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

      {/* Global Alerts */}
      {errorMsg && (
        <div style={{ padding: 'var(--space-3) var(--space-4)', backgroundColor: '#fde8e8', color: '#9b1c1c', borderRadius: 'var(--radius-md)', marginBottom: 'var(--space-4)', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <AlertCircle size={18} />
          <span>{errorMsg}</span>
        </div>
      )}

      {successMsg && (
        <div style={{ padding: 'var(--space-3) var(--space-4)', backgroundColor: '#def7ec', color: '#03543f', borderRadius: 'var(--radius-md)', marginBottom: 'var(--space-4)', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <CheckCircle size={18} />
          <span>{successMsg}</span>
        </div>
      )}

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

      {/* Loading & Empty States */}
      {loading ? (
        <div style={{ padding: 'var(--space-12)', textAlign: 'center', color: 'var(--neutral-500)' }}>
          <Loader2 size={32} className="animate-spin" style={{ margin: '0 auto var(--space-2)' }} />
          <p>নোটিশ তালিকা লোড হচ্ছে...</p>
        </div>
      ) : filteredNotices.length === 0 ? (
        <div className="admin-card" style={{ padding: 'var(--space-12)', textAlign: 'center', color: 'var(--neutral-500)' }}>
          <FileText size={48} style={{ margin: '0 auto var(--space-4)', opacity: 0.4 }} />
          <h3 style={{ fontSize: 'var(--text-lg)', color: 'var(--primary-900)', marginBottom: 'var(--space-2)' }}>কোনো নোটিশ পাওয়া যায়নি</h3>
          <p style={{ fontSize: 'var(--text-sm)', marginBottom: 'var(--space-4)' }}>নতুন নোটিশ যোগ করতে উপরের বাটনে ক্লিক করুন।</p>
        </div>
      ) : (
        /* Table */
        <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>তারিখ</th>
                <th>শিরোনাম</th>
                <th>ক্যাটাগরি</th>
                <th>সংযুক্তি (Attachment)</th>
                <th>স্ট্যাটাস</th>
                <th style={{ textAlign: 'right' }}>অ্যাকশন</th>
              </tr>
            </thead>
            <tbody>
              {filteredNotices.map((notice) => {
                const publicDownloadUrl = getStoragePublicUrl('notice-files', notice.attachment_url);
                return (
                  <tr key={notice.id}>
                    <td>{notice.pub_date}</td>
                    <td>
                      <div style={{ fontWeight: 600, color: 'var(--primary-900)' }}>{notice.title}</div>
                      {notice.description && (
                        <div style={{ fontSize: 'var(--text-xs)', color: 'var(--neutral-500)' }}>{notice.description}</div>
                      )}
                    </td>
                    <td><span className="badge badge-academic">{notice.category}</span></td>
                    <td>
                      {notice.attachment_url ? (
                        <a
                          href={publicDownloadUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="btn btn-outline btn-sm"
                          style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: 'var(--text-xs)' }}
                        >
                          <FileText size={14} color="var(--primary-700)" />
                          <span>{notice.attachment_original_name || 'ডাউনলোড PDF'}</span>
                          <Download size={12} />
                        </a>
                      ) : (
                        <span style={{ fontSize: 'var(--text-xs)', color: 'var(--neutral-400)' }}>নাই</span>
                      )}
                    </td>
                    <td>
                      <button
                        onClick={() => handleTogglePublish(notice.id, notice.is_published)}
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
                );
              })}
            </tbody>
          </table>
        </div>
      )}

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
                  placeholder="যেমন: অর্ধ-バー্ষিক পরীক্ষা ২০২৬ এর সময়সূচী"
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

              {/* Attachment File Upload Widget */}
              <div className="form-group">
                <label className="form-label">পিডিএফ / ফাইল সংযুক্তি (PDF / DOCX)</label>
                <input
                  type="file"
                  accept=".pdf,.docx"
                  onChange={handleFileChange}
                  className="form-input"
                  style={{ padding: '8px' }}
                />
                {isUploading && (
                  <p style={{ fontSize: 'var(--text-xs)', color: 'var(--primary-700)', marginTop: '4px' }}>
                    ফাইল আপলোড হচ্ছে...
                  </p>
                )}
                {uploadError && (
                  <p style={{ fontSize: 'var(--text-xs)', color: 'var(--error)', marginTop: '4px' }}>
                    ⚠️ {uploadError}
                  </p>
                )}
                {attachmentOriginalName && !isUploading && (
                  <p style={{ fontSize: 'var(--text-xs)', color: 'var(--success)', marginTop: '4px', fontWeight: 600 }}>
                    ✓ সংযুক্ত ফাইল: {attachmentOriginalName}
                  </p>
                )}
              </div>

              <div className="form-group">
                <label className="form-label">বিস্তারিত বিবরণ</label>
                <textarea
                  className="form-textarea"
                  rows={3}
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
                  গুরুত্বপূর্ণ নোটিশ
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
                  disabled={isUploading || isSubmitting}
                  className="btn btn-primary"
                  style={{ backgroundColor: 'var(--primary-700)', color: 'var(--white)', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                >
                  {isSubmitting && <Loader2 size={16} className="animate-spin" />}
                  <span>সংরক্ষণ করুন</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
