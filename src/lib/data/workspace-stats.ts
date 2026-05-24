import { createClient } from "@/lib/supabase/server";

export type WorkspaceStats = {
	workspaceId: string;
	readinessScore: number | null;
	lastActivity: string | null;
	alertsUnseen: number;
	tasksPending: number;
	costThisMonth: number;
	runsLast7Days: number;
};

function startOfMonth(d: Date): Date {
	return new Date(d.getFullYear(), d.getMonth(), 1);
}

export async function getWorkspacesStats(
	workspaceIds: string[],
): Promise<Record<string, WorkspaceStats>> {
	if (workspaceIds.length === 0) return {};

	const supabase = await createClient();
	const monthStart = startOfMonth(new Date()).toISOString();
	const weekAgo = new Date();
	weekAgo.setDate(weekAgo.getDate() - 7);

	const [runsRes, alertsRes, tasksRes] = await Promise.all([
		supabase
			.from("prompt_runs")
			.select("workspace_id, visibility_score, total_cost, created_at")
			.in("workspace_id", workspaceIds)
			.gte("created_at", monthStart),
		supabase
			.from("alerts")
			.select("workspace_id")
			.in("workspace_id", workspaceIds)
			.is("seen_at", null),
		supabase
			.from("recommendation_actions")
			.select("recommendations!inner(workspace_id), status")
			.eq("status", "pending"),
	]);

	const runs = (runsRes.data ?? []) as {
		workspace_id: string;
		visibility_score: number;
		total_cost: number;
		created_at: string;
	}[];
	const alerts = (alertsRes.data ?? []) as { workspace_id: string }[];
	const tasks = (tasksRes.data ?? []) as unknown as {
		recommendations: { workspace_id: string } | { workspace_id: string }[];
	}[];

	function taskWorkspaceId(t: (typeof tasks)[number]): string | null {
		const r = t.recommendations;
		if (!r) return null;
		if (Array.isArray(r)) return r[0]?.workspace_id ?? null;
		return r.workspace_id ?? null;
	}

	const result: Record<string, WorkspaceStats> = {};

	for (const wsId of workspaceIds) {
		const wsRuns = runs.filter((r) => r.workspace_id === wsId);
		const wsRecent = wsRuns
			.slice()
			.sort(
				(a, b) =>
					new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
			);
		const last = wsRecent[0] ?? null;
		const avgVis =
			wsRuns.length > 0
				? wsRuns.reduce((s, r) => s + (Number(r.visibility_score) || 0), 0) /
					wsRuns.length
				: null;
		const cost = wsRuns.reduce((s, r) => s + (Number(r.total_cost) || 0), 0);
		const runsLast7Days = wsRuns.filter(
			(r) => new Date(r.created_at) >= weekAgo,
		).length;
		const alertsUnseen = alerts.filter((a) => a.workspace_id === wsId).length;
		const tasksPending = tasks.filter(
			(t) => taskWorkspaceId(t) === wsId,
		).length;

		result[wsId] = {
			workspaceId: wsId,
			readinessScore: avgVis !== null ? Math.round(avgVis) : null,
			lastActivity: last?.created_at ?? null,
			alertsUnseen,
			tasksPending,
			costThisMonth: cost,
			runsLast7Days,
		};
	}

	return result;
}
