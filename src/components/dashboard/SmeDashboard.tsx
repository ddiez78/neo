import {
	AlertCircle,
	ArrowRight,
	CheckCircle2,
	TrendingUp,
	Zap,
} from "lucide-react";
import Link from "next/link";
import { GlossaryTip } from "@/components/ui/GlossaryTip";
import type { WeeklyActivity } from "@/lib/analytics/activity";
import type { OverviewAnalytics } from "@/lib/analytics/overview";
import { ScoreCounter } from "./ScoreCounter";
import { SetupChecklist, type SetupChecklistStatus } from "./SetupChecklist";
import { WeeklyActivityFeed } from "./WeeklyActivityFeed";

const STATUS_LABEL: Record<string, string> = {
	healthy: "Bien",
	watch: "Mejorable",
	risk: "Urgente",
};

const STATUS_COLOR: Record<string, string> = {
	healthy: "bg-emerald-50 text-emerald-700 border-emerald-200",
	watch: "bg-amber-50 text-amber-700 border-amber-200",
	risk: "bg-red-50 text-red-700 border-red-200",
};

const STATUS_ICON: Record<string, typeof CheckCircle2> = {
	healthy: CheckCircle2,
	watch: TrendingUp,
	risk: AlertCircle,
};

const SME_DIAGNOSTIC_LABEL: Record<string, string> = {
	Presence: "Marca en IA",
	"Recommendation rank": "Posicion en resultados",
	"Competitive pressure": "Presion de competidores",
	"Source authority": "Fuentes que te citan",
	"Owned source control": "Contenido propio",
	"Brand perception": "Reputacion online",
};

