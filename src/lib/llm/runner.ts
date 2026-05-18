import type { LlmProviderKey } from "@/types";
export const DEFAULT_OPENROUTER_MODEL: Record<LlmProviderKey, string> = {
	chatgpt: "openai/gpt-4.1-nano",
	claude: "anthropic/claude-3.5-haiku",
	gemini: "google/gemini-2.0-flash-001",
	perplexity: "perplexity/sonar",
	deepseek: "deepseek/deepseek-chat-v3-0324",
};
