import { Activity, Download } from "lucide-react";
import Link from "next/link";
import { generateMonthlyReportAction } from "@/actions/reports";
import { ForecastPanel } from "@/components/dashboard/ForecastPanel";
import {
	BrandVisibilityChart,
	CompetitorPressurePanel,
	CompetitorShareTrendChart,
	DiagnosticGrid,
	ExecutiveReadinessPanel,
	LlmComparisonTable,
	MarketShareDonut,
	MentionContextBars,
	OverviewKpiCard,
	PromptOpportunityPanel,
	SentimentTrendChart,
	SourceIntelligencePanel,
	StrategicActionsPanel,
} from "@/components/dashboard/OverviewCharts";
import { ProDashboard } from "@/components/dashboard/ProDashboard";
import type { SetupChecklistStatus } from "@/components/dashboard/SetupChecklist";
import { SetupChecklist } from "@/components/dashboard/SetupChecklist";
import { SmeDashboard } from "@/components/dashboard/SmeDashboard";
import { WeeklyActivityFeed } from "@/components/dashboard/WeeklyActivityFeed";
import { getWeeklyActivity } from "@/lib/analytics/activity";
import { computeForecast } from "@/lib/analytics/forecast";
import { getOverviewAnalytics } from "@/lib/analytics/overview";
import { scoreCompanyUnderstanding } from "@/lib/company-bio/context";
import { getWorkspaceOverview, requireWorkspace } from "@/lib/data/workspace";
import { getUserPreferences } from "@/lib/preferences-server";

function CompanyUnderstandingPanel({
	score,
	completeness,
	verifiedCount,
	totalVerificationFields,
	status,
	nextAction,
	entityGaps,
	workspaceSlug,
}: ReturnType<typeof scoreCompanyUnderstanding> & { workspaceSlug: string }) {
	return (
		<section className="neo-card p-5">
			<div className="flex flex-wrap items-start justify-between gap-4">
				<div>
					<p className="text-xs font-black uppercase tracking-[0.16em] text-[var(--brand)]">
						Company Understanding
					</p>
					<h2 className="mt-2 text-xl font-black text-[var(--foreground)]">
						La IA entiende la empresa al {score}%
					</h2>
					<p className="mt-2 max-w-3xl text-sm leading-6 text-[var(--muted)]">
						Perfil {status.toLowerCase()}: {completeness}% completo y{" "}
						{verifiedCount} de {totalVerificationFields} campos verificados.
						Siguiente accion: {nextAction}
					</p>
				</div>
				<a
					className="rounded-lg bg-[var(--brand)] px-4 py-2 text-sm font-black text-[#1b1000] transition hover:brightness-110"
					href={`/${workspaceSlug}/company-bio`}
				>
					Actualizar Company Bio
				</a>
			</div>
			<div className="mt-4 grid gap-3 md:grid-cols-3">
				<div className="rounded-lg border border-[var(--border)] bg-[var(--surface-subtle)] p-3">
					<p className="text-xs font-black uppercase tracking-[0.12em] text-[var(--muted)]">
						Score
					</p>
					<p className="mt-1 text-3xl font-black text-[var(--brand)]">
						{score}/100
					</p>
				</div>
				<div className="rounded-lg border border-[var(--border)] bg-[var(--surface-subtle)] p-3">
					<p className="text-xs font-black uppercase tracking-[0.12em] text-[var(--muted)]">
						Verificados
					</p>
					<p className="mt-1 text-3xl font-black text-[var(--foreground)]">
						{verifiedCount}
					</p>
				</div>
				<div className="rounded-lg border border-[var(--border)] bg-[var(--surface-subtle)] p-3">
					<p className="text-xs font-black uppercase tracking-[0.12em] text-[var(--muted)]">
						Top entity gaps
					</p>
					<p className="mt-1 text-sm font-bold text-[var(--foreground)]">
						{entityGaps[0] ?? "Sin gaps urgentes."}
					</p>
				</div>
			</div>
		</section>
	);
}

