import React from 'react';
import Link from 'next/link';
import { createPublicClient } from '@/lib/db/supabase-public';

export default async function PublicNoticesPage() {
  let notices: any[] = [];
  let fetchError: string | null = null;

  try {
    const supabase = createPublicClient();
    const { data, error } = await supabase
      .from('notices')
      .select('id, title, description, category, pub_date, is_important')
      .eq('is_published', true)
      .order('pub_date', { ascending: false });

    if (error) {
      console.error('Error fetching public notices:', error);
      fetchError = 'তথ্য লোড করতে সমস্যা হয়েছে।';
    } else if (data) {
      notices = data;
    }
  } catch (err) {
    console.error('Exception fetching public notices:', err);
    fetchError = 'তথ্য লোড করতে সমস্যা হয়েছে।';
  }

  return (
    <div style={{ fontFamily: 'var(--font-bengali), var(--font-english)', minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: 'var(--neutral-50)' }}>
      {/* Navigation Header */}
      <header style={{ backgroundColor: 'var(--white)', borderBottom: '2px solid var(--accent-gold)', padding: 'var(--space-4) 0' }}>
        <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ fontSize: 'var(--text-xl)', color: 'var(--primary-900)', margin: 0 }}>
              সাহেরা নায়েব ল্যাবরেটরি হাই স্কুল
            </h1>
          </div>
          <nav style={{ display: 'flex', gap: 'var(--space-6)', fontWeight: 600 }}>
            <Link href="/" style={{ color: 'var(--neutral-700)' }}>মূল পাতা</Link>
            <Link href="/notices" style={{ color: 'var(--primary-700)' }}>নোটিশ বোর্ড</Link>
            <Link href="/teachers" style={{ color: 'var(--neutral-700)' }}>শিক্ষকমণ্ডলী</Link>
            <Link href="/events" style={{ color: 'var(--neutral-700)' }}>ইভেন্ট ও গ্যালারি</Link>
            <Link href="/admin/login" className="btn btn-outline btn-sm">অ্যাডমিন প্যানেল</Link>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="container" style={{ padding: 'var(--space-8) 0', flex: 1 }}>
        <div style={{ marginBottom: 'var(--space-6)' }}>
          <h2 style={{ fontSize: 'var(--text-3xl)', color: 'var(--primary-900)', marginBottom: 'var(--space-2)' }}>
            📢 নোটিশ বোর্ড
          </h2>
          <p style={{ color: 'var(--neutral-600)' }}>স্কুলের সর্বশেষ নোটিশ ও তথ্যাবলী নিচে দেওয়া হলো।</p>
        </div>

        {fetchError ? (
          <div style={{ backgroundColor: '#fee2e2', color: '#dc2626', padding: 'var(--space-4)', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
            {fetchError}
          </div>
        ) : notices.length === 0 ? (
          <div style={{ backgroundColor: 'var(--white)', padding: 'var(--space-8)', borderRadius: 'var(--radius-lg)', textAlign: 'center', color: 'var(--neutral-600)', border: '1px solid var(--neutral-200)' }}>
            এই মুহূর্তে কোনো তথ্য যুক্ত করা হয়নি।
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            {notices.map((notice) => (
              <div
                key={notice.id}
                style={{
                  backgroundColor: 'var(--white)',
                  padding: 'var(--space-6)',
                  borderRadius: 'var(--radius-lg)',
                  border: '1px solid var(--neutral-200)',
                  boxShadow: 'var(--shadow-sm)',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--space-2)' }}>
                  <h3 style={{ fontSize: 'var(--text-lg)', color: 'var(--primary-900)', margin: 0 }}>
                    {notice.is_important && <span style={{ color: 'red', marginRight: '8px' }}>[জরুরি]</span>}
                    {notice.title}
                  </h3>
                  {notice.category && (
                    <span className="badge badge-event" style={{ fontSize: 'var(--text-xs)' }}>
                      {notice.category}
                    </span>
                  )}
                </div>
                <p style={{ fontSize: 'var(--text-xs)', color: 'var(--neutral-500)', marginBottom: 'var(--space-3)' }}>
                  প্রকাশের তারিখ: {notice.pub_date || 'N/A'}
                </p>
                <p style={{ fontSize: 'var(--text-sm)', color: 'var(--neutral-700)', whiteSpace: 'pre-line' }}>
                  {notice.description}
                </p>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer style={{ backgroundColor: 'var(--primary-900)', color: 'var(--neutral-300)', padding: 'var(--space-6) 0', marginTop: 'auto' }}>
        <div className="container" style={{ textAlign: 'center', fontSize: 'var(--text-sm)' }}>
          <p>© ২০২৬ সাহেরা নায়েব ল্যাবরেটরি হাই স্কুল। সর্বস্বত্ব সংরক্ষিত।</p>
        </div>
      </footer>
    </div>
  );
}
