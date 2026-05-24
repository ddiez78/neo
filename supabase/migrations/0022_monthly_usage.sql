-- Monthly execution counter per workspace.
-- One row per (workspace, year_month). Year-month is the partition key so
-- new months start at 0 implicitly without a reset job.

create table if not exists public.monthly_usage (
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  year_month text not null,
  executions_count int not null default 0,
  updated_at timestamptz not null default now(),
  primary key (workspace_id, year_month)
);

create index if not exists monthly_usage_workspace_idx
  on public.monthly_usage(workspace_id);

alter table public.monthly_usage enable row level security;

drop policy if exists "members read monthly usage" on public.monthly_usage;
create policy "members read monthly usage" on public.monthly_usage
  for select using (
    exists (
      select 1 from public.workspace_members wm
      where wm.workspace_id = monthly_usage.workspace_id
        and wm.user_id = auth.uid()
    )
  );

-- Atomic increment that returns the new count.
create or replace function public.increment_monthly_usage(
  p_workspace_id uuid,
  p_increment int default 1
) returns int
language plpgsql security definer as $$
declare
  v_month text := to_char((now() at time zone 'utc'), 'YYYY-MM');
  v_new_count int;
begin
  insert into public.monthly_usage(workspace_id, year_month, executions_count)
  values (p_workspace_id, v_month, p_increment)
  on conflict (workspace_id, year_month)
  do update set
    executions_count = public.monthly_usage.executions_count + p_increment,
    updated_at = now()
  returning executions_count into v_new_count;
  return v_new_count;
end;
$$;

grant execute on function public.increment_monthly_usage(uuid, int)
  to authenticated, service_role;
