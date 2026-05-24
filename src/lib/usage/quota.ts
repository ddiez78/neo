import { createAlert } from "@/lib/data/alerts";
import type { AppMode } from "@/lib/preferences";
import { createAdminClient } from "@/lib/supabase/admin";
import { MONTHLY_EXECUTION_LIMIT } from "@/lib/tiers";

/**
 * The app stores the plan as a cookie preference (AppMode), not in DB.
 * Background jobs (Inngest crons) can't read cookies, so they fall back to
 * the highest tier (agency = 6000) as a safety cap. UI-side actions pass
 * the cookie-known plan explicitly via `mode`.
 */
export const BACKGROUND_PLAN_FALLBACK: AppMode = "agency";

export type QuotaCheck = {
	ok: boolean;
	used: number;
	limit: number;
	remaining: number;
};

function currentYearMonth(): string {
	return new Date().toISOString().slice(0, 7);
}

export async function getCurrentMonthUsage(
	workspaceId: string,
): Promise<number> {
	const supabase = createAdminClient();
	const { data } = await supabase
		.from("monthly_usage")
		.select("executions_count")
		.eq("workspace_id", workspaceId)
		.eq("year_month", currentYearMonth())
		.maybeSingle();
	return (data?.executions_count as number | undefined) ?? 0;
}

export async function checkQuota(
	workspaceId: string,
	mode: AppMode,
	cost = 1,
): Promise<QuotaCheck> {
	const limit = MONTHLY_EXECUTION_LIMIT[mode];
	const used = await getCurrentMonthUsage(workspaceId);
	const remaining = Math.max(0, limit - used);
	return { ok: used + cost <= limit, used, limit, remaining };
}

/**
 * Increments the monthly usage counter atomically via RPC.
 * Returns the new total.
 *
 * If the increment crosses the 80% threshold for the first time this month,
 * emits a "usage_warning" alert. If it lands at or above 100%, emits a
 * "usage_limit_reached" alert. Threshold crossings are detected by comparing
 * the previous total (newTotal - count) with the new total against the limit.
 */
export async function incrementUsage(
	workspaceId: string,
	mode: AppMode,
	count = 1,
): Promise<number> {
	const supabase = createAdminClient();
	const { data, error } = await supabase.rpc("increment_monthly_usage", {
		p_workspace_id: workspaceId,
		p_increment: count,
	});
	if (error) {
		console.error("increment_monthly_usage failed", error);
		return 0;
	}
	const newTotal = (data as number | null) ?? 0;
	const limit = MONTHLY_EXECUTION_LIMIT[mode];
	const previousTotal = newTotal - count;
	const warnThreshold = Math.floor(limit * 0.8);

	if (
		previousTotal < warnThreshold &&
		newTotal >= warnThreshold &&
		newTotal < limit
	) {
		await createAlert({
			workspace_id: workspaceId,
			kind: "usage_warning",
			severity: "warning",
			title: "Has alcanzado el 80% del cupo mensual",
			message: `Llevas ${newTotal} de ${limit} ejecuciones IA este mes. Considera subir de plan o comprar un pack extra antes de agotarlo.`,
			payload: { used: newTotal, limit },
			link: "/pricing",
		}).catch(() => undefined);
	}

	if (previousTotal < limit && newTotal >= limit) {
		await createAlert({
			workspace_id: workspaceId,
			kind: "usage_limit_reached",
			severity: "critical",
			title: "Cupo mensual de ejecuciones IA agotado",
			message: `Has consumido las ${limit} ejecuciones IA de tu plan este mes. Las nuevas ejecuciones se pausarán hasta el próximo ciclo o hasta que subas de plan.`,
			payload: { used: newTotal, limit },
			link: "/pricing",
		}).catch(() => undefined);
	}

	return newTotal;
}

export async function emitQuotaExhaustedAlert(
	workspaceId: string,
	mode: AppMode,
): Promise<void> {
	const limit = MONTHLY_EXECUTION_LIMIT[mode];
	await createAlert({
		workspace_id: workspaceId,
		kind: "usage_limit_reached",
		severity: "critical",
		title: "Ejecución bloqueada: cupo mensual agotado",
		message: `Se intentó ejecutar una acción IA pero el cupo de ${limit} del plan ya está agotado.`,
		payload: { limit },
		link: "/pricing",
	}).catch(() => undefined);
}
