"use client";

import {
	ChevronDown,
	ChevronUp,
	Pencil,
	Plus,
	Search,
	Trash2,
	Trophy,
	X,
} from "lucide-react";
import { useMemo, useState } from "react";
import { countryFlag } from "@/lib/country";
import { computePromptSov } from "@/lib/metrics/promptSov";
import { intentFromPrompt } from "@/lib/prompts/intent";
import type { Prompt, PromptRanking, PromptRun, Sentiment } from "@/types";
import { AddPromptDialog } from "./AddPromptDialog";

interface Props {
	prompts: Prompt[];
	rankings: PromptRanking[];
	runs: PromptRun[];
	sourcesByPromptId: Map<string, string[]>;
	workspaceCountryCode: string;
	locale: "es" | "en";
	addPromptAction: (formData: FormData) => Promise<void>;
	toggleStatusAction: (promptId: string, formData: FormData) => Promise<void>;
	deleteAction: (promptId: string, formData: FormData) => Promise<void>;
}

function normalize(value: string) {
	return value.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
}

type RowHealth = "top" | "mentioned" | "competitors-only" | "no-data";
type SortKey = "position" | "sov" | "sentiment" | "health" | "status";

function getRowHealth(ranking: PromptRanking | undefined): RowHealth {
	if (!ranking || ranking.latest_run_id == null) return "no-data";
	const score = Number(ranking.visibility_score ?? 0);
	if (score >= 70) return "top";
	if (ranking.brand_mentioned) return "mentioned";
	return "competitors-only";
}

const healthTone: Record<
	RowHealth,
	{
		dot: string;
		border: string;
		text: string;
		label: { es: string; en: string };
	}
> = {
	top: {
		dot: "bg-emerald-500",
		border: "border-l-emerald-500",
		text: "text-emerald-300",
		label: { es: "Top visibilidad", en: "Top visibility" },
	},
	mentioned: {
		dot: "bg-amber-500",
		border: "border-l-amber-500",
		text: "text-amber-300",
		label: { es: "Mencionada", en: "Mentioned" },
	},
	"competitors-only": {
		dot: "bg-red-500",
		border: "border-l-red-500",
		text: "text-red-300",
		label: { es: "Solo competidores", en: "Competitors only" },
	},
	"no-data": {
		dot: "bg-slate-300",
		border: "border-l-slate-300",
		text: "text-slate-400",
		label: { es: "Sin datos", en: "No data" },
	},
};

const sentimentTone: Record<
	Sentiment,
	{ bg: string; label: { es: string; en: string } }
> = {
	positive: {
		bg: "bg-emerald-400/15 text-emerald-200 border-emerald-400/30",
		label: { es: "Positivo", en: "Positive" },
	},
	neutral: {
		bg: "bg-slate-400/15 text-slate-300 border-slate-400/30",
		label: { es: "Neutral", en: "Neutral" },
	},
	negative: {
		bg: "bg-rose-400/15 text-rose-200 border-rose-400/30",
		label: { es: "Negativo", en: "Negative" },
	},
	no_data: {
		bg: "bg-slate-400/10 text-slate-400 border-slate-400/20",
		label: { es: "Sin datos", en: "No data" },
	},
};

const SENTIMENT_ORDER: Record<Sentiment, number> = {
	positive: 0,
	neutral: 1,
	negative: 2,
	no_data: 3,
};
const HEALTH_ORDER: Record<RowHealth, number> = {
	top: 0,
	mentioned: 1,
	"competitors-only": 2,
	"no-data": 3,
};

const INTENT_TABS = [
	{ key: "all", label: { es: "Todos", en: "All" } },
	{ key: "awareness", label: { es: "Awareness", en: "Awareness" } },
	{
		key: "recommendation",
		label: { es: "Recomendación", en: "Recommendation" },
	},
	{ key: "comparison", label: { es: "Comparativas", en: "Comparison" } },
	{ key: "alternatives", label: { es: "Alternativas", en: "Alternatives" } },
	{ key: "pricing", label: { es: "Precio", en: "Pricing" } },
	{ key: "risk", label: { es: "Riesgos", en: "Risk" } },
	{ key: "local", label: { es: "Local", en: "Local" } },
	{ key: "branded", label: { es: "Branded", en: "Branded" } },
] as const;

