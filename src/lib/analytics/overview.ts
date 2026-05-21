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

type CompanyRow = { brand_name?: string | null };

export type OverviewKpi = {
	key: "visibility" | "avgPosition" | "brandMentions" | "sentiment";
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

export type OverviewAnalytics = {
	periodDays: number;
	brandName: string;
	kpis: OverviewKpi[];
	visibilityTrend: VisibilityTrendPoint[];
	marketShare: MarketShareItem[];
	llmComparison: LlmComparisonRow[];
	sentimentTrend: SentimentTrendPoint[];
	mentionContexts: MentionContextItem[];
	competitorShareTrend: {
		competitors: string[];
		data: CompetitorShareTrendPoint[];
	};
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

	const [runsResult, metricsResult, sovResult, companyResult] =
		await Promise.all([
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
				.select("brand_name")
				.eq("workspace_id", workspaceId)
				.maybeSingle(),
		]);

	const runs = ((runsResult.data ?? []) as PromptRunRow[]).filter(
		(run) => run.status === "completed",
	);
	const metrics = (metricsResult.data ?? []) as DailyMetricRow[];
	const sovRows = (sovResult.data ?? []) as ShareOfVoiceRow[];
	const company = companyResult.data as CompanyRow | null;
	const brandName = company?.brand_name ?? "Your brand";

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

	const visibilityDelta = deltaMeta(currentVisibility, previousVisibility, 0);
	const positionDelta = deltaMeta(avgPosition, previousAvgPosition, 0);
	const mentionDelta = deltaMeta(brandMentions, previousBrandMentions, 0);
	const sentimentDelta = sentiment - previousSentiment;

	return {
		periodDays,
		brandName,
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
		],
		visibilityTrend,
		marketShare,
		llmComparison,
		sentimentTrend,
		mentionContexts,
		competitorShareTrend: {
			competitors: topCompetitors.map(([name]) => name),
			data: competitorShareTrend,
		},
	};
}
