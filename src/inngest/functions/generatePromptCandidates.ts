import { inngest } from "@/inngest/client";
import { generatePromptCandidates } from "@/lib/prompts/generationPipeline";
import { createAdminClient } from "@/lib/supabase/admin";

export const generatePromptCandidatesInngest = inngest.createFunction(
	{
		id: "generate-prompt-candidates",
		triggers: [{ event: "prompt/generation.requested" }],
	},
	async ({ event, step }) => {
		const supabase = createAdminClient();
		const { workspaceId, batchId } = event.data as {
			workspaceId: string;
			batchId: string;
		};

		const context = await step.run("context-builder", async () => {
			const [workspace, company, competitors, prompts] = await Promise.all([
				supabase.from("workspaces").select("*").eq("id", workspaceId).single(),
				supabase
					.from("company_profiles")
					.select("*")
					.eq("workspace_id", workspaceId)
					.maybeSingle(),
				supabase
					.from("competitors")
					.select("*")
					.eq("workspace_id", workspaceId),
				supabase.from("prompts").select("*").eq("workspace_id", workspaceId),
			]);

			if (!workspace.data) throw new Error("Workspace not found.");

			return {
				workspaceName: workspace.data.name as string,
				company: company.data,
				competitors: competitors.data ?? [],
				existingPrompts: prompts.data ?? [],
			};
		});

		const candidates = await step.run("proprietary-pipeline", async () =>
			generatePromptCandidates(context),
		);

		await step.run("persist-candidates", async () => {
			if (candidates.length > 0) {
				await supabase.from("prompt_candidates").insert(
					candidates.map((candidate) => ({
						workspace_id: workspaceId,
						batch_id: batchId,
						...candidate,
					})),
				);
			}

			await supabase
				.from("prompt_generation_batches")
				.update({
					status: "completed",
					completed_at: new Date().toISOString(),
					updated_at: new Date().toISOString(),
					metadata: { generated_count: candidates.length, mode: "inngest" },
				})
				.eq("id", batchId);
		});

		return { candidates: candidates.length };
	},
);
