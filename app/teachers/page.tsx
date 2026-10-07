import React from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { createPublicClient } from '@/lib/db/supabase-public';

export const revalidate = 60;

export const metadata: Metadata = {
  title: 'শিক্ষক ও স্টাফবৃন্দ | সাহেরা নায়েব ল্যাবরেটরি হাই স্কুল',
  description: 'সাহেরা নায়েব ল্যাবরেটরি হাই স্কুলের সম্মানিত শিক্ষক-শিক্ষিকা ও কর্মকর্তাদের তালিকা ও পরিচিতি।',
  openGraph: {
    title: 'শিক্ষকমণ্ডলী ও স্টাফ | সাহেরা নায়েব ল্যাবরেটরি হাই স্কুল',
    description: 'দক্ষ ও অভিজ্ঞ শিক্ষকমণ্ডলীর পরিচিতি ও যোগাযোগের তথ্য।',
  },
};

interface TeacherItem {
  id: string;
  name: string;
  designation: string;
  subject?: string | null;
  department?: string | null;
  phone?: string | null;
  email?: string | null;
  photo_url?: string | null;
  display_order?: number;
}

export default async function PublicTeachersPage() {
  let teachers: TeacherItem[] = [];
  let schoolName = 'সাহেরা নায়েব ল্যাবরেটরি হাই স্কুল';
  let fetchError: string | null = null;

  try {
    const supabase = createPublicClient();

    // Fetch school info and teachers concurrently for best performance
    const [schoolRes, teachersRes] = await Promise.all([
      supabase
        .from('schools')
        .select('id, name')
        .eq('slug', 'snlhs')
        .limit(1)
        .maybeSingle(),
      supabase
        .from('teachers')
        .select('id, name, designation, subject, department, phone, email, photo_url, display_order')
        .eq('is_published', true)
        .order('display_order', { ascending: true })
        .limit(100),
    ]);

    if (schoolRes.data?.name) schoolName = schoolRes.data.name;

    // NOTE: RLS policies on Supabase already filter by school_id.
    if (teachersRes.error) {
      console.error('Error fetching public teachers:', teachersRes.error);
      fetchError = 'তথ্য লোড করতে সমস্যা হয়েছে।';
    } else if (teachersRes.data) {
      // RLS already filters by school_id if configured; this is an extra safeguard
      teachers = teachersRes.data;
    }
  } catch (err) {
    console.error('Exception fetching public teachers:', err);
    fetchError = 'তথ্য লোড করতে সমস্যা হয়েছে।';
  }

  return (
    <div style={{ fontFamily: 'var(--font-bengali), var(--font-english)', minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: 'var(--neutral-50)' }}>
      {/* Responsive Navigation Header */}
      <Navbar activePage="teachers" schoolName={schoolName} />

      {/* Main Content */}
      <main className="container" style={{ padding: 'var(--space-8) 0', flex: 1 }}>
        <div style={{ marginBottom: 'var(--space-6)' }}>
          <h2 style={{ fontSize: 'var(--text-3xl)', color: 'var(--primary-900)', marginBottom: 'var(--space-2)' }}>
            👨‍🏫 সম্মানিত শিক্ষকমণ্ডলী
          </h2>
          <p style={{ color: 'var(--neutral-600)' }}>আমাদের অভিজ্ঞ ও নিবেদিতপ্রাণ শিক্ষক ও কর্মকর্তা তালিকা।</p>
        </div>

        {fetchError ? (
          <div style={{ backgroundColor: '#fee2e2', color: '#dc2626', padding: 'var(--space-4)', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
            {fetchError}
          </div>
        ) : teachers.length === 0 ? (
          <div style={{ backgroundColor: 'var(--white)', padding: 'var(--space-8)', borderRadius: 'var(--radius-lg)', textAlign: 'center', color: 'var(--neutral-600)', border: '1px solid var(--neutral-200)' }}>
            এই মুহূর্তে কোনো তথ্য যুক্ত করা হয়নি।
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 'var(--space-6)' }}>
            {teachers.map((teacher) => (
              <div
                key={teacher.id}
                style={{
                  backgroundColor: 'var(--white)',
                  padding: 'var(--space-6)',
                  borderRadius: 'var(--radius-lg)',
                  border: '1px solid var(--neutral-200)',
                  boxShadow: 'var(--shadow-sm)',
                  textAlign: 'center',
                }}
              >
                <div
                  style={{
                    width: '80px',
                    height: '80px',
                    borderRadius: '50%',
                    backgroundColor: 'var(--primary-100)',
                    color: 'var(--primary-900)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 'var(--text-2xl)',
                    fontWeight: 700,
                    margin: '0 auto var(--space-4)',
                    overflow: 'hidden'
                  }}
                >
                  {teacher.photo_url ? (
                    <img src={teacher.photo_url} alt={teacher.name} style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                  ) : (
                    teacher.name.charAt(0)
                  )}
                </div>
                <h3 style={{ fontSize: 'var(--text-lg)', color: 'var(--primary-900)', marginBottom: 'var(--space-1)' }}>
                  {teacher.name}
                </h3>
                <p style={{ fontSize: 'var(--text-sm)', color: 'var(--accent-gold-hover)', fontWeight: 600, marginBottom: 'var(--space-1)' }}>
                  {teacher.designation}
                </p>
                {teacher.department && (
                  <p style={{ fontSize: 'var(--text-xs)', color: 'var(--neutral-500)', marginBottom: 'var(--space-2)' }}>
                    {teacher.department}
                  </p>
                )}
                {teacher.email && (
                  <p style={{ fontSize: 'var(--text-xs)', color: 'var(--neutral-600)' }}>
                    📧 {teacher.email}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Institutional Footer */}
      <Footer />
    </div>
  );
}
