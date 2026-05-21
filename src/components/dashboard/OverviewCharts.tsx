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
	CompetitorShareTrendPoint,
	LlmComparisonRow,
	MarketShareItem,
	MentionContextItem,
	OverviewKpi,
	SentimentTrendPoint,
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
