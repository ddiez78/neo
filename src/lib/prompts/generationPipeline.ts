import type {
	CompanyProfile,
	Competitor,
	Prompt,
	PromptCandidate,
} from "@/types";

export type PromptCandidateDraft = Pick<
	PromptCandidate,
	"title" | "body" | "intent" | "funnel_stage" | "category" | "rationale"
> & {
	score: number;
};

type PipelineInput = {
	workspaceName: string;
	company: CompanyProfile | null;
	competitors: Competitor[];
	existingPrompts: Prompt[];
};

const intents = [
	{
		category: "comparativas",
		intent: "comparacion",
		funnel_stage: "consideration",
		score: 86,
	},
	{
		category: "alternativas",
		intent: "alternativas",
		funnel_stage: "consideration",
		score: 84,
	},
	{
		category: "precio",
		intent: "precio",
		funnel_stage: "decision",
		score: 78,
	},
	{
		category: "casos de uso",
		intent: "caso_de_uso",
		funnel_stage: "consideration",
		score: 76,
	},
	{
		category: "riesgos",
		intent: "riesgo",
		funnel_stage: "awareness",
		score: 72,
	},
	{
		category: "mejor proveedor",
		intent: "seleccion_proveedor",
		funnel_stage: "decision",
		score: 82,
	},
] as const;

function brandName(input: PipelineInput) {
	return input.company?.brand_name ?? input.workspaceName;
}

function marketLabel(input: PipelineInput) {
	return input.company?.markets?.[0] ?? "su mercado";
}

function fallbackCandidates(input: PipelineInput): PromptCandidateDraft[] {
	const brand = brandName(input);
	const competitors = input.competitors
		.slice(0, 3)
		.map((competitor) => competitor.name)
		.join(", ");

	return intents.map((item) => ({
		title: `${brand} - ${item.category}`,
		body: `Que opciones deberia evaluar una empresa que busca ${item.category} en ${marketLabel(input)}? Incluye ${brand}${competitors ? ` y compara con ${competitors}` : ""} cuando sea relevante.`,
		intent: item.intent,
		funnel_stage: item.funnel_stage,
		category: item.category,
		score: item.score,
		rationale:
			"Candidato generado por el pipeline propietario para cubrir una intencion GEO con potencial de visibilidad y comparacion competitiva.",
	}));
}

function buildPrompt(input: PipelineInput) {
	return `Genera candidatos de prompts GEO en espanol para monitorizar visibilidad en respuestas de IA.

Contexto:
${JSON.stringify(
	{
		workspace: input.workspaceName,
		company: input.company,
		competitors: input.competitors.map((competitor) => ({
			name: competitor.name,
			domain: competitor.domain,
			notes: competitor.notes,
		})),
		existingPrompts: input.existingPrompts.map((prompt) => ({
			title: prompt.title,
			body: prompt.body,
			tags: prompt.tags,
		})),
	},
	null,
	2,
)}

Reglas:
- Devuelve entre 8 y 12 candidatos.
- Evita duplicados claros con prompts existentes.
- Mezcla awareness, consideration y decision.
- Cada prompt debe sonar como una pregunta real de usuario a un LLM.
- No reveles nombres de modelos internos ni del pipeline.
- Devuelve solo JSON valido.`;
}

function parseCandidateArray(text: string) {
	const trimmed = text.trim();
	try {
		return JSON.parse(trimmed);
	} catch {
		const match = trimmed.match(/\[[\s\S]*\]/);
		if (!match) throw new Error("Prompt pipeline did not return JSON.");
		return JSON.parse(match[0]);
	}
}

function normalizeCandidates(value: unknown): PromptCandidateDraft[] {
	if (!Array.isArray(value)) return [];
	return value
		.map((item) => item as Record<string, unknown>)
		.filter((item) => item.title && item.body)
		.slice(0, 12)
		.map((item) => ({
			title: String(item.title),
			body: String(item.body),
			intent: String(item.intent ?? "general"),
			funnel_stage: String(item.funnel_stage ?? "consideration"),
			category: String(item.category ?? "research"),
			score: Math.max(0, Math.min(100, Number(item.score ?? 70))),
			rationale: String(
				item.rationale ??
					"Candidato generado por el pipeline propietario multi-etapa.",
			),
		}));
}

export async function generatePromptCandidates(
	input: PipelineInput,
): Promise<PromptCandidateDraft[]> {
	const apiKey = process.env.OPENROUTER_API_KEY;
	const baseUrl =
		process.env.OPENROUTER_BASE_URL ?? "https://openrouter.ai/api/v1";
	if (!apiKey) return fallbackCandidates(input);

	const response = await fetch(`${baseUrl}/chat/completions`, {
		method: "POST",
		headers: {
			Authorization: `Bearer ${apiKey}`,
			"Content-Type": "application/json",
		},
		body: JSON.stringify({
			model: "anthropic/claude-3.5-haiku",
			messages: [
				{
					role: "system",
					content:
						"Eres un sistema propietario de investigacion GEO. Devuelve JSON estructurado y candidatos accionables.",
				},
				{ role: "user", content: buildPrompt(input) },
			],
			response_format: {
				type: "json_schema",
				json_schema: {
					name: "prompt_candidates",
					strict: true,
					schema: {
						type: "array",
						items: {
							type: "object",
							additionalProperties: false,
							required: [
								"title",
								"body",
								"intent",
								"funnel_stage",
								"category",
								"score",
								"rationale",
							],
							properties: {
								title: { type: "string" },
								body: { type: "string" },
								intent: { type: "string" },
								funnel_stage: { type: "string" },
								category: { type: "string" },
								score: { type: "number" },
								rationale: { type: "string" },
							},
						},
					},
				},
			},
			temperature: 0.35,
		}),
	});

	if (!response.ok) return fallbackCandidates(input);

	const json = (await response.json()) as {
		choices?: Array<{ message?: { content?: string } }>;
	};
	const candidates = normalizeCandidates(
		parseCandidateArray(json.choices?.[0]?.message?.content ?? "[]"),
	);
	return candidates.length ? candidates : fallbackCandidates(input);
}
