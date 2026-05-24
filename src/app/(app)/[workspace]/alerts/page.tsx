import {
	AlertTriangle,
	Bell,
	CheckCircle2,
	Gauge,
	Info,
	Lightbulb,
	TrendingDown,
	Users,
	XCircle,
} from "lucide-react";
import Link from "next/link";
import { markAllAlertsSeenAction } from "@/actions/alerts";
import { EmptyState } from "@/components/ui/EmptyState";
import { getAlerts } from "@/lib/data/alerts";
import { requireWorkspace } from "@/lib/data/workspace";
import { getUserPreferences } from "@/lib/preferences-server";
import type { AlertKind } from "@/types/alerts";

const KIND_ICONS: Record<AlertKind, typeof AlertTriangle> = {
	visibility_drop: TrendingDown,
	new_competitor: Users,
	negative_sentiment: XCircle,
	prompt_failed: AlertTriangle,
	critical_recommendation: Lightbulb,
	cost_spike: AlertTriangle,
	run_complete: CheckCircle2,
	usage_warning: Gauge,
	usage_limit_reached: Gauge,
};

const KIND_LABELS_ES: Record<AlertKind, string> = {
	visibility_drop: "Caida de visibilidad",
	new_competitor: "Nuevo competidor",
	negative_sentiment: "Sentimiento negativo",
	prompt_failed: "Prompt fallido",
	critical_recommendation: "Recomendacion critica",
	cost_spike: "Pico de coste",
	run_complete: "Ejecucion completada",
	usage_warning: "Aviso de uso",
	usage_limit_reached: "Cupo agotado",
};

const KIND_LABELS_EN: Record<AlertKind, string> = {
	visibility_drop: "Visibility drop",
	new_competitor: "New competitor",
	negative_sentiment: "Negative sentiment",
	prompt_failed: "Prompt failed",
	critical_recommendation: "Critical recommendation",
	cost_spike: "Cost spike",
	run_complete: "Run complete",
	usage_warning: "Usage warning",
	usage_limit_reached: "Usage limit reached",
};

export default async function Page({
	params,
}: {
	params: Promise<{ workspace: string }>;
}) {
	const { workspace: slug } = await params;
	const workspace = await requireWorkspace(slug);
	const prefs = await getUserPreferences();
	const isEn = prefs.locale === "en";
	const alerts = await getAlerts(workspace.id, 100);
	const unseenCount = alerts.filter((a) => a.seen_at === null).length;
	const KIND_LABELS = isEn ? KIND_LABELS_EN : KIND_LABELS_ES;

	return (
		<main className="flex-1 overflow-auto p-4 pb-24 lg:p-6 lg:pb-8">
			<div className="mx-auto grid max-w-4xl gap-6">
				<section className="flex flex-wrap items-end justify-between gap-4">
					<div>
						<p className="text-xs font-black uppercase tracking-[0.2em] text-[var(--brand)]">
							{isEn ? "Notifications" : "Notificaciones"}
						</p>
						<h1 className="mt-2 text-3xl font-black tracking-[-0.03em] text-[var(--foreground)]">
							{isEn ? "Alerts" : "Alertas"}
						</h1>
						<p className="mt-2 text-sm text-[var(--muted)]">
							{isEn
								? "Significant changes detected in your workspace."
								: "Cambios significativos detectados en tu workspace."}
						</p>
					</div>
					{unseenCount > 0 ? (
						<form
							action={async () => {
								"use server";
								await markAllAlertsSeenAction(workspace.slug, workspace.id);
							}}
						>
							<button
								className="rounded-lg border border-[var(--border)] bg-[var(--surface-subtle)] px-4 py-2 text-sm font-bold text-[var(--foreground)] hover:border-[var(--brand)]"
								type="submit"
							>
								{isEn
									? `Mark all read (${unseenCount})`
									: `Marcar todas leidas (${unseenCount})`}
							</button>
						</form>
					) : null}
				</section>

				{alerts.length === 0 ? (
					<EmptyState
						description={
							isEn
								? "Alerts will appear here when something significant changes — visibility drops, new competitors, critical recommendations, etc."
								: "Las alertas apareceran aqui cuando algo significativo cambie: caidas de visibilidad, nuevos competidores, recomendaciones criticas, etc."
						}
						icon={Bell}
						primaryHref={`/${workspace.slug}/dashboard`}
						primaryLabel={isEn ? "Go to dashboard" : "Ir al dashboard"}
						title={isEn ? "No alerts yet" : "Sin alertas todavia"}
					/>
				) : (
					<ul className="grid gap-2">
						{alerts.map((alert) => {
							const Icon = KIND_ICONS[alert.kind] ?? Info;
							const severityColor =
								alert.severity === "critical"
									? "border-red-300 bg-red-50 dark:border-red-900/50 dark:bg-red-950/30"
									: alert.severity === "warning"
										? "border-amber-300 bg-amber-50 dark:border-amber-900/50 dark:bg-amber-950/30"
										: "border-blue-300 bg-blue-50 dark:border-blue-900/50 dark:bg-blue-950/30";
							const iconColor =
								alert.severity === "critical"
									? "text-red-600"
									: alert.severity === "warning"
										? "text-amber-600"
										: "text-blue-600";
							const isUnseen = alert.seen_at === null;
							return (
								<li
									className={`rounded-lg border p-4 transition ${severityColor} ${
										isUnseen ? "" : "opacity-70"
									}`}
									key={alert.id}
								>
									<div className="flex items-start gap-3">
										<div
											className={`mt-0.5 grid size-8 shrink-0 place-items-center rounded-full bg-white dark:bg-slate-900 ${iconColor}`}
										>
											<Icon className="size-4" />
										</div>
										<div className="min-w-0 flex-1">
											<div className="flex flex-wrap items-center gap-2">
												<p className="text-sm font-bold text-[var(--foreground)]">
													{alert.title}
												</p>
												<span className="rounded-full border border-[var(--border)] bg-white px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-[var(--muted)] dark:bg-slate-900">
													{KIND_LABELS[alert.kind]}
												</span>
												{isUnseen ? (
													<span className="rounded-full bg-[var(--brand)] px-2 py-0.5 text-[10px] font-black uppercase text-[#1b1000]">
														{isEn ? "New" : "Nuevo"}
													</span>
												) : null}
											</div>
											{alert.message ? (
												<p className="mt-1 text-sm text-[var(--foreground)]">
													{alert.message}
												</p>
											) : null}
											<p className="mt-1 text-xs text-[var(--muted)]">
												{new Date(alert.created_at).toLocaleString(
													isEn ? "en-US" : "es-ES",
												)}
											</p>
										</div>
										{alert.link ? (
											<Link
												className="rounded-md border border-[var(--border)] bg-white px-3 py-1.5 text-xs font-semibold text-[var(--foreground)] hover:border-[var(--brand)] dark:bg-slate-900"
												href={alert.link}
											>
												{isEn ? "View" : "Ver"}
											</Link>
										) : null}
									</div>
								</li>
							);
						})}
					</ul>
				)}
			</div>
		</main>
	);
}
