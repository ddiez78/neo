import { inngest } from "@/inngest/client";
import { createAdminClient } from "@/lib/supabase/admin";

export const aggregateDailyMetrics = inngest.createFunction(
	{ id: "aggregate-daily-metrics", triggers: [{ cron: "15 0 * * *" }] },
	async () => {
		const supabase = createAdminClient();
		const metricDate = new Date().toISOString().slice(0, 10);
		const { data: workspaces } = await supabase.from("workspaces").select("id");

		for (const workspace of workspaces ?? []) {
			const { data: runs } = await supabase
				.from("prompt_runs")
				.select("*")
				.eq("workspace_id", workspace.id)
				.gte("created_at", `${metricDate}T00:00:00.000Z`)
				.lt("created_at", `${metricDate}T23:59:59.999Z`);

			const completed = (runs ?? []).filter(
				(run) => run.status === "completed",
			);
			const mentionCount = completed.filter(
				(run) => run.brand_mentioned,
			).length;
			const visibility = completed.length
				? completed.reduce(
						(sum, run) => sum + Number(run.visibility_score ?? 0),
						0,
					) / completed.length
				: 0;

			await supabase.from("daily_metrics").upsert(
				{
					workspace_id: workspace.id,
					metric_date: metricDate,
					visibility_score: visibility,
					mention_count: mentionCount,
					total_runs: completed.length,
					positive_mentions: completed.filter(
						(run) => run.sentiment === "positive",
					).length,
					neutral_mentions: completed.filter(
						(run) => run.sentiment === "neutral",
					).length,
					negative_mentions: completed.filter(
						(run) => run.sentiment === "negative",
					).length,
					source_count: completed.reduce(
						(sum, run) => sum + Number(run.source_count ?? 0),
						0,
					),
					total_cost: completed.reduce(
						(sum, run) => sum + Number(run.total_cost ?? 0),
						0,
					),
				},
				{ onConflict: "workspace_id,metric_date" },
			);
		}

		return { workspaces: workspaces?.length ?? 0 };
	},
);
