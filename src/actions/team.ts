"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/data/workspace";
import { createAdminClient } from "@/lib/supabase/admin";
import type { WorkspaceRole } from "@/types";

const manageableRoles: WorkspaceRole[] = ["admin", "member", "viewer"];

export async function inviteWorkspaceMemberAction(
	workspaceId: string,
	workspaceSlug: string,
	formData: FormData,
) {
	const { supabase, user } = await requireUser();
	const email = String(formData.get("email") ?? "")
		.trim()
		.toLowerCase();
	const role = String(formData.get("role") ?? "member") as WorkspaceRole;

	if (!email || !manageableRoles.includes(role)) {
		redirect(
			`/${workspaceSlug}/settings?section=team&error=${encodeURIComponent("Email o rol invalido")}`,
		);
	}

	const { data: currentMember } = await supabase
		.from("workspace_members")
		.select("role")
		.eq("workspace_id", workspaceId)
		.eq("user_id", user.id)
		.maybeSingle();

	if (!["owner", "admin"].includes(String(currentMember?.role))) {
		redirect(
			`/${workspaceSlug}/settings?section=team&error=${encodeURIComponent("No tienes permisos para invitar usuarios")}`,
		);
	}

	const admin = createAdminClient();
	const { data: profile } = await admin
		.from("profiles")
		.select("id")
		.eq("email", email)
		.maybeSingle();

	if (profile?.id) {
		const { error: memberError } = await supabase
			.from("workspace_members")
			.upsert(
				{ workspace_id: workspaceId, user_id: profile.id, role },
				{ onConflict: "workspace_id,user_id" },
			);

		if (memberError) {
			redirect(
				`/${workspaceSlug}/settings?section=team&error=${encodeURIComponent(memberError.message)}`,
			);
		}
	} else {
		const { error: inviteError } = await supabase
			.from("workspace_invites")
			.upsert(
				{ workspace_id: workspaceId, email, role },
				{ onConflict: "workspace_id,email" },
			);

		if (inviteError) {
			redirect(
				`/${workspaceSlug}/settings?section=team&error=${encodeURIComponent(inviteError.message)}`,
			);
		}
	}

	revalidatePath(`/${workspaceSlug}/settings`);
	redirect(`/${workspaceSlug}/settings?section=team&saved=1`);
}
