"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/data/workspace";
import type { RecommendationStatus } from "@/types";

export async function updateTaskStatusAction(
	workspaceSlug: string,
	taskId: string,
	status: RecommendationStatus,
) {
	const { supabase } = await requireUser();
	const { error } = await supabase
		.from("recommendation_actions")
		.update({
			status,
			completed_at: status === "done" ? new Date().toISOString() : null,
			updated_at: new Date().toISOString(),
		})
		.eq("id", taskId);

	if (error) {
		redirect(
			`/${workspaceSlug}/tasks?error=${encodeURIComponent(error.message)}`,
		);
	}

	revalidatePath(`/${workspaceSlug}/tasks`);
	revalidatePath(`/${workspaceSlug}/recommendations`);
	revalidatePath(`/${workspaceSlug}/dashboard`);
	redirect(`/${workspaceSlug}/tasks?updated=1`);
}
