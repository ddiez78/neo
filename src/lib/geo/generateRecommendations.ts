import type { RecommendationCategory } from "@/types";
import type { GeoKpiSnapshot, KnowledgeChunkMatch } from "./knowledgeRetrieval";

type RecommendationLocale = "es" | "en";

export type GeoRecommendation = {
	title: string;
	description: string;
	priority: number;
	category: RecommendationCategory;
	impactScore: number;
	confidenceScore: number;
	actionItems: string[];
	sources: string[];
	evidence: Record<string, unknown>;
};

const allowedCategories = new Set<RecommendationCategory>([
	"entity",
	"content",
	"sources",
	"competitors",
	"prompts",
	"technical",
	"authority",
	"sentiment",
]);

function clampScore(value: unknown, fallback: number) {
	const number = Number(value);
	if (!Number.isFinite(number)) {
		return fallback;
	}
	return Math.max(0, Math.min(100, Math.round(number)));
}

function clampPriority(value: unknown) {
	const number = Number(value);
	if (!Number.isFinite(number)) {
		return 3;
	}
	return Math.max(1, Math.min(5, Math.round(number)));
}

function sourceLabel(chunk: KnowledgeChunkMatch) {
	return chunk.heading_path.length
		? `${chunk.source_file} > ${chunk.heading_path.join(" > ")}`
		: chunk.source_file;
}

function uniqueSources(chunks: KnowledgeChunkMatch[], category?: string) {
	return [
		...new Set(
			chunks
				.filter((chunk) => !category || chunk.category === category)
				.slice(0, 4)
				.map((chunk) => chunk.source_file),
		),
	];
}

