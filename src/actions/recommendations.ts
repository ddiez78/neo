"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getWorkspaceOverview, requireUser } from "@/lib/data/workspace";
import {
	generateGeoRecommendations,
	translateGeoRecommendations,
} from "@/lib/geo/generateRecommendations";
import {
	buildGeoKpiSnapshot,
	buildRetrievalQueries,
	retrieveRelevantKnowledge,
} from "@/lib/geo/knowledgeRetrieval";
import { getUserPreferences } from "@/lib/preferences-server";
import { buildCompanyBioRecommendations } from "@/lib/recommendations/companyBioRecommendations";
import { loadMarkdownRecommendationSources } from "@/lib/recommendations/markdownSources";
import { checkQuota, incrementUsage } from "@/lib/usage/quota";
import type {
	Recommendation,
	RecommendationCategory,
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
	const prefs = await getUserPreferences();

	const quota = await checkQuota(workspaceId, prefs.mode, 2);
	if (!quota.ok) {
		const message = `Cupo mensual de ejecuciones IA agotado (${quota.used}/${quota.limit}). Sube de plan o espera al próximo ciclo.`;
		redirect(
			`/${workspaceSlug}/recommendations?error=${encodeURIComponent(message)}`,
		);
	}

	const overview = await getWorkspaceOverview(workspaceId);
	const metrics = buildGeoKpiSnapshot(overview);
	const queries = buildRetrievalQueries(metrics);
	let chunks = [];

	try {
		chunks = await retrieveRelevantKnowledge({
			supabase,
			queries,
			topK: 4,
			cap: 10,
			similarityThreshold: 0.25,
		});
	} catch (error) {
		const message =
			error instanceof Error ? error.message : "Knowledge retrieval failed.";
		redirect(
			`/${workspaceSlug}/recommendations?error=${encodeURIComponent(message)}`,
		);
	}

	const recommendations = [
		...(await generateGeoRecommendations({
			metrics,
			chunks,
			locale: prefs.locale,
		})),
		...buildCompanyBioRecommendations({
			company: overview.company,
			runs: overview.runs,
			rankings: overview.rankings,
		}),
	].slice(0, 8);
	const weakPromptIds = overview.rankings
		.filter(
			(ranking) =>
				!ranking.brand_mentioned || Number(ranking.visibility_score ?? 0) < 50,
		)
		.map((ranking) => ranking.prompt_id)
		.slice(0, 8);
	const relatedSourceDomains = [
		...new Set(overview.sources.map((source) => source.domain)),
	].slice(0, 8);

	const { error } = await supabase.from("recommendations").insert(
		recommendations.map((recommendation) => ({
			workspace_id: workspaceId,
			source_id: null,
			title: recommendation.title,
			description: recommendation.description,
			category: recommendation.category,
			priority: recommendation.priority,
			impact_score: recommendation.impactScore,
			confidence_score: recommendation.confidenceScore,
			related_prompt_ids: weakPromptIds,
			related_competitor_ids: overview.competitors
				.slice(0, 5)
				.map((competitor) => competitor.id),
			related_source_domains: relatedSourceDomains,
			evidence: {
				...recommendation.evidence,
				actionItems: recommendation.actionItems,
				ragSources: recommendation.sources,
				retrievalQueries: queries,
				retrievedChunkCount: chunks.length,
				locale: prefs.locale,
			},
		})),
	);

	if (error) {
		redirect(
			`/${workspaceSlug}/recommendations?error=${encodeURIComponent(error.message)}`,
		);
	}

	await incrementUsage(workspaceId, prefs.mode, 2);

	revalidatePath(`/${workspaceSlug}/recommendations`);
	redirect(
		`/${workspaceSlug}/recommendations?generated=${recommendations.length}`,
	);
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

export async function translateRecommendationsAction(
	workspaceId: string,
	workspaceSlug: string,
) {
	const { supabase } = await requireUser();
	const prefs = await getUserPreferences();
	const { data, error } = await supabase
		.from("recommendations")
		.select("*")
		.eq("workspace_id", workspaceId);

	if (error) {
		redirect(
			`/${workspaceSlug}/recommendations?error=${encodeURIComponent(error.message)}`,
		);
	}

	const recommendations = (data ?? []) as Recommendation[];
	let translated: Array<{
		id: string;
		title: string;
		description: string;
		actionItems: string[];
	}> = [];
	try {
		translated = await translateGeoRecommendations({
			locale: prefs.locale,
			recommendations: recommendations.map((recommendation) => {
				const actionItems = recommendation.evidence.actionItems;
				return {
					id: recommendation.id,
					title: recommendation.title,
					description: recommendation.description,
					actionItems: Array.isArray(actionItems)
						? actionItems.map(String).filter(Boolean)
						: [],
				};
			}),
		});
	} catch (translationError) {
		const message =
			translationError instanceof Error
				? translationError.message
				: "Recommendation translation failed.";
		redirect(
			`/${workspaceSlug}/recommendations?error=${encodeURIComponent(message)}`,
		);
	}

	for (const item of translated) {
		const original = recommendations.find(
			(recommendation) => recommendation.id === item.id,
		);
		if (!original) continue;

		const { error: updateError } = await supabase
			.from("recommendations")
			.update({
				title: item.title,
				description: item.description,
				evidence: {
					...original.evidence,
					actionItems: item.actionItems,
					locale: prefs.locale,
				},
				updated_at: new Date().toISOString(),
			})
			.eq("id", item.id);

		if (updateError) {
			redirect(
				`/${workspaceSlug}/recommendations?error=${encodeURIComponent(updateError.message)}`,
			);
		}
	}

	revalidatePath(`/${workspaceSlug}/recommendations`);
	redirect(`/${workspaceSlug}/recommendations?translated=${translated.length}`);
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
	const actionType =
		recommendation.category === "technical"
			? "technical"
			: recommendation.category === "sources" ||
					recommendation.category === "authority"
				? "source_review"
				: recommendation.category === "competitors"
					? "comparison"
					: "content";
	const { data: existingTask, error: existingTaskError } = await supabase
		.from("recommendation_actions")
		.select("id")
		.eq("workspace_id", workspaceId)
		.eq("source_recommendation_id", recommendation.id)
		.maybeSingle();

	if (existingTaskError) {
		redirect(
			`/${workspaceSlug}/recommendations?error=${encodeURIComponent(existingTaskError.message)}`,
		);
	}

	if (existingTask) {
		revalidatePath(`/${workspaceSlug}/recommendations`);
		revalidatePath(`/${workspaceSlug}/tasks`);
		redirect(`/${workspaceSlug}/tasks?existing=1`);
	}

	const { error } = await supabase.from("recommendation_actions").insert({
		workspace_id: workspaceId,
		recommendation_id: recommendation.id,
		source_recommendation_id: recommendation.id,
		label: recommendation.title,
		owner_id: user.id,
		assigned_to: user.id,
		priority: recommendation.priority,
		type: actionType,
		status: "pending",
	});

	if (error) {
		redirect(
			`/${workspaceSlug}/recommendations?error=${encodeURIComponent(error.message)}`,
		);
	}

	revalidatePath(`/${workspaceSlug}/recommendations`);
	revalidatePath(`/${workspaceSlug}/tasks`);
	revalidatePath(`/${workspaceSlug}/dashboard`);
	redirect(`/${workspaceSlug}/tasks?created=1`);
}

export async function startRecommendationTaskAction(
	workspaceId: string,
	workspaceSlug: string,
	recommendation: Recommendation,
) {
	const { supabase, user } = await requireUser();
	const actionType =
		recommendation.category === "technical"
			? "technical"
			: recommendation.category === "sources" ||
					recommendation.category === "authority"
				? "source_review"
				: recommendation.category === "competitors"
					? "comparison"
					: "content";
	const nowIso = new Date().toISOString();

	const { error: recommendationError } = await supabase
		.from("recommendations")
		.update({ status: "in_progress", updated_at: nowIso })
		.eq("id", recommendation.id);

	if (recommendationError) {
		redirect(
			`/${workspaceSlug}/recommendations?error=${encodeURIComponent(recommendationError.message)}`,
		);
	}

	const { data: existingTask, error: existingTaskError } = await supabase
		.from("recommendation_actions")
		.select("id")
		.eq("workspace_id", workspaceId)
		.eq("source_recommendation_id", recommendation.id)
		.maybeSingle();

	if (existingTaskError) {
		redirect(
			`/${workspaceSlug}/recommendations?error=${encodeURIComponent(existingTaskError.message)}`,
		);
	}

	if (existingTask) {
		const { error: updateTaskError } = await supabase
			.from("recommendation_actions")
			.update({
				status: "in_progress",
				completed_at: null,
				updated_at: nowIso,
			})
			.eq("id", existingTask.id);

		if (updateTaskError) {
			redirect(
				`/${workspaceSlug}/recommendations?error=${encodeURIComponent(updateTaskError.message)}`,
			);
		}
	} else {
		const { error: createTaskError } = await supabase
			.from("recommendation_actions")
			.insert({
				workspace_id: workspaceId,
				recommendation_id: recommendation.id,
				source_recommendation_id: recommendation.id,
				label: recommendation.title,
				owner_id: user.id,
				assigned_to: user.id,
				priority: recommendation.priority,
				type: actionType,
				status: "in_progress",
				completed_at: null,
				updated_at: nowIso,
			});

		if (createTaskError) {
			redirect(
				`/${workspaceSlug}/recommendations?error=${encodeURIComponent(createTaskError.message)}`,
			);
		}
	}

	revalidatePath(`/${workspaceSlug}/recommendations`);
	revalidatePath(`/${workspaceSlug}/tasks`);
	revalidatePath(`/${workspaceSlug}/dashboard`);
	redirect(`/${workspaceSlug}/tasks?started=1`);
}
