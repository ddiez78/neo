"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getWorkspaceOverview, requireUser } from "@/lib/data/workspace";
import { buildRecommendationDrafts } from "@/lib/recommendations/generateRecommendations";
import { loadMarkdownRecommendationSources } from "@/lib/recommendations/markdownSources";
import type {
	Recommendation,
	RecommendationCategory,
	RecommendationSource,
	RecommendationStatus,
} from "@/types";

export async function importRecommendationSourcesAction(
	workspaceId: string,
	workspaceSlug: string,
) {
	const { supabase } = await requireUser();
	const sources = await loadMarkdownRecommendationSources();

	const { error } = await supabase.from("recommendation_sources").upsert(
		sources.map((source) => ({
			workspace_id: workspaceId,
			title: source.title,
			slug: source.slug,
			category: source.category,
			content: source.content,
			version: source.version,
		})),
		{ onConflict: "workspace_id,slug,version" },
	);

	if (error) {
		redirect(
			`/${workspaceSlug}/recommendations?error=${encodeURIComponent(error.message)}`,
		);
	}

	revalidatePath(`/${workspaceSlug}/recommendations`);
	redirect(`/${workspaceSlug}/recommendations?imported=1`);
}

export async function generateRecommendationsAction(
	workspaceId: string,
	workspaceSlug: string,
) {
	const { supabase } = await requireUser();
	const existingSources = await supabase
		.from("recommendation_sources")
		.select("*")
		.eq("workspace_id", workspaceId);

	let methodology = (existingSources.data ?? []) as RecommendationSource[];

	if (methodology.length === 0) {
		const sources = await loadMarkdownRecommendationSources();
		const { data, error } = await supabase
			.from("recommendation_sources")
			.upsert(
				sources.map((source) => ({
					workspace_id: workspaceId,
					title: source.title,
					slug: source.slug,
					category: source.category,
					content: source.content,
					version: source.version,
				})),
				{ onConflict: "workspace_id,slug,version" },
			)
			.select("*");

		if (error) {
			redirect(
				`/${workspaceSlug}/recommendations?error=${encodeURIComponent(error.message)}`,
			);
		}

		methodology = (data ?? []) as RecommendationSource[];
	}

	const overview = await getWorkspaceOverview(workspaceId);
	const drafts = buildRecommendationDrafts({ ...overview, methodology });
	const sourceBySlug = new Map(
		methodology.map((source) => [source.slug, source.id]),
	);

	const { error } = await supabase.from("recommendations").insert(
		drafts.map((draft) => ({
			workspace_id: workspaceId,
			source_id: sourceBySlug.get(draft.source_slug) ?? null,
			title: draft.title,
			description: draft.description,
			category: draft.category,
			priority: draft.priority,
			impact_score: draft.impact_score,
			confidence_score: draft.confidence_score,
			related_prompt_ids: draft.related_prompt_ids,
			related_competitor_ids: draft.related_competitor_ids,
			related_source_domains: draft.related_source_domains,
			evidence: draft.evidence,
		})),
	);

	if (error) {
		redirect(
			`/${workspaceSlug}/recommendations?error=${encodeURIComponent(error.message)}`,
		);
	}

	revalidatePath(`/${workspaceSlug}/recommendations`);
	redirect(`/${workspaceSlug}/recommendations?generated=${drafts.length}`);
}

export async function updateRecommendationStatusAction(
	workspaceSlug: string,
	recommendationId: string,
	status: RecommendationStatus,
) {
	const { supabase } = await requireUser();
	const { error } = await supabase
		.from("recommendations")
		.update({ status, updated_at: new Date().toISOString() })
		.eq("id", recommendationId);

	if (error) {
		redirect(
			`/${workspaceSlug}/recommendations?error=${encodeURIComponent(error.message)}`,
		);
	}

	revalidatePath(`/${workspaceSlug}/recommendations`);
}

export async function createRecommendationAction(
	workspaceId: string,
	workspaceSlug: string,
	formData: FormData,
) {
	const { supabase } = await requireUser();
	const title = String(formData.get("title") ?? "").trim();
	const description = String(formData.get("description") ?? "").trim();
	const category = String(
		formData.get("category") ?? "content",
	) as RecommendationCategory;
	const priority = Number(formData.get("priority") ?? 3);

	if (!title || !description) {
		redirect(
			`/${workspaceSlug}/recommendations?error=${encodeURIComponent("Title and description are required.")}`,
		);
	}

	const { error } = await supabase.from("recommendations").insert({
		workspace_id: workspaceId,
		title,
		description,
		category,
		priority,
		impact_score: 50,
		confidence_score: 70,
		evidence: { source: "manual" },
	});

	if (error) {
		redirect(
			`/${workspaceSlug}/recommendations?error=${encodeURIComponent(error.message)}`,
		);
	}

	revalidatePath(`/${workspaceSlug}/recommendations`);
	redirect(`/${workspaceSlug}/recommendations?created=1`);
}

export async function createRecommendationTaskAction(
	workspaceId: string,
	workspaceSlug: string,
	recommendation: Recommendation,
) {
	const { supabase, user } = await requireUser();
	const { error } = await supabase.from("recommendation_actions").insert({
		workspace_id: workspaceId,
		recommendation_id: recommendation.id,
		source_recommendation_id: recommendation.id,
		label: recommendation.title,
		owner_id: user.id,
		assigned_to: user.id,
		priority: recommendation.priority,
		type:
			recommendation.category === "technical"
				? "technical"
				: recommendation.category === "sources" ||
						recommendation.category === "authority"
					? "source_review"
					: recommendation.category === "competitors"
						? "comparison"
						: "content",
		status: "pending",
	});

	if (error) {
		redirect(
			`/${workspaceSlug}/recommendations?error=${encodeURIComponent(error.message)}`,
		);
	}

	revalidatePath(`/${workspaceSlug}/recommendations`);
	revalidatePath(`/${workspaceSlug}/tasks`);
}
