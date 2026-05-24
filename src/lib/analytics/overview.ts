import { requireUser } from "@/lib/data/workspace";
import type { LlmProviderKey, Sentiment } from "@/types";

type PromptRunRow = {
	id: string;
	workspace_id: string;
	prompt_id?: string | null;
	provider: LlmProviderKey;
	model: string;
	status: string;
	input_text?: string | null;
	response_text?: string | null;
	sentiment: Sentiment;
	brand_mentioned: boolean;
	visibility_score?: number | string | null;
	brand_position?: number | null;
	first_competitor_position?: number | null;
	competitors_mentioned?: string[] | null;
	source_count?: number | string | null;
	total_cost?: number | string | null;
	created_at: string;
};

type DailyMetricRow = {
	metric_date: string;
	visibility_score?: number | string | null;
	mention_count?: number | null;
	total_runs?: number | null;
	positive_mentions?: number | null;
	neutral_mentions?: number | null;
	negative_mentions?: number | null;
	source_count?: number | null;
	total_cost?: number | string | null;
};

type ShareOfVoiceRow = {
	metric_date: string;
	provider: LlmProviderKey;
	model: string;
	total_runs: number;
	brand_mentions: number;
	competitor_mentions: number;
	share_of_voice: number | string;
};

type CompanyRow = { brand_name?: string | null; website?: string | null };

type SourceRow = {
	id: string;
	url: string;
	domain: string;
	title?: string | null;
	source_type?: string | null;
	mentioned_brand?: boolean | null;
	mentioned_competitors?: string[] | null;
	is_client_domain?: boolean | null;
	is_competitor_domain?: boolean | null;
	authority_score?: number | string | null;
	created_at: string;
};

type PromptRankingRow = {
	prompt_id: string;
	title: string;
	body: string;
	priority: number;
	brand_mentioned?: boolean | null;
	brand_position?: number | null;
	first_competitor_position?: number | null;
	sentiment?: Sentiment | null;
	visibility_score?: number | string | null;
	competitors_mentioned?: string[] | null;
	source_count?: number | null;
};

type RecommendationRow = {
	id: string;
	title: string;
	description: string;
	category: string;
	priority: number;
	impact_score: number | string;
	confidence_score: number | string;
	status: string;
	related_source_domains?: string[] | null;
	evidence?: Record<string, unknown> | null;
};

type CompetitorRow = {
	name: string;
	domain?: string | null;
};

export type OverviewKpi = {
	key:
		| "visibility"
		| "avgPosition"
		| "brandMentions"
		| "sentiment"
		| "shareOfVoice"
		| "sources";
	label: string;
	value: string;
	subtitle: string;
	deltaLabel: string;
	deltaDirection: "up" | "down" | "flat";
	positiveDirection: "up" | "down";
	sparkline: { date: string; value: number }[];
};

export type VisibilityTrendPoint = {
	date: string;
	visibility: number;
	avgPosition?: number | null;
	previousVisibility?: number | null;
};

export type MarketShareItem = {
	name: string;
	value: number;
	count: number;
	isBrand?: boolean;
	color: string;
};

export type LlmComparisonRow = {
	provider: string;
	visibility: number;
	sov: number;
	avgRank?: number | null;
	topCompetitor: string;
	topCompetitorShare: number;
	sentimentScore: number;
	sentimentLabel: string;
};

export type SentimentTrendPoint = {
	date: string;
	score: number;
	positive: number;
	neutral: number;
	negative: number;
};

export type MentionContextItem = {
	label: string;
	value: number;
	count: number;
	color: string;
	description?: string;
};

export type CompetitorShareTrendPoint = {
	date: string;
	brand: number;
	[key: string]: string | number;
};

export type DiagnosticItem = {
	label: string;
	status: "healthy" | "watch" | "risk";
	value: string;
	explanation: string;
};

export type SourceDomainItem = {
	domain: string;
	count: number;
	share: number;
	sourceType: string;
	authority?: number | null;
	mentionsBrand: number;
	mentionsCompetitors: number;
	isOwned: boolean;
	isCompetitor: boolean;
	whyItMatters: string;
};

export type CompetitorPressureItem = {
	name: string;
	mentions: number;
	share: number;
	displacementCount: number;
	topSourceDomains: string[];
	risk: "high" | "medium" | "low";
};

