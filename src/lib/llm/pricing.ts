type ModelPricing = { inputPer1M: number; outputPer1M: number };

const PRICES: Record<string, ModelPricing> = {
	"openai/gpt-4o-mini": { inputPer1M: 0.15, outputPer1M: 0.6 },
	"openai/gpt-4o": { inputPer1M: 5.0, outputPer1M: 15.0 },
	"anthropic/claude-3-5-haiku": { inputPer1M: 0.8, outputPer1M: 4.0 },
	"anthropic/claude-3-5-sonnet": { inputPer1M: 3.0, outputPer1M: 15.0 },
	"google/gemini-2.0-flash": { inputPer1M: 0.075, outputPer1M: 0.3 },
	"google/gemini-1.5-flash": { inputPer1M: 0.075, outputPer1M: 0.3 },
	"perplexity/sonar": { inputPer1M: 1.0, outputPer1M: 1.0 },
	"deepseek/deepseek-chat": { inputPer1M: 0.14, outputPer1M: 0.28 },
};

const FALLBACK: ModelPricing = { inputPer1M: 0.5, outputPer1M: 1.5 };

export function calculateCost(
	model: string,
	inputTokens: number,
	outputTokens: number,
): number {
	const p = PRICES[model] ?? FALLBACK;
	return Number(
		(
			(inputTokens * p.inputPer1M + outputTokens * p.outputPer1M) /
			1_000_000
		).toFixed(6),
	);
}
