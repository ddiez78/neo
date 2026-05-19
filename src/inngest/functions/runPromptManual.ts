import { inngest } from "@/inngest/client";
import { executePromptRun } from "@/lib/llm/executePromptRun";
import { createAdminClient } from "@/lib/supabase/admin";
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

		return executePromptRun({
			supabase,
			workspace: workspaceResult.data as Workspace,
			company: companyResult.data,
			competitors: competitorsResult.data ?? [],
			promptId,
			promptBody: promptResult.data.body,
			provider,
			model,
		});
	},
);
