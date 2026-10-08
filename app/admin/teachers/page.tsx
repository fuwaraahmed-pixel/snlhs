'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Plus, Search, Trash2, Edit3, Eye, EyeOff,
  Loader2, Camera, X, Users, AlertCircle, CheckCircle, ChevronLeft, ChevronRight
} from 'lucide-react';
import {
  getAdminTeachers,
  createTeacherAction,
  updateTeacherAction,
  deleteTeacherAction,
  toggleTeacherPublishAction,
} from '@/lib/actions/teachers-actions';
import DeleteConfirmModal from '@/components/DeleteConfirmModal';
import { uploadTeacherPhotoAction } from '@/lib/actions/upload-actions';

const DEPT_COLORS: Record<string, { bg: string; color: string; border: string }> = {
  'প্রশাসন':   { bg: '#eff6ff', color: '#1b365d', border: '#c7d7f0' },
  'বিজ্ঞান':  { bg: '#f0fdf4', color: '#15803d', border: '#bbf7d0' },
  'গণিত':     { bg: '#fff7ed', color: '#c2410c', border: '#fed7aa' },
  'ইংরেজি':  { bg: '#faf5ff', color: '#7c3aed', border: '#ddd6fe' },
  'আইসিটি':   { bg: '#ecfdf5', color: '#059669', border: '#a7f3d0' },
  'সাধারণ':   { bg: '#f8fafc', color: '#475569', border: '#d4dde9' },
};

const getDeptStyle = (dept: string) => DEPT_COLORS[dept] || DEPT_COLORS['সাধারণ'];

const getInitials = (name: string) =>
  name ? name.trim().split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase() : '?';

const PAGE_SIZE = 20;

