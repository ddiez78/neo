import { TrendChart } from "@/components/dashboard/TrendChart";
import { FiltersPanel } from "@/components/layout/FiltersPanel";
import { getWorkspaceOverview, requireWorkspace } from "@/lib/data/workspace";

export default async function Page({
	params,
}: {
	params: Promise<{ workspace: string }>;
}) {
	const { workspace: slug } = await params;
	const workspace = await requireWorkspace(slug);
	const overview = await getWorkspaceOverview(workspace.id);
	const latestMetric = overview.metrics.at(-1);
	const totalRuns = overview.runs.length;
	const mentions = overview.runs.filter((run) => run.brand_mentioned).length;
	const totalCost = overview.runs.reduce(
		(sum, run) => sum + Number(run.total_cost),
		0,
	);

	const cards = [
		{
			label: "Visibility score",
			value: latestMetric
				? `${Number(latestMetric.visibility_score).toFixed(0)}%`
				: `${totalRuns ? Math.round((mentions / totalRuns) * 100) : 0}%`,
		},
		{
			label: "Menciones",
			value: String(latestMetric?.mention_count ?? mentions),
		},
		{ label: "Runs recientes", value: String(totalRuns) },
		{ label: "Coste", value: `${totalCost.toFixed(4)} EUR` },
	];

	return (
		<main className="flex-1 overflow-auto p-4 lg:p-6">
			<div className="grid gap-5">
				<FiltersPanel />
				<div className="grid gap-4 md:grid-cols-4">
					{cards.map((card) => (
						<div
							className="rounded-md border border-slate-200 bg-white p-4"
							key={card.label}
						>
							<p className="text-sm text-slate-500">{card.label}</p>
							<p className="mt-2 text-3xl font-semibold text-slate-950">
								{card.value}
							</p>
						</div>
					))}
				</div>
				<TrendChart metrics={overview.metrics} />
				<section className="grid gap-4 lg:grid-cols-2">
					<div className="rounded-md border border-slate-200 bg-white p-4">
						<h2 className="font-semibold text-slate-950">Runs recientes</h2>
						<div className="mt-4 divide-y divide-slate-100">
							{overview.runs.slice(0, 6).map((run) => (
								<div
									className="flex items-center justify-between py-3"
									key={run.id}
								>
									<div>
										<p className="font-medium text-slate-900">
											{run.provider} · {run.model}
										</p>
										<p className="text-sm text-slate-500">
											{run.sentiment} · {run.status}
										</p>
									</div>
									<span className="rounded-md bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-700">
										{run.brand_mentioned ? "mencionada" : "sin mencion"}
									</span>
								</div>
							))}
							{overview.runs.length === 0 ? (
								<p className="py-4 text-sm text-slate-500">
									Sin ejecuciones todavia.
								</p>
							) : null}
						</div>
					</div>
					<div className="rounded-md border border-slate-200 bg-white p-4">
						<h2 className="font-semibold text-slate-950">Alertas operativas</h2>
						<div className="mt-4 grid gap-3 text-sm text-slate-600">
							<p className="rounded-md bg-slate-50 p-3">
								Prompts activos:{" "}
								{
									overview.prompts.filter(
										(prompt) => prompt.status === "active",
									).length
								}
							</p>
							<p className="rounded-md bg-slate-50 p-3">
								Competidores monitorizados: {overview.competitors.length}
							</p>
							<p className="rounded-md bg-slate-50 p-3">
								Fuentes detectadas: {overview.sources.length}
							</p>
						</div>
					</div>
				</section>
			</div>
		</main>
	);
}
