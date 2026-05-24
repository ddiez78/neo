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
	context?: {
		brandName?: string;
		website?: string;
		description?: string;
		country?: string;
		market?: string;
		segment?: string;
		services?: string;
		audience?: string;
		differentiators?: string;
		competitors?: string[];
		language?: string;
		promptCount?: number;
		intents?: string[];
		specificity?: string;
	};
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
	return (
		input.context?.brandName || input.company?.brand_name || input.workspaceName
	);
}

function marketLabel(input: PipelineInput) {
	return input.context?.market || input.company?.markets?.[0] || "su mercado";
}

function fallbackCandidates(input: PipelineInput): PromptCandidateDraft[] {
	const brand = brandName(input);
	const desiredCount = Math.max(
		6,
		Math.min(60, input.context?.promptCount ?? 12),
	);
	const competitors = (
		input.context?.competitors?.length
			? input.context.competitors
			: input.competitors.map((competitor) => competitor.name)
	).slice(0, 8);
	const services = (
		input.context?.services || input.company?.products?.join(", ")
	)
		?.split(",")
		.map((item) => item.trim())
		.filter(Boolean);
	const topics = services?.length ? services : [marketLabel(input)];
	const templates = [
		"Que mejores opciones existen para {topic} en {market}?",
		"Que alternativa a {competitor} deberia evaluar una empresa para {topic}?",
		"Compara {brand} con {competitor} para {topic}.",
		"Que proveedor recomiendan los expertos para {topic} en {market}?",
		"Cuanto cuesta resolver {topic} y que marcas destacan?",
		"Que riesgos deberia revisar antes de elegir una solucion de {topic}?",
		"Que empresa es mejor para {audience} que busca {topic}?",
		"Que fuentes fiables recomiendan herramientas de {topic}?",
	];

	const candidates: PromptCandidateDraft[] = [];
	for (let index = 0; candidates.length < desiredCount; index++) {
		const item = intents[index % intents.length];
		const topic = topics[index % topics.length] ?? marketLabel(input);
		const competitor =
			competitors[index % Math.max(1, competitors.length)] ??
			"competidores principales";
		const template = templates[index % templates.length];
		const body = template
			.replaceAll("{brand}", brand)
			.replaceAll("{competitor}", competitor)
			.replaceAll("{topic}", topic)
			.replaceAll("{market}", marketLabel(input))
			.replaceAll(
				"{audience}",
				input.context?.audience || "clientes potenciales",
			);
		candidates.push({
			title: `${brand} - ${item.category} ${Math.floor(index / intents.length) + 1}`,
			body,
			intent: item.intent,
			funnel_stage: item.funnel_stage,
			category: item.category,
			score: Math.max(55, item.score - Math.floor(index / intents.length) * 3),
			rationale:
				"Candidato generado por el pipeline propietario para cubrir una intencion GEO con potencial de visibilidad, fuentes y comparacion competitiva.",
		});
	}
	return candidates;
}

function buildPrompt(input: PipelineInput) {
	return `Genera candidatos de prompts GEO en espanol para monitorizar visibilidad en respuestas de IA.

Contexto:
${JSON.stringify(
	{
		workspace: input.workspaceName,
		company: input.company,
		contextoEditable: input.context,
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
- Devuelve exactamente ${Math.max(6, Math.min(60, input.context?.promptCount ?? 12))} candidatos.
- Evita duplicados claros con prompts existentes.
- Mezcla awareness, consideration y decision.
- Cubre estas intenciones si se indican: ${(input.context?.intents ?? []).join(", ") || "awareness, comparacion, alternativas, precio, riesgos, local y decision"}.
- Cada prompt debe sonar como una pregunta real de usuario a un LLM.
- Usa idioma ${input.context?.language ?? "es"}.
- Nivel de especificidad: ${input.context?.specificity ?? "medio"}.
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
