"use client";

import {
	Area,
	AreaChart,
	CartesianGrid,
	ResponsiveContainer,
	Tooltip,
	XAxis,
	YAxis,
} from "recharts";
import type { PromptMetrics } from "@/types";

export function TrendChart({ metrics }: { metrics: PromptMetrics[] }) {
	const data = metrics.map((item) => ({
		date: item.metric_date,
		visibility: Number(item.visibility_score),
		mentions: item.mention_count,
	}));

	return (
		<div className="neo-card h-72 min-w-0 p-4">
			<div className="mb-4">
				<h2 className="text-base font-semibold text-[var(--foreground)]">
					Visibility Trend
				</h2>
				<p className="text-sm text-[var(--muted)]">
					Share of Voice and mentions over time.
				</p>
			</div>
			<ResponsiveContainer height={205} minWidth={0} width="100%">
				<AreaChart data={data}>
					<CartesianGrid
						stroke="rgba(231,233,238,0.08)"
						strokeDasharray="3 3"
					/>
					<XAxis
						axisLine={false}
						dataKey="date"
						fontSize={12}
						stroke="#9aa7ba"
						tickLine={false}
					/>
					<YAxis
						axisLine={false}
						fontSize={12}
						stroke="#9aa7ba"
						tickLine={false}
					/>
					<Tooltip
						contentStyle={{
							background: "#0a192c",
							border: "1px solid #1d2b40",
							borderRadius: 8,
							color: "#e7e9ee",
						}}
					/>
					<Area
						dataKey="visibility"
						fill="#f49527"
						fillOpacity={0.18}
						stroke="#f49527"
						strokeWidth={2}
						type="monotone"
					/>
				</AreaChart>
			</ResponsiveContainer>
		</div>
	);
}
