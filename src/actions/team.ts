"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/data/workspace";
import { getUserPreferences } from "@/lib/preferences-server";
import { createAdminClient } from "@/lib/supabase/admin";
import { TEAM_LIMIT } from "@/lib/tiers";
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
	const rawRole = String(formData.get("role") ?? "member");

	if (!email || !manageableRoles.includes(rawRole as WorkspaceRole)) {
		redirect(
			`/${workspaceSlug}/settings?section=team&error=${encodeURIComponent("Email o rol invalido")}`,
		);
	}
	const role = rawRole as WorkspaceRole;

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

	const prefs = await getUserPreferences();
	const seatLimit = TEAM_LIMIT[prefs.mode];
	const { count: nonOwnerCount } = await supabase
		.from("workspace_members")
		.select("user_id", { count: "exact", head: true })
		.eq("workspace_id", workspaceId)
		.neq("role", "owner");
	if ((nonOwnerCount ?? 0) >= seatLimit) {
		redirect(
			`/${workspaceSlug}/settings?section=team&error=${encodeURIComponent(`Tu plan permite ${seatLimit} seat${seatLimit === 1 ? "" : "s"} adicional${seatLimit === 1 ? "" : "es"}. Sube de plan para invitar más.`)}`,
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
