'use client';

import React from 'react';
import Link from 'next/link';
import { Bell, Users, Calendar, Image as ImageIcon, PlusCircle, ArrowRight, TrendingUp } from 'lucide-react';

export default function AdminDashboardPage() {
  const stats = [
    {
      title: 'মোট নোটিশ',
      count: 12,
      icon: Bell,
      iconBg: '#eff6ff',
      iconColor: '#1b365d',
      trend: '+2 এই সপ্তাহে',
      href: '/admin/notices',
    },
    {
      title: 'শিক্ষক ও স্টাফ',
      count: 24,
      icon: Users,
      iconBg: '#fffbeb',
      iconColor: '#c59b27',
      trend: 'সক্রিয় সদস্য',
      href: '/admin/teachers',
    },
    {
      title: 'আসন্ন ইভেন্ট',
      count: 5,
      icon: Calendar,
      iconBg: '#f0fdf4',
      iconColor: '#15803d',
      trend: 'পরবর্তী ৩০ দিনে',
      href: '/admin/events',
    },
    {
      title: 'গ্যালারি অ্যালবাম',
      count: 8,
      icon: ImageIcon,
      iconBg: '#faf5ff',
      iconColor: '#7c3aed',
      trend: 'মোট অ্যালবাম',
      href: '/admin/gallery',
    },
  ];

  const quickActions = [
    { label: 'নতুন নোটিশ', href: '/admin/notices', icon: Bell, color: '#1b365d', bg: '#eff6ff' },
    { label: 'শিক্ষক যুক্ত করুন', href: '/admin/teachers', icon: Users, color: '#c59b27', bg: '#fffbeb' },
    { label: 'নতুন ইভেন্ট', href: '/admin/events', icon: Calendar, color: '#15803d', bg: '#f0fdf4' },
    { label: 'নতুন অ্যালবাম', href: '/admin/gallery', icon: ImageIcon, color: '#7c3aed', bg: '#faf5ff' },
  ];

  const recentNotices = [
    { date: '১৫ আগস্ট ২০২৬', title: 'বার্ষিক ক্রীড়া প্রতিযোগিতা ২০২৬ সংক্রান্ত বিজ্ঞপ্তি', category: 'ইভেন্ট', published: true },
    { date: '১০ আগস্ট ২০২৬', title: 'অর্ধ-বার্ষিক পরীক্ষা ২০২৬ এর সময়সূচী', category: 'পরীক্ষা', published: true },
    { date: '০৫ আগস্ট ২০২৬', title: 'নতুন শিক্ষাবর্ষে ভর্তি সংক্রান্ত বিজ্ঞপ্তি', category: 'ভর্তি', published: false },
  ];

  return (
    <div>
      {/* Welcome Banner */}
      <div style={{
        background: 'linear-gradient(135deg, #0f1d38 0%, #1b365d 50%, #25477b 100%)',
        borderRadius: '16px',
        padding: '28px 32px',
        marginBottom: '24px',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Decorative circles */}
        <div style={{
          position: 'absolute', right: '-30px', top: '-30px',
          width: '160px', height: '160px',
          borderRadius: '50%', background: 'rgba(255,255,255,0.04)',
          pointerEvents: 'none',
        }} />
        <div style={{
          position: 'absolute', right: '80px', bottom: '-50px',
          width: '120px', height: '120px',
          borderRadius: '50%', background: 'rgba(197,155,39,0.08)',
          pointerEvents: 'none',
        }} />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
            <div style={{
              background: 'rgba(197,155,39,0.2)', border: '1px solid rgba(197,155,39,0.4)',
              borderRadius: '9999px', padding: '3px 12px',
              fontSize: '11px', fontWeight: 700, color: '#e8b84b', letterSpacing: '0.07em'
            }}>
              ADMIN DASHBOARD
            </div>
          </div>
          <h2 style={{ fontSize: '22px', color: '#fff', fontWeight: 800, margin: '0 0 6px', letterSpacing: '-0.01em' }}>
            স্বাগতম, অ্যাডমিন! 👋
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '13.5px', margin: 0, fontWeight: 400 }}>
            সাহেরা নায়েব ল্যাবরেটরি হাই স্কুলের নোটিশ, শিক্ষক, ইভেন্ট ও গ্যালারি পরিচালনা করুন।
          </p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="admin-stats-grid">
        {stats.map((item, idx) => {
          const Icon = item.icon;
          return (
            <Link key={idx} href={item.href} className="stat-card">
              <div className="stat-icon" style={{ backgroundColor: item.iconBg }}>
                <Icon size={22} color={item.iconColor} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <span className="stat-value">{item.count}</span>
                <span className="stat-label">{item.title}</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '4px' }}>
                  <TrendingUp size={11} color="#22c55e" />
                  <span style={{ fontSize: '11px', color: '#64748b' }}>{item.trend}</span>
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Quick Actions + Recent Notices */}
      <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '20px', alignItems: 'start' }}>
        {/* Quick Actions */}
        <div className="admin-card" style={{ padding: '20px' }}>
          <h3 style={{ fontSize: '14px', fontWeight: 700, color: '#0f1d38', marginBottom: '14px', margin: '0 0 14px' }}>
            দ্রুত অ্যাকশন
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {quickActions.map((action, i) => {
              const Icon = action.icon;
              return (
                <Link
                  key={i}
                  href={action.href}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '11px 14px',
                    borderRadius: '10px',
                    background: action.bg,
                    textDecoration: 'none',
                    transition: 'transform 0.15s, box-shadow 0.15s',
                    border: '1px solid transparent',
                  }}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLElement).style.transform = 'translateX(3px)';
                    (e.currentTarget as HTMLElement).style.boxShadow = '0 3px 10px rgba(0,0,0,0.07)';
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLElement).style.transform = 'translateX(0)';
                    (e.currentTarget as HTMLElement).style.boxShadow = 'none';
                  }}
                >
                  <div style={{
                    width: '34px', height: '34px', borderRadius: '9px',
                    background: '#fff', display: 'flex', alignItems: 'center',
                    justifyContent: 'center', flexShrink: 0,
                    boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
                  }}>
                    <Icon size={16} color={action.color} />
                  </div>
                  <span style={{ fontSize: '13px', fontWeight: 600, color: '#0f1d38' }}>
                    {action.label}
                  </span>
                  <ArrowRight size={14} color="#94a3b8" style={{ marginLeft: 'auto' }} />
                </Link>
              );
            })}
          </div>
        </div>

        {/* Recent Notices */}
        <div>
          <div style={{
            display: 'flex', justifyContent: 'space-between',
            alignItems: 'center', marginBottom: '14px',
          }}>
            <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#0f1d38', margin: 0 }}>
              সাম্প্রতিক নোটিশ
            </h3>
            <Link
              href="/admin/notices"
              style={{
                fontSize: '12px', color: '#1b365d', fontWeight: 600,
                display: 'inline-flex', alignItems: 'center', gap: '4px',
                textDecoration: 'none',
              }}
            >
              সব দেখুন <ArrowRight size={13} />
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
                {recentNotices.map((n, i) => (
                  <tr key={i}>
                    <td style={{ whiteSpace: 'nowrap', color: '#64748b', fontSize: '12px' }}>{n.date}</td>
                    <td style={{ fontWeight: 500, color: '#0f1d38', maxWidth: '260px' }}>{n.title}</td>
                    <td>
                      <span className={`badge ${n.category === 'ইভেন্ট' ? 'badge-event' : n.category === 'পরীক্ষা' ? 'badge-exam' : 'badge-admission'}`}>
                        {n.category}
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${n.published ? 'badge-published' : 'badge-draft'}`}>
                        {n.published ? 'প্রকাশিত' : 'খসড়া'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
