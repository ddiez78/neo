import { Activity, ArrowRight, Download } from "lucide-react";
import Link from "next/link";
import { ForecastPanel } from "@/components/dashboard/ForecastPanel";
import {
	BrandVisibilityChart,
	CompetitorPressurePanel,
	OverviewKpiCard,
	StrategicActionsPanel,
} from "@/components/dashboard/OverviewCharts";
import { ScoreCounter } from "@/components/dashboard/ScoreCounter";
import {
	SetupChecklist,
	type SetupChecklistStatus,
} from "@/components/dashboard/SetupChecklist";
import { WeeklyActivityFeed } from "@/components/dashboard/WeeklyActivityFeed";
import { GlossaryTip } from "@/components/ui/GlossaryTip";
import type { WeeklyActivity } from "@/lib/analytics/activity";
import type { Forecast } from "@/lib/analytics/forecast";
import type { OverviewAnalytics } from "@/lib/analytics/overview";

export function ProDashboard({
	analytics,
	workspaceSlug,
	isEn,
	setupStatus,
	weeklyActivity,
	forecast,
}: {
	analytics: OverviewAnalytics;
	workspaceSlug: string;
	isEn: boolean;
	setupStatus?: SetupChecklistStatus;
	weeklyActivity?: WeeklyActivity;
	forecast?: Forecast;
}) {
	const scoreColor =
		analytics.readinessScore >= 75
			? "text-emerald-400"
			: analytics.readinessScore >= 55
				? "text-amber-400"
				: analytics.readinessScore >= 35
					? "text-orange-400"
					: "text-red-400";

	const topKpis = analytics.kpis.slice(0, 4);

	return (
		<main className="flex-1 overflow-auto p-4 pb-24 lg:p-6 lg:pb-8">
			<div className="mx-auto grid max-w-[1200px] gap-6">
				{setupStatus ? (
					<SetupChecklist
						isEn={isEn}
						status={setupStatus}
						workspaceSlug={workspaceSlug}
					/>
				) : null}
				{weeklyActivity ? (
					<WeeklyActivityFeed
						activity={weeklyActivity}
						isEn={isEn}
						workspaceSlug={workspaceSlug}
					/>
				) : null}
				{/* Header */}
				<section className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
					<div>
						<p className="text-xs font-black uppercase tracking-[0.2em] text-[var(--brand)]">
							citame.ai · Pro
						</p>
						<h1 className="mt-2 text-3xl font-black tracking-[-0.03em] text-[var(--foreground)] md:text-4xl">
							{isEn ? "GEO Overview" : "GEO Overview"}
						</h1>
						<p className="mt-2 max-w-2xl text-sm text-[var(--muted)]">
							{isEn
								? "AI visibility, competitor pressure and action priorities for the last 30 days."
								: "Visibilidad IA, presion competitiva y prioridades de accion en los ultimos 30 dias."}
						</p>
					</div>
					<div className="flex flex-wrap gap-2">
						<button
							className="inline-flex items-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--surface-subtle)] px-3 py-2 text-xs font-bold uppercase tracking-[0.04em] text-[var(--foreground)] transition hover:border-[var(--brand)]"
							type="button"
						>
							<Activity className="size-4 text-[var(--brand)]" />
							{isEn ? "Last 30 Days" : "Ultimos 30 dias"}
						</button>
						<Link
							className="inline-flex items-center gap-2 rounded-lg bg-[var(--brand)] px-3 py-2 text-xs font-black uppercase tracking-[0.04em] text-[#1b1000] transition hover:brightness-110"
							href={`/${workspaceSlug}/reports`}
						>
							<Download className="size-4" />
							{isEn ? "Export" : "Exportar"}
						</Link>
					</div>
				</section>

				{/* GEO Score + 4 KPIs */}
				<section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
					<div className="neo-card flex flex-col justify-center p-6 xl:col-span-1">
						<p className="text-xs font-black uppercase tracking-[0.12em] text-[var(--muted)]">
							<GlossaryTip isEn={isEn} term="readiness">
								{isEn ? "GEO Score" : "GEO Score"}
							</GlossaryTip>
						</p>
						<p className={`mt-1 text-5xl font-black ${scoreColor}`}>
							<ScoreCounter target={analytics.readinessScore} />
						</p>
						<p className="mt-2 text-xs text-[var(--muted)]">
							{analytics.readinessLabel}
						</p>
					</div>
					{topKpis.map((kpi) => (
						<OverviewKpiCard isEn={isEn} key={kpi.key} kpi={kpi} />
					))}
				</section>

				{/* Trend chart */}
				<BrandVisibilityChart data={analytics.visibilityTrend} />

				{forecast ? <ForecastPanel forecast={forecast} isEn={isEn} /> : null}

				{/* Competitors + Actions */}
				<section className="grid gap-5 xl:grid-cols-[minmax(360px,0.9fr)_minmax(0,1.1fr)]">
					<CompetitorPressurePanel
						items={analytics.competitorPressure.slice(0, 3)}
					/>
					<StrategicActionsPanel
						items={analytics.strategicActions.slice(0, 5)}
						workspaceSlug={workspaceSlug}
					/>
				</section>

				{/* Quick links */}
				<section className="grid gap-3 sm:grid-cols-4">
					{[
						{
							href: "recommendations",
							label: isEn ? "Action Plan" : "Plan de accion",
						},
						{
							href: "competitors",
							label: isEn ? "Competitors" : "Competidores",
						},
						{ href: "sources", label: isEn ? "Sources" : "Fuentes" },
						{ href: "tasks", label: isEn ? "Tasks" : "Tareas" },
					].map((item) => (
						<Link
							className="flex items-center justify-between gap-2 rounded-xl border border-[var(--border)] bg-[var(--surface-subtle)] px-4 py-3 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--brand)] hover:bg-[var(--surface-raised)]"
							href={`/${workspaceSlug}/${item.href}`}
							key={item.href}
						>
							{item.label}
							<ArrowRight className="size-3.5 text-[var(--muted)]" />
						</Link>
					))}
				</section>
			</div>
		</main>
	);
}
