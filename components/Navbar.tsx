'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Menu, X, Lock, Phone, School as SchoolIcon } from 'lucide-react';

interface NavbarProps {
  activePage?: string;
  schoolName?: string;
}

export default function Navbar({ activePage = 'home', schoolName = 'সাহেরা নায়েব ল্যাবরেটরি হাই স্কুল' }: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { name: 'মূল পাতা', href: '/', key: 'home' },
    { name: 'আমাদের কথা', href: '/about', key: 'about' },
    { name: 'একাডেমিক', href: '/academics', key: 'academics' },
    { name: 'ভর্তি তথ্য', href: '/admission', key: 'admission' },
    { name: 'নোটিশ বোর্ড', href: '/notices', key: 'notices' },
    { name: 'শিক্ষকমণ্ডলী', href: '/teachers', key: 'teachers' },
    { name: 'ইভেন্ট', href: '/events', key: 'events' },
    { name: 'গ্যালারি', href: '/gallery', key: 'gallery' },
    { name: 'যোগাযোগ', href: '/contact', key: 'contact' },
  ];

  return (
    <>
      {/* Top Banner (Contact & Admin Link) */}
      <div style={{ backgroundColor: 'var(--primary-900)', color: 'var(--white)', padding: '6px 0', fontSize: '12px' }}>
        <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
            <span>EIIN: ১২৩৪৫৬</span>
            <span>|</span>
            <span>ঢাকা শিক্ষা বোর্ড</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <a href="tel:01531927956" style={{ color: 'var(--neutral-300)', display: 'inline-flex', alignItems: 'center', gap: '4px', textDecoration: 'none' }}>
              <Phone size={12} /> 01531927956
            </a>
            <Link href="/admin/login" style={{ color: 'var(--accent-gold)', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '4px', textDecoration: 'none' }}>
              <Lock size={12} /> অ্যাডমিন লগইন
            </Link>
          </div>
        </div>
      </div>

      {/* Main Header & Navbar */}
      <header style={{ backgroundColor: 'var(--white)', borderBottom: '2px solid var(--accent-gold)', position: 'sticky', top: 0, zIndex: 100, boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
        <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px' }}>
          {/* Logo & School Name */}
          <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--primary-700)',
              color: 'var(--accent-gold)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 'bold',
              flexShrink: 0
            }}>
              <SchoolIcon size={22} />
            </div>
            <div>
              <h1 style={{ fontSize: 'var(--text-lg)', color: 'var(--primary-900)', margin: 0, fontWeight: 700, lineHeight: 1.2 }}>
                {schoolName}
              </h1>
              <p style={{ fontSize: '11px', color: 'var(--accent-gold-hover)', fontWeight: 600, margin: 0 }}>
                শিক্ষা • শৃঙ্খলা • চরিত্র
              </p>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="desktop-nav" style={{ display: 'flex', gap: '18px', alignItems: 'center', fontWeight: 600 }}>
            {navLinks.map((link) => {
              const isActive = activePage === link.key;
              return (
                <Link
                  key={link.key}
                  href={link.href}
                  style={{
                    color: isActive ? 'var(--primary-700)' : 'var(--neutral-700)',
                    textDecoration: 'none',
                    borderBottom: isActive ? '2px solid var(--primary-700)' : '2px solid transparent',
                    paddingBottom: '2px',
                    fontSize: 'var(--text-sm)',
                    transition: 'all 0.2s',
                  }}
                >
                  {link.name}
                </Link>
              );
            })}
          </nav>

          {/* Hamburger Menu Toggle (Visible on Mobile/Tablet) */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="mobile-menu-toggle"
            aria-label="Toggle Navigation Menu"
            style={{
              background: 'none',
              border: '1px solid var(--neutral-300)',
              borderRadius: 'var(--radius-md)',
              padding: '6px 10px',
              color: 'var(--primary-900)',
              cursor: 'pointer',
              display: 'none',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            <span style={{ fontSize: 'var(--text-xs)', fontWeight: 700 }}>মেনু</span>
          </button>
        </div>

        {/* Mobile Navigation Drawer Overlay */}
        {mobileMenuOpen && (
          <div
            onClick={() => setMobileMenuOpen(false)}
            style={{
              position: 'fixed',
              inset: 0,
              backgroundColor: 'rgba(0,0,0,0.5)',
              zIndex: 199,
              backdropFilter: 'blur(2px)'
            }}
          />
        )}

        {/* Mobile Slide-Over Menu Drawer */}
        <div
          className={`mobile-drawer ${mobileMenuOpen ? 'open' : ''}`}
          style={{
            position: 'fixed',
            top: 0,
            right: 0,
            bottom: 0,
            width: '280px',
            backgroundColor: 'var(--white)',
            zIndex: 200,
            boxShadow: '-4px 0 20px rgba(0,0,0,0.15)',
            display: 'flex',
            flexDirection: 'column',
            transform: mobileMenuOpen ? 'translateX(0)' : 'translateX(100%)',
            transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          }}
        >
          {/* Mobile Drawer Header */}
          <div style={{
            padding: '16px',
            backgroundColor: 'var(--primary-900)',
            color: 'var(--white)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <span style={{ fontSize: 'var(--text-sm)', fontWeight: 700 }}>মেনু নেভিগেশন</span>
            <button
              onClick={() => setMobileMenuOpen(false)}
              style={{ background: 'none', border: 'none', color: 'var(--white)', cursor: 'pointer' }}
            >
              <X size={22} />
            </button>
          </div>

          {/* Mobile Links List */}
          <div style={{ padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: '4px', overflowY: 'auto', flex: 1 }}>
            {navLinks.map((link) => {
              const isActive = activePage === link.key;
              return (
                <Link
                  key={link.key}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  style={{
                    padding: '12px 14px',
                    borderRadius: 'var(--radius-md)',
                    color: isActive ? 'var(--primary-900)' : 'var(--neutral-800)',
                    backgroundColor: isActive ? 'var(--primary-50)' : 'transparent',
                    fontWeight: isActive ? 700 : 500,
                    textDecoration: 'none',
                    fontSize: 'var(--text-sm)',
                    display: 'block',
                    borderLeft: isActive ? '4px solid var(--primary-700)' : '4px solid transparent'
                  }}
                >
                  {link.name}
                </Link>
              );
            })}

            <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid var(--neutral-200)' }}>
              <Link
                href="/admin/login"
                onClick={() => setMobileMenuOpen(false)}
                className="btn btn-primary"
                style={{
                  width: '100%',
                  justifyContent: 'center',
                  backgroundColor: 'var(--primary-700)',
                  color: 'var(--white)',
                  padding: '10px'
                }}
              >
                🔐 অ্যাডমিন প্যানেল
              </Link>
            </div>
          </div>
        </div>
      </header>
    </>
  );
}
