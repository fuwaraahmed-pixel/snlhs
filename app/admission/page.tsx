import React from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import { createPublicClient } from '@/lib/db/supabase-public';

export default async function PublicAdmissionPage() {
  let schoolName = 'সাহেরা নায়েব ল্যাবরেটরি হাই স্কুল';
  try {
    const supabase = createPublicClient();
    const { data } = await supabase.from('schools').select('name').limit(1).single();
    if (data?.name) schoolName = data.name;
  } catch (err) {
    console.error('Error fetching school name:', err);
  }

  return (
    <div style={{ fontFamily: 'var(--font-bengali), var(--font-english)', minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: 'var(--neutral-50)' }}>
      {/* Header */}
      <Navbar activePage="admission" schoolName={schoolName} />

      {/* Hero Banner */}
      <section style={{ backgroundColor: 'var(--primary-900)', color: 'var(--white)', padding: 'var(--space-12) 0', textAlign: 'center' }}>
        <div className="container">
          <h2 style={{ fontSize: 'var(--text-3xl)', color: 'var(--white)', marginBottom: 'var(--space-2)' }}>
            🎓 ভর্তি নির্দেশিকা ও তথ্য
          </h2>
          <p style={{ color: 'var(--neutral-200)' }}>২০২৬ শিক্ষাবর্ষের ভর্তি সংক্রান্ত প্রয়োজনীয় সকল তথ্যাবলী।</p>
        </div>
      </section>

      {/* Main Content */}
      <main className="container" style={{ padding: 'var(--space-12) 0', flex: 1 }}>
        {/* Fee Structure Table */}
        <div style={{ backgroundColor: 'var(--white)', padding: 'var(--space-8)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--neutral-200)', marginBottom: 'var(--space-8)' }}>
          <h3 style={{ color: 'var(--primary-900)', fontSize: 'var(--text-xl)', marginBottom: 'var(--space-4)' }}>💳 ভর্তি ও ফি চার্ট</h3>
          
          <div className="admin-table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>শ্রেণী</th>
                  <th>ভর্তি ফি (এককালীন)</th>
                  <th>মাসিক টিউশন ফি</th>
                  <th>সেশন ফি</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>ষষ্ঠ শ্রেণী</td>
                  <td>১,৫০০ টাকা</td>
                  <td>৫০০ টাকা</td>
                  <td>১,০০০ টাকা</td>
                </tr>
                <tr>
                  <td>সপ্তম - অষ্টম শ্রেণী</td>
                  <td>১,৮০০ টাকা</td>
                  <td>৬০০ টাকা</td>
                  <td>১,২০০ টাকা</td>
                </tr>
                <tr>
                  <td>নবম - দশম শ্রেণী</td>
                  <td>২,০০০ টাকা</td>
                  <td>৭০০ টাকা</td>
                  <td>১,৫০১৮ টাকা</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Required Documents */}
        <div style={{ backgroundColor: 'var(--white)', padding: 'var(--space-8)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--neutral-200)' }}>
          <h3 style={{ color: 'var(--primary-900)', fontSize: 'var(--text-xl)', marginBottom: 'var(--space-3)' }}>📑 প্রয়োজনীয় কাগজপত্র</h3>
          <ul style={{ paddingLeft: '20px', color: 'var(--neutral-700)', fontSize: 'var(--text-sm)', lineHeight: '1.8' }}>
            <li>শিক্ষার্থীর ডিজিটাল জন্ম সনদের অনলাইন সত্যCopied কপি।</li>
            <li>পূর্ববর্তী স্কুলের প্রশংসাপত্র ও নম্বরপত্র (Transfers Certificate).</li>
            <li>শিক্ষার্থীর পাসপোর্ট সাইজের রঙিন ছবি (২ কপি)।</li>
            <li>পিতা/মাতার জাতীয় পরিচয়পত্রের (NID) ফটোকপি।</li>
          </ul>
        </div>
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
