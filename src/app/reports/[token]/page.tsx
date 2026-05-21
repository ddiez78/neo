import Image from "next/image";
import { notFound } from "next/navigation";
import { PrintReportButton } from "@/components/reports/PrintReportButton";
import {
	ReportBarChart,
	ReportTrendChart,
} from "@/components/reports/ReportCharts";
import { ReportKpiCard } from "@/components/reports/ReportKpiCard";
import { ReportRecommendations } from "@/components/reports/ReportRecommendations";
import { createAdminClient } from "@/lib/supabase/admin";
import type { MonthlyReport } from "@/types";

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

function listValue(value: unknown) {
	return Array.isArray(value) ? value : [];
}

function objectValue(value: unknown) {
	return value && typeof value === "object"
		? (value as Record<string, unknown>)
		: {};
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

function deltaValue(kpis: Record<string, unknown>, key: string) {
	const value = objectValue(kpis[key]);
	const absolute = value.absolute;
	return typeof absolute === "number" ? { absolute } : undefined;
}

function brandingText(
	branding: Record<string, unknown>,
	key: string,
	fallback: string,
) {
	const value = branding[key];
	return typeof value === "string" && value ? value : fallback;
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

	const sharedReport = report as SharedReport;
	const workspace = sharedReport.workspaces;
	const topPrompts = listValue(sharedReport.top_prompts);
	const risks = listValue(sharedReport.risks);
	const competitors = listValue(sharedReport.competitors);
	const charts = sharedReport.charts ?? {};
	const kpis = sharedReport.kpi_summary ?? {};
	const branding = sharedReport.branding_snapshot ?? {};
	const primaryColor = brandingText(branding, "primary_color", "#00685f");
	const accentColor = brandingText(branding, "accent_color", "#0d9488");
	const agencyName = brandingText(
		branding,
		"agency_name",
		"Agency visibility team",
	);
	const clientName = brandingText(
		branding,
		"client_name",
		workspace?.name ?? "Client",
	);
	const logoUrl = brandingText(branding, "logo_url", "");
	const footerNote = brandingText(
		branding,
		"footer_note",
		"Prepared for client review.",
	);
	const promptedSources = topPrompts.reduce<number>(
		(sum, prompt) => sum + numberFromItem(prompt, "source_count"),
		0,
	);
	const promptedBrandMentions = topPrompts.filter((prompt) =>
		booleanFromItem(prompt, "brand_mentioned"),
	).length;

	return (
		<main
			className="min-h-screen bg-[#f4f8f6] px-4 py-8 text-slate-950 print:bg-white print:px-0 print:py-0"
			style={
				{
					"--report-primary": primaryColor,
					"--report-accent": accentColor,
				} as React.CSSProperties
			}
		>
			<div className="mx-auto max-w-6xl rounded-md border border-slate-200 bg-white p-6 shadow-[0_28px_80px_rgba(15,23,42,0.10)] print:border-0 print:shadow-none">
				<header className="flex flex-wrap items-start justify-between gap-6 border-b border-slate-200 pb-6">
					<div className="min-w-0">
						<div className="flex flex-wrap items-center gap-4">
							{logoUrl ? (
								<Image
									alt={`${agencyName} logo`}
									className="max-h-14 max-w-56 object-contain"
									height={56}
									src={logoUrl}
									width={224}
								/>
							) : null}
							<div>
								<p
									className="text-xs font-semibold uppercase tracking-[0.14em]"
									style={{ color: primaryColor }}
								>
									White label GEO report
								</p>
								<p className="mt-1 text-sm text-slate-500">{agencyName}</p>
							</div>
						</div>
						<h1 className="mt-6 max-w-4xl text-3xl font-semibold tracking-[-0.03em] md:text-5xl">
							{clientName} GEO performance report
						</h1>
						<p className="mt-4 max-w-3xl text-sm leading-6 text-slate-600 md:text-base">
							{sharedReport.executive_summary}
						</p>
						<div className="mt-4 flex flex-wrap gap-2 text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">
							<span>
								{sharedReport.period_start ?? sharedReport.report_month}
							</span>
							<span>
								{sharedReport.period_end ?? sharedReport.report_month}
							</span>
							{workspace?.country_code ? (
								<span>{workspace.country_code}</span>
							) : null}
						</div>
					</div>
					<PrintReportButton />
				</header>

				<section className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
					<ReportKpiCard
						delta={deltaValue(kpis, "visibility")}
						label="Visibility score"
						suffix=" pp"
						value={`${Number(sharedReport.visibility_score).toFixed(0)}%`}
					/>
					<ReportKpiCard
						delta={deltaValue(kpis, "share_of_voice")}
						label="Share of Voice"
						suffix=" pp"
						value={`${Number(sharedReport.share_of_voice).toFixed(0)}%`}
					/>
					<ReportKpiCard
						delta={deltaValue(kpis, "mentions")}
						label="Brand mentions"
						value={metricValue(
							sharedReport.metrics,
							"brand_mentions",
							promptedBrandMentions,
						)}
					/>
					<ReportKpiCard
						delta={deltaValue(kpis, "sources")}
						label="Sources detected"
						value={metricValue(
							sharedReport.metrics,
							"source_count",
							promptedSources,
						)}
					/>
				</section>

				<section className="mt-8 grid gap-4 xl:grid-cols-2">
					<ReportTrendChart
						color={primaryColor}
						data={charts.visibility_trend}
						dataKey="visibility"
						label="Visibility trend"
					/>
					<ReportTrendChart
						color={accentColor}
						data={charts.sov_trend}
						dataKey="share_of_voice"
						label="Share of voice trend"
					/>
					<ReportBarChart
						color={primaryColor}
						data={charts.sentiment}
						label="Mention sentiment"
					/>
					<ReportBarChart
						color={accentColor}
						data={charts.prompt_outcomes}
						label="Prompt wins vs losses"
					/>
				</section>

				<section className="mt-8 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
					<div className="rounded-md border border-slate-200 p-5">
						<h2 className="text-lg font-semibold">Top prompts</h2>
						<div className="mt-4 grid gap-3">
							{topPrompts.map((prompt) => (
								<div
									className="rounded-md bg-slate-50 p-4"
									key={textFromItem(prompt, "title")}
								>
									<div className="flex flex-wrap items-center justify-between gap-3">
										<p className="font-medium">
											{textFromItem(prompt, "title") || "Prompt"}
										</p>
										<span className="rounded-md bg-white px-3 py-1 text-xs font-semibold text-slate-700">
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
						<div className="rounded-md border border-slate-200 p-5">
							<h2 className="text-lg font-semibold">Competitors</h2>
							<div className="mt-4 flex flex-wrap gap-2">
								{competitors.map((competitor) => (
									<span
										className="rounded-md bg-slate-50 px-3 py-2 text-sm text-slate-600"
										key={textFromItem(competitor, "name")}
									>
										{textFromItem(competitor, "name") || "Competitor"}
									</span>
								))}
								{competitors.length === 0 ? (
									<p className="text-sm text-slate-500">
										No competitors tracked yet.
									</p>
								) : null}
							</div>
						</div>
						<div className="rounded-md border border-slate-200 p-5">
							<h2 className="text-lg font-semibold">Risks</h2>
							<ul className="mt-4 space-y-3 text-sm text-slate-600">
								{risks.map((risk) => (
									<li key={textFromItem(risk, "prompt")}>
										<strong className="text-slate-950">
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

				<section className="mt-8">
					<h2 className="mb-4 text-lg font-semibold">Recommended actions</h2>
					<ReportRecommendations
						recommendations={listValue(sharedReport.recommendations)}
					/>
				</section>

				<section className="mt-8">
					<ReportBarChart
						color={primaryColor}
						data={charts.source_rankings}
						dataKey="count"
						label="Top cited domains"
						xKey="domain"
					/>
				</section>

				<footer className="mt-8 border-t border-slate-200 pt-4 text-xs text-slate-500">
					{footerNote}
				</footer>
			</div>
		</main>
	);
}
