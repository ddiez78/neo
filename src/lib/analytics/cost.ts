import { createClient } from "@/lib/supabase/server";
import type { LlmProviderKey, PromptRun } from "@/types";

export type CostSummary = {
	totalThisMonth: number;
	totalLastMonth: number;
	deltaPct: number;
	projectedMonthly: number;
	byProvider: { provider: LlmProviderKey; cost: number; runs: number }[];
	byDay: { date: string; cost: number }[];
	costPerMention: number;
	mentionsThisMonth: number;
	totalTokens: number;
};

function startOfMonth(d: Date): Date {
	return new Date(d.getFullYear(), d.getMonth(), 1);
}

function startOfPrevMonth(d: Date): Date {
	return new Date(d.getFullYear(), d.getMonth() - 1, 1);
}

function dayKey(date: Date | string): string {
	return new Date(date).toISOString().slice(0, 10);
}

export async function getCostSummary(
	workspaceId: string,
): Promise<CostSummary> {
	const supabase = await createClient();
	const now = new Date();
	const thisMonthStart = startOfMonth(now);
	const lastMonthStart = startOfPrevMonth(now);

	const { data: runs } = await supabase
		.from("prompt_runs")
		.select(
			"provider,total_cost,prompt_tokens,completion_tokens,brand_mentioned,created_at",
		)
		.eq("workspace_id", workspaceId)
		.gte("created_at", lastMonthStart.toISOString())
		.order("created_at", { ascending: true });

	const allRuns = (runs ?? []) as Pick<
		PromptRun,
		| "provider"
		| "total_cost"
		| "prompt_tokens"
		| "completion_tokens"
		| "brand_mentioned"
		| "created_at"
	>[];

	let totalThisMonth = 0;
	let totalLastMonth = 0;
	let mentionsThisMonth = 0;
	let totalTokens = 0;
	const byProviderMap = new Map<
		LlmProviderKey,
		{ cost: number; runs: number }
	>();
	const byDayMap = new Map<string, number>();

	for (const run of allRuns) {
		const created = new Date(run.created_at);
		const cost = Number(run.total_cost) || 0;

		if (created >= thisMonthStart) {
			totalThisMonth += cost;
			if (run.brand_mentioned) mentionsThisMonth += 1;
			totalTokens +=
				(Number(run.prompt_tokens) || 0) + (Number(run.completion_tokens) || 0);
			const provider = run.provider as LlmProviderKey;
			const current = byProviderMap.get(provider) ?? { cost: 0, runs: 0 };
			byProviderMap.set(provider, {
				cost: current.cost + cost,
				runs: current.runs + 1,
			});
			const key = dayKey(created);
			byDayMap.set(key, (byDayMap.get(key) ?? 0) + cost);
		} else {
			totalLastMonth += cost;
		}
	}

	const dayOfMonth = now.getDate();
	const daysInMonth = new Date(
		now.getFullYear(),
		now.getMonth() + 1,
		0,
	).getDate();
	const projectedMonthly =
		dayOfMonth > 0 ? (totalThisMonth / dayOfMonth) * daysInMonth : 0;

	const deltaPct =
		totalLastMonth > 0
			? ((totalThisMonth - totalLastMonth) / totalLastMonth) * 100
			: totalThisMonth > 0
				? 100
				: 0;

	const byProvider = Array.from(byProviderMap.entries())
		.map(([provider, v]) => ({ provider, cost: v.cost, runs: v.runs }))
		.sort((a, b) => b.cost - a.cost);

	const byDay: { date: string; cost: number }[] = [];
	for (let i = 29; i >= 0; i--) {
		const d = new Date(now);
		d.setDate(d.getDate() - i);
		const key = dayKey(d);
		byDay.push({ date: key, cost: byDayMap.get(key) ?? 0 });
	}

	const costPerMention =
		mentionsThisMonth > 0 ? totalThisMonth / mentionsThisMonth : 0;

	return {
		totalThisMonth,
		totalLastMonth,
		deltaPct,
		projectedMonthly,
		byProvider,
		byDay,
		costPerMention,
		mentionsThisMonth,
		totalTokens,
	};
}
