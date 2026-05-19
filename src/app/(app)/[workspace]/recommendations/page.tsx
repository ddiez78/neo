import {
	createRecommendationAction,
	createRecommendationTaskAction,
	generateRecommendationsAction,
	importRecommendationSourcesAction,
	updateRecommendationStatusAction,
} from "@/actions/recommendations";
import { requireUser, requireWorkspace } from "@/lib/data/workspace";
import type {
	Recommendation,
	RecommendationCategory,
	RecommendationSource,
	RecommendationStatus,
} from "@/types";

const categories: RecommendationCategory[] = [
	"entity",
	"content",
	"sources",
	"competitors",
	"prompts",
	"technical",
	"authority",
	"sentiment",
];

const statusLabels: Record<RecommendationStatus, string> = {
	pending: "Pending",
	in_progress: "In progress",
	done: "Done",
	dismissed: "Dismissed",
};

function scoreColor(score: number) {
	if (score >= 80) {
		return "text-emerald-700 bg-emerald-50";
	}
	if (score >= 60) {
		return "text-cyan-700 bg-cyan-50";
	}
	return "text-amber-700 bg-amber-50";
}

export default async function Page({
	params,
	searchParams,
}: {
	params: Promise<{ workspace: string }>;
	searchParams: Promise<{
		error?: string;
		imported?: string;
		generated?: string;
		created?: string;
	}>;
}) {
	const { workspace: slug } = await params;
	const status = await searchParams;
	const workspace = await requireWorkspace(slug);
	const { supabase } = await requireUser();

	const [recommendationsResult, sourcesResult, actionsResult] =
		await Promise.all([
			supabase
				.from("recommendations")
				.select("*")
				.eq("workspace_id", workspace.id)
				.order("priority", { ascending: false })
				.order("impact_score", { ascending: false }),
			supabase
				.from("recommendation_sources")
				.select("*")
				.eq("workspace_id", workspace.id)
				.order("category", { ascending: true }),
			supabase
				.from("recommendation_actions")
				.select("*, recommendations!inner(workspace_id)")
				.eq("recommendations.workspace_id", workspace.id),
		]);

	const recommendations = (recommendationsResult.data ??
		[]) as Recommendation[];
	const sources = (sourcesResult.data ?? []) as RecommendationSource[];
	const actions = actionsResult.data ?? [];
	const pendingCount = recommendations.filter(
		(item) => item.status === "pending",
	).length;
	const activeCount = recommendations.filter(
		(item) => item.status === "pending" || item.status === "in_progress",
	).length;
	const highImpactCount = recommendations.filter(
		(item) => Number(item.impact_score) >= 80,
	).length;

	const importAction = importRecommendationSourcesAction.bind(
		null,
		workspace.id,
		workspace.slug,
	);
	const generateAction = generateRecommendationsAction.bind(
		null,
		workspace.id,
		workspace.slug,
	);
	const createAction = createRecommendationAction.bind(
		null,
		workspace.id,
		workspace.slug,
	);

	return (
		<main className="flex-1 overflow-auto p-4 lg:p-6">
			<div className="grid gap-6">
				<div className="flex flex-wrap items-start justify-between gap-4">
					<div>
						<p className="text-sm font-semibold uppercase text-cyan-700">
							AI SEO Recommendations
						</p>
						<h1 className="mt-2 text-2xl font-semibold text-slate-950">
							Recommendations
						</h1>
						<p className="mt-2 max-w-3xl text-slate-600">
							Operational recommendations based on markdown methodology,
							workspace context, prompts, competitors, sources, and LLM runs.
						</p>
					</div>
					<div className="flex flex-wrap gap-2">
						<form action={importAction}>
							<button
								className="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
								type="submit"
							>
								Import MD sources
							</button>
						</form>
						<form action={generateAction}>
							<button
								className="rounded-md bg-slate-950 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
								type="submit"
							>
								Generate recommendations
							</button>
						</form>
					</div>
				</div>

				{status.error ? (
					<p className="rounded-md bg-red-50 p-3 text-sm text-red-700">
						{status.error}
					</p>
				) : null}
				{status.imported ? (
					<p className="rounded-md bg-emerald-50 p-3 text-sm text-emerald-700">
						Markdown methodology imported.
					</p>
				) : null}
				{status.generated ? (
					<p className="rounded-md bg-emerald-50 p-3 text-sm text-emerald-700">
						Generated {status.generated} recommendations.
					</p>
				) : null}
				{status.created ? (
					<p className="rounded-md bg-emerald-50 p-3 text-sm text-emerald-700">
						Recommendation created.
					</p>
				) : null}

				<section className="grid gap-4 md:grid-cols-4">
					<div className="rounded-md border border-slate-200 bg-white p-4">
						<p className="text-sm text-slate-500">Active</p>
						<p className="mt-2 text-3xl font-semibold text-slate-950">
							{activeCount}
						</p>
					</div>
					<div className="rounded-md border border-slate-200 bg-white p-4">
						<p className="text-sm text-slate-500">Pending</p>
						<p className="mt-2 text-3xl font-semibold text-slate-950">
							{pendingCount}
						</p>
					</div>
					<div className="rounded-md border border-slate-200 bg-white p-4">
						<p className="text-sm text-slate-500">High impact</p>
						<p className="mt-2 text-3xl font-semibold text-slate-950">
							{highImpactCount}
						</p>
					</div>
					<div className="rounded-md border border-slate-200 bg-white p-4">
						<p className="text-sm text-slate-500">MD sources</p>
						<p className="mt-2 text-3xl font-semibold text-slate-950">
							{sources.length}
						</p>
					</div>
				</section>

				<section className="grid gap-6 xl:grid-cols-[1fr_360px]">
					<div className="grid gap-3">
						{recommendations.length === 0 ? (
							<div className="rounded-md border border-dashed border-slate-300 bg-white p-8 text-center">
								<h2 className="text-lg font-semibold text-slate-950">
									No recommendations yet
								</h2>
								<p className="mt-2 text-sm text-slate-500">
									Import the markdown methodology and generate the first
									recommendations for this workspace.
								</p>
							</div>
						) : null}

						{recommendations.map((recommendation) => {
							const markInProgress = updateRecommendationStatusAction.bind(
								null,
								workspace.slug,
								recommendation.id,
								"in_progress",
							);
							const markDone = updateRecommendationStatusAction.bind(
								null,
								workspace.slug,
								recommendation.id,
								"done",
							);
							const dismiss = updateRecommendationStatusAction.bind(
								null,
								workspace.slug,
								recommendation.id,
								"dismissed",
							);
							const createTask = createRecommendationTaskAction.bind(
								null,
								workspace.id,
								workspace.slug,
								recommendation,
							);

							return (
								<article
									className="rounded-md border border-slate-200 bg-white p-5"
									key={recommendation.id}
								>
									<div className="flex flex-wrap items-start justify-between gap-4">
										<div className="min-w-0">
											<div className="flex flex-wrap items-center gap-2">
												<span className="rounded-md bg-slate-100 px-2 py-1 text-xs font-semibold uppercase text-slate-700">
													{recommendation.category}
												</span>
												<span className="rounded-md bg-cyan-50 px-2 py-1 text-xs font-semibold uppercase text-cyan-700">
													P{recommendation.priority}
												</span>
												<span className="rounded-md bg-slate-100 px-2 py-1 text-xs font-semibold uppercase text-slate-700">
													{statusLabels[recommendation.status]}
												</span>
											</div>
											<h2 className="mt-3 text-lg font-semibold text-slate-950">
												{recommendation.title}
											</h2>
											<p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
												{recommendation.description}
											</p>
										</div>
										<div className="grid grid-cols-2 gap-2 text-center">
											<div
												className={`rounded-md px-3 py-2 ${scoreColor(Number(recommendation.impact_score))}`}
											>
												<p className="text-xs font-medium">Impact</p>
												<p className="text-lg font-semibold">
													{Number(recommendation.impact_score).toFixed(0)}
												</p>
											</div>
											<div
												className={`rounded-md px-3 py-2 ${scoreColor(Number(recommendation.confidence_score))}`}
											>
												<p className="text-xs font-medium">Confidence</p>
												<p className="text-lg font-semibold">
													{Number(recommendation.confidence_score).toFixed(0)}
												</p>
											</div>
										</div>
									</div>

									<div className="mt-4 grid gap-3 text-sm text-slate-600 md:grid-cols-3">
										<p className="rounded-md bg-slate-50 p-3">
											<span className="block font-medium text-slate-950">
												Related prompts
											</span>
											{recommendation.related_prompt_ids.length}
										</p>
										<p className="rounded-md bg-slate-50 p-3">
											<span className="block font-medium text-slate-950">
												Competitors
											</span>
											{recommendation.related_competitor_ids.length}
										</p>
										<p className="rounded-md bg-slate-50 p-3">
											<span className="block font-medium text-slate-950">
												Domains
											</span>
											{recommendation.related_source_domains.join(", ") || "-"}
										</p>
									</div>

									<div className="mt-4 flex flex-wrap gap-2">
										<form action={markInProgress}>
											<button
												className="rounded-md border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
												type="submit"
											>
												Start
											</button>
										</form>
										<form action={markDone}>
											<button
												className="rounded-md bg-emerald-700 px-3 py-2 text-sm font-medium text-white hover:bg-emerald-800"
												type="submit"
											>
												Done
											</button>
										</form>
										<form action={dismiss}>
											<button
												className="rounded-md border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
												type="submit"
											>
												Dismiss
											</button>
										</form>
										<form action={createTask}>
											<button
												className="rounded-md bg-cyan-700 px-3 py-2 text-sm font-medium text-white hover:bg-cyan-800"
												type="submit"
											>
												Create task
											</button>
										</form>
									</div>
								</article>
							);
						})}
					</div>

					<aside className="grid h-fit gap-4">
						<form
							action={createAction}
							className="grid gap-3 rounded-md border border-slate-200 bg-white p-4"
						>
							<h2 className="font-semibold text-slate-950">
								Add manual recommendation
							</h2>
							<input
								className="rounded-md border border-slate-300 px-3 py-2 text-sm"
								name="title"
								placeholder="Recommendation title"
								required
							/>
							<textarea
								className="min-h-24 rounded-md border border-slate-300 px-3 py-2 text-sm"
								name="description"
								placeholder="What should the marketing team do?"
								required
							/>
							<div className="grid grid-cols-2 gap-2">
								<select
									className="rounded-md border border-slate-300 px-3 py-2 text-sm"
									name="category"
								>
									{categories.map((category) => (
										<option key={category} value={category}>
											{category}
										</option>
									))}
								</select>
								<input
									className="rounded-md border border-slate-300 px-3 py-2 text-sm"
									defaultValue="3"
									max="5"
									min="1"
									name="priority"
									type="number"
								/>
							</div>
							<button
								className="rounded-md bg-slate-950 px-4 py-2 text-sm font-semibold text-white"
								type="submit"
							>
								Create
							</button>
						</form>

						<section className="rounded-md border border-slate-200 bg-white p-4">
							<h2 className="font-semibold text-slate-950">
								Methodology files
							</h2>
							<div className="mt-3 grid gap-2">
								{sources.length === 0 ? (
									<p className="text-sm text-slate-500">
										No markdown sources imported yet.
									</p>
								) : null}
								{sources.map((source) => (
									<div
										className="rounded-md border border-slate-100 bg-slate-50 p-3"
										key={source.id}
									>
										<p className="text-sm font-medium text-slate-950">
											{source.title}
										</p>
										<p className="mt-1 text-xs uppercase text-slate-500">
											{source.category} · {source.version}
										</p>
									</div>
								))}
							</div>
						</section>

						<section className="rounded-md border border-slate-200 bg-white p-4">
							<h2 className="font-semibold text-slate-950">Tasks created</h2>
							<p className="mt-2 text-3xl font-semibold text-slate-950">
								{actions.length}
							</p>
							<p className="mt-1 text-sm text-slate-500">
								Recommendation tasks are ready for owner/due-date workflows.
							</p>
						</section>
					</aside>
				</section>
			</div>
		</main>
	);
}
