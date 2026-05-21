import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type {
	CompanyProfile,
	Competitor,
	LlmConfig,
	MonthlyReport,
	Prompt,
	PromptCandidate,
	PromptGenerationBatch,
	PromptMetrics,
	PromptRanking,
	PromptRun,
	RecommendationAction,
	ReportBranding,
	ShareOfVoiceMetric,
	Source,
	WeeklyMetric,
	Workspace,
	WorkspaceInvite,
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
		rankings,
		promptGenerationBatches,
		promptCandidates,
		shareOfVoice,
		weeklyMetrics,
		reports,
		reportBranding,
		tasks,
		invites,
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
		supabase
			.from("prompt_rankings")
			.select("*")
			.eq("workspace_id", workspaceId)
			.order("priority", { ascending: false }),
		supabase
			.from("prompt_generation_batches")
			.select("*")
			.eq("workspace_id", workspaceId)
			.order("created_at", { ascending: false })
			.limit(5),
		supabase
			.from("prompt_candidates")
			.select("*")
			.eq("workspace_id", workspaceId)
			.order("score", { ascending: false })
			.limit(30),
		supabase
			.from("share_of_voice_metrics")
			.select("*")
			.eq("workspace_id", workspaceId)
			.order("metric_date", { ascending: true })
			.limit(90),
		supabase
			.from("weekly_metrics")
			.select("*")
			.eq("workspace_id", workspaceId)
			.order("week_start", { ascending: true })
			.limit(26),
		supabase
			.from("monthly_reports")
			.select("*")
			.eq("workspace_id", workspaceId)
			.order("report_month", { ascending: false })
			.limit(12),
		supabase
			.from("report_branding")
			.select("*")
			.eq("workspace_id", workspaceId)
			.maybeSingle(),
		supabase
			.from("recommendation_actions")
			.select("*")
			.eq("workspace_id", workspaceId)
			.order("created_at", { ascending: false }),
		supabase
			.from("workspace_invites")
			.select("*")
			.eq("workspace_id", workspaceId)
			.is("accepted_at", null)
			.order("created_at", { ascending: false }),
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
		rankings: (rankings.data ?? []) as PromptRanking[],
		promptGenerationBatches: (promptGenerationBatches.data ??
			[]) as PromptGenerationBatch[],
		promptCandidates: (promptCandidates.data ?? []) as PromptCandidate[],
		shareOfVoice: (shareOfVoice.data ?? []) as ShareOfVoiceMetric[],
		weeklyMetrics: (weeklyMetrics.data ?? []) as WeeklyMetric[],
		reports: (reports.data ?? []) as MonthlyReport[],
		reportBranding: reportBranding.data as ReportBranding | null,
		tasks: (tasks.data ?? []) as RecommendationAction[],
		invites: (invites.data ?? []) as WorkspaceInvite[],
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