export type PromptOpportunityItem = {
	id: string;
	title: string;
	intent: string;
	priority: number;
	visibility: number;
	position?: number | null;
	competitors: string[];
	status: "defend" | "recover" | "monitor" | "expand";
	reason: string;
};

export type StrategicActionItem = {
	id: string;
	title: string;
	description: string;
	category: string;
	priority: number;
	impact: number;
	confidence: number;
	status: string;
	href: string;
};

export type OverviewAnalytics = {
	periodDays: number;
	brandName: string;
	readinessScore: number;
	readinessLabel: string;
	executiveSummary: string;
	kpis: OverviewKpi[];
	diagnostics: DiagnosticItem[];
	visibilityTrend: VisibilityTrendPoint[];
	marketShare: MarketShareItem[];
	llmComparison: LlmComparisonRow[];
	sentimentTrend: SentimentTrendPoint[];
	mentionContexts: MentionContextItem[];
	competitorShareTrend: {
		competitors: string[];
		data: CompetitorShareTrendPoint[];
	};
	sourceDomains: SourceDomainItem[];
	sourceMix: { label: string; value: number; count: number; color: string }[];
	competitorPressure: CompetitorPressureItem[];
	promptOpportunities: PromptOpportunityItem[];
	strategicActions: StrategicActionItem[];
};

const COLORS = ["#0B4DFF", "#F49527", "#2BA8B7", "#D83BD2", "#7C8CEB"];
const DAY_MS = 24 * 60 * 60 * 1000;

function toNumber(value: unknown, fallback = 0) {
	const number = Number(value);
	return Number.isFinite(number) ? number : fallback;
}

function dayKey(value: string | Date) {
	return new Date(value).toISOString().slice(0, 10);
}

function addDays(date: Date, days: number) {
	return new Date(date.getTime() + days * DAY_MS);
}

function pctDelta(current: number, previous: number) {
	if (!previous) return current ? 100 : 0;
	return ((current - previous) / Math.abs(previous)) * 100;
}

function deltaMeta(current: number, previous: number, decimals = 0) {
	const delta = pctDelta(current, previous);
	const direction = delta > 0.01 ? "up" : delta < -0.01 ? "down" : "flat";
	const prefix = delta > 0 ? "+" : "";
	return {
		deltaLabel: `${prefix}${delta.toFixed(decimals)}%`,
		deltaDirection: direction as "up" | "down" | "flat",
	};
}

function sentimentScore(sentiment: Sentiment) {
	if (sentiment === "positive") return 1;
	if (sentiment === "negative") return -1;
	if (sentiment === "neutral") return 0;
	return 0;
}

function sentimentLabel(score: number) {
	if (score >= 0.35) return "Positive";
	if (score <= -0.25) return "Negative";
	return "Mixed";
}

