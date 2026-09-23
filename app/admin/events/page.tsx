'use client';

import React, { useState } from 'react';
import { Plus, Search, Trash2, Edit3, Calendar as CalendarIcon, MapPin, CheckCircle, XCircle } from 'lucide-react';

export default function EventsManagementPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [title, setTitle] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [location, setLocation] = useState('স্কুল প্রাঙ্গণ');
  const [description, setDescription] = useState('');

  const [events, setEvents] = useState([
    { id: '1', title: 'বার্ষিক ক্রীড়া প্রতিযোগিতা ২০২৬', event_date: '2026-08-15', location: 'স্কুল খেলার মাঠ', description: 'সকল শিক্ষার্থীর জন্য বার্ষিক ক্রীড়া প্রতিযোগিতা।' },
    { id: '2', title: 'বিজ্ঞান মেলা ও সাংস্কৃতিক অনুষ্ঠান', event_date: '2026-09-05', location: 'স্কুল মিলনায়তন', description: 'বিজ্ঞান মেলা ও কুইজ প্রতিযোগিতা অনুষ্ঠিত হবে।' }
  ]);

  const handleOpenModal = (event?: any) => {
    if (event) {
      setEditingId(event.id);
      setTitle(event.title);
      setEventDate(event.event_date);
      setLocation(event.location || 'স্কুল প্রাঙ্গণ');
      setDescription(event.description || '');
    } else {
      setEditingId(null);
      setTitle('');
      setEventDate('');
      setLocation('স্কুল প্রাঙ্গণ');
      setDescription('');
    }
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      setEvents(events.map(ev => ev.id === editingId ? { ...ev, title, event_date: eventDate, location, description } : ev));
    } else {
      setEvents([...events, { id: String(Date.now()), title, event_date: eventDate, location, description }]);
    }
    setIsModalOpen(false);
  };

  const handleDelete = (id: string) => {
    if (confirm('আপনি কি নিশ্চিত যে এই ইভেন্টটি মুছে ফেলতে চান?')) {
      setEvents(events.filter(ev => ev.id !== id));
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-6)', flexWrap: 'wrap', gap: 'var(--space-4)' }}>
        <div>
          <h2 style={{ fontSize: 'var(--text-xl)', color: 'var(--primary-900)', margin: 0 }}>
            ইভেন্ট ব্যবস্থাপনা
          </h2>
          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--neutral-600)', margin: 0 }}>
            স্কুলের আগামী ও পূর্ববর্তী অনুষ্ঠানসূচী পরিচালনা করুন
          </p>
        </div>

        <button
          onClick={() => handleOpenModal()}
          className="btn btn-primary"
          style={{ backgroundColor: 'var(--primary-700)', color: 'var(--white)', display: 'inline-flex', alignItems: 'center', gap: 'var(--space-2)' }}
        >
          <Plus size={18} />
          <span>নতুন ইভেন্ট যুক্ত করুন</span>
        </button>
      </div>

      <div className="admin-table-wrapper">
        <table className="admin-table">
          <thead>
            <tr>
              <th>তারিখ</th>
              <th>ইভেন্ট শিরোনাম</th>
              <th>স্থান</th>
              <th style={{ textAlign: 'right' }}>অ্যাকশন</th>
            </tr>
          </thead>
          <tbody>
            {events.map((ev) => (
              <tr key={ev.id}>
                <td>
                  <span style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--primary-700)' }}>{ev.event_date}</span>
                </td>
                <td>
                  <div style={{ fontWeight: 600, color: 'var(--primary-900)' }}>{ev.title}</div>
                  <div style={{ fontSize: 'var(--text-xs)', color: 'var(--neutral-500)' }}>{ev.description}</div>
                </td>
                <td>
                  <span style={{ fontSize: 'var(--text-xs)', color: 'var(--neutral-600)', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                    <MapPin size={14} /> {ev.location}
                  </span>
                </td>
                <td style={{ textAlign: 'right' }}>
                  <div style={{ display: 'inline-flex', gap: 'var(--space-2)' }}>
                    <button onClick={() => handleOpenModal(ev)} style={{ background: 'none', border: 'none', color: 'var(--primary-700)', cursor: 'pointer' }}>
                      <Edit3 size={18} />
                    </button>
                    <button onClick={() => handleDelete(ev.id)} style={{ background: 'none', border: 'none', color: 'var(--error)', cursor: 'pointer' }}>
                      <Trash2 size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: 'var(--space-4)' }}>
          <div className="admin-card" style={{ width: '100%', maxWidth: '500px' }}>
            <h3 style={{ fontSize: 'var(--text-lg)', color: 'var(--primary-900)', marginBottom: 'var(--space-4)' }}>
              {editingId ? 'ইভেন্ট এডিট করুন' : 'নতুন ইভেন্ট যুক্ত করুন'}
            </h3>

            <form onSubmit={handleSave}>
              <div className="form-group">
                <label className="form-label">ইভেন্টের শিরোনাম *</label>
                <input type="text" required className="form-input" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="যেমন: বিজ্ঞান মেলা ২০২৬" />
              </div>

              <div className="form-group">
                <label className="form-label">ইভেন্টের তারিখ *</label>
                <input type="date" required className="form-input" value={eventDate} onChange={(e) => setEventDate(e.target.value)} />
              </div>

              <div className="form-group">
                <label className="form-label">স্থান</label>
                <input type="text" className="form-input" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="যেমন: স্কুল মিলনায়তন" />
              </div>

              <div className="form-group">
                <label className="form-label">বিস্তারিত বিবরণ</label>
                <textarea className="form-textarea" rows={3} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="অনুষ্ঠানের বিষয়বস্তু..." />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-3)', marginTop: 'var(--space-6)' }}>
                <button type="button" onClick={() => setIsModalOpen(false)} className="btn btn-outline">বাতিল</button>
                <button type="submit" className="btn btn-primary" style={{ backgroundColor: 'var(--primary-700)', color: 'var(--white)' }}>সংরক্ষণ</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
