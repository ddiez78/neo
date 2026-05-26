import type { AppMode } from "./preferences";

export type TierFeature =
	| "dashboard"
	| "prompts"
	| "recommendations"
	| "competitors"
	| "sources"
	| "reports"
	| "settings"
	| "roi"
	| "tasks"
	| "templates"
	| "company-bio";

export const TIER_RANK: Record<AppMode, number> = {
	sme: 0,
	pro: 1,
	agency: 2,
};

export const TIER_LABEL: Record<AppMode, string> = {
	sme: "Starter",
	pro: "Pro",
	agency: "Agency",
};

export const FEATURE_MIN_TIER: Record<TierFeature, AppMode> = {
	dashboard: "sme",
	prompts: "sme",
	recommendations: "sme",
	competitors: "sme",
	sources: "sme",
	reports: "pro",
	settings: "sme",
	roi: "pro",
	tasks: "pro",
	templates: "pro",
	"company-bio": "agency",
};

export function hasAccess(mode: AppMode, feature: TierFeature): boolean {
	return TIER_RANK[mode] >= TIER_RANK[FEATURE_MIN_TIER[feature]];
}

export const WORKSPACE_LIMIT: Record<AppMode, number> = {
	sme: 1,
	pro: 1,
	agency: 5,
};

export const PROMPT_LIMIT: Record<AppMode, number> = {
	sme: 25,
	pro: 100,
	agency: 500,
};

export const COMPETITOR_LIMIT: Record<AppMode, number> = {
	sme: 3,
	pro: 10,
	agency: 50,
};

export const TEAM_LIMIT: Record<AppMode, number> = {
	sme: 1,
	pro: 1,
	agency: 5,
};

export const LLM_LIMIT: Record<AppMode, number> = {
	sme: 2,
	pro: 4,
	agency: 5,
};

export const HISTORY_DAYS: Record<AppMode, number> = {
	sme: 30,
	pro: 90,
	agency: 365,
};

export const MONTHLY_EXECUTION_LIMIT: Record<AppMode, number> = {
	sme: 300,
	pro: 1500,
	agency: 6000,
};

export function formatLimit(n: number): string {
	return String(n);
}

export function minTierFor(feature: TierFeature): AppMode {
	return FEATURE_MIN_TIER[feature];
}

export function minTierLabel(feature: TierFeature): string {
	return TIER_LABEL[FEATURE_MIN_TIER[feature]];
}
