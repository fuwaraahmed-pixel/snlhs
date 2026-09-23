-- ============================================================================
-- Migration: Production Row Level Security (RLS) Policies
-- School Website & Admin SaaS (Multi-Tenant Architecture)
-- File: supabase/migrations/20260923000000_rls_policies.sql
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 0. HELPER FUNCTION FOR TENANT ISOLATION
-- ----------------------------------------------------------------------------
-- Retrieves the school_id assigned to the currently authenticated user profile.
-- Defined as STABLE SECURITY DEFINER so RLS on profiles does not block tenant evaluation.
create or replace function auth.school_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select school_id from public.profiles where id = auth.uid()
$$;

-- ----------------------------------------------------------------------------
-- 1. PROFILES TABLE RLS
-- ----------------------------------------------------------------------------
-- Protects user profiles, preventing unauthorized access or client-side tampering
-- with sensitive fields like school_id or role.
alter table public.profiles enable row level security;

-- Policy: Authenticated users can only read their own profile row.
-- Prevents admins/viewers from inspecting profiles of other users across schools.
create policy "profiles_select_own" on public.profiles
  for select
  using (id = auth.uid());

-- NOTE: No INSERT, UPDATE, or DELETE policies are granted to client-side roles.
-- Role or school_id modifications MUST be executed via service-role key or server-side admin script.

-- ----------------------------------------------------------------------------
-- 2. SCHOOLS TABLE RLS
-- ----------------------------------------------------------------------------
-- Controls access to school configuration data (branding, name, contact info).
alter table public.schools enable row level security;

-- Policy: Public visitors can view active schools.
-- Protects inactive/suspended schools from public visibility while enabling branding hydrations.
create policy "schools_public_select_active" on public.schools
  for select
  using (status = 'active');

-- Policy: School admins can update settings ONLY for their assigned school.
-- Prevents cross-tenant tampering of school name, colors, logo, or settings.
create policy "schools_owner_update" on public.schools
  for update
  using (id = auth.school_id())
  with check (id = auth.school_id());

-- ----------------------------------------------------------------------------
-- 3. NOTICES TABLE RLS
-- ----------------------------------------------------------------------------
-- Manages access control for institutional notices and announcements.
alter table public.notices enable row level security;

-- Policy: Public (anonymous) visitors can read published notices only.
-- Protects draft, archived, or unpublished notices from public access.
create policy "notices_public_select_published" on public.notices
  for select
  using (is_published = true);

-- Policy: Authenticated school staff (admin/viewer) have full access to their school's notices.
-- Enforces strict tenant isolation for SELECT, INSERT, UPDATE, and DELETE.
create policy "notices_owner_all_access" on public.notices
  for all
  using (school_id = auth.school_id())
  with check (school_id = auth.school_id());

-- ----------------------------------------------------------------------------
-- 4. TEACHERS TABLE RLS
-- ----------------------------------------------------------------------------
-- Controls access to faculty directory entries and staff profiles.
alter table public.teachers enable row level security;

-- Policy: Public visitors can read published teacher profiles only.
-- Prevents unreleased or hidden teacher profiles from public display.
create policy "teachers_public_select_published" on public.teachers
  for select
  using (is_published = true);

-- Policy: Authenticated school staff have full access to their school's teacher records.
-- Prevents cross-school viewing, adding, updating, or deleting of teacher profiles.
create policy "teachers_owner_all_access" on public.teachers
  for all
  using (school_id = auth.school_id())
  with check (school_id = auth.school_id());

-- ----------------------------------------------------------------------------
-- 5. EVENTS TABLE RLS
-- ----------------------------------------------------------------------------
-- Controls access to school events and calendar entries.
alter table public.events enable row level security;

-- Policy: Public visitors can read published events only.
-- Protects internal or tentative school events from being exposed to the public.
create policy "events_public_select_published" on public.events
  for select
  using (is_published = true);

-- Policy: Authenticated school staff have full access to their school's events.
-- Guarantees tenant isolation for creating, editing, and deleting events.
create policy "events_owner_all_access" on public.events
  for all
  using (school_id = auth.school_id())
  with check (school_id = auth.school_id());

-- ----------------------------------------------------------------------------
-- 6. GALLERY ALBUMS TABLE RLS
-- ----------------------------------------------------------------------------
-- Controls access to photo gallery album containers.
alter table public.gallery_albums enable row level security;

-- Policy: Public visitors can read published albums only.
-- Protects unpublished or draft albums from public browsing.
create policy "gallery_albums_public_select_published" on public.gallery_albums
  for select
  using (is_published = true);

-- Policy: Authenticated school staff have full access to their school's albums.
-- Prevents cross-tenant modification or deletion of photo albums.
create policy "gallery_albums_owner_all_access" on public.gallery_albums
  for all
  using (school_id = auth.school_id())
  with check (school_id = auth.school_id());

-- ----------------------------------------------------------------------------
-- 7. GALLERY IMAGES TABLE RLS
-- ----------------------------------------------------------------------------
-- Controls access to individual photos. Inherits published status from parent album.
alter table public.gallery_images enable row level security;

-- Policy: Public visitors can read images ONLY if the parent album is published.
-- Protects images within draft/unpublished albums by querying parent gallery_albums.is_published.
create policy "gallery_images_public_select_published" on public.gallery_images
  for select
  using (
    exists (
      select 1
      from public.gallery_albums
      where public.gallery_albums.id = public.gallery_images.album_id
        and public.gallery_albums.is_published = true
    )
  );

-- Policy: Authenticated school staff have full access to their school's gallery images.
-- Restricts image uploads, caption edits, and deletions strictly to the user's school_id.
create policy "gallery_images_owner_all_access" on public.gallery_images
  for all
  using (school_id = auth.school_id())
  with check (school_id = auth.school_id());
