'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Plus, Search, Trash2, Edit3, MapPin, Eye, EyeOff,
  Loader2, ImagePlus, X, Calendar, AlertCircle, CheckCircle
} from 'lucide-react';
import {
  getAdminEvents,
  createEventAction,
  updateEventAction,
  deleteEventAction,
  toggleEventPublishAction,
} from '@/lib/actions/events-actions';
import { uploadEventImageAction } from '@/lib/actions/upload-actions';
import DeleteConfirmModal from '@/components/DeleteConfirmModal';

function formatEventDate(dateStr: string) {
  if (!dateStr) return '—';
  try {
    const d = new Date(dateStr);
    const months = ['জান', 'ফেব', 'মার্চ', 'এপ্রি', 'মে', 'জুন', 'জুল', 'আগ', 'সেপ', 'অক্টো', 'নভে', 'ডিসে'];
    return { day: d.getDate(), month: months[d.getMonth()], year: d.getFullYear() };
  } catch { return null; }
}

export default function EventsManagementPage() {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Delete modal state
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [eventToDelete, setEventToDelete] = useState<any | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [title, setTitle] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [location, setLocation] = useState('স্কুল প্রাঙ্গণ');
  const [description, setDescription] = useState('');
  const [featuredImage, setFeaturedImage] = useState<string | null>(null);
  const [imageUploading, setImageUploading] = useState(false);
  const [imageUploadError, setImageUploadError] = useState<string | null>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const [isPublished, setIsPublished] = useState(true);

  const loadEvents = async () => {
    setLoading(true); setActionError(null);
    const res = await getAdminEvents();
    if (res.error) setActionError(res.error);
    else setEvents(res.events);
    setLoading(false);
  };

  useEffect(() => { loadEvents(); }, []);

  const handleOpenModal = (event?: any) => {
    setActionError(null); setImageUploadError(null);
    if (event) {
      setEditingId(event.id); setTitle(event.title || '');
      setEventDate(event.event_date || ''); setLocation(event.location || 'স্কুল প্রাঙ্গণ');
      setDescription(event.description || ''); setFeaturedImage(event.featured_image || null);
      setIsPublished(event.is_published ?? true);
    } else {
      setEditingId(null); setTitle(''); setEventDate(''); setLocation('স্কুল প্রাঙ্গণ');
      setDescription(''); setFeaturedImage(null); setIsPublished(true);
    }
    setIsModalOpen(true);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return;
    setImageUploading(true); setImageUploadError(null);
    const fd = new FormData(); fd.append('file', file);
    const res = await uploadEventImageAction(fd);
    if (res.success && res.publicUrl) setFeaturedImage(res.publicUrl);
    else setImageUploadError(res.error || 'ছবি আপলোড ব্যর্থ');
    setImageUploading(false);
    if (imageInputRef.current) imageInputRef.current.value = '';
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault(); setSubmitting(true); setActionError(null);
    const payload = { title, event_date: eventDate, location, description, featured_image: featuredImage, is_published: isPublished };
    const res = editingId ? await updateEventAction(editingId, payload) : await createEventAction(payload);
    if (res.success) {
      setIsModalOpen(false);
      setActionSuccess(editingId ? 'ইভেন্ট আপডেট হয়েছে।' : 'নতুন ইভেন্ট যুক্ত হয়েছে।');
      setTimeout(() => setActionSuccess(null), 4000);
      await loadEvents();
    } else setActionError(res.error || 'সংরক্ষণ ব্যর্থ');
    setSubmitting(false);
  };

  const promptDelete = (ev: any) => {
    setEventToDelete(ev);
    setDeleteModalOpen(true);
  };

  const confirmDeleteEvent = async () => {
    if (!eventToDelete) return;
    setIsDeleting(true);
    setActionError(null);
    const res = await deleteEventAction(eventToDelete.id);
    setIsDeleting(false);
    setDeleteModalOpen(false);
    if (res.success) {
      setActionSuccess('ইভেন্ট মুছে ফেলা হয়েছে।');
      setEventToDelete(null);
      setTimeout(() => setActionSuccess(null), 4000);
      await loadEvents();
    } else {
      setActionError(res.error || 'মুছতে ব্যর্থ');
    }
  };

  const handleTogglePublish = async (id: string, s: boolean) => {
    const res = await toggleEventPublishAction(id, s);
    if (res.success) await loadEvents();
    else setActionError(res.error || 'স্ট্যাটাস পরিবর্তন ব্যর্থ');
  };

  const filteredEvents = events.filter((ev) =>
    ev.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (ev.location && ev.location.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div>
      {/* Page Header */}
      <div className="page-header">
        <div className="page-header-left">
          <h1 className="page-title">
            ইভেন্ট ব্যবস্থাপনা
            <span className="page-title-count">{events.length}টি</span>
          </h1>
          <p className="page-subtitle">স্কুলের আগামী ও পূর্ববর্তী অনুষ্ঠানসূচী পরিচালনা করুন</p>
        </div>
        <button className="btn btn-primary" onClick={() => handleOpenModal()}>
          <Plus size={17} /> নতুন ইভেন্ট যুক্ত করুন
        </button>
      </div>

      {actionError && <div className="alert alert-error"><AlertCircle size={16} /> {actionError}</div>}
      {actionSuccess && <div className="alert alert-success"><CheckCircle size={16} /> {actionSuccess}</div>}

      {/* Search */}
      <div className="admin-card card-sm" style={{ marginBottom: '20px' }}>
        <div className="search-bar-wrap" style={{ maxWidth: '380px' }}>
          <Search size={16} className="search-bar-icon" />
          <input type="text" className="search-bar-input" placeholder="ইভেন্ট শিরোনাম বা স্থান..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="spinner-wrap">
          <Loader2 size={30} className="animate-spin" style={{ color: '#1b365d' }} />
          <p style={{ marginTop: '10px', fontSize: '13px' }}>ইভেন্ট তালিকা লোড হচ্ছে...</p>
        </div>
      ) : filteredEvents.length === 0 ? (
        <div className="admin-card">
          <div className="empty-state">
            <div className="empty-state-icon">📅</div>
            <p className="empty-state-title">কোনো ইভেন্ট পাওয়া যায়নি</p>
            <p className="empty-state-desc">নতুন ইভেন্ট যোগ করুন।</p>
            <button className="btn btn-primary" onClick={() => handleOpenModal()}>
              <Plus size={16} /> ইভেন্ট যুক্ত করুন
            </button>
          </div>
        </div>
      ) : (
        <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>তারিখ</th>
                <th>ইভেন্ট শিরোনাম</th>
                <th>স্থান</th>
                <th>স্ট্যাটাস</th>
                <th style={{ textAlign: 'right' }}>অ্যাকশন</th>
              </tr>
            </thead>
            <tbody>
              {filteredEvents.map((ev) => {
                const dateInfo = formatEventDate(ev.event_date);
                return (
                  <tr key={ev.id}>
                    <td>
                      {dateInfo && typeof dateInfo === 'object' ? (
                        <div style={{
                          display: 'inline-flex', flexDirection: 'column', alignItems: 'center',
                          background: '#f0f4fb', border: '1px solid #c7d7f0',
                          borderRadius: '10px', padding: '6px 12px', textAlign: 'center', minWidth: '56px',
                        }}>
                          <span style={{ fontSize: '10px', fontWeight: 700, color: '#1b365d', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                            {dateInfo.month}
                          </span>
                          <span style={{ fontSize: '20px', fontWeight: 800, color: '#0f1d38', lineHeight: 1.1 }}>
                            {dateInfo.day}
                          </span>
                          <span style={{ fontSize: '10px', color: '#64748b' }}>{dateInfo.year}</span>
                        </div>
                      ) : (
                        <span style={{ fontSize: '12px', color: '#64748b' }}>{ev.event_date || '—'}</span>
                      )}
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        {ev.featured_image && (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={ev.featured_image} alt={ev.title} style={{ width: '52px', height: '38px', objectFit: 'cover', borderRadius: '8px', flexShrink: 0, border: '1px solid #e8eef8' }} />
                        )}
                        <div>
                          <div style={{ fontWeight: 600, color: '#0f1d38', fontSize: '13.5px' }}>{ev.title}</div>
                          {ev.description && (
                            <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '2px', maxWidth: '220px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {ev.description}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', fontSize: '12.5px', color: '#475569', background: '#f8fafc', padding: '4px 10px', borderRadius: '9999px', border: '1px solid #e2e8f0' }}>
                        <MapPin size={12} color="#94a3b8" /> {ev.location || 'স্কুল প্রাঙ্গণ'}
                      </span>
                    </td>
                    <td>
                      <button
                        onClick={() => handleTogglePublish(ev.id, ev.is_published)}
                        className={`status-toggle ${ev.is_published ? 'published' : 'draft'}`}
                      >
                        {ev.is_published ? <Eye size={13} /> : <EyeOff size={13} />}
                        {ev.is_published ? 'পাবলিশড' : 'খসড়া'}
                      </button>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '4px', justifyContent: 'flex-end' }}>
                        <button className="action-btn edit" onClick={() => handleOpenModal(ev)} title="এডিট"><Edit3 size={16} /></button>
                        <button className="action-btn delete" onClick={() => promptDelete(ev)} title="মুছুন"><Trash2 size={16} /></button>
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
          <div className="modal-box" style={{ maxWidth: '520px' }}>
            <div className="modal-header">
              <h2 className="modal-title">
                {editingId ? '📅 ইভেন্ট এডিট করুন' : '🎉 নতুন ইভেন্ট যুক্ত করুন'}
              </h2>
              <button className="modal-close-btn" onClick={() => setIsModalOpen(false)}>
                <X size={17} />
              </button>
            </div>
            <div className="modal-body">
              {actionError && <div className="alert alert-error"><AlertCircle size={16} /> {actionError}</div>}
              <form onSubmit={handleSave}>
                {/* Image Upload */}
                <div className="form-group">
                  <label className="form-label">ইভেন্টের কভার ছবি</label>
                  <div style={{
                    border: '2px dashed #d4dde9', borderRadius: '10px', padding: '14px',
                    background: '#f8fafc', display: 'flex', alignItems: 'center', gap: '14px',
                  }}>
                    <div style={{
                      width: '90px', height: '64px', borderRadius: '9px', overflow: 'hidden', flexShrink: 0,
                      background: '#f0f4fb', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      border: '1px solid #e2e8f0',
                    }}>
                      {imageUploading ? <Loader2 size={20} className="animate-spin" color="#1b365d" /> :
                       featuredImage ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={featuredImage} alt="event" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                       ) : <ImagePlus size={22} color="#94a3b8" />}
                    </div>
                    <div>
                      <input ref={imageInputRef} type="file" accept="image/jpeg,image/png,image/webp"
                        style={{ display: 'none' }} onChange={handleImageUpload} id="event-image-upload" />
                      <label htmlFor="event-image-upload" className="btn btn-outline btn-sm" style={{ cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                        <ImagePlus size={13} /> {imageUploading ? 'আপলোড হচ্ছে...' : featuredImage ? 'ছবি পরিবর্তন' : 'ছবি আপলোড করুন'}
                      </label>
                      {featuredImage && !imageUploading && (
                        <button type="button" onClick={() => setFeaturedImage(null)} style={{ display: 'block', marginTop: '5px', background: 'none', border: 'none', color: '#dc2626', cursor: 'pointer', fontSize: '12px' }}>ছবি সরিয়ে দিন</button>
                      )}
                      {imageUploadError && <p style={{ fontSize: '11.5px', color: '#dc2626', margin: '5px 0 0' }}>⚠️ {imageUploadError}</p>}
                      <p style={{ fontSize: '11px', color: '#94a3b8', margin: '5px 0 0' }}>JPG, PNG, WebP • সর্বোচ্চ ১০MB</p>
                    </div>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">ইভেন্টের শিরোনাম *</label>
                  <input type="text" required className="form-input" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="যেমন: বিজ্ঞান মেলা ২০২৬" />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">ইভেন্টের তারিখ *</label>
                    <input type="date" required className="form-input" value={eventDate} onChange={(e) => setEventDate(e.target.value)} />
                  </div>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">স্থান</label>
                    <input type="text" className="form-input" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="স্কুল মিলনায়তন" />
                  </div>
                </div>

                <div className="form-group" style={{ marginTop: '14px' }}>
                  <label className="form-label">বিবরণ</label>
                  <textarea className="form-textarea" rows={3} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="অনুষ্ঠানের বিষয়বস্তু..." />
                </div>

                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '13px', color: '#334155', marginBottom: '20px' }}>
                  <input type="checkbox" checked={isPublished} onChange={(e) => setIsPublished(e.target.checked)} style={{ accentColor: '#059669' }} />
                  পাবলিক ওয়েবসাইটে প্রদর্শন করুন
                </label>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                  <button type="button" onClick={() => setIsModalOpen(false)} className="btn btn-outline" disabled={submitting || imageUploading}>বাতিল</button>
                  <button type="submit" className="btn btn-primary" disabled={submitting || imageUploading}>
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
        title="ইভেন্ট মুছে ফেলার নিশ্চিতকরণ"
        itemName={eventToDelete?.title}
        message="আপনি কি নিশ্চিত যে এই অনুষ্ঠানটি মুছে ফেলতে চান? এটি পোর্টাল থেকে স্থায়ীভাবে মুছে যাবে।"
        isDeleting={isDeleting}
        onConfirm={confirmDeleteEvent}
        onCancel={() => {
          setDeleteModalOpen(false);
          setEventToDelete(null);
        }}
      />
    </div>
  );
}

