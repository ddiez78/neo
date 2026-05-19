import { notFound } from "next/navigation";
import { PrintReportButton } from "@/components/reports/PrintReportButton";
import { createAdminClient } from "@/lib/supabase/admin";
import type { MonthlyReport } from "@/types";

interface ReportSection {
	id: string;
	title: string;
	content: string;
	sort_order: number;
}

interface SharedWorkspace {
	name: string;
	website?: string | null;
	industry?: string | null;
	country_code?: string | null;
}

type SharedReport = MonthlyReport & {
	workspaces?: SharedWorkspace | null;
};

function metricValue(
	metrics: Record<string, unknown> | undefined,
	key: string,
	fallback = 0,
) {
	const value = metrics?.[key];
	return typeof value === "number" ? value : fallback;
}

function listValue(value: unknown[]) {
	return Array.isArray(value) ? value : [];
}

function textFromItem(item: unknown, key: string) {
	if (!item || typeof item !== "object") return "";
	const value = (item as Record<string, unknown>)[key];
	return typeof value === "string" ? value : "";
}

function numberFromItem(item: unknown, key: string) {
	if (!item || typeof item !== "object") return 0;
	const value = (item as Record<string, unknown>)[key];
	return typeof value === "number" ? value : 0;
}

function booleanFromItem(item: unknown, key: string) {
	if (!item || typeof item !== "object") return false;
	const value = (item as Record<string, unknown>)[key];
	return typeof value === "boolean" ? value : false;
}

function itemKey(item: unknown, primaryKey: string, fallback: string) {
	const primary = textFromItem(item, primaryKey);
	if (primary) return primary;
	return fallback;
}