function average(values: number[]) {
	if (!values.length) return 0;
	return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function dateRange(start: Date, days: number) {
	return Array.from({ length: days }, (_, index) =>
		dayKey(addDays(start, index)),
	);
}

function normalizeCompetitor(name: string) {
	return name.trim() || "Unknown competitor";
}

function normalizeDomain(value?: string | null) {
	if (!value) return "";
	try {
		return new URL(value.includes("://") ? value : `https://${value}`).hostname
			.replace(/^www\./, "")
			.toLowerCase();
	} catch {
		return value.replace(/^www\./, "").toLowerCase();
	}
}

function clamp(value: number, min = 0, max = 100) {
	return Math.min(max, Math.max(min, value));
}

function statusFromThresholds(
	value: number,
	healthy: number,
	watch: number,
	higherIsBetter = true,
): DiagnosticItem["status"] {
	if (higherIsBetter) {
		if (value >= healthy) return "healthy";
		if (value >= watch) return "watch";
		return "risk";
	}
	if (value <= healthy) return "healthy";
	if (value <= watch) return "watch";
	return "risk";
}

function sourceTypeLabel(type?: string | null) {
	const labels: Record<string, string> = {
		client: "Owned",
		competitor: "Competitor",
		directory: "Directory",
		media: "Media",
		blog: "Blog",
		review: "Review",
		comparison: "Comparison",
		official: "Official",
		unknown: "Unknown",
	};
	return labels[type ?? "unknown"] ?? "Unknown";
}

function inferPromptIntent(text: string) {
	const value = text.toLowerCase();
	if (
		value.includes("alternative") ||
		value.includes("alternativa") ||
		value.includes(" vs ") ||
		value.includes("compare") ||
		value.includes("compar")
	) {
		return "Comparison / alternatives";
	}
	if (
		value.includes("price") ||
		value.includes("pricing") ||
		value.includes("cost") ||
		value.includes("precio")
	) {
		return "Price / evaluation";
	}
	if (
		value.includes("best") ||
		value.includes("recommend") ||
		value.includes("mejor") ||
		value.includes("recomienda")
	) {
		return "Recommendation";
	}
	if (
		value.includes("risk") ||
		value.includes("problem") ||
		value.includes("riesgo") ||
		value.includes("problema")
	) {
		return "Risk / objections";
	}
	return "Category awareness";
}

function classifyMentionContext(run: PromptRunRow) {
	if (!run.brand_mentioned) return null;
	if (run.brand_position === 1) return "Primary Recommendation";
	const text =
		`${run.input_text ?? ""} ${run.response_text ?? ""}`.toLowerCase();
	const competitors = run.competitors_mentioned ?? [];
	const comparisonSignals = [
		" vs ",
		"versus",
		"compare",
		"comparison",
		"alternative",
		"alternatives",
		"competitor",
		"competidores",
		"comparar",
		"alternativas",
	];
	if (comparisonSignals.some((signal) => text.includes(signal))) {
		return "Comparison";
	}
	if (competitors.length > 0) return "List Option";
	return "General Mention";
}

function buildDailyRunMap(runs: PromptRunRow[]) {
	const map = new Map<string, PromptRunRow[]>();
	for (const run of runs) {
		const key = dayKey(run.created_at);
		map.set(key, [...(map.get(key) ?? []), run]);
	}
	return map;
}

export async function getOverviewAnalytics(
	workspaceId: string,
	periodDays = 30,
): Promise<OverviewAnalytics> {
	const { supabase } = await requireUser();
	const today = new Date();
	const currentStart = addDays(today, -periodDays + 1);
	const previousStart = addDays(currentStart, -periodDays);
	const since = `${dayKey(previousStart)}T00:00:00.000Z`;

	const [
		runsResult,
		metricsResult,
		sovResult,
		companyResult,
		sourcesResult,
		rankingsResult,
		recommendationsResult,
		competitorsResult,
	] = await Promise.all([
		supabase
			.from("prompt_runs")
			.select("*")
			.eq("workspace_id", workspaceId)
			.gte("created_at", since)
			.order("created_at", { ascending: true }),
		supabase
			.from("workspace_daily_metric_rollup")
			.select("*")
			.eq("workspace_id", workspaceId)
			.gte("metric_date", dayKey(previousStart))
			.order("metric_date", { ascending: true }),
		supabase
			.from("share_of_voice_metrics")
			.select("*")
			.eq("workspace_id", workspaceId)
			.gte("metric_date", dayKey(previousStart))
			.order("metric_date", { ascending: true }),
		supabase
			.from("company_profiles")
			.select("brand_name, website")
			.eq("workspace_id", workspaceId)
			.maybeSingle(),
		supabase
			.from("prompt_run_sources")
			.select("*")
			.eq("workspace_id", workspaceId)
			.gte("created_at", `${dayKey(currentStart)}T00:00:00.000Z`)
			.order("created_at", { ascending: false }),
		supabase
			.from("prompt_rankings")
			.select("*")
			.eq("workspace_id", workspaceId),
		supabase
			.from("recommendations")
			.select("*")
			.eq("workspace_id", workspaceId)
			.in("status", ["pending", "in_progress"])
			.order("priority", { ascending: false })
			.order("impact_score", { ascending: false })
			.limit(6),
		supabase
			.from("competitors")
			.select("name, domain")
			.eq("workspace_id", workspaceId),
	]);

	const runs = ((runsResult.data ?? []) as PromptRunRow[]).filter(
		(run) => run.status === "completed",
	);
	const metrics = (metricsResult.data ?? []) as DailyMetricRow[];
	const sovRows = (sovResult.data ?? []) as ShareOfVoiceRow[];
	const company = companyResult.data as CompanyRow | null;
	const sources = (sourcesResult.data ?? []) as SourceRow[];
	const rankings = (rankingsResult.data ?? []) as PromptRankingRow[];
	const recommendations = (recommendationsResult.data ??
		[]) as RecommendationRow[];
	const competitors = (competitorsResult.data ?? []) as CompetitorRow[];
	const brandName = company?.brand_name ?? "Your brand";
	const brandDomain = normalizeDomain(company?.website);

	const currentRuns = runs.filter(
		(run) => new Date(run.created_at) >= currentStart,
	);
	const previousRuns = runs.filter((run) => {
		const date = new Date(run.created_at);
		return date >= previousStart && date < currentStart;
	});
	const currentMetrics = metrics.filter(
		(metric) => new Date(`${metric.metric_date}T00:00:00.000Z`) >= currentStart,
	);
	const currentSovRows = sovRows.filter(
		(row) => new Date(`${row.metric_date}T00:00:00.000Z`) >= currentStart,
	);
	const previousMetrics = metrics.filter((metric) => {
		const date = new Date(`${metric.metric_date}T00:00:00.000Z`);
		return date >= previousStart && date < currentStart;
	});

	const currentVisibility = currentMetrics.length
		? toNumber(currentMetrics.at(-1)?.visibility_score)
		: average(currentRuns.map((run) => toNumber(run.visibility_score)));
	const previousVisibility = previousMetrics.length
		? toNumber(previousMetrics.at(-1)?.visibility_score)
		: average(previousRuns.map((run) => toNumber(run.visibility_score)));
	const currentPositions = currentRuns
		.map((run) => run.brand_position)
		.filter((value): value is number => typeof value === "number");
	const previousPositions = previousRuns
		.map((run) => run.brand_position)
		.filter((value): value is number => typeof value === "number");
	const avgPosition = average(currentPositions);
	const previousAvgPosition = average(previousPositions);
	const brandMentions = currentRuns.filter((run) => run.brand_mentioned).length;
	const previousBrandMentions = previousRuns.filter(
		(run) => run.brand_mentioned,
	).length;
	const sentiment = average(
		currentRuns.map((run) => sentimentScore(run.sentiment)),
	);
	const previousSentiment = average(
		previousRuns.map((run) => sentimentScore(run.sentiment)),
	);

	const currentDates = dateRange(currentStart, periodDays);
	const previousDates = dateRange(previousStart, periodDays);
	const runsByDay = buildDailyRunMap(currentRuns);
	const metricByDay = new Map(
		metrics.map((metric) => [metric.metric_date, metric]),
	);
	const previousMetricByOffset = new Map(
		previousDates.map((date, index) => [index, metricByDay.get(date)]),
	);

	const visibilityTrend = currentDates.map((date, index) => {
		const dayRuns = runsByDay.get(date) ?? [];
		const positions = dayRuns
			.map((run) => run.brand_position)
			.filter((value): value is number => typeof value === "number");
		const metric = metricByDay.get(date);
		const previousMetric = previousMetricByOffset.get(index);
		return {
			date,
			visibility: metric
				? toNumber(metric.visibility_score)
				: average(dayRuns.map((run) => toNumber(run.visibility_score))),
			avgPosition: positions.length ? average(positions) : null,
			previousVisibility: previousMetric
				? toNumber(previousMetric.visibility_score)
				: null,
		};
	});

	const sentimentTrend = currentDates.map((date) => {
		const dayRuns = runsByDay.get(date) ?? [];
		const positive = dayRuns.filter(
			(run) => run.sentiment === "positive",
		).length;
		const neutral = dayRuns.filter((run) => run.sentiment === "neutral").length;
		const negative = dayRuns.filter(
			(run) => run.sentiment === "negative",
		).length;
		return {
			date,
			score: average(dayRuns.map((run) => sentimentScore(run.sentiment))),
			positive,
			neutral,
			negative,
		};
	});

	const competitorCounts = new Map<string, number>();
	for (const run of currentRuns) {
		for (const competitor of run.competitors_mentioned ?? []) {
			const name = normalizeCompetitor(competitor);
			competitorCounts.set(name, (competitorCounts.get(name) ?? 0) + 1);
		}
	}
	const topCompetitors = [...competitorCounts.entries()]
		.sort((a, b) => b[1] - a[1])
		.slice(0, 4);
	const marketTotal =
		brandMentions + topCompetitors.reduce((sum, [, count]) => sum + count, 0);
	const marketShare: MarketShareItem[] = [
		{
			name: brandName,
			value: marketTotal ? (brandMentions / marketTotal) * 100 : 0,
			count: brandMentions,
			isBrand: true,
			color: COLORS[0],
		},
		...topCompetitors.map(([name, count], index) => ({
			name,
			value: marketTotal ? (count / marketTotal) * 100 : 0,
			count,
			color: COLORS[index + 1] ?? "#bbc7e1",
		})),
	];

	const providerGroups = new Map<string, PromptRunRow[]>();
	for (const run of currentRuns) {
		const key = `${run.provider}|${run.model}`;
		providerGroups.set(key, [...(providerGroups.get(key) ?? []), run]);
	}
	const sovByProvider = new Map<string, number>();
	for (const row of currentSovRows) {
		const key = `${row.provider}|${row.model}`;
		const existing = sovByProvider.get(key);
		const value = toNumber(row.share_of_voice);
		sovByProvider.set(
			key,
			typeof existing === "number" ? average([existing, value]) : value,
		);
	}
	const llmComparison = [...providerGroups.entries()]
		.map(([key, rows]) => {
			const [provider, model] = key.split("|");
			const providerBrandMentions = rows.filter(
				(run) => run.brand_mentioned,
			).length;
			const providerCompetitors = new Map<string, number>();
			for (const run of rows) {
				for (const competitor of run.competitors_mentioned ?? []) {
					const name = normalizeCompetitor(competitor);
					providerCompetitors.set(
						name,
						(providerCompetitors.get(name) ?? 0) + 1,
					);
				}
			}
			const [topCompetitor = "-", topCompetitorCount = 0] =
				[...providerCompetitors.entries()].sort((a, b) => b[1] - a[1])[0] ?? [];
			const competitorMentionTotal = [...providerCompetitors.values()].reduce(
				(sum, value) => sum + value,
				0,
			);
			const positions = rows
				.map((run) => run.brand_position)
				.filter((value): value is number => typeof value === "number");
			const score = average(rows.map((run) => sentimentScore(run.sentiment)));
			return {
				provider: model ? `${provider} · ${model}` : provider,
				visibility: average(rows.map((run) => toNumber(run.visibility_score))),
				sov:
					sovByProvider.get(key) ??
					(providerBrandMentions + competitorMentionTotal
						? (providerBrandMentions /
								(providerBrandMentions + competitorMentionTotal)) *
							100
						: 0),
				avgRank: positions.length ? average(positions) : null,
				topCompetitor,
				topCompetitorShare: rows.length
					? (topCompetitorCount / rows.length) * 100
					: 0,
				sentimentScore: score,
				sentimentLabel: sentimentLabel(score),
			};
		})
		.sort((a, b) => b.visibility - a.visibility);

	const contextCounts = new Map<string, number>([
		["List Option", 0],
		["Comparison", 0],
		["General Mention", 0],
		["Primary Recommendation", 0],
	]);
	for (const run of currentRuns) {
		const context = classifyMentionContext(run);
		if (context)
			contextCounts.set(context, (contextCounts.get(context) ?? 0) + 1);
	}
	const contextTotal = [...contextCounts.values()].reduce(
		(sum, value) => sum + value,
		0,
	);
	const mentionContexts: MentionContextItem[] = [
		{
			label: "List Option",
			color: COLORS[0],
			description: "Brand appears in a list",
		},
		{
			label: "Comparison",
			color: "#D96A00",
			description: "Brand compared with alternatives",
		},
		{
			label: "General Mention",
			color: "#9AA7BA",
			description: "Brand is mentioned generally",
		},
		{
			label: "Primary Recommendation",
			color: "#00B978",
			description: "AI recommends your brand as top choice",
		},
	].map((item) => {
		const count = contextCounts.get(item.label) ?? 0;
		return {
			...item,
			count,
			value: contextTotal ? (count / contextTotal) * 100 : 0,
		};
	});

	const competitorShareTrend = currentDates.map((date) => {
		const dayRuns = runsByDay.get(date) ?? [];
		const point: CompetitorShareTrendPoint = {
			date,
			brand: dayRuns.filter((run) => run.brand_mentioned).length,
		};
		for (const [competitor] of topCompetitors) {
			point[competitor] = dayRuns.filter((run) =>
				(run.competitors_mentioned ?? []).includes(competitor),
			).length;
		}
		return point;
	});

	const sourceDomainMap = new Map<
		string,
		{
			count: number;
			sourceType: string;
			authorityValues: number[];
			mentionsBrand: number;
			mentionsCompetitors: number;
			isOwned: boolean;
			isCompetitor: boolean;
		}
	>();
	for (const source of sources) {
		const domain = normalizeDomain(source.domain);
		if (!domain) continue;
		const competitorDomainMatch = competitors.some(
			(competitor) => normalizeDomain(competitor.domain) === domain,
		);
		const isOwned =
			Boolean(source.is_client_domain) ||
			Boolean(brandDomain && domain === brandDomain);
		const isCompetitor =
			Boolean(source.is_competitor_domain) || competitorDomainMatch;
		const existing = sourceDomainMap.get(domain) ?? {
			count: 0,
			sourceType: sourceTypeLabel(source.source_type),
			authorityValues: [],
			mentionsBrand: 0,
			mentionsCompetitors: 0,
			isOwned,
			isCompetitor,
		};
		existing.count += 1;
		existing.mentionsBrand += source.mentioned_brand ? 1 : 0;
		existing.mentionsCompetitors += source.mentioned_competitors?.length
			? 1
			: 0;
		existing.isOwned = existing.isOwned || isOwned;
		existing.isCompetitor = existing.isCompetitor || isCompetitor;
		const authority = toNumber(source.authority_score, Number.NaN);
		if (Number.isFinite(authority)) existing.authorityValues.push(authority);
		sourceDomainMap.set(domain, existing);
	}
	const totalSourceCitations = [...sourceDomainMap.values()].reduce(
		(sum, item) => sum + item.count,
		0,
	);
	const sourceDomains: SourceDomainItem[] = [...sourceDomainMap.entries()]
		.map(([domain, item]) => {
			const mentionsCompetitorsOnly =
				item.mentionsCompetitors > 0 && item.mentionsBrand === 0;
			return {
				domain,
				count: item.count,
				share: totalSourceCitations
					? (item.count / totalSourceCitations) * 100
					: 0,
				sourceType: item.sourceType,
				authority: item.authorityValues.length
					? average(item.authorityValues)
					: null,
				mentionsBrand: item.mentionsBrand,
				mentionsCompetitors: item.mentionsCompetitors,
				isOwned: item.isOwned,
				isCompetitor: item.isCompetitor,
				whyItMatters: mentionsCompetitorsOnly
					? "Competitors are present here but your brand is missing."
					: item.isOwned
						? "Owned source cited by LLMs."
						: "External source influencing AI answers.",
			};
		})
		.sort((a, b) => b.count - a.count)
		.slice(0, 8);
	const sourceMixCounts = {
		owned: sources.filter((source) => {
			const domain = normalizeDomain(source.domain);
			return (
				source.is_client_domain ||
				Boolean(brandDomain && domain === brandDomain)
			);
		}).length,
		competitor: sources.filter((source) => source.is_competitor_domain).length,
		earned: sources.filter(
			(source) => !source.is_client_domain && !source.is_competitor_domain,
		).length,
	};
	const sourceMixTotal =
		sourceMixCounts.owned + sourceMixCounts.competitor + sourceMixCounts.earned;
	const sourceMix = [
		{ label: "Owned", count: sourceMixCounts.owned, color: "#0B4DFF" },
		{
			label: "Competitor",
			count: sourceMixCounts.competitor,
			color: "#ffb4ab",
		},
		{
			label: "Earned / external",
			count: sourceMixCounts.earned,
			color: "#F49527",
		},
	].map((item) => ({
		...item,
		value: sourceMixTotal ? (item.count / sourceMixTotal) * 100 : 0,
	}));

	const sourceDomainsByCompetitor = new Map<string, Map<string, number>>();
	for (const source of sources) {
		const domain = normalizeDomain(source.domain);
		for (const competitor of source.mentioned_competitors ?? []) {
			const name = normalizeCompetitor(competitor);
			const map =
				sourceDomainsByCompetitor.get(name) ?? new Map<string, number>();
			map.set(domain, (map.get(domain) ?? 0) + 1);
			sourceDomainsByCompetitor.set(name, map);
		}
	}
	const competitorPressure: CompetitorPressureItem[] = topCompetitors.map(
		([name, mentions]) => {
			const displacementCount = currentRuns.filter(
				(run) =>
					(run.competitors_mentioned ?? []).includes(name) &&
					(!run.brand_mentioned ||
						(typeof run.first_competitor_position === "number" &&
							typeof run.brand_position === "number" &&
							run.first_competitor_position < run.brand_position)),
			).length;
			const topSourceDomains = [
				...(sourceDomainsByCompetitor.get(name)?.entries() ?? []),
			]
				.sort((a, b) => b[1] - a[1])
				.slice(0, 3)
				.map(([domain]) => domain);
			const share = currentRuns.length
				? (mentions / currentRuns.length) * 100
				: 0;
			return {
				name,
				mentions,
				share,
				displacementCount,
				topSourceDomains,
				risk:
					displacementCount >= 5 || share >= 35
						? "high"
						: displacementCount >= 2 || share >= 15
							? "medium"
							: "low",
			};
		},
	);

	const promptOpportunities: PromptOpportunityItem[] = rankings
		.map((prompt) => {
			const visibility = toNumber(prompt.visibility_score);
			const competitorsMentioned = prompt.competitors_mentioned ?? [];
			const status: PromptOpportunityItem["status"] =
				prompt.brand_mentioned && visibility >= 60
					? "defend"
					: !prompt.brand_mentioned && competitorsMentioned.length
						? "recover"
						: visibility < 40
							? "expand"
							: "monitor";
			const reason =
				status === "recover"
					? "Competitors appear but the brand is absent."
					: status === "defend"
						? "Strong prompt: protect position and sources."
						: status === "expand"
							? "Low visibility in a potentially useful theme."
							: "Track this prompt for stability.";
			return {
				id: prompt.prompt_id,
				title: prompt.title,
				intent: inferPromptIntent(`${prompt.title} ${prompt.body}`),
				priority: prompt.priority,
				visibility,
				position: prompt.brand_position ?? null,
				competitors: competitorsMentioned.slice(0, 3),
				status,
				reason,
			};
		})
		.sort((a, b) => {
			const statusWeight = { recover: 4, expand: 3, defend: 2, monitor: 1 };
			return (
				statusWeight[b.status] - statusWeight[a.status] ||
				b.priority - a.priority ||
				a.visibility - b.visibility
			);
		})
		.slice(0, 8);

	const strategicActions: StrategicActionItem[] = recommendations
		.map((recommendation) => ({
			id: recommendation.id,
			title: recommendation.title,
			description: recommendation.description,
			category: recommendation.category,
			priority: recommendation.priority,
			impact: toNumber(recommendation.impact_score),
			confidence: toNumber(recommendation.confidence_score),
			status: recommendation.status,
			href: "#recommended-actions",
		}))
		.sort(
			(a, b) =>
				b.priority - a.priority ||
				b.impact - a.impact ||
				b.confidence - a.confidence,
		)
		.slice(0, 4);

	const visibilityDelta = deltaMeta(currentVisibility, previousVisibility, 0);
	const positionDelta = deltaMeta(avgPosition, previousAvgPosition, 0);
	const mentionDelta = deltaMeta(brandMentions, previousBrandMentions, 0);
	const sentimentDelta = sentiment - previousSentiment;
	const brandSov = marketShare.find((item) => item.isBrand)?.value ?? 0;
	const uniqueSourceCount = sourceDomainMap.size;
	const ownedSourceShare =
		sourceMix.find((item) => item.label === "Owned")?.value ?? 0;
	const bestCompetitorShare = topCompetitors.length
		? (topCompetitors[0][1] / Math.max(1, currentRuns.length)) * 100
		: 0;
	const readinessScore = Math.round(
		clamp(currentVisibility) * 0.24 +
			clamp(brandSov) * 0.2 +
			clamp(
				avgPosition && Number.isFinite(avgPosition) && avgPosition > 0
					? 100 - (avgPosition - 1) * 16
					: 0,
			) *
				0.18 +
			clamp((sentiment + 1) * 50) * 0.16 +
			clamp(uniqueSourceCount * 7) * 0.12 +
			clamp(100 - bestCompetitorShare) * 0.1,
	);
	const readinessLabel =
		readinessScore >= 75
			? "Strong"
			: readinessScore >= 55
				? "Improving"
				: readinessScore >= 35
					? "At risk"
					: "Early stage";
	const diagnostics: DiagnosticItem[] = [
		{
			label: "Presence",
			status: statusFromThresholds(currentVisibility, 65, 35),
			value: `${currentVisibility.toFixed(1)}%`,
			explanation: "How often the brand appears in relevant AI answers.",
		},
		{
			label: "Recommendation rank",
			status: avgPosition
				? statusFromThresholds(avgPosition, 2.5, 4.5, false)
				: "risk",
			value: avgPosition ? `#${avgPosition.toFixed(1)}` : "No data",
			explanation: "Whether the brand is listed early enough to be chosen.",
		},
		{
			label: "Competitive pressure",
			status: statusFromThresholds(bestCompetitorShare, 15, 35, false),
			value: `${bestCompetitorShare.toFixed(1)}%`,
			explanation: "How often the strongest competitor appears in the period.",
		},
		{
			label: "Source authority",
			status: statusFromThresholds(uniqueSourceCount, 10, 4),
			value: `${uniqueSourceCount} domains`,
			explanation: "Number of unique domains shaping model answers.",
		},
		{
			label: "Owned source control",
			status: statusFromThresholds(ownedSourceShare, 25, 10),
			value: `${ownedSourceShare.toFixed(1)}%`,
			explanation: "Share of citations coming from client-controlled sources.",
		},
		{
			label: "Brand perception",
			status: sentiment >= 0.35 ? "healthy" : sentiment >= 0 ? "watch" : "risk",
			value: sentimentLabel(sentiment),
			explanation: "Tone used by LLMs when they mention the brand.",
		},
	];
	const executiveSummary = `${brandName} has ${currentVisibility.toFixed(
		1,
	)}% AI visibility, ${brandSov.toFixed(
		1,
	)}% share of voice and an average position of ${
		avgPosition ? `#${avgPosition.toFixed(1)}` : "not enough data"
	}. Main opportunity: ${
		promptOpportunities.find((item) => item.status === "recover")?.title ??
		sourceDomains.find((item) => item.mentionsCompetitors > item.mentionsBrand)
			?.domain ??
		"build more consistent source coverage"
	}.`;

	return {
		periodDays,
		brandName,
		readinessScore,
		readinessLabel,
		executiveSummary,
		kpis: [
			{
				key: "visibility",
				label: "Visibility",
				value: `${currentVisibility.toFixed(1)}%`,
				subtitle: "Last 30 days",
				positiveDirection: "up",
				sparkline: visibilityTrend.map((point) => ({
					date: point.date,
					value: point.visibility,
				})),
				...visibilityDelta,
			},
			{
				key: "avgPosition",
				label: "Avg Position",
				value: avgPosition ? `#${avgPosition.toFixed(1)}` : "-",
				subtitle: avgPosition ? "Last 30 days" : "Not enough position data",
				positiveDirection: "down",
				sparkline: visibilityTrend.map((point) => ({
					date: point.date,
					value: point.avgPosition ?? 0,
				})),
				...positionDelta,
			},
			{
				key: "brandMentions",
				label: "Brand Mentions",
				value: String(brandMentions),
				subtitle: "Last 30 days",
				positiveDirection: "up",
				sparkline: currentDates.map((date) => ({
					date,
					value: (runsByDay.get(date) ?? []).filter(
						(run) => run.brand_mentioned,
					).length,
				})),
				...mentionDelta,
			},
			{
				key: "sentiment",
				label: "Sentiment",
				value: sentimentLabel(sentiment),
				subtitle: "Last 30 days",
				positiveDirection: "up",
				deltaLabel: `${sentimentDelta >= 0 ? "+" : ""}${sentimentDelta.toFixed(2)}`,
				deltaDirection:
					sentimentDelta > 0.01
						? "up"
						: sentimentDelta < -0.01
							? "down"
							: "flat",
				sparkline: sentimentTrend.map((point) => ({
					date: point.date,
					value: point.score,
				})),
			},
			{
				key: "shareOfVoice",
				label: "Share of Voice",
				value: `${brandSov.toFixed(1)}%`,
				subtitle: "Brand vs detected competitors",
				positiveDirection: "up",
				deltaLabel: marketShare.length > 1 ? "vs market" : "no rivals",
				deltaDirection: "flat",
				sparkline: visibilityTrend.map((point) => ({
					date: point.date,
					value: point.visibility,
				})),
			},
			{
				key: "sources",
				label: "Cited Sources",
				value: String(uniqueSourceCount),
				subtitle: `${ownedSourceShare.toFixed(0)}% owned citations`,
				positiveDirection: "up",
				deltaLabel: `${sources.length} citations`,
				deltaDirection: "flat",
				sparkline: currentDates.map((date) => ({
					date,
					value: sources.filter((source) => dayKey(source.created_at) === date)
						.length,
				})),
			},
		],
		diagnostics,
		visibilityTrend,
		marketShare,
		llmComparison,
		sentimentTrend,
		mentionContexts,
		competitorShareTrend: {
			competitors: topCompetitors.map(([name]) => name),
			data: competitorShareTrend,
		},
		sourceDomains,
		sourceMix,
		competitorPressure,
		promptOpportunities,
		strategicActions,
	};
}
