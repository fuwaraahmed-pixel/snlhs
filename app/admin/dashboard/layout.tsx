'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { createClient } from '@/lib/db/supabase-client';
import {
  LayoutDashboard,
  Bell,
  Users,
  Calendar,
  Image as ImageIcon,
  Settings,
  LogOut,
  School as SchoolIcon,
  Menu,
  X,
  ChevronRight,
} from 'lucide-react';

const navItems = [
  { name: 'ড্যাশবোর্ড', href: '/admin/dashboard', icon: LayoutDashboard },
  { name: 'নোটিশ বোর্ড', href: '/admin/notices', icon: Bell },
  { name: 'শিক্ষক ও কর্মচারী', href: '/admin/teachers', icon: Users },
  { name: 'ইভেন্ট ব্যবস্থাপনা', href: '/admin/events', icon: Calendar },
  { name: 'গ্যালারি অ্যালবাম', href: '/admin/gallery', icon: ImageIcon },
  { name: 'সেটিংস', href: '/admin/settings', icon: Settings },
];

const pageTitles: Record<string, string> = {
  '/admin/dashboard': 'ড্যাশবোর্ড',
  '/admin/notices': 'নোটিশ বোর্ড',
  '/admin/teachers': 'শিক্ষক ও কর্মচারী',
  '/admin/events': 'ইভেন্ট ব্যবস্থাপনা',
  '/admin/gallery': 'গ্যালারি অ্যালবাম',
  '/admin/settings': 'সেটিংস',
};

export default function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/admin/login');
    router.refresh();
  };

  const currentPath = pathname || '';
  const activePageTitle = Object.entries(pageTitles).find(([key]) =>
    currentPath === key || currentPath.startsWith(key + '/')
  )?.[1] || 'অ্যাডমিন';

  return (
    <div className="admin-layout">
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="sidebar-mobile-overlay"
          onClick={() => setSidebarOpen(false)}
          style={{ display: 'block' }}
        />
      )}

      {/* ── SIDEBAR ── */}
      <aside className={`admin-sidebar${sidebarOpen ? ' open' : ''}`}>
        {/* Header */}
        <div className="admin-sidebar-header">
          <div className="sidebar-logo-icon">
            <SchoolIcon size={20} color="#0f1d38" />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p className="sidebar-school-name">সাহেরা নায়েব হাই স্কুল</p>
            <span className="sidebar-panel-label">Admin Panel</span>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            style={{
              background: 'none', border: 'none', color: 'rgba(255,255,255,0.5)',
              cursor: 'pointer', padding: '4px', borderRadius: '6px'
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Nav */}
        <nav className="admin-nav">
          <span className="nav-section-label">প্রধান মেনু</span>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPath === item.href || currentPath.startsWith(item.href + '/');
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`admin-nav-item${isActive ? ' active' : ''}`}
                onClick={() => setSidebarOpen(false)}
              >
                <Icon size={18} className="nav-icon" />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* Profile Footer */}
        <div className="sidebar-profile">
          <div className="sidebar-avatar">A</div>
          <div className="sidebar-profile-info">
            <div className="sidebar-profile-name">School Admin</div>
            <div className="sidebar-profile-role">Super Administrator</div>
          </div>
          <button className="sidebar-logout-btn" onClick={handleLogout} title="লগআউট">
            <LogOut size={16} />
          </button>
        </div>
      </aside>

      {/* ── MAIN ── */}
      <div className="admin-main">
        {/* Topbar */}
        <header className="admin-topbar">
          <div className="topbar-left">
            <button
              className="topbar-menu-btn"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu size={22} />
            </button>
            <div className="topbar-breadcrumb">
              <span>অ্যাডমিন</span>
              <ChevronRight size={14} />
              <span className="crumb-active">{activePageTitle}</span>
            </div>
          </div>

          <div className="topbar-right">
            <div className="topbar-badge">
              <span className="topbar-status-dot" />
              <span className="badge-text">স্কুল সক্রিয়</span>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="admin-content">
          {children}
        </main>
      </div>
    </div>
  );
}
