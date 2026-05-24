"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/data/workspace";
import { getUserPreferences } from "@/lib/preferences-server";
import { COMPETITOR_LIMIT } from "@/lib/tiers";
import { competitorSchema, csvToArray } from "@/lib/validations/schemas";
import type { ActionResult } from "@/types";

export async function placeholderAction(): Promise<ActionResult> {
	return { success: true };
}

export async function createCompetitorAction(
	workspaceId: string,
	workspaceSlug: string,
	formData: FormData,
) {
	const { supabase } = await requireUser();
	const prefs = await getUserPreferences();
	const limit = COMPETITOR_LIMIT[prefs.mode];
	const { count: existingCount } = await supabase
		.from("competitors")
		.select("id", { count: "exact", head: true })
		.eq("workspace_id", workspaceId);
	if ((existingCount ?? 0) >= limit) {
		redirect(
			`/${workspaceSlug}/competitors?error=${encodeURIComponent(`Tu plan permite ${limit} competidores. Sube de plan para añadir más.`)}`,
		);
	}

	const parsed = competitorSchema.safeParse(Object.fromEntries(formData));
	if (!parsed.success) {
		redirect(
			`/${workspaceSlug}/competitors?error=${encodeURIComponent(parsed.error.issues[0]?.message ?? "Datos invalidos")}`,
		);
	}

	const { error } = await supabase.from("competitors").insert({
		workspace_id: workspaceId,
		name: parsed.data.name,
		domain: parsed.data.domain || null,
		aliases: csvToArray(parsed.data.aliases),
		notes: parsed.data.notes || null,
	});

	if (error) {
		redirect(
			`/${workspaceSlug}/competitors?error=${encodeURIComponent(error.message)}`,
		);
	}

	revalidatePath(`/${workspaceSlug}/competitors`);
	redirect(`/${workspaceSlug}/competitors?saved=1`);
}

export async function updateSuggestionStatusAction(
	workspaceSlug: string,
	suggestionId: string,
	status: "approved" | "rejected",
) {
	const { supabase } = await requireUser();
	await supabase
		.from("competitor_suggestions")
		.update({ status })
		.eq("id", suggestionId);
	revalidatePath(`/${workspaceSlug}/competitors`);
}
