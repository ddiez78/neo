"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/data/workspace";
import { getSectorTemplate } from "@/lib/templates/sectors";

export async function applySectorTemplateAction(
	workspaceId: string,
	workspaceSlug: string,
	formData: FormData,
) {
	const templateId = String(formData.get("templateId") ?? "");
	const template = getSectorTemplate(templateId);
	if (!template) {
		redirect(`/${workspaceSlug}/prompts?error=Template+not+found`);
	}

	const { supabase, user } = await requireUser();
	const { data: member } = await supabase
		.from("workspace_members")
		.select("role")
		.eq("workspace_id", workspaceId)
		.eq("user_id", user.id)
		.maybeSingle();
	if (!member) {
		redirect(`/${workspaceSlug}/prompts?error=No+access`);
	}

	const promptRows = template.prompts.map((p) => ({
		workspace_id: workspaceId,
		body: p.body,
		intent: p.intent,
		status: "active" as const,
		tags: [`template:${template.id}`],
	}));

	const competitorRows = template.competitorExamples.map((name) => ({
		workspace_id: workspaceId,
		name,
		aliases: [],
	}));

	const [promptsRes, competitorsRes] = await Promise.all([
		supabase.from("prompts").insert(promptRows),
		supabase.from("competitors").insert(competitorRows),
	]);

	if (promptsRes.error) {
		redirect(
			`/${workspaceSlug}/prompts?error=${encodeURIComponent(promptsRes.error.message)}`,
		);
	}

	revalidatePath(`/${workspaceSlug}/prompts`);
	revalidatePath(`/${workspaceSlug}/competitors`);
	revalidatePath(`/${workspaceSlug}/dashboard`);
	const competitorsParam = competitorsRes.error
		? ""
		: `&competitors=${template.competitorExamples.length}`;
	redirect(
		`/${workspaceSlug}/prompts?applied=${template.prompts.length}${competitorsParam}`,
	);
}
