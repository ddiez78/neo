create table if not exists public.report_branding (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade unique,
  agency_name text not null default '',
  client_name text not null default '',
  logo_url text,
  logo_path text,
  primary_color text not null default '#00685f',
  accent_color text not null default '#0d9488',
  footer_note text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.monthly_reports
  add column if not exists period_start date,
  add column if not exists period_end date,
  add column if not exists previous_period_start date,
  add column if not exists previous_period_end date,
  add column if not exists charts jsonb not null default '{}',
  add column if not exists kpi_summary jsonb not null default '{}',
  add column if not exists recommendations jsonb not null default '[]',
  add column if not exists branding_snapshot jsonb not null default '{}';

insert into storage.buckets (id, name, public)
values ('report-assets', 'report-assets', true)
on conflict (id) do update set public = true;

alter table public.report_branding enable row level security;

grant select, insert, update on public.report_branding to authenticated;
grant all on public.report_branding to service_role;

drop policy if exists "report branding member read" on public.report_branding;
create policy "report branding member read"
on public.report_branding
for select
using (public.is_workspace_member(workspace_id));

drop policy if exists "report branding member write" on public.report_branding;
create policy "report branding member write"
on public.report_branding
for all
using (public.has_workspace_role(workspace_id, '{owner,admin,member}'))
with check (public.has_workspace_role(workspace_id, '{owner,admin,member}'));

drop policy if exists "report assets public read" on storage.objects;
create policy "report assets public read"
on storage.objects
for select
using (bucket_id = 'report-assets');

drop policy if exists "report assets member upload" on storage.objects;
create policy "report assets member upload"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'report-assets'
  and public.has_workspace_role((storage.foldername(name))[1]::uuid, '{owner,admin,member}')
);

drop policy if exists "report assets member update" on storage.objects;
create policy "report assets member update"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'report-assets'
  and public.has_workspace_role((storage.foldername(name))[1]::uuid, '{owner,admin,member}')
)
with check (
  bucket_id = 'report-assets'
  and public.has_workspace_role((storage.foldername(name))[1]::uuid, '{owner,admin,member}')
);
