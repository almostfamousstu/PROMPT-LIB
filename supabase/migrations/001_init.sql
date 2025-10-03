create extension if not exists "uuid-ossp";
create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users on delete cascade,
  created_at timestamptz default timezone('utc'::text, now()) not null,
  display_name text
);

create table if not exists public.prompts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null,
  title text not null,
  body_md text not null,
  tags text[] default '{}',
  folder text default 'Library',
  created_at timestamptz default timezone('utc'::text, now()),
  updated_at timestamptz default timezone('utc'::text, now())
);

create table if not exists public.prompt_versions (
  id uuid primary key default gen_random_uuid(),
  prompt_id uuid references public.prompts on delete cascade,
  body_md text not null,
  notes text,
  created_at timestamptz default timezone('utc'::text, now())
);

alter table public.prompts enable row level security;
alter table public.prompt_versions enable row level security;

create policy "Users can manage own prompts" on public.prompts
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "Users can manage own prompt versions" on public.prompt_versions
  for all using (
    exists (
      select 1 from public.prompts p where p.id = prompt_versions.prompt_id and p.user_id = auth.uid()
    )
  ) with check (
    exists (
      select 1 from public.prompts p where p.id = prompt_versions.prompt_id and p.user_id = auth.uid()
    )
  );
