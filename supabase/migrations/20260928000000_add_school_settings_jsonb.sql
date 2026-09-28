-- ============================================================================
-- Migration: Add settings jsonb column to public.schools table
-- File: supabase/migrations/20260928000000_add_school_settings_jsonb.sql
-- ============================================================================

alter table public.schools 
add column if not exists settings jsonb default '{}'::jsonb;
