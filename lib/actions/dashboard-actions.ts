'use server';

import { createClient } from '../db/supabase-server';

export interface DashboardStats {
  noticesCount: number;
  teachersCount: number;
  eventsCount: number;
  albumsCount: number;
  recentNotices: Array<{
    id: string;
    date: string;
    title: string;
    category: string;
    published: boolean;
  }>;
}

export async function getAdminDashboardStats(): Promise<{ stats: DashboardStats | null; error?: string }> {
  try {
    const supabase = await createClient();
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      return { stats: null, error: 'অনুগ্রহ করে প্রথমে লগইন করুন।' };
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('school_id, role')
      .eq('id', user.id)
      .single();

    if (!profile || profile.role !== 'admin') {
      return { stats: null, error: 'পর্যাপ্ত অ্যাডমিন অনুমতি নেই।' };
    }

    const schoolId = profile.school_id;

    // Fetch counts and recent notices concurrently
    const [noticesRes, teachersRes, eventsRes, albumsRes, recentRes] = await Promise.all([
      supabase.from('notices').select('*', { count: 'exact', head: true }).eq('school_id', schoolId),
      supabase.from('teachers').select('*', { count: 'exact', head: true }).eq('school_id', schoolId),
      supabase.from('events').select('*', { count: 'exact', head: true }).eq('school_id', schoolId),
      supabase.from('gallery_albums').select('*', { count: 'exact', head: true }).eq('school_id', schoolId),
      supabase
        .from('notices')
        .select('id, title, category, pub_date, is_published')
        .eq('school_id', schoolId)
        .order('created_at', { ascending: false })
        .limit(5),
    ]);

    const formatNoticeDate = (dStr?: string) => {
      if (!dStr) return '—';
      try {
        return new Date(dStr).toLocaleDateString('bn-BD', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
        });
      } catch {
        return dStr;
      }
    };

    const formattedRecent = (recentRes.data || []).map((n) => ({
      id: n.id,
      title: n.title,
      category: n.category || 'সাধারণ',
      published: n.is_published ?? false,
      date: formatNoticeDate(n.pub_date),
    }));

    return {
      stats: {
        noticesCount: noticesRes.count ?? 0,
        teachersCount: teachersRes.count ?? 0,
        eventsCount: eventsRes.count ?? 0,
        albumsCount: albumsRes.count ?? 0,
        recentNotices: formattedRecent,
      },
    };
  } catch (err: any) {
    return { stats: null, error: `ড্যাশবোর্ড ডাটা লোড ব্যর্থ: ${err?.message || 'অজানা সমস্যা'}` };
  }
}
