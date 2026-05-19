import { TrendChart } from "@/components/dashboard/TrendChart";
import { FiltersPanel } from "@/components/layout/FiltersPanel";
import {
	getWorkspaceOverview,
	requireUser,
	requireWorkspace,
} from "@/lib/data/workspace";
import { getUserPreferences } from "@/lib/preferences-server";

export default async function Page({
	params,
}: {
	params: Promise<{ workspace: string }>;
}) {
	const { workspace: slug } = await params;
	const workspace = await requireWorkspace(slug);
	const { locale } = await getUserPreferences();
	const isEn = locale === "en";
	const { supabase } = await requireUser();
	const overview = await getWorkspaceOverview(workspace.id);
	const { data: recommendations } = await supabase
		.from("recommendations")
		.select("*")
		.eq("workspace_id", workspace.id)
		.in("status", ["pending", "in_progress"])
		.order("impact_score", { ascending: false })
		.limit(3);
	const latestMetric = overview.metrics.at(-1);
	const latestShareOfVoice = overview.shareOfVoice.at(-1);
	const totalRuns = overview.runs.length;
	const mentions = overview.runs.filter((run) => run.brand_mentioned).length;
	const wonPrompts = overview.rankings.filter(
		(ranking) =>
			ranking.brand_mentioned && Number(ranking.visibility_score ?? 0) >= 60,
	).length;
	const lostPrompts = overview.rankings.filter(
		(ranking) =>
			!ranking.brand_mentioned || Number(ranking.visibility_score ?? 0) < 30,
	).length;
	const openTasks = overview.tasks.filter(
		(task) => task.status === "pending" || task.status === "in_progress",
	).length;
	const totalCost = overview.runs.reduce(
		(sum, run) => sum + Number(run.total_cost),
		0,
	);

	const cards = [
		{
			label: "Visibility score",
			labelEn: "Visibility score",
			value: latestMetric
				? `${Number(latestMetric.visibility_score).toFixed(0)}%`
				: `${totalRuns ? Math.round((mentions / totalRuns) * 100) : 0}%`,
		},
		{
			label: "Menciones",
			labelEn: "Mentions",
			value: String(latestMetric?.mention_count ?? mentions),
		},
		{
			label: "Share of Voice IA",
			labelEn: "AI Share of Voice",
			value: `${Number(latestShareOfVoice?.share_of_voice ?? 0).toFixed(0)}%`,
		},
		{
			label: "Runs recientes",
			labelEn: "Recent runs",
			value: String(totalRuns),
		},
		{
			label: "Prompts ganados",
			labelEn: "Won prompts",
			value: String(wonPrompts),
		},
		{
			label: "Prompts perdidos",
			labelEn: "Lost prompts",
			value: String(lostPrompts),
		},
		{
			label: "Tareas abiertas",
			labelEn: "Open tasks",
			value: String(openTasks),
		},
		{ label: "Coste", labelEn: "Cost", value: `${totalCost.toFixed(4)} EUR` },
	];

	return (
		<main className="flex-1 overflow-auto p-4 pb-24 lg:p-6 lg:pb-6">
			<div className="grid gap-5">
				<FiltersPanel />
				<div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
					{cards.map((card) => (
						<div className="neo-card p-4" key={card.label}>
							<p className="text-xs font-medium uppercase tracking-[0.06em] text-slate-500">
								{isEn ? card.labelEn : card.label}
							</p>
							<p className="mt-2 text-3xl font-semibold text-[var(--foreground)]">
								{card.value}
							</p>
						</div>
					))}
				</div>
				<TrendChart metrics={overview.metrics} />
				<section className="grid gap-4 xl:grid-cols-3">
					<div className="neo-card p-4 xl:col-span-1">
						<h2 className="font-semibold text-[var(--foreground)]">
							{isEn ? "Recent runs" : "Runs recientes"}
						</h2>
						<div className="mt-4 divide-y divide-slate-100">
							{overview.runs.slice(0, 6).map((run) => (
								<div
									className="flex items-center justify-between py-3"
									key={run.id}
								>
									<div>
										<p className="font-medium text-slate-900">
											{run.provider} - {run.model}
										</p>
										<p className="text-sm text-slate-500">
											{run.sentiment} - {run.status}
										</p>
									</div>
									<span className="rounded-md bg-[var(--brand-soft)] px-2 py-1 text-xs font-semibold text-teal-800">
										{run.brand_mentioned
											? isEn
												? "mentioned"
												: "mencionada"
											: isEn
												? "no mention"
												: "sin mencion"}
									</span>
								</div>
							))}
							{overview.runs.length === 0 ? (
								<p className="py-4 text-sm text-slate-500">
									{isEn ? "No runs yet." : "Sin ejecuciones todavia."}
								</p>
							) : null}
						</div>
					</div>
					<div className="neo-card p-4 xl:col-span-1">
						<h2 className="font-semibold text-[var(--foreground)]">
							{isEn ? "Top recommendations" : "Top recomendaciones"}
						</h2>
						<div className="mt-4 grid gap-3">
							{(recommendations ?? []).map((recommendation) => (
								<div
									className="rounded-md bg-[var(--surface-subtle)] p-3"
									key={recommendation.id}
								>
									<p className="text-sm font-medium text-[var(--foreground)]">
										{recommendation.title}
									</p>
									<p className="mt-1 text-xs uppercase text-slate-500">
										{recommendation.category} - {isEn ? "impact" : "impacto"}{" "}
										{Number(recommendation.impact_score).toFixed(0)}
									</p>
								</div>
							))}
							{(recommendations ?? []).length === 0 ? (
								<p className="text-sm text-slate-500">
									{isEn
										? "Generate recommendations to see prioritized SEO actions here."
										: "Genera recomendaciones para ver acciones SEO priorizadas aqui."}
								</p>
							) : null}
						</div>
					</div>
					<div className="neo-card p-4 xl:col-span-1">
						<h2 className="font-semibold text-[var(--foreground)]">
							{isEn ? "Operational alerts" : "Alertas operativas"}
						</h2>
						<div className="mt-4 grid gap-3 text-sm text-slate-600">
							<p className="rounded-md bg-[var(--surface-subtle)] p-3">
								{isEn ? "Active prompts" : "Prompts activos"}:{" "}
								{
									overview.prompts.filter(
										(prompt) => prompt.status === "active",
									).length
								}
							</p>
							<p className="rounded-md bg-[var(--surface-subtle)] p-3">
								{isEn ? "Tracked competitors" : "Competidores monitorizados"}:{" "}
								{overview.competitors.length}
							</p>
							<p className="rounded-md bg-[var(--surface-subtle)] p-3">
								{isEn ? "Detected sources" : "Fuentes detectadas"}:{" "}
								{overview.sources.length}
							</p>
						</div>
					</div>
				</section>
			</div>
		</main>
	);
}
