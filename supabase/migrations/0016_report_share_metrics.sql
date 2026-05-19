alter table public.monthly_reports
  add column if not exists metrics jsonb not null default '{}';
