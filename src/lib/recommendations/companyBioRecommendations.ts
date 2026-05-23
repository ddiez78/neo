import { scoreCompanyUnderstanding } from "@/lib/company-bio/context";
import type {
	CompanyProfile,
	PromptRanking,
	PromptRun,
	RecommendationCategory,
} from "@/types";

type CompanyBioRecommendation = {
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

function hasItems(values?: string[] | null) {
	return Boolean(values?.filter(Boolean).length);
}

export function buildCompanyBioRecommendations(input: {
	company: CompanyProfile | null;
	runs: PromptRun[];
	rankings: PromptRanking[];
}) {
	const { company, runs, rankings } = input;
	const understanding = scoreCompanyUnderstanding({ company, runs, rankings });
	const recommendations: CompanyBioRecommendation[] = [];
	if (!company) {
		recommendations.push({
			title: "Completa la Company Bio verificada",
			description:
				"La IA necesita una verdad de marca clara para que las recomendaciones, informes y deteccion de gaps sean fiables.",
			priority: 5,
			category: "entity",
			impactScore: 88,
			confidenceScore: 92,
			actionItems: [
				"Completa nombre, web, descripcion, mercado y servicios.",
				"Marca como verificados los campos aprobados por la empresa.",
				"Anade claims permitidos y claims que la IA no debe inventar.",
			],
			sources: [],
			evidence: { reason: "missing_company_bio", companyBio: understanding },
		});
		return recommendations;
	}

	if (understanding.completeness < 70 || understanding.verifiedCount < 6) {
		recommendations.push({
			title: "Refuerza la verdad verificada de la empresa",
			description:
				"Hay campos importantes sin completar o verificar. Esto limita la capacidad de detectar si los modelos entienden bien la marca.",
			priority: 4,
			category: "entity",
			impactScore: 82,
			confidenceScore: 86,
			actionItems: [
				"Verifica descripcion, categoria, ubicaciones y servicios principales.",
				"Anade propuesta de valor y publico objetivo.",
				"Revisa los gaps de entidad y guarda la Company Bio.",
			],
			sources: [],
			evidence: {
				reason: "low_company_understanding",
				companyBio: understanding,
			},
		});
	}

	if (!company.pricing_strategy) {
		recommendations.push({
			title: "Aclara precios o condiciones comerciales",
			description:
				"Los prompts de decision suelen incluir presupuesto, precio o condiciones. Si esta informacion no esta clara, la IA puede favorecer competidores mas comparables.",
			priority: 3,
			category: "content",
			impactScore: 72,
			confidenceScore: 74,
			actionItems: [
				"Define como explicar precios, rangos o condiciones sin comprometer ventas.",
				"Anade esta informacion a la pagina de servicio o producto.",
				"Vuelve a ejecutar prompts de precio y comparacion.",
			],
			sources: [],
			evidence: {
				reason: "missing_pricing_strategy",
				companyBio: understanding,
			},
		});
	}

	if (!hasItems(company.social_proof)) {
		recommendations.push({
			title: "Anade pruebas de confianza reutilizables por la IA",
			description:
				"Faltan senales claras de confianza como reseñas, certificaciones, clientes, casos o anos de experiencia.",
			priority: 4,
			category: "sentiment",
			impactScore: 78,
			confidenceScore: 78,
			actionItems: [
				"Recopila 3-5 pruebas de confianza reales.",
				"Incluyelas en Company Bio y en paginas clave.",
				"Usa esas pruebas en FAQs, comparativas y paginas de servicio.",
			],
			sources: [],
			evidence: { reason: "missing_social_proof", companyBio: understanding },
		});
	}

	if (understanding.misunderstoodFacts.length > 0) {
		recommendations.push({
			title: "Corrige hechos que la IA esta entendiendo mal",
			description:
				"Hay servicios, pruebas o datos de marca que no aparecen correctamente en respuestas recientes.",
			priority: 5,
			category: "prompts",
			impactScore: 84,
			confidenceScore: 80,
			actionItems: [
				"Revisa los hechos marcados como mal entendidos.",
				"Actualiza paginas oficiales con frases claras y citables.",
				"Ejecuta de nuevo los prompts afectados para medir el cambio.",
			],
			sources: [],
			evidence: {
				reason: "misunderstood_company_facts",
				companyBio: understanding,
			},
		});
	}

	return recommendations.slice(0, 4);
}
