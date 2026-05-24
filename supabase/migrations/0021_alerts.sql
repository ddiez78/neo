create table if not exists public.alerts (
	id uuid primary key default gen_random_uuid(),
	workspace_id uuid not null references public.workspaces(id) on delete cascade,
	kind text not null check (
		kind in (
			'visibility_drop',
			'new_competitor',
			'negative_sentiment',
			'prompt_failed',
			'critical_recommendation',
			'cost_spike',
			'run_complete'
		)
	),
	severity text not null default 'info' check (
		severity in ('info', 'warning', 'critical')
	),
	title text not null,
	message text,
	payload jsonb not null default '{}',
	link text,
	seen_at timestamptz,
	created_at timestamptz not null default now()
);

create index if not exists alerts_workspace_idx
	on public.alerts (workspace_id, created_at desc);

create index if not exists alerts_unseen_idx
	on public.alerts (workspace_id, seen_at)
	where seen_at is null;

alter table public.alerts enable row level security;

drop policy if exists "alerts_select" on public.alerts;
create policy "alerts_select" on public.alerts
	for select
	using (
		workspace_id in (
			select workspace_id from public.workspace_members
			where user_id = auth.uid()
		)
	);

drop policy if exists "alerts_update" on public.alerts;
create policy "alerts_update" on public.alerts
	for update
	using (
		workspace_id in (
			select workspace_id from public.workspace_members
			where user_id = auth.uid()
		)
	);

drop policy if exists "alerts_insert_service" on public.alerts;
create policy "alerts_insert_service" on public.alerts
	for insert
	with check (true);

drop policy if exists "alerts_delete" on public.alerts;
create policy "alerts_delete" on public.alerts
	for delete
	using (
		workspace_id in (
			select workspace_id from public.workspace_members
			where user_id = auth.uid()
		)
	);
