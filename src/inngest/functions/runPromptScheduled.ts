import { inngest } from "@/inngest/client";
import { executePromptRun } from "@/lib/llm/executePromptRun";
import { createAdminClient } from "@/lib/supabase/admin";
import {
	BACKGROUND_PLAN_FALLBACK,
	checkQuota,
	emitQuotaExhaustedAlert,
	incrementUsage,
} from "@/lib/usage/quota";
import type { LlmProviderKey, Workspace } from "@/types";

function shouldRun(frequency: string, now = new Date()) {
	if (frequency === "daily") return true;
	if (frequency === "weekly") return now.getUTCDay() === 1;
	if (frequency === "monthly") return now.getUTCDate() === 1;
	return true;
}

export const runPromptScheduled = inngest.createFunction(
	{ id: "run-prompt-scheduled", triggers: [{ cron: "0 */6 * * *" }] },
	async ({ step }) => {
		const supabase = createAdminClient();
		const { data: prompts } = await supabase
			.from("prompts")
			.select("*, workspaces(*)")
			.eq("status", "active");

		const runnable = (prompts ?? []).filter((prompt) =>
			shouldRun(String(prompt.frequency ?? "daily")),
		);

		await step.run("execute-active-prompts", async () => {
			// Cache quota check + emitted alert per workspace within this run.
			const quotaCacheByWs = new Map<string, boolean>();
			const alertedWs = new Set<string>();
			let totalIncrements = 0;

			for (const prompt of runnable) {
				const workspace = prompt.workspaces as Workspace | null;
				if (!workspace) continue;

				let hasQuota = quotaCacheByWs.get(workspace.id);
				if (hasQuota === undefined) {
					const quota = await checkQuota(
						workspace.id,
						BACKGROUND_PLAN_FALLBACK,
						1,
					);
					hasQuota = quota.ok;
					quotaCacheByWs.set(workspace.id, hasQuota);
				}
				if (!hasQuota) {
					if (!alertedWs.has(workspace.id)) {
						await emitQuotaExhaustedAlert(
							workspace.id,
							BACKGROUND_PLAN_FALLBACK,
						);
						alertedWs.add(workspace.id);
					}
					continue;
				}

				const [companyResult, competitorsResult, configsResult] =
					await Promise.all([
						supabase
							.from("company_profiles")
							.select("*")
							.eq("workspace_id", prompt.workspace_id)
							.maybeSingle(),
						supabase
							.from("competitors")
							.select("*")
							.eq("workspace_id", prompt.workspace_id),
						supabase
							.from("workspace_llm_configs")
							.select("*")
							.eq("workspace_id", prompt.workspace_id)
							.eq("enabled", true),
					]);

				const results = await Promise.allSettled(
					(configsResult.data ?? []).map((config) =>
						executePromptRun({
							supabase,
							workspace,
							company: companyResult.data,
							competitors: competitorsResult.data ?? [],
							promptId: prompt.id,
							promptBody: prompt.body,
							provider: config.provider as LlmProviderKey,
							model: config.model,
						}),
					),
				);
				const completed = results.filter(
					(r) => r.status === "fulfilled",
				).length;
				const failed = results.filter((r) => r.status === "rejected").length;

				if (completed > 0) {
					await incrementUsage(
						workspace.id,
						BACKGROUND_PLAN_FALLBACK,
						completed,
					);
					totalIncrements += completed;
				}
				if (failed > 0) {
					console.error(
						`${failed} prompt run(s) failed for prompt ${prompt.id}`,
					);
				}
			}

			return { totalIncrements };
		});

		return { prompts: runnable.length };
	},
);
