import React from 'react';
import Link from 'next/link';
import { Bell, Users, Calendar, Image as ImageIcon, PlusCircle, ArrowRight } from 'lucide-react';

export default function AdminDashboardPage() {
  // Placeholder stats for hydration
  const stats = [
    { title: 'মোট নোটিশ', count: 12, icon: Bell, color: '#25477b', href: '/admin/notices' },
    { title: 'মোট শিক্ষক ও স্টাফ', count: 24, icon: Users, color: '#c59b27', href: '/admin/teachers' },
    { title: 'আসন্ন ইভেন্ট', count: 5, icon: Calendar, color: '#15803d', href: '/admin/events' },
    { title: 'গ্যালারি অ্যালবাম', count: 8, icon: ImageIcon, color: '#0369a1', href: '/admin/gallery' },
  ];

  const quickActions = [
    { label: 'নতুন নোটিশ', href: '/admin/notices?action=new', color: 'var(--primary-700)' },
    { label: 'নতুন শিক্ষক যুক্ত করুন', href: '/admin/teachers?action=new', color: 'var(--accent-gold)' },
    { label: 'নতুন ইভেন্ট যুক্ত করুন', href: '/admin/events?action=new', color: 'var(--success)' },
    { label: 'নতুন অ্যালবাম', href: '/admin/gallery?action=new', color: 'var(--info)' },
  ];

  return (
    <div>
      {/* Welcome Banner */}
      <div className="admin-card" style={{ marginBottom: 'var(--space-8)', background: 'linear-gradient(135deg, var(--primary-900), var(--primary-700))', color: 'var(--white)' }}>
        <h2 style={{ fontSize: 'var(--text-2xl)', color: 'var(--white)', marginBottom: 'var(--space-2)' }}>
          স্বাগতম, অ্যাডমিন ড্যাশবোর্ডে!
        </h2>
        <p style={{ color: 'var(--neutral-300)', fontSize: 'var(--text-sm)', margin: 0 }}>
          সাহেরা নায়েব ল্যাবরেটরি হাই স্কুলের নোটিশ, শিক্ষক তালিকা, ইভেন্ট ও গ্যালারি পরিচালনা করুন।
        </p>
      </div>

      {/* Stats Grid */}
      <div className="admin-stats-grid">
        {stats.map((item, idx) => {
          const Icon = item.icon;
          return (
            <Link key={idx} href={item.href} style={{ textDecoration: 'none' }}>
              <div className="stat-card" style={{ cursor: 'pointer', transition: 'transform 0.2s' }}>
                <div className="stat-icon" style={{ backgroundColor: `${item.color}15`, color: item.color }}>
                  <Icon size={24} />
                </div>
                <div>
                  <span style={{ fontSize: 'var(--text-2xl)', fontWeight: 700, color: 'var(--primary-900)', display: 'block' }}>
                    {item.count}
                  </span>
                  <span style={{ fontSize: 'var(--text-xs)', color: 'var(--neutral-600)' }}>
                    {item.title}
                  </span>
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="admin-card" style={{ marginBottom: 'var(--space-8)' }}>
        <h3 style={{ fontSize: 'var(--text-lg)', color: 'var(--primary-900)', marginBottom: 'var(--space-4)' }}>
          দ্রুত অ্যাকশন (Quick Actions)
        </h3>
        <div style={{ display: 'flex', gap: 'var(--space-4)', flexWrap: 'wrap' }}>
          {quickActions.map((action, i) => (
            <Link key={i} href={action.href} className="btn btn-outline" style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--space-2)' }}>
              <PlusCircle size={16} />
              <span>{action.label}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* Recent Activity Table Placeholder */}
      <div className="admin-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-4)' }}>
          <h3 style={{ fontSize: 'var(--text-lg)', color: 'var(--primary-900)', margin: 0 }}>
            সাম্প্রতিক প্রকাশিত নোটিশ
          </h3>
          <Link href="/admin/notices" style={{ fontSize: 'var(--text-xs)', color: 'var(--primary-700)', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
            সব নোটিশ দেখুন <ArrowRight size={14} />
          </Link>
        </div>

        <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>তারিখ</th>
                <th>শিরোনাম</th>
                <th>ক্যাটাগরি</th>
                <th>স্ট্যাটাস</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>১৫ আগস্ট ২০২৬</td>
                <td>বার্ষিক ক্রীড়া প্রতিযোগিতা ২০২৬ সংক্রান্ত বিজ্ঞপ্তি</td>
                <td><span className="badge badge-event">ইভেন্ট</span></td>
                <td><span style={{ color: 'var(--success)', fontWeight: 600 }}>প্রকাশিত</span></td>
              </tr>
              <tr>
                <td>১০ আগস্ট ২০২৬</td>
                <td>অর্ধ-বার্ষিক পরীক্ষা ২০২৬ এর সময়সূচী</td>
                <td><span className="badge badge-exam">পরীক্ষা</span></td>
                <td><span style={{ color: 'var(--success)', fontWeight: 600 }}>প্রকাশিত</span></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
