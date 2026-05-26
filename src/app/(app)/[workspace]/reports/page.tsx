import Image from "next/image";
import {
	generateMonthlyReportAction,
	updateReportBrandingAction,
	uploadReportLogoAction,
} from "@/actions/reports";
import { CopyReportLinkButton } from "@/components/reports/CopyReportLinkButton";
import {
	ReportBarChart,
	ReportTrendChart,
} from "@/components/reports/ReportCharts";
import { ReportKpiCard } from "@/components/reports/ReportKpiCard";
import { ReportRecommendations } from "@/components/reports/ReportRecommendations";
import { getWorkspaceOverview, requireWorkspace } from "@/lib/data/workspace";

function metricValue(
	metrics: Record<string, unknown> | undefined,
	key: string,
	fallback = 0,
) {
	const value = metrics?.[key];
	return typeof value === "number" ? value : fallback;
}

function objectValue(value: unknown) {
	return value && typeof value === "object"
		? (value as Record<string, unknown>)
		: {};
}

function arrayValue(value: unknown) {
	return Array.isArray(value) ? value : [];
}

function stringList(value: unknown) {
	return Array.isArray(value) ? value.map(String).filter(Boolean) : [];
}

function deltaValue(kpis: Record<string, unknown>, key: string) {
	const value = objectValue(kpis[key]);
	const absolute = value.absolute;
	return typeof absolute === "number" ? { absolute } : undefined;
}

