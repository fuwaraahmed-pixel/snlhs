'use client';

import React, { useState, useEffect } from 'react';
import {
  Mail,
  MailOpen,
  Trash2,
  Phone,
  Calendar,
  Search,
  RefreshCw,
  AlertCircle,
  Inbox,
  User,
  CheckCircle2
} from 'lucide-react';
import {
  getAdminContactMessages,
  markContactMessageReadAction,
  deleteContactMessageAction,
} from '@/lib/actions/contact-actions';

interface ContactMessage {
  id: string;
  name: string;
  phone: string;
  email?: string | null;
  subject: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

export default function AdminMessagesPage() {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRead, setFilterRead] = useState<'all' | 'unread' | 'read'>('all');
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchMessages = async () => {
    setLoading(true);
    setErrorMsg(null);
    const res = await getAdminContactMessages();
    if (res.error) {
      setErrorMsg(res.error);
    } else {
      setMessages(res.messages || []);
      // If selected message is updated, sync it
      if (selectedMessage) {
        const found = (res.messages || []).find((m: ContactMessage) => m.id === selectedMessage.id);
        setSelectedMessage(found || null);
      }
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  const handleToggleRead = async (msg: ContactMessage, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setActionLoading(true);
    const res = await markContactMessageReadAction(msg.id, !msg.is_read);
    if (res.success) {
      setMessages((prev) =>
        prev.map((m) => (m.id === msg.id ? { ...m, is_read: !m.is_read } : m))
      );
      if (selectedMessage?.id === msg.id) {
        setSelectedMessage({ ...selectedMessage, is_read: !msg.is_read });
      }
    }
    setActionLoading(false);
  };

  const handleDelete = async (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!window.confirm('আপনি কি নিশ্চিত যে এই বার্তাটি মুছে ফেলতে চান?')) return;

    setActionLoading(true);
    const res = await deleteContactMessageAction(id);
    if (res.success) {
      setMessages((prev) => prev.filter((m) => m.id !== id));
      if (selectedMessage?.id === id) {
        setSelectedMessage(null);
      }
    }
    setActionLoading(false);
  };

  const filteredMessages = messages.filter((msg) => {
    const matchesSearch =
      msg.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      msg.phone.includes(searchQuery) ||
      msg.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      msg.message.toLowerCase().includes(searchQuery.toLowerCase());

    if (filterRead === 'unread') return matchesSearch && !msg.is_read;
    if (filterRead === 'read') return matchesSearch && msg.is_read;
    return matchesSearch;
  });

  const unreadCount = messages.filter((m) => !m.is_read).length;

  return (
    <div style={{ paddingBottom: 'var(--space-12)' }}>
      {/* Top Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: 'var(--space-4)',
        marginBottom: 'var(--space-6)'
      }}>
        <div>
          <h1 style={{
            fontSize: 'var(--text-2xl)',
            color: 'var(--primary-900)',
            marginBottom: 'var(--space-1)',
            fontWeight: 800
          }}>
            যোগাযোগ বার্তা (Inbox)
          </h1>
          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--neutral-600)' }}>
            ওয়েবসাইট থেকে অভিভাবক ও শুভানুধ্যায়ীদের পাঠানো বার্তা ও অনুসন্ধানের তালিকা
          </p>
        </div>

        <button
          onClick={fetchMessages}
          disabled={loading}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 'var(--space-2)',
            backgroundColor: 'var(--white)',
            border: '1px solid var(--neutral-300)',
            padding: 'var(--space-2) var(--space-4)',
            borderRadius: 'var(--radius-md)',
            fontSize: 'var(--text-sm)',
            fontWeight: 600,
            cursor: 'pointer',
            color: 'var(--primary-900)'
          }}
        >
          <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          <span>রিফ্রেশ</span>
        </button>
      </div>

      {/* Stats and Filter Controls */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
        gap: 'var(--space-4)',
        marginBottom: 'var(--space-6)'
      }}>
        {/* Search */}
        <div style={{ position: 'relative' }}>
          <Search size={18} style={{
            position: 'absolute',
            left: 'var(--space-3)',
            top: '50%',
            transform: 'translateY(-50%)',
            color: 'var(--neutral-400)'
          }} />
          <input
            type="text"
            placeholder="নাম, ফোন নম্বর বা বিষয় লিখে খুঁজুন..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: 'var(--space-3) var(--space-3) var(--space-3) var(--space-10)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--neutral-300)',
              fontSize: 'var(--text-sm)',
              outline: 'none',
              boxSizing: 'border-box'
            }}
          />
        </div>

        {/* Filter Tabs */}
        <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
          <button
            onClick={() => setFilterRead('all')}
            style={{
              flex: 1,
              padding: 'var(--space-2) var(--space-3)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--neutral-300)',
              backgroundColor: filterRead === 'all' ? 'var(--primary-800)' : 'var(--white)',
              color: filterRead === 'all' ? 'var(--white)' : 'var(--neutral-700)',
              fontWeight: 600,
              fontSize: 'var(--text-sm)',
              cursor: 'pointer'
            }}
          >
            সব ({messages.length})
          </button>
          <button
            onClick={() => setFilterRead('unread')}
            style={{
              flex: 1,
              padding: 'var(--space-2) var(--space-3)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--neutral-300)',
              backgroundColor: filterRead === 'unread' ? 'var(--primary-800)' : 'var(--white)',
              color: filterRead === 'unread' ? 'var(--white)' : 'var(--neutral-700)',
              fontWeight: 600,
              fontSize: 'var(--text-sm)',
              cursor: 'pointer'
            }}
          >
            অপঠিত ({unreadCount})
          </button>
          <button
            onClick={() => setFilterRead('read')}
            style={{
              flex: 1,
              padding: 'var(--space-2) var(--space-3)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--neutral-300)',
              backgroundColor: filterRead === 'read' ? 'var(--primary-800)' : 'var(--white)',
              color: filterRead === 'read' ? 'var(--white)' : 'var(--neutral-700)',
              fontWeight: 600,
              fontSize: 'var(--text-sm)',
              cursor: 'pointer'
            }}
          >
            পঠিত ({messages.length - unreadCount})
          </button>
        </div>
      </div>

      {/* Error state */}
      {errorMsg && (
        <div style={{
          backgroundColor: 'var(--error-bg)',
          color: 'var(--error)',
          padding: 'var(--space-4)',
          borderRadius: 'var(--radius-md)',
          marginBottom: 'var(--space-6)',
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--space-2)'
        }}>
          <AlertCircle size={20} />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Content Layout: Master-Detail */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: selectedMessage ? '1fr 1.2fr' : '1fr',
        gap: 'var(--space-6)',
        alignItems: 'start'
      }}>
        {/* Messages List */}
        <div style={{
          backgroundColor: 'var(--white)',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--neutral-200)',
          overflow: 'hidden',
          boxShadow: 'var(--shadow-sm)'
        }}>
          {loading ? (
            <div style={{ padding: 'var(--space-12)', textAlign: 'center', color: 'var(--neutral-500)' }}>
              <RefreshCw size={24} className="animate-spin" style={{ margin: '0 auto 12px' }} />
              <p>বার্তা লোড হচ্ছে...</p>
            </div>
          ) : filteredMessages.length === 0 ? (
            <div style={{ padding: 'var(--space-12)', textAlign: 'center', color: 'var(--neutral-500)' }}>
              <Inbox size={48} style={{ margin: '0 auto 12px', opacity: 0.4 }} />
              <p style={{ fontWeight: 600, color: 'var(--neutral-700)' }}>কোনো বার্তা পাওয়া যায়নি</p>
              <p style={{ fontSize: 'var(--text-sm)' }}>এখনো কোনো নতুন ইনকোয়ারি বা বার্তা জমা হয়নি।</p>
            </div>
          ) : (
            <div>
              {filteredMessages.map((msg) => {
                const isSelected = selectedMessage?.id === msg.id;
                return (
                  <div
                    key={msg.id}
                    onClick={() => setSelectedMessage(msg)}
                    style={{
                      padding: 'var(--space-4) var(--space-5)',
                      borderBottom: '1px solid var(--neutral-100)',
                      backgroundColor: isSelected ? '#eff6ff' : !msg.is_read ? '#f8fafc' : 'var(--white)',
                      cursor: 'pointer',
                      transition: 'background-color 0.15s',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 'var(--space-2)'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                        {!msg.is_read ? (
                          <span style={{
                            width: '8px',
                            height: '8px',
                            borderRadius: '50%',
                            backgroundColor: '#2563eb',
                            display: 'inline-block'
                          }} />
                        ) : null}
                        <strong style={{
                          fontSize: 'var(--text-sm)',
                          color: !msg.is_read ? 'var(--primary-900)' : 'var(--neutral-700)',
                          fontWeight: !msg.is_read ? 700 : 500
                        }}>
                          {msg.name}
                        </strong>
                      </div>
                      <span style={{ fontSize: 'var(--text-xs)', color: 'var(--neutral-500)' }}>
                        {new Date(msg.created_at).toLocaleDateString('bn-BD', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </span>
                    </div>

                    <div style={{
                      fontSize: 'var(--text-sm)',
                      fontWeight: !msg.is_read ? 600 : 400,
                      color: !msg.is_read ? 'var(--primary-900)' : 'var(--neutral-800)',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis'
                    }}>
                      {msg.subject}
                    </div>

                    <div style={{
                      fontSize: 'var(--text-xs)',
                      color: 'var(--neutral-500)',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis'
                    }}>
                      {msg.message}
                    </div>

                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginTop: 'var(--space-1)',
                      fontSize: 'var(--text-xs)',
                      color: 'var(--neutral-500)'
                    }}>
                      <span><Phone size={12} style={{ display: 'inline', marginRight: 4 }} />{msg.phone}</span>
                      <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                        <button
                          onClick={(e) => handleToggleRead(msg, e)}
                          title={msg.is_read ? 'অপঠিত চিহ্নিত করুন' : 'পঠিত চিহ্নিত করুন'}
                          style={{
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            color: 'var(--neutral-500)',
                            padding: '2px'
                          }}
                        >
                          {msg.is_read ? <MailOpen size={14} /> : <Mail size={14} color="#2563eb" />}
                        </button>
                        <button
                          onClick={(e) => handleDelete(msg.id, e)}
                          title="মুছে ফেলুন"
                          style={{
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            color: 'var(--error)',
                            padding: '2px'
                          }}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Message Detail View */}
        {selectedMessage && (
          <div style={{
            backgroundColor: 'var(--white)',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--neutral-200)',
            padding: 'var(--space-6)',
            boxShadow: 'var(--shadow-sm)',
            position: 'sticky',
            top: '80px'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              marginBottom: 'var(--space-4)',
              borderBottom: '1px solid var(--neutral-100)',
              paddingBottom: 'var(--space-4)'
            }}>
              <div>
                <h2 style={{
                  fontSize: 'var(--text-lg)',
                  color: 'var(--primary-900)',
                  fontWeight: 700,
                  marginBottom: 'var(--space-1)'
                }}>
                  {selectedMessage.subject}
                </h2>
                <div style={{ fontSize: 'var(--text-xs)', color: 'var(--neutral-500)' }}>
                  <Calendar size={13} style={{ display: 'inline', marginRight: 4 }} />
                  {new Date(selectedMessage.created_at).toLocaleString('bn-BD', {
                    dateStyle: 'long',
                    timeStyle: 'short'
                  })}
                </div>
              </div>

              <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                <button
                  onClick={() => handleToggleRead(selectedMessage)}
                  style={{
                    backgroundColor: 'var(--neutral-100)',
                    border: '1px solid var(--neutral-300)',
                    padding: 'var(--space-2) var(--space-3)',
                    borderRadius: 'var(--radius-md)',
                    fontSize: 'var(--text-xs)',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6
                  }}
                >
                  {selectedMessage.is_read ? <Mail size={14} /> : <CheckCircle2 size={14} />}
                  <span>{selectedMessage.is_read ? 'অপঠিত করুন' : 'পঠিত করুন'}</span>
                </button>
                <button
                  onClick={() => handleDelete(selectedMessage.id)}
                  style={{
                    backgroundColor: 'var(--error-bg)',
                    color: 'var(--error)',
                    border: 'none',
                    padding: 'var(--space-2) var(--space-3)',
                    borderRadius: 'var(--radius-md)',
                    fontSize: 'var(--text-xs)',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6
                  }}
                >
                  <Trash2 size={14} />
                  <span>মুছুন</span>
                </button>
              </div>
            </div>

            {/* Sender Meta */}
            <div style={{
              backgroundColor: 'var(--neutral-50)',
              borderRadius: 'var(--radius-md)',
              padding: 'var(--space-4)',
              marginBottom: 'var(--space-6)',
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
              gap: 'var(--space-3)'
            }}>
              <div>
                <span style={{ fontSize: 'var(--text-xs)', color: 'var(--neutral-500)', display: 'block' }}>প্রেরকের নাম</span>
                <strong style={{ fontSize: 'var(--text-sm)', color: 'var(--primary-900)' }}>
                  <User size={13} style={{ display: 'inline', marginRight: 4 }} />
                  {selectedMessage.name}
                </strong>
              </div>
              <div>
                <span style={{ fontSize: 'var(--text-xs)', color: 'var(--neutral-500)', display: 'block' }}>ফোন নম্বর</span>
                <a
                  href={`tel:${selectedMessage.phone}`}
                  style={{ fontSize: 'var(--text-sm)', color: 'var(--primary-700)', textDecoration: 'none', fontWeight: 600 }}
                >
                  <Phone size={13} style={{ display: 'inline', marginRight: 4 }} />
                  {selectedMessage.phone}
                </a>
              </div>
              {selectedMessage.email && (
                <div>
                  <span style={{ fontSize: 'var(--text-xs)', color: 'var(--neutral-500)', display: 'block' }}>ইমেইল</span>
                  <a
                    href={`mailto:${selectedMessage.email}`}
                    style={{ fontSize: 'var(--text-sm)', color: 'var(--primary-700)', textDecoration: 'none' }}
                  >
                    <Mail size={13} style={{ display: 'inline', marginRight: 4 }} />
                    {selectedMessage.email}
                  </a>
                </div>
              )}
            </div>

            {/* Message Body */}
            <div>
              <span style={{ fontSize: 'var(--text-xs)', color: 'var(--neutral-500)', display: 'block', marginBottom: 'var(--space-2)' }}>
                বার্তার বিবরণ:
              </span>
              <div style={{
                fontSize: 'var(--text-sm)',
                lineHeight: 1.8,
                color: 'var(--neutral-800)',
                whiteSpace: 'pre-wrap',
                backgroundColor: 'var(--white)',
                padding: 'var(--space-4)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--neutral-200)'
              }}>
                {selectedMessage.message}
              </div>
            </div>

            {/* Direct Reply Button */}
            <div style={{ marginTop: 'var(--space-6)', display: 'flex', gap: 'var(--space-3)' }}>
              <a
                href={`tel:${selectedMessage.phone}`}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 'var(--space-2)',
                  backgroundColor: 'var(--primary-800)',
                  color: 'var(--white)',
                  padding: 'var(--space-2) var(--space-4)',
                  borderRadius: 'var(--radius-md)',
                  textDecoration: 'none',
                  fontSize: 'var(--text-sm)',
                  fontWeight: 600
                }}
              >
                <Phone size={16} />
                <span>সরাসরি কল দিন</span>
              </a>
              {selectedMessage.email && (
                <a
                  href={`mailto:${selectedMessage.email}?subject=Re: ${encodeURIComponent(selectedMessage.subject)}`}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 'var(--space-2)',
                    backgroundColor: 'var(--white)',
                    color: 'var(--primary-900)',
                    border: '1px solid var(--neutral-300)',
                    padding: 'var(--space-2) var(--space-4)',
                    borderRadius: 'var(--radius-md)',
                    textDecoration: 'none',
                    fontSize: 'var(--text-sm)',
                    fontWeight: 600
                  }}
                >
                  <Mail size={16} />
                  <span>ইমেইল পাঠান</span>
                </a>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
