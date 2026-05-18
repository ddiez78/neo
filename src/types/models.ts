export interface ActionResult<T = undefined> {
	success: boolean;
	error?: string;
	data?: T;
}

export type LlmProviderKey =
	| "chatgpt"
	| "claude"
	| "gemini"
	| "perplexity"
	| "deepseek";
export type PromptStatus = "active" | "paused";
export type Sentiment = "positive" | "neutral" | "negative" | "no_data";

export type WorkspaceRole = "owner" | "admin" | "member" | "viewer";
export type RunStatus = "queued" | "running" | "completed" | "failed";
export type SuggestionStatus = "pending" | "approved" | "rejected";

export interface Workspace {
	id: string;
	name: string;
	slug: string;
	website?: string | null;
	industry?: string | null;
	locale: string;
	timezone: string;
	created_at: string;
}

export interface WorkspaceMember {
	id: string;
	workspace_id: string;
	user_id: string;
	role: WorkspaceRole;
	email?: string | null;
	full_name?: string | null;
}

export interface CompanyProfile {
	id: string;
	workspace_id: string;
	brand_name: string;
	website?: string | null;
	description?: string | null;
	products: string[];
	keywords: string[];
	markets: string[];
	tone?: string | null;
	official_urls: string[];
	updated_at: string;
}

export interface Competitor {
	id: string;
	workspace_id: string;
	name: string;
	domain?: string | null;
	aliases: string[];
	notes?: string | null;
	created_at: string;
}

export interface CompetitorSuggestion {
	id: string;
	workspace_id: string;
	name: string;
	domain?: string | null;
	reason?: string | null;
	confidence: number;
	status: SuggestionStatus;
	created_at: string;
}

export interface Prompt {
	id: string;
	workspace_id: string;
	title: string;
	body: string;
	status: PromptStatus;
	priority: number;
	frequency: string;
	providers: LlmProviderKey[];
	tags: string[];
	last_run_at?: string | null;
	created_at: string;
}

export interface PromptRun {
	id: string;
	workspace_id: string;
	prompt_id?: string | null;
	provider: LlmProviderKey;
	model: string;
	status: RunStatus;
	response_text?: string | null;
	sentiment: Sentiment;
	brand_mentioned: boolean;
	competitors_mentioned: string[];
	source_count: number;
	prompt_tokens: number;
	completion_tokens: number;
	total_cost: number;
	error_message?: string | null;
	started_at?: string | null;
	completed_at?: string | null;
	created_at: string;
}

export interface Source {
	id: string;
	workspace_id: string;
	prompt_run_id: string;
	url: string;
	domain: string;
	title?: string | null;
	mentioned_brand: boolean;
	mentioned_competitors: string[];
	authority_score?: number | null;
	created_at: string;
}

export interface LlmConfig {
	id: string;
	workspace_id: string;
	provider: LlmProviderKey;
	model: string;
	enabled: boolean;
	api_key_configured: boolean;
	daily_run_limit: number;
	created_at: string;
}

export interface PromptMetrics {
	workspace_id: string;
	metric_date: string;
	visibility_score: number;
	mention_count: number;
	total_runs: number;
	positive_mentions: number;
	neutral_mentions: number;
	negative_mentions: number;
	source_count: number;
	total_cost: number;
}
