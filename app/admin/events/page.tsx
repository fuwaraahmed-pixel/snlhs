'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Plus, Search, Trash2, Edit3, MapPin, Eye, EyeOff, Loader2, ImagePlus, X } from 'lucide-react';
import {
  getAdminEvents,
  createEventAction,
  updateEventAction,
  deleteEventAction,
  toggleEventPublishAction,
} from '@/lib/actions/events-actions';
import { uploadEventImageAction } from '@/lib/actions/upload-actions';

export default function EventsManagementPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const [title, setTitle] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [location, setLocation] = useState('স্কুল প্রাঙ্গণ');
  const [description, setDescription] = useState('');
  const [featuredImage, setFeaturedImage] = useState<string | null>(null);
  const [imageUploading, setImageUploading] = useState(false);
  const [imageUploadError, setImageUploadError] = useState<string | null>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const [isPublished, setIsPublished] = useState(true);

  const [events, setEvents] = useState<any[]>([]);

  const loadEvents = async () => {
    setLoading(true);
    setActionError(null);
    const res = await getAdminEvents();
    if (res.error) {
      setActionError(res.error);
    } else {
      setEvents(res.events);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadEvents();
  }, []);

  const handleOpenModal = (event?: any) => {
    setActionError(null);
    setImageUploadError(null);
    if (event) {
      setEditingId(event.id);
      setTitle(event.title || '');
      setEventDate(event.event_date || '');
      setLocation(event.location || 'স্কুল প্রাঙ্গণ');
      setDescription(event.description || '');
      setFeaturedImage(event.featured_image || null);
      setIsPublished(event.is_published ?? true);
    } else {
      setEditingId(null);
      setTitle('');
      setEventDate('');
      setLocation('স্কুল প্রাঙ্গণ');
      setDescription('');
      setFeaturedImage(null);
      setIsPublished(true);
    }
    setIsModalOpen(true);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageUploading(true);
    setImageUploadError(null);
    const fd = new FormData();
    fd.append('file', file);
    const res = await uploadEventImageAction(fd);
    if (res.success && res.publicUrl) {
      setFeaturedImage(res.publicUrl);
    } else {
      setImageUploadError(res.error || 'ছবি আপলোড করতে ব্যর্থ হয়েছে');
    }
    setImageUploading(false);
    if (imageInputRef.current) imageInputRef.current.value = '';
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setActionError(null);

    const payload = {
      title,
      event_date: eventDate,
      location,
      description,
      featured_image: featuredImage,
      is_published: isPublished,
    };

    let res;
    if (editingId) {
      res = await updateEventAction(editingId, payload);
    } else {
      res = await createEventAction(payload);
    }

    if (res.success) {
      setIsModalOpen(false);
      await loadEvents();
    } else {
      setActionError(res.error || 'সংরক্ষণ করতে ব্যর্থ হয়েছে');
    }
    setSubmitting(false);
  };

  const handleDelete = async (id: string) => {
    if (confirm('আপনি কি নিশ্চিত যে এই ইভেন্টটি মুছে ফেলতে চান?')) {
      const res = await deleteEventAction(id);
      if (res.success) {
        await loadEvents();
      } else {
        alert(res.error || 'মুছতে ব্যর্থ হয়েছে');
      }
    }
  };

  const handleTogglePublish = async (id: string, currentStatus: boolean) => {
    const res = await toggleEventPublishAction(id, currentStatus);
    if (res.success) {
      await loadEvents();
    } else {
      alert(res.error || 'স্ট্যাটাস পরিবর্তন করতে ব্যর্থ হয়েছে');
    }
  };

  const filteredEvents = events.filter(
    (ev) =>
      ev.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (ev.location && ev.location.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-6)', flexWrap: 'wrap', gap: 'var(--space-4)' }}>
        <div>
          <h2 style={{ fontSize: 'var(--text-xl)', color: 'var(--primary-900)', margin: 0 }}>
            ইভেন্ট ব্যবস্থাপনা
          </h2>
          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--neutral-600)', margin: 0 }}>
            স্কুলের আগামী ও পূর্ববর্তী অনুষ্ঠানসূচী পরিচালনা করুন
          </p>
        </div>

        <button
          onClick={() => handleOpenModal()}
          className="btn btn-primary"
          style={{ backgroundColor: 'var(--primary-700)', color: 'var(--white)', display: 'inline-flex', alignItems: 'center', gap: 'var(--space-2)' }}
        >
          <Plus size={18} />
          <span>নতুন ইভেন্ট যুক্ত করুন</span>
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
            placeholder="ইভেন্ট শিরোনাম বা স্থান দিয়ে খুঁজুন..."
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
              <th>তারিখ</th>
              <th>ইভেন্ট শিরোনাম</th>
              <th>স্থান</th>
              <th>স্ট্যাটাস</th>
              <th style={{ textAlign: 'right' }}>অ্যাকশন</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} style={{ textAlign: 'center', padding: 'var(--space-8)' }}>
                  <Loader2 className="animate-spin" size={24} style={{ margin: '0 auto' }} />
                  <p style={{ marginTop: 'var(--space-2)', color: 'var(--neutral-600)' }}>ইভেন্ট তালিকা লোড হচ্ছে...</p>
                </td>
              </tr>
            ) : filteredEvents.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ textAlign: 'center', padding: 'var(--space-8)', color: 'var(--neutral-600)' }}>
                  কোনো ইভেন্ট তথ্য পাওয়া যায়নি।
                </td>
              </tr>
            ) : (
              filteredEvents.map((ev) => (
                <tr key={ev.id}>
                  <td>
                    <span style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--primary-700)' }}>{ev.event_date}</span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                      {ev.featured_image && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={ev.featured_image} alt={ev.title} style={{ width: '48px', height: '36px', objectFit: 'cover', borderRadius: 'var(--radius-sm)', flexShrink: 0 }} />
                      )}
                      <div>
                        <div style={{ fontWeight: 600, color: 'var(--primary-900)' }}>{ev.title}</div>
                        {ev.description && <div style={{ fontSize: 'var(--text-xs)', color: 'var(--neutral-500)' }}>{ev.description.substring(0, 60)}{ev.description.length > 60 ? '...' : ''}</div>}
                      </div>
                    </div>
                  </td>
                  <td>
                    <span style={{ fontSize: 'var(--text-xs)', color: 'var(--neutral-600)', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                      <MapPin size={14} /> {ev.location || 'স্কুল প্রাঙ্গণ'}
                    </span>
                  </td>
                  <td>
                    <button
                      onClick={() => handleTogglePublish(ev.id, ev.is_published)}
                      style={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        color: ev.is_published ? 'var(--success)' : 'var(--neutral-400)',
                        fontSize: 'var(--text-xs)',
                        fontWeight: 600,
                      }}
                    >
                      {ev.is_published ? <Eye size={16} /> : <EyeOff size={16} />}
                      <span>{ev.is_published ? 'পাবলিশড' : 'খসড়া'}</span>
                    </button>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', gap: 'var(--space-2)' }}>
                      <button onClick={() => handleOpenModal(ev)} style={{ background: 'none', border: 'none', color: 'var(--primary-700)', cursor: 'pointer' }}>
                        <Edit3 size={18} />
                      </button>
                      <button onClick={() => handleDelete(ev.id)} style={{ background: 'none', border: 'none', color: 'var(--error)', cursor: 'pointer' }}>
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
              {editingId ? 'ইভেন্ট এডিট করুন' : 'নতুন ইভেন্ট যুক্ত করুন'}
            </h3>

            <form onSubmit={handleSave}>
              {/* Image Upload */}
              <div className="form-group">
                <label className="form-label">ইভেন্টের ছবি (থাম্বনেইল)</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
                  <div style={{ width: '100px', height: '70px', borderRadius: 'var(--radius-md)', overflow: 'hidden', backgroundColor: 'var(--neutral-100)', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--neutral-200)' }}>
                    {imageUploading ? (
                      <Loader2 size={20} className="animate-spin" color="var(--primary-500)" />
                    ) : featuredImage ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={featuredImage} alt="event" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <ImagePlus size={24} color="var(--neutral-400)" />
                    )}
                  </div>
                  <div style={{ flex: 1 }}>
                    <input ref={imageInputRef} type="file" accept="image/jpeg,image/png,image/webp" style={{ display: 'none' }} onChange={handleImageUpload} id="event-image-upload" />
                    <label htmlFor="event-image-upload" style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--space-2)', padding: 'var(--space-2) var(--space-3)', backgroundColor: 'var(--white)', border: '1px solid var(--neutral-300)', borderRadius: 'var(--radius-md)', cursor: imageUploading ? 'not-allowed' : 'pointer', fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--primary-700)' }}>
                      <ImagePlus size={14} />
                      <span>{imageUploading ? 'আপলোড হচ্ছে...' : featuredImage ? 'ছবি পরিবর্তন' : 'ছবি আপলোড করুন'}</span>
                    </label>
                    {featuredImage && !imageUploading && (
                      <button type="button" onClick={() => setFeaturedImage(null)} style={{ display: 'block', marginTop: '4px', background: 'none', border: 'none', color: 'var(--error)', cursor: 'pointer', fontSize: 'var(--text-xs)' }}>ছবি সরিয়ে দিন</button>
                    )}
                    {imageUploadError && <p style={{ fontSize: 'var(--text-xs)', color: '#dc2626', marginTop: '4px' }}>⚠️ {imageUploadError}</p>}
                    <p style={{ fontSize: 'var(--text-xs)', color: 'var(--neutral-500)', marginTop: '4px' }}>JPG, PNG বা WebP। সর্বোচ্চ ১০MB।</p>
                  </div>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">ইভেন্টের শিরোনাম *</label>
                <input type="text" required className="form-input" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="যেমন: বিজ্ঞান মেলা ২০২৬" />
              </div>

              <div className="form-group">
                <label className="form-label">ইভেন্টের তারিখ *</label>
                <input type="date" required className="form-input" value={eventDate} onChange={(e) => setEventDate(e.target.value)} />
              </div>

              <div className="form-group">
                <label className="form-label">স্থান</label>
                <input type="text" className="form-input" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="যেমন: স্কুল মিলনায়তন" />
              </div>

              <div className="form-group">
                <label className="form-label">বিস্তারিত বিবরণ</label>
                <textarea className="form-textarea" rows={3} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="অনুষ্ঠানের বিষয়বস্তু..." />
              </div>

              <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                <input
                  type="checkbox"
                  id="isPublishedEvent"
                  checked={isPublished}
                  onChange={(e) => setIsPublished(e.target.checked)}
                />
                <label htmlFor="isPublishedEvent" className="form-label" style={{ margin: 0, cursor: 'pointer' }}>
                  পাবলিক ওয়েবসাইটে প্রদর্শন করুন (Published)
                </label>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-3)', marginTop: 'var(--space-6)' }}>
                <button type="button" onClick={() => setIsModalOpen(false)} className="btn btn-outline" disabled={submitting || imageUploading}>বাতিল</button>
                <button type="submit" className="btn btn-primary" style={{ backgroundColor: 'var(--primary-700)', color: 'var(--white)' }} disabled={submitting || imageUploading}>
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
