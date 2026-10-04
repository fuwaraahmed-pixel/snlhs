import React from 'react';
import Link from 'next/link';
import { createPublicClient } from '@/lib/db/supabase-public';

// Revalidate every 60 seconds so fresh albums appear quickly
export const revalidate = 60;

interface GalleryImage {
  id: string;
  image_url: string;
}

interface GalleryAlbum {
  id: string;
  title: string;
  description: string | null;
  cover_image: string | null;      // actual DB column name
  is_published: boolean;
  created_at: string;
  gallery_images: GalleryImage[];
}

export default async function PublicGalleryPage() {
  let albums: GalleryAlbum[] = [];
  let schoolName = 'সাহেরা নায়েব ল্যাবরেটরি হাই স্কুল';
  let fetchError: string | null = null;

  try {
    const supabase = createPublicClient();

    // Fetch school name
    const { data: schoolData } = await supabase
      .from('schools')
      .select('name')
      .limit(1)
      .single();
    if (schoolData?.name) schoolName = schoolData.name;

    // Fetch published albums WITH their images — uses correct column name 'cover_image'
    const { data: albumsData, error } = await supabase
      .from('gallery_albums')
      .select('id, title, description, cover_image, is_published, created_at, gallery_images(id, image_url)')
      .eq('is_published', true)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Gallery fetch error:', error.message);
      fetchError = `তথ্য লোড করতে সমস্যা: ${error.message}`;
    } else {
      albums = (albumsData as GalleryAlbum[]) || [];
    }
  } catch (err: any) {
    console.error('Exception fetching gallery:', err);
    fetchError = `সার্ভার এরর: ${err?.message || 'অজানা সমস্যা'}`;
  }

  return (
    <div style={{ fontFamily: 'var(--font-bengali), var(--font-english)', minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: 'var(--neutral-50)' }}>
      {/* Header */}
      <header style={{ backgroundColor: 'var(--white)', borderBottom: '2px solid var(--accent-gold)', padding: 'var(--space-4) 0' }}>
        <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 'var(--space-4)' }}>
          <div>
            <Link href="/" style={{ textDecoration: 'none' }}>
              <h1 style={{ fontSize: 'var(--text-xl)', color: 'var(--primary-900)', margin: 0 }}>
                {schoolName}
              </h1>
            </Link>
          </div>
          <nav style={{ display: 'flex', gap: 'var(--space-5)', fontWeight: 600, flexWrap: 'wrap' }}>
            <Link href="/" style={{ color: 'var(--neutral-700)', textDecoration: 'none' }}>মূল পাতা</Link>
            <Link href="/about" style={{ color: 'var(--neutral-700)', textDecoration: 'none' }}>আমাদের কথা</Link>
            <Link href="/academics" style={{ color: 'var(--neutral-700)', textDecoration: 'none' }}>একাডেমিক</Link>
            <Link href="/admission" style={{ color: 'var(--neutral-700)', textDecoration: 'none' }}>ভর্তি তথ্য</Link>
            <Link href="/notices" style={{ color: 'var(--neutral-700)', textDecoration: 'none' }}>নোটিশ বোর্ড</Link>
            <Link href="/teachers" style={{ color: 'var(--neutral-700)', textDecoration: 'none' }}>শিক্ষকমণ্ডলী</Link>
            <Link href="/events" style={{ color: 'var(--neutral-700)', textDecoration: 'none' }}>ইভেন্ট</Link>
            <Link href="/gallery" style={{ color: 'var(--primary-700)', textDecoration: 'none', borderBottom: '2px solid var(--primary-700)' }}>গ্যালারি</Link>
            <Link href="/contact" style={{ color: 'var(--neutral-700)', textDecoration: 'none' }}>যোগাযোগ</Link>
          </nav>
        </div>
      </header>

      {/* Hero Banner */}
      <section style={{ backgroundColor: 'var(--primary-900)', color: 'var(--white)', padding: 'var(--space-12) 0', textAlign: 'center' }}>
        <div className="container">
          <h2 style={{ fontSize: 'var(--text-3xl)', color: 'var(--white)', marginBottom: 'var(--space-2)' }}>
            🖼️ ফটো গ্যালারি
          </h2>
          <p style={{ color: 'var(--neutral-200)', maxWidth: '600px', margin: '0 auto' }}>
            আমাদের স্কুলের বিভিন্ন অনুষ্ঠান, পুরস্কার বিতরণী ও ক্যাম্পাসের স্মৃতিময় মুহূর্তসমূহ।
          </p>
        </div>
      </section>

      {/* Gallery Content */}
      <main className="container" style={{ padding: 'var(--space-12) 0', flex: 1 }}>

        {/* Error state — show exact message for debugging */}
        {fetchError ? (
          <div style={{ textAlign: 'center', padding: 'var(--space-12)', backgroundColor: 'var(--white)', borderRadius: 'var(--radius-lg)', border: '1px solid #fca5a5' }}>
            <div style={{ fontSize: '48px', marginBottom: 'var(--space-4)' }}>⚠️</div>
            <h3 style={{ color: '#dc2626', marginBottom: 'var(--space-2)' }}>গ্যালারি লোড করতে সমস্যা হয়েছে</h3>
            <p style={{ color: 'var(--neutral-600)', fontSize: 'var(--text-sm)', marginBottom: 'var(--space-4)' }}>
              {fetchError}
            </p>
            <p style={{ color: 'var(--neutral-500)', fontSize: 'var(--text-xs)' }}>
              পেজ রিফ্রেশ করুন অথবা অ্যাডমিনকে জানান।
            </p>
          </div>

        /* Empty state */
        ) : albums.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 'var(--space-16)', backgroundColor: 'var(--white)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--neutral-200)' }}>
            <div style={{ fontSize: '64px', marginBottom: 'var(--space-4)' }}>📷</div>
            <h3 style={{ color: 'var(--primary-900)', marginBottom: 'var(--space-3)' }}>
              এখনো কোনো অ্যালবাম যুক্ত করা হয়নি
            </h3>
            <p style={{ color: 'var(--neutral-500)', fontSize: 'var(--text-sm)' }}>
              অ্যাডমিন প্যানেল থেকে গ্যালারি অ্যালবাম ও ছবি যোগ করুন। অ্যালবাম পাবলিশ করলে এখানে দেখাবে।
            </p>
          </div>

        /* Albums grid */
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 'var(--space-6)' }}>
            {albums.map((album) => {
              const images = album.gallery_images || [];
              const imageCount = images.length;
              // Prefer dedicated cover_image column, fall back to first uploaded image
              const coverUrl = album.cover_image || images[0]?.image_url || null;

              return (
                <div
                  key={album.id}
                  className="gallery-album-card"
                  style={{
                    backgroundColor: 'var(--white)',
                    borderRadius: 'var(--radius-lg)',
                    border: '1px solid var(--neutral-200)',
                    overflow: 'hidden',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                  }}
                >
                  {/* Album Cover */}
                  <div
                    style={{
                      height: '200px',
                      backgroundColor: 'var(--primary-100)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      overflow: 'hidden',
                      position: 'relative',
                    }}
                  >
                    {coverUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={coverUrl}
                        alt={album.title}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        loading="lazy"
                      />
                    ) : (
                      <div style={{ textAlign: 'center', color: 'var(--primary-500)' }}>
                        <div style={{ fontSize: '48px', marginBottom: 'var(--space-2)' }}>📷</div>
                        <div style={{ fontSize: 'var(--text-sm)', fontWeight: 600 }}>ছবি যোগ করা হয়নি</div>
                      </div>
                    )}

                    {/* Image count badge */}
                    <div style={{
                      position: 'absolute',
                      bottom: 'var(--space-2)',
                      right: 'var(--space-2)',
                      backgroundColor: 'rgba(0,0,0,0.65)',
                      color: 'white',
                      padding: '3px 10px',
                      borderRadius: '20px',
                      fontSize: 'var(--text-xs)',
                      fontWeight: 600,
                      backdropFilter: 'blur(4px)',
                    }}>
                      📷 {imageCount}টি ছবি
                    </div>
                  </div>

                  {/* Album Info */}
                  <div style={{ padding: 'var(--space-5)' }}>
                    <h3 style={{ fontSize: 'var(--text-lg)', color: 'var(--primary-900)', marginBottom: 'var(--space-2)', fontWeight: 700 }}>
                      {album.title}
                    </h3>
                    {album.description && (
                      <p style={{ fontSize: 'var(--text-sm)', color: 'var(--neutral-600)', lineHeight: '1.6', marginBottom: 'var(--space-3)' }}>
                        {album.description}
                      </p>
                    )}

                    {/* Mini image strip */}
                    {images.length > 1 && (
                      <div style={{ display: 'flex', gap: '4px', marginBottom: 'var(--space-3)', overflow: 'hidden' }}>
                        {images.slice(1, 5).map((img) => (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            key={img.id}
                            src={img.image_url}
                            alt=""
                            style={{ width: '48px', height: '36px', objectFit: 'cover', borderRadius: 'var(--radius-sm)', flexShrink: 0 }}
                            loading="lazy"
                          />
                        ))}
                        {images.length > 5 && (
                          <div style={{ width: '48px', height: '36px', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--primary-900)', color: 'var(--white)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: 700 }}>
                            +{images.length - 5}
                          </div>
                        )}
                      </div>
                    )}

                    <p style={{ fontSize: 'var(--text-xs)', color: 'var(--neutral-400)' }}>
                      📅 {new Date(album.created_at).toLocaleDateString('bn-BD', { year: 'numeric', month: 'long', day: 'numeric' })}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer style={{ backgroundColor: 'var(--primary-900)', color: 'var(--neutral-300)', padding: 'var(--space-6) 0', marginTop: 'auto' }}>
        <div className="container" style={{ textAlign: 'center', fontSize: 'var(--text-sm)' }}>
          <p>© ২০২৬ {schoolName}। সর্বস্বত্ব সংরক্ষিত।</p>
        </div>
      </footer>
    </div>
  );
}
