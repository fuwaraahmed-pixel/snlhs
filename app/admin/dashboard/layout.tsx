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
  UserCheck
} from 'lucide-react';

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

  const navItems = [
    { name: 'ড্যাশবোর্ড', href: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'নোটিশ ব্যবস্থাপনা', href: '/admin/notices', icon: Bell },
    { name: 'শিক্ষক ও কর্মচারী', href: '/admin/teachers', icon: Users },
    { name: 'ইভেন্ট ব্যবস্থাপনা', href: '/admin/events', icon: Calendar },
    { name: 'গ্যালারি অ্যালবাম', href: '/admin/gallery', icon: ImageIcon },
    { name: 'স্কুলের তথ্য ও সেটিংস', href: '/admin/settings', icon: Settings },
  ];

  const currentPath = pathname || '';

  return (
    <div className="admin-layout">
      {/* Sidebar Overlay for Mobile */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            zIndex: 40
          }}
        />
      )}

      {/* Sidebar Container */}
      <aside className={`admin-sidebar ${sidebarOpen ? 'open' : ''}`} style={{
        position: sidebarOpen ? 'fixed' : 'relative',
        top: 0,
        bottom: 0,
        left: 0,
        zIndex: 50,
        width: '260px',
        backgroundColor: 'var(--primary-900)',
        color: 'var(--white)'
      }}>
        <div className="admin-sidebar-header">
          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'var(--accent-gold)',
            color: 'var(--primary-900)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 'bold'
          }}>
            <SchoolIcon size={20} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <h2 style={{ fontSize: 'var(--text-sm)', color: 'var(--white)', fontWeight: 700, margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              সাহেরা নায়েব হাই স্কুল
            </h2>
            <span style={{ fontSize: '11px', color: 'var(--accent-gold)', display: 'block' }}>
              অ্যাডমিন প্যানেল
            </span>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            style={{
              display: 'none',
              background: 'none',
              border: 'none',
              color: 'var(--white)',
              cursor: 'pointer'
            }}
            className="mobile-close-btn"
          >
            <X size={20} />
          </button>
        </div>

        <nav className="admin-nav">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPath === item.href || currentPath.startsWith(item.href + '/');
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`admin-nav-item ${isActive ? 'active' : ''}`}
                onClick={() => setSidebarOpen(false)}
              >
                <Icon size={18} />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        <div style={{ padding: 'var(--space-4)', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
          <button
            onClick={handleLogout}
            className="admin-nav-item"
            style={{
              width: '100%',
              background: 'none',
              border: 'none',
              color: '#f87171',
              cursor: 'pointer',
              justifyContent: 'flex-start'
            }}
          >
            <LogOut size={18} />
            <span>লগআউট</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="admin-main">
        <header className="admin-topbar">
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
            <button
              onClick={() => setSidebarOpen(true)}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: 'var(--primary-900)'
              }}
            >
              <Menu size={24} />
            </button>
            <h1 style={{ fontSize: 'var(--text-lg)', color: 'var(--primary-900)', margin: 0 }}>
              অ্যাডমিন ড্যাশবোর্ড
            </h1>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--space-2)',
              backgroundColor: 'var(--primary-50)',
              padding: 'var(--space-2) var(--space-3)',
              borderRadius: 'var(--radius-full)'
            }}>
              <UserCheck size={16} color="var(--primary-700)" />
              <span style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--primary-900)' }}>
                স্কুল এডমিন
              </span>
            </div>
          </div>
        </header>

        <main className="admin-content">
          {children}
        </main>
      </div>
    </div>
  );
}
