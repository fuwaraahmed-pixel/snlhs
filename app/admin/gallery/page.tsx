'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Plus, Trash2, Eye, EyeOff, ImagePlus, Loader2, FolderOpen, X } from 'lucide-react';
import {
  getAdminGalleryAlbums,
  createGalleryAlbumAction,
  deleteGalleryAlbumAction,
  toggleAlbumPublishAction,
  deleteGalleryImageAction,
} from '@/lib/actions/gallery-actions';
import { uploadGalleryImageAction } from '@/lib/actions/upload-actions';

export default function GalleryManagementPage() {
  const [albums, setAlbums] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  // Create album modal
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [creating, setCreating] = useState(false);

  // Selected album for image management
  const [selectedAlbum, setSelectedAlbum] = useState<any | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadAlbums = async () => {
    setLoading(true);
    setActionError(null);
    const res = await getAdminGalleryAlbums();
    if (res.error) {
      setActionError(res.error);
    } else {
      setAlbums(res.albums || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadAlbums();
  }, []);

  const handleCreateAlbum = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    setActionError(null);
    const res = await createGalleryAlbumAction({ title: newTitle, description: newDescription });
    if (res.success) {
      setIsCreateOpen(false);
      setNewTitle('');
      setNewDescription('');
      setActionSuccess('অ্যালবাম তৈরি হয়েছে!');
      setTimeout(() => setActionSuccess(null), 3000);
      await loadAlbums();
    } else {
      setActionError(res.error || 'অ্যালবাম তৈরি করতে ব্যর্থ হয়েছে');
    }
    setCreating(false);
  };

  const handleDeleteAlbum = async (id: string) => {
    if (confirm('আপনি কি নিশ্চিত যে এই অ্যালবামটি মুছে ফেলতে চান? সকল ছবিও মুছে যাবে।')) {
      const res = await deleteGalleryAlbumAction(id);
      if (res.success) {
        if (selectedAlbum?.id === id) setSelectedAlbum(null);
        await loadAlbums();
      } else {
        alert(res.error || 'মুছতে ব্যর্থ হয়েছে');
      }
    }
  };

  const handleTogglePublish = async (id: string, current: boolean) => {
    const res = await toggleAlbumPublishAction(id, current);
    if (res.success) {
      await loadAlbums();
    } else {
      alert(res.error || 'স্ট্যাটাস পরিবর্তন করতে ব্যর্থ হয়েছে');
    }
  };

  const handleUploadImages = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!selectedAlbum || files.length === 0) return;

    setUploading(true);
    setActionError(null);

    let uploadedCount = 0;
    for (const file of files) {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('albumId', selectedAlbum.id);
      const res = await uploadGalleryImageAction(formData);
      if (res.success) {
        uploadedCount++;
      } else {
        setActionError(`"${file.name}" আপলোড করতে ব্যর্থ: ${res.error}`);
      }
    }

    if (uploadedCount > 0) {
      setActionSuccess(`${uploadedCount}টি ছবি সফলভাবে আপলোড হয়েছে!`);
      setTimeout(() => setActionSuccess(null), 3000);
    }

    await loadAlbums();
    // Refresh selected album images
    const updatedAlbums = await getAdminGalleryAlbums();
    if (!updatedAlbums.error) {
      const updated = (updatedAlbums.albums || []).find((a: any) => a.id === selectedAlbum.id);
      if (updated) setSelectedAlbum(updated);
    }
    setUploading(false);

    // Reset file input
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleDeleteImage = async (imageId: string) => {
    if (!confirm('এই ছবিটি মুছে ফেলবেন?')) return;
    const res = await deleteGalleryImageAction(imageId);
    if (res.success) {
      if (selectedAlbum) {
        const updatedAlbums = await getAdminGalleryAlbums();
        if (!updatedAlbums.error) {
          const updated = (updatedAlbums.albums || []).find((a: any) => a.id === selectedAlbum.id);
          if (updated) setSelectedAlbum(updated);
          setAlbums(updatedAlbums.albums || []);
        }
      }
    } else {
      alert(res.error || 'ছবি মুছতে ব্যর্থ হয়েছে');
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-6)', flexWrap: 'wrap', gap: 'var(--space-4)' }}>
        <div>
          <h2 style={{ fontSize: 'var(--text-xl)', color: 'var(--primary-900)', margin: 0 }}>
            ফটো গ্যালারি ব্যবস্থাপনা
          </h2>
          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--neutral-600)', margin: 0 }}>
            গ্যালারি অ্যালবাম তৈরি করুন এবং ছবি আপলোড করুন
          </p>
        </div>
        <button
          onClick={() => setIsCreateOpen(true)}
          className="btn btn-primary"
          style={{ backgroundColor: 'var(--primary-700)', color: 'var(--white)', display: 'inline-flex', alignItems: 'center', gap: 'var(--space-2)' }}
        >
          <Plus size={18} />
          <span>নতুন অ্যালবাম তৈরি করুন</span>
        </button>
      </div>

      {actionError && (
        <div style={{ backgroundColor: '#fee2e2', color: '#dc2626', padding: 'var(--space-4)', borderRadius: 'var(--radius-md)', marginBottom: 'var(--space-4)' }}>
          {actionError}
        </div>
      )}

      {actionSuccess && (
        <div style={{ backgroundColor: '#d1fae5', color: '#065f46', padding: 'var(--space-4)', borderRadius: 'var(--radius-md)', marginBottom: 'var(--space-4)' }}>
          ✅ {actionSuccess}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: selectedAlbum ? '1fr 1fr' : '1fr', gap: 'var(--space-6)' }}>
        {/* Albums list */}
        <div>
          {loading ? (
            <div style={{ textAlign: 'center', padding: 'var(--space-8)', color: 'var(--neutral-500)' }}>
              <Loader2 className="animate-spin" size={24} style={{ margin: '0 auto var(--space-2)' }} />
              <p>অ্যালবাম লোড হচ্ছে...</p>
            </div>
          ) : albums.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 'var(--space-12)', color: 'var(--neutral-500)', backgroundColor: 'var(--white)', borderRadius: 'var(--radius-lg)', border: '1px dashed var(--neutral-300)' }}>
              <div style={{ fontSize: '48px', marginBottom: 'var(--space-4)' }}>🖼️</div>
              <h3 style={{ color: 'var(--primary-900)', marginBottom: 'var(--space-2)' }}>কোনো অ্যালবাম নেই</h3>
              <p style={{ fontSize: 'var(--text-sm)' }}>প্রথম অ্যালবাম তৈরি করুন।</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
              {albums.map((album) => {
                const imageCount = album.gallery_images?.length ?? 0;
                const isSelected = selectedAlbum?.id === album.id;
                return (
                  <div
                    key={album.id}
                    className="admin-card"
                    style={{
                      padding: 'var(--space-4)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 'var(--space-4)',
                      cursor: 'pointer',
                      border: isSelected ? '2px solid var(--primary-700)' : '1px solid var(--neutral-200)',
                      transition: 'border-color 0.2s',
                    }}
                    onClick={() => setSelectedAlbum(isSelected ? null : album)}
                  >
                    {/* Cover thumbnail — uses cover_image column or first uploaded image */}
                    <div style={{ width: '64px', height: '64px', flexShrink: 0, borderRadius: 'var(--radius-md)', overflow: 'hidden', backgroundColor: 'var(--primary-100)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {(album.cover_image || album.gallery_images?.[0]?.image_url) ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={album.cover_image || album.gallery_images[0].image_url} alt={album.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        <FolderOpen size={28} color="var(--primary-500)" />
                      )}
                    </div>

                    {/* Info */}
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 700, color: 'var(--primary-900)', fontSize: 'var(--text-base)' }}>{album.title}</div>
                      {album.description && <div style={{ fontSize: 'var(--text-xs)', color: 'var(--neutral-500)' }}>{album.description}</div>}
                      <div style={{ fontSize: 'var(--text-xs)', color: 'var(--neutral-400)', marginTop: '4px' }}>📷 {imageCount}টি ছবি</div>
                    </div>

                    {/* Actions */}
                    <div style={{ display: 'flex', gap: 'var(--space-2)', alignItems: 'center' }} onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => handleTogglePublish(album.id, album.is_published)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: album.is_published ? 'var(--success)' : 'var(--neutral-400)', display: 'flex', alignItems: 'center', gap: '4px', fontSize: 'var(--text-xs)', fontWeight: 600 }}
                        title={album.is_published ? 'পাবলিশড' : 'খসড়া'}
                      >
                        {album.is_published ? <Eye size={16} /> : <EyeOff size={16} />}
                      </button>
                      <button onClick={() => handleDeleteAlbum(album.id)} style={{ background: 'none', border: 'none', color: 'var(--error)', cursor: 'pointer' }}>
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Album Image Management */}
        {selectedAlbum && (
          <div>
            <div className="admin-card" style={{ padding: 'var(--space-5)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-4)' }}>
                <h3 style={{ fontSize: 'var(--text-lg)', color: 'var(--primary-900)', margin: 0 }}>
                  📂 {selectedAlbum.title}
                </h3>
                <button onClick={() => setSelectedAlbum(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--neutral-500)' }}>
                  <X size={20} />
                </button>
              </div>

              {/* Upload button */}
              <div style={{ marginBottom: 'var(--space-4)' }}>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  style={{ display: 'none' }}
                  onChange={handleUploadImages}
                  id="gallery-image-upload"
                />
                <label
                  htmlFor="gallery-image-upload"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 'var(--space-2)',
                    padding: 'var(--space-2) var(--space-4)',
                    backgroundColor: uploading ? 'var(--neutral-200)' : 'var(--primary-700)',
                    color: uploading ? 'var(--neutral-600)' : 'var(--white)',
                    borderRadius: 'var(--radius-md)',
                    cursor: uploading ? 'not-allowed' : 'pointer',
                    fontSize: 'var(--text-sm)',
                    fontWeight: 600,
                  }}
                >
                  {uploading ? <Loader2 size={16} className="animate-spin" /> : <ImagePlus size={16} />}
                  <span>{uploading ? 'আপলোড হচ্ছে...' : 'ছবি আপলোড করুন'}</span>
                </label>
              </div>

              {/* Images grid */}
              {(selectedAlbum.gallery_images || []).length === 0 ? (
                <div style={{ textAlign: 'center', padding: 'var(--space-8)', color: 'var(--neutral-500)', backgroundColor: 'var(--neutral-50)', borderRadius: 'var(--radius-md)', border: '1px dashed var(--neutral-300)' }}>
                  <ImagePlus size={32} style={{ marginBottom: 'var(--space-2)' }} />
                  <p style={{ fontSize: 'var(--text-sm)' }}>এই অ্যালবামে কোনো ছবি নেই।</p>
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: 'var(--space-3)' }}>
                  {(selectedAlbum.gallery_images || []).map((img: any) => (
                    <div key={img.id} style={{ position: 'relative', borderRadius: 'var(--radius-md)', overflow: 'hidden', aspectRatio: '1', backgroundColor: 'var(--neutral-100)' }}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={img.image_url}
                        alt="gallery"
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                      <button
                        onClick={() => handleDeleteImage(img.id)}
                        style={{
                          position: 'absolute',
                          top: '4px',
                          right: '4px',
                          background: 'rgba(220,38,38,0.9)',
                          border: 'none',
                          borderRadius: '50%',
                          width: '24px',
                          height: '24px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'pointer',
                          color: 'white',
                        }}
                        title="ছবি মুছুন"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Create Album Modal */}
      {isCreateOpen && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: 'var(--space-4)' }}>
          <div className="admin-card" style={{ width: '100%', maxWidth: '450px' }}>
            <h3 style={{ fontSize: 'var(--text-lg)', color: 'var(--primary-900)', marginBottom: 'var(--space-4)' }}>
              নতুন গ্যালারি অ্যালবাম তৈরি করুন
            </h3>
            <form onSubmit={handleCreateAlbum}>
              <div className="form-group">
                <label className="form-label">অ্যালবামের শিরোনাম *</label>
                <input
                  type="text"
                  required
                  className="form-input"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="যেমন: বার্ষিক ক্রীড়া প্রতিযোগিতা ২০২৬"
                />
              </div>
              <div className="form-group">
                <label className="form-label">বিবরণ (ঐচ্ছিক)</label>
                <textarea
                  className="form-textarea"
                  rows={3}
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  placeholder="অ্যালবামের বিষয়বস্তু..."
                />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-3)', marginTop: 'var(--space-4)' }}>
                <button type="button" onClick={() => setIsCreateOpen(false)} className="btn btn-outline" disabled={creating}>বাতিল</button>
                <button type="submit" className="btn btn-primary" style={{ backgroundColor: 'var(--primary-700)', color: 'var(--white)' }} disabled={creating}>
                  {creating ? 'তৈরি হচ্ছে...' : 'অ্যালবাম তৈরি করুন'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
