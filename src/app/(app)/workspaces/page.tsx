import { AlertTriangle, ArrowRight, CheckCircle2, Plus } from "lucide-react";
import Link from "next/link";
import { EmptyState } from "@/components/ui/EmptyState";
import { getWorkspaces, requireUser } from "@/lib/data/workspace";
import { getWorkspacesStats } from "@/lib/data/workspace-stats";
import { getUserPreferences } from "@/lib/preferences-server";
import { TIER_LABEL, WORKSPACE_LIMIT } from "@/lib/tiers";

function timeAgo(iso: string | null, isEn: boolean): string {
	if (!iso) return isEn ? "Never" : "Nunca";
	const diff = Date.now() - new Date(iso).getTime();
	const h = Math.floor(diff / 3_600_000);
	if (h < 1) return isEn ? "<1h" : "<1h";
	if (h < 24) return isEn ? `${h}h ago` : `hace ${h}h`;
	const d = Math.floor(h / 24);
	return isEn ? `${d}d ago` : `hace ${d}d`;
}

function scoreColor(score: number | null): string {
	if (score === null) return "text-[var(--muted)]";
	if (score >= 70) return "text-emerald-500";
	if (score >= 50) return "text-amber-500";
	if (score >= 30) return "text-orange-500";
	return "text-red-500";
}

