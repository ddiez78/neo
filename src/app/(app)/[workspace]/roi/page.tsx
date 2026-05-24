import { CheckCircle2, TrendingUp, Zap } from "lucide-react";
import { EmptyState } from "@/components/ui/EmptyState";
import { GlossaryTip } from "@/components/ui/GlossaryTip";
import { LockedFeature } from "@/components/ui/LockedFeature";
import { getRoiSummary } from "@/lib/analytics/roi";
import { requireWorkspace } from "@/lib/data/workspace";
import { getUserPreferences } from "@/lib/preferences-server";
import { hasAccess } from "@/lib/tiers";

function formatDate(iso: string, isEn: boolean): string {
	return new Date(iso).toLocaleDateString(isEn ? "en-US" : "es-ES", {
		month: "short",
		day: "numeric",
		year: "numeric",
	});
}

const CATEGORY_LABEL_ES: Record<string, string> = {
	entity: "Marca",
	content: "Contenido",
	sources: "Fuentes",
	competitors: "Competidores",
	prompts: "Preguntas",
	technical: "Datos",
	authority: "Autoridad",
	sentiment: "Reputacion",
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

	if (!hasAccess(prefs.mode, "roi")) {
		return <LockedFeature feature="roi" isEn={isEn} />;
	}

	const summary = await getRoiSummary(workspace.id, 90);

	return (
		<main className="flex-1 overflow-auto p-4 pb-24 lg:p-6 lg:pb-8">
			<div className="mx-auto grid max-w-5xl gap-6">
				<section>
					<p className="text-xs font-black uppercase tracking-[0.2em] text-[var(--brand)]">
						<GlossaryTip isEn={isEn} term="roi">
							{isEn ? "ROI" : "ROI"}
						</GlossaryTip>
					</p>
					<h1 className="mt-2 text-3xl font-black tracking-[-0.03em] text-[var(--foreground)]">
						{isEn ? "Actions to Results" : "Acciones a Resultados"}
					</h1>
					<p className="mt-2 max-w-2xl text-sm text-[var(--muted)]">
						{isEn
							? `Recommendations completed in the last ${summary.periodDays} days and their measured impact on visibility.`
							: `Recomendaciones completadas en los ultimos ${summary.periodDays} dias y su impacto medido en visibilidad.`}
					</p>
				</section>

				<section className="grid gap-4 sm:grid-cols-3">
					<div className="neo-card p-5">
						<div className="flex items-center gap-3">
							<div className="grid size-9 place-items-center rounded-lg bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300">
								<CheckCircle2 className="size-5" />
							</div>
							<p className="text-xs font-black uppercase tracking-[0.12em] text-[var(--muted)]">
								{isEn ? "Actions completed" : "Acciones hechas"}
							</p>
						</div>
						<p className="mt-3 text-3xl font-black text-[var(--foreground)]">
							{summary.totalCompleted}
						</p>
					</div>
					<div className="neo-card p-5">
						<div className="flex items-center gap-3">
							<div className="grid size-9 place-items-center rounded-lg bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300">
								<TrendingUp className="size-5" />
							</div>
							<p className="text-xs font-black uppercase tracking-[0.12em] text-[var(--muted)]">
								{isEn ? "Visibility gained" : "Visibilidad ganada"}
							</p>
						</div>
						<p className="mt-3 text-3xl font-black text-[var(--foreground)]">
							+{summary.totalVisibilityGain.toFixed(1)}
						</p>
					</div>
					<div className="neo-card p-5">
						<div className="flex items-center gap-3">
							<div className="grid size-9 place-items-center rounded-lg bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300">
								<Zap className="size-5" />
							</div>
							<p className="text-xs font-black uppercase tracking-[0.12em] text-[var(--muted)]">
								<GlossaryTip isEn={isEn} term="impactScore">
									{isEn ? "Avg impact" : "Impacto medio"}
								</GlossaryTip>
							</p>
						</div>
						<p className="mt-3 text-3xl font-black text-[var(--foreground)]">
							{summary.avgImpact.toFixed(0)}
						</p>
					</div>
				</section>

				{summary.entries.length === 0 ? (
					<EmptyState
						description={
							isEn
								? "Complete recommendations to see their measured impact here. Each action you mark as done is compared against your visibility before and after."
								: "Completa recomendaciones para ver su impacto medido aqui. Cada accion que marcas como hecha se compara con tu visibilidad antes y despues."
						}
						icon={Zap}
						primaryHref={`/${workspace.slug}/recommendations`}
						primaryLabel={isEn ? "View recommendations" : "Ver recomendaciones"}
						title={
							isEn
								? "No completed actions in this period"
								: "Sin acciones completadas en este periodo"
						}
					/>
				) : (
					<section className="neo-card overflow-hidden p-0">
						<div className="border-b border-[var(--border)] px-5 py-3">
							<h2 className="text-sm font-bold text-[var(--foreground)]">
								{isEn ? "Action timeline" : "Linea de tiempo de acciones"}
							</h2>
						</div>
						<ul className="divide-y divide-[var(--border)]">
							{summary.entries.map((entry) => {
								const isPositive = entry.visibilityDelta > 0.5;
								const isNeutral =
									entry.visibilityDelta >= -0.5 && entry.visibilityDelta <= 0.5;
								const deltaColor = isPositive
									? "text-emerald-500"
									: isNeutral
										? "text-[var(--muted)]"
										: "text-amber-500";
								const deltaPrefix =
									entry.visibilityDelta > 0
										? "+"
										: entry.visibilityDelta < 0
											? ""
											: "±";
								return (
									<li
										className="grid grid-cols-1 gap-3 px-5 py-4 md:grid-cols-[1fr_auto_auto]"
										key={entry.id}
									>
										<div className="min-w-0">
											<div className="flex flex-wrap items-center gap-2">
												<span className="rounded-md bg-[var(--surface-subtle)] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-[var(--muted)]">
													{CATEGORY_LABEL_ES[entry.category] ?? entry.category}
												</span>
												<span className="text-xs text-[var(--muted)]">
													{formatDate(entry.completedAt, isEn)}
												</span>
											</div>
											<p className="mt-1.5 text-sm font-semibold text-[var(--foreground)]">
												{entry.title}
											</p>
										</div>
										<div className="text-right text-xs text-[var(--muted)] md:px-4">
											{isEn ? "Impact" : "Impacto"}
											<p className="mt-0.5 text-sm font-bold text-[var(--foreground)]">
												{entry.impactScore.toFixed(0)}
											</p>
										</div>
										<div className="text-right">
											<p className="text-xs text-[var(--muted)]">
												{entry.visibilityBefore.toFixed(1)} →{" "}
												{entry.visibilityAfter.toFixed(1)}
											</p>
											<p className={`text-sm font-black ${deltaColor}`}>
												{deltaPrefix}
												{entry.visibilityDelta.toFixed(1)}
											</p>
										</div>
									</li>
								);
							})}
						</ul>
					</section>
				)}
			</div>
		</main>
	);
}
