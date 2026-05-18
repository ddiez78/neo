import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type {
	CompanyProfile,
	Competitor,
	LlmConfig,
	Prompt,
	PromptMetrics,
	PromptRun,
	Source,
	Workspace,
	WorkspaceMember,
} from "@/types";

export async function getSessionUser() {
	const supabase = await createClient();
	const {
		data: { user },
	} = await supabase.auth.getUser();
	return { supabase, user };
}

export async function requireUser() {
	const { supabase, user } = await getSessionUser();
	if (!user) {
		redirect("/login");
	}
	return { supabase, user };
}

export async function getWorkspaces() {
	const { supabase, user } = await getSessionUser();
	if (!user) {
		return [];
	}

	const { data } = await supabase
		.from("workspace_members")
		.select("role, workspaces(*)")
		.eq("user_id", user.id)
		.order("created_at", { ascending: true });

	return (data ?? [])
		.map((item) => item.workspaces)
		.filter(Boolean) as unknown as Workspace[];
}

export async function getWorkspaceBySlug(slug: string) {
	const { supabase } = await requireUser();
	const { data } = await supabase
		.from("workspaces")
		.select("*")
		.eq("slug", slug)
		.single();
	return data as Workspace | null;
}

export async function requireWorkspace(slug: string) {
	const workspace = await getWorkspaceBySlug(slug);
	if (!workspace) {
		redirect("/workspaces");
	}
	return workspace;
}

export async function getWorkspaceOverview(workspaceId: string) {
	const { supabase } = await requireUser();
	const [
		company,
		competitors,
		prompts,
		runs,
		sources,
		metrics,
		members,
		llmConfigs,
	] = await Promise.all([
		supabase
			.from("company_profiles")
			.select("*")
			.eq("workspace_id", workspaceId)
			.maybeSingle(),
		supabase
			.from("competitors")
			.select("*")
			.eq("workspace_id", workspaceId)
			.order("created_at", { ascending: false }),
		supabase
			.from("prompts")
			.select("*")
			.eq("workspace_id", workspaceId)
			.order("created_at", { ascending: false }),
		supabase
			.from("prompt_runs")
			.select("*")
			.eq("workspace_id", workspaceId)
			.order("created_at", { ascending: false })
			.limit(20),
		supabase
			.from("prompt_run_sources")
			.select("*")
			.eq("workspace_id", workspaceId)
			.order("created_at", { ascending: false })
			.limit(50),
		supabase
			.from("workspace_daily_metric_rollup")
			.select("*")
			.eq("workspace_id", workspaceId)
			.order("metric_date", { ascending: true })
			.limit(30),
		supabase
			.from("workspace_members")
			.select("*, profiles(email, full_name)")
			.eq("workspace_id", workspaceId),
		supabase
			.from("workspace_llm_configs")
			.select("*")
			.eq("workspace_id", workspaceId)
			.order("provider", { ascending: true }),
	]);

	return {
		company: company.data as CompanyProfile | null,
		competitors: (competitors.data ?? []) as Competitor[],
		prompts: (prompts.data ?? []) as Prompt[],
		runs: (runs.data ?? []) as PromptRun[],
		sources: (sources.data ?? []) as Source[],
		metrics: (metrics.data ?? []) as PromptMetrics[],
		members: (members.data ?? []).map((member) => ({
			...member,
			email: member.profiles?.email,
			full_name: member.profiles?.full_name,
		})) as WorkspaceMember[],
		llmConfigs: (llmConfigs.data ?? []) as LlmConfig[],
	};
}

export function slugify(value: string) {
	const slug = value
		.toLowerCase()
		.normalize("NFD")
		.replace(/[\u0300-\u036f]/g, "")
		.replace(/[^a-z0-9]+/g, "-")
		.replace(/^-+|-+$/g, "");

	return slug || `workspace-${Date.now()}`;
}
