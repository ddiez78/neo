import { createClient } from "@/lib/supabase/server";
import type { Alert, AlertKind, AlertSeverity } from "@/types/alerts";

export async function getAlerts(
	workspaceId: string,
	limit = 50,
): Promise<Alert[]> {
	const supabase = await createClient();
	const { data } = await supabase
		.from("alerts")
		.select("*")
		.eq("workspace_id", workspaceId)
		.order("created_at", { ascending: false })
		.limit(limit);
	return (data ?? []) as Alert[];
}

export async function getUnseenAlertCount(
	workspaceId: string,
): Promise<number> {
	const supabase = await createClient();
	const { count } = await supabase
		.from("alerts")
		.select("*", { count: "exact", head: true })
		.eq("workspace_id", workspaceId)
		.is("seen_at", null);
	return count ?? 0;
}

export async function createAlert(params: {
	workspace_id: string;
	kind: AlertKind;
	severity: AlertSeverity;
	title: string;
	message?: string | null;
	payload?: Record<string, unknown>;
	link?: string | null;
}): Promise<void> {
	const supabase = await createClient();
	await supabase.from("alerts").insert({
		workspace_id: params.workspace_id,
		kind: params.kind,
		severity: params.severity,
		title: params.title,
		message: params.message ?? null,
		payload: params.payload ?? {},
		link: params.link ?? null,
	});
}

export async function markAlertSeen(alertId: string): Promise<void> {
	const supabase = await createClient();
	await supabase
		.from("alerts")
		.update({ seen_at: new Date().toISOString() })
		.eq("id", alertId);
}

export async function markAllAlertsSeen(workspaceId: string): Promise<void> {
	const supabase = await createClient();
	await supabase
		.from("alerts")
		.update({ seen_at: new Date().toISOString() })
		.eq("workspace_id", workspaceId)
		.is("seen_at", null);
}
