import { z } from 'zod';

export const LoginSchema = z.object({
  email: z.string().email('সঠিক ইমেইল এড্রেস প্রদান করুন'),
  password: z.string().min(6, 'পাসওয়ার্ড অন্তত ৬ অক্ষরের হতে হবে'),
});

export const NoticeSchema = z.object({
  title: z.string().min(3, 'শিরোনাম আবশ্যক (কমপক্ষে ৩ অক্ষর)'),
  description: z.string().optional(),
  category: z.string().default('সাধারণ'),
  pub_date: z.string().optional(),
  attachment_url: z.string().nullable().optional(),
  attachment_type: z.string().nullable().optional(),
  is_important: z.boolean().default(false),
  is_published: z.boolean().default(true),
});

export const TeacherSchema = z.object({
  name: z.string().min(2, 'শিক্ষকের নাম আবশ্যক'),
  designation: z.string().min(2, 'পদবী আবশ্যক'),
  subject: z.string().optional(),
  department: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email('সঠিক ইমেইল লিখুন').optional().or(z.literal('')),
  photo_url: z.string().nullable().optional(),
  biography: z.string().optional(),
  display_order: z.number().int().default(0),
  is_published: z.boolean().default(true),
});

export const EventSchema = z.object({
  title: z.string().min(3, 'ইভেন্ট শিরোনাম আবশ্যক'),
  description: z.string().optional(),
  event_date: z.string().min(1, 'তারিখ আবশ্যক'),
  start_time: z.string().optional(),
  end_time: z.string().optional(),
  location: z.string().optional(),
  featured_image: z.string().nullable().optional(),
  is_featured: z.boolean().default(false),
  is_published: z.boolean().default(true),
});

export const AlbumSchema = z.object({
  title: z.string().min(3, 'অ্যালবাম শিরোনাম আবশ্যক'),
  description: z.string().optional(),
  cover_image: z.string().nullable().optional(),
  is_published: z.boolean().default(true),
});

export const GalleryImageSchema = z.object({
  album_id: z.string().uuid(),
  image_url: z.string().url('সঠিক ইমেজ URL দিন'),
  caption: z.string().optional(),
  display_order: z.number().int().default(0),
});

export const SchoolSettingsSchema = z.object({
  name: z.string().min(2, 'স্কুলের নাম আবশ্যক'),
  primary_color: z.string().default('#1b365d'),
  secondary_color: z.string().default('#c59b27'),
  address: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email().optional().or(z.literal('')),
  logo_url: z.string().nullable().optional(),
  favicon_url: z.string().nullable().optional(),
});
