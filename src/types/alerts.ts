export type AlertKind =
	| "visibility_drop"
	| "new_competitor"
	| "negative_sentiment"
	| "prompt_failed"
	| "critical_recommendation"
	| "cost_spike"
	| "run_complete"
	| "usage_warning"
	| "usage_limit_reached";

export type AlertSeverity = "info" | "warning" | "critical";

export type Alert = {
	id: string;
	workspace_id: string;
	kind: AlertKind;
	severity: AlertSeverity;
	title: string;
	message: string | null;
	payload: Record<string, unknown>;
	link: string | null;
	seen_at: string | null;
	created_at: string;
};
