-- Migration: Add updated_at column to gallery_albums
-- Run this in Supabase SQL Editor if you want automatic update timestamps

alter table public.gallery_albums
  add column if not exists updated_at timestamptz default now();

-- Auto-update trigger (optional)
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_gallery_albums_updated_at on public.gallery_albums;
create trigger trg_gallery_albums_updated_at
  before update on public.gallery_albums
  for each row execute function public.set_updated_at();
