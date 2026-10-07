'use client';

import React, { useState, useMemo } from 'react';
import { Search, Filter, Download, FileText, Bell, AlertCircle, Calendar } from 'lucide-react';
import { formatBengaliDate, toBengaliDigits } from '@/lib/utils/formatters';

export interface NoticeItem {
  id: string;
  title: string;
  description?: string | null;
  category?: string | null;
  pub_date?: string | null;
  is_important?: boolean;
  attachment_url?: string | null;
  attachment_original_name?: string | null;
}

interface NoticeListClientProps {
  initialNotices: NoticeItem[];
  fetchError: string | null;
}

const CATEGORIES = [
  'সকল',
  'একাডেমিক',
  'পরীক্ষা',
  'ভর্তি',
  'ছুটি',
  'ইভেন্ট',
  'সাধারণ',
];

export default function NoticeListClient({ initialNotices, fetchError }: NoticeListClientProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('সকল');

  // Filter notices based on search term and category
  const filteredNotices = useMemo(() => {
    return initialNotices.filter((notice) => {
      // Category filter
      const matchesCategory =
        selectedCategory === 'সকল' ||
        (notice.category && notice.category.trim() === selectedCategory);

      // Search term filter (title or description)
      const query = searchTerm.trim().toLowerCase();
      const matchesSearch =
        !query ||
        notice.title.toLowerCase().includes(query) ||
        (notice.description && notice.description.toLowerCase().includes(query));

      return matchesCategory && matchesSearch;
    });
  }, [initialNotices, selectedCategory, searchTerm]);

  // Badge styles based on category
  const getBadgeStyle = (category?: string | null) => {
    switch (category) {
      case 'ভর্তি':
        return { bg: '#dbeafe', color: '#1e40af', border: '#bfdbfe' };
      case 'পরীক্ষা':
        return { bg: '#fef3c7', color: '#92400e', border: '#fde68a' };
      case 'ছুটি':
        return { bg: '#fee2e2', color: '#991b1b', border: '#fecaca' };
      case 'ইভেন্ট':
        return { bg: '#dcfce7', color: '#166534', border: '#bbf7d0' };
      case 'একাডেমিক':
        return { bg: '#f3e8ff', color: '#6b21a8', border: '#e9d5ff' };
      default:
        return { bg: '#f1f5f9', color: '#1e293b', border: '#e2e8f0' };
    }
  };

  return (
    <div style={{ width: '100%' }}>
      {/* Search and Filters Bar */}
      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          padding: '20px',
          boxShadow: '0 4px 15px rgba(0, 0, 0, 0.05)',
          border: '1px solid #e2e8f0',
          marginBottom: '28px',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <label htmlFor="notice-search-input" style={{ fontSize: '13.5px', fontWeight: 600, color: '#334155' }}>
            নোটিশ খুঁজুন
          </label>
          <div style={{ position: 'relative', width: '100%' }}>
            <Search
              size={18}
              color="#94a3b8"
              style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }}
            />
            <input
              id="notice-search-input"
              type="text"
              placeholder="শিরোনাম বা বিবরণ লিখে খুঁজুন..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                padding: '12px 14px 12px 42px',
                borderRadius: '10px',
                border: '1px solid #cbd5e1',
                fontSize: '14.5px',
                outline: 'none',
                transition: 'border-color 0.2s',
                fontFamily: 'inherit',
                backgroundColor: '#f8fafc',
              }}
              onFocus={(e) => (e.target.style.borderColor = '#1b365d')}
              onBlur={(e) => (e.target.style.borderColor = '#cbd5e1')}
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                style={{
                  position: 'absolute',
                  right: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  color: '#94a3b8',
                  fontSize: '13px',
                  cursor: 'pointer',
                  padding: '4px',
                }}
              >
                ✕ মুছে ফেলুন
              </button>
            )}
          </div>
        </div>

        {/* Category Pills */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '10px' }}>
            <Filter size={14} color="#64748b" />
            <span style={{ fontSize: '13px', fontWeight: 600, color: '#475569' }}>ক্যাটাগরি অনুযায়ী বাছাই করুন:</span>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {CATEGORIES.map((cat) => {
              const isSelected = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  style={{
                    padding: '6px 14px',
                    borderRadius: '20px',
                    fontSize: '13px',
                    fontWeight: isSelected ? 700 : 500,
                    border: isSelected ? '1px solid #1b365d' : '1px solid #e2e8f0',
                    backgroundColor: isSelected ? '#1b365d' : '#ffffff',
                    color: isSelected ? '#ffffff' : '#475569',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease-in-out',
                  }}
                >
                  {cat}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Result Status Count */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', padding: '0 4px' }}>
        <p style={{ margin: 0, fontSize: '14px', color: '#64748b', fontWeight: 500 }}>
          মোট নোটিশ: <strong style={{ color: '#0f1d38' }}>{toBengaliDigits(filteredNotices.length)} টি</strong>
          {selectedCategory !== 'সকল' && <span> (ক্যাটাগরি: {selectedCategory})</span>}
        </p>
      </div>

      {/* Content Section */}
      {fetchError ? (
        <div
          style={{
            backgroundColor: '#fee2e2',
            color: '#b91c1c',
            border: '1px solid #fca5a5',
            padding: '24px',
            borderRadius: '12px',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '10px',
          }}
        >
          <AlertCircle size={32} />
          <h3 style={{ margin: 0, fontSize: '17px' }}>তথ্য প্রদর্শনে সমস্যা</h3>
          <p style={{ margin: 0, fontSize: '14px' }}>{fetchError}</p>
        </div>
      ) : filteredNotices.length === 0 ? (
        <div
          style={{
            backgroundColor: '#ffffff',
            padding: '60px 20px',
            borderRadius: '16px',
            textAlign: 'center',
            color: '#64748b',
            border: '1px solid #e2e8f0',
          }}
        >
          <Bell size={48} color="#cbd5e1" style={{ margin: '0 auto 16px' }} />
          <h3 style={{ color: '#0f1d38', fontSize: '18px', margin: '0 0 8px' }}>
            {searchTerm || selectedCategory !== 'সকল'
              ? 'অনুসন্ধানের সাথে মেলে এমন কোনো নোটিশ পাওয়া যায়নি'
              : 'বর্তমানে কোনো নতুন নোটিশ নেই'}
          </h3>
          <p style={{ margin: 0, fontSize: '14px' }}>
            {searchTerm || selectedCategory !== 'সকল'
              ? 'ভিন্ন শব্দ দিয়ে পুনরায় খুঁজুন অথবা সকল ক্যাটাগরি নির্বাচন করুন।'
              : 'পরবর্তী নোটিশ বা ঘোষণা প্রকাশিত হলে এখানে দেখা যাবে।'}
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {filteredNotices.map((notice) => {
            const badgeStyle = getBadgeStyle(notice.category);
            return (
              <article
                key={notice.id}
                style={{
                  backgroundColor: '#ffffff',
                  padding: '24px',
                  borderRadius: '14px',
                  border: notice.is_important ? '1.5px solid #c59b27' : '1px solid #e2e8f0',
                  boxShadow: notice.is_important
                    ? '0 4px 12px rgba(197, 155, 39, 0.08)'
                    : '0 2px 8px rgba(0, 0, 0, 0.03)',
                  transition: 'transform 0.15s, box-shadow 0.15s',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    flexWrap: 'wrap',
                    gap: '12px',
                    marginBottom: '12px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                    <span
                      style={{
                        fontSize: '12px',
                        fontWeight: 700,
                        padding: '4px 10px',
                        borderRadius: '12px',
                        backgroundColor: badgeStyle.bg,
                        color: badgeStyle.color,
                        border: `1px solid ${badgeStyle.border}`,
                      }}
                    >
                      {notice.category || 'সাধারণ'}
                    </span>

                    {notice.is_important && (
                      <span
                        style={{
                          fontSize: '12px',
                          fontWeight: 700,
                          padding: '4px 10px',
                          borderRadius: '12px',
                          backgroundColor: '#fee2e2',
                          color: '#b91c1c',
                          border: '1px solid #fecaca',
                        }}
                      >
                        জরুরী বিজ্ঞপ্তি
                      </span>
                    )}

                    <span style={{ fontSize: '13px', color: '#64748b', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                      <Calendar size={14} /> প্রকাশিত: {formatBengaliDate(notice.pub_date)}
                    </span>
                  </div>

                  {/* Attachment Download Action */}
                  {notice.attachment_url && (
                    <a
                      href={notice.attachment_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      download
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        backgroundColor: '#1b365d',
                        color: '#ffffff',
                        padding: '8px 16px',
                        borderRadius: '8px',
                        fontSize: '12.5px',
                        fontWeight: 600,
                        textDecoration: 'none',
                        boxShadow: '0 2px 6px rgba(27, 54, 93, 0.18)',
                        transition: 'background-color 0.15s',
                      }}
                    >
                      <Download size={14} />
                      <span>ফাইল ডাউনলোড</span>
                    </a>
                  )}
                </div>

                <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#0f1d38', margin: '0 0 10px', lineHeight: 1.4 }}>
                  {notice.title}
                </h2>

                {notice.description && (
                  <p style={{ fontSize: '14.5px', color: '#475569', lineHeight: 1.7, margin: 0, whiteSpace: 'pre-line' }}>
                    {notice.description}
                  </p>
                )}

                {notice.attachment_url && (
                  <div
                    style={{
                      marginTop: '16px',
                      paddingTop: '12px',
                      borderTop: '1px dashed #e2e8f0',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                    }}
                  >
                    <FileText size={16} color="#c59b27" />
                    <span style={{ fontSize: '12.5px', color: '#64748b' }}>
                      সংযুক্ত নথি: <strong>{notice.attachment_original_name || 'Notice Document'}</strong>
                    </span>
                  </div>
                )}
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
