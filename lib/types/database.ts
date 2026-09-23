export type UserRole = 'admin' | 'viewer';

export interface School {
  id: string;
  name: string;
  slug: string;
  logo_url?: string | null;
  favicon_url?: string | null;
  primary_color?: string;
  secondary_color?: string;
  address?: string | null;
  phone?: string | null;
  email?: string | null;
  status: 'active' | 'inactive';
  created_at: string;
  updated_at: string;
}

export interface Profile {
  id: string;
  school_id: string;
  role: UserRole;
  name?: string | null;
  email?: string | null;
  created_at: string;
}

export interface Notice {
  id: string;
  school_id: string;
  title: string;
  description?: string | null;
  category?: string | null;
  pub_date: string;
  attachment_url?: string | null;
  attachment_type?: string | null;
  is_important: boolean;
  is_published: boolean;
  created_by?: string | null;
  created_at: string;
  updated_at: string;
}

export interface Teacher {
  id: string;
  school_id: string;
  name: string;
  designation?: string | null;
  subject?: string | null;
  department?: string | null;
  phone?: string | null;
  email?: string | null;
  photo_url?: string | null;
  biography?: string | null;
  display_order: number;
  is_published: boolean;
  created_by?: string | null;
  updated_at: string;
}

export interface EventItem {
  id: string;
  school_id: string;
  title: string;
  description?: string | null;
  event_date: string;
  start_time?: string | null;
  end_time?: string | null;
  location?: string | null;
  featured_image?: string | null;
  is_featured: boolean;
  is_published: boolean;
  created_by?: string | null;
  updated_at: string;
}

export interface GalleryAlbum {
  id: string;
  school_id: string;
  title: string;
  description?: string | null;
  cover_image?: string | null;
  is_published: boolean;
  created_at: string;
}

export interface GalleryImage {
  id: string;
  school_id: string;
  album_id: string;
  image_url: string;
  caption?: string | null;
  display_order: number;
  created_at: string;
}