export default async function Page({
	params,
}: {
	params: Promise<{ workspace: string }>;
}) {
	const { workspace: slug } = await params;
	const workspace = await requireWorkspace(slug);
	const { locale, mode } = await getUserPreferences();
	const isEn = locale === "en";
	const [analytics, overview, weeklyActivity] = await Promise.all([
		getOverviewAnalytics(workspace.id, 30),
		getWorkspaceOverview(workspace.id),
		getWeeklyActivity(workspace.id, 7),
	]);

	const setupStatus: SetupChecklistStatus = {
		companyConfigured: Boolean(overview.company?.brand_name),
		competitorsAdded: overview.competitors.length > 0,
		llmsActive: overview.llmConfigs.some((c) => c.enabled),
		promptsCreated: overview.prompts.length > 0,
		runsExecuted: overview.runs.length > 0,
	};

	const forecast = computeForecast(
		analytics.visibilityTrend.map((p) => p.visibility),
	);

	if (mode === "sme") {
		const latestReport = overview.reports[0] ?? null;
		const generateReportAction = generateMonthlyReportAction.bind(
			null,
			workspace.id,
			workspace.slug,
			`/${workspace.slug}/dashboard`,
		);
		return (
			<SmeDashboard
				analytics={analytics}
				generateReportAction={generateReportAction}
				isEn={isEn}
				latestReport={latestReport}
				setupStatus={setupStatus}
				weeklyActivity={weeklyActivity}
				workspaceSlug={workspace.slug}
			/>
		);
	}

	if (mode === "pro") {
		return (
			<ProDashboard
				analytics={analytics}
				forecast={forecast}
				isEn={isEn}
				setupStatus={setupStatus}
				weeklyActivity={weeklyActivity}
				workspaceSlug={workspace.slug}
			/>
		);
	}

	const companyUnderstanding = scoreCompanyUnderstanding({
		company: overview.company,
		runs: overview.runs,
		rankings: overview.rankings,
	});

	return (
		<main className="flex-1 overflow-auto p-4 pb-24 lg:p-6 lg:pb-8">
			<div className="mx-auto grid max-w-[1440px] gap-6">
				<SetupChecklist
					isEn={isEn}
					status={setupStatus}
					workspaceSlug={workspace.slug}
				/>
				<WeeklyActivityFeed
					activity={weeklyActivity}
					isEn={isEn}
					workspaceSlug={workspace.slug}
				/>
				<ForecastPanel forecast={forecast} isEn={isEn} />
				<section className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
					<div>
						<p className="text-xs font-black uppercase tracking-[0.2em] text-[var(--brand)]">
							citame.ai Intelligence
						</p>
						<h1 className="mt-2 text-3xl font-black tracking-[-0.03em] text-[var(--foreground)] md:text-4xl">
							{isEn ? "Executive Overview" : "Executive Overview"}
						</h1>
						<p className="mt-2 max-w-2xl text-sm text-[var(--muted)]">
							{isEn
								? "AI visibility, share of voice, sentiment, and competitor pressure across active LLMs."
								: "Visibilidad IA, share of voice, sentimiento y presion competitiva en los LLMs activos."}
						</p>
					</div>
					<div className="flex flex-wrap gap-2">
						<button
							className="inline-flex items-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--surface-subtle)] px-3 py-2 text-xs font-bold uppercase tracking-[0.04em] text-[var(--foreground)] transition hover:border-[var(--brand)]"
							type="button"
						>
							<Activity className="size-4 text-[var(--brand)]" />
							{isEn ? "Last 30 Days" : "Ultimos 30 dias"}
						</button>
						<Link
							className="inline-flex items-center gap-2 rounded-lg bg-[var(--brand)] px-3 py-2 text-xs font-black uppercase tracking-[0.04em] text-[#1b1000] transition hover:brightness-110"
							href={`/${workspace.slug}/reports`}
						>
							<Download className="size-4" />
							{isEn ? "Export Report" : "Exportar informe"}
						</Link>
					</div>
				</section>

				<ExecutiveReadinessPanel
					label={analytics.readinessLabel}
					periodDays={analytics.periodDays}
					score={analytics.readinessScore}
					summary={analytics.executiveSummary}
				/>

				<CompanyUnderstandingPanel
					{...companyUnderstanding}
					workspaceSlug={workspace.slug}
				/>

				<DiagnosticGrid items={analytics.diagnostics} />

				<section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-6">
					{analytics.kpis.map((kpi) => (
						<OverviewKpiCard isEn={isEn} key={kpi.key} kpi={kpi} />
					))}
				</section>

				<section>
					<h2 className="mb-4 text-sm font-black uppercase tracking-[0.16em] text-[var(--muted)]">
						Visibility Trends
					</h2>
					<div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_400px]">
						<BrandVisibilityChart data={analytics.visibilityTrend} />
						<MarketShareDonut items={analytics.marketShare} />
					</div>
				</section>

				<LlmComparisonTable rows={analytics.llmComparison} />

				<section>
					<h2 className="mb-4 text-sm font-black uppercase tracking-[0.16em] text-[var(--muted)]">
						Brand Perception
					</h2>
					<div className="grid gap-5 xl:grid-cols-2">
						<SentimentTrendChart data={analytics.sentimentTrend} />
						<MentionContextBars items={analytics.mentionContexts} />
					</div>
				</section>

				<CompetitorShareTrendChart
					competitors={analytics.competitorShareTrend.competitors}
					data={analytics.competitorShareTrend.data}
				/>

				<section>
					<h2 className="mb-4 text-sm font-black uppercase tracking-[0.16em] text-[var(--muted)]">
						Source & Competitive Intelligence
					</h2>
					<div className="grid gap-5 xl:grid-cols-[minmax(0,1.2fr)_minmax(360px,0.8fr)]">
						<SourceIntelligencePanel
							domains={analytics.sourceDomains}
							mix={analytics.sourceMix}
						/>
						<CompetitorPressurePanel items={analytics.competitorPressure} />
					</div>
				</section>

				<section>
					<h2 className="mb-4 text-sm font-black uppercase tracking-[0.16em] text-[var(--muted)]">
						Execution Priorities
					</h2>
					<div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_460px]">
						<PromptOpportunityPanel items={analytics.promptOpportunities} />
						<StrategicActionsPanel
							items={analytics.strategicActions}
							workspaceSlug={workspace.slug}
						/>
					</div>
				</section>
			</div>
		</main>
	);
}
