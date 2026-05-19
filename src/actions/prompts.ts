"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getWorkspaceOverview, requireUser } from "@/lib/data/workspace";
import { executePromptRun } from "@/lib/llm/executePromptRun";
import { csvToArray, promptSchema } from "@/lib/validations/schemas";
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
	const parsed = promptSchema.safeParse({ ...raw, providers });
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
		providers: parsed.data.providers,
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

export async function runPromptAction(
	workspaceId: string,
	workspaceSlug: string,
	promptId: string,
	formData: FormData,
) {
	const { supabase } = await requireUser();
	const provider = String(
		formData.get("provider") ?? "chatgpt",
	) as LlmProviderKey;
	const model = String(formData.get("model") ?? "mock-geo");
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

	await executePromptRun({
		supabase,
		workspace: workspace as Workspace,
		company: overview.company,
		competitors: overview.competitors,
		promptId,
		promptBody,
		provider,
		model,
	});

	revalidatePath(`/${workspaceSlug}/prompts`);
	revalidatePath(`/${workspaceSlug}/dashboard`);
	revalidatePath(`/${workspaceSlug}/sources`);
}
