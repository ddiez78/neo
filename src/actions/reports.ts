"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getWorkspaceOverview, requireUser } from "@/lib/data/workspace";

export async function generateMonthlyReportAction(
	workspaceId: string,
	workspaceSlug: string,
) {
	const { supabase } = await requireUser();
	const overview = await getWorkspaceOverview(workspaceId);
	const now = new Date();
	const reportMonth = new Date(
		Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1),
	)
		.toISOString()
		.slice(0, 10);
	const latestMetric = overview.metrics.at(-1);
	const latestSov = overview.shareOfVoice.at(-1);
	const completedRuns = overview.runs.filter(
		(run) => run.status === "completed",
	);
	const wonPrompts = overview.rankings.filter(
		(ranking) =>
			ranking.brand_mentioned && Number(ranking.visibility_score ?? 0) >= 60,
	).length;
	const lostPrompts = overview.rankings.filter(
		(ranking) =>
			!ranking.brand_mentioned || Number(ranking.visibility_score ?? 0) < 30,
	).length;
	const openTasks = overview.tasks.filter(
		(task) => task.status !== "done" && task.status !== "dismissed",
	).length;
	const metrics = {
		visibility_score: Number(latestMetric?.visibility_score ?? 0),
		share_of_voice: Number(latestSov?.share_of_voice ?? 0),
		total_runs: Number(latestMetric?.total_runs ?? completedRuns.length),
		brand_mentions: Number(latestMetric?.mention_count ?? 0),
		source_count: Number(latestMetric?.source_count ?? 0),
		total_cost: Number(latestMetric?.total_cost ?? 0),
		prompts_tracked: overview.prompts.length,
		competitors_tracked: overview.competitors.length,
		won_prompts: wonPrompts,
		lost_prompts: lostPrompts,
		open_tasks: openTasks,
		positive_mentions: Number(latestMetric?.positive_mentions ?? 0),
		neutral_mentions: Number(latestMetric?.neutral_mentions ?? 0),
		negative_mentions: Number(latestMetric?.negative_mentions ?? 0),
	};
	const topPrompts = overview.rankings.slice(0, 5).map((ranking) => ({
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
				!ranking.brand_mentioned || Number(ranking.visibility_score ?? 0) < 50,
		)
		.slice(0, 5)
		.map((ranking) => ({
			prompt: ranking.title,
			reason: ranking.brand_mentioned
				? "Low visibility score"
				: "Brand not mentioned",
		}));
	const recommendedActions = overview.tasks
		.filter((task) => task.status !== "done")
		.slice(0, 8)
		.map((task) => ({
			label: task.label,
			type: task.type,
			priority: task.priority,
			status: task.status,
		}));

	const reportPayload = {
		workspace_id: workspaceId,
		report_month: reportMonth,
		title: `${overview.company?.brand_name ?? "GEO"} monthly AI visibility report`,
		executive_summary:
			"AI visibility summary generated from monitored prompts, competitors, sources, and open recommendation tasks.",
		visibility_score: metrics.visibility_score,
		share_of_voice: metrics.share_of_voice,
		metrics,
		top_prompts: topPrompts,
		competitors: overview.competitors.map((competitor) => ({
			name: competitor.name,
			domain: competitor.domain,
		})),
		risks,
		recommended_actions: recommendedActions,
		updated_at: new Date().toISOString(),
	};

	let { data: report, error } = await supabase
		.from("monthly_reports")
		.upsert(reportPayload, { onConflict: "workspace_id,report_month" })
		.select("*")
		.single();

	if (error?.message.includes("metrics")) {
		const { metrics: _metrics, ...fallbackPayload } = reportPayload;
		const retry = await supabase
			.from("monthly_reports")
			.upsert(fallbackPayload, { onConflict: "workspace_id,report_month" })
			.select("*")
			.single();
		report = retry.data;
		error = retry.error;
	}

	if (error || !report) {
		redirect(
			`/${workspaceSlug}/reports?error=${encodeURIComponent(error?.message ?? "Report generation failed")}`,
		);
	}

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
			section_key: "recommended_actions",
			title: "Recommended actions",
			content: recommendedActions.map((action) => action.label).join("\n"),
			sort_order: 2,
		},
	]);

	revalidatePath(`/${workspaceSlug}/reports`);
	redirect(`/${workspaceSlug}/reports?generated=1`);
}
