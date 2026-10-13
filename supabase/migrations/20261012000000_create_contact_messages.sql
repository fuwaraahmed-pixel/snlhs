-- ============================================================================
-- Migration: Create contact_messages table and RLS policies
-- File: supabase/migrations/20261012000000_create_contact_messages.sql
-- ============================================================================

-- 1. Create contact_messages table
create table if not exists public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  school_id uuid references public.schools(id) on delete cascade,
  name text not null,
  phone text not null,
  email text,
  subject text not null,
  message text not null,
  is_read boolean default false,
  created_at timestamptz default now()
);

-- 2. Index for tenant query performance
create index if not exists idx_contact_messages_school_id 
  on public.contact_messages(school_id);

-- 3. Enable Row Level Security (RLS)
alter table public.contact_messages enable row level security;

-- 4. Policies:
-- (A) Public visitor can insert messages
drop policy if exists "contact_messages_public_insert" on public.contact_messages;
create policy "contact_messages_public_insert" on public.contact_messages
  for insert with check (true);

-- (B) Admin select policy scoped to school
drop policy if exists "contact_messages_admin_select" on public.contact_messages;
create policy "contact_messages_admin_select" on public.contact_messages
  for select using (
    auth.role() = 'authenticated'
    and school_id = public.current_school_id()
    and public.current_user_role() = 'admin'
  );

-- (C) Admin update policy (mark as read) scoped to school
drop policy if exists "contact_messages_admin_update" on public.contact_messages;
create policy "contact_messages_admin_update" on public.contact_messages
  for update using (
    auth.role() = 'authenticated'
    and school_id = public.current_school_id()
    and public.current_user_role() = 'admin'
  ) with check (
    auth.role() = 'authenticated'
    and school_id = public.current_school_id()
    and public.current_user_role() = 'admin'
  );

-- (D) Admin delete policy scoped to school
drop policy if exists "contact_messages_admin_delete" on public.contact_messages;
create policy "contact_messages_admin_delete" on public.contact_messages
  for delete using (
    auth.role() = 'authenticated'
    and school_id = public.current_school_id()
    and public.current_user_role() = 'admin'
  );
