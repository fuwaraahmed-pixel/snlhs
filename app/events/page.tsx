import React from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { createPublicClient } from '@/lib/db/supabase-public';

export const revalidate = 60;

export default async function PublicEventsPage() {
  let events: any[] = [];
  let schoolName = 'সাহেরা নায়েব ল্যাবরেটরি হাই স্কুল';
  let fetchError: string | null = null;

  try {
    const supabase = createPublicClient();

    const { data: schoolData } = await supabase
      .from('schools')
      .select('name')
      .limit(1)
      .single();
    if (schoolData?.name) schoolName = schoolData.name;

    const { data, error } = await supabase
      .from('events')
      .select('id, title, description, event_date, location, featured_image, is_featured')
      .eq('is_published', true)
      .order('event_date', { ascending: false });

    if (error) {
      console.error('Events fetch error:', error.message);
      fetchError = `তথ্য লোড করতে সমস্যা: ${error.message}`;
    } else if (data) {
      events = data;
    }
  } catch (err: any) {
    console.error('Exception fetching events:', err);
    fetchError = `সার্ভার এরর: ${err?.message || 'অজানা সমস্যা'}`;
  }

  // Format Bengali date
  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString('bn-BD', {
        year: 'numeric', month: 'long', day: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div style={{ fontFamily: 'var(--font-bengali), var(--font-english)', minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: 'var(--neutral-50)' }}>
      {/* Header */}
      <Navbar activePage="events" schoolName={schoolName} />

      {/* Hero */}
      <section style={{ backgroundColor: 'var(--primary-900)', color: 'var(--white)', padding: 'var(--space-12) 0', textAlign: 'center' }}>
        <div className="container">
          <h2 style={{ fontSize: 'var(--text-3xl)', color: 'var(--white)', marginBottom: 'var(--space-2)' }}>
            🎉 ইভেন্ট ও অনুষ্ঠান
          </h2>
          <p style={{ color: 'var(--neutral-200)', maxWidth: '600px', margin: '0 auto' }}>
            বিদ্যালয়ের সাম্প্রতিক ও আসন্ন ইভেন্টসমূহ।
          </p>
        </div>
      </section>

      {/* Main Content */}
      <main className="container" style={{ padding: 'var(--space-12) 0', flex: 1 }}>

        {fetchError ? (
          <div style={{ textAlign: 'center', padding: 'var(--space-12)', backgroundColor: 'var(--white)', borderRadius: 'var(--radius-lg)', border: '1px solid #fca5a5' }}>
            <div style={{ fontSize: '48px', marginBottom: 'var(--space-3)' }}>⚠️</div>
            <h3 style={{ color: '#dc2626', marginBottom: 'var(--space-2)' }}>তথ্য লোড করতে সমস্যা</h3>
            <p style={{ color: 'var(--neutral-600)', fontSize: 'var(--text-sm)' }}>{fetchError}</p>
          </div>

        ) : events.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 'var(--space-16)', backgroundColor: 'var(--white)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--neutral-200)' }}>
            <div style={{ fontSize: '64px', marginBottom: 'var(--space-4)' }}>📅</div>
            <h3 style={{ color: 'var(--primary-900)', marginBottom: 'var(--space-2)' }}>এই মুহূর্তে কোনো ইভেন্ট নেই</h3>
            <p style={{ color: 'var(--neutral-500)', fontSize: 'var(--text-sm)' }}>শীঘ্রই নতুন ইভেন্ট যোগ হবে।</p>
          </div>

        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 'var(--space-6)' }}>
            {events.map((event) => (
              <div
                key={event.id}
                style={{
                  backgroundColor: 'var(--white)',
                  borderRadius: 'var(--radius-lg)',
                  border: event.is_featured ? '2px solid var(--accent-gold)' : '1px solid var(--neutral-200)',
                  overflow: 'hidden',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                }}
              >
                {/* Event featured image */}
                {event.featured_image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={event.featured_image}
                    alt={event.title}
                    style={{ width: '100%', height: '200px', objectFit: 'cover' }}
                    loading="lazy"
                  />
                ) : (
                  /* Placeholder banner when no image */
                  <div style={{
                    height: '120px',
                    background: 'linear-gradient(135deg, var(--primary-800) 0%, var(--primary-600) 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '48px',
                  }}>
                    🎉
                  </div>
                )}

                {/* Card body */}
                <div style={{ padding: 'var(--space-5)', flex: 1, display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                  {event.is_featured && (
                    <span style={{ fontSize: '10px', fontWeight: 700, color: 'var(--accent-gold-hover)', backgroundColor: '#fef3c7', padding: '2px 8px', borderRadius: '20px', display: 'inline-block', width: 'fit-content' }}>
                      ★ বিশেষ ইভেন্ট
                    </span>
                  )}

                  <h3 style={{ fontSize: 'var(--text-lg)', color: 'var(--primary-900)', fontWeight: 700, lineHeight: '1.4', margin: 0 }}>
                    {event.title}
                  </h3>

                  <div style={{ display: 'flex', gap: 'var(--space-3)', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: 'var(--text-xs)', color: 'var(--primary-700)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                      📅 {formatDate(event.event_date)}
                    </span>
                    {event.location && (
                      <span style={{ fontSize: 'var(--text-xs)', color: 'var(--neutral-500)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        📍 {event.location}
                      </span>
                    )}
                  </div>

                  {event.description && (
                    <p style={{ fontSize: 'var(--text-sm)', color: 'var(--neutral-700)', lineHeight: '1.6', margin: 0 }}>
                      {event.description}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Institutional Footer */}
      <Footer schoolInfo={{ name: schoolName }} />
    </div>
  );
}
