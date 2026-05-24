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

export const runPromptManual = inngest.createFunction(
	{ id: "run-prompt-manual", triggers: [{ event: "prompt/run.manual" }] },
	async ({ event }) => {
		const supabase = createAdminClient();
		const { workspaceId, promptId, provider, model } = event.data as {
			workspaceId: string;
			promptId: string;
			provider: LlmProviderKey;
			model: string;
		};

		const quota = await checkQuota(workspaceId, BACKGROUND_PLAN_FALLBACK, 1);
		if (!quota.ok) {
			await emitQuotaExhaustedAlert(workspaceId, BACKGROUND_PLAN_FALLBACK);
			return { skipped: true, reason: "quota_exhausted", quota };
		}

		const [workspaceResult, promptResult, companyResult, competitorsResult] =
			await Promise.all([
				supabase.from("workspaces").select("*").eq("id", workspaceId).single(),
				supabase.from("prompts").select("*").eq("id", promptId).single(),
				supabase
					.from("company_profiles")
					.select("*")
					.eq("workspace_id", workspaceId)
					.maybeSingle(),
				supabase
					.from("competitors")
					.select("*")
					.eq("workspace_id", workspaceId),
			]);

		if (!workspaceResult.data || !promptResult.data) {
			throw new Error("Missing workspace or prompt for manual run.");
		}

		const result = await executePromptRun({
			supabase,
			workspace: workspaceResult.data as Workspace,
			company: companyResult.data,
			competitors: competitorsResult.data ?? [],
			promptId,
			promptBody: promptResult.data.body,
			provider,
			model,
		});

		await incrementUsage(workspaceId, BACKGROUND_PLAN_FALLBACK, 1);
		return result;
	},
);
