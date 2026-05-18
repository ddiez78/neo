"use server";

import type { ActionResult } from "@/types";

export async function placeholderAction(): Promise<ActionResult> {
	return { success: true };
}
