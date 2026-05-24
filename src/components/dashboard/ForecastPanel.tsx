"use client";

import { Target, TrendingDown, TrendingUp } from "lucide-react";
import { Area, AreaChart, ResponsiveContainer, XAxis, YAxis } from "recharts";
import type { Forecast } from "@/lib/analytics/forecast";

export function ForecastPanel({
	forecast,
	isEn = false,
}: {
	forecast: Forecast;
	isEn?: boolean;
}) {
	if (!forecast.hasEnoughData) {
		return (
			<section className="neo-card p-5">
				<h3 className="text-sm font-bold text-[var(--foreground)]">
					{isEn ? "Forecast" : "Proyeccion"}
				</h3>
				<p className="mt-2 text-sm text-[var(--muted)]">
					{isEn
						? "Need at least 7 days of data to forecast."
						: "Necesitas al menos 7 dias de datos para proyectar."}
				</p>
			</section>
		);
	}

	const isImproving = forecast.slopePerDay > 0.02;
	const isDeclining = forecast.slopePerDay < -0.02;
	const trendColor = isImproving
		? "text-emerald-500"
		: isDeclining
			? "text-red-500"
			: "text-[var(--muted)]";
	const TrendIcon = isImproving
		? TrendingUp
		: isDeclining
			? TrendingDown
			: Target;

	return (
		<section className="neo-card overflow-hidden p-0">
			<div className="border-b border-[var(--border)] bg-[var(--surface-subtle)] px-5 py-4">
				<div className="flex items-center justify-between gap-3">
					<div>
						<p className="text-xs font-black uppercase tracking-[0.16em] text-[var(--brand)]">
							{isEn ? "Forecast" : "Proyeccion"}
						</p>
						<h2 className="mt-1 text-lg font-bold text-[var(--foreground)]">
							{isEn ? "Where you are heading" : "Hacia donde te diriges"}
						</h2>
					</div>
					<div className={`flex items-center gap-1.5 text-sm ${trendColor}`}>
						<TrendIcon className="size-4" />
						<span className="font-bold">
							{forecast.slopePerDay > 0 ? "+" : ""}
							{forecast.slopePerDay.toFixed(2)}/{isEn ? "day" : "dia"}
						</span>
					</div>
				</div>
			</div>

			<div className="grid grid-cols-3 divide-x divide-[var(--border)] border-b border-[var(--border)]">
				<div className="px-4 py-3 text-center">
					<p className="text-[10px] font-bold uppercase tracking-wider text-[var(--muted)]">
						{isEn ? "30 days" : "30 dias"}
					</p>
					<p className="mt-1 text-xl font-black text-[var(--foreground)]">
						{forecast.in30Days.toFixed(0)}
					</p>
				</div>
				<div className="px-4 py-3 text-center">
					<p className="text-[10px] font-bold uppercase tracking-wider text-[var(--muted)]">
						{isEn ? "60 days" : "60 dias"}
					</p>
					<p className="mt-1 text-xl font-black text-[var(--foreground)]">
						{forecast.in60Days.toFixed(0)}
					</p>
				</div>
				<div className="px-4 py-3 text-center">
					<p className="text-[10px] font-bold uppercase tracking-wider text-[var(--muted)]">
						{isEn ? "90 days" : "90 dias"}
					</p>
					<p className="mt-1 text-xl font-black text-[var(--foreground)]">
						{forecast.in90Days.toFixed(0)}
					</p>
				</div>
			</div>

			<div className="h-32 px-2">
				<ResponsiveContainer height="100%" width="100%">
					<AreaChart data={forecast.projection}>
						<defs>
							<linearGradient id="forecastGrad" x1="0" x2="0" y1="0" y2="1">
								<stop offset="5%" stopColor="#F49527" stopOpacity={0.4} />
								<stop offset="95%" stopColor="#F49527" stopOpacity={0} />
							</linearGradient>
						</defs>
						<XAxis dataKey="day" hide />
						<YAxis domain={[0, 100]} hide />
						<Area
							dataKey="value"
							fill="url(#forecastGrad)"
							stroke="#F49527"
							strokeDasharray="4 4"
							strokeWidth={2}
							type="monotone"
						/>
					</AreaChart>
				</ResponsiveContainer>
			</div>

			<div className="border-t border-[var(--border)] px-5 py-3 text-xs text-[var(--muted)]">
				{forecast.daysToTarget75 === 0 ? (
					<span className="text-emerald-600">
						{isEn
							? "🎯 Already above target score (75)"
							: "🎯 Ya estas por encima de score objetivo (75)"}
					</span>
				) : forecast.daysToTarget75 !== null ? (
					<span>
						{isEn
							? `At this pace, you reach score 75 in ${forecast.daysToTarget75} days.`
							: `A este ritmo, alcanzas score 75 en ${forecast.daysToTarget75} dias.`}
					</span>
				) : (
					<span>
						{isEn
							? "Current trend will not reach score 75. Implement recommendations to accelerate."
							: "La tendencia actual no alcanzara score 75. Implementa recomendaciones para acelerar."}
					</span>
				)}
			</div>
		</section>
	);
}
