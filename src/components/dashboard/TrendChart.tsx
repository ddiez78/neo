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
		<div className="h-72 rounded-md border border-slate-200 bg-white p-4">
			<div className="mb-4">
				<h2 className="text-base font-semibold text-slate-950">
					Evolucion de visibilidad
				</h2>
				<p className="text-sm text-slate-500">Score y menciones por dia.</p>
			</div>
			<ResponsiveContainer height="78%" width="100%">
				<AreaChart data={data}>
					<CartesianGrid stroke="#e2e8f0" strokeDasharray="3 3" />
					<XAxis dataKey="date" fontSize={12} tickLine={false} />
					<YAxis fontSize={12} tickLine={false} />
					<Tooltip />
					<Area
						dataKey="visibility"
						fill="#22d3ee"
						fillOpacity={0.18}
						stroke="#0891b2"
						strokeWidth={2}
						type="monotone"
					/>
				</AreaChart>
			</ResponsiveContainer>
		</div>
	);
}
