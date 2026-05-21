"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getWorkspaceOverview, requireUser } from "@/lib/data/workspace";
import { executePromptRun } from "@/lib/llm/executePromptRun";
import { generatePromptCandidates } from "@/lib/prompts/generationPipeline";
import {
	csvToArray,
	promptSchema,
	providerKeys,
} from "@/lib/validations/schemas";
import type { ActionResult, LlmProviderKey, Workspace } from "@/types";

export async function placeholderAction(): Promise<ActionResult> {
	return { success: true };
}

export async function createPromptAction(
	workspaceId: string,
	workspaceSlug: string,
	formData: FormData,
) {
	const { supabase } = await requireUser();
	const raw = Object.fromEntries(formData);
	const providers = formData.getAll("providers");
	const legacyProviders = providers.length > 0 ? providers : providerKeys;
	const parsed = promptSchema.safeParse({ ...raw, providers: legacyProviders });
	if (!parsed.success) {
		redirect(
			`/${workspaceSlug}/prompts?error=${encodeURIComponent(parsed.error.issues[0]?.message ?? "Datos invalidos")}`,
		);
	}

	const { error } = await supabase.from("prompts").insert({
		workspace_id: workspaceId,
		title: parsed.data.title,
		body: parsed.data.body,
		status: parsed.data.status,
		priority: parsed.data.priority,
		frequency: parsed.data.frequency,
		providers: providerKeys,
		tags: csvToArray(parsed.data.tags),
	});

	if (error) {
		redirect(
			`/${workspaceSlug}/prompts?error=${encodeURIComponent(error.message)}`,
		);
	}

	revalidatePath(`/${workspaceSlug}/prompts`);
	redirect(`/${workspaceSlug}/prompts?saved=1`);
}

export async function runPromptAcrossEnabledLlmsAction(
	workspaceId: string,
	workspaceSlug: string,
	promptId: string,
	formData: FormData,
) {
	const { supabase } = await requireUser();
	const promptBody = String(formData.get("body") ?? "");
	const [{ data: workspace }, overview] = await Promise.all([
		supabase.from("workspaces").select("*").eq("id", workspaceId).single(),
		getWorkspaceOverview(workspaceId),
	]);

	if (!workspace) {
		redirect(
			`/${workspaceSlug}/prompts?error=${encodeURIComponent("Workspace not found")}`,
		);
	}

	const enabledConfigs = overview.llmConfigs.filter((config) => config.enabled);
	if (enabledConfigs.length === 0) {
		redirect(
			`/${workspaceSlug}/prompts?error=${encodeURIComponent("Activa al menos un LLM antes de ejecutar prompts.")}`,
		);
	}

	await Promise.all(
		enabledConfigs.map((config) =>
			executePromptRun({
				supabase,
				workspace: workspace as Workspace,
				company: overview.company,
				competitors: overview.competitors,
				promptId,
				promptBody,
				provider: config.provider as LlmProviderKey,
				model: config.model,
			}),
		),
	);

	revalidatePath(`/${workspaceSlug}/prompts`);
	revalidatePath(`/${workspaceSlug}/dashboard`);
	revalidatePath(`/${workspaceSlug}/sources`);
	redirect(`/${workspaceSlug}/prompts?ran=${enabledConfigs.length}`);
}

export const runPromptAction = runPromptAcrossEnabledLlmsAction;

