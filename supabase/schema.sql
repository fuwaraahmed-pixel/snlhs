-- ============================================================================
-- Complete Master Database Schema & RLS Setup
-- School Website & Admin SaaS (Multi-Tenant Architecture)
-- File: supabase/schema.sql
-- ============================================================================

-- 1. SCHOOLS
create table if not exists public.schools (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique not null,
  logo_url text,
  favicon_url text,
  primary_color text default '#1b365d',
  secondary_color text default '#c59b27',
  address text,
  phone text,
  email text,
  status text default 'active', -- 'active' | 'inactive'
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 2. PROFILES (linked to auth.users)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  school_id uuid references public.schools(id) on delete cascade,
  role text not null default 'admin', -- 'admin' | 'viewer'
  name text,
  email text,
  created_at timestamptz default now()
);

-- 3. NOTICES
create table if not exists public.notices (
  id uuid primary key default gen_random_uuid(),
  school_id uuid references public.schools(id) on delete cascade,
  title text not null,
  description text,
  category text,
  pub_date date default current_date,
  attachment_url text,
  attachment_type text,
  is_important boolean default false,
  is_published boolean default false,
  created_by uuid references public.profiles(id),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 4. TEACHERS
create table if not exists public.teachers (
  id uuid primary key default gen_random_uuid(),
  school_id uuid references public.schools(id) on delete cascade,
  name text not null,
  designation text,
  subject text,
  department text,
  phone text,
  email text,
  photo_url text,
  biography text,
  display_order int default 0,
  is_published boolean default true,
  created_by uuid references public.profiles(id),
  updated_at timestamptz default now()
);

-- 5. EVENTS
create table if not exists public.events (
  id uuid primary key default gen_random_uuid(),
  school_id uuid references public.schools(id) on delete cascade,
  title text not null,
  description text,
  event_date date not null,
  start_time time,
  end_time time,
  location text,
  featured_image text,
  is_featured boolean default false,
  is_published boolean default true,
  created_by uuid references public.profiles(id),
  updated_at timestamptz default now()
);

-- 6. GALLERY ALBUMS & IMAGES
create table if not exists public.gallery_albums (
  id uuid primary key default gen_random_uuid(),
  school_id uuid references public.schools(id) on delete cascade,
  title text not null,
  description text,
  cover_image text,
  is_published boolean default true,
  created_at timestamptz default now()
);

create table if not exists public.gallery_images (
  id uuid primary key default gen_random_uuid(),
  school_id uuid references public.schools(id) on delete cascade,
  album_id uuid references public.gallery_albums(id) on delete cascade,
  image_url text not null,
  caption text,
  display_order int default 0,
  created_at timestamptz default now()
);

-- ----------------------------------------------------------------------------
-- RLS POLICIES IMPORT
-- ----------------------------------------------------------------------------
-- Helper function to get authenticated user's school_id
create or replace function auth.school_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select school_id from public.profiles where id = auth.uid()
$$;

-- Enable RLS
alter table public.profiles enable row level security;
alter table public.schools enable row level security;
alter table public.notices enable row level security;
alter table public.teachers enable row level security;
alter table public.events enable row level security;
alter table public.gallery_albums enable row level security;
alter table public.gallery_images enable row level security;

-- PROFILES Policies
create policy "profiles_select_own" on public.profiles
  for select using (id = auth.uid());

-- SCHOOLS Policies
create policy "schools_public_select_active" on public.schools
  for select using (status = 'active');

create policy "schools_owner_update" on public.schools
  for update using (id = auth.school_id()) with check (id = auth.school_id());

-- NOTICES Policies
create policy "notices_public_select_published" on public.notices
  for select using (is_published = true);

create policy "notices_owner_all_access" on public.notices
  for all using (school_id = auth.school_id()) with check (school_id = auth.school_id());

-- TEACHERS Policies
create policy "teachers_public_select_published" on public.teachers
  for select using (is_published = true);

create policy "teachers_owner_all_access" on public.teachers
  for all using (school_id = auth.school_id()) with check (school_id = auth.school_id());

-- EVENTS Policies
create policy "events_public_select_published" on public.events
  for select using (is_published = true);

create policy "events_owner_all_access" on public.events
  for all using (school_id = auth.school_id()) with check (school_id = auth.school_id());

-- GALLERY ALBUMS Policies
create policy "gallery_albums_public_select_published" on public.gallery_albums
  for select using (is_published = true);

create policy "gallery_albums_owner_all_access" on public.gallery_albums
  for all using (school_id = auth.school_id()) with check (school_id = auth.school_id());

-- GALLERY IMAGES Policies
create policy "gallery_images_public_select_published" on public.gallery_images
  for select using (
    exists (
      select 1
      from public.gallery_albums
      where public.gallery_albums.id = public.gallery_images.album_id
        and public.gallery_albums.is_published = true
    )
  );

create policy "gallery_images_owner_all_access" on public.gallery_images
  for all using (school_id = auth.school_id()) with check (school_id = auth.school_id());
