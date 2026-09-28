-- ============================================================================
-- Complete Master Database Schema, RLS & Storage Buckets Setup (Refined Version)
-- School Website & Admin SaaS (Multi-Tenant Architecture)
-- File: supabase/full_setup.sql
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
  settings jsonb default '{}'::jsonb, -- Stores motto, established, stats, principal message, etc.
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 2. PROFILES TABLE (linked to auth.users)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  school_id uuid references public.schools(id) on delete cascade,
  role text not null default 'viewer', -- 'admin' | 'viewer' (default is viewer for security)
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

-- ----------------------------------------------------------------------------
-- INDEXES FOR PERFORMANCE & FAST MULTI-TENANT QUERIES
-- ----------------------------------------------------------------------------
create index if not exists idx_profiles_school_id on public.profiles(school_id);
create index if not exists idx_notices_school_id on public.notices(school_id);
create index if not exists idx_teachers_school_id on public.teachers(school_id);
create index if not exists idx_events_school_id on public.events(school_id);
create index if not exists idx_gallery_albums_school_id on public.gallery_albums(school_id);
create index if not exists idx_gallery_images_school_id on public.gallery_images(school_id);
create index if not exists idx_gallery_images_album_id on public.gallery_images(album_id);

-- ----------------------------------------------------------------------------
-- RLS HELPER FUNCTIONS (Public Schema, Security Definer)
-- ----------------------------------------------------------------------------
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

-- ENABLE RLS ON ALL TABLES
alter table public.profiles enable row level security;
alter table public.schools enable row level security;
alter table public.notices enable row level security;
alter table public.teachers enable row level security;
alter table public.events enable row level security;
alter table public.gallery_albums enable row level security;
alter table public.gallery_images enable row level security;

-- ----------------------------------------------------------------------------
-- 1. PROFILES POLICIES
-- ----------------------------------------------------------------------------
drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own" on public.profiles
  for select using (id = auth.uid());

-- ----------------------------------------------------------------------------
-- 2. SCHOOLS POLICIES
-- ----------------------------------------------------------------------------
drop policy if exists "schools_public_select_active" on public.schools;
create policy "schools_public_select_active" on public.schools
  for select using (status = 'active');

drop policy if exists "schools_owner_update" on public.schools;
drop policy if exists "schools_admin_update" on public.schools;
create policy "schools_admin_update" on public.schools
  for update
  using (id = public.current_school_id() and public.current_user_role() = 'admin')
  with check (id = public.current_school_id() and public.current_user_role() = 'admin');

-- ----------------------------------------------------------------------------
-- 3. NOTICES POLICIES
-- ----------------------------------------------------------------------------
drop policy if exists "notices_public_select_published" on public.notices;
drop policy if exists "notices_owner_all_access" on public.notices;
drop policy if exists "notices_select_staff_or_published" on public.notices;
drop policy if exists "notices_admin_insert" on public.notices;
drop policy if exists "notices_admin_update" on public.notices;
drop policy if exists "notices_admin_delete" on public.notices;

create policy "notices_select_staff_or_published" on public.notices
  for select using (
    is_published = true or
    (auth.role() = 'authenticated' and school_id = public.current_school_id())
  );

create policy "notices_admin_insert" on public.notices
  for insert with check (
    auth.role() = 'authenticated' and
    school_id = public.current_school_id() and
    public.current_user_role() = 'admin'
  );

create policy "notices_admin_update" on public.notices
  for update using (
    auth.role() = 'authenticated' and
    school_id = public.current_school_id() and
    public.current_user_role() = 'admin'
  ) with check (
    auth.role() = 'authenticated' and
    school_id = public.current_school_id() and
    public.current_user_role() = 'admin'
  );

create policy "notices_admin_delete" on public.notices
  for delete using (
    auth.role() = 'authenticated' and
    school_id = public.current_school_id() and
    public.current_user_role() = 'admin'
  );