export default async function Page({
	params,
}: {
	params: Promise<{ token: string }>;
}) {
	const { token } = await params;
	const supabase = createAdminClient();
	const { data: report } = await supabase
		.from("monthly_reports")
		.select("*, workspaces(name, website, industry, country_code)")
		.eq("share_token", token)
		.maybeSingle();

	if (!report) {
		notFound();
	}

	const { data: sections } = await supabase
		.from("report_sections")
		.select("*")
		.eq("report_id", report.id)
		.order("sort_order", { ascending: true });

	const sharedReport = report as SharedReport;
	const workspace = sharedReport.workspaces;
	const topPrompts = listValue(sharedReport.top_prompts);
	const risks = listValue(sharedReport.risks);
	const actions = listValue(sharedReport.recommended_actions);
	const competitors = listValue(sharedReport.competitors);
	const promptedSources = topPrompts.reduce<number>(
		(sum, prompt) => sum + numberFromItem(prompt, "source_count"),
		0,
	);
	const promptedBrandMentions = topPrompts.filter((prompt) =>
		booleanFromItem(prompt, "brand_mentioned"),
	).length;
	const metricCards = [
		{
			label: "Visibility score",
			value: `${Number(sharedReport.visibility_score).toFixed(0)}%`,
		},
		{
			label: "Share of Voice IA",
			value: `${Number(sharedReport.share_of_voice).toFixed(0)}%`,
		},
		{
			label: "Runs analysed",
			value: metricValue(sharedReport.metrics, "total_runs", topPrompts.length),
		},
		{
			label: "Brand mentions",
			value: metricValue(
				sharedReport.metrics,
				"brand_mentions",
				promptedBrandMentions,
			),
		},
		{
			label: "Sources detected",
			value: metricValue(sharedReport.metrics, "source_count", promptedSources),
		},
		{
			label: "Won / lost prompts",
			value: `${metricValue(sharedReport.metrics, "won_prompts")} / ${metricValue(sharedReport.metrics, "lost_prompts")}`,
		},
		{
			label: "Open tasks",
			value: metricValue(sharedReport.metrics, "open_tasks", actions.length),
		},
		{
			label: "Tracked competitors",
			value: metricValue(
				sharedReport.metrics,
				"competitors_tracked",
				competitors.length,
			),
		},
	];

	return (
		<main className="min-h-screen bg-[var(--background)] px-4 py-8 text-[var(--foreground)] print:bg-white print:px-0 print:py-0">
			<div className="mx-auto max-w-6xl rounded-[28px] border border-[var(--border)] bg-[var(--surface)] p-6 shadow-[0_28px_80px_rgba(15,23,42,0.10)] print:border-0 print:shadow-none">
				<header className="flex flex-wrap items-start justify-between gap-4 border-b border-[var(--border)] pb-6">
					<div>
						<p className="text-xs font-semibold uppercase tracking-[0.14em] text-teal-700">
							AI Search Visibility Report
						</p>
						<h1 className="mt-3 max-w-4xl text-3xl font-semibold tracking-[-0.03em] md:text-5xl">
							{sharedReport.title}
						</h1>
						<p className="mt-4 max-w-3xl text-sm leading-6 text-slate-600 md:text-base">
							{sharedReport.executive_summary}
						</p>
						<div className="mt-4 flex flex-wrap gap-2 text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">
							<span>{workspace?.name ?? "Workspace"}</span>
							<span>{sharedReport.report_month}</span>
							{workspace?.country_code ? (
								<span>{workspace.country_code}</span>
							) : null}
						</div>
					</div>
					<PrintReportButton />
				</header>

				<section className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
					{metricCards.map((metric) => (
						<div
							className="rounded-2xl border border-[var(--border)] bg-[var(--surface-subtle)] p-4"
							key={metric.label}
						>
							<p className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">
								{metric.label}
							</p>
							<p className="mt-3 text-3xl font-semibold tracking-[-0.04em]">
								{metric.value}
							</p>
						</div>
					))}
				</section>

				<section className="mt-8 grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
					<div className="rounded-2xl border border-[var(--border)] p-5">
						<h2 className="text-lg font-semibold">Top prompts</h2>
						<div className="mt-4 grid gap-3">
							{topPrompts.map((prompt) => (
								<div
									className="rounded-xl bg-[var(--surface-subtle)] p-4"
									key={itemKey(prompt, "title", "prompt")}
								>
									<div className="flex flex-wrap items-center justify-between gap-3">
										<p className="font-medium">
											{textFromItem(prompt, "title") || "Prompt"}
										</p>
										<span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-700">
											{numberFromItem(prompt, "visibility_score").toFixed(0)}%
										</span>
									</div>
									<p className="mt-2 text-sm text-slate-500">
										{textFromItem(prompt, "sentiment") || "no_data"} ·{" "}
										{textFromItem(prompt, "provider") || "provider pending"} ·{" "}
										{numberFromItem(prompt, "source_count")} sources
									</p>
								</div>
							))}
							{topPrompts.length === 0 ? (
								<p className="text-sm text-slate-500">No prompt data yet.</p>
							) : null}
						</div>
					</div>

					<div className="grid gap-6">
						<div className="rounded-2xl border border-[var(--border)] p-5">
							<h2 className="text-lg font-semibold">Competitors</h2>
							<div className="mt-4 flex flex-wrap gap-2">
								{competitors.map((competitor) => (
									<span
										className="rounded-full bg-[var(--surface-subtle)] px-3 py-2 text-sm text-slate-600"
										key={itemKey(competitor, "name", "competitor")}
									>
										{textFromItem(competitor, "name") || "Competitor"}
									</span>
								))}
							</div>
						</div>
						<div className="rounded-2xl border border-[var(--border)] p-5">
							<h2 className="text-lg font-semibold">Risks</h2>
							<ul className="mt-4 space-y-3 text-sm text-slate-600">
								{risks.map((risk) => (
									<li key={itemKey(risk, "prompt", "risk")}>
										<strong className="text-[var(--foreground)]">
											{textFromItem(risk, "prompt") || "Prompt"}
										</strong>
										: {textFromItem(risk, "reason") || "Needs attention"}
									</li>
								))}
								{risks.length === 0 ? (
									<li>No critical risks detected.</li>
								) : null}
							</ul>
						</div>
					</div>
				</section>

				<section className="mt-8 rounded-2xl border border-[var(--border)] p-5">
					<h2 className="text-lg font-semibold">Recommended actions</h2>
					<div className="mt-4 grid gap-3 md:grid-cols-2">
						{actions.map((action) => (
							<div
								className="rounded-xl bg-[var(--surface-subtle)] p-4"
								key={itemKey(action, "label", "action")}
							>
								<p className="font-medium">
									{textFromItem(action, "label") || "Action"}
								</p>
								<p className="mt-2 text-sm text-slate-500">
									{textFromItem(action, "type") || "content"} · priority{" "}
									{numberFromItem(action, "priority")}
								</p>
							</div>
						))}
						{actions.length === 0 ? (
							<p className="text-sm text-slate-500">
								No open recommended actions.
							</p>
						) : null}
					</div>
				</section>

				{(sections ?? []).length > 0 ? (
					<section className="mt-8 grid gap-4">
						{((sections ?? []) as ReportSection[]).map((section) => (
							<article
								className="rounded-2xl border border-[var(--border)] p-5"
								key={section.id}
							>
								<h2 className="text-lg font-semibold">{section.title}</h2>
								<p className="mt-3 whitespace-pre-line text-sm leading-6 text-slate-600">
									{section.content}
								</p>
							</article>
						))}
					</section>
				) : null}
			</div>
		</main>
	);
}
