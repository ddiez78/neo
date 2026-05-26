"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
	buildCompanyBioContext,
	scoreCompanyUnderstanding,
} from "@/lib/company-bio/context";
import { getWorkspaceOverview, requireUser } from "@/lib/data/workspace";
import type { Recommendation } from "@/types";

const defaultBranding = {
	agency_name: "",
	client_name: "",
	logo_url: "",
	logo_path: "",
	primary_color: "#00685f",
	accent_color: "#0d9488",
	footer_note: "",
};

function dateOnly(date: Date) {
	return date.toISOString().slice(0, 10);
}

function monthStart(date: Date) {
	return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1));
}

function monthEnd(date: Date) {
	return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + 1, 0));
}

function previousMonthStart(date: Date) {
	return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() - 1, 1));
}

function previousMonthEnd(date: Date) {
	return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 0));
}

function numberValue(value: unknown) {
	const number = Number(value ?? 0);
	return Number.isFinite(number) ? number : 0;
}

function average(values: number[]) {
	if (values.length === 0) return 0;
	return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function delta(current: number, previous: number) {
	return {
		current,
		previous,
		absolute: Number((current - previous).toFixed(2)),
		relative:
			previous === 0
				? null
				: Number((((current - previous) / previous) * 100).toFixed(2)),
	};
}

function isInRange(
	date: string | null | undefined,
	start: string,
	end: string,
) {
	if (!date) return false;
	const value = date.slice(0, 10);
	return value >= start && value <= end;
}

function actionItemsFromEvidence(evidence: Record<string, unknown>) {
	const actionItems = evidence.actionItems;
	return Array.isArray(actionItems)
		? actionItems.map(String).filter(Boolean).slice(0, 5)
		: [];
}

function ragSourcesFromEvidence(evidence: Record<string, unknown>) {
	const ragSources = evidence.ragSources;
	return Array.isArray(ragSources)
		? ragSources.map(String).filter(Boolean).slice(0, 5)
		: [];
}

function groupRecommendation(recommendation: Recommendation) {
	if (
		recommendation.category === "sentiment" ||
		recommendation.priority >= 5 ||
		Number(recommendation.impact_score) >= 85
	) {
		return "Risks to address";
	}
	if (
		Number(recommendation.confidence_score) >= 75 &&
		recommendation.priority <= 3
	) {
		return "Quick wins";
	}
	return "Strategic priorities";
}

function sanitizeHexColor(value: FormDataEntryValue | null, fallback: string) {
	const color = String(value ?? "").trim();
	return /^#[0-9a-fA-F]{6}$/.test(color) ? color : fallback;
}

export async function updateReportBrandingAction(
	workspaceId: string,
	workspaceSlug: string,
	formData: FormData,
) {
	const { supabase } = await requireUser();
	const payload = {
		workspace_id: workspaceId,
		agency_name: String(formData.get("agency_name") ?? "").trim(),
		client_name: String(formData.get("client_name") ?? "").trim(),
		primary_color: sanitizeHexColor(
			formData.get("primary_color"),
			defaultBranding.primary_color,
		),
		accent_color: sanitizeHexColor(
			formData.get("accent_color"),
			defaultBranding.accent_color,
		),
		footer_note: String(formData.get("footer_note") ?? "").trim(),
		updated_at: new Date().toISOString(),
	};

	const { error } = await supabase
		.from("report_branding")
		.upsert(payload, { onConflict: "workspace_id" });

	if (error) {
		redirect(
			`/${workspaceSlug}/reports?error=${encodeURIComponent(error.message)}`,
		);
	}

	revalidatePath(`/${workspaceSlug}/reports`);
	redirect(`/${workspaceSlug}/reports?branding=1`);
}

export async function uploadReportLogoAction(
	workspaceId: string,
	workspaceSlug: string,
	formData: FormData,
) {
	const { supabase } = await requireUser();
	const file = formData.get("logo");

	if (!(file instanceof File) || file.size === 0) {
		redirect(
			`/${workspaceSlug}/reports?error=${encodeURIComponent("Logo file is required.")}`,
		);
	}

	if (!file.type.startsWith("image/")) {
		redirect(
			`/${workspaceSlug}/reports?error=${encodeURIComponent("Logo must be an image file.")}`,
		);
	}

	const extension = file.name.split(".").pop()?.toLowerCase() ?? "png";
	const logoPath = `${workspaceId}/logo-${Date.now()}.${extension}`;
	const { error: uploadError } = await supabase.storage
		.from("report-assets")
		.upload(logoPath, file, {
			contentType: file.type,
			upsert: true,
		});

	if (uploadError) {
		redirect(
			`/${workspaceSlug}/reports?error=${encodeURIComponent(uploadError.message)}`,
		);
	}

	const { data } = supabase.storage
		.from("report-assets")
		.getPublicUrl(logoPath);
	const { error } = await supabase.from("report_branding").upsert(
		{
			workspace_id: workspaceId,
			logo_path: logoPath,
			logo_url: data.publicUrl,
			updated_at: new Date().toISOString(),
		},
		{ onConflict: "workspace_id" },
	);

	if (error) {
		redirect(
			`/${workspaceSlug}/reports?error=${encodeURIComponent(error.message)}`,
		);
	}

	revalidatePath(`/${workspaceSlug}/reports`);
	redirect(`/${workspaceSlug}/reports?logo=1`);
}

export async function generateMonthlyReportAction(
	workspaceId: string,
	workspaceSlug: string,
	returnPath: string,
) {
	const { supabase } = await requireUser();
	const overview = await getWorkspaceOverview(workspaceId);
	const now = new Date();
	const periodStart = dateOnly(monthStart(now));
	const periodEnd = dateOnly(monthEnd(now));
	const previousPeriodStart = dateOnly(previousMonthStart(now));
	const previousPeriodEnd = dateOnly(previousMonthEnd(now));

	const [recommendationsResult, allMetricsResult, allSovResult] =
		await Promise.all([
			supabase
				.from("recommendations")
				.select("*")
				.eq("workspace_id", workspaceId)
				.in("status", ["pending", "in_progress"])
				.order("priority", { ascending: false })
				.order("impact_score", { ascending: false })
				.limit(12),
			supabase
				.from("daily_metrics")
				.select("*")
				.eq("workspace_id", workspaceId)
				.gte("metric_date", previousPeriodStart)
				.lte("metric_date", periodEnd)
				.order("metric_date", { ascending: true }),
			supabase
				.from("share_of_voice_metrics")
				.select("*")
				.eq("workspace_id", workspaceId)
				.gte("metric_date", previousPeriodStart)
				.lte("metric_date", periodEnd)
				.order("metric_date", { ascending: true }),
		]);

	if (
		recommendationsResult.error ||
		allMetricsResult.error ||
		allSovResult.error
	) {
		const message =
			recommendationsResult.error?.message ??
			allMetricsResult.error?.message ??
			allSovResult.error?.message ??
			"Report data query failed.";
		redirect(`/${workspaceSlug}/reports?error=${encodeURIComponent(message)}`);
	}

	const metricsRows = allMetricsResult.data ?? [];
	const sovRows = allSovResult.data ?? [];
	const currentMetrics = metricsRows.filter((metric) =>
		isInRange(metric.metric_date, periodStart, periodEnd),
	);
	const previousMetrics = metricsRows.filter((metric) =>
		isInRange(metric.metric_date, previousPeriodStart, previousPeriodEnd),
	);
	const currentSov = sovRows.filter((metric) =>
		isInRange(metric.metric_date, periodStart, periodEnd),
	);
	const previousSov = sovRows.filter((metric) =>
		isInRange(metric.metric_date, previousPeriodStart, previousPeriodEnd),
	);
	const completedRuns = overview.runs.filter(
		(run) => run.status === "completed",
	);
	const currentVisibility =
		average(
			currentMetrics.map((metric) => numberValue(metric.visibility_score)),
		) || numberValue(overview.metrics.at(-1)?.visibility_score);
	const previousVisibility = average(
		previousMetrics.map((metric) => numberValue(metric.visibility_score)),
	);
	const currentShareOfVoice =
		average(currentSov.map((metric) => numberValue(metric.share_of_voice))) ||
		numberValue(overview.shareOfVoice.at(-1)?.share_of_voice);
	const previousShareOfVoice = average(
		previousSov.map((metric) => numberValue(metric.share_of_voice)),
	);
	const wonPrompts = overview.rankings.filter(
		(ranking) =>
			ranking.brand_mentioned && numberValue(ranking.visibility_score) >= 60,
	).length;
	const lostPrompts = overview.rankings.filter(
		(ranking) =>
			!ranking.brand_mentioned || numberValue(ranking.visibility_score) < 30,
	).length;
	const openTasks = overview.tasks.filter(
		(task) => task.status !== "done" && task.status !== "dismissed",
	).length;
	const sourceDomains = new Map<string, number>();

	for (const source of overview.sources) {
		sourceDomains.set(
			source.domain,
			(sourceDomains.get(source.domain) ?? 0) + 1,
		);
	}

	const sourceRankings = [...sourceDomains.entries()]
		.sort((a, b) => b[1] - a[1])
		.slice(0, 10)
		.map(([domain, count]) => ({ domain, count }));
	const sentiment = {
		positive: currentMetrics.reduce(
			(sum, metric) => sum + numberValue(metric.positive_mentions),
			0,
		),
		neutral: currentMetrics.reduce(
			(sum, metric) => sum + numberValue(metric.neutral_mentions),
			0,
		),
		negative: currentMetrics.reduce(
			(sum, metric) => sum + numberValue(metric.negative_mentions),
			0,
		),
	};
	const previousSentimentTotal = previousMetrics.reduce(
		(sum, metric) =>
			sum +
			numberValue(metric.positive_mentions) +
			numberValue(metric.neutral_mentions) +
			numberValue(metric.negative_mentions),
		0,
	);
	const currentMentions = currentMetrics.reduce(
		(sum, metric) => sum + numberValue(metric.mention_count),
		0,
	);
	const previousMentions = previousMetrics.reduce(
		(sum, metric) => sum + numberValue(metric.mention_count),
		0,
	);
	const currentSources = currentMetrics.reduce(
		(sum, metric) => sum + numberValue(metric.source_count),
		0,
	);
	const previousSources = previousMetrics.reduce(
		(sum, metric) => sum + numberValue(metric.source_count),
		0,
	);
	const topPrompts = overview.rankings
		.slice()
		.sort(
			(a, b) =>
				numberValue(b.visibility_score) - numberValue(a.visibility_score),
		)
		.slice(0, 8)
		.map((ranking) => ({
			title: ranking.title,
			visibility_score: ranking.visibility_score ?? 0,
			brand_mentioned: ranking.brand_mentioned ?? false,
			sentiment: ranking.sentiment ?? "no_data",
			provider: ranking.provider,
			model: ranking.model,
			source_count: ranking.source_count ?? 0,
		}));
	const risks = overview.rankings
		.filter(
			(ranking) =>
				!ranking.brand_mentioned || numberValue(ranking.visibility_score) < 50,
		)
		.slice(0, 6)
		.map((ranking) => ({
			prompt: ranking.title,
			reason: ranking.brand_mentioned
				? "Low visibility score"
				: "Brand not mentioned",
			visibility_score: ranking.visibility_score ?? 0,
		}));
	const recommendations = (
		(recommendationsResult.data ?? []) as Recommendation[]
	).map((recommendation) => ({
		title: recommendation.title,
		description: recommendation.description,
		category: recommendation.category,
		priority: recommendation.priority,
		status: recommendation.status,
		impact_score: Number(recommendation.impact_score),
		confidence_score: Number(recommendation.confidence_score),
		group: groupRecommendation(recommendation),
		action_items: actionItemsFromEvidence(recommendation.evidence),
		rag_sources: ragSourcesFromEvidence(recommendation.evidence),
	}));
	const recommendedActions = recommendations
		.slice(0, 8)
		.map((recommendation) => ({
			label: recommendation.title,
			type: recommendation.category,
			priority: recommendation.priority,
			status: recommendation.status,
			group: recommendation.group,
		}));
	const branding = {
		...defaultBranding,
		...(overview.reportBranding ?? {}),
		agency_name:
			overview.reportBranding?.agency_name || "Agency visibility team",
		client_name:
			overview.reportBranding?.client_name ||
			overview.company?.brand_name ||
			overview.reports.at(0)?.title ||
			"Client",
	};
	const entityUnderstanding = scoreCompanyUnderstanding({
		company: overview.company,
		runs: overview.runs,
		rankings: overview.rankings,
	});
	const companyBioContext = buildCompanyBioContext(overview.company);
	const entityState = {
		score: entityUnderstanding.score,
		status: entityUnderstanding.status,
		completeness: entityUnderstanding.completeness,
		verifiedCount: entityUnderstanding.verifiedCount,
		totalVerificationFields: entityUnderstanding.totalVerificationFields,
		verifiedFacts: companyBioContext.verifiedFacts.slice(0, 8),
		misunderstoodFacts: entityUnderstanding.misunderstoodFacts,
		entityGaps: entityUnderstanding.entityGaps,
		nextAction: entityUnderstanding.nextAction,
	};
	const kpiSummary = {
		visibility: delta(Number(currentVisibility.toFixed(2)), previousVisibility),
		share_of_voice: delta(
			Number(currentShareOfVoice.toFixed(2)),
			previousShareOfVoice,
		),
		mentions: delta(currentMentions, previousMentions),
		sources: delta(currentSources, previousSources),
		sentiment_total: delta(
			sentiment.positive + sentiment.neutral + sentiment.negative,
			previousSentimentTotal,
		),
	};
	const charts = {
		visibility_trend: currentMetrics.map((metric) => ({
			date: metric.metric_date,
			visibility: numberValue(metric.visibility_score),
			mentions: numberValue(metric.mention_count),
		})),
		sov_trend: currentSov.map((metric) => ({
			date: metric.metric_date,
			provider: metric.provider,
			model: metric.model,
			share_of_voice: numberValue(metric.share_of_voice),
		})),
		sentiment: [
			{ name: "Positive", value: sentiment.positive },
			{ name: "Neutral", value: sentiment.neutral },
			{ name: "Negative", value: sentiment.negative },
		],
		prompt_outcomes: [
			{ name: "Won", value: wonPrompts },
			{ name: "Lost", value: lostPrompts },
		],
		source_rankings: sourceRankings,
	};
	const metrics = {
		visibility_score: Number(currentVisibility.toFixed(2)),
		share_of_voice: Number(currentShareOfVoice.toFixed(2)),
		total_runs:
			currentMetrics.reduce(
				(sum, metric) => sum + numberValue(metric.total_runs),
				0,
			) || completedRuns.length,
		brand_mentions: currentMentions,
		source_count: currentSources || overview.sources.length,
		source_diversity: sourceRankings.length,
		total_cost: currentMetrics.reduce(
			(sum, metric) => sum + numberValue(metric.total_cost),
			0,
		),
		prompts_tracked: overview.prompts.length,
		competitors_tracked: overview.competitors.length,
		won_prompts: wonPrompts,
		lost_prompts: lostPrompts,
		open_tasks: openTasks,
		positive_mentions: sentiment.positive,
		neutral_mentions: sentiment.neutral,
		negative_mentions: sentiment.negative,
		has_previous_period: previousMetrics.length > 0 || previousSov.length > 0,
	};
	const reportPayload = {
		workspace_id: workspaceId,
		report_month: periodStart,
		period_start: periodStart,
		period_end: periodEnd,
		previous_period_start: previousPeriodStart,
		previous_period_end: previousPeriodEnd,
		title: `${branding.client_name} GEO performance report`,
		executive_summary: metrics.has_previous_period
			? `GEO visibility reached ${metrics.visibility_score.toFixed(0)}% with ${metrics.share_of_voice.toFixed(0)}% share of voice. The report highlights trend movement, source coverage, prompt performance, and the next recommended actions.`
			: `GEO visibility snapshot generated for ${branding.client_name}. Not enough historical data yet for a complete month-over-month comparison, but current KPIs and recommendations are ready for client review.`,
		visibility_score: metrics.visibility_score,
		share_of_voice: metrics.share_of_voice,
		metrics,
		charts,
		kpi_summary: kpiSummary,
		top_prompts: topPrompts,
		competitors: overview.competitors.map((competitor) => ({
			name: competitor.name,
			domain: competitor.domain,
			aliases: competitor.aliases,
		})),
		risks,
		recommended_actions: recommendedActions,
		recommendations,
		entity_state: entityState,
		branding_snapshot: branding,
		updated_at: new Date().toISOString(),
	};

	const { data: report, error } = await supabase
		.from("monthly_reports")
		.upsert(reportPayload, { onConflict: "workspace_id,report_month" })
		.select("*")
		.single();

	if (error || !report) {
		redirect(
			`/${workspaceSlug}/reports?error=${encodeURIComponent(error?.message ?? "Report generation failed")}`,
		);
	}

	await supabase.from("report_sections").delete().eq("report_id", report.id);
	await supabase.from("report_sections").insert([
		{
			report_id: report.id,
			section_key: "executive_summary",
			title: "Executive summary",
			content: report.executive_summary,
			sort_order: 1,
		},
		{
			report_id: report.id,
			section_key: "entity_state",
			title: "Estado de Entidad",
			content: [
				`Score: ${entityState.score}/100`,
				`Estado: ${entityState.status}`,
				`Siguiente accion: ${entityState.nextAction}`,
			].join("\n"),
			sort_order: 2,
		},
		{
			report_id: report.id,
			section_key: "recommended_actions",
			title: "Recommended actions",
			content: recommendations
				.map(
					(recommendation) =>
						`${recommendation.group}: ${recommendation.title}`,
				)
				.join("\n"),
			sort_order: 3,
		},
	]);

	revalidatePath(`/${workspaceSlug}/reports`);
	revalidatePath(returnPath);
	redirect(returnPath);
}
