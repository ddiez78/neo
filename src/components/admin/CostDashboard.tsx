"use client";

import { Coins, TrendingDown, TrendingUp } from "lucide-react";
import {
	Area,
	AreaChart,
	CartesianGrid,
	ResponsiveContainer,
	Tooltip,
	XAxis,
	YAxis,
} from "recharts";
import { GlossaryTip } from "@/components/ui/GlossaryTip";
import type { CostSummary } from "@/lib/analytics/cost";

const PROVIDER_LABELS: Record<string, string> = {
	chatgpt: "ChatGPT",
	claude: "Claude",
	gemini: "Gemini",
	perplexity: "Perplexity",
	deepseek: "DeepSeek",
};

function eur(n: number): string {
	return `${n.toFixed(2)}€`;
}

export function CostDashboard({
	summary,
	isEn = false,
}: {
	summary: CostSummary;
	isEn?: boolean;
}) {
	const isUp = summary.deltaPct > 0;
	const deltaColor = isUp
		? "text-amber-500"
		: summary.deltaPct < 0
			? "text-emerald-500"
			: "text-[var(--muted)]";
	const DeltaIcon = isUp
		? TrendingUp
		: summary.deltaPct < 0
			? TrendingDown
			: TrendingUp;

	return (
		<section className="grid gap-5">
			<header className="flex items-center gap-3">
				<div className="grid size-10 place-items-center rounded-lg bg-[var(--brand-soft)] text-[var(--brand)]">
					<Coins className="size-5" />
				</div>
				<div>
					<h2 className="text-xl font-bold text-[var(--foreground)]">
						{isEn ? "Cost & Efficiency" : "Coste y eficiencia"}
					</h2>
					<p className="text-sm text-[var(--muted)]">
						{isEn
							? "LLM spend, projected monthly cost and cost per mention obtained."
							: "Gasto en LLMs, coste mensual proyectado y coste por mencion conseguida."}
					</p>
				</div>
			</header>

			<div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
				<div className="neo-card p-4">
					<p className="text-[11px] font-black uppercase tracking-[0.14em] text-[var(--muted)]">
						{isEn ? "This month" : "Este mes"}
					</p>
					<p className="mt-2 text-2xl font-black text-[var(--foreground)]">
						{eur(summary.totalThisMonth)}
					</p>
					<p className={`mt-2 flex items-center gap-1 text-xs ${deltaColor}`}>
						<DeltaIcon className="size-3.5" />
						{summary.deltaPct >= 0 ? "+" : ""}
						{summary.deltaPct.toFixed(1)}%{" "}
						<span className="text-[var(--muted)]">
							{isEn ? "vs last month" : "vs mes anterior"}
						</span>
					</p>
				</div>

				<div className="neo-card p-4">
					<p className="text-[11px] font-black uppercase tracking-[0.14em] text-[var(--muted)]">
						{isEn ? "Projected" : "Proyectado"}
					</p>
					<p className="mt-2 text-2xl font-black text-[var(--foreground)]">
						{eur(summary.projectedMonthly)}
					</p>
					<p className="mt-2 text-xs text-[var(--muted)]">
						{isEn ? "At current pace" : "Al ritmo actual"}
					</p>
				</div>

				<div className="neo-card p-4">
					<p className="text-[11px] font-black uppercase tracking-[0.14em] text-[var(--muted)]">
						<GlossaryTip isEn={isEn} term="costPerMention">
							{isEn ? "Cost per mention" : "Coste por mencion"}
						</GlossaryTip>
					</p>
					<p className="mt-2 text-2xl font-black text-[var(--foreground)]">
						{summary.costPerMention > 0
							? `${summary.costPerMention.toFixed(3)}€`
							: "—"}
					</p>
					<p className="mt-2 text-xs text-[var(--muted)]">
						{summary.mentionsThisMonth} {isEn ? "mentions" : "menciones"}
					</p>
				</div>

				<div className="neo-card p-4">
					<p className="text-[11px] font-black uppercase tracking-[0.14em] text-[var(--muted)]">
						{isEn ? "Tokens used" : "Tokens usados"}
					</p>
					<p className="mt-2 text-2xl font-black text-[var(--foreground)]">
						{(summary.totalTokens / 1000).toFixed(1)}k
					</p>
					<p className="mt-2 text-xs text-[var(--muted)]">
						{isEn ? "This month" : "Este mes"}
					</p>
				</div>
			</div>

			<div className="neo-card p-5">
				<div className="mb-3 flex items-center justify-between">
					<h3 className="text-sm font-bold text-[var(--foreground)]">
						{isEn ? "Daily cost trend" : "Coste diario"}
					</h3>
					<span className="text-xs text-[var(--muted)]">
						{isEn ? "Last 30 days" : "Ultimos 30 dias"}
					</span>
				</div>
				<div className="h-48">
					<ResponsiveContainer height="100%" width="100%">
						<AreaChart data={summary.byDay}>
							<defs>
								<linearGradient id="costGrad" x1="0" x2="0" y1="0" y2="1">
									<stop offset="5%" stopColor="#F49527" stopOpacity={0.4} />
									<stop offset="95%" stopColor="#F49527" stopOpacity={0} />
								</linearGradient>
							</defs>
							<CartesianGrid stroke="rgba(120,120,120,0.1)" vertical={false} />
							<XAxis
								dataKey="date"
								fontSize={10}
								stroke="var(--muted)"
								tickFormatter={(d) => d.slice(5)}
							/>
							<YAxis
								fontSize={10}
								stroke="var(--muted)"
								tickFormatter={(v) => `${v.toFixed(2)}€`}
								width={50}
							/>
							<Tooltip
								contentStyle={{
									background: "var(--surface-raised, white)",
									border: "1px solid var(--border)",
									borderRadius: 8,
									fontSize: 12,
								}}
								formatter={(v) => [`${Number(v).toFixed(3)}€`, "Cost"]}
							/>
							<Area
								dataKey="cost"
								fill="url(#costGrad)"
								stroke="#F49527"
								strokeWidth={2}
								type="monotone"
							/>
						</AreaChart>
					</ResponsiveContainer>
				</div>
			</div>

			<div className="neo-card p-5">
				<h3 className="text-sm font-bold text-[var(--foreground)]">
					{isEn ? "Cost by provider" : "Coste por proveedor"}
				</h3>
				<div className="mt-4 overflow-x-auto">
					<table className="w-full text-sm">
						<thead>
							<tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted)]">
								<th className="py-2 text-left font-semibold">
									{isEn ? "Provider" : "Proveedor"}
								</th>
								<th className="py-2 text-right font-semibold">
									{isEn ? "Runs" : "Ejecuciones"}
								</th>
								<th className="py-2 text-right font-semibold">
									{isEn ? "Cost" : "Coste"}
								</th>
								<th className="py-2 text-right font-semibold">
									{isEn ? "Avg/run" : "Media/run"}
								</th>
							</tr>
						</thead>
						<tbody>
							{summary.byProvider.length === 0 ? (
								<tr>
									<td
										className="py-6 text-center text-[var(--muted)]"
										colSpan={4}
									>
										{isEn
											? "No costs recorded yet."
											: "Sin costes registrados aun."}
									</td>
								</tr>
							) : (
								summary.byProvider.map((row) => (
									<tr
										className="border-b border-[var(--border)] last:border-0"
										key={row.provider}
									>
										<td className="py-2 font-semibold text-[var(--foreground)]">
											{PROVIDER_LABELS[row.provider] ?? row.provider}
										</td>
										<td className="py-2 text-right text-[var(--foreground)]">
											{row.runs}
										</td>
										<td className="py-2 text-right font-bold text-[var(--foreground)]">
											{eur(row.cost)}
										</td>
										<td className="py-2 text-right text-[var(--muted)]">
											{row.runs > 0
												? `${(row.cost / row.runs).toFixed(4)}€`
												: "—"}
										</td>
									</tr>
								))
							)}
						</tbody>
					</table>
				</div>
			</div>
		</section>
	);
}
