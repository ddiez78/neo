"use client";

import { ArrowUpDown, ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";
import type { CompetitorRow } from "./CompetitorSummaryBar";

interface Props {
	rows: CompetitorRow[];
	locale: "es" | "en";
}

type SortKey = keyof CompetitorRow;
type SortDir = "asc" | "desc";

const riskStyles = {
	high: {
		badge: "border-red-500/40 bg-red-500/[0.12] text-red-400",
		bar: "bg-red-400",
		rowBorder: "border-l-red-500/60",
	},
	medium: {
		badge: "border-amber-500/40 bg-amber-500/[0.12] text-amber-400",
		bar: "bg-amber-400",
		rowBorder: "border-l-amber-500/60",
	},
	low: {
		badge: "border-emerald-500/40 bg-emerald-500/[0.12] text-emerald-400",
		bar: "bg-emerald-400",
		rowBorder: "border-l-emerald-500/60",
	},
};

const sentimentStyles = {
	positive: "border-emerald-500/40 bg-emerald-500/[0.12] text-emerald-400",
	neutral: "border-[var(--border)] bg-[var(--surface)] text-[var(--muted)]",
	negative: "border-red-500/40 bg-red-500/[0.12] text-red-400",
};

function SortIcon({
	col,
	sortCol,
	sortDir,
}: {
	col: SortKey;
	sortCol: SortKey;
	sortDir: SortDir;
}) {
	if (col !== sortCol) {
		return <ArrowUpDown className="ml-1 inline size-3 opacity-40" />;
	}
	return sortDir === "asc" ? (
		<ChevronUp className="ml-1 inline size-3" />
	) : (
		<ChevronDown className="ml-1 inline size-3" />
	);
}

function getSentimentLabel(
	score: number | null,
	isEn: boolean,
): { label: string; style: string } {
	if (score === null)
		return {
			label: isEn ? "No data" : "Sin datos",
			style: sentimentStyles.neutral,
		};
	if (score >= 60)
		return {
			label: isEn ? "Positive" : "Positivo",
			style: sentimentStyles.positive,
		};
	if (score >= 30)
		return {
			label: isEn ? "Neutral" : "Neutral",
			style: sentimentStyles.neutral,
		};
	return {
		label: isEn ? "Negative" : "Negativo",
		style: sentimentStyles.negative,
	};
}

function getRiskLabel(risk: "high" | "medium" | "low", isEn: boolean): string {
	if (risk === "high") return isEn ? "High" : "Alta";
	if (risk === "medium") return isEn ? "Medium" : "Media";
	return isEn ? "Low" : "Baja";
}

function sortRows(rows: CompetitorRow[], col: SortKey, dir: SortDir) {
	return [...rows].sort((a, b) => {
		const av = a[col];
		const bv = b[col];
		let cmp = 0;
		if (av === null || av === undefined) cmp = 1;
		else if (bv === null || bv === undefined) cmp = -1;
		else if (typeof av === "number" && typeof bv === "number") cmp = av - bv;
		else if (typeof av === "string" && typeof bv === "string")
			cmp = av.localeCompare(bv);
		else cmp = String(av).localeCompare(String(bv));
		return dir === "asc" ? cmp : -cmp;
	});
}

type ColDef = {
	key: SortKey;
	label: { es: string; en: string };
	sortable: boolean;
};

const COLUMNS: ColDef[] = [
	{
		key: "name",
		label: { es: "Competidor", en: "Competitor" },
		sortable: true,
	},
	{
		key: "mentions",
		label: { es: "Menciones", en: "Mentions" },
		sortable: true,
	},
	{ key: "share", label: { es: "Presión", en: "Pressure" }, sortable: true },
	{
		key: "displacements",
		label: { es: "Desplazam.", en: "Displacements" },
		sortable: true,
	},
	{
		key: "avgPosition",
		label: { es: "Pos. media", en: "Avg. pos." },
		sortable: true,
	},
	{
		key: "sentimentScore",
		label: { es: "Sentimiento", en: "Sentiment" },
		sortable: true,
	},
	{
		key: "topSources",
		label: { es: "Fuentes top", en: "Top sources" },
		sortable: false,
	},
	{ key: "risk", label: { es: "Amenaza", en: "Threat" }, sortable: true },
];

export function CompetitorTable({ rows, locale }: Props) {
	const isEn = locale === "en";
	const [sortCol, setSortCol] = useState<SortKey>("share");
	const [sortDir, setSortDir] = useState<SortDir>("desc");

	function toggleSort(col: SortKey) {
		if (col === sortCol) {
			setSortDir((d) => (d === "asc" ? "desc" : "asc"));
		} else {
			setSortCol(col);
			setSortDir("desc");
		}
	}

	const sorted = sortRows(rows, sortCol, sortDir);

	if (rows.length === 0) {
		return (
			<div className="neo-card p-8 text-center">
				<p className="text-sm text-[var(--muted)]">
					{isEn
						? "No competitors yet. Add one above."
						: "Aún no hay competidores. Añade uno arriba."}
				</p>
			</div>
		);
	}

	const maxShare = Math.max(...rows.map((r) => r.share), 1);

	return (
		<div className="overflow-x-auto rounded-lg border border-[var(--border)] bg-[var(--surface-raised)]">
			<table className="w-full text-sm">
				<thead>
					<tr className="border-b border-[var(--border)]">
						{COLUMNS.map((col) => (
							<th
								className={`px-4 py-3 text-left text-[10px] font-black uppercase tracking-[0.1em] text-[var(--muted)] ${
									col.sortable
										? "cursor-pointer select-none hover:text-[var(--foreground)]"
										: ""
								}`}
								key={String(col.key)}
								onClick={col.sortable ? () => toggleSort(col.key) : undefined}
							>
								{col.label[locale]}
								{col.sortable ? (
									<SortIcon col={col.key} sortCol={sortCol} sortDir={sortDir} />
								) : null}
							</th>
						))}
					</tr>
				</thead>
				<tbody>
					{sorted.map((row) => {
						const risk = riskStyles[row.risk];
						const sentiment = getSentimentLabel(row.sentimentScore, isEn);
						const riskLabel = getRiskLabel(row.risk, isEn);
						const barWidth = maxShare > 0 ? (row.share / maxShare) * 100 : 0;

						return (
							<tr
								className={`border-b border-[var(--border)] border-l-4 hover:bg-[var(--surface-subtle)] ${risk.rowBorder}`}
								key={row.id}
							>
								{/* Competidor */}
								<td className="px-4 py-3">
									<div className="font-semibold text-[var(--foreground)]">
										{row.name}
									</div>
									{row.domain ? (
										<div className="text-xs text-[var(--muted)]">
											{row.domain}
										</div>
									) : null}
									{row.aliases.length > 0 ? (
										<div className="mt-1 flex flex-wrap gap-1">
											{row.aliases.slice(0, 2).map((a) => (
												<span
													className="rounded border border-[var(--border)] bg-[var(--surface)] px-1.5 py-0.5 text-[10px] text-[var(--muted)]"
													key={a}
												>
													{a}
												</span>
											))}
											{row.aliases.length > 2 ? (
												<span className="rounded border border-[var(--border)] bg-[var(--surface)] px-1.5 py-0.5 text-[10px] text-[var(--muted)]">
													+{row.aliases.length - 2}
												</span>
											) : null}
										</div>
									) : null}
								</td>

								{/* Menciones */}
								<td className="px-4 py-3 text-right font-semibold tabular-nums text-[var(--foreground)]">
									{row.mentions}
								</td>

								{/* Presión — barra proporcional */}
								<td className="px-4 py-3">
									<div className="flex items-center gap-2">
										<div className="h-2 w-20 overflow-hidden rounded-full bg-[var(--background)]">
											<div
												className={`h-full rounded-full ${risk.bar}`}
												style={{ width: `${Math.max(4, barWidth)}%` }}
											/>
										</div>
										<span className="w-10 text-right text-xs font-semibold tabular-nums text-[var(--foreground)]">
											{row.share.toFixed(1)}%
										</span>
									</div>
								</td>

								{/* Desplazamientos */}
								<td className="px-4 py-3 text-center tabular-nums">
									{row.displacements > 0 ? (
										<span className="font-semibold text-red-400">
											{row.displacements}
										</span>
									) : (
										<span className="text-[var(--muted)]">0</span>
									)}
								</td>

								{/* Posición media */}
								<td className="px-4 py-3 text-center tabular-nums text-[var(--foreground)]">
									{row.avgPosition !== null ? (
										<span className="font-semibold">
											#{row.avgPosition.toFixed(1)}
										</span>
									) : (
										<span className="text-[var(--muted)]">—</span>
									)}
								</td>

								{/* Sentimiento */}
								<td className="px-4 py-3">
									<span
										className={`rounded-md border px-2 py-0.5 text-xs font-semibold ${sentiment.style}`}
									>
										{sentiment.label}
									</span>
								</td>

								{/* Fuentes top */}
								<td className="px-4 py-3">
									{row.topSources.length > 0 ? (
										<div className="flex flex-wrap gap-1">
											{row.topSources.slice(0, 2).map((s) => (
												<span
													className="rounded border border-[var(--border)] bg-[var(--surface)] px-1.5 py-0.5 text-[10px] text-[var(--muted)]"
													key={s}
												>
													{s}
												</span>
											))}
											{row.topSources.length > 2 ? (
												<span className="rounded border border-[var(--border)] bg-[var(--surface)] px-1.5 py-0.5 text-[10px] text-[var(--muted)]">
													+{row.topSources.length - 2}
												</span>
											) : null}
										</div>
									) : (
										<span className="text-xs text-[var(--muted)]">—</span>
									)}
								</td>

								{/* Amenaza */}
								<td className="px-4 py-3">
									<span
										className={`rounded-md border px-2 py-0.5 text-xs font-semibold ${risk.badge}`}
									>
										{riskLabel}
									</span>
								</td>
							</tr>
						);
					})}
				</tbody>
			</table>
		</div>
	);
}
