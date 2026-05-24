import { createClient } from "@/lib/supabase/server";

export type RoiEntry = {
	id: string;
	title: string;
	category: string;
	completedAt: string;
	impactScore: number;
	visibilityBefore: number;
	visibilityAfter: number;
	visibilityDelta: number;
};

export type RoiSummary = {
	entries: RoiEntry[];
	totalCompleted: number;
	totalVisibilityGain: number;
	avgImpact: number;
	periodDays: number;
};

function avg(arr: number[]): number {
	if (arr.length === 0) return 0;
	return arr.reduce((s, v) => s + v, 0) / arr.length;
}

export async function getRoiSummary(
	workspaceId: string,
	periodDays = 90,
): Promise<RoiSummary> {
	const supabase = await createClient();
	const since = new Date();
	since.setDate(since.getDate() - periodDays);

	const { data: completedRecs } = await supabase
		.from("recommendations")
		.select("id, title, category, impact_score, updated_at, status")
		.eq("workspace_id", workspaceId)
		.eq("status", "done")
		.gte("updated_at", since.toISOString())
		.order("updated_at", { ascending: false });

	const recs = (completedRecs ?? []) as {
		id: string;
		title: string;
		category: string;
		impact_score: number;
		updated_at: string;
	}[];

	const { data: runs } = await supabase
		.from("prompt_runs")
		.select("visibility_score, created_at")
		.eq("workspace_id", workspaceId)
		.gte("created_at", since.toISOString())
		.order("created_at", { ascending: true });

	const runsList = (runs ?? []) as {
		visibility_score: number;
		created_at: string;
	}[];

	const entries: RoiEntry[] = recs.map((rec) => {
		const completedAt = new Date(rec.updated_at).getTime();
		const beforeWindow = runsList.filter((r) => {
			const t = new Date(r.created_at).getTime();
			return t < completedAt && t >= completedAt - 14 * 24 * 60 * 60 * 1000;
		});
		const afterWindow = runsList.filter((r) => {
			const t = new Date(r.created_at).getTime();
			return t > completedAt && t <= completedAt + 14 * 24 * 60 * 60 * 1000;
		});
		const before = avg(
			beforeWindow.map((r) => Number(r.visibility_score) || 0),
		);
		const after = avg(afterWindow.map((r) => Number(r.visibility_score) || 0));
		return {
			id: rec.id,
			title: rec.title,
			category: rec.category,
			completedAt: rec.updated_at,
			impactScore: Number(rec.impact_score) || 0,
			visibilityBefore: before,
			visibilityAfter: after,
			visibilityDelta: after - before,
		};
	});

	const totalVisibilityGain = entries.reduce(
		(s, e) => s + Math.max(0, e.visibilityDelta),
		0,
	);
	const avgImpact = avg(entries.map((e) => e.impactScore));

	return {
		entries,
		totalCompleted: entries.length,
		totalVisibilityGain,
		avgImpact,
		periodDays,
	};
}
