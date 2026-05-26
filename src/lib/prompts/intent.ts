import type { Prompt } from "@/types";

export function inferIntent(value: string): string {
	const text = value.toLowerCase();
	if (
		text.includes("precio") ||
		text.includes("cost") ||
		text.includes("price")
	)
		return "pricing";
	if (
		text.includes("alternativa") ||
		text.includes("alternative") ||
		text.includes(" vs ")
	)
		return "alternatives";
	if (text.includes("compar") || text.includes("competidor"))
		return "comparison";
	if (
		text.includes("riesgo") ||
		text.includes("problem") ||
		text.includes("avoid")
	)
		return "risk";
	if (
		text.includes("madrid") ||
		text.includes("españa") ||
		text.includes("local")
	)
		return "local";
	if (
		text.includes("mejor") ||
		text.includes("recommend") ||
		text.includes("best")
	)
		return "recommendation";
	return "awareness";
}

const TAG_ALIAS: Record<string, string> = {
	awareness: "awareness",
	recommendation: "recommendation",
	comparacion: "comparison",
	comparison: "comparison",
	alternativas: "alternatives",
	alternatives: "alternatives",
	precio: "pricing",
	pricing: "pricing",
	risk: "risk",
	riesgo: "risk",
	local: "local",
	branded: "branded",
};

export function intentFromPrompt(prompt: Prompt): string {
	const tagIntent = prompt.tags.find((tag) =>
		Object.keys(TAG_ALIAS).includes(tag.toLowerCase()),
	);
	if (tagIntent) return TAG_ALIAS[tagIntent.toLowerCase()];
	return inferIntent(`${prompt.title} ${prompt.body}`);
}
