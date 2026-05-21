"use client";

import {
	Area,
	AreaChart,
	CartesianGrid,
	Cell,
	Line,
	LineChart,
	Pie,
	PieChart,
	ResponsiveContainer,
	Tooltip,
	XAxis,
	YAxis,
} from "recharts";
import type {
	CompetitorPressureItem,
	CompetitorShareTrendPoint,
	DiagnosticItem,
	LlmComparisonRow,
	MarketShareItem,
	MentionContextItem,
	OverviewKpi,
	PromptOpportunityItem,
	SentimentTrendPoint,
	SourceDomainItem,
	StrategicActionItem,
	VisibilityTrendPoint,
} from "@/lib/analytics/overview";

const chartGrid = "rgba(231,233,238,0.08)";
const muted = "#9aa7ba";
const cardBg = "#0a192c";
const border = "#1d2b40";
const brand = "#F49527";
const blue = "#0B4DFF";

function tooltipStyle() {
	return {
		background: cardBg,
		border: `1px solid ${border}`,
		borderRadius: 8,
		color: "#e7e9ee",
	};
}

function EmptyState({ text }: { text: string }) {
	return (
		<div className="grid min-h-48 place-items-center rounded-lg border border-dashed border-[var(--border)] p-4 text-center text-sm text-[var(--muted)]">
			{text}
		</div>
	);
}

function statusStyles(status: "healthy" | "watch" | "risk") {
	if (status === "healthy") {
		return "border-emerald-400/30 bg-emerald-400/10 text-emerald-300";
	}
	if (status === "watch") {
		return "border-amber-400/30 bg-amber-400/10 text-amber-300";
	}
	return "border-red-400/30 bg-red-400/10 text-red-300";
}

function opportunityStyles(status: PromptOpportunityItem["status"]) {
	const styles = {
		recover: "border-red-400/30 bg-red-400/10 text-red-200",
		expand: "border-amber-400/30 bg-amber-400/10 text-amber-200",
		defend: "border-emerald-400/30 bg-emerald-400/10 text-emerald-200",
		monitor: "border-sky-400/30 bg-sky-400/10 text-sky-200",
	};
	return styles[status];
}

export function ExecutiveReadinessPanel({
	score,
	label,
	summary,
	periodDays,
}: {
	score: number;
	label: string;
	summary: string;
	periodDays: number;
}) {
	return (
		<section className="neo-card overflow-hidden p-5">
			<div className="grid gap-5 lg:grid-cols-[220px_minmax(0,1fr)] lg:items-center">
				<div className="relative grid place-items-center">
					<div
						className="grid size-40 place-items-center rounded-full"
						style={{
							background: `conic-gradient(${brand} ${score}%, rgba(231,233,238,0.08) 0)`,
						}}
					>
						<div className="grid size-28 place-items-center rounded-full border border-[var(--border)] bg-[var(--background)]">
							<div className="text-center">
								<p className="text-4xl font-black tracking-[-0.06em] text-[var(--brand)]">
									{score}
								</p>
								<p className="text-[10px] font-black uppercase tracking-[0.16em] text-[var(--muted)]">
									AI readiness
								</p>
							</div>
						</div>
					</div>
				</div>
				<div>
					<div className="flex flex-wrap items-center gap-2">
						<span className="rounded-full border border-[var(--brand)] bg-[var(--brand-soft)] px-3 py-1 text-xs font-black uppercase tracking-[0.08em] text-[var(--brand)]">
							{label}
						</span>
						<span className="rounded-full border border-[var(--border)] bg-[var(--surface-subtle)] px-3 py-1 text-xs font-bold uppercase tracking-[0.08em] text-[var(--muted)]">
							Last {periodDays} days
						</span>
					</div>
					<h2 className="mt-4 text-2xl font-black tracking-[-0.04em] text-[var(--foreground)]">
						Executive GEO health check
					</h2>
					<p className="mt-3 max-w-4xl text-sm leading-6 text-[var(--muted)]">
						{summary}
					</p>
					<div className="mt-4 grid gap-2 sm:grid-cols-3">
						<div className="rounded-lg border border-[var(--border)] bg-[rgba(231,233,238,0.03)] p-3">
							<p className="text-xs font-black uppercase tracking-[0.12em] text-[var(--muted)]">
								For SMEs
							</p>
							<p className="mt-1 text-sm text-[var(--foreground)]">
								See whether AI recommends the brand, not just whether it is
								mentioned.
							</p>
						</div>
						<div className="rounded-lg border border-[var(--border)] bg-[rgba(231,233,238,0.03)] p-3">
							<p className="text-xs font-black uppercase tracking-[0.12em] text-[var(--muted)]">
								For agencies
							</p>
							<p className="mt-1 text-sm text-[var(--foreground)]">
								Explain movement by LLM, prompt intent, competitors and cited
								sources.
							</p>
						</div>
						<div className="rounded-lg border border-[var(--border)] bg-[rgba(231,233,238,0.03)] p-3">
							<p className="text-xs font-black uppercase tracking-[0.12em] text-[var(--muted)]">
								Next action
							</p>
							<p className="mt-1 text-sm text-[var(--foreground)]">
								Turn weak prompts and source gaps into tasks this week.
							</p>
						</div>
					</div>
				</div>
			</div>
		</section>
	);
}