export default function TeacherManagementPage() {
  const [teachers, setTeachers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [photoUploading, setPhotoUploading] = useState(false);
  const [photoUploadError, setPhotoUploadError] = useState<string | null>(null);
  const photoInputRef = useRef<HTMLInputElement>(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalTeachers, setTotalTeachers] = useState(0);
  const totalPages = Math.max(1, Math.ceil(totalTeachers / PAGE_SIZE));

  // Delete modal state
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [teacherToDelete, setTeacherToDelete] = useState<any | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [name, setName] = useState('');
  const [designation, setDesignation] = useState('');
  const [subject, setSubject] = useState('');
  const [department, setDepartment] = useState('সাধারণ');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [biography, setBiography] = useState('');
  const [isPublished, setIsPublished] = useState(true);

  const loadTeachers = useCallback(async (page: number = 1) => {
    setLoading(true); setActionError(null);
    const res = await getAdminTeachers(page, PAGE_SIZE);
    if (res.error) setActionError(res.error);
    else {
      setTeachers(res.teachers);
      setTotalTeachers(res.total);
    }
    setLoading(false);
  }, []);

  useEffect(() => { loadTeachers(1); }, [loadTeachers]);

  const goToPage = (page: number) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
    setSearchTerm('');
    loadTeachers(page);
  };

  const handleOpenModal = (teacher?: any) => {
    setActionError(null); setPhotoUploadError(null);
    if (teacher) {
      setEditingId(teacher.id); setName(teacher.name || '');
      setDesignation(teacher.designation || ''); setSubject(teacher.subject || '');
      setDepartment(teacher.department || 'সাধারণ'); setPhone(teacher.phone || '');
      setEmail(teacher.email || ''); setPhotoUrl(teacher.photo_url || null);
      setBiography(teacher.biography || ''); setIsPublished(teacher.is_published ?? true);
    } else {
      setEditingId(null); setName(''); setDesignation(''); setSubject('');
      setDepartment('সাধারণ'); setPhone(''); setEmail('');
      setPhotoUrl(null); setBiography(''); setIsPublished(true);
    }
    setIsModalOpen(true);
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return;
    setPhotoUploading(true); setPhotoUploadError(null);
    const fd = new FormData(); fd.append('file', file);
    const res = await uploadTeacherPhotoAction(fd);
    if (res.success && res.publicUrl) setPhotoUrl(res.publicUrl);
    else setPhotoUploadError(res.error || 'ছবি আপলোড ব্যর্থ');
    setPhotoUploading(false);
    if (photoInputRef.current) photoInputRef.current.value = '';
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault(); setSubmitting(true); setActionError(null);
    const payload = { name, designation, subject, department, phone, email, photo_url: photoUrl, biography, is_published: isPublished };
    const res = editingId ? await updateTeacherAction(editingId, payload) : await createTeacherAction(payload);
    if (res.success) {
      setIsModalOpen(false);
      setActionSuccess(editingId ? 'প্রোফাইল আপডেট হয়েছে।' : 'নতুন শিক্ষক যুক্ত হয়েছে।');
      setTimeout(() => setActionSuccess(null), 4000);
      await loadTeachers(currentPage);
    } else setActionError(res.error || 'সংরক্ষণ ব্যর্থ');
    setSubmitting(false);
  };

  const promptDelete = (teacher: any) => {
    setTeacherToDelete(teacher);
    setDeleteModalOpen(true);
  };

  const confirmDeleteTeacher = async () => {
    if (!teacherToDelete) return;
    setIsDeleting(true);
    setActionError(null);
    const res = await deleteTeacherAction(teacherToDelete.id);
    setIsDeleting(false);
    setDeleteModalOpen(false);
    if (res.success) {
      setActionSuccess('প্রোফাইল মুছে ফেলা হয়েছে।');
      setTeacherToDelete(null);
      setTimeout(() => setActionSuccess(null), 4000);
      const nextPage = teachers.length === 1 && currentPage > 1 ? currentPage - 1 : currentPage;
      setCurrentPage(nextPage);
      await loadTeachers(nextPage);
    } else {
      setActionError(res.error || 'মুছতে ব্যর্থ');
    }
  };

  const handleTogglePublish = async (id: string, s: boolean) => {
    const res = await toggleTeacherPublishAction(id, s);
    if (res.success) await loadTeachers(currentPage);
    else setActionError(res.error || 'স্ট্যাটাস পরিবর্তন ব্যর্থ');
  };

  const filteredTeachers = teachers.filter((t) =>
    t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (t.department && t.department.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (t.designation && t.designation.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div>
      {/* Page Header */}
      <div className="page-header">
        <div className="page-header-left">
          <h1 className="page-title">
            শিক্ষক ও কর্মচারী
            <span className="page-title-count">{totalTeachers}জন</span>
          </h1>
          <p className="page-subtitle">শিক্ষকমণ্ডলী ও স্টাফদের প্রোফাইল পরিচালনা করুন</p>
        </div>
        <button className="btn btn-primary" onClick={() => handleOpenModal()}>
          <Plus size={17} /> নতুন শিক্ষক যুক্ত করুন
        </button>
      </div>

      {actionError && <div className="alert alert-error"><AlertCircle size={16} /> {actionError}</div>}
      {actionSuccess && <div className="alert alert-success"><CheckCircle size={16} /> {actionSuccess}</div>}

      {/* Search */}
      <div className="admin-card card-sm" style={{ marginBottom: '20px' }}>
        <div className="search-bar-wrap" style={{ maxWidth: '380px' }}>
          <Search size={16} className="search-bar-icon" />
          <input
            type="text"
            className="search-bar-input"
            placeholder="নাম, বিভাগ বা পদবী দিয়ে খুঁজুন..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="spinner-wrap">
          <Loader2 size={30} className="animate-spin" style={{ color: '#1b365d' }} />
          <p style={{ marginTop: '10px', fontSize: '13px' }}>শিক্ষকদের তালিকা লোড হচ্ছে...</p>
        </div>
      ) : filteredTeachers.length === 0 ? (
        <div className="admin-card">
          <div className="empty-state">
            <div className="empty-state-icon">👥</div>
            <p className="empty-state-title">কোনো শিক্ষক পাওয়া যায়নি</p>
            <p className="empty-state-desc">নতুন শিক্ষক যোগ করুন।</p>
            <button className="btn btn-primary" onClick={() => handleOpenModal()}>
              <Plus size={16} /> শিক্ষক যুক্ত করুন
            </button>
          </div>
        </div>
      ) : (
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
              {filteredTeachers.map((t) => {
                const dStyle = getDeptStyle(t.department || 'সাধারণ');
                return (
                  <tr key={t.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{
                          width: '40px', height: '40px', borderRadius: '50%',
                          overflow: 'hidden', flexShrink: 0,
                          background: t.photo_url ? 'transparent' : 'linear-gradient(135deg, #1b365d, #335c9b)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          border: '2px solid #e8eef8',
                        }}>
                          {t.photo_url ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={t.photo_url} alt={t.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          ) : (
                            <span style={{ fontSize: '13px', fontWeight: 700, color: '#fff' }}>{getInitials(t.name)}</span>
                          )}
                        </div>
                        <div>
                          <div style={{ fontWeight: 600, color: '#0f1d38', fontSize: '13.5px' }}>{t.name}</div>
                          {t.subject && <div style={{ fontSize: '11.5px', color: '#94a3b8', marginTop: '1px' }}>{t.subject}</div>}
                        </div>
                      </div>
                    </td>
                    <td>
                      <span style={{ fontSize: '12.5px', fontWeight: 600, color: '#c59b27' }}>{t.designation}</span>
                    </td>
                    <td>
                      <span style={{
                        display: 'inline-flex', alignItems: 'center', padding: '3px 10px',
                        borderRadius: '9999px', fontSize: '11px', fontWeight: 600,
                        background: dStyle.bg, color: dStyle.color, border: `1px solid ${dStyle.border}`,
                      }}>
                        {t.department || 'সাধারণ'}
                      </span>
                    </td>
                    <td>
                      <div style={{ fontSize: '12px', color: '#475569' }}>{t.phone || '—'}</div>
                      <div style={{ fontSize: '11.5px', color: '#94a3b8' }}>{t.email || ''}</div>
                    </td>
                    <td>
                      <button
                        onClick={() => handleTogglePublish(t.id, t.is_published)}
                        className={`status-toggle ${t.is_published ? 'published' : 'draft'}`}
                      >
                        {t.is_published ? <Eye size={13} /> : <EyeOff size={13} />}
                        {t.is_published ? 'পাবলিশড' : 'খসড়া'}
                      </button>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '4px', justifyContent: 'flex-end' }}>
                        <button className="action-btn edit" onClick={() => handleOpenModal(t)} title="এডিট">
                          <Edit3 size={16} />
                        </button>
                        <button className="action-btn delete" onClick={() => promptDelete(t)} title="মুছুন">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '14px 20px',
              borderTop: '1px solid var(--neutral-100)',
              backgroundColor: 'var(--white)',
            }}>
              <span style={{ fontSize: '13px', color: 'var(--neutral-500)' }}>
                পৃষ্ঠা {currentPage} / {totalPages} &nbsp;•&nbsp; মোট {totalTeachers}জন শিক্ষক
              </span>
              <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                <button
                  onClick={() => goToPage(currentPage - 1)}
                  disabled={currentPage === 1 || loading}
                  className="btn btn-outline btn-sm"
                  style={{ display: 'flex', alignItems: 'center', gap: '4px' }}
                >
                  <ChevronLeft size={15} /> পূর্ববর্তী
                </button>
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const startPage = Math.max(1, Math.min(currentPage - 2, totalPages - 4));
                  const p = startPage + i;
                  if (p > totalPages) return null;
                  return (
                    <button
                      key={p}
                      onClick={() => goToPage(p)}
                      disabled={loading}
                      style={{
                        width: '34px', height: '34px',
                        borderRadius: '6px',
                        border: '1px solid',
                        cursor: 'pointer',
                        fontSize: '13px', fontWeight: 600,
                        background: p === currentPage ? '#1b365d' : '#f8fafc',
                        color: p === currentPage ? '#fff' : '#475569',
                        borderColor: p === currentPage ? '#1b365d' : '#d4dde9',
                        transition: 'all 0.13s',
                      }}
                    >
                      {p}
                    </button>
                  );
                })}
                <button
                  onClick={() => goToPage(currentPage + 1)}
                  disabled={currentPage === totalPages || loading}
                  className="btn btn-outline btn-sm"
                  style={{ display: 'flex', alignItems: 'center', gap: '4px' }}
                >
                  পরবর্তী <ChevronRight size={15} />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-box" style={{ maxWidth: '580px' }}>
            <div className="modal-header">
              <h2 className="modal-title">
                {editingId ? '✏️ শিক্ষকের প্রোফাইল এডিট' : '👤 নতুন শিক্ষক যুক্ত করুন'}
              </h2>
              <button className="modal-close-btn" onClick={() => setIsModalOpen(false)}>
                <X size={17} />
              </button>
            </div>
            <div className="modal-body">
              {actionError && (
                <div className="alert alert-error" style={{ marginBottom: '16px' }}>
                  <AlertCircle size={16} /> {actionError}
                </div>
              )}
              <form onSubmit={handleSave}>
                {/* Photo Upload */}
                <div className="form-group">
                  <label className="form-label">শিক্ষকের ছবি</label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{
                      width: '80px', height: '80px', borderRadius: '50%',
                      overflow: 'hidden', flexShrink: 0,
                      background: photoUrl ? 'transparent' : 'linear-gradient(135deg, #1b365d, #335c9b)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      border: '3px solid #e8eef8', boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                    }}>
                      {photoUploading ? (
                        <Loader2 size={24} className="animate-spin" color="#fff" />
                      ) : photoUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={photoUrl} alt="photo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        <span style={{ fontSize: '26px', fontWeight: 700, color: '#fff' }}>{name ? getInitials(name) : '?'}</span>
                      )}
                    </div>
                    <div>
                      <input ref={photoInputRef} type="file" accept="image/jpeg,image/png,image/webp"
                        style={{ display: 'none' }} onChange={handlePhotoUpload} id="teacher-photo-upload" />
                      <label htmlFor="teacher-photo-upload" className="btn btn-outline" style={{ cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '12.5px' }}>
                        <Camera size={14} />
                        {photoUploading ? 'আপলোড হচ্ছে...' : photoUrl ? 'ছবি পরিবর্তন' : 'ছবি আপলোড'}
                      </label>
                      {photoUrl && !photoUploading && (
                        <button type="button" onClick={() => setPhotoUrl(null)} style={{ display: 'block', marginTop: '6px', background: 'none', border: 'none', color: '#dc2626', cursor: 'pointer', fontSize: '12px' }}>
                          ছবি সরিয়ে দিন
                        </button>
                      )}
                      <p style={{ fontSize: '11px', color: '#94a3b8', margin: '6px 0 0' }}>JPG, PNG, WebP • সর্বোচ্চ ৫MB</p>
                      {photoUploadError && <p style={{ fontSize: '11.5px', color: '#dc2626', margin: '4px 0 0' }}>⚠️ {photoUploadError}</p>}
                    </div>
                  </div>
                </div>

                {/* Name & Designation */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">পূর্ণ নাম *</label>
                    <input type="text" required className="form-input" value={name} onChange={(e) => setName(e.target.value)} placeholder="যেমন: নূর মোহাম্মদ সরকার" />
                  </div>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">পদবী *</label>
                    <input type="text" required className="form-input" value={designation} onChange={(e) => setDesignation(e.target.value)} placeholder="যেমন: সহকারী শিক্ষক" />
                  </div>
                </div>

                {/* Subject & Dept */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginTop: '14px' }}>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">বিষয়</label>
                    <input type="text" className="form-input" value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="যেমন: গণিত" />
                  </div>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">বিভাগ</label>
                    <input type="text" className="form-input" value={department} onChange={(e) => setDepartment(e.target.value)} placeholder="যেমন: বিজ্ঞান বিভাগ" />
                  </div>
                </div>

                {/* Phone & Email */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginTop: '14px' }}>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">ফোন নম্বর</label>
                    <input type="text" className="form-input" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="01XXXXXXXXX" />
                  </div>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">ইমেইল</label>
                    <input type="email" className="form-input" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="teacher@school.edu.bd" />
                  </div>
                </div>

                <div className="form-group" style={{ marginTop: '14px' }}>
                  <label className="form-label">সংক্ষিপ্ত পরিচিতি</label>
                  <textarea className="form-textarea" rows={3} value={biography} onChange={(e) => setBiography(e.target.value)} placeholder="শিক্ষাগত যোগ্যতা ও অভিজ্ঞতা..." />
                </div>

                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '13px', color: '#334155', marginBottom: '20px' }}>
                  <input type="checkbox" checked={isPublished} onChange={(e) => setIsPublished(e.target.checked)} style={{ accentColor: '#059669' }} />
                  পাবলিক ওয়েবসাইটে প্রদর্শন করুন
                </label>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                  <button type="button" onClick={() => setIsModalOpen(false)} className="btn btn-outline" disabled={submitting || photoUploading}>বাতিল</button>
                  <button type="submit" className="btn btn-primary" disabled={submitting || photoUploading}>
                    {submitting && <Loader2 size={14} className="animate-spin" />}
                    {submitting ? 'সংরক্ষণ হচ্ছে...' : 'সংরক্ষণ করুন'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={deleteModalOpen}
        title="শিক্ষকের প্রোফাইল মুছে ফেলার নিশ্চিতকরণ"
        itemName={teacherToDelete?.name}
        message="আপনি কি নিশ্চিত যে এই শিক্ষকের প্রোফাইল মুছে ফেলতে চান? সংশ্লিষ্ট প্রোফাইল ছবি ও তথ্য স্থায়ীভাবে মুছে যাবে।"
        isDeleting={isDeleting}
        onConfirm={confirmDeleteTeacher}
        onCancel={() => {
          setDeleteModalOpen(false);
          setTeacherToDelete(null);
        }}
      />
    </div>
  );
}