export default async function Page() {
	await requireUser();
	const { locale, mode } = await getUserPreferences();
	const isEn = locale === "en";
	const workspaces = await getWorkspaces();
	const stats = await getWorkspacesStats(workspaces.map((w) => w.id));
	const limit = WORKSPACE_LIMIT[mode];
	const reachedLimit = workspaces.length >= limit;

	const rows = workspaces
		.map((ws) => {
			const s = stats[ws.id];
			const needsAttention = Boolean(
				s &&
					(s.alertsUnseen > 0 ||
						(s.readinessScore !== null && s.readinessScore < 50) ||
						s.tasksPending > 5),
			);
			return { workspace: ws, stats: s, needsAttention };
		})
		.sort((a, b) => {
			if (a.needsAttention && !b.needsAttention) return -1;
			if (!a.needsAttention && b.needsAttention) return 1;
			return (b.stats?.alertsUnseen ?? 0) - (a.stats?.alertsUnseen ?? 0);
		});

	const needAttention = rows.filter((r) => r.needsAttention).length;
	const allOk = rows.length - needAttention;

	return (
		<main className="min-h-screen bg-[var(--background)] p-4 sm:p-6">
			<section className="mx-auto max-w-6xl">
				<div className="flex flex-wrap items-end justify-between gap-4">
					<div>
						<p className="text-xs font-black uppercase tracking-[0.2em] text-[var(--brand)]">
							{isEn ? "Command center" : "Command center"}
						</p>
						<h1 className="mt-2 text-3xl font-black tracking-[-0.03em] text-[var(--foreground)]">
							Workspaces
						</h1>
						<p className="mt-2 text-sm text-[var(--muted)]">
							{isEn
								? `${workspaces.length} workspace${workspaces.length === 1 ? "" : "s"} · ${needAttention} need attention · ${allOk} all OK`
								: `${workspaces.length} workspace${workspaces.length === 1 ? "" : "s"} · ${needAttention} requieren atencion · ${allOk} todo OK`}
						</p>
					</div>
					<div className="flex flex-col items-end gap-2">
						<span className="text-xs font-bold text-[var(--muted)]">
							<span
								className={
									reachedLimit ? "text-red-500" : "text-[var(--foreground)]"
								}
							>
								{workspaces.length}/{limit}
							</span>{" "}
							workspaces · {TIER_LABEL[mode]}
						</span>
						{reachedLimit ? (
							<Link
								className="inline-flex items-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--surface-subtle)] px-4 py-2 text-sm font-bold text-[var(--muted)] transition hover:border-[var(--brand)]"
								href="/pricing"
							>
								<Plus className="size-4" />
								{isEn ? "Upgrade to add more" : "Subir de plan para crear más"}
							</Link>
						) : (
							<Link
								className="inline-flex items-center gap-2 rounded-lg bg-[var(--brand)] px-4 py-2 text-sm font-bold text-[#1b1000] transition hover:brightness-110"
								href="/onboarding"
							>
								<Plus className="size-4" />
								{isEn ? "New workspace" : "Nuevo workspace"}
							</Link>
						)}
					</div>
				</div>

				{workspaces.length === 0 ? (
					<div className="mt-8">
						<EmptyState
							description={
								isEn
									? "Create your first workspace to start monitoring your brand in AI assistants."
									: "Crea tu primer workspace para empezar a monitorizar tu marca en asistentes de IA."
							}
							icon={Plus}
							primaryHref="/onboarding"
							primaryLabel={isEn ? "Create workspace" : "Crear workspace"}
							title={isEn ? "No workspaces yet" : "Aun no tienes workspaces"}
						/>
					</div>
				) : (
					<div className="mt-6 overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--surface-raised,_white)]">
						<table className="w-full text-sm">
							<thead>
								<tr className="border-b border-[var(--border)] bg-[var(--surface-subtle)] text-[10px] uppercase tracking-wider text-[var(--muted)]">
									<th className="px-4 py-3 text-left font-bold">Workspace</th>
									<th className="px-4 py-3 text-right font-bold">GEO</th>
									<th className="hidden px-4 py-3 text-right font-bold md:table-cell">
										{isEn ? "Activity" : "Actividad"}
									</th>
									<th className="px-4 py-3 text-right font-bold">
										{isEn ? "Alerts" : "Alertas"}
									</th>
									<th className="hidden px-4 py-3 text-right font-bold md:table-cell">
										{isEn ? "Tasks" : "Tareas"}
									</th>
									<th className="hidden px-4 py-3 text-right font-bold lg:table-cell">
										{isEn ? "Cost" : "Coste"}
									</th>
									<th className="px-4 py-3 text-right font-bold">
										{isEn ? "Last" : "Ultima"}
									</th>
									<th className="px-4 py-3" />
								</tr>
							</thead>
							<tbody className="divide-y divide-[var(--border)]">
								{rows.map(({ workspace, stats: s, needsAttention }) => (
									<tr
										className={`transition hover:bg-[var(--surface-subtle)] ${
											needsAttention
												? "bg-amber-50/30 dark:bg-amber-950/10"
												: ""
										}`}
										key={workspace.id}
									>
										<td className="px-4 py-3">
											<div className="flex items-center gap-2">
												{needsAttention ? (
													<AlertTriangle className="size-3.5 shrink-0 text-amber-500" />
												) : (
													<CheckCircle2 className="size-3.5 shrink-0 text-emerald-500" />
												)}
												<div className="min-w-0">
													<p className="truncate font-bold text-[var(--foreground)]">
														{workspace.name}
													</p>
													<p className="truncate text-xs text-[var(--muted)]">
														{workspace.website ?? workspace.slug}
													</p>
												</div>
											</div>
										</td>
										<td className="px-4 py-3 text-right">
											<span
												className={`text-lg font-black ${scoreColor(s?.readinessScore ?? null)}`}
											>
												{s?.readinessScore ?? "—"}
											</span>
										</td>
										<td className="hidden px-4 py-3 text-right text-[var(--muted)] md:table-cell">
											{s?.runsLast7Days ?? 0}
											<span className="ml-1 text-xs text-[var(--muted)]">
												runs/7d
											</span>
										</td>
										<td className="px-4 py-3 text-right">
											{s && s.alertsUnseen > 0 ? (
												<span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2 py-0.5 text-xs font-bold text-red-700 dark:bg-red-900/40 dark:text-red-300">
													{s.alertsUnseen}
												</span>
											) : (
												<span className="text-[var(--muted)]">—</span>
											)}
										</td>
										<td className="hidden px-4 py-3 text-right text-[var(--foreground)] md:table-cell">
											{s?.tasksPending ?? 0}
										</td>
										<td className="hidden px-4 py-3 text-right text-[var(--foreground)] lg:table-cell">
											{s ? `${s.costThisMonth.toFixed(2)}€` : "—"}
										</td>
										<td className="px-4 py-3 text-right text-xs text-[var(--muted)]">
											{timeAgo(s?.lastActivity ?? null, isEn)}
										</td>
										<td className="px-4 py-3 text-right">
											<Link
												className="inline-flex items-center gap-1 rounded-md border border-[var(--border)] bg-white px-2.5 py-1 text-xs font-semibold text-[var(--foreground)] hover:border-[var(--brand)] dark:bg-slate-900"
												href={`/${workspace.slug}/dashboard`}
											>
												{isEn ? "Open" : "Abrir"}
												<ArrowRight className="size-3" />
											</Link>
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				)}
			</section>
		</main>
	);
}
