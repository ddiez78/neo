import type {
	CompanyProfile,
	Competitor,
	Prompt,
	PromptRun,
	Recommendation,
	RecommendationCategory,
	RecommendationSource,
	Source,
} from "@/types";

type RecommendationDraft = Pick<
	Recommendation,
	| "title"
	| "description"
	| "category"
	| "priority"
	| "impact_score"
	| "confidence_score"
	| "related_prompt_ids"
	| "related_competitor_ids"
	| "related_source_domains"
	| "evidence"
> & {
	source_slug: string;
};

function findSource(
	sources: RecommendationSource[],
	category: RecommendationCategory,
) {
	return sources.find((source) => source.category === category) ?? sources[0];
}

export function buildRecommendationDrafts(input: {
	company: CompanyProfile | null;
	competitors: Competitor[];
	prompts: Prompt[];
	runs: PromptRun[];
	sources: Source[];
	methodology: RecommendationSource[];
}) {
	const { company, competitors, prompts, runs, sources, methodology } = input;
	const totalRuns = runs.length;
	const brandMentions = runs.filter((run) => run.brand_mentioned).length;
	const visibility = totalRuns
		? Math.round((brandMentions / totalRuns) * 100)
		: 0;
	const negativeRuns = runs.filter(
		(run) => run.sentiment === "negative",
	).length;
	const neutralRuns = runs.filter((run) => run.sentiment === "neutral").length;
	const drafts: RecommendationDraft[] = [];

	const missingCompanyFields = [
		company?.description ? null : "description",
		company?.keywords?.length ? null : "keywords",
		company?.markets?.length ? null : "markets",
		company?.official_urls?.length ? null : "official_urls",
	].filter(Boolean);

	if (!company || missingCompanyFields.length > 0 || visibility < 60) {
		const source = findSource(methodology, "entity");
		drafts.push({
			source_slug: source?.slug ?? "entity-optimization",
			title: "Strengthen brand entity signals",
			description:
				"Improve the official brand profile with clearer category language, target markets, keywords, products, and official URLs so LLMs can associate the brand with the right topics.",
			category: "entity",
			priority: visibility < 50 ? 5 : 4,
			impact_score: 86,
			confidence_score: company ? 78 : 92,
			related_prompt_ids: prompts.slice(0, 3).map((prompt) => prompt.id),
			related_competitor_ids: [],
			related_source_domains: [],
			evidence: {
				visibility,
				missingCompanyFields,
				methodology: source?.title,
			},
		});
	}

	if (prompts.length < 6 || competitors.length > 0) {
		const source = findSource(methodology, "prompts");
		drafts.push({
			source_slug: source?.slug ?? "prompt-coverage",
			title: "Expand monitored prompts across buyer intent",
			description:
				"Add awareness, comparison, alternatives, source-validation, and purchase-stage prompts to detect where the brand is missing from AI answers.",
			category: "prompts",
			priority: prompts.length < 3 ? 5 : 3,
			impact_score: 74,
			confidence_score: 82,
			related_prompt_ids: prompts.map((prompt) => prompt.id),
			related_competitor_ids: competitors
				.slice(0, 3)
				.map((competitor) => competitor.id),
			related_source_domains: [],
			evidence: {
				promptCount: prompts.length,
				competitorCount: competitors.length,
				methodology: source?.title,
			},
		});
	}

	if (
		sources.length < 5 ||
		sources.every((source) => !source.mentioned_brand)
	) {
		const source = findSource(methodology, "authority");
		drafts.push({
			source_slug: source?.slug ?? "source-authority",
			title: "Build source authority for AI citations",
			description:
				"Prioritize authoritative third-party pages and official resources that mention the brand, because LLM answers often rely on repeated credible source signals.",
			category: "authority",
			priority: sources.length < 2 ? 5 : 4,
			impact_score: 81,
			confidence_score: 75,
			related_prompt_ids: [],
			related_competitor_ids: competitors
				.slice(0, 3)
				.map((competitor) => competitor.id),
			related_source_domains: [
				...new Set(sources.map((source) => source.domain)),
			].slice(0, 5),
			evidence: {
				sourceCount: sources.length,
				brandSources: sources.filter((source) => source.mentioned_brand).length,
				methodology: source?.title,
			},
		});
	}

	if (competitors.length > 0) {
		const source = findSource(methodology, "content");
		drafts.push({
			source_slug: source?.slug ?? "content-gap-analysis",
			title: "Create competitor and alternatives content",
			description:
				"Create comparison pages and alternatives content that explicitly position the brand against competitors already present in the monitoring set.",
			category: "content",
			priority: 4,
			impact_score: 79,
			confidence_score: 80,
			related_prompt_ids: prompts.slice(0, 5).map((prompt) => prompt.id),
			related_competitor_ids: competitors.map((competitor) => competitor.id),
			related_source_domains: [],
			evidence: {
				competitors: competitors.map((competitor) => competitor.name),
				methodology: source?.title,
			},
		});
	}

	if (negativeRuns > 0 || neutralRuns > Math.max(1, totalRuns / 2)) {
		const source = findSource(methodology, "sentiment");
		drafts.push({
			source_slug: source?.slug ?? "sentiment-and-positioning",
			title: "Improve AI answer positioning and proof points",
			description:
				"Add clearer differentiated claims, proof points, and case-study language so AI answers describe the brand with stronger positive positioning.",
			category: "sentiment",
			priority: negativeRuns > 0 ? 5 : 3,
			impact_score: negativeRuns > 0 ? 83 : 64,
			confidence_score: 72,
			related_prompt_ids: runs
				.filter(
					(run) => run.sentiment === "negative" || run.sentiment === "neutral",
				)
				.map((run) => run.prompt_id)
				.filter(Boolean) as string[],
			related_competitor_ids: [],
			related_source_domains: [],
			evidence: {
				negativeRuns,
				neutralRuns,
				totalRuns,
				methodology: source?.title,
			},
		});
	}

	return drafts;
}
