-- ============================================================================
-- SNLHS Production Fix Script — Supabase SQL Editor-এ একবার Run করুন
-- তৈরির তারিখ: ৭ অক্টোবর ২০২৬
--
-- এই script-এ যা আছে:
-- 1. RLS Helper Functions আপডেট (auth.school_id conflict fix)
-- 2. সমস্ত Table-এর RLS Policies সঠিক admin-role check সহ
-- 3. Storage Policy বাগ ফিক্স (attachment_url vs storage.objects.name mismatch)
-- 4. notice-files bucket পাবলিক করা (PDF download কাজ করবে)
-- ============================================================================

-- ============================================================================
-- STEP 1: Helper Functions (public schema-এ রাখা, auth schema-এ নয়)
-- ============================================================================

-- school_id() function — current user-এর school_id বের করে
create or replace function public.current_school_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select school_id from public.profiles where id = auth.uid()
$$;

-- current_user_role() function — current user-এর role বের করে
create or replace function public.current_user_role()
returns text
language sql
stable
security definer
set search_path = public
as $$
  select role from public.profiles where id = auth.uid()
$$;

-- ============================================================================
-- STEP 2: RLS সব পুরোনো Policies DROP করা (clean slate)
-- ============================================================================

-- Profiles
drop policy if exists "profiles_select_own" on public.profiles;

-- Schools
drop policy if exists "schools_public_select_active" on public.schools;
drop policy if exists "schools_owner_update" on public.schools;
drop policy if exists "schools_admin_update" on public.schools;

-- Notices
drop policy if exists "notices_public_select_published" on public.notices;
drop policy if exists "notices_owner_all_access" on public.notices;
drop policy if exists "notices_select_staff_or_published" on public.notices;
drop policy if exists "notices_admin_insert" on public.notices;
drop policy if exists "notices_admin_update" on public.notices;
drop policy if exists "notices_admin_delete" on public.notices;

-- Teachers
drop policy if exists "teachers_public_select_published" on public.teachers;
drop policy if exists "teachers_owner_all_access" on public.teachers;
drop policy if exists "teachers_select_staff_or_published" on public.teachers;
drop policy if exists "teachers_admin_insert" on public.teachers;
drop policy if exists "teachers_admin_update" on public.teachers;
drop policy if exists "teachers_admin_delete" on public.teachers;

-- Events
drop policy if exists "events_public_select_published" on public.events;
drop policy if exists "events_owner_all_access" on public.events;
drop policy if exists "events_select_staff_or_published" on public.events;
drop policy if exists "events_admin_insert" on public.events;
drop policy if exists "events_admin_update" on public.events;
drop policy if exists "events_admin_delete" on public.events;

-- Gallery Albums
drop policy if exists "gallery_albums_public_select_published" on public.gallery_albums;
drop policy if exists "gallery_albums_owner_all_access" on public.gallery_albums;
drop policy if exists "gallery_albums_select_staff_or_published" on public.gallery_albums;
drop policy if exists "gallery_albums_admin_insert" on public.gallery_albums;
drop policy if exists "gallery_albums_admin_update" on public.gallery_albums;
drop policy if exists "gallery_albums_admin_delete" on public.gallery_albums;

-- Gallery Images
drop policy if exists "gallery_images_public_select_published" on public.gallery_images;
drop policy if exists "gallery_images_owner_all_access" on public.gallery_images;
drop policy if exists "gallery_images_select_staff_or_published" on public.gallery_images;
drop policy if exists "gallery_images_admin_insert" on public.gallery_images;
drop policy if exists "gallery_images_admin_update" on public.gallery_images;
drop policy if exists "gallery_images_admin_delete" on public.gallery_images;

-- Storage
drop policy if exists "notice_files_read_tenant_controlled" on storage.objects;
drop policy if exists "media_buckets_public_read" on storage.objects;
drop policy if exists "tenant_auth_upload_storage" on storage.objects;
drop policy if exists "tenant_auth_delete_storage" on storage.objects;


