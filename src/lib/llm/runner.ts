import type { LlmProviderKey } from "@/types";

export const DEFAULT_OPENROUTER_MODEL: Record<LlmProviderKey, string> = {
	chatgpt: "openai/gpt-4o-mini",
	claude: "anthropic/claude-3-5-haiku",
	gemini: "google/gemini-2.0-flash",
	perplexity: "perplexity/sonar",
	deepseek: "deepseek/deepseek-chat",
};
