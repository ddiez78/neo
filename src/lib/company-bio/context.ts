import type { CompanyProfile, PromptRanking, PromptRun } from "@/types";

const coreFields = [
	"brand_name",
	"website",
	"description",
	"business_type",
	"country",
	"market",
	"language",
	"locations",
	"categories",
	"value_proposition",
	"target_audience",
	"products_services",
	"key_features",
	"pricing_strategy",
	"social_proof",
] as const;

function compactArray(values?: string[] | null) {
	return (values ?? []).map((value) => value.trim()).filter(Boolean);
}

function hasText(value?: string | null) {
	return Boolean(value?.trim());
}

function hasArray(values?: string[] | null) {
	return compactArray(values).length > 0;
}

function includesAny(text: string, values?: string[] | null) {
	const normalized = text.toLowerCase();
	return compactArray(values).some((value) =>
		normalized.includes(value.toLowerCase()),
	);
}

export function buildCompanyBioContext(company: CompanyProfile | null) {
	if (!company) {
		return {
			summary: "No hay Company Bio verificada todavia.",
			verifiedFacts: [],
			approvedClaims: [],
			prohibitedClaims: [],
			aliases: [],
		};
	}

	const verifiedFacts = [
		`Marca: ${company.brand_name}`,
		company.website ? `Web oficial: ${company.website}` : "",
		company.description ? `Descripcion: ${company.description}` : "",
		company.business_type ? `Tipo de negocio: ${company.business_type}` : "",
		company.country ? `Pais: ${company.country}` : "",
		company.market ? `Mercado principal: ${company.market}` : "",
		hasArray(company.locations)
			? `Ubicaciones: ${compactArray(company.locations).join(", ")}`
			: "",
		hasArray(company.categories)
			? `Categorias: ${compactArray(company.categories).join(", ")}`
			: "",
		hasArray(company.products_services)
			? `Productos/servicios: ${compactArray(company.products_services).join(", ")}`
			: hasArray(company.products)
				? `Productos/servicios: ${compactArray(company.products).join(", ")}`
				: "",
		company.value_proposition
			? `Propuesta de valor: ${company.value_proposition}`
			: "",
		company.target_audience
			? `Audiencia objetivo: ${company.target_audience}`
			: "",
		company.pricing_strategy
			? `Estrategia de precio: ${company.pricing_strategy}`
			: "",
	]
		.filter(Boolean)
		.map(String);

	return {
		summary: verifiedFacts.slice(0, 8).join("\n"),
		verifiedFacts,
		approvedClaims: compactArray(company.approved_claims),
		prohibitedClaims: compactArray(company.prohibited_claims),
		aliases: compactArray(company.aliases),
	};
}

export function scoreCompanyUnderstanding(input: {
	company: CompanyProfile | null;
	runs?: PromptRun[];
	rankings?: PromptRanking[];
}) {
	const { company, runs = [], rankings = [] } = input;
	if (!company) {
		return {
			score: 0,
			completeness: 0,
			verifiedCount: 0,
			totalVerificationFields: coreFields.length,
			status: "Urgente",
			misunderstoodFacts: [
				"Completa la Company Bio para fijar la verdad de marca.",
			],
			entityGaps: ["Falta informacion base de entidad."],
			nextAction: "Completar Company Bio",
		};
	}

	const presentFields = [
		hasText(company.brand_name),
		hasText(company.website),
		hasText(company.description),
		hasText(company.business_type),
		hasText(company.country),
		hasText(company.market),
		hasText(company.language),
		hasArray(company.locations),
		hasArray(company.categories),
		hasText(company.value_proposition),
		hasText(company.target_audience),
		hasArray(company.products_services) || hasArray(company.products),
		hasArray(company.key_features),
		hasText(company.pricing_strategy),
		hasArray(company.social_proof),
	].filter(Boolean).length;
	const completeness = Math.round((presentFields / 15) * 100);
	const verification = company.field_verification ?? {};
	const verifiedCount = coreFields.filter(
		(field) => verification[field],
	).length;
	const verifiedScore = Math.round((verifiedCount / coreFields.length) * 100);
	const responseText = runs
		.map((run) => run.response_text ?? "")
		.join("\n")
		.toLowerCase();
	const services = hasArray(company.products_services)
		? company.products_services
		: company.products;
	const missingServices = compactArray(services)
		.filter(
			(service) =>
				responseText && !responseText.includes(service.toLowerCase()),
		)
		.slice(0, 4);
	const missingProof =
		hasArray(company.social_proof) &&
		!includesAny(responseText, company.social_proof)
			? compactArray(company.social_proof).slice(0, 3)
			: [];
	const weakRankings = rankings.filter(
		(ranking) =>
			!ranking.brand_mentioned || Number(ranking.visibility_score ?? 0) < 45,
	);
	const misunderstoodFacts = [
		...compactArray(company.misunderstood_facts),
		...missingServices.map(
			(service) => `La IA no esta mencionando el servicio: ${service}.`,
		),
		...missingProof.map(
			(proof) => `La IA no esta usando esta prueba: ${proof}.`,
		),
	].slice(0, 6);
	const entityGaps = [
		...compactArray(company.entity_gaps),
		!hasText(company.pricing_strategy)
			? "Falta explicar precios o condiciones."
			: "",
		!hasArray(company.social_proof) ? "Faltan pruebas sociales claras." : "",
		!hasArray(company.locations)
			? "Faltan ubicaciones o area de servicio."
			: "",
		weakRankings.length > 0
			? `${weakRankings.length} prompts muestran baja comprension de marca.`
			: "",
	]
		.filter(Boolean)
		.map(String)
		.slice(0, 6);
	const score = Math.round(
		completeness * 0.5 +
			verifiedScore * 0.35 +
			Math.max(0, 100 - entityGaps.length * 12) * 0.15,
	);
	const status = score >= 75 ? "Bien" : score >= 50 ? "Mejorable" : "Urgente";
	const nextAction =
		entityGaps[0] ??
		misunderstoodFacts[0] ??
		"Revisar y mantener actualizada la Company Bio.";

	return {
		score,
		completeness,
		verifiedCount,
		totalVerificationFields: coreFields.length,
		status,
		misunderstoodFacts,
		entityGaps,
		nextAction,
	};
}