function fallbackRecommendations(input: {
	metrics: GeoKpiSnapshot;
	chunks: KnowledgeChunkMatch[];
	locale: RecommendationLocale;
}) {
	const recommendations: GeoRecommendation[] = [];
	const isEn = input.locale === "en";

	if (
		input.metrics.visibility < 50 ||
		input.metrics.shareOfVoice < 30 ||
		input.metrics.consistency < 60
	) {
		recommendations.push({
			title: isEn
				? "Prioritize prompts where brand visibility is weakest"
				: "Prioriza los prompts donde la marca tiene menos visibilidad",
			description: isEn
				? "Create or refresh content that directly answers the monitored prompts where the brand is absent, then rerun those prompts to measure visibility, SOV, and consistency movement."
				: "Crea o actualiza contenido que responda directamente a los prompts donde la marca no aparece. Después vuelve a ejecutar esos prompts para medir visibilidad, SOV y consistencia.",
			priority: 5,
			category: "content",
			impactScore: 86,
			confidenceScore: input.chunks.length ? 78 : 65,
			actionItems: isEn
				? [
						"Group weak prompts by buyer intent, provider, and competitor winner.",
						"Publish or refresh answer sections that state the category, use case, and proof in the first paragraph.",
						"Rerun prompts after publication and compare visibility, SOV, and consistency over the next seven days.",
					]
				: [
						"Agrupa los prompts debiles por intencion de compra, proveedor y competidor que aparece mejor posicionado.",
						"Publica o actualiza secciones de respuesta que expliquen categoria, caso de uso y prueba en el primer parrafo.",
						"Vuelve a ejecutar los prompts tras publicar y compara visibilidad, SOV y consistencia durante los siguientes siete dias.",
					],
			sources: uniqueSources(input.chunks, "measurement"),
			evidence: { reason: "low_visibility_or_sov" },
		});
	}

	if (input.metrics.avgPosition == null || input.metrics.avgPosition > 3) {
		recommendations.push({
			title: isEn
				? "Improve answer position with clearer proof points"
				: "Mejora la posicion en las respuestas con pruebas mas claras",
			description: isEn
				? "Strengthen official copy, comparison language, and third-party proof so LLM answers can rank the brand above generic alternatives and competitors."
				: "Refuerza los textos oficiales, las comparativas y las pruebas externas para que los modelos puedan situar la marca por encima de alternativas genericas y competidores.",
			priority: 4,
			category: "entity",
			impactScore: 78,
			confidenceScore: input.chunks.length ? 74 : 62,
			actionItems: isEn
				? [
						"Normalize brand descriptions across homepage, about page, social profiles, and third-party listings.",
						"Add concise category, use-case, and differentiation claims to official pages.",
						"Support claims with customer evidence, integrations, pricing, benchmarks, or case studies.",
						"Track average brand position after the next prompt run batch.",
					]
				: [
						"Unifica la descripcion de marca en home, pagina sobre la empresa, perfiles sociales y listados externos.",
						"Anade claims breves sobre categoria, casos de uso y diferenciacion en paginas oficiales.",
						"Respalda los claims con clientes, integraciones, precios, benchmarks o casos de exito.",
						"Mide la posicion media de la marca despues del siguiente lote de prompts.",
					],
			sources: uniqueSources(input.chunks, "entity"),
			evidence: { reason: "weak_position" },
		});
	}

	if (
		input.metrics.sourceCount === 0 ||
		input.metrics.clientSourceCount === 0 ||
		input.metrics.sourceDiversity < 3
	) {
		recommendations.push({
			title: isEn
				? "Build citation coverage from authoritative sources"
				: "Aumenta la cobertura de citas en fuentes con autoridad",
			description: isEn
				? "Increase the number of credible owned and third-party pages that mention the brand, because cited source coverage is currently too thin for reliable AI recommendations."
				: "Aumenta el numero de paginas propias y externas fiables que mencionan la marca. Ahora mismo hay poca cobertura de fuentes para que la IA recomiende la marca con seguridad.",
			priority: 5,
			category: "authority",
			impactScore: 82,
			confidenceScore: input.chunks.length ? 76 : 64,
			actionItems: isEn
				? [
						"Create or improve official pages with self-contained definitions, claims, and proof points.",
						"Target directories, comparison pages, review sites, partner pages, YouTube, Reddit, and industry publications.",
						"Prioritize sources that already appear in prompt responses or competitor answers.",
					]
				: [
						"Crea o mejora paginas oficiales con definiciones, claims y pruebas que se entiendan sin contexto adicional.",
						"Trabaja directorios, comparativas, sitios de reviews, partners, YouTube, Reddit y medios del sector.",
						"Prioriza fuentes que ya aparecen en respuestas de prompts o en respuestas donde ganan competidores.",
					],
			sources: uniqueSources(input.chunks, "authority"),
			evidence: { reason: "missing_sources" },
		});
	}

	if (
		input.metrics.negativeSentimentRate > 10 ||
		input.metrics.positiveSentimentRate < 40
	) {
		recommendations.push({
			title: isEn
				? "Repair AI answer sentiment with stronger proof"
				: "Corrige el sentimiento de las respuestas con pruebas mas solidas",
			description: isEn
				? "Improve how AI systems frame the brand by publishing clearer proof points and reducing ambiguity around weaknesses, pricing, support, or positioning."
				: "Mejora como los sistemas de IA presentan la marca publicando pruebas mas claras y reduciendo dudas sobre debilidades, precio, soporte o posicionamiento.",
			priority: input.metrics.negativeSentimentRate > 10 ? 5 : 4,
			category: "sentiment",
			impactScore: 76,
			confidenceScore: input.chunks.length ? 72 : 60,
			actionItems: isEn
				? [
						"Review neutral and negative prompt responses to identify repeated objections.",
						"Add factual counter-evidence, customer proof, and comparison context to owned pages.",
						"Seek third-party mentions that reinforce the desired positioning.",
					]
				: [
						"Revisa respuestas neutras y negativas para detectar objeciones repetidas.",
						"Anade contraevidencia factual, pruebas de clientes y contexto comparativo en paginas propias.",
						"Consigue menciones externas que refuercen el posicionamiento deseado.",
					],
			sources: uniqueSources(input.chunks),
			evidence: { reason: "weak_sentiment" },
		});
	}

	if (
		input.metrics.competitorPressure > Math.max(50, input.metrics.shareOfVoice)
	) {
		recommendations.push({
			title: isEn
				? "Create comparison content for competitor-led prompts"
				: "Crea contenido comparativo para prompts dominados por competidores",
			description: isEn
				? "Competitors are appearing more often than the brand in AI answers, so the next content sprint should address alternatives, comparisons, and category-selection criteria."
				: "Los competidores aparecen mas que la marca en respuestas de IA. El siguiente sprint de contenido debe cubrir alternativas, comparativas y criterios de decision.",
			priority: 4,
			category: "competitors",
			impactScore: 80,
			confidenceScore: input.chunks.length ? 74 : 61,
			actionItems: isEn
				? [
						"Identify prompts where competitors appear without the brand.",
						"Publish comparison and alternatives pages with neutral, evidence-backed positioning.",
						"Add sourceable differentiators that AI answers can reuse without surrounding context.",
					]
				: [
						"Identifica prompts donde aparecen competidores y la marca no aparece.",
						"Publica paginas de comparativa y alternativas con posicionamiento neutral y respaldado por pruebas.",
						"Anade diferenciadores citables que una respuesta de IA pueda reutilizar sin contexto adicional.",
					],
			sources: uniqueSources(input.chunks, "content"),
			evidence: { reason: "competitor_pressure" },
		});
	}

	if (input.metrics.topFunnelCoverage < 20) {
		recommendations.push({
			title: isEn
				? "Expand top-funnel prompt and topic coverage"
				: "Amplia la cobertura de prompts informativos",
			description: isEn
				? "The monitoring set underrepresents informational discovery prompts, which limits visibility into how AI systems understand the broader category."
				: "El set de monitorizacion tiene pocos prompts informativos. Eso limita la visibilidad sobre como la IA entiende la categoria completa.",
			priority: 3,
			category: "prompts",
			impactScore: 68,
			confidenceScore: input.chunks.length ? 70 : 58,
			actionItems: isEn
				? [
						"Add educational prompts for definitions, benefits, use cases, risks, and best practices.",
						"Map each prompt to one extractable content section or FAQ answer.",
						"Use query fan-out style variants to cover adjacent user intents.",
					]
				: [
						"Anade prompts educativos sobre definiciones, beneficios, casos de uso, riesgos y buenas practicas.",
						"Asocia cada prompt a una seccion de contenido extraible o una respuesta FAQ.",
						"Usa variantes tipo query fan-out para cubrir intenciones de usuario cercanas.",
					],
			sources: uniqueSources(input.chunks, "content"),
			evidence: { reason: "top_funnel_gap" },
		});
	}

	return recommendations.slice(0, 4);
}

