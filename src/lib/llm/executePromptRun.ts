import type { SupabaseClient } from "@supabase/supabase-js";
import {
	analyzeMentions,
	calculateVisibilityScore,
	extractSourceDrafts,
} from "@/lib/geo/analysis";
import type {
	CompanyProfile,
	Competitor,
	LlmProviderKey,
	Workspace,
} from "@/types";

type ExecutePromptRunInput = {
	supabase: SupabaseClient;
	workspace: Workspace;
	company: CompanyProfile | null;
	competitors: Competitor[];
	promptId: string;
	promptBody: string;
	provider: LlmProviderKey;
	model: string;
};

async function generateResponse(input: {
	promptBody: string;
	workspace: Workspace;
	company: CompanyProfile | null;
	model: string;
}) {
	const apiKey = process.env.OPENROUTER_API_KEY;
	const baseUrl =
		process.env.OPENROUTER_BASE_URL ?? "https://openrouter.ai/api/v1";
	if (!apiKey) {
		return [
			`Simulated GEO answer for ${input.company?.brand_name ?? input.workspace.name}.`,
			`${input.company?.brand_name ?? input.workspace.name} appears as a relevant option with neutral sentiment.`,
			input.company?.website ? `Official source: ${input.company.website}` : "",
			"Additional third-party validation should be strengthened with comparison pages and reviews.",
		]
			.filter(Boolean)
			.join(" ");
	}

	const response = await fetch(`${baseUrl}/chat/completions`, {
		method: "POST",
		headers: {
			Authorization: `Bearer ${apiKey}`,
			"Content-Type": "application/json",
		},
		body: JSON.stringify({
			model: input.model,
			messages: [
				{
					role: "system",
					content:
						"You answer like a search-informed AI assistant. Include useful citations as URLs when possible.",
				},
				{ role: "user", content: input.promptBody },
			],
		}),
	});

	if (!response.ok) {
		throw new Error(
			`OpenRouter error ${response.status}: ${await response.text()}`,
		);
	}

	const json = (await response.json()) as {
		choices?: Array<{ message?: { content?: string } }>;
	};
	return json.choices?.[0]?.message?.content ?? "";
}

export async function executePromptRun(input: ExecutePromptRunInput) {
	const startedAt = new Date().toISOString();
	try {
		const responseText = await generateResponse(input);
		const mentions = analyzeMentions({
			responseText,
			company: input.company,
			workspaceName: input.workspace.name,
			competitors: input.competitors,
		});
		const sources = extractSourceDrafts({
			responseText,
			company: input.company,
			competitors: input.competitors,
		});
		const visibilityScore = calculateVisibilityScore({
			brandMentioned: mentions.brandMentioned,
			brandPosition: mentions.brandPosition,
			competitorMentions: mentions.competitorsMentioned.length,
			sentiment: mentions.sentiment,
			sourceCount: sources.length,
			clientSourceCount: sources.filter((source) => source.is_client_domain)
				.length,
		});
		const promptTokens = Math.max(10, Math.round(input.promptBody.length / 4));
		const completionTokens = Math.max(10, Math.round(responseText.length / 4));
		const totalCost = Number(
			((promptTokens + completionTokens) * 0.0000008).toFixed(6),
		);

		const { data: run, error: runError } = await input.supabase
			.from("prompt_runs")
			.insert({
				workspace_id: input.workspace.id,
				prompt_id: input.promptId,
				provider: input.provider,
				model: input.model,
				status: "completed",
				input_text: input.promptBody,
				response_text: responseText,
				sentiment: mentions.sentiment,
				brand_mentioned: mentions.brandMentioned,
				brand_position: mentions.brandPosition,
				first_competitor_position: mentions.firstCompetitorPosition,
				visibility_score: visibilityScore,
				competitors_mentioned: mentions.competitorsMentioned,
				source_count: sources.length,
				prompt_tokens: promptTokens,
				completion_tokens: completionTokens,
				total_cost: totalCost,
				started_at: startedAt,
				completed_at: new Date().toISOString(),
			})
			.select("*")
			.single();

		if (runError || !run) {
			throw new Error(runError?.message ?? "Run insert failed");
		}

		if (mentions.mentions.length > 0) {
			await input.supabase.from("prompt_run_mentions").insert(
				mentions.mentions.map((mention) => ({
					workspace_id: input.workspace.id,
					prompt_run_id: run.id,
					entity_name: mention.entity_name,
					entity_type: mention.entity_type,
					sentiment: mention.sentiment,
					position_index: mention.position_index,
					rank_group: mention.rank_group,
					mention_context: mention.mention_context,
					confidence: mention.confidence,
				})),
			);
		}

		if (sources.length > 0) {
			await input.supabase.from("prompt_run_sources").insert(
				sources.map((source) => ({
					workspace_id: input.workspace.id,
					prompt_run_id: run.id,
					...source,
				})),
			);
		}

		await input.supabase
			.from("prompts")
			.update({ last_run_at: new Date().toISOString() })
			.eq("id", input.promptId);

		return run;
	} catch (error) {
		const message =
			error instanceof Error ? error.message : "Unknown prompt run error";
		const { data } = await input.supabase
			.from("prompt_runs")
			.insert({
				workspace_id: input.workspace.id,
				prompt_id: input.promptId,
				provider: input.provider,
				model: input.model,
				status: "failed",
				input_text: input.promptBody,
				sentiment: "no_data",
				brand_mentioned: false,
				competitors_mentioned: [],
				prompt_tokens: Math.max(10, Math.round(input.promptBody.length / 4)),
				completion_tokens: 0,
				total_cost: 0,
				error_message: message,
				started_at: startedAt,
				completed_at: new Date().toISOString(),
			})
			.select("*")
			.single();
		return data;
	}
}
