-- ============================================================================
-- Complete Master Database Schema & RLS Setup
-- School Website & Admin SaaS (Multi-Tenant Architecture)
-- File: supabase/schema.sql
-- ============================================================================

-- 1. SCHOOLS TABLE
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

-- 2. PROFILES TABLE (linked to auth.users)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  school_id uuid references public.schools(id) on delete cascade,
  role text not null default 'viewer', -- 'admin' | 'viewer'
  name text,
  email text,
  created_at timestamptz default now()
);

-- 3. NOTICES TABLE
create table if not exists public.notices (
  id uuid primary key default gen_random_uuid(),
  school_id uuid references public.schools(id) on delete cascade,
  title text not null,
  description text,
  category text,
  pub_date date default current_date,
  attachment_url text,
  attachment_original_name text,
  attachment_type text,
  is_important boolean default false,
  is_published boolean default false,
  created_by uuid references public.profiles(id),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 4. TEACHERS TABLE
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

-- 5. EVENTS TABLE
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

-- 6. GALLERY ALBUMS & IMAGES TABLES
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

-- INDEXES
create index if not exists idx_profiles_school_id on public.profiles(school_id);
create index if not exists idx_notices_school_id on public.notices(school_id);
create index if not exists idx_teachers_school_id on public.teachers(school_id);
create index if not exists idx_events_school_id on public.events(school_id);
create index if not exists idx_gallery_albums_school_id on public.gallery_albums(school_id);
create index if not exists idx_gallery_images_school_id on public.gallery_images(school_id);
create index if not exists idx_gallery_images_album_id on public.gallery_images(album_id);

-- RLS HELPER FUNCTIONS
create or replace function public.current_school_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select school_id from public.profiles where id = auth.uid()
$$;

create or replace function public.current_user_role()
returns text
language sql
stable
security definer
set search_path = public
as $$
  select role from public.profiles where id = auth.uid()
$$;

-- ENABLE RLS
alter table public.profiles enable row level security;
alter table public.schools enable row level security;
alter table public.notices enable row level security;
alter table public.teachers enable row level security;
alter table public.events enable row level security;
alter table public.gallery_albums enable row level security;
alter table public.gallery_images enable row level security;

-- PROFILES POLICIES
create policy "profiles_select_own" on public.profiles
  for select using (id = auth.uid());

-- SCHOOLS POLICIES
create policy "schools_public_select_active" on public.schools
  for select using (status = 'active');

create policy "schools_admin_update" on public.schools
  for update
  using (id = public.current_school_id() and public.current_user_role() = 'admin')
  with check (id = public.current_school_id() and public.current_user_role() = 'admin');

-- GALLERY IMAGES POLICIES WITH ALBUM OWNERSHIP CHECK
create policy "gallery_images_select_staff_or_published" on public.gallery_images
  for select using (
    exists (
      select 1 from public.gallery_albums
      where public.gallery_albums.id = public.gallery_images.album_id
        and public.gallery_albums.is_published = true
    ) or
    (auth.role() = 'authenticated' and school_id = public.current_school_id())
  );

create policy "gallery_images_admin_insert" on public.gallery_images
  for insert with check (
    auth.role() = 'authenticated' and
    school_id = public.current_school_id() and
    public.current_user_role() = 'admin' and
    exists (
      select 1 from public.gallery_albums a
      where a.id = album_id
        and a.school_id = public.current_school_id()
    )
  );

create policy "gallery_images_admin_update" on public.gallery_images
  for update using (
    auth.role() = 'authenticated' and
    school_id = public.current_school_id() and
    public.current_user_role() = 'admin'
  ) with check (
    auth.role() = 'authenticated' and
    school_id = public.current_school_id() and
    public.current_user_role() = 'admin' and
    exists (
      select 1 from public.gallery_albums a
      where a.id = album_id
        and a.school_id = public.current_school_id()
    )
  );

create policy "gallery_images_admin_delete" on public.gallery_images
  for delete using (
    auth.role() = 'authenticated' and
    school_id = public.current_school_id() and
    public.current_user_role() = 'admin'
  );
