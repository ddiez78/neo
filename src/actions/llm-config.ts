"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/data/workspace";
import { llmConfigSchema } from "@/lib/validations/schemas";

export async function upsertLlmConfigAction(
	workspaceId: string,
	workspaceSlug: string,
	formData: FormData,
) {
	const { supabase } = await requireUser();
	const parsed = llmConfigSchema.safeParse({
		provider: formData.get("provider"),
		model: formData.get("model"),
		enabled: formData.get("enabled") === "on",
		api_key_configured: formData.get("api_key_configured") === "on",
		daily_run_limit: formData.get("daily_run_limit"),
	});

	if (!parsed.success) {
		redirect(
			`/${workspaceSlug}/settings?error=${encodeURIComponent(parsed.error.issues[0]?.message ?? "Datos invalidos")}`,
		);
	}

	const { error } = await supabase.from("workspace_llm_configs").upsert(
		{
			workspace_id: workspaceId,
			...parsed.data,
		},
		{ onConflict: "workspace_id,provider,model" },
	);

	if (error) {
		redirect(
			`/${workspaceSlug}/settings?error=${encodeURIComponent(error.message)}`,
		);
	}

	revalidatePath(`/${workspaceSlug}/settings`);
	redirect(`/${workspaceSlug}/settings?saved=1`);
}
