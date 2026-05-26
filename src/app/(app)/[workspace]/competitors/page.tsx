import { Plus } from "lucide-react";
import { createCompetitorAction } from "@/actions/competitors";
import type { CompetitorRow } from "@/components/competitors/CompetitorSummaryBar";
import { CompetitorSummaryBar } from "@/components/competitors/CompetitorSummaryBar";
import { CompetitorTable } from "@/components/competitors/CompetitorTable";
import { getWorkspaceOverview, requireWorkspace } from "@/lib/data/workspace";
import { getUserPreferences } from "@/lib/preferences-server";
import type { Competitor, PromptRun } from "@/types";

function buildCompetitorRows(
	competitors: Competitor[],
	runs: PromptRun[],
): CompetitorRow[] {
	return competitors.map((c) => {
		const cRuns = runs.filter((r) =>
			(r.competitors_mentioned ?? []).includes(c.name),
		);
		const mentions = cRuns.length;
		const share = runs.length ? (mentions / runs.length) * 100 : 0;
		const displacements = cRuns.filter(
			(r) =>
				r.brand_mentioned &&
				typeof r.first_competitor_position === "number" &&
				typeof r.brand_position === "number" &&
				r.first_competitor_position < r.brand_position,
		).length;
		const positions = cRuns
			.map((r) => r.first_competitor_position)
			.filter((p): p is number => typeof p === "number");
		const avgPosition =
			positions.length > 0
				? positions.reduce((a, b) => a + b, 0) / positions.length
				: null;
		const positiveSentiment = cRuns.filter(
			(r) => r.sentiment === "positive",
		).length;
		const sentimentScore =
			cRuns.length > 0 ? (positiveSentiment / cRuns.length) * 100 : null;

		const risk: "high" | "medium" | "low" =
			displacements >= 5 || share >= 35
				? "high"
				: displacements >= 2 || share >= 15
					? "medium"
					: "low";

		return {
			id: c.id,
			name: c.name,
			domain: c.domain ?? null,
			aliases: c.aliases ?? [],
			mentions,
			share,
			displacements,
			avgPosition,
			sentimentScore,
			topSources: [],
			risk,
		};
	});
}

export default async function Page({
	params,
	searchParams,
}: {
	params: Promise<{ workspace: string }>;
	searchParams: Promise<{ error?: string }>;
}) {
	const { workspace: slug } = await params;
	const status = await searchParams;
	const [workspace, prefs] = await Promise.all([
		requireWorkspace(slug),
		getUserPreferences(),
	]);
	const { competitors, runs } = await getWorkspaceOverview(workspace.id);

	const rows = buildCompetitorRows(competitors, runs).sort(
		(a, b) => b.share - a.share,
	);

	const action = createCompetitorAction.bind(
		null,
		workspace.id,
		workspace.slug,
	);
	const locale = prefs.locale ?? "es";

	const totalMentions = rows.reduce((s, r) => s + r.mentions, 0);

	return (
		<main className="flex-1 overflow-auto p-4 pb-24 lg:p-6 lg:pb-8">
			<div className="mx-auto grid max-w-[1440px] gap-6">
				{/* Header */}
				<section className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
					<div>
						<p className="text-xs font-black uppercase tracking-[0.2em] text-[var(--brand)]">
							Competitor Intelligence
						</p>
						<h1 className="mt-2 text-3xl font-black tracking-[-0.03em] text-[var(--foreground)]">
							Competitive Analysis Matrix
						</h1>
						<p className="mt-2 max-w-3xl text-sm text-[var(--muted)]">
							{locale === "en"
								? "Competing brands ranked by LLM presence, mentions and competitive pressure."
								: "Marcas rivales comparadas por presencia en respuestas, menciones y presión competitiva dentro de LLMs."}
						</p>
					</div>
					<div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
						<Metric
							label={locale === "en" ? "Competitors" : "Competidores"}
							value={competitors.length}
						/>
						<Metric
							label={locale === "en" ? "Mentions" : "Menciones"}
							value={totalMentions}
						/>
						<Metric label="Runs" value={runs.length} />
					</div>
				</section>

				{/* Error */}
				{status.error ? (
					<p className="rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-[#ffb4ab]">
						{status.error}
					</p>
				) : null}

				{/* Summary cards — top 3 */}
				{rows.length > 0 ? (
					<CompetitorSummaryBar
						locale={locale}
						rows={rows}
						totalRuns={runs.length}
					/>
				) : null}

				{/* Sortable table */}
				<CompetitorTable locale={locale} rows={rows} />

				{/* Add competitor form */}
				<details className="neo-card group">
					<summary className="flex cursor-pointer list-none items-center gap-2 p-5 [&::-webkit-details-marker]:hidden">
						<Plus className="size-4 text-[var(--brand)]" />
						<span className="text-sm font-semibold text-[var(--foreground)]">
							{locale === "en" ? "Add competitor" : "Añadir competidor"}
						</span>
					</summary>
					<form
						action={action}
						className="grid gap-4 border-t border-[var(--border)] p-5 lg:grid-cols-[1fr_1fr_1fr_auto]"
					>
						<input
							name="name"
							placeholder={
								locale === "en" ? "Competitor name" : "Nombre del competidor"
							}
							required
						/>
						<input
							name="domain"
							placeholder={
								locale === "en" ? "competitor.com" : "competidor.com"
							}
						/>
						<input
							name="aliases"
							placeholder={
								locale === "en"
									? "aliases, comma separated"
									: "aliases separados por coma"
							}
						/>
						<button
							className="inline-flex items-center justify-center gap-2 rounded-lg bg-[var(--brand)] px-4 py-2 text-sm font-black text-[#1b1000] transition hover:brightness-110"
							type="submit"
						>
							<Plus className="size-4" />
							{locale === "en" ? "Add" : "Añadir"}
						</button>
					</form>
				</details>
			</div>
		</main>
	);
}

function Metric({ label, value }: { label: string; value: number }) {
	return (
		<div className="neo-card min-w-28 p-3 text-right">
			<p className="text-[10px] font-black uppercase tracking-[0.12em] text-[var(--muted)]">
				{label}
			</p>
			<p className="mt-1 text-2xl font-black text-[var(--foreground)]">
				{value}
			</p>
		</div>
	);
}
