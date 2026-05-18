"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireUser, slugify } from "@/lib/data/workspace";
import {
	companyProfileSchema,
	csvToArray,
	workspaceSchema,
} from "@/lib/validations/schemas";
import type { ActionResult } from "@/types";

export async function placeholderAction(): Promise<ActionResult> {
	return { success: true };
}

export async function createWorkspaceAction(
	formData: FormData,
): Promise<ActionResult<{ slug: string }>> {
	const { supabase, user } = await requireUser();
	const parsed = workspaceSchema.safeParse(Object.fromEntries(formData));
	if (!parsed.success) {
		return { success: false, error: parsed.error.issues[0]?.message };
	}

	const slug = `${slugify(parsed.data.name)}-${Math.random().toString(36).slice(2, 6)}`;
	const { data: workspace, error } = await supabase
		.from("workspaces")
		.insert({
			...parsed.data,
			website: parsed.data.website || null,
			slug,
			created_by: user.id,
		})
		.select("*")
		.single();

	if (error || !workspace) {
		return {
			success: false,
			error: error?.message ?? "No se pudo crear el workspace.",
		};
	}

	const { error: memberError } = await supabase
		.from("workspace_members")
		.insert({
			workspace_id: workspace.id,
			user_id: user.id,
			role: "owner",
		});

	if (memberError) {
		return { success: false, error: memberError.message };
	}

	await supabase.from("workspace_llm_configs").insert([
		{
			workspace_id: workspace.id,
			provider: "chatgpt",
			model: "gpt-4o-mini",
			enabled: true,
		},
		{
			workspace_id: workspace.id,
			provider: "claude",
			model: "claude-3-5-sonnet",
			enabled: false,
		},
		{
			workspace_id: workspace.id,
			provider: "gemini",
			model: "gemini-1.5-pro",
			enabled: false,
		},
		{
			workspace_id: workspace.id,
			provider: "perplexity",
			model: "sonar",
			enabled: false,
		},
		{
			workspace_id: workspace.id,
			provider: "deepseek",
			model: "deepseek-chat",
			enabled: false,
		},
	]);

	revalidatePath("/workspaces");
	return { success: true, data: { slug } };
}

export async function createWorkspaceAndRedirectAction(formData: FormData) {
	const result = await createWorkspaceAction(formData);
	if (!result.success || !result.data) {
		redirect(
			`/onboarding?error=${encodeURIComponent(result.error ?? "No se pudo crear el workspace.")}`,
		);
	}
	redirect(`/${result.data.slug}/dashboard`);
}

export async function upsertCompanyProfileAction(
	workspaceId: string,
	workspaceSlug: string,
	formData: FormData,
) {
	const { supabase } = await requireUser();
	const parsed = companyProfileSchema.safeParse(Object.fromEntries(formData));
	if (!parsed.success) {
		redirect(
			`/${workspaceSlug}/company-bio?error=${encodeURIComponent(parsed.error.issues[0]?.message ?? "Datos invalidos")}`,
		);
	}

	const values = parsed.data;
	const { error } = await supabase.from("company_profiles").upsert(
		{
			workspace_id: workspaceId,
			brand_name: values.brand_name,
			website: values.website || null,
			description: values.description,
			products: csvToArray(values.products),
			keywords: csvToArray(values.keywords),
			markets: csvToArray(values.markets),
			tone: values.tone || null,
			official_urls: csvToArray(values.official_urls),
		},
		{ onConflict: "workspace_id" },
	);

	if (error) {
		redirect(
			`/${workspaceSlug}/company-bio?error=${encodeURIComponent(error.message)}`,
		);
	}

	revalidatePath(`/${workspaceSlug}`);
	redirect(`/${workspaceSlug}/company-bio?saved=1`);
}