export function SmeDashboard({
	analytics,
	workspaceSlug,
	isEn,
	setupStatus,
	weeklyActivity,
}: {
	analytics: OverviewAnalytics;
	workspaceSlug: string;
	isEn: boolean;
	setupStatus?: SetupChecklistStatus;
	weeklyActivity?: WeeklyActivity;
}) {
	const scoreColor =
		analytics.readinessScore >= 75
			? "text-emerald-400"
			: analytics.readinessScore >= 55
				? "text-amber-400"
				: analytics.readinessScore >= 35
					? "text-orange-400"
					: "text-red-400";

	const topCompetitor = analytics.competitorPressure[0] ?? null;
	const nextAction = analytics.strategicActions[0] ?? null;
	const urgentCount = analytics.diagnostics.filter(
		(d) => d.status === "risk",
	).length;

	return (
		<main className="flex-1 overflow-auto p-4 pb-24 lg:p-6 lg:pb-8">
			<div className="mx-auto grid max-w-3xl gap-6">
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
				<section>
					<p className="text-xs font-black uppercase tracking-[0.2em] text-[var(--brand)]">
						citame.ai
					</p>
					<h1 className="mt-2 text-3xl font-black tracking-[-0.03em] text-[var(--foreground)]">
						{isEn
							? "How is my business doing?"
							: "¿Como esta yendo mi negocio?"}
					</h1>
					<p className="mt-2 text-sm text-[var(--muted)]">
						{isEn
							? "A clear picture of how AI assistants see and recommend your business."
							: "Una imagen clara de como te ven y recomiendan los asistentes de IA."}
					</p>
				</section>

				{/* GEO Score card */}
				<section className="neo-card p-6">
					<div className="flex items-center justify-between gap-4">
						<div>
							<p className="text-sm font-semibold uppercase tracking-[0.08em] text-[var(--muted)]">
								<GlossaryTip isEn={isEn} term="readiness">
									{isEn ? "GEO Score" : "Puntuacion GEO"}
								</GlossaryTip>
							</p>
							<p className={`mt-1 text-6xl font-black ${scoreColor}`}>
								<ScoreCounter target={analytics.readinessScore} />
							</p>
							<p className="mt-2 text-sm text-[var(--muted)]">
								{analytics.readinessLabel}
								{urgentCount > 0
									? ` · ${urgentCount} ${isEn ? "urgent area(s)" : `area${urgentCount > 1 ? "s" : ""} urgente${urgentCount > 1 ? "s" : ""}`}`
									: ""}
							</p>
						</div>
						<div className="hidden text-right sm:block">
							<p className="text-xs text-[var(--muted)]">
								{isEn ? "Summary" : "Resumen"}
							</p>
							<p className="mt-1 max-w-xs text-sm text-[var(--foreground)]">
								{analytics.executiveSummary}
							</p>
						</div>
					</div>
				</section>

				{/* 6 health areas */}
				<section>
					<h2 className="mb-3 text-sm font-black uppercase tracking-[0.12em] text-[var(--muted)]">
						{isEn ? "Health areas" : "Areas de salud"}
					</h2>
					<div className="grid gap-3 sm:grid-cols-2">
						{analytics.diagnostics.map((item) => {
							const Icon = STATUS_ICON[item.status] ?? CheckCircle2;
							const label = SME_DIAGNOSTIC_LABEL[item.label] ?? item.label;
							const colorClass =
								STATUS_COLOR[item.status] ?? STATUS_COLOR.healthy;
							const statusLabel = STATUS_LABEL[item.status] ?? item.status;
							return (
								<div
									className="flex items-start gap-3 rounded-xl border bg-[var(--surface-subtle)] p-4"
									key={item.label}
								>
									<div
										className={`mt-0.5 rounded-full border p-1 ${colorClass}`}
									>
										<Icon className="size-3.5" />
									</div>
									<div className="min-w-0 flex-1">
										<div className="flex items-center justify-between gap-2">
											<p className="text-sm font-semibold text-[var(--foreground)]">
												{label}
											</p>
											<span
												className={`rounded-full border px-2 py-0.5 text-xs font-semibold ${colorClass}`}
											>
												{statusLabel}
											</span>
										</div>
										<p className="mt-1 text-xs text-[var(--muted)]">
											{item.explanation}
										</p>
									</div>
								</div>
							);
						})}
					</div>
				</section>

				{/* Top competitor + next action */}
				<div className="grid gap-4 sm:grid-cols-2">
					{topCompetitor ? (
						<section className="neo-card p-5">
							<p className="text-xs font-black uppercase tracking-[0.12em] text-[var(--muted)]">
								{isEn ? "Main competitor" : "Principal competidor"}
							</p>
							<p className="mt-2 text-xl font-bold text-[var(--foreground)]">
								{topCompetitor.name}
							</p>
							<p className="mt-1 text-sm text-[var(--muted)]">
								{isEn
									? `Appears in ${topCompetitor.share.toFixed(0)}% of searches. Displaced you ${topCompetitor.displacementCount} times.`
									: `Aparece en el ${topCompetitor.share.toFixed(0)}% de las busquedas. Te desplazo ${topCompetitor.displacementCount} veces.`}
							</p>
							<div
								className={`mt-3 inline-flex items-center gap-1 rounded-full border px-2 py-1 text-xs font-semibold ${
									topCompetitor.risk === "high"
										? "border-red-200 bg-red-50 text-red-700"
										: topCompetitor.risk === "medium"
											? "border-amber-200 bg-amber-50 text-amber-700"
											: "border-emerald-200 bg-emerald-50 text-emerald-700"
								}`}
							>
								{topCompetitor.risk === "high"
									? isEn
										? "High risk"
										: "Riesgo alto"
									: topCompetitor.risk === "medium"
										? isEn
											? "Medium risk"
											: "Riesgo medio"
										: isEn
											? "Low risk"
											: "Riesgo bajo"}
							</div>
						</section>
					) : (
						<section className="neo-card p-5">
							<p className="text-xs font-black uppercase tracking-[0.12em] text-[var(--muted)]">
								{isEn ? "Main competitor" : "Principal competidor"}
							</p>
							<p className="mt-2 text-sm text-[var(--muted)]">
								{isEn
									? "No competitor data yet."
									: "Sin datos de competidores aun."}
							</p>
						</section>
					)}

					{nextAction ? (
						<section className="neo-card p-5">
							<p className="text-xs font-black uppercase tracking-[0.12em] text-[var(--muted)]">
								{isEn ? "Next action" : "Proxima accion"}
							</p>
							<p className="mt-2 text-base font-bold text-[var(--foreground)]">
								{nextAction.title}
							</p>
							<p className="mt-1 text-xs text-[var(--muted)] line-clamp-2">
								{nextAction.description}
							</p>
							<Link
								className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-[var(--brand)] px-3 py-1.5 text-xs font-black text-[#1b1000] transition hover:brightness-110"
								href={`/${workspaceSlug}/recommendations`}
							>
								<Zap className="size-3.5" />
								{isEn ? "See full plan" : "Ver plan completo"}
								<ArrowRight className="size-3" />
							</Link>
						</section>
					) : (
						<section className="neo-card p-5">
							<p className="text-xs font-black uppercase tracking-[0.12em] text-[var(--muted)]">
								{isEn ? "Next action" : "Proxima accion"}
							</p>
							<p className="mt-2 text-sm text-[var(--muted)]">
								{isEn
									? "Run your first prompts to get recommendations."
									: "Ejecuta tus primeros prompts para recibir recomendaciones."}
							</p>
						</section>
					)}
				</div>

				{/* Quick links */}
				<section className="grid gap-3 sm:grid-cols-3">
					{[
						{
							href: "recommendations",
							label: isEn ? "Action plan" : "Plan de accion",
							icon: Zap,
						},
						{
							href: "prompts",
							label: isEn ? "Prompts" : "Prompts",
							icon: TrendingUp,
						},
						{
							href: "sources",
							label: isEn ? "Sources" : "Quien te menciona",
							icon: ArrowRight,
						},
					].map((item) => {
						const Icon = item.icon;
						return (
							<Link
								className="flex items-center justify-between gap-2 rounded-xl border border-[var(--border)] bg-[var(--surface-subtle)] px-4 py-3 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--brand)] hover:bg-[var(--surface-raised)]"
								href={`/${workspaceSlug}/${item.href}`}
								key={item.href}
							>
								<span className="flex items-center gap-2">
									<Icon className="size-4 text-[var(--brand)]" />
									{item.label}
								</span>
								<ArrowRight className="size-3.5 text-[var(--muted)]" />
							</Link>
						);
					})}
				</section>
			</div>
		</main>
	);
}
