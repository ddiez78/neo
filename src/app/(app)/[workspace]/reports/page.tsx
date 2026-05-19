import { generateMonthlyReportAction } from "@/actions/reports";
import { getWorkspaceOverview, requireWorkspace } from "@/lib/data/workspace";

function metricValue(
	metrics: Record<string, unknown> | undefined,
	key: string,
	fallback = 0,
) {
	const value = metrics?.[key];
	return typeof value === "number" ? value : fallback;
}

export default async function Page({
	params,
	searchParams,
}: {
	params: Promise<{ workspace: string }>;
	searchParams: Promise<{ error?: string; generated?: string }>;
}) {
	const { workspace: slug } = await params;
	const status = await searchParams;
	const workspace = await requireWorkspace(slug);
	const { reports } = await getWorkspaceOverview(workspace.id);
	const generateAction = generateMonthlyReportAction.bind(
		null,
		workspace.id,
		workspace.slug,
	);

	return (
		<main className="flex-1 overflow-auto p-4 pb-24 lg:p-6 lg:pb-6">
			<div className="grid gap-6">
				<div className="flex flex-wrap items-start justify-between gap-4">
					<div>
						<p className="text-xs font-semibold uppercase tracking-[0.08em] text-teal-700">
							Monthly reporting
						</p>
						<h1 className="mt-2 text-2xl font-semibold text-[var(--foreground)]">
							Reports
						</h1>
						<p className="mt-2 max-w-3xl text-slate-600">
							Executive summaries for AI visibility, prompt wins and losses,
							competitor risks, and recommended actions.
						</p>
					</div>
					<form action={generateAction}>
						<button
							className="rounded-md bg-[var(--brand-deep)] px-4 py-2 text-sm font-semibold text-white"
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
						Monthly report generated.
					</p>
				) : null}
				<section className="grid gap-4">
					{reports.map((report) => (
						<article className="neo-card p-5" key={report.id}>
							<div className="flex flex-wrap items-start justify-between gap-4">
								<div>
									<p className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">
										{report.report_month}
									</p>
									<h2 className="mt-2 text-lg font-semibold text-[var(--foreground)]">
										{report.title}
									</h2>
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
										<p className="text-xs text-slate-500">Share voice</p>
										<p className="text-xl font-semibold text-[var(--foreground)]">
											{Number(report.share_of_voice).toFixed(0)}%
										</p>
									</div>
								</div>
							</div>
							<div className="mt-4 grid gap-3 md:grid-cols-4">
								<div className="rounded-md bg-[var(--surface-subtle)] p-3">
									<p className="text-sm font-medium text-[var(--foreground)]">
										Runs
									</p>
									<p className="mt-1 text-sm text-slate-500">
										{metricValue(
											report.metrics,
											"total_runs",
											report.top_prompts.length,
										)}
									</p>
								</div>
								<div className="rounded-md bg-[var(--surface-subtle)] p-3">
									<p className="text-sm font-medium text-[var(--foreground)]">
										Prompts won/lost
									</p>
									<p className="mt-1 text-sm text-slate-500">
										{metricValue(report.metrics, "won_prompts")} /{" "}
										{metricValue(report.metrics, "lost_prompts")}
									</p>
								</div>
								<div className="rounded-md bg-[var(--surface-subtle)] p-3">
									<p className="text-sm font-medium text-[var(--foreground)]">
										Sources
									</p>
									<p className="mt-1 text-sm text-slate-500">
										{metricValue(report.metrics, "source_count")}
									</p>
								</div>
								<div className="rounded-md bg-[var(--surface-subtle)] p-3">
									<p className="text-sm font-medium text-[var(--foreground)]">
										Open tasks
									</p>
									<p className="mt-1 text-sm text-slate-500">
										{metricValue(
											report.metrics,
											"open_tasks",
											report.recommended_actions.length,
										)}
									</p>
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
								<a
									className="rounded-md bg-[var(--brand-deep)] px-3 py-2 text-sm font-semibold text-white"
									href={`/reports/${report.share_token}`}
									rel="noreferrer"
									target="_blank"
								>
									Export PDF
								</a>
							</div>
						</article>
					))}
					{reports.length === 0 ? (
						<div className="rounded-md border border-dashed border-[var(--border)] bg-[var(--surface)] p-8 text-center">
							<h2 className="font-semibold text-[var(--foreground)]">
								No reports yet
							</h2>
							<p className="mt-2 text-sm text-slate-500">
								Generate the first monthly snapshot for this client workspace.
							</p>
						</div>
					) : null}
				</section>
			</div>
		</main>
	);
}