-- ============================================================================
-- STEP 3: RLS Enable করা (safe — already enabled করা থাকলে কিছু হবে না)
-- ============================================================================
alter table public.profiles enable row level security;
alter table public.schools enable row level security;
alter table public.notices enable row level security;
alter table public.teachers enable row level security;
alter table public.events enable row level security;
alter table public.gallery_albums enable row level security;
alter table public.gallery_images enable row level security;


-- ============================================================================
-- STEP 4: নতুন সঠিক RLS Policies তৈরি করা
-- ============================================================================

-- ---- PROFILES ----
create policy "profiles_select_own" on public.profiles
  for select using (id = auth.uid());

-- ---- SCHOOLS ----
create policy "schools_public_select_active" on public.schools
  for select using (status = 'active');

create policy "schools_admin_update" on public.schools
  for update
  using (id = public.current_school_id() and public.current_user_role() = 'admin')
  with check (id = public.current_school_id() and public.current_user_role() = 'admin');

-- ---- NOTICES ----
-- Public: শুধু published notice দেখা যাবে
create policy "notices_select_published_or_admin" on public.notices
  for select using (
    is_published = true
    or (
      auth.role() = 'authenticated'
      and school_id = public.current_school_id()
      and public.current_user_role() = 'admin'
    )
  );

-- Admin: শুধু admin insert করতে পারবে
create policy "notices_admin_insert" on public.notices
  for insert with check (
    auth.role() = 'authenticated'
    and school_id = public.current_school_id()
    and public.current_user_role() = 'admin'
  );

-- Admin: শুধু admin update করতে পারবে
create policy "notices_admin_update" on public.notices
  for update
  using (
    auth.role() = 'authenticated'
    and school_id = public.current_school_id()
    and public.current_user_role() = 'admin'
  )
  with check (
    auth.role() = 'authenticated'
    and school_id = public.current_school_id()
    and public.current_user_role() = 'admin'
  );

-- Admin: শুধু admin delete করতে পারবে
create policy "notices_admin_delete" on public.notices
  for delete using (
    auth.role() = 'authenticated'
    and school_id = public.current_school_id()
    and public.current_user_role() = 'admin'
  );

-- ---- TEACHERS ----
create policy "teachers_select_published_or_admin" on public.teachers
  for select using (
    is_published = true
    or (
      auth.role() = 'authenticated'
      and school_id = public.current_school_id()
      and public.current_user_role() = 'admin'
    )
  );

create policy "teachers_admin_insert" on public.teachers
  for insert with check (
    auth.role() = 'authenticated'
    and school_id = public.current_school_id()
    and public.current_user_role() = 'admin'
  );

create policy "teachers_admin_update" on public.teachers
  for update
  using (
    auth.role() = 'authenticated'
    and school_id = public.current_school_id()
    and public.current_user_role() = 'admin'
  )
  with check (
    auth.role() = 'authenticated'
    and school_id = public.current_school_id()
    and public.current_user_role() = 'admin'
  );

create policy "teachers_admin_delete" on public.teachers
  for delete using (
    auth.role() = 'authenticated'
    and school_id = public.current_school_id()
    and public.current_user_role() = 'admin'
  );

-- ---- EVENTS ----
create policy "events_select_published_or_admin" on public.events
  for select using (
    is_published = true
    or (
      auth.role() = 'authenticated'
      and school_id = public.current_school_id()
      and public.current_user_role() = 'admin'
    )
  );

create policy "events_admin_insert" on public.events
  for insert with check (
    auth.role() = 'authenticated'
    and school_id = public.current_school_id()
    and public.current_user_role() = 'admin'
  );

create policy "events_admin_update" on public.events
  for update
  using (
    auth.role() = 'authenticated'
    and school_id = public.current_school_id()
    and public.current_user_role() = 'admin'
  )
  with check (
    auth.role() = 'authenticated'
    and school_id = public.current_school_id()
    and public.current_user_role() = 'admin'
  );

create policy "events_admin_delete" on public.events
  for delete using (
    auth.role() = 'authenticated'
    and school_id = public.current_school_id()
    and public.current_user_role() = 'admin'
  );

-- ---- GALLERY ALBUMS ----
create policy "gallery_albums_select_published_or_admin" on public.gallery_albums
  for select using (
    is_published = true
    or (
      auth.role() = 'authenticated'
      and school_id = public.current_school_id()
      and public.current_user_role() = 'admin'
    )
  );