function buildPrompt(input: {
	metrics: GeoKpiSnapshot;
	chunks: KnowledgeChunkMatch[];
	locale: RecommendationLocale;
}) {
	const knowledge = input.chunks
		.map(
			(chunk, index) =>
				`[${index + 1}] source_file: ${chunk.source_file}\nsource_title: ${chunk.source_title}\nsource_url: ${chunk.source_url ?? ""}\nsource_domain: ${chunk.source_domain ?? ""}\ncategory: ${chunk.category ?? ""}\nauthority_tier: ${chunk.authority_tier ?? 3}\nbreadcrumb: ${sourceLabel(chunk)}\nsimilarity: ${Number(chunk.similarity).toFixed(3)}\ncontent:\n${chunk.content}`,
		)
		.join("\n\n---\n\n");

	const languageInstruction =
		input.locale === "en"
			? "Write every user-facing field in English."
			: "Escribe todos los campos visibles para el usuario en espanol claro, directo y accesible. Manten terminos tecnicos habituales como SOV, prompts, GEO y SEO cuando aporten precision.";

	return `Workspace KPI snapshot:
${JSON.stringify(input.metrics, null, 2)}

Retrieved GEO knowledge chunks:
${knowledge || "No retrieved chunks available."}

Return 3 to 5 recommendations as JSON only. Each recommendation must include:
title, description, priority (1-5), category, impactScore, confidenceScore, actionItems, sources, evidence.

Rules:
- ${languageInstruction}
- category must be one of entity, content, sources, competitors, prompts, technical, authority, sentiment.
- sources must cite existing source_file values from the retrieved chunks only.
- tie each recommendation to one or two weakest KPIs: visibility, shareOfVoice, consistency, avgPosition, source diversity, sentiment, competitor pressure, or top-funnel coverage.
- prefer higher authority_tier sources when evidence conflicts.
- do not recommend unsupported GEO hacks; prioritize durable SEO/GEO fundamentals, entity clarity, extractability, source authority, and measurement.
- make the actionItems specific enough for a marketing or SEO operator to execute.`;
}

function parseJsonArray(text: string) {
	const trimmed = text.trim();
	try {
		return JSON.parse(trimmed);
	} catch {
		const match = trimmed.match(/\[[\s\S]*\]/);
		if (!match) {
			throw new Error("Recommendation model did not return a JSON array.");
		}
		return JSON.parse(match[0]);
	}
}

function buildTranslationPrompt(input: {
	locale: RecommendationLocale;
	recommendations: Array<{
		id: string;
		title: string;
		description: string;
		actionItems: string[];
	}>;
}) {
	const language =
		input.locale === "en"
			? "English"
			: "Spanish from Spain, clear and accessible for marketing and SEO teams";

	return `Translate these GEO recommendations to ${language}.
Return JSON only as an array with: id, title, description, actionItems.
Keep the same ids. Keep SEO/GEO terms like SOV, prompts, SEO and GEO when they are useful.
Do not add new recommendations.

Recommendations:
${JSON.stringify(input.recommendations, null, 2)}`;
}

