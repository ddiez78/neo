"use client";

import {
	Bar,
	BarChart,
	CartesianGrid,
	Line,
	LineChart,
	ResponsiveContainer,
	Tooltip,
	XAxis,
	YAxis,
} from "recharts";

type ChartPoint = Record<string, string | number | null | undefined>;

function chartArray(value: unknown): ChartPoint[] {
	return Array.isArray(value) ? (value as ChartPoint[]) : [];
}

export function ReportTrendChart({
	data,
	dataKey,
	color,
	label,
}: {
	data: unknown;
	dataKey: string;
	color: string;
	label: string;
}) {
	const rows = chartArray(data);
	return (
		<div className="h-72 rounded-md border border-[var(--border)] bg-[var(--surface)] p-4">
			<h3 className="text-sm font-semibold text-[var(--foreground)]">
				{label}
			</h3>
			{rows.length > 0 ? (
				<ResponsiveContainer height="85%" width="100%">
					<LineChart data={rows} margin={{ left: -20, right: 10, top: 20 }}>
						<CartesianGrid stroke="#d7e2de" strokeDasharray="3 3" />
						<XAxis dataKey="date" fontSize={11} tickLine={false} />
						<YAxis fontSize={11} tickLine={false} />
						<Tooltip />
						<Line
							dataKey={dataKey}
							dot={false}
							stroke={color}
							strokeWidth={3}
							type="monotone"
						/>
					</LineChart>
				</ResponsiveContainer>
			) : (
				<p className="mt-16 text-center text-sm text-slate-500">
					Not enough historical data yet.
				</p>
			)}
		</div>
	);
}

export function ReportBarChart({
	data,
	dataKey = "value",
	label,
	color,
	xKey = "name",
}: {
	data: unknown;
	dataKey?: string;
	label: string;
	color: string;
	xKey?: string;
}) {
	const rows = chartArray(data);
	return (
		<div className="h-72 rounded-md border border-[var(--border)] bg-[var(--surface)] p-4">
			<h3 className="text-sm font-semibold text-[var(--foreground)]">
				{label}
			</h3>
			{rows.length > 0 ? (
				<ResponsiveContainer height="85%" width="100%">
					<BarChart data={rows} margin={{ left: -20, right: 10, top: 20 }}>
						<CartesianGrid stroke="#d7e2de" strokeDasharray="3 3" />
						<XAxis dataKey={xKey} fontSize={11} tickLine={false} />
						<YAxis fontSize={11} tickLine={false} />
						<Tooltip />
						<Bar dataKey={dataKey} fill={color} radius={[4, 4, 0, 0]} />
					</BarChart>
				</ResponsiveContainer>
			) : (
				<p className="mt-16 text-center text-sm text-slate-500">
					Not enough data yet.
				</p>
			)}
		</div>
	);
}
