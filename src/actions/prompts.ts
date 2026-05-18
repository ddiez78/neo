"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/data/workspace";
import { csvToArray, promptSchema } from "@/lib/validations/schemas";
import type { ActionResult } from "@/types";

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
	const provider = String(formData.get("provider") ?? "chatgpt");
	const model = String(formData.get("model") ?? "mock-geo");
	const promptBody = String(formData.get("body") ?? "");
	const simulatedResponse =
		"Respuesta simulada GEO: la marca aparece con contexto neutral junto a competidores y fuentes pendientes de verificacion.";

	const { error } = await supabase.from("prompt_runs").insert({
		workspace_id: workspaceId,
		prompt_id: promptId,
		provider,
		model,
		status: "completed",
		input_text: promptBody,
		response_text: simulatedResponse,
		sentiment: "neutral",
		brand_mentioned: true,
		competitors_mentioned: [],
		prompt_tokens: Math.max(10, Math.round(promptBody.length / 4)),
		completion_tokens: Math.round(simulatedResponse.length / 4),
		total_cost: 0.0025,
		started_at: new Date().toISOString(),
		completed_at: new Date().toISOString(),
	});

	if (!error) {
		await supabase
			.from("prompts")
			.update({ last_run_at: new Date().toISOString() })
			.eq("id", promptId);
	}

	revalidatePath(`/${workspaceSlug}/prompts`);
	revalidatePath(`/${workspaceSlug}/dashboard`);
}
