import { createClient } from "@/lib/supabase/server";

export type WeeklyActivity = {
	runsExecuted: number;
	mentionsGained: number;
	newRecommendations: number;
	tasksCompleted: number;
	sourcesDiscovered: number;
	competitorMentions: number;
	periodDays: number;
};

export async function getWeeklyActivity(
	workspaceId: string,
	days = 7,
): Promise<WeeklyActivity> {
	const supabase = await createClient();
	const since = new Date();
	since.setDate(since.getDate() - days);
	const sinceIso = since.toISOString();

	const [runsRes, recsRes, tasksRes, sourcesRes] = await Promise.all([
		supabase
			.from("prompt_runs")
			.select("brand_mentioned, competitors_mentioned, source_count")
			.eq("workspace_id", workspaceId)
			.gte("created_at", sinceIso),
		supabase
			.from("recommendations")
			.select("id")
			.eq("workspace_id", workspaceId)
			.gte("created_at", sinceIso),
		supabase
			.from("recommendation_actions")
			.select("status, completed_at, recommendations!inner(workspace_id)")
			.eq("recommendations.workspace_id", workspaceId)
			.eq("status", "done")
			.gte("completed_at", sinceIso),
		supabase
			.from("prompt_run_sources")
			.select("id")
			.eq("workspace_id", workspaceId)
			.gte("created_at", sinceIso),
	]);

	const runs = runsRes.data ?? [];
	const recs = recsRes.data ?? [];
	const tasks = tasksRes.data ?? [];
	const sources = sourcesRes.data ?? [];

	const runsExecuted = runs.length;
	const mentionsGained = runs.filter(
		(r: { brand_mentioned?: boolean }) => r.brand_mentioned,
	).length;
	const competitorMentions = runs.reduce(
		(sum: number, r: { competitors_mentioned?: string[] | null }) =>
			sum + (r.competitors_mentioned?.length ?? 0),
		0,
	);

	return {
		runsExecuted,
		mentionsGained,
		newRecommendations: recs.length,
		tasksCompleted: tasks.length,
		sourcesDiscovered: sources.length,
		competitorMentions,
		periodDays: days,
	};
}
