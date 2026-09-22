create table if not exists public.site_events (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  kind text not null default 'pageview',
  path text,
  referrer text,
  referrer_host text,
  ip text,
  country text,
  region text,
  city text,
  user_agent text,
  visitor_id text,
  email text,
  utm_source text,
  utm_medium text,
  utm_campaign text
);

create index if not exists site_events_created_at_idx on public.site_events (created_at desc);
create index if not exists site_events_visitor_id_idx on public.site_events (visitor_id);

alter table public.site_events enable row level security;
