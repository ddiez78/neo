import type { SupabaseClient } from "@supabase/supabase-js";
import type {
	CompanyProfile,
	Prompt,
	PromptRanking,
	PromptRun,
	ShareOfVoiceMetric,
	Source,
	WeeklyMetric,
} from "@/types";

const EMBEDDING_MODEL = "text-embedding-3-small";

export type GeoKpiSnapshot = {
	visibility: number;
	shareOfVoice: number;
	consistency: number;
	avgPosition: number | null;
	sourceCount: number;
	clientSourceCount: number;
	sourceDiversity: number;
	positiveSentimentRate: number;
	negativeSentimentRate: number;
	competitorPressure: number;
	topFunnelCoverage: number;
	totalRuns: number;
	weakSignals: string[];
};

export type KnowledgeChunkMatch = {
	id: string;
	source_file: string;
	source_title: string;
	source_url?: string | null;
	source_domain?: string | null;
	heading_path: string[];
	content: string;
	tags: string[];
	category?: string | null;
	authority_tier?: number | null;
	similarity: number;
};

function average(values: number[]) {
	if (values.length === 0) {
		return 0;
	}
	return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function latestNumber<T>(
	items: T[],
	reader: (item: T) => number | string | null | undefined,
) {
	const last = items[items.length - 1];
	if (last == null) return 0;
	const value = reader(last);
	return value == null ? 0 : Number(value);
}

function isTopFunnelPrompt(prompt: Prompt) {
	const text =
		`${prompt.title} ${prompt.body} ${prompt.tags.join(" ")}`.toLowerCase();
	return /\b(what|how|why|guide|benefits|ideas|examples|learn|category|best practices|que|como|guia|beneficios)\b/.test(
		text,
	);
}

export function buildGeoKpiSnapshot(input: {
	company: CompanyProfile | null;
	prompts: Prompt[];
	runs: PromptRun[];
	rankings: PromptRanking[];
	sources: Source[];
	shareOfVoice: ShareOfVoiceMetric[];
	weeklyMetrics: WeeklyMetric[];
}): GeoKpiSnapshot {
	const completedRuns = input.runs.filter((run) => run.status === "completed");
	const totalRuns = completedRuns.length;
	const brandMentions = completedRuns.filter(
		(run) => run.brand_mentioned,
	).length;
	const visibility =
		latestNumber(input.weeklyMetrics, (metric) => metric.visibility_score) ||
		(totalRuns ? Math.round((brandMentions / totalRuns) * 100) : 0);
	const shareOfVoice = latestNumber(
		input.shareOfVoice,
		(metric) => metric.share_of_voice,
	);
	const consistency = totalRuns
		? Math.round((brandMentions / totalRuns) * 100)
		: 0;
	const positions = completedRuns
		.map((run) => run.brand_position)
		.filter((position): position is number => typeof position === "number");
	const avgPosition = positions.length
		? Number(average(positions).toFixed(1))
		: null;
	const clientSourceCount = input.sources.filter(
		(source) => source.is_client_domain || source.mentioned_brand,
	).length;
	const sourceDiversity = new Set(input.sources.map((source) => source.domain))
		.size;
	const positiveSentimentRate = totalRuns
		? Math.round(
				(completedRuns.filter((run) => run.sentiment === "positive").length /
					totalRuns) *
					100,
			)
		: 0;
	const negativeSentimentRate = totalRuns
		? Math.round(
				(completedRuns.filter((run) => run.sentiment === "negative").length /
					totalRuns) *
					100,
			)
		: 0;
	const competitorMentions = completedRuns.reduce(
		(sum, run) => sum + (run.competitors_mentioned?.length ?? 0),
		0,
	);
	const competitorPressure = totalRuns
		? Math.round((competitorMentions / totalRuns) * 100)
		: 0;
	const topFunnelPrompts = input.prompts.filter(isTopFunnelPrompt).length;
	const topFunnelCoverage = input.prompts.length
		? Math.round((topFunnelPrompts / input.prompts.length) * 100)
		: 0;
	const weakSignals: string[] = [];

	if (visibility < 50) {
		weakSignals.push("visibility");
	}
	if (shareOfVoice < 30) {
		weakSignals.push("share_of_voice");
	}
	if (consistency < 60) {
		weakSignals.push("consistency");
	}
	if (avgPosition == null || avgPosition > 3) {
		weakSignals.push("position");
	}
	if (input.sources.length === 0 || clientSourceCount === 0) {
		weakSignals.push("sources");
	}
	if (sourceDiversity < 3) {
		weakSignals.push("source_diversity");
	}
	if (negativeSentimentRate > 10 || positiveSentimentRate < 40) {
		weakSignals.push("sentiment");
	}
	if (competitorPressure > Math.max(50, shareOfVoice)) {
		weakSignals.push("competitors");
	}
	if (topFunnelCoverage < 20) {
		weakSignals.push("top_funnel");
	}
	if (!input.company?.description || !input.company.keywords?.length) {
		weakSignals.push("entity");
	}

	return {
		visibility,
		shareOfVoice,
		consistency,
		avgPosition,
		sourceCount: input.sources.length,
		clientSourceCount,
		sourceDiversity,
		positiveSentimentRate,
		negativeSentimentRate,
		competitorPressure,
		topFunnelCoverage,
		totalRuns,
		weakSignals,
	};
}

export function buildRetrievalQueries(metrics: GeoKpiSnapshot) {
	const queries: string[] = [];

	if (metrics.visibility < 50 || metrics.shareOfVoice < 30) {
		queries.push(
			"GEO measurement framework to improve AI visibility score share of voice mention frequency and citation frequency against competitors",
		);
	}
	if (
		metrics.consistency < 60 ||
		metrics.avgPosition == null ||
		metrics.avgPosition > 3
	) {
		queries.push(
			"Improve brand mention consistency average position and entity clarity across ChatGPT Google AI Overviews Perplexity recommendation answers",
		);
	}
	if (
		metrics.sourceCount === 0 ||
		metrics.clientSourceCount === 0 ||
		metrics.sourceDiversity < 3
	) {
		queries.push(
			"Build authoritative third party citations source diversity earned mentions reviews Reddit YouTube directories and trusted publications for AI search",
		);
	}
	if (
		metrics.negativeSentimentRate > 10 ||
		metrics.positiveSentimentRate < 40
	) {
		queries.push(
			"Improve sentiment positioning proof points reputation and positive framing in AI generated recommendations",
		);
	}
	if (metrics.competitorPressure > Math.max(50, metrics.shareOfVoice)) {
		queries.push(
			"Competitor comparison content alternatives pages category positioning and differentiated proof for AI recommendations",
		);
	}
	if (metrics.topFunnelCoverage < 20) {
		queries.push(
			"Expand top funnel prompt coverage query fan-out topic clusters informational content and extractable answer passages for GEO",
		);
	}
	if (queries.length === 0) {
		queries.push(
			"Best practices for prioritizing GEO recommendations from visibility share of voice sources and sentiment metrics",
		);
	}

	return queries.slice(0, 6);
}

function relevanceScore(chunk: KnowledgeChunkMatch) {
	const authority = Number(chunk.authority_tier ?? 3);
	const categoryBoost = chunk.category === "measurement" ? 0.06 : 0;
	return Number(chunk.similarity) + authority * 0.015 + categoryBoost;
}

async function embedText(text: string) {
	const apiKey = process.env.OPENAI_API_KEY_EMBEDDINGS;
	if (!apiKey) {
		return null;
	}

	const response = await fetch("https://api.openai.com/v1/embeddings", {
		method: "POST",
		headers: {
			Authorization: `Bearer ${apiKey}`,
			"Content-Type": "application/json",
		},
		body: JSON.stringify({
			model: EMBEDDING_MODEL,
			input: text,
		}),
	});

	if (!response.ok) {
		throw new Error(
			`OpenAI embeddings error ${response.status}: ${await response.text()}`,
		);
	}

	const json = (await response.json()) as {
		data?: Array<{ embedding?: number[] }>;
	};
	return json.data?.[0]?.embedding ?? null;
}

export async function retrieveRelevantKnowledge(input: {
	supabase: SupabaseClient;
	queries: string[];
	topK?: number;
	cap?: number;
	similarityThreshold?: number;
}) {
	const topK = input.topK ?? 4;
	const cap = input.cap ?? 10;
	const similarityThreshold = input.similarityThreshold ?? 0.25;
	const byId = new Map<string, KnowledgeChunkMatch>();

	for (const query of input.queries) {
		const embedding = await embedText(query);
		if (!embedding) {
			continue;
		}

		const { data, error } = await input.supabase.rpc("match_knowledge_chunks", {
			query_embedding: `[${embedding.join(",")}]`,
			match_count: topK,
			similarity_threshold: similarityThreshold,
		});

		if (error) {
			throw new Error(error.message);
		}

		for (const item of (data ?? []) as KnowledgeChunkMatch[]) {
			const existing = byId.get(item.id);
			if (!existing || Number(item.similarity) > Number(existing.similarity)) {
				byId.set(item.id, item);
			}
		}
	}

	return [...byId.values()]
		.sort((a, b) => relevanceScore(b) - relevanceScore(a))
		.slice(0, cap);
}
