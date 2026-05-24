"use server";

import { revalidatePath } from "next/cache";
import { markAlertSeen, markAllAlertsSeen } from "@/lib/data/alerts";

export async function markAlertSeenAction(
	workspaceSlug: string,
	alertId: string,
) {
	await markAlertSeen(alertId);
	revalidatePath(`/${workspaceSlug}/alerts`);
	revalidatePath(`/${workspaceSlug}`, "layout");
}

export async function markAllAlertsSeenAction(
	workspaceSlug: string,
	workspaceId: string,
) {
	await markAllAlertsSeen(workspaceId);
	revalidatePath(`/${workspaceSlug}/alerts`);
	revalidatePath(`/${workspaceSlug}`, "layout");
}