export async function generatePromptCandidatesAction(
	workspaceId: string,
	workspaceSlug: string,
) {
	const { supabase, user } = await requireUser();
	const overview = await getWorkspaceOverview(workspaceId);
	const { data: batch, error: batchError } = await supabase
		.from("prompt_generation_batches")
		.insert({
			workspace_id: workspaceId,
			requested_by: user.id,
			status: "running",
			pipeline_version: "proprietary-v1",
			metadata: {
				stages: [
					"context_builder",
					"intent_expansion",
					"multi_model_generation",
					"proprietary_refinement",
					"scoring",
					"final_selection",
				],
			},
		})
		.select("*")
		.single();

	if (batchError || !batch) {
		redirect(
			`/${workspaceSlug}/prompt-research?error=${encodeURIComponent(batchError?.message ?? "No se pudo crear el batch.")}`,
		);
	}

	let generatedCount = 0;
	try {
		const candidates = await generatePromptCandidates({
			workspaceName: overview.company?.brand_name ?? workspaceSlug,
			company: overview.company,
			competitors: overview.competitors,
			existingPrompts: overview.prompts,
		});
		generatedCount = candidates.length;

		if (candidates.length > 0) {
			const { error: candidateError } = await supabase
				.from("prompt_candidates")
				.insert(
					candidates.map((candidate) => ({
						workspace_id: workspaceId,
						batch_id: batch.id,
						...candidate,
					})),
				);

			if (candidateError) throw new Error(candidateError.message);
		}

		await supabase
			.from("prompt_generation_batches")
			.update({
				status: "completed",
				completed_at: new Date().toISOString(),
				updated_at: new Date().toISOString(),
				metadata: { generated_count: generatedCount },
			})
			.eq("id", batch.id);
	} catch (error) {
		const message =
			error instanceof Error ? error.message : "Fallo el pipeline de prompts.";
		await supabase
			.from("prompt_generation_batches")
			.update({
				status: "failed",
				error_message: message,
				updated_at: new Date().toISOString(),
			})
			.eq("id", batch.id);
		redirect(
			`/${workspaceSlug}/prompt-research?error=${encodeURIComponent(message)}`,
		);
	}

	revalidatePath(`/${workspaceSlug}/prompt-research`);
	redirect(`/${workspaceSlug}/prompt-research?generated=${generatedCount}`);
}

export async function acceptPromptCandidateAction(
	workspaceId: string,
	workspaceSlug: string,
	candidateId: string,
	formData?: FormData,
) {
	const { supabase } = await requireUser();
	const { data: candidate, error: candidateError } = await supabase
		.from("prompt_candidates")
		.select("*")
		.eq("id", candidateId)
		.eq("workspace_id", workspaceId)
		.single();

	if (candidateError || !candidate) {
		redirect(
			`/${workspaceSlug}/prompt-research?error=${encodeURIComponent(candidateError?.message ?? "Candidato no encontrado.")}`,
		);
	}

	const title = String(formData?.get("title") ?? candidate.title).trim();
	const body = String(formData?.get("body") ?? candidate.body).trim();
	const { data: prompt, error: promptError } = await supabase
		.from("prompts")
		.insert({
			workspace_id: workspaceId,
			title,
			body,
			status: "active",
			priority: 3,
			frequency: "weekly",
			providers: providerKeys,
			tags: ["generated", candidate.intent, candidate.category].filter(Boolean),
		})
		.select("*")
		.single();

	if (promptError || !prompt) {
		redirect(
			`/${workspaceSlug}/prompt-research?error=${encodeURIComponent(promptError?.message ?? "No se pudo guardar el prompt.")}`,
		);
	}

	await supabase
		.from("prompt_candidates")
		.update({
			title,
			body,
			status:
				title === candidate.title && body === candidate.body
					? "accepted"
					: "edited",
			created_prompt_id: prompt.id,
			updated_at: new Date().toISOString(),
		})
		.eq("id", candidateId);

	revalidatePath(`/${workspaceSlug}/prompt-research`);
	revalidatePath(`/${workspaceSlug}/prompts`);
	redirect(`/${workspaceSlug}/prompt-research?accepted=1`);
}

export async function rejectPromptCandidateAction(
	workspaceSlug: string,
	candidateId: string,
) {
	const { supabase } = await requireUser();
	const { error } = await supabase
		.from("prompt_candidates")
		.update({ status: "rejected", updated_at: new Date().toISOString() })
		.eq("id", candidateId);

	if (error) {
		redirect(
			`/${workspaceSlug}/prompt-research?error=${encodeURIComponent(error.message)}`,
		);
	}

	revalidatePath(`/${workspaceSlug}/prompt-research`);
	redirect(`/${workspaceSlug}/prompt-research?rejected=1`);
}
