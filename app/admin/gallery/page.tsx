'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Plus, Trash2, Eye, EyeOff, ImagePlus, Loader2, FolderOpen,
  X, AlertCircle, CheckCircle, Images
} from 'lucide-react';
import {
  getAdminGalleryAlbums,
  createGalleryAlbumAction,
  deleteGalleryAlbumAction,
  toggleAlbumPublishAction,
  deleteGalleryImageAction,
} from '@/lib/actions/gallery-actions';
import { uploadGalleryImageAction } from '@/lib/actions/upload-actions';
import DeleteConfirmModal from '@/components/DeleteConfirmModal';

export default function GalleryManagementPage() {
  const [albums, setAlbums] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [creating, setCreating] = useState(false);

  // Delete modal state
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{ type: 'album' | 'image'; id: string; name?: string } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [selectedAlbum, setSelectedAlbum] = useState<any | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadAlbums = async () => {
    setLoading(true); setActionError(null);
    const res = await getAdminGalleryAlbums();
    if (res.error) setActionError(res.error);
    else setAlbums(res.albums || []);
    setLoading(false);
  };

  useEffect(() => { loadAlbums(); }, []);

  const handleCreateAlbum = async (e: React.FormEvent) => {
    e.preventDefault(); setCreating(true); setActionError(null);
    const res = await createGalleryAlbumAction({ title: newTitle, description: newDescription });
    if (res.success) {
      setIsCreateOpen(false); setNewTitle(''); setNewDescription('');
      setActionSuccess('অ্যালবাম তৈরি হয়েছে!');
      setTimeout(() => setActionSuccess(null), 4000);
      await loadAlbums();
    } else setActionError(res.error || 'অ্যালবাম তৈরি ব্যর্থ');
    setCreating(false);
  };

  const promptDeleteAlbum = (album: any) => {
    setDeleteTarget({ type: 'album', id: album.id, name: album.title });
    setDeleteModalOpen(true);
  };

  const promptDeleteImage = (imageId: string) => {
    setDeleteTarget({ type: 'image', id: imageId, name: 'নির্বাচিত ছবি' });
    setDeleteModalOpen(true);
  };

  const confirmDeleteTarget = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    setActionError(null);

    if (deleteTarget.type === 'album') {
      const res = await deleteGalleryAlbumAction(deleteTarget.id);
      setIsDeleting(false);
      setDeleteModalOpen(false);
      if (res.success) {
        if (selectedAlbum?.id === deleteTarget.id) setSelectedAlbum(null);
        setActionSuccess('অ্যালবাম মুছে ফেলা হয়েছে।');
        setDeleteTarget(null);
        setTimeout(() => setActionSuccess(null), 4000);
        await loadAlbums();
      } else {
        setActionError(res.error || 'মুছতে ব্যর্থ');
      }
    } else {
      const res = await deleteGalleryImageAction(deleteTarget.id);
      setIsDeleting(false);
      setDeleteModalOpen(false);
      if (res.success && selectedAlbum) {
        setDeleteTarget(null);
        const updatedAlbums = await getAdminGalleryAlbums();
        if (!updatedAlbums.error) {
          const updated = (updatedAlbums.albums || []).find((a: any) => a.id === selectedAlbum.id);
          if (updated) setSelectedAlbum(updated);
          setAlbums(updatedAlbums.albums || []);
        }
      } else if (!res.success) {
        setActionError(res.error || 'ছবি মুছতে ব্যর্থ');
      }
    }
  };

  const handleTogglePublish = async (id: string, current: boolean) => {
    const res = await toggleAlbumPublishAction(id, current);
    if (res.success) await loadAlbums();
    else setActionError(res.error || 'স্ট্যাটাস পরিবর্তন ব্যর্থ');
  };

  const handleUploadImages = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!selectedAlbum || files.length === 0) return;
    setUploading(true); setActionError(null);
    let uploadedCount = 0;
    for (const file of files) {
      const fd = new FormData(); fd.append('file', file); fd.append('albumId', selectedAlbum.id);
      const res = await uploadGalleryImageAction(fd);
      if (res.success) uploadedCount++;
      else setActionError(`"${file.name}" আপলোড ব্যর্থ: ${res.error}`);
    }
    if (uploadedCount > 0) {
      setActionSuccess(`${uploadedCount}টি ছবি আপলোড হয়েছে!`);
      setTimeout(() => setActionSuccess(null), 4000);
    }
    await loadAlbums();
    const updatedAlbums = await getAdminGalleryAlbums();
    if (!updatedAlbums.error) {
      const updated = (updatedAlbums.albums || []).find((a: any) => a.id === selectedAlbum.id);
      if (updated) setSelectedAlbum(updated);
    }
    setUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };



  return (
    <div>
      {/* Page Header */}
      <div className="page-header">
        <div className="page-header-left">
          <h1 className="page-title">
            ফটো গ্যালারি
            <span className="page-title-count">{albums.length}টি অ্যালবাম</span>
          </h1>
          <p className="page-subtitle">গ্যালারি অ্যালবাম তৈরি এবং ছবি আপলোড করুন</p>
        </div>
        <button className="btn btn-primary" onClick={() => setIsCreateOpen(true)}>
          <Plus size={17} /> নতুন অ্যালবাম তৈরি করুন
        </button>
      </div>

      {actionError && <div className="alert alert-error"><AlertCircle size={16} /> {actionError}</div>}
      {actionSuccess && <div className="alert alert-success"><CheckCircle size={16} /> {actionSuccess}</div>}

      {/* Main Content */}
      {loading ? (
        <div className="spinner-wrap">
          <Loader2 size={30} className="animate-spin" style={{ color: '#1b365d' }} />
          <p style={{ marginTop: '10px', fontSize: '13px' }}>অ্যালবাম তালিকা লোড হচ্ছে...</p>
        </div>
      ) : albums.length === 0 ? (
        <div className="admin-card">
          <div className="empty-state">
            <div className="empty-state-icon">🖼️</div>
            <p className="empty-state-title">কোনো অ্যালবাম নেই</p>
            <p className="empty-state-desc">প্রথম গ্যালারি অ্যালবাম তৈরি করুন।</p>
            <button className="btn btn-primary" onClick={() => setIsCreateOpen(true)}>
              <Plus size={16} /> অ্যালবাম তৈরি করুন
            </button>
          </div>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: selectedAlbum ? '340px 1fr' : '1fr', gap: '20px', alignItems: 'start' }}>
          {/* Albums List */}
          <div>
            <h3 style={{ fontSize: '13px', fontWeight: 700, color: '#64748b', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              অ্যালবাম তালিকা
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {albums.map((album) => {
                const imageCount = album.gallery_images?.length ?? 0;
                const isSelected = selectedAlbum?.id === album.id;
                const coverImg = album.cover_image || album.gallery_images?.[0]?.image_url;
                return (
                  <div
                    key={album.id}
                    onClick={() => setSelectedAlbum(isSelected ? null : album)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '14px',
                      background: isSelected ? '#f0f4fb' : '#fff',
                      border: isSelected ? '2px solid #1b365d' : '1px solid #e8eef8',
                      borderRadius: '12px', padding: '14px',
                      cursor: 'pointer', transition: 'all 0.15s',
                      boxShadow: isSelected ? '0 4px 12px rgba(27,54,93,0.10)' : '0 2px 8px rgba(15,28,56,0.04)',
                    }}
                  >
                    {/* Cover */}
                    <div style={{
                      width: '64px', height: '64px', borderRadius: '10px', overflow: 'hidden', flexShrink: 0,
                      background: '#f0f4fb', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      border: '1px solid #e2e8f0',
                    }}>
                      {coverImg ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={coverImg} alt={album.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        <FolderOpen size={26} color="#94a3b8" />
                      )}
                    </div>

                    {/* Info */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 700, color: '#0f1d38', fontSize: '14px', marginBottom: '2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {album.title}
                      </div>
                      {album.description && (
                        <div style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '4px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {album.description}
                        </div>
                      )}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11.5px', color: '#64748b' }}>
                        <Images size={12} /> {imageCount}টি ছবি
                      </div>
                    </div>

                    {/* Actions */}
                    <div style={{ display: 'flex', gap: '4px', flexShrink: 0 }} onClick={(e) => e.stopPropagation()}>
                      <button
                        className={`status-toggle ${album.is_published ? 'published' : 'draft'}`}
                        onClick={() => handleTogglePublish(album.id, album.is_published)}
                        style={{ fontSize: '11px', padding: '3px 8px' }}
                        title={album.is_published ? 'পাবলিশড' : 'খসড়া'}
                      >
                        {album.is_published ? <Eye size={13} /> : <EyeOff size={13} />}
                      </button>
                      <button className="action-btn delete" onClick={() => promptDeleteAlbum(album)} title="মুছুন">
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Album Image Manager */}
          {selectedAlbum && (
            <div className="admin-card" style={{ padding: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <div>
                  <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#0f1d38', margin: 0 }}>
                    📂 {selectedAlbum.title}
                  </h3>
                  <p style={{ fontSize: '12px', color: '#94a3b8', margin: '3px 0 0' }}>
                    {selectedAlbum.gallery_images?.length || 0}টি ছবি
                  </p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  {/* Upload Button */}
                  <input ref={fileInputRef} type="file" accept="image/*" multiple style={{ display: 'none' }} onChange={handleUploadImages} id="gallery-image-upload" />
                  <label
                    htmlFor="gallery-image-upload"
                    className="btn btn-primary"
                    style={{ cursor: uploading ? 'not-allowed' : 'pointer', opacity: uploading ? 0.7 : 1, fontSize: '13px', padding: '8px 16px' }}
                  >
                    {uploading ? <Loader2 size={14} className="animate-spin" /> : <ImagePlus size={15} />}
                    {uploading ? 'আপলোড হচ্ছে...' : 'ছবি আপলোড করুন'}
                  </label>
                  <button className="modal-close-btn" onClick={() => setSelectedAlbum(null)} title="বন্ধ করুন">
                    <X size={17} />
                  </button>
                </div>
              </div>

              {/* Images Grid */}
              {(selectedAlbum.gallery_images || []).length === 0 ? (
                <div style={{
                  textAlign: 'center', padding: '36px 24px',
                  background: '#f8fafc', borderRadius: '10px',
                  border: '2px dashed #d4dde9', color: '#94a3b8',
                }}>
                  <ImagePlus size={32} style={{ margin: '0 auto 10px', opacity: 0.5 }} />
                  <p style={{ fontSize: '13px', margin: 0 }}>এই অ্যালবামে কোনো ছবি নেই।</p>
                  <p style={{ fontSize: '12px', marginTop: '4px', color: '#cbd5e1' }}>উপরের বাটন থেকে ছবি আপলোড করুন।</p>
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))', gap: '10px' }}>
                  {(selectedAlbum.gallery_images || []).map((img: any) => (
                    <div key={img.id} style={{ position: 'relative', borderRadius: '10px', overflow: 'hidden', aspectRatio: '1', backgroundColor: '#f0f4fb', border: '1px solid #e8eef8' }}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={img.image_url} alt="gallery" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      <button
                        onClick={() => promptDeleteImage(img.id)}
                        style={{
                          position: 'absolute', top: '5px', right: '5px',
                          background: 'rgba(220,38,38,0.88)', border: 'none',
                          borderRadius: '50%', width: '24px', height: '24px',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          cursor: 'pointer', color: '#fff',
                          boxShadow: '0 1px 4px rgba(0,0,0,0.3)',
                          transition: 'background 0.13s',
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
          )}
        </div>
      )}

      {/* Create Album Modal */}
      {isCreateOpen && (
        <div className="modal-overlay">
          <div className="modal-box" style={{ maxWidth: '460px' }}>
            <div className="modal-header">
              <h2 className="modal-title">🗂️ নতুন গ্যালারি অ্যালবাম</h2>
              <button className="modal-close-btn" onClick={() => setIsCreateOpen(false)}>
                <X size={17} />
              </button>
            </div>
            <div className="modal-body">
              <form onSubmit={handleCreateAlbum}>
                <div className="form-group">
                  <label className="form-label">অ্যালবামের শিরোনাম *</label>
                  <input type="text" required className="form-input" value={newTitle} onChange={(e) => setNewTitle(e.target.value)} placeholder="যেমন: বার্ষিক ক্রীড়া প্রতিযোগিতা ২০২৬" />
                </div>
                <div className="form-group">
                  <label className="form-label">বিবরণ (ঐচ্ছিক)</label>
                  <textarea className="form-textarea" rows={3} value={newDescription} onChange={(e) => setNewDescription(e.target.value)} placeholder="অ্যালবামের বিষয়বস্তু..." />
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                  <button type="button" onClick={() => setIsCreateOpen(false)} className="btn btn-outline" disabled={creating}>বাতিল</button>
                  <button type="submit" className="btn btn-primary" disabled={creating}>
                    {creating && <Loader2 size={14} className="animate-spin" />}
                    {creating ? 'তৈরি হচ্ছে...' : 'অ্যালবাম তৈরি করুন'}
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
        title={deleteTarget?.type === 'album' ? 'অ্যালবাম মুছে ফেলার নিশ্চিতকরণ' : 'ছবি মুছে ফেলার নিশ্চিতকরণ'}
        itemName={deleteTarget?.name}
        message={
          deleteTarget?.type === 'album'
            ? 'আপনি কি নিশ্চিত যে এই অ্যালবামটি মুছে ফেলতে চান? অ্যালবামের অন্তর্ভুক্ত সকল ছবিও মুছে যাবে।'
            : 'আপনি কি নিশ্চিত যে এই ছবিটি মুছে ফেলতে চান? এটি স্থায়ীভাবে মুছে যাবে।'
        }
        isDeleting={isDeleting}
        onConfirm={confirmDeleteTarget}
        onCancel={() => {
          setDeleteModalOpen(false);
          setDeleteTarget(null);
        }}
      />
    </div>
  );
}

