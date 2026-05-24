"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireUser, slugify } from "@/lib/data/workspace";
import { getUserPreferences } from "@/lib/preferences-server";
import { WORKSPACE_LIMIT } from "@/lib/tiers";
import {
	companyProfileSchema,
	csvToArray,
	workspaceSchema,
} from "@/lib/validations/schemas";
import type { ActionResult } from "@/types";

const companyVerificationFields = [
	"brand_name",
	"website",
	"description",
	"business_type",
	"country",
	"market",
	"language",
	"locations",
	"categories",
	"subcategories",
	"value_proposition",
	"target_audience",
	"products_services",
	"key_features",
	"pricing_strategy",
	"revenue_streams",
	"partnerships",
	"social_proof",
	"aliases",
	"approved_claims",
	"prohibited_claims",
	"legal_notes",
	"misunderstood_facts",
	"entity_gaps",
] as const;

export async function placeholderAction(): Promise<ActionResult> {
	return { success: true };
}

export async function createWorkspaceAction(
	formData: FormData,
): Promise<ActionResult<{ slug: string }>> {
	const { supabase, user } = await requireUser();
	const prefs = await getUserPreferences();

	const { count: existingCount } = await supabase
		.from("workspace_members")
		.select("workspace_id", { count: "exact", head: true })
		.eq("user_id", user.id);
	const limit = WORKSPACE_LIMIT[prefs.mode];
	if ((existingCount ?? 0) >= limit) {
		return {
			success: false,
			error: `Tu plan (${prefs.mode}) permite ${limit} workspace${limit === 1 ? "" : "s"}. Cambia a un plan superior para crear más.`,
		};
	}

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
			model: "openai/gpt-4o-mini",
			enabled: true,
		},
		{
			workspace_id: workspace.id,
			provider: "claude",
			model: "anthropic/claude-3-5-haiku",
			enabled: true,
		},
		{
			workspace_id: workspace.id,
			provider: "gemini",
			model: "google/gemini-2.0-flash",
			enabled: true,
		},
		{
			workspace_id: workspace.id,
			provider: "perplexity",
			model: "perplexity/sonar",
			enabled: true,
		},
		{
			workspace_id: workspace.id,
			provider: "deepseek",
			model: "deepseek/deepseek-chat",
			enabled: true,
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
	const { supabase, user } = await requireUser();

	const { data: member } = await supabase
		.from("workspace_members")
		.select("role")
		.eq("workspace_id", workspaceId)
		.eq("user_id", user.id)
		.maybeSingle();
	if (!member) {
		redirect(`/${workspaceSlug}/company-bio?error=Sin+acceso`);
	}

	const parsed = companyProfileSchema.safeParse(Object.fromEntries(formData));
	if (!parsed.success) {
		redirect(
			`/${workspaceSlug}/company-bio?error=${encodeURIComponent(parsed.error.issues[0]?.message ?? "Datos invalidos")}`,
		);
	}

	const values = parsed.data;
	const products = csvToArray(values.products);
	const productsServices = csvToArray(values.products_services);
	const markets = csvToArray(values.markets);
	const primaryMarket = values.market ? [values.market] : [];
	const fieldVerification = Object.fromEntries(
		companyVerificationFields.map((field) => [
			field,
			formData.get(`verified_${field}`) === "on",
		]),
	);
	const verifiedProfile = {
		brand_name: values.brand_name,
		website: values.website || null,
		description: values.description,
		business_type: values.business_type,
		country: values.country || null,
		market: values.market || null,
		language: values.language,
		locations: csvToArray(values.locations),
		categories: csvToArray(values.categories),
		subcategories: csvToArray(values.subcategories),
		value_proposition: values.value_proposition || null,
		target_audience: values.target_audience || null,
		products_services: productsServices,
		key_features: csvToArray(values.key_features),
		pricing_strategy: values.pricing_strategy || null,
		revenue_streams: csvToArray(values.revenue_streams),
		partnerships: csvToArray(values.partnerships),
		social_proof: csvToArray(values.social_proof),
		aliases: csvToArray(values.aliases),
		approved_claims: csvToArray(values.approved_claims),
		prohibited_claims: csvToArray(values.prohibited_claims),
		legal_notes: values.legal_notes || null,
		misunderstood_facts: csvToArray(values.misunderstood_facts),
		entity_gaps: csvToArray(values.entity_gaps),
	};
	const { error } = await supabase.from("company_profiles").upsert(
		{
			workspace_id: workspaceId,
			brand_name: values.brand_name,
			website: values.website || null,
			description: values.description,
			products: products.length ? products : productsServices,
			keywords: csvToArray(values.keywords),
			markets: markets.length ? markets : primaryMarket,
			tone: values.tone || null,
			official_urls: csvToArray(values.official_urls),
			verified_profile: verifiedProfile,
			field_verification: fieldVerification,
			business_type: values.business_type,
			country: values.country || null,
			market: values.market || null,
			language: values.language,
			locations: csvToArray(values.locations),
			categories: csvToArray(values.categories),
			subcategories: csvToArray(values.subcategories),
			value_proposition: values.value_proposition || null,
			target_audience: values.target_audience || null,
			products_services: productsServices,
			key_features: csvToArray(values.key_features),
			pricing_strategy: values.pricing_strategy || null,
			revenue_streams: csvToArray(values.revenue_streams),
			partnerships: csvToArray(values.partnerships),
			social_proof: csvToArray(values.social_proof),
			aliases: csvToArray(values.aliases),
			approved_claims: csvToArray(values.approved_claims),
			prohibited_claims: csvToArray(values.prohibited_claims),
			legal_notes: values.legal_notes || null,
			misunderstood_facts: csvToArray(values.misunderstood_facts),
			entity_gaps: csvToArray(values.entity_gaps),
			updated_at: new Date().toISOString(),
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
