import type { CompanyProfile, Competitor, Sentiment, Source } from "@/types";

export type MentionDraft = {
	entity_name: string;
	entity_type: "brand" | "competitor";
	position_index: number | null;
	rank_group: string | null;
	mention_context: string | null;
	sentiment: Sentiment;
	confidence: number;
};

export type SourceDraft = Pick<
	Source,
	| "url"
	| "domain"
	| "title"
	| "source_type"
	| "mentioned_brand"
	| "mentioned_competitors"
	| "is_client_domain"
	| "is_competitor_domain"
	| "citation_context"
	| "authority_score"
>;

function normalize(value: string) {
	return value
		.toLowerCase()
		.normalize("NFD")
		.replace(/[\u0300-\u036f]/g, "");
}

function domainFromUrl(value: string) {
	try {
		return new URL(value).hostname.replace(/^www\./, "");
	} catch {
		return (
			value
				.replace(/^https?:\/\//, "")
				.split("/")[0]
				?.replace(/^www\./, "") ?? value
		);
	}
}

function positionOf(text: string, terms: string[]) {
	const normalized = normalize(text);
	const positions = terms
		.map((term) => normalized.indexOf(normalize(term)))
		.filter((position) => position >= 0);
	return positions.length ? Math.min(...positions) : null;
}

function rankFromPosition(position: number | null) {
	if (position === null) return null;
	if (position < 400) return "top";
	if (position < 1200) return "middle";
	return "late";
}

function contextFor(text: string, position: number | null) {
	if (position === null) return null;
	const start = Math.max(0, position - 120);
	const end = Math.min(text.length, position + 180);
	return text.slice(start, end).replace(/\s+/g, " ").trim();
}

export function detectSentiment(text: string): Sentiment {
	const value = normalize(text);
	const positive = [
		"best",
		"recommended",
		"leader",
		"strong",
		"excellent",
		"mejor",
		"recomendado",
		"lider",
		"solido",
		"excelente",
	];
	const negative = [
		"avoid",
		"weak",
		"problem",
		"risk",
		"poor",
		"evitar",
		"debil",
		"problema",
		"riesgo",
		"malo",
	];
	if (negative.some((term) => value.includes(term))) return "negative";
	if (positive.some((term) => value.includes(term))) return "positive";
	return "neutral";
}

export function analyzeMentions(input: {
	responseText: string;
	company: CompanyProfile | null;
	workspaceName: string;
	competitors: Competitor[];
}) {
	const brandTerms = [
		input.company?.brand_name,
		input.workspaceName,
		input.company?.website ? domainFromUrl(input.company.website) : null,
		...(input.company?.aliases ?? []),
	]
		.filter(Boolean)
		.map(String);
	const brandPosition = positionOf(input.responseText, brandTerms);
	const sentiment = detectSentiment(input.responseText);
	const mentions: MentionDraft[] = [];

	if (brandPosition !== null) {
		mentions.push({
			entity_name: brandTerms[0] ?? input.workspaceName,
			entity_type: "brand",
			position_index: brandPosition,
			rank_group: rankFromPosition(brandPosition),
			mention_context: contextFor(input.responseText, brandPosition),
			sentiment,
			confidence: 80,
		});
	}

	for (const competitor of input.competitors) {
		const terms = [
			competitor.name,
			competitor.domain,
			...(competitor.aliases ?? []),
		]
			.filter(Boolean)
			.map(String);
		const position = positionOf(input.responseText, terms);
		if (position !== null) {
			mentions.push({
				entity_name: competitor.name,
				entity_type: "competitor",
				position_index: position,
				rank_group: rankFromPosition(position),
				mention_context: contextFor(input.responseText, position),
				sentiment,
				confidence: 75,
			});
		}
	}

	return {
		mentions,
		brandMentioned: brandPosition !== null,
		brandPosition,
		firstCompetitorPosition:
			mentions
				.filter((mention) => mention.entity_type === "competitor")
				.map((mention) => mention.position_index)
				.filter((position): position is number => typeof position === "number")
				.sort((a, b) => a - b)[0] ?? null,
		competitorsMentioned: mentions
			.filter((mention) => mention.entity_type === "competitor")
			.map((mention) => mention.entity_name),
		sentiment,
	};
}

function classifySource(
	domain: string,
	clientDomain?: string | null,
	competitorDomains: string[] = [],
) {
	if (clientDomain && domain.includes(clientDomain)) return "client";
	if (
		competitorDomains.some((competitorDomain) =>
			domain.includes(competitorDomain),
		)
	)
		return "competitor";
	if (/(g2|capterra|trustpilot|reviews|review)/i.test(domain)) return "review";
	if (/(forbes|wired|techcrunch|elpais|expansion|medium)/i.test(domain))
		return "media";
	if (/(blog|substack)/i.test(domain)) return "blog";
	if (/(directory|list|ranking|alternatives|compare)/i.test(domain))
		return "comparison";
	return "unknown";
}

export function extractSourceDrafts(input: {
	responseText: string;
	company: CompanyProfile | null;
	competitors: Competitor[];
}) {
	const urls = Array.from(
		new Set(input.responseText.match(/https?:\/\/[^\s),\]]+/g) ?? []),
	).slice(0, 20);
	const clientDomain = input.company?.website
		? domainFromUrl(input.company.website)
		: null;
	const competitorDomains = input.competitors
		.map((competitor) => competitor.domain)
		.filter(Boolean)
		.map((domain) => domainFromUrl(String(domain)));

	return urls.map<SourceDraft>((url) => {
		const domain = domainFromUrl(url);
		const sourceType = classifySource(domain, clientDomain, competitorDomains);
		return {
			url,
			domain,
			title: domain,
			source_type: sourceType,
			mentioned_brand: clientDomain
				? normalize(input.responseText).includes(normalize(clientDomain))
				: false,
			mentioned_competitors: input.competitors
				.filter((competitor) =>
					normalize(input.responseText).includes(normalize(competitor.name)),
				)
				.map((competitor) => competitor.name),
			is_client_domain: sourceType === "client",
			is_competitor_domain: sourceType === "competitor",
			citation_context: contextFor(
				input.responseText,
				input.responseText.indexOf(url),
			),
			authority_score:
				sourceType === "client" ? 90 : sourceType === "media" ? 75 : 50,
		};
	});
}

export function calculateVisibilityScore(input: {
	brandMentioned: boolean;
	brandPosition: number | null;
	competitorMentions: number;
	sentiment: Sentiment;
	sourceCount: number;
	clientSourceCount: number;
}) {
	let score = input.brandMentioned ? 35 : 0;
	if (input.brandPosition !== null) {
		score +=
			input.brandPosition < 400 ? 20 : input.brandPosition < 1200 ? 12 : 6;
	}
	score += Math.min(input.sourceCount, 5) * 4;
	score += Math.min(input.clientSourceCount, 3) * 6;
	score +=
		input.sentiment === "positive" ? 15 : input.sentiment === "neutral" ? 8 : 0;
	score -= Math.min(input.competitorMentions, 5) * 3;
	return Math.max(0, Math.min(100, Math.round(score)));
}