export function DiagnosticGrid({ items }: { items: DiagnosticItem[] }) {
	return (
		<section className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
			{items.map((item) => (
				<article
					className={`rounded-xl border p-4 ${statusStyles(item.status)}`}
					key={item.label}
				>
					<div className="flex items-start justify-between gap-3">
						<div>
							<p className="text-[11px] font-black uppercase tracking-[0.14em] opacity-80">
								{item.label}
							</p>
							<p className="mt-2 text-2xl font-black tracking-[-0.04em]">
								{item.value}
							</p>
						</div>
						<span className="rounded-full border border-current px-2 py-1 text-[10px] font-black uppercase tracking-[0.1em]">
							{item.status}
						</span>
					</div>
					<p className="mt-3 text-sm leading-5 opacity-85">
						{item.explanation}
					</p>
				</article>
			))}
		</section>
	);
}

export function OverviewKpiCard({ kpi }: { kpi: OverviewKpi }) {
	const deltaIsGood =
		kpi.deltaDirection === "flat" ||
		kpi.deltaDirection === kpi.positiveDirection;
	const deltaColor =
		kpi.deltaDirection === "flat"
			? "text-[var(--muted)]"
			: deltaIsGood
				? "text-[var(--success)]"
				: "text-[#ffb4ab]";
	const arrow =
		kpi.deltaDirection === "up"
			? "↑"
			: kpi.deltaDirection === "down"
				? "↓"
				: "—";

	return (
		<article className="neo-card min-h-32 p-4">
			<div className="flex items-start justify-between gap-3">
				<div>
					<p className="text-[11px] font-black uppercase tracking-[0.14em] text-[var(--muted)]">
						{kpi.label}
					</p>
					<div className="mt-2 flex items-baseline gap-2">
						<p className="text-2xl font-black tracking-[-0.04em] text-[var(--foreground)]">
							{kpi.value}
						</p>
						<span className={`text-xs font-black ${deltaColor}`}>
							{arrow} {kpi.deltaLabel}
						</span>
					</div>
					<p className="mt-2 text-xs text-[var(--muted)]">{kpi.subtitle}</p>
				</div>
				<div className="grid size-8 place-items-center rounded-full bg-[var(--brand-soft)] text-[var(--brand)]">
					<span className="size-2 rounded-full bg-current" />
				</div>
			</div>
			<div className="mt-3 h-9">
				<ResponsiveContainer height="100%" width="100%">
					<LineChart data={kpi.sparkline}>
						<Line
							dataKey="value"
							dot={false}
							isAnimationActive={false}
							stroke={blue}
							strokeWidth={2}
							type="monotone"
						/>
					</LineChart>
				</ResponsiveContainer>
			</div>
		</article>
	);
}

