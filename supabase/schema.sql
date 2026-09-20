create table if not exists public.signups (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  interests text[] not null default '{}',
  created_at timestamptz not null default now()
);

create table if not exists public.stream_listings (
  id uuid primary key default gen_random_uuid(),
  platform text not null,
  url text not null,
  title text not null,
  seller text not null,
  starts_at text,
  items text,
  created_at timestamptz not null default now()
);

alter table public.signups enable row level security;
alter table public.stream_listings enable row level security;
