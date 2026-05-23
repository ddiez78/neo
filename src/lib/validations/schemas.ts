import { z } from "zod";

export const providerKeys = [
	"chatgpt",
	"claude",
	"gemini",
	"perplexity",
	"deepseek",
] as const;

export const workspaceSchema = z.object({
	name: z.string().min(2, "El workspace necesita un nombre."),
	website: z
		.string()
		.url("Introduce una URL valida.")
		.optional()
		.or(z.literal("")),
	industry: z.string().optional(),
	country_code: z.string().min(2).max(2).default("ES"),
	locale: z.string().default("es-ES"),
	timezone: z.string().default("Europe/Madrid"),
});

export const companyProfileSchema = z.object({
	brand_name: z.string().min(2, "Indica el nombre de la marca."),
	website: z
		.string()
		.url("Introduce una URL valida.")
		.optional()
		.or(z.literal("")),
	description: z
		.string()
		.min(20, "Describe la empresa con algo mas de detalle."),
	products: z.string().optional(),
	keywords: z.string().optional(),
	markets: z.string().optional(),
	tone: z.string().optional(),
	official_urls: z.string().optional(),
	business_type: z.string().default("local"),
	country: z.string().optional(),
	market: z.string().optional(),
	language: z.string().default("es"),
	locations: z.string().optional(),
	categories: z.string().optional(),
	subcategories: z.string().optional(),
	value_proposition: z.string().optional(),
	target_audience: z.string().optional(),
	products_services: z.string().optional(),
	key_features: z.string().optional(),
	pricing_strategy: z.string().optional(),
	revenue_streams: z.string().optional(),
	partnerships: z.string().optional(),
	social_proof: z.string().optional(),
	aliases: z.string().optional(),
	approved_claims: z.string().optional(),
	prohibited_claims: z.string().optional(),
	legal_notes: z.string().optional(),
	misunderstood_facts: z.string().optional(),
	entity_gaps: z.string().optional(),
});

export const competitorSchema = z.object({
	name: z.string().min(2, "Indica el nombre del competidor."),
	domain: z.string().optional(),
	aliases: z.string().optional(),
	notes: z.string().optional(),
});

export const promptSchema = z.object({
	title: z.string().min(3, "Anade un titulo."),
	body: z.string().min(10, "El prompt es demasiado corto."),
	status: z.enum(["active", "paused"]).default("active"),
	priority: z.coerce.number().int().min(1).max(5).default(3),
	frequency: z.string().default("daily"),
	providers: z.array(z.enum(providerKeys)).min(1).default(["chatgpt"]),
	tags: z.string().optional(),
});

export const llmConfigSchema = z.object({
	provider: z.enum(providerKeys),
	model: z.string().min(2),
	enabled: z.coerce.boolean().default(false),
	api_key_configured: z.coerce.boolean().default(false),
	daily_run_limit: z.coerce.number().int().min(1).max(1000).default(25),
});

export function csvToArray(value?: string | null) {
	return (value ?? "")
		.split(",")
		.map((item) => item.trim())
		.filter(Boolean);
}