export function BrandVisibilityChart({
	data,
}: {
	data: VisibilityTrendPoint[];
}) {
	if (!data.some((point) => point.visibility > 0)) {
		return <EmptyState text="Not enough visibility data yet." />;
	}

	const latest = data.at(-1);

	return (
		<section className="neo-card min-h-[430px] p-5">
			<div className="flex flex-wrap items-start justify-between gap-4">
				<div>
					<h2 className="text-lg font-black text-[var(--foreground)]">
						Brand Visibility
					</h2>
					<p className="text-sm text-[var(--muted)]">AI mentions over time</p>
					<p className="mt-8 text-4xl font-black tracking-[-0.05em] text-[var(--foreground)]">
						{(latest?.visibility ?? 0).toFixed(1)}%
					</p>
					<p className="mt-1 text-xs text-[var(--muted)]">Most recent day</p>
				</div>
				<div className="flex flex-wrap gap-2">
					<button
						className="rounded-lg border border-[var(--border)] bg-[var(--surface-subtle)] px-3 py-2 text-xs font-bold text-[var(--muted)]"
						type="button"
					>
						+ Add Note
					</button>
					<button
						className="rounded-lg border border-[var(--border)] bg-[var(--surface-subtle)] px-3 py-2 text-xs font-bold text-[var(--foreground)]"
						type="button"
					>
						Notes
					</button>
					<button
						className="rounded-lg border border-[var(--border)] bg-[var(--surface-subtle)] px-3 py-2 text-xs font-bold text-[var(--foreground)]"
						type="button"
					>
						Compare previous period
					</button>
				</div>
			</div>
			<div className="mt-5 h-72 rounded-xl bg-[rgba(231,233,238,0.035)] p-3">
				<ResponsiveContainer height="100%" width="100%">
					<AreaChart data={data}>
						<CartesianGrid stroke={chartGrid} strokeDasharray="3 3" />
						<XAxis
							dataKey="date"
							fontSize={11}
							stroke={muted}
							tickLine={false}
						/>
						<YAxis
							domain={[0, 100]}
							fontSize={11}
							stroke={muted}
							tickLine={false}
						/>
						<Tooltip contentStyle={tooltipStyle()} />
						<Area
							dataKey="visibility"
							fill={blue}
							fillOpacity={0.13}
							name="Visibility"
							stroke={blue}
							strokeWidth={3}
							type="monotone"
						/>
						<Line
							dataKey="previousVisibility"
							dot={false}
							name="Previous period"
							stroke={brand}
							strokeDasharray="5 5"
							strokeWidth={2}
							type="monotone"
						/>
					</AreaChart>
				</ResponsiveContainer>
			</div>
		</section>
	);
}

export function MarketShareDonut({ items }: { items: MarketShareItem[] }) {
	const activeItems = items.filter((item) => item.count > 0);
	if (activeItems.length === 0) {
		return <EmptyState text="Not enough share of voice data yet." />;
	}

	return (
		<section className="neo-card min-h-[430px] p-5">
			<div>
				<h2 className="text-lg font-black text-[var(--foreground)]">
					Market Share{" "}
					<span className="rounded-full bg-[var(--surface-subtle)] px-2 py-1 text-[10px] text-[var(--muted)]">
						LAST 30 DAYS
					</span>
				</h2>
				<p className="text-sm text-[var(--muted)]">Normalized Share of Voice</p>
			</div>
			<div className="mt-5 h-40">
				<ResponsiveContainer height="100%" width="100%">
					<PieChart>
						<Pie
							data={activeItems}
							dataKey="value"
							innerRadius={42}
							outerRadius={68}
							paddingAngle={3}
							stroke="transparent"
						>
							{activeItems.map((item) => (
								<Cell fill={item.color} key={item.name} />
							))}
						</Pie>
						<Tooltip contentStyle={tooltipStyle()} />
					</PieChart>
				</ResponsiveContainer>
			</div>
			<div className="mt-4 grid gap-3">
				{activeItems.map((item) => (
					<div className="grid gap-1" key={item.name}>
						<div className="flex items-center justify-between gap-3 text-sm">
							<span className="font-semibold text-[var(--foreground)]">
								{item.name}{" "}
								{item.isBrand ? (
									<span className="text-[var(--brand)]">(You)</span>
								) : null}
							</span>
							<span className="font-black text-[var(--foreground)]">
								{item.value.toFixed(1)}%
							</span>
						</div>
						<div className="h-2 overflow-hidden rounded-full bg-[rgba(231,233,238,0.08)]">
							<div
								className="h-full rounded-full"
								style={{
									backgroundColor: item.color,
									width: `${Math.max(4, item.value)}%`,
								}}
							/>
						</div>
					</div>
				))}
			</div>
		</section>
	);
}