create policy "gallery_albums_admin_insert" on public.gallery_albums
  for insert with check (
    auth.role() = 'authenticated'
    and school_id = public.current_school_id()
    and public.current_user_role() = 'admin'
  );

create policy "gallery_albums_admin_update" on public.gallery_albums
  for update
  using (
    auth.role() = 'authenticated'
    and school_id = public.current_school_id()
    and public.current_user_role() = 'admin'
  )
  with check (
    auth.role() = 'authenticated'
    and school_id = public.current_school_id()
    and public.current_user_role() = 'admin'
  );

create policy "gallery_albums_admin_delete" on public.gallery_albums
  for delete using (
    auth.role() = 'authenticated'
    and school_id = public.current_school_id()
    and public.current_user_role() = 'admin'
  );

-- ---- GALLERY IMAGES ----
create policy "gallery_images_select_published_or_admin" on public.gallery_images
  for select using (
    exists (
      select 1 from public.gallery_albums
      where public.gallery_albums.id = public.gallery_images.album_id
        and public.gallery_albums.is_published = true
    )
    or (
      auth.role() = 'authenticated'
      and school_id = public.current_school_id()
      and public.current_user_role() = 'admin'
    )
  );

create policy "gallery_images_admin_insert" on public.gallery_images
  for insert with check (
    auth.role() = 'authenticated'
    and school_id = public.current_school_id()
    and public.current_user_role() = 'admin'
  );

create policy "gallery_images_admin_update" on public.gallery_images
  for update
  using (
    auth.role() = 'authenticated'
    and school_id = public.current_school_id()
    and public.current_user_role() = 'admin'
  )
  with check (
    auth.role() = 'authenticated'
    and school_id = public.current_school_id()
    and public.current_user_role() = 'admin'
  );

create policy "gallery_images_admin_delete" on public.gallery_images
  for delete using (
    auth.role() = 'authenticated'
    and school_id = public.current_school_id()
    and public.current_user_role() = 'admin'
  );


-- ============================================================================
-- STEP 5: Storage Buckets — notice-files কে PUBLIC করা (PDF download fix)
-- ============================================================================
-- কারণ: notice-files private ছিল কিন্তু URL-based policy কাজ করছিল না।
-- সমাধান: bucket কে public করা এবং simple read policy দেওয়া।
update storage.buckets
  set public = true
  where id = 'notice-files';

-- teacher-images, event-images, gallery-images, school-assets — ইতিমধ্যে public
update storage.buckets
  set public = true
  where id in ('teacher-images', 'event-images', 'gallery-images', 'school-assets');


-- ============================================================================
-- STEP 6: Storage Policies — সঠিক পলিসি তৈরি
-- ============================================================================

-- সব পাবলিক bucket থেকে যে কেউ read করতে পারবে
create policy "all_public_buckets_read" on storage.objects
  for select using (
    bucket_id in ('notice-files', 'teacher-images', 'gallery-images', 'event-images', 'school-assets')
  );

-- Upload: শুধু admin করতে পারবে, এবং শুধু নিজের school_id ফোল্ডারে
create policy "admin_only_upload" on storage.objects
  for insert with check (
    auth.role() = 'authenticated'
    and public.current_user_role() = 'admin'
    and bucket_id in ('notice-files', 'teacher-images', 'gallery-images', 'event-images', 'school-assets')
    and (storage.foldername(name))[1] = public.current_school_id()::text
  );

-- Delete: শুধু admin করতে পারবে, এবং শুধু নিজের school_id ফোল্ডারের ফাইল
create policy "admin_only_delete" on storage.objects
  for delete using (
    auth.role() = 'authenticated'
    and public.current_user_role() = 'admin'
    and bucket_id in ('notice-files', 'teacher-images', 'gallery-images', 'event-images', 'school-assets')
    and (storage.foldername(name))[1] = public.current_school_id()::text
  );


-- ============================================================================
-- STEP 7: Verify — সব policy ঠিকমতো তৈরি হয়েছে কিনা দেখুন
-- ============================================================================
select
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd
from pg_policies
where schemaname in ('public', 'storage')
order by tablename, policyname;
