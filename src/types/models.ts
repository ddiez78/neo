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
export type RecommendationCategory =
	| "entity"
	| "content"
	| "sources"
	| "competitors"
	| "prompts"
	| "technical"
	| "authority"
	| "sentiment";
export type RecommendationStatus =
	| "pending"
	| "in_progress"
	| "done"
	| "dismissed";

export interface Workspace {
	id: string;
	name: string;
	slug: string;
	website?: string | null;
	industry?: string | null;
	country_code: string;
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

export interface WorkspaceInvite {
	id: string;
	workspace_id: string;
	email: string;
	role: WorkspaceRole;
	token: string;
	accepted_at?: string | null;
	expires_at: string;
	created_at: string;
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
	input_text?: string | null;
	response_text?: string | null;
	sentiment: Sentiment;
	brand_mentioned: boolean;
	visibility_score: number;
	brand_position?: number | null;
	first_competitor_position?: number | null;
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
	source_type:
		| "client"
		| "competitor"
		| "directory"
		| "media"
		| "blog"
		| "review"
		| "comparison"
		| "official"
		| "unknown";
	mentioned_brand: boolean;
	is_client_domain: boolean;
	is_competitor_domain: boolean;
	citation_context?: string | null;
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

export interface RecommendationSource {
	id: string;
	workspace_id: string;
	title: string;
	slug: string;
	category: RecommendationCategory;
	content: string;
	version: string;
	created_at: string;
	updated_at: string;
}

export interface Recommendation {
	id: string;
	workspace_id: string;
	source_id?: string | null;
	title: string;
	description: string;
	category: RecommendationCategory;
	priority: number;
	impact_score: number;
	confidence_score: number;
	status: RecommendationStatus;
	related_prompt_ids: string[];
	related_competitor_ids: string[];
	related_source_domains: string[];
	evidence: Record<string, unknown>;
	created_at: string;
	updated_at: string;
}

export interface RecommendationAction {
	id: string;
	recommendation_id: string;
	workspace_id?: string | null;
	type:
		| "content"
		| "page_update"
		| "faq"
		| "schema"
		| "external_profile"
		| "source_review"
		| "comparison"
		| "technical";
	label: string;
	status: RecommendationStatus;
	owner_id?: string | null;
	assigned_to?: string | null;
	priority: number;
	due_date?: string | null;
	completed_at?: string | null;
	created_at: string;
	updated_at: string;
}

export interface PromptRanking {
	workspace_id: string;
	prompt_id: string;
	title: string;
	body: string;
	status: PromptStatus;
	priority: number;
	latest_run_id?: string | null;
	provider?: LlmProviderKey | null;
	model?: string | null;
	latest_run_at?: string | null;
	brand_mentioned?: boolean | null;
	brand_position?: number | null;
	first_competitor_position?: number | null;
	sentiment?: Sentiment | null;
	visibility_score?: number | null;
	competitors_mentioned?: string[] | null;
	source_count?: number | null;
}

export interface ShareOfVoiceMetric {
	workspace_id: string;
	metric_date: string;
	provider: LlmProviderKey;
	model: string;
	total_runs: number;
	brand_mentions: number;
	competitor_mentions: number;
	share_of_voice: number;
}

export interface WeeklyMetric {
	workspace_id: string;
	week_start: string;
	visibility_score: number;
	mention_count: number;
	total_runs: number;
	source_count: number;
	total_cost: number;
}

export interface MonthlyReport {
	id: string;
	workspace_id: string;
	report_month: string;
	title: string;
	executive_summary: string;
	visibility_score: number;
	share_of_voice: number;
	metrics: Record<string, unknown>;
	top_prompts: unknown[];
	competitors: unknown[];
	risks: unknown[];
	recommended_actions: unknown[];
	share_token: string;
	created_at: string;
	updated_at: string;
}