function normalizeRecommendations(
	value: unknown,
	validSources: Set<string>,
	metrics: GeoKpiSnapshot,
	locale: RecommendationLocale,
) {
	if (!Array.isArray(value)) {
		throw new Error("Recommendation JSON must be an array.");
	}

	return value.slice(0, 5).map((item) => {
		const record = item as Record<string, unknown>;
		const category = allowedCategories.has(
			record.category as RecommendationCategory,
		)
			? (record.category as RecommendationCategory)
			: "content";
		const sources = Array.isArray(record.sources)
			? record.sources.map(String).filter((source) => validSources.has(source))
			: [];

		return {
			title: String(
				record.title ??
					(locale === "en"
						? "Improve GEO performance"
						: "Mejorar el rendimiento GEO"),
			),
			description: String(record.description ?? ""),
			priority: clampPriority(record.priority),
			category,
			impactScore: clampScore(record.impactScore, 70),
			confidenceScore: clampScore(
				record.confidenceScore,
				sources.length ? 78 : 60,
			),
			actionItems: Array.isArray(record.actionItems)
				? record.actionItems.map(String).filter(Boolean).slice(0, 5)
				: [],
			sources,
			evidence: {
				...(typeof record.evidence === "object" && record.evidence
					? (record.evidence as Record<string, unknown>)
					: {}),
				metrics,
			},
		};
	});
}

export async function generateGeoRecommendations(input: {
	metrics: GeoKpiSnapshot;
	chunks: KnowledgeChunkMatch[];
	locale?: RecommendationLocale;
}) {
	const locale = input.locale ?? "es";
	const apiKey = process.env.OPENROUTER_API_KEY;
	if (!apiKey) {
		return fallbackRecommendations({ ...input, locale });
	}

	const response = await fetch(
		"https://openrouter.ai/api/v1/chat/completions",
		{
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
							locale === "en"
								? "You are a senior GEO strategist. Use only provided context, cite source_file values, and return valid JSON only."
								: "Eres un estratega senior de GEO. Usa solo el contexto proporcionado, cita valores source_file y devuelve solo JSON valido.",
					},
					{ role: "user", content: buildPrompt({ ...input, locale }) },
				],
				temperature: 0.2,
			}),
		},
	);

	if (!response.ok) {
		return fallbackRecommendations({ ...input, locale });
	}

	const json = (await response.json()) as {
		choices?: Array<{ message?: { content?: string } }>;
	};
	const content = json.choices?.[0]?.message?.content ?? "[]";
	const validSources = new Set(input.chunks.map((chunk) => chunk.source_file));

	try {
		const recommendations = normalizeRecommendations(
			parseJsonArray(content),
			validSources,
			input.metrics,
			locale,
		);
		return recommendations.length
			? recommendations
			: fallbackRecommendations({ ...input, locale });
	} catch {
		return fallbackRecommendations({ ...input, locale });
	}
}

export async function translateGeoRecommendations(input: {
	locale: RecommendationLocale;
	recommendations: Array<{
		id: string;
		title: string;
		description: string;
		actionItems: string[];
	}>;
}) {
	const apiKey = process.env.OPENROUTER_API_KEY;
	if (!apiKey || input.recommendations.length === 0) {
		return [];
	}

	const response = await fetch(
		"https://openrouter.ai/api/v1/chat/completions",
		{
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
							"You translate product recommendations faithfully. Return valid JSON only.",
					},
					{ role: "user", content: buildTranslationPrompt(input) },
				],
				temperature: 0.1,
			}),
		},
	);

	if (!response.ok) {
		throw new Error("Recommendation translation failed.");
	}

	const json = (await response.json()) as {
		choices?: Array<{ message?: { content?: string } }>;
	};
	const parsed = parseJsonArray(json.choices?.[0]?.message?.content ?? "[]");
	if (!Array.isArray(parsed)) {
		return [];
	}

	return parsed
		.map((item) => item as Record<string, unknown>)
		.filter((item) => typeof item.id === "string")
		.map((item) => ({
			id: String(item.id),
			title: String(item.title ?? ""),
			description: String(item.description ?? ""),
			actionItems: Array.isArray(item.actionItems)
				? item.actionItems.map(String).filter(Boolean)
				: [],
		}));
}