-- ----------------------------------------------------------------------------
-- 4. TEACHERS POLICIES
-- ----------------------------------------------------------------------------
drop policy if exists "teachers_public_select_published" on public.teachers;
drop policy if exists "teachers_owner_all_access" on public.teachers;
drop policy if exists "teachers_select_staff_or_published" on public.teachers;
drop policy if exists "teachers_admin_insert" on public.teachers;
drop policy if exists "teachers_admin_update" on public.teachers;
drop policy if exists "teachers_admin_delete" on public.teachers;

create policy "teachers_select_staff_or_published" on public.teachers
  for select using (
    is_published = true or
    (auth.role() = 'authenticated' and school_id = public.current_school_id())
  );

create policy "teachers_admin_insert" on public.teachers
  for insert with check (
    auth.role() = 'authenticated' and
    school_id = public.current_school_id() and
    public.current_user_role() = 'admin'
  );

create policy "teachers_admin_update" on public.teachers
  for update using (
    auth.role() = 'authenticated' and
    school_id = public.current_school_id() and
    public.current_user_role() = 'admin'
  ) with check (
    auth.role() = 'authenticated' and
    school_id = public.current_school_id() and
    public.current_user_role() = 'admin'
  );

create policy "teachers_admin_delete" on public.teachers
  for delete using (
    auth.role() = 'authenticated' and
    school_id = public.current_school_id() and
    public.current_user_role() = 'admin'
  );

-- ----------------------------------------------------------------------------
-- 5. EVENTS POLICIES
-- ----------------------------------------------------------------------------
drop policy if exists "events_public_select_published" on public.events;
drop policy if exists "events_owner_all_access" on public.events;
drop policy if exists "events_select_staff_or_published" on public.events;
drop policy if exists "events_admin_insert" on public.events;
drop policy if exists "events_admin_update" on public.events;
drop policy if exists "events_admin_delete" on public.events;

create policy "events_select_staff_or_published" on public.events
  for select using (
    is_published = true or
    (auth.role() = 'authenticated' and school_id = public.current_school_id())
  );

create policy "events_admin_insert" on public.events
  for insert with check (
    auth.role() = 'authenticated' and
    school_id = public.current_school_id() and
    public.current_user_role() = 'admin'
  );

create policy "events_admin_update" on public.events
  for update using (
    auth.role() = 'authenticated' and
    school_id = public.current_school_id() and
    public.current_user_role() = 'admin'
  ) with check (
    auth.role() = 'authenticated' and
    school_id = public.current_school_id() and
    public.current_user_role() = 'admin'
  );

create policy "events_admin_delete" on public.events
  for delete using (
    auth.role() = 'authenticated' and
    school_id = public.current_school_id() and
    public.current_user_role() = 'admin'
  );

-- ----------------------------------------------------------------------------
-- 6. GALLERY ALBUMS POLICIES
-- ----------------------------------------------------------------------------
drop policy if exists "gallery_albums_public_select_published" on public.gallery_albums;
drop policy if exists "gallery_albums_owner_all_access" on public.gallery_albums;
drop policy if exists "gallery_albums_select_staff_or_published" on public.gallery_albums;
drop policy if exists "gallery_albums_admin_insert" on public.gallery_albums;
drop policy if exists "gallery_albums_admin_update" on public.gallery_albums;
drop policy if exists "gallery_albums_admin_delete" on public.gallery_albums;

create policy "gallery_albums_select_staff_or_published" on public.gallery_albums
  for select using (
    is_published = true or
    (auth.role() = 'authenticated' and school_id = public.current_school_id())
  );

create policy "gallery_albums_admin_insert" on public.gallery_albums
  for insert with check (
    auth.role() = 'authenticated' and
    school_id = public.current_school_id() and
    public.current_user_role() = 'admin'
  );