export default async function Page({
	params,
	searchParams,
}: {
	params: Promise<{ workspace: string }>;
	searchParams: Promise<{
		error?: string;
		generated?: string;
		branding?: string;
		logo?: string;
	}>;
}) {
	const { workspace: slug } = await params;
	const status = await searchParams;
	const workspace = await requireWorkspace(slug);
	const overview = await getWorkspaceOverview(workspace.id);
	const { reports, reportBranding } = overview;
	const latestReport = reports[0];
	const brandingAction = updateReportBrandingAction.bind(
		null,
		workspace.id,
		workspace.slug,
	);
	const logoAction = uploadReportLogoAction.bind(
		null,
		workspace.id,
		workspace.slug,
	);
	const generateAction = generateMonthlyReportAction.bind(
		null,
		workspace.id,
		workspace.slug,
		`/${workspace.slug}/reports?generated=1`,
	);
	const branding = {
		agency_name: reportBranding?.agency_name ?? "",
		client_name: reportBranding?.client_name ?? "",
		logo_url: reportBranding?.logo_url ?? "",
		primary_color: reportBranding?.primary_color ?? "#071326",
		accent_color: reportBranding?.accent_color ?? "#F49527",
		footer_note: reportBranding?.footer_note ?? "",
	};
	const latestCharts = latestReport?.charts ?? {};
	const latestKpis = latestReport?.kpi_summary ?? {};

	return (
		<main className="flex-1 overflow-auto p-4 pb-24 lg:p-6 lg:pb-6">
			<div className="grid gap-6">
				<div className="flex flex-wrap items-start justify-between gap-4">
					<div>
						<p className="text-xs font-black uppercase tracking-[0.2em] text-[var(--brand)]">
							White label reporting
						</p>
						<h1 className="mt-2 text-3xl font-black tracking-[-0.03em] text-[var(--foreground)]">
							Client GEO reports
						</h1>
						<p className="mt-2 max-w-3xl text-sm text-[var(--muted)]">
							Generate branded client reports with visibility trends, SOV,
							sources, prompt wins/losses, risks, and recommended actions.
						</p>
					</div>
					<form action={generateAction}>
						<button
							className="rounded-lg bg-[var(--brand)] px-4 py-2 text-sm font-black text-[#1b1000] transition hover:brightness-110"
							type="submit"
						>
							Generate monthly report
						</button>
					</form>
				</div>

				{status.error ? (
					<p className="rounded-md bg-red-50 p-3 text-sm text-red-700">
						{status.error}
					</p>
				) : null}
				{status.generated ? (
					<p className="rounded-md bg-emerald-50 p-3 text-sm text-emerald-700">
						Monthly white label report generated.
					</p>
				) : null}
				{status.branding || status.logo ? (
					<p className="rounded-md bg-emerald-50 p-3 text-sm text-emerald-700">
						White label branding updated.
					</p>
				) : null}

				<section className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
					<form action={brandingAction} className="neo-card grid gap-4 p-5">
						<div>
							<h2 className="font-semibold text-[var(--foreground)]">
								White label settings
							</h2>
							<p className="mt-1 text-sm text-slate-500">
								These settings are copied into each report snapshot when it is
								generated.
							</p>
						</div>
						<div className="grid gap-3 md:grid-cols-2">
							<label className="grid gap-1 text-sm font-medium text-slate-700">
								Agency name
								<input
									className="rounded-md border border-[var(--border)] bg-white px-3 py-2"
									defaultValue={branding.agency_name}
									name="agency_name"
								/>
							</label>
							<label className="grid gap-1 text-sm font-medium text-slate-700">
								Client name
								<input
									className="rounded-md border border-[var(--border)] bg-white px-3 py-2"
									defaultValue={branding.client_name}
									name="client_name"
								/>
							</label>
							<label className="grid gap-1 text-sm font-medium text-slate-700">
								Primary color
								<input
									className="h-10 rounded-md border border-[var(--border)] bg-white px-2"
									defaultValue={branding.primary_color}
									name="primary_color"
									type="color"
								/>
							</label>
							<label className="grid gap-1 text-sm font-medium text-slate-700">
								Accent color
								<input
									className="h-10 rounded-md border border-[var(--border)] bg-white px-2"
									defaultValue={branding.accent_color}
									name="accent_color"
									type="color"
								/>
							</label>
						</div>
						<label className="grid gap-1 text-sm font-medium text-slate-700">
							Footer note
							<textarea
								className="min-h-20 rounded-md border border-[var(--border)] bg-white px-3 py-2"
								defaultValue={branding.footer_note}
								name="footer_note"
							/>
						</label>
						<button
							className="w-fit rounded-md bg-slate-950 px-4 py-2 text-sm font-semibold text-white"
							type="submit"
						>
							Save branding
						</button>
					</form>

					<div className="neo-card grid gap-4 p-5">
						<h2 className="font-semibold text-[var(--foreground)]">
							Report logo
						</h2>
						<div className="flex min-h-24 items-center justify-center rounded-md border border-dashed border-[var(--border)] bg-[var(--surface-subtle)] p-4">
							{branding.logo_url ? (
								<Image
									alt="Report logo"
									className="max-h-20 max-w-64 object-contain"
									height={80}
									src={branding.logo_url}
									width={256}
								/>
							) : (
								<p className="text-sm text-slate-500">No logo uploaded yet.</p>
							)}
						</div>
						<form action={logoAction} className="grid gap-3">
							<input
								accept="image/*"
								className="rounded-md border border-[var(--border)] bg-white px-3 py-2 text-sm"
								name="logo"
								required
								type="file"
							/>
							<button
								className="w-fit rounded-md border border-[var(--border)] px-4 py-2 text-sm font-semibold text-slate-700"
								type="submit"
							>
								Upload logo
							</button>
						</form>
					</div>
				</section>

				{latestReport ? (
					<section className="grid gap-5">
						<div className="flex flex-wrap items-end justify-between gap-3">
							<div>
								<p className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">
									Latest report preview
								</p>
								<h2 className="mt-1 text-xl font-semibold text-[var(--foreground)]">
									{latestReport.title}
								</h2>
							</div>
							<div className="flex flex-wrap gap-2">
								<a
									className="rounded-md bg-[var(--brand-deep)] px-3 py-2 text-sm font-semibold text-white"
									href={`/reports/${latestReport.share_token}`}
									rel="noreferrer"
									target="_blank"
								>
									Open share page
								</a>
								<CopyReportLinkButton
									url={`/reports/${latestReport.share_token}`}
								/>
							</div>
						</div>
						<div className="grid gap-3 md:grid-cols-4">
							<ReportKpiCard
								delta={deltaValue(latestKpis, "visibility")}
								label="Visibility"
								suffix=" pp"
								value={`${Number(latestReport.visibility_score).toFixed(0)}%`}
							/>
							<ReportKpiCard
								delta={deltaValue(latestKpis, "share_of_voice")}
								label="Share of voice"
								suffix=" pp"
								value={`${Number(latestReport.share_of_voice).toFixed(0)}%`}
							/>
							<ReportKpiCard
								delta={deltaValue(latestKpis, "mentions")}
								label="Mentions"
								value={metricValue(latestReport.metrics, "brand_mentions")}
							/>
							<ReportKpiCard
								delta={deltaValue(latestKpis, "sources")}
								label="Sources"
								value={metricValue(latestReport.metrics, "source_count")}
							/>
						</div>
						<EntityStatePanel entityState={latestReport.entity_state} />
						<div className="grid gap-4 xl:grid-cols-2">
							<ReportTrendChart
								color={branding.primary_color}
								data={latestCharts.visibility_trend}
								dataKey="visibility"
								label="Visibility trend"
							/>
							<ReportTrendChart
								color={branding.accent_color}
								data={latestCharts.sov_trend}
								dataKey="share_of_voice"
								label="Share of voice trend"
							/>
							<ReportBarChart
								color={branding.primary_color}
								data={latestCharts.sentiment}
								label="Sentiment"
							/>
							<ReportBarChart
								color={branding.accent_color}
								data={latestCharts.source_rankings}
								dataKey="count"
								label="Top cited domains"
								xKey="domain"
							/>
						</div>
						<ReportRecommendations
							recommendations={arrayValue(latestReport.recommendations)}
						/>
					</section>
				) : null}

				<section className="grid gap-4">
					<h2 className="text-xl font-semibold text-[var(--foreground)]">
						Report history
					</h2>
					{reports.map((report) => (
						<article className="neo-card p-5" key={report.id}>
							<div className="flex flex-wrap items-start justify-between gap-4">
								<div>
									<p className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">
										{report.period_start ?? report.report_month} -{" "}
										{report.period_end ?? report.report_month}
									</p>
									<h3 className="mt-2 text-lg font-semibold text-[var(--foreground)]">
										{report.title}
									</h3>
									<p className="mt-2 max-w-4xl text-sm leading-6 text-slate-600">
										{report.executive_summary}
									</p>
								</div>
								<div className="grid grid-cols-2 gap-2 text-center">
									<div className="rounded-md bg-[var(--surface-subtle)] px-4 py-3">
										<p className="text-xs text-slate-500">Visibility</p>
										<p className="text-xl font-semibold text-[var(--foreground)]">
											{Number(report.visibility_score).toFixed(0)}%
										</p>
									</div>
									<div className="rounded-md bg-[var(--surface-subtle)] px-4 py-3">
										<p className="text-xs text-slate-500">SOV</p>
										<p className="text-xl font-semibold text-[var(--foreground)]">
											{Number(report.share_of_voice).toFixed(0)}%
										</p>
									</div>
								</div>
							</div>
							<div className="mt-4 flex flex-wrap gap-3">
								<a
									className="rounded-md border border-[var(--border)] px-3 py-2 text-sm font-semibold text-slate-700"
									href={`/reports/${report.share_token}`}
									rel="noreferrer"
									target="_blank"
								>
									Open share page
								</a>
								<CopyReportLinkButton url={`/reports/${report.share_token}`} />
							</div>
						</article>
					))}
					{reports.length === 0 ? (
						<div className="rounded-md border border-dashed border-[var(--border)] bg-[var(--surface)] p-8 text-center">
							<h2 className="font-semibold text-[var(--foreground)]">
								No reports yet
							</h2>
							<p className="mt-2 text-sm text-slate-500">
								Configure branding and generate the first monthly snapshot for
								this client.
							</p>
						</div>
					) : null}
				</section>
			</div>
		</main>
	);
}

