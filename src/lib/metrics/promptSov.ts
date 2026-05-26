import type { PromptRun } from "@/types";

const SOV_WINDOW_DAYS = 30;

export type PromptSov = {
	sov: number;
	brandMentions: number;
	competitorMentions: number;
	totalRuns: number;
};

/**
 * Share of Voice for a single prompt computed from completed runs in the
 * last {@link SOV_WINDOW_DAYS} days. Defined as:
 *   brandMentions / (brandMentions + competitorMentions) * 100
 *
 * Returns 0% when there's no data so callers can render a stable cell.
 */
export function computePromptSov(
	promptId: string,
	runs: PromptRun[],
): PromptSov {
	const cutoff = Date.now() - SOV_WINDOW_DAYS * 24 * 60 * 60 * 1000;
	const promptRuns = runs.filter(
		(run) =>
			run.prompt_id === promptId &&
			run.status === "completed" &&
			new Date(run.created_at).getTime() >= cutoff,
	);
	const brand = promptRuns.filter((run) => run.brand_mentioned).length;
	const competitor = promptRuns.reduce(
		(sum, run) => sum + (run.competitors_mentioned?.length ?? 0),
		0,
	);
	const total = brand + competitor;
	return {
		sov: total > 0 ? (brand / total) * 100 : 0,
		brandMentions: brand,
		competitorMentions: competitor,
		totalRuns: promptRuns.length,
	};
}
