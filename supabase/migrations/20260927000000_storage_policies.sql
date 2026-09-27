-- ============================================================================
-- Migration: Supabase Storage Buckets & Leak-Proof Tenant RLS Policies
-- File: supabase/migrations/20260927000000_storage_policies.sql
-- ============================================================================

-- 1. Schema Update: Add attachment_original_name tracking to public.notices
alter table public.notices 
add column if not exists attachment_original_name text;

-- 2. Bucket Configurations with SQL-enforced MIME types and file_size_limit
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types) values 
  (
    'notice-files', 
    'notice-files', 
    true, 
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
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- 3. Enable Storage Row Level Security
alter table storage.objects enable row level security;

-- Drop existing policies if any to prevent conflicts
drop policy if exists "notice_files_read_tenant_controlled" on storage.objects;
drop policy if exists "media_buckets_public_read" on storage.objects;
drop policy if exists "tenant_auth_upload_storage" on storage.objects;
drop policy if exists "tenant_auth_delete_storage" on storage.objects;

-- Policy 3.1: Strict Tenant-Aware & Publication-Controlled Read Policy for notice-files bucket
-- Published attachments are public; draft attachments are restricted to staff of SAME school.
-- Exact path equality (=) prevents path collision leaks.
create policy "notice_files_read_tenant_controlled" on storage.objects
  for select
  using (
    bucket_id = 'notice-files' AND (
      exists (
        select 1 from public.notices
        where public.notices.attachment_url = storage.objects.name
          and (
            public.notices.is_published = true 
            or public.notices.school_id = auth.school_id()
          )
      )
    )
  );

-- Policy 3.2: Unconditional Public Read Policy for media buckets
create policy "media_buckets_public_read" on storage.objects
  for select
  using (
    bucket_id in ('teacher-images', 'gallery-images', 'event-images', 'school-assets')
  );

-- Policy 3.3: Tenant Auth Upload Policy (Restricted by user's school_id prefix)
create policy "tenant_auth_upload_storage" on storage.objects
  for insert
  with check (
    auth.role() = 'authenticated' AND
    (storage.foldername(name))[1] = auth.school_id()::text
  );

-- Policy 3.4: Tenant Auth Delete Policy
create policy "tenant_auth_delete_storage" on storage.objects
  for delete
  using (
    auth.role() = 'authenticated' AND
    (storage.foldername(name))[1] = auth.school_id()::text
  );