function EntityStatePanel({
	entityState,
}: {
	entityState?: Record<string, unknown>;
}) {
	const state = objectValue(entityState);
	if (!Object.keys(state).length) {
		return null;
	}
	const score = Number(state.score ?? 0);
	const facts = stringList(state.verifiedFacts).slice(0, 5);
	const gaps = stringList(state.entityGaps).slice(0, 4);
	const misunderstood = stringList(state.misunderstoodFacts).slice(0, 4);

	return (
		<section className="neo-card p-5">
			<div className="flex flex-wrap items-start justify-between gap-4">
				<div>
					<p className="text-xs font-black uppercase tracking-[0.16em] text-[var(--brand)]">
						Estado de Entidad
					</p>
					<h2 className="mt-2 text-xl font-semibold text-[var(--foreground)]">
						Company Bio entendida al {score}/100
					</h2>
					<p className="mt-2 text-sm text-slate-500">
						{String(state.status ?? "Sin estado")} - completitud{" "}
						{String(state.completeness ?? 0)}% - siguiente accion:{" "}
						{String(state.nextAction ?? "Actualizar Company Bio")}
					</p>
				</div>
				<div className="rounded-md bg-[var(--brand-soft)] px-4 py-3 text-center">
					<p className="text-xs font-semibold uppercase text-[var(--brand)]">
						Score
					</p>
					<p className="text-3xl font-black text-[var(--brand)]">{score}</p>
				</div>
			</div>
			<div className="mt-4 grid gap-3 md:grid-cols-3">
				<ReportEntityList title="Campos verificados" items={facts} />
				<ReportEntityList title="Prompts donde falla" items={misunderstood} />
				<ReportEntityList title="Gaps principales" items={gaps} />
			</div>
		</section>
	);
}

function ReportEntityList({
	title,
	items,
}: {
	title: string;
	items: string[];
}) {
	return (
		<div className="rounded-md border border-[var(--border)] bg-[var(--surface-subtle)] p-3">
			<p className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">
				{title}
			</p>
			{items.length ? (
				<ul className="mt-2 grid gap-1 text-sm text-slate-600">
					{items.map((item) => (
						<li key={item}>{item}</li>
					))}
				</ul>
			) : (
				<p className="mt-2 text-sm text-slate-500">Sin datos todavia.</p>
			)}
		</div>
	);
}