create policy "gallery_albums_admin_update" on public.gallery_albums
  for update using (
    auth.role() = 'authenticated' and
    school_id = public.current_school_id() and
    public.current_user_role() = 'admin'
  ) with check (
    auth.role() = 'authenticated' and
    school_id = public.current_school_id() and
    public.current_user_role() = 'admin'
  );

create policy "gallery_albums_admin_delete" on public.gallery_albums
  for delete using (
    auth.role() = 'authenticated' and
    school_id = public.current_school_id() and
    public.current_user_role() = 'admin'
  );

-- ----------------------------------------------------------------------------
-- 7. GALLERY IMAGES POLICIES
-- ----------------------------------------------------------------------------
drop policy if exists "gallery_images_public_select_published" on public.gallery_images;
drop policy if exists "gallery_images_owner_all_access" on public.gallery_images;
drop policy if exists "gallery_images_select_staff_or_published" on public.gallery_images;
drop policy if exists "gallery_images_admin_insert" on public.gallery_images;
drop policy if exists "gallery_images_admin_update" on public.gallery_images;
drop policy if exists "gallery_images_admin_delete" on public.gallery_images;

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

-- ----------------------------------------------------------------------------
-- 8. STORAGE BUCKETS SETUP & POLICIES
-- ----------------------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types) values 
  (
    'notice-files', 
    'notice-files', 
    false, -- Private bucket! Requires createSignedUrl or authenticated access
    10485760, -- 10MB
    array['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
  ),
  (
    'teacher-images', 
    'teacher-images', 
    true, 
    5242880,  -- 5MB
    array['image/jpeg', 'image/png', 'image/webp']
  ),
  (
    'gallery-images', 
    'gallery-images', 
    true, 
    10485760, -- 10MB
    array['image/jpeg', 'image/png', 'image/webp']
  ),
  (
    'event-images', 
    'event-images', 
    true, 
    10485760, -- 10MB
    array['image/jpeg', 'image/png', 'image/webp']
  ),
  (
    'school-assets', 
    'school-assets', 
    true, 
    5242880,  -- 5MB
    array['image/jpeg', 'image/png', 'image/webp', 'image/x-icon']
  )
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- Drop storage policies if existing
drop policy if exists "notice_files_read_tenant_controlled" on storage.objects;
drop policy if exists "media_buckets_public_read" on storage.objects;
drop policy if exists "tenant_auth_upload_storage" on storage.objects;
drop policy if exists "tenant_auth_delete_storage" on storage.objects;

-- Read policy for notice-files bucket
create policy "notice_files_read_tenant_controlled" on storage.objects
  for select using (
    bucket_id = 'notice-files' and (
      exists (
        select 1 from public.notices
        where public.notices.attachment_url = storage.objects.name
          and (
            public.notices.is_published = true or
            public.notices.school_id = public.current_school_id()
          )
      )
    )
  );

-- Read policy for public media buckets
create policy "media_buckets_public_read" on storage.objects
  for select using (
    bucket_id in ('teacher-images', 'gallery-images', 'event-images', 'school-assets')
  );

-- Upload policy (Admin role only + allowed bucket_id check + school_id folder prefix check)
create policy "tenant_auth_upload_storage" on storage.objects
  for insert with check (
    auth.role() = 'authenticated' and
    public.current_user_role() = 'admin' and
    bucket_id in ('notice-files', 'teacher-images', 'gallery-images', 'event-images', 'school-assets') and
    (storage.foldername(name))[1] = public.current_school_id()::text
  );

-- Delete policy (Admin role only + allowed bucket_id check + school_id folder prefix check)
create policy "tenant_auth_delete_storage" on storage.objects
  for delete using (
    auth.role() = 'authenticated' and
    public.current_user_role() = 'admin' and
    bucket_id in ('notice-files', 'teacher-images', 'gallery-images', 'event-images', 'school-assets') and
    (storage.foldername(name))[1] = public.current_school_id()::text
  );