function formatDate(
	iso: string | null | undefined,
	locale: "es" | "en",
): string {
	if (!iso) return "—";
	const d = new Date(iso);
	return d.toLocaleDateString(locale === "en" ? "en-US" : "es-ES");
}

export function PromptsTable({
	prompts,
	rankings,
	runs,
	sourcesByPromptId,
	workspaceCountryCode,
	locale,
	addPromptAction,
	toggleStatusAction,
	deleteAction,
}: Props) {
	const isEn = locale === "en";
	const [query, setQuery] = useState("");
	const [expandedId, setExpandedId] = useState<string | null>(null);
	const [showAddDialog, setShowAddDialog] = useState(false);
	const [sortKey, setSortKey] = useState<SortKey | null>(null);
	const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
	const [tagFilter, setTagFilter] = useState<string[]>([]);
	const [intentFilter, setIntentFilter] = useState("all");

	function handleSort(key: SortKey) {
		if (sortKey === key) {
			setSortDir((d) => (d === "asc" ? "desc" : "asc"));
		} else {
			setSortKey(key);
			setSortDir("asc");
		}
	}

	function toggleTag(tag: string) {
		setTagFilter((prev) =>
			prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag],
		);
	}

	const rankingByPromptId = useMemo(() => {
		const map = new Map<string, PromptRanking>();
		for (const r of rankings) map.set(r.prompt_id, r);
		return map;
	}, [rankings]);

	const sovByPromptId = useMemo(() => {
		const map = new Map<string, ReturnType<typeof computePromptSov>>();
		for (const p of prompts) map.set(p.id, computePromptSov(p.id, runs));
		return map;
	}, [prompts, runs]);

	const allTags = useMemo(
		() => [...new Set(prompts.flatMap((p) => p.tags))].sort(),
		[prompts],
	);

	const intentCounts = useMemo(() => {
		const counts: Record<string, number> = { all: prompts.length };
		for (const p of prompts) {
			const k = intentFromPrompt(p);
			counts[k] = (counts[k] ?? 0) + 1;
		}
		return counts;
	}, [prompts]);

	const filtered = useMemo(() => {
		let result = [...prompts];

		const q = normalize(query.trim());
		if (q) {
			result = result.filter((p) => {
				const ranking = rankingByPromptId.get(p.id);
				const hay = normalize(
					[
						p.title,
						p.body,
						...p.tags,
						...(ranking?.competitors_mentioned ?? []),
					].join(" "),
				);
				return hay.includes(q);
			});
		}

		if (tagFilter.length > 0) {
			result = result.filter((p) => tagFilter.some((t) => p.tags.includes(t)));
		}

		if (intentFilter !== "all") {
			result = result.filter((p) => intentFromPrompt(p) === intentFilter);
		}

		if (sortKey) {
			result = [...result].sort((a, b) => {
				const ra = rankingByPromptId.get(a.id);
				const rb = rankingByPromptId.get(b.id);
				let cmp = 0;
				if (sortKey === "position") {
					cmp =
						(ra?.brand_position ?? Infinity) - (rb?.brand_position ?? Infinity);
				} else if (sortKey === "sov") {
					const sa = sovByPromptId.get(a.id);
					const sb = sovByPromptId.get(b.id);
					cmp = (sb?.sov ?? 0) - (sa?.sov ?? 0);
				} else if (sortKey === "sentiment") {
					cmp =
						SENTIMENT_ORDER[(ra?.sentiment as Sentiment) ?? "no_data"] -
						SENTIMENT_ORDER[(rb?.sentiment as Sentiment) ?? "no_data"];
				} else if (sortKey === "health") {
					cmp = HEALTH_ORDER[getRowHealth(ra)] - HEALTH_ORDER[getRowHealth(rb)];
				} else if (sortKey === "status") {
					cmp = a.status === b.status ? 0 : a.status === "active" ? -1 : 1;
				}
				return sortDir === "asc" ? cmp : -cmp;
			});
		}

		return result;
	}, [
		prompts,
		query,
		tagFilter,
		intentFilter,
		sortKey,
		sortDir,
		rankingByPromptId,
		sovByPromptId,
	]);

	const flag = countryFlag(workspaceCountryCode);

	const hasActiveFilters =
		tagFilter.length > 0 || intentFilter !== "all" || query.trim() !== "";

	return (
		<section className="space-y-3" id="prompt-library">
			<header className="flex flex-wrap items-start justify-between gap-3">
				<div>
					<h2 className="text-lg font-bold text-[var(--foreground)]">
						{isEn ? "Your Prompts Performance" : "Rendimiento de tus prompts"}
					</h2>
					<div className="mt-2 flex flex-wrap gap-4 text-xs text-[var(--muted)]">
						<LegendDot
							color="bg-emerald-500"
							label={isEn ? "Top visibility" : "Top visibilidad"}
						/>
						<LegendDot
							color="bg-amber-500"
							label={isEn ? "Mentioned" : "Mencionada"}
						/>
						<LegendDot
							color="bg-red-500"
							label={isEn ? "Competitors only" : "Solo competidores"}
						/>
						<LegendDot
							color="bg-slate-300"
							label={isEn ? "No data" : "Sin datos"}
						/>
					</div>
				</div>
			</header>

			{/* Intent tabs */}
			<div className="-mb-1 flex gap-1 overflow-x-auto pb-1">
				{INTENT_TABS.map(({ key, label }) => {
					const count = intentCounts[key] ?? 0;
					const active = intentFilter === key;
					return (
						<button
							className={`shrink-0 rounded-md px-3 py-1.5 text-xs font-semibold transition ${
								active
									? "bg-[var(--brand)] text-[#1b1000]"
									: "border border-[var(--border)] text-[var(--muted)] hover:border-[var(--brand)] hover:text-[var(--foreground)]"
							}`}
							key={key}
							onClick={() => setIntentFilter(key)}
							type="button"
						>
							{isEn ? label.en : label.es}
							{key !== "all" && count > 0 ? (
								<span className="ml-1 opacity-70">({count})</span>
							) : key === "all" ? (
								<span className="ml-1 opacity-70">({prompts.length})</span>
							) : null}
						</button>
					);
				})}
			</div>

			{/* Search + Add row */}
			<div className="flex flex-wrap items-center gap-2">
				<div className="relative min-w-[240px] flex-1">
					<Search
						aria-hidden="true"
						className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[var(--muted)]"
					/>
					<input
						className="w-full rounded-md border border-[var(--border)] bg-[var(--surface)] py-2 pl-9 pr-3 text-sm text-[var(--foreground)] outline-none focus:border-[var(--brand)]"
						onChange={(e) => setQuery(e.target.value)}
						placeholder={
							isEn
								? "Search prompts by text, tags, or competitor..."
								: "Buscar prompts por texto, tags o competidor..."
						}
						type="search"
						value={query}
					/>
				</div>
				<button
					className="inline-flex items-center gap-2 rounded-md bg-[var(--brand)] px-4 py-2 text-sm font-bold text-[#1b1000] transition hover:brightness-110"
					onClick={() => setShowAddDialog(true)}
					type="button"
				>
					<Plus className="size-4" />
					{isEn ? "Add prompt" : "Añadir prompt"}
				</button>
			</div>

			{/* Tag filter chips */}
			{allTags.length > 0 ? (
				<div className="flex flex-wrap items-center gap-1.5">
					{allTags.map((tag) => {
						const active = tagFilter.includes(tag);
						return (
							<button
								className={`rounded-md px-2 py-0.5 text-[11px] font-medium transition ${
									active
										? "bg-[var(--brand)] text-[#1b1000] font-bold"
										: "border border-[var(--border)] text-[var(--muted)] hover:border-[var(--brand)]"
								}`}
								key={tag}
								onClick={() => toggleTag(tag)}
								type="button"
							>
								#{tag}
							</button>
						);
					})}
					{tagFilter.length > 0 ? (
						<button
							className="inline-flex items-center gap-1 rounded-md border border-[var(--border)] px-2 py-0.5 text-[11px] text-[var(--muted)] hover:text-red-300"
							onClick={() => setTagFilter([])}
							type="button"
						>
							<X className="size-3" />
							{isEn ? "Clear" : "Limpiar"}
						</button>
					) : null}
				</div>
			) : null}

			{hasActiveFilters ? (
				<p className="text-xs text-[var(--muted)]">
					{isEn
						? `Showing ${filtered.length} of ${prompts.length} prompts`
						: `Mostrando ${filtered.length} de ${prompts.length} prompts`}
					{" · "}
					<button
						className="underline hover:text-[var(--foreground)]"
						onClick={() => {
							setQuery("");
							setTagFilter([]);
							setIntentFilter("all");
						}}
						type="button"
					>
						{isEn ? "Reset all filters" : "Limpiar filtros"}
					</button>
				</p>
			) : null}

			{filtered.length === 0 ? (
				<div className="rounded-md border border-dashed border-[var(--border)] bg-[var(--surface-subtle)] p-8 text-center text-sm text-[var(--muted)]">
					{prompts.length === 0
						? isEn
							? "No prompts yet. Create your first one."
							: "Aún no hay prompts. Crea el primero."
						: isEn
							? "No prompts match your search."
							: "Ningún prompt coincide con tu búsqueda."}
				</div>
			) : (
				<div className="overflow-x-auto rounded-md border border-[var(--border)] bg-[var(--surface-raised,_white)]">
					<table className="w-full text-sm">
						<thead className="border-b border-[var(--border)] bg-[var(--surface-subtle)] text-left text-[10px] font-semibold uppercase tracking-[0.06em] text-[var(--muted)]">
							<tr>
								<th className="px-3 py-2">{isEn ? "Rank" : "Rank"}</th>
								<th className="px-3 py-2">{isEn ? "Prompt" : "Prompt"}</th>
								<SortTh
									active={sortKey === "position"}
									dir={sortDir}
									label={isEn ? "Position" : "Posición"}
									onClick={() => handleSort("position")}
								/>
								<SortTh
									active={sortKey === "sov"}
									dir={sortDir}
									label="SOV"
									onClick={() => handleSort("sov")}
								/>
								<SortTh
									active={sortKey === "sentiment"}
									dir={sortDir}
									label={isEn ? "Sentiment" : "Sentimiento"}
									onClick={() => handleSort("sentiment")}
								/>
								<th className="px-3 py-2">Tags</th>
								<th className="px-3 py-2">{isEn ? "Country" : "País"}</th>
								<SortTh
									active={sortKey === "status"}
									dir={sortDir}
									label="Status"
									onClick={() => handleSort("status")}
								/>
								<SortTh
									active={sortKey === "health"}
									dir={sortDir}
									label={isEn ? "Health" : "Salud"}
									onClick={() => handleSort("health")}
								/>
								<th className="px-3 py-2 text-right">
									{isEn ? "Actions" : "Acciones"}
								</th>
							</tr>
						</thead>
						<tbody>
							{filtered.map((prompt, idx) => {
								const ranking = rankingByPromptId.get(prompt.id);
								const sov = sovByPromptId.get(prompt.id);
								const health = getRowHealth(ranking);
								const tone = healthTone[health];
								const sentiment = (ranking?.sentiment ??
									"no_data") as Sentiment;
								const sentTone = sentimentTone[sentiment];
								const isExpanded = expandedId === prompt.id;
								const position = ranking?.brand_position ?? null;
								const visibility = Number(ranking?.visibility_score ?? 0);
								const sources = sourcesByPromptId.get(prompt.id) ?? [];

								return (
									<RowFragment key={prompt.id}>
										<tr
											className={`border-b border-[var(--border)] border-l-4 ${tone.border} align-top transition hover:bg-[var(--surface-subtle)]/50`}
										>
											<td className="px-3 py-3 text-sm font-semibold text-[var(--foreground)]">
												{idx + 1}
											</td>
											<td className="px-3 py-3">
												<p className="line-clamp-2 max-w-md text-sm text-[var(--foreground)]">
													{prompt.body || prompt.title}
												</p>
												<button
													className="mt-1 inline-flex items-center gap-1 text-xs text-[var(--brand)] hover:underline"
													onClick={() =>
														setExpandedId((prev) =>
															prev === prompt.id ? null : prompt.id,
														)
													}
													type="button"
												>
													<ChevronDown
														className={`size-3 transition-transform ${isExpanded ? "rotate-180" : ""}`}
													/>
													{isEn ? "Details below" : "Ver detalles"}
												</button>
											</td>
											<td className="px-3 py-3">
												{position != null ? (
													<div className="flex items-center gap-1.5">
														<span className="text-sm font-semibold text-[var(--foreground)]">
															#{position}
														</span>
														{position === 1 ? (
															<Trophy className="size-3.5 text-amber-500" />
														) : null}
														<span
															className={`size-2 rounded-full ${tone.dot}`}
														/>
													</div>
												) : (
													<span className="text-xs text-[var(--muted)]">—</span>
												)}
											</td>
											<td className="px-3 py-3">
												{sov && sov.totalRuns > 0 ? (
													<div>
														<div className="text-sm font-semibold text-[var(--foreground)]">
															{sov.sov.toFixed(1)}%
														</div>
														<div className="text-[10px] text-[var(--muted)]">
															{sov.competitorMentions} {isEn ? "comp" : "comp"}
														</div>
													</div>
												) : (
													<span className="text-xs text-[var(--muted)]">—</span>
												)}
											</td>
											<td className="px-3 py-3">
												<span
													className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-semibold ${sentTone.bg}`}
												>
													{isEn ? sentTone.label.en : sentTone.label.es}
												</span>
											</td>
											<td className="px-3 py-3">
												<div className="flex flex-wrap gap-1">
													{prompt.tags.slice(0, 3).map((tag) => (
														<button
															className={`rounded-md px-1.5 py-0.5 text-[10px] font-medium transition ${
																tagFilter.includes(tag)
																	? "bg-[var(--brand)] text-[#1b1000]"
																	: "bg-[var(--surface-subtle)] text-[var(--muted)] hover:border hover:border-[var(--brand)]"
															}`}
															key={tag}
															onClick={() => toggleTag(tag)}
															type="button"
														>
															{tag}
														</button>
													))}
													{prompt.tags.length === 0 ? (
														<span className="text-[10px] text-[var(--muted)]">
															+ {isEn ? "tag" : "tag"}
														</span>
													) : prompt.tags.length > 3 ? (
														<span className="text-[10px] text-[var(--muted)]">
															+{prompt.tags.length - 3}
														</span>
													) : null}
												</div>
											</td>
											<td className="px-3 py-3 text-base">{flag}</td>
											<td className="px-3 py-3">
												<form action={toggleStatusAction.bind(null, prompt.id)}>
													<input
														name="status"
														type="hidden"
														value={prompt.status}
													/>
													<button
														className={`inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[11px] font-semibold transition ${
															prompt.status === "active"
																? "border-emerald-400/30 bg-emerald-400/15 text-emerald-200 hover:brightness-110"
																: "border-slate-400/30 bg-slate-400/15 text-slate-400 hover:brightness-110"
														}`}
														type="submit"
													>
														<span
															className={`size-1.5 rounded-full ${prompt.status === "active" ? "bg-emerald-400" : "bg-slate-400"}`}
														/>
														{prompt.status === "active"
															? isEn
																? "Active"
																: "Activo"
															: isEn
																? "Paused"
																: "Pausado"}
													</button>
												</form>
											</td>
											<td className="px-3 py-3">
												<div className="flex items-center gap-1.5">
													<span className={`size-2 rounded-full ${tone.dot}`} />
													<span
														className={`text-sm font-semibold ${tone.text}`}
													>
														{visibility.toFixed(0)}%
													</span>
												</div>
											</td>
											<td className="px-3 py-3 text-right">
												<div className="flex items-center justify-end gap-1">
													<button
														aria-label={isEn ? "Edit" : "Editar"}
														className="rounded p-1.5 text-[var(--muted)] hover:bg-[var(--surface-subtle)] hover:text-[var(--brand)]"
														onClick={() => setShowAddDialog(true)}
														title={
															isEn
																? "Edit (coming soon)"
																: "Editar (próximamente)"
														}
														type="button"
													>
														<Pencil className="size-3.5" />
													</button>
													<DeletePromptButton
														deleteAction={deleteAction.bind(null, prompt.id)}
														isEn={isEn}
													/>
												</div>
											</td>
										</tr>

										{isExpanded ? (
											<tr className="border-b border-[var(--border)] bg-[var(--surface-subtle)]">
												<td className="px-3 py-3" />
												<td className="px-3 py-3" colSpan={9}>
													<div className="grid gap-3 sm:grid-cols-[1fr_1fr_auto]">
														<div>
															<p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--muted)]">
																{isEn
																	? "Competitors detected"
																	: "Competidores detectados"}
															</p>
															<div className="mt-1 flex flex-wrap gap-1.5">
																{(ranking?.competitors_mentioned ?? [])
																	.length === 0 ? (
																	<span className="text-xs text-[var(--muted)]">
																		—
																	</span>
																) : (
																	(ranking?.competitors_mentioned ?? []).map(
																		(c) => (
																			<span
																				className="rounded-md border border-[var(--border)] bg-[var(--surface)] px-2 py-0.5 text-[11px] text-[var(--foreground)]"
																				key={c}
																			>
																				{c}
																			</span>
																		),
																	)
																)}
															</div>
														</div>
														<div>
															<p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--muted)]">
																Sources
															</p>
															<div className="mt-1 flex flex-wrap gap-1.5">
																{sources.length === 0 ? (
																	<span className="text-xs text-[var(--muted)]">
																		—
																	</span>
																) : (
																	sources.slice(0, 6).map((s) => (
																		<span
																			className="rounded-md border border-[var(--border)] bg-[var(--surface)] px-2 py-0.5 text-[11px] text-[var(--brand)]"
																			key={s}
																		>
																			{s}
																		</span>
																	))
																)}
															</div>
														</div>
														<div className="text-right text-xs text-[var(--muted)]">
															<span className="block text-[10px] uppercase tracking-wider">
																{isEn ? "Analyzed" : "Analizado"}
															</span>
															<span className="text-[var(--foreground)]">
																{formatDate(ranking?.latest_run_at, locale)}
															</span>
														</div>
													</div>
												</td>
											</tr>
										) : null}
									</RowFragment>
								);
							})}
						</tbody>
					</table>
				</div>
			)}

			<AddPromptDialog
				createAction={addPromptAction}
				locale={locale}
				onClose={() => setShowAddDialog(false)}
				open={showAddDialog}
			/>
		</section>
	);
}

function SortTh({
	label,
	active,
	dir,
	onClick,
}: {
	label: string;
	active: boolean;
	dir: "asc" | "desc";
	onClick: () => void;
}) {
	return (
		<th className="px-3 py-2">
			<button
				className="inline-flex items-center gap-1 hover:text-[var(--foreground)]"
				onClick={onClick}
				type="button"
			>
				{label}
				{active ? (
					dir === "asc" ? (
						<ChevronDown className="size-3 text-[var(--brand)]" />
					) : (
						<ChevronUp className="size-3 text-[var(--brand)]" />
					)
				) : (
					<ChevronDown className="size-3 opacity-30" />
				)}
			</button>
		</th>
	);
}

function RowFragment({ children }: { children: React.ReactNode }) {
	return <>{children}</>;
}

function LegendDot({ color, label }: { color: string; label: string }) {
	return (
		<span className="inline-flex items-center gap-1.5">
			<span className={`size-2 rounded-full ${color}`} />
			{label}
		</span>
	);
}

function DeletePromptButton({
	deleteAction,
	isEn,
}: {
	deleteAction: (formData: FormData) => Promise<void>;
	isEn: boolean;
}) {
	return (
		<form
			action={deleteAction}
			onSubmit={(e) => {
				if (
					!window.confirm(
						isEn
							? "Delete this prompt? Its history will remain."
							: "¿Borrar este prompt? Su historial se conservará.",
					)
				) {
					e.preventDefault();
				}
			}}
		>
			<button
				aria-label={isEn ? "Delete" : "Borrar"}
				className="rounded p-1.5 text-[var(--muted)] hover:bg-red-500/10 hover:text-red-300"
				title={isEn ? "Delete" : "Borrar"}
				type="submit"
			>
				<Trash2 className="size-3.5" />
			</button>
		</form>
	);
}
