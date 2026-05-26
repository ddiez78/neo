"use client";

import { ShieldAlert, ShieldCheck, ShieldEllipsis } from "lucide-react";

export type CompetitorRow = {
	id: string;
	name: string;
	domain: string | null;
	aliases: string[];
	mentions: number;
	share: number;
	displacements: number;
	avgPosition: number | null;
	sentimentScore: number | null;
	topSources: string[];
	risk: "high" | "medium" | "low";
};

interface Props {
	rows: CompetitorRow[];
	totalRuns: number;
	locale: "es" | "en";
}

const riskConfig = {
	high: {
		border: "border-l-red-500",
		badge: "border-red-500/40 bg-red-500/[0.12] text-red-400",
		dot: "bg-red-400",
		icon: ShieldAlert,
		label: { es: "Alta amenaza", en: "High threat" },
	},
	medium: {
		border: "border-l-amber-500",
		badge: "border-amber-500/40 bg-amber-500/[0.12] text-amber-400",
		dot: "bg-amber-400",
		icon: ShieldEllipsis,
		label: { es: "Amenaza media", en: "Medium threat" },
	},
	low: {
		border: "border-l-emerald-500",
		badge: "border-emerald-500/40 bg-emerald-500/[0.12] text-emerald-400",
		dot: "bg-emerald-400",
		icon: ShieldCheck,
		label: { es: "Monitorizado", en: "Monitoring" },
	},
};

function initials(name: string) {
	return name
		.split(/\s+/)
		.slice(0, 2)
		.map((w) => w[0]?.toUpperCase() ?? "")
		.join("");
}

export function CompetitorSummaryBar({ rows, totalRuns, locale }: Props) {
	const isEn = locale === "en";
	const top = rows.slice(0, 3);

	if (top.length === 0) return null;

	return (
		<div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
			{top.map((row, idx) => {
				const cfg = riskConfig[row.risk];
				const Icon = cfg.icon;
				return (
					<div className={`neo-card border-l-4 p-4 ${cfg.border}`} key={row.id}>
						<div className="flex items-start justify-between gap-3">
							<div className="flex items-center gap-3">
								<div className="grid size-9 shrink-0 place-items-center rounded-lg border border-[var(--border)] bg-[var(--surface-high)] text-sm font-black text-[var(--foreground)]">
									{initials(row.name)}
								</div>
								<div className="min-w-0">
									<div className="flex items-center gap-1.5">
										<span className="truncate text-sm font-black text-[var(--foreground)]">
											{row.name}
										</span>
										<span className="text-[10px] font-black text-[var(--muted)]">
											#{idx + 1}
										</span>
									</div>
									{row.domain ? (
										<p className="truncate text-xs text-[var(--muted)]">
											{row.domain}
										</p>
									) : null}
								</div>
							</div>
							<span
								className={`shrink-0 rounded-md border px-2 py-0.5 text-xs font-black ${cfg.badge}`}
							>
								{row.share.toFixed(0)}%
							</span>
						</div>

						{/* Mini progress bar */}
						<div className="mt-3 h-1.5 overflow-hidden rounded-full bg-[var(--background)]">
							<div
								className={`h-full rounded-full ${cfg.dot}`}
								style={{ width: `${Math.max(4, Math.min(100, row.share))}%` }}
							/>
						</div>

						<div className="mt-3 flex items-center justify-between text-xs text-[var(--muted)]">
							<span>
								{row.mentions} {isEn ? "mentions" : "menciones"}
							</span>
							{row.displacements > 0 ? (
								<span className="text-red-400">
									{row.displacements}{" "}
									{isEn ? "displacements" : "desplazamientos"}
								</span>
							) : (
								<span className="text-emerald-400">
									{isEn ? "No displacements" : "Sin desplazamientos"}
								</span>
							)}
						</div>

						<div
							className={`mt-3 flex items-center gap-1.5 text-xs font-semibold ${cfg.badge} rounded-md border px-2 py-1`}
						>
							<Icon className="size-3.5" />
							{cfg.label[locale]}
						</div>
					</div>
				);
			})}
		</div>
	);
}