export function LlmComparisonTable({ rows }: { rows: LlmComparisonRow[] }) {
	return (
		<section className="neo-card overflow-hidden">
			<div className="border-b border-[var(--border)] px-5 py-4">
				<h2 className="text-lg font-black text-[var(--foreground)]">
					LLM Comparison{" "}
					<span className="rounded-full bg-[var(--surface-subtle)] px-2 py-1 text-[10px] text-[var(--muted)]">
						LAST 30 DAYS
					</span>
				</h2>
				<p className="text-sm text-[var(--muted)]">
					How your brand performs across each AI channel.
				</p>
			</div>
			<div className="overflow-x-auto">
				<table className="w-full min-w-[860px] text-left text-sm">
					<thead className="bg-[var(--background)] text-[10px] font-black uppercase tracking-[0.14em] text-[var(--muted)]">
						<tr>
							<th className="px-4 py-3">LLM</th>
							<th className="px-4 py-3 text-right">Visibility</th>
							<th className="px-4 py-3 text-right">SOV</th>
							<th className="px-4 py-3 text-right">Avg Rank</th>
							<th className="px-4 py-3">Top Competitor</th>
							<th className="px-4 py-3 text-right">Sentiment</th>
						</tr>
					</thead>
					<tbody className="divide-y divide-[var(--border)]">
						{rows.map((row) => (
							<tr
								className="transition hover:bg-[rgba(244,149,39,0.04)]"
								key={row.provider}
							>
								<td className="px-4 py-3 font-bold text-[var(--foreground)]">
									{row.provider}
								</td>
								<td className="px-4 py-3 text-right font-black text-[var(--foreground)]">
									{row.visibility.toFixed(1)}%
								</td>
								<td className="px-4 py-3 text-right text-[var(--brand)]">
									{row.sov.toFixed(1)}%
								</td>
								<td className="px-4 py-3 text-right text-[var(--foreground)]">
									{row.avgRank ? `#${row.avgRank.toFixed(1)}` : "-"}
								</td>
								<td className="px-4 py-3 text-[var(--muted)]">
									{row.topCompetitor}{" "}
									<span className="text-xs">
										{row.topCompetitorShare.toFixed(1)}%
									</span>
								</td>
								<td className="px-4 py-3 text-right">
									<span className="rounded bg-[var(--brand-soft)] px-2 py-1 text-xs font-black text-[var(--brand)]">
										{row.sentimentLabel}
									</span>
								</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>
			{rows.length === 0 ? (
				<div className="p-5">
					<EmptyState text="No completed LLM runs yet." />
				</div>
			) : null}
		</section>
	);
}

export function SentimentTrendChart({ data }: { data: SentimentTrendPoint[] }) {
	return (
		<section className="neo-card p-5">
			<h2 className="text-lg font-black text-[var(--foreground)]">
				Sentiment Trend{" "}
				<span className="rounded-full bg-[var(--surface-subtle)] px-2 py-1 text-[10px] text-[var(--muted)]">
					LAST 30 DAYS
				</span>
			</h2>
			<p className="text-sm text-[var(--muted)]">
				How positive are AI mentions of your brand
			</p>
			<div className="mt-5 h-56">
				<ResponsiveContainer height="100%" width="100%">
					<LineChart data={data}>
						<CartesianGrid stroke={chartGrid} strokeDasharray="3 3" />
						<XAxis
							dataKey="date"
							fontSize={11}
							stroke={muted}
							tickLine={false}
						/>
						<YAxis
							domain={[-1, 1]}
							fontSize={11}
							stroke={muted}
							tickLine={false}
						/>
						<Tooltip contentStyle={tooltipStyle()} />
						<Line
							dataKey="score"
							dot={false}
							stroke={blue}
							strokeWidth={2}
							type="monotone"
						/>
					</LineChart>
				</ResponsiveContainer>
			</div>
		</section>
	);
}

export function MentionContextBars({ items }: { items: MentionContextItem[] }) {
	return (
		<section className="neo-card p-5">
			<h2 className="text-lg font-black text-[var(--foreground)]">
				How You're Being Mentioned{" "}
				<span className="rounded-full bg-[var(--surface-subtle)] px-2 py-1 text-[10px] text-[var(--muted)]">
					LAST 30 DAYS
				</span>
			</h2>
			<p className="text-sm text-[var(--muted)]">
				Breakdown of mention contexts
			</p>
			<div className="mt-8 grid gap-5">
				{items.map((item) => (
					<div className="grid gap-2" key={item.label}>
						<div className="flex items-center justify-between gap-3 text-sm">
							<span className="font-semibold text-[var(--foreground)]">
								{item.label}
							</span>
							<span className="font-black" style={{ color: item.color }}>
								{item.value.toFixed(1)}%
							</span>
						</div>
						<div className="h-2 overflow-hidden rounded-full bg-[rgba(231,233,238,0.08)]">
							<div
								className="h-full rounded-full"
								style={{
									backgroundColor: item.color,
									width: `${Math.max(2, item.value)}%`,
								}}
							/>
						</div>
						{item.description ? (
							<p className="text-xs text-[var(--muted)]">{item.description}</p>
						) : null}
					</div>
				))}
			</div>
		</section>
	);
}

export function CompetitorShareTrendChart({
	competitors,
	data,
}: {
	competitors: string[];
	data: CompetitorShareTrendPoint[];
}) {
	const colors = [brand, "#2BA8B7", "#D83BD2", "#7C8CEB"];
	return (
		<section className="neo-card p-5">
			<h2 className="text-lg font-black text-[var(--foreground)]">
				Competitor Share Trends{" "}
				<span className="rounded-full bg-[var(--surface-subtle)] px-2 py-1 text-[10px] text-[var(--muted)]">
					LAST 30 DAYS
				</span>
			</h2>
			<p className="text-sm text-[var(--muted)]">
				Share of Voice over time vs top competitors
			</p>
			<div className="mt-5 h-72">
				<ResponsiveContainer height="100%" width="100%">
					<LineChart data={data}>
						<CartesianGrid stroke={chartGrid} strokeDasharray="3 3" />
						<XAxis
							dataKey="date"
							fontSize={11}
							stroke={muted}
							tickLine={false}
						/>
						<YAxis
							allowDecimals={false}
							fontSize={11}
							stroke={muted}
							tickLine={false}
						/>
						<Tooltip contentStyle={tooltipStyle()} />
						<Line
							dataKey="brand"
							dot={false}
							name="Brand"
							stroke={blue}
							strokeWidth={3}
							type="monotone"
						/>
						{competitors.map((competitor, index) => (
							<Line
								dataKey={competitor}
								dot={false}
								key={competitor}
								stroke={colors[index] ?? "#bbc7e1"}
								strokeDasharray="5 5"
								strokeWidth={2}
								type="monotone"
							/>
						))}
					</LineChart>
				</ResponsiveContainer>
			</div>
		</section>
	);
}

export function SourceIntelligencePanel({
	domains,
	mix,
}: {
	domains: SourceDomainItem[];
	mix: { label: string; value: number; count: number; color: string }[];
}) {
	return (
		<section className="neo-card overflow-hidden">
			<div className="border-b border-[var(--border)] px-5 py-4">
				<h2 className="text-lg font-black text-[var(--foreground)]">
					Source Intelligence
				</h2>
				<p className="text-sm text-[var(--muted)]">
					Which domains are shaping AI answers and where competitors have a
					source advantage.
				</p>
			</div>
			<div className="grid gap-5 p-5 xl:grid-cols-[280px_minmax(0,1fr)]">
				<div className="rounded-xl border border-[var(--border)] bg-[rgba(231,233,238,0.03)] p-4">
					<p className="text-xs font-black uppercase tracking-[0.14em] text-[var(--muted)]">
						Citation mix
					</p>
					<div className="mt-5 grid gap-4">
						{mix.map((item) => (
							<div key={item.label}>
								<div className="mb-1 flex items-center justify-between text-sm">
									<span className="text-[var(--foreground)]">{item.label}</span>
									<span className="font-black" style={{ color: item.color }}>
										{item.value.toFixed(0)}%
									</span>
								</div>
								<div className="h-2 overflow-hidden rounded-full bg-[rgba(231,233,238,0.08)]">
									<div
										className="h-full rounded-full"
										style={{
											backgroundColor: item.color,
											width: `${Math.max(2, item.value)}%`,
										}}
									/>
								</div>
								<p className="mt-1 text-xs text-[var(--muted)]">
									{item.count} citations
								</p>
							</div>
						))}
					</div>
				</div>
				<div className="overflow-x-auto">
					{domains.length ? (
						<table className="w-full min-w-[820px] text-left text-sm">
							<thead className="text-[10px] font-black uppercase tracking-[0.14em] text-[var(--muted)]">
								<tr>
									<th className="px-3 py-2">Domain</th>
									<th className="px-3 py-2">Type</th>
									<th className="px-3 py-2 text-right">Citations</th>
									<th className="px-3 py-2 text-right">Brand</th>
									<th className="px-3 py-2 text-right">Competitors</th>
									<th className="px-3 py-2">Why it matters</th>
								</tr>
							</thead>
							<tbody className="divide-y divide-[var(--border)]">
								{domains.map((domain) => (
									<tr
										className="hover:bg-[rgba(244,149,39,0.04)]"
										key={domain.domain}
									>
										<td className="px-3 py-3 font-black text-[var(--foreground)]">
											{domain.domain}
										</td>
										<td className="px-3 py-3">
											<span className="rounded bg-[var(--surface-subtle)] px-2 py-1 text-xs font-bold text-[var(--muted)]">
												{domain.isOwned
													? "Owned"
													: domain.isCompetitor
														? "Competitor"
														: domain.sourceType}
											</span>
										</td>
										<td className="px-3 py-3 text-right text-[var(--foreground)]">
											{domain.count}
										</td>
										<td className="px-3 py-3 text-right text-emerald-300">
											{domain.mentionsBrand}
										</td>
										<td className="px-3 py-3 text-right text-red-200">
											{domain.mentionsCompetitors}
										</td>
										<td className="px-3 py-3 text-[var(--muted)]">
											{domain.whyItMatters}
										</td>
									</tr>
								))}
							</tbody>
						</table>
					) : (
						<EmptyState text="No cited source data yet. Run prompts to identify which domains influence AI answers." />
					)}
				</div>
			</div>
		</section>
	);
}

export function CompetitorPressurePanel({
	items,
}: {
	items: CompetitorPressureItem[];
}) {
	return (
		<section className="neo-card p-5">
			<h2 className="text-lg font-black text-[var(--foreground)]">
				Competitor Pressure
			</h2>
			<p className="text-sm text-[var(--muted)]">
				Who is stealing visibility and which source domains support them.
			</p>
			<div className="mt-5 grid gap-3 xl:grid-cols-2">
				{items.length ? (
					items.map((item) => (
						<article
							className="rounded-xl border border-[var(--border)] bg-[rgba(231,233,238,0.03)] p-4"
							key={item.name}
						>
							<div className="flex items-start justify-between gap-3">
								<div>
									<p className="font-black text-[var(--foreground)]">
										{item.name}
									</p>
									<p className="mt-1 text-xs text-[var(--muted)]">
										{item.mentions} mentions · {item.share.toFixed(1)}% of runs
									</p>
								</div>
								<span
									className={`rounded-full border px-2 py-1 text-[10px] font-black uppercase tracking-[0.1em] ${
										item.risk === "high"
											? "border-red-400/30 bg-red-400/10 text-red-200"
											: item.risk === "medium"
												? "border-amber-400/30 bg-amber-400/10 text-amber-200"
												: "border-emerald-400/30 bg-emerald-400/10 text-emerald-200"
									}`}
								>
									{item.risk} risk
								</span>
							</div>
							<div className="mt-4 grid grid-cols-2 gap-3">
								<div className="rounded-lg bg-[var(--background)] p-3">
									<p className="text-xs text-[var(--muted)]">Displacements</p>
									<p className="mt-1 text-xl font-black text-[var(--foreground)]">
										{item.displacementCount}
									</p>
								</div>
								<div className="rounded-lg bg-[var(--background)] p-3">
									<p className="text-xs text-[var(--muted)]">Top sources</p>
									<p className="mt-1 line-clamp-2 text-xs font-bold text-[var(--foreground)]">
										{item.topSourceDomains.length
											? item.topSourceDomains.join(", ")
											: "No source overlap yet"}
									</p>
								</div>
							</div>
						</article>
					))
				) : (
					<EmptyState text="No competitor pressure detected yet." />
				)}
			</div>
		</section>
	);
}

export function PromptOpportunityPanel({
	items,
}: {
	items: PromptOpportunityItem[];
}) {
	return (
		<section className="neo-card overflow-hidden">
			<div className="border-b border-[var(--border)] px-5 py-4">
				<h2 className="text-lg font-black text-[var(--foreground)]">
					Prompt Opportunity Map
				</h2>
				<p className="text-sm text-[var(--muted)]">
					Prioritize prompts where visibility, intent and competitor pressure
					create the biggest SEO/GEO upside.
				</p>
			</div>
			<div className="grid gap-3 p-5">
				{items.length ? (
					items.map((item) => (
						<article
							className="grid gap-4 rounded-xl border border-[var(--border)] bg-[rgba(231,233,238,0.03)] p-4 lg:grid-cols-[minmax(0,1fr)_140px_120px]"
							key={item.id}
						>
							<div>
								<div className="flex flex-wrap items-center gap-2">
									<span
										className={`rounded-full border px-2 py-1 text-[10px] font-black uppercase tracking-[0.1em] ${opportunityStyles(
											item.status,
										)}`}
									>
										{item.status}
									</span>
									<span className="rounded-full bg-[var(--surface-subtle)] px-2 py-1 text-[10px] font-bold text-[var(--muted)]">
										P{item.priority}
									</span>
									<span className="rounded-full bg-[var(--surface-subtle)] px-2 py-1 text-[10px] font-bold text-[var(--muted)]">
										{item.intent}
									</span>
								</div>
								<h3 className="mt-3 font-black text-[var(--foreground)]">
									{item.title}
								</h3>
								<p className="mt-1 text-sm text-[var(--muted)]">
									{item.reason}
								</p>
								{item.competitors.length ? (
									<p className="mt-2 text-xs text-[var(--muted)]">
										Competitors: {item.competitors.join(", ")}
									</p>
								) : null}
							</div>
							<div className="rounded-lg bg-[var(--background)] p-3">
								<p className="text-xs text-[var(--muted)]">Visibility</p>
								<p className="mt-1 text-2xl font-black text-[var(--foreground)]">
									{item.visibility.toFixed(1)}%
								</p>
							</div>
							<div className="rounded-lg bg-[var(--background)] p-3">
								<p className="text-xs text-[var(--muted)]">Position</p>
								<p className="mt-1 text-2xl font-black text-[var(--foreground)]">
									{item.position ? `#${item.position}` : "-"}
								</p>
							</div>
						</article>
					))
				) : (
					<EmptyState text="No prompt ranking data yet. Create and run prompts to map opportunities." />
				)}
			</div>
		</section>
	);
}

export function StrategicActionsPanel({
	items,
	workspaceSlug,
}: {
	items: StrategicActionItem[];
	workspaceSlug: string;
}) {
	return (
		<section className="neo-card p-5" id="recommended-actions">
			<div className="flex flex-wrap items-start justify-between gap-4">
				<div>
					<h2 className="text-lg font-black text-[var(--foreground)]">
						What To Do This Week
					</h2>
					<p className="text-sm text-[var(--muted)]">
						Actions translated from GEO recommendations into agency-friendly
						next steps.
					</p>
				</div>
				<a
					className="rounded-lg bg-[var(--brand)] px-3 py-2 text-xs font-black uppercase tracking-[0.04em] text-[#1b1000]"
					href={`/${workspaceSlug}/recommendations`}
				>
					Open recommendations
				</a>
			</div>
			<div className="mt-5 grid gap-3 lg:grid-cols-2">
				{items.length ? (
					items.map((item, index) => (
						<article
							className="rounded-xl border border-[var(--border)] bg-[rgba(231,233,238,0.03)] p-4"
							key={item.id}
						>
							<div className="flex items-start gap-3">
								<div className="grid size-8 shrink-0 place-items-center rounded-full bg-[var(--brand-soft)] text-sm font-black text-[var(--brand)]">
									{index + 1}
								</div>
								<div>
									<div className="flex flex-wrap items-center gap-2">
										<span className="rounded-full bg-[var(--surface-subtle)] px-2 py-1 text-[10px] font-black uppercase tracking-[0.1em] text-[var(--muted)]">
											{item.category}
										</span>
										<span className="rounded-full bg-[var(--surface-subtle)] px-2 py-1 text-[10px] font-black uppercase tracking-[0.1em] text-[var(--muted)]">
											P{item.priority}
										</span>
									</div>
									<h3 className="mt-3 font-black text-[var(--foreground)]">
										{item.title}
									</h3>
									<p className="mt-2 text-sm leading-5 text-[var(--muted)]">
										{item.description}
									</p>
									<p className="mt-3 text-xs font-bold text-[var(--brand)]">
										Impact {item.impact.toFixed(0)} · Confidence{" "}
										{item.confidence.toFixed(0)}
									</p>
								</div>
							</div>
						</article>
					))
				) : (
					<EmptyState text="No active recommendations yet. Generate recommendations to turn insights into tasks." />
				)}
			</div>
		</section>
	);
}
