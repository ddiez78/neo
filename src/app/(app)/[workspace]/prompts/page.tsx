import {
	Beaker,
	Cpu,
	Layers3,
	Play,
	Plus,
	ReceiptText,
	Search,
	Target,
} from "lucide-react";
import type { ComponentType, ReactNode } from "react";
import {
	acceptPromptCandidateAction,
	acceptPromptCandidatesBulkAction,
	createPromptAction,
	deletePromptAction,
	generatePromptCandidatesAction,
	importPromptCandidatesAction,
	rejectPromptCandidateAction,
	runPromptAcrossEnabledLlmsAction,
	togglePromptStatusAction,
} from "@/actions/prompts";
import { AddManualPromptPanel } from "@/components/prompts/AddManualPromptPanel";
import { CandidateReviewPanel } from "@/components/prompts/CandidateReviewPanel";
import { PromptsTable } from "@/components/prompts/PromptsTable";
import { getWorkspaceOverview, requireWorkspace } from "@/lib/data/workspace";
import { getUserPreferences } from "@/lib/preferences-server";
import { intentFromPrompt } from "@/lib/prompts/intent";
import type { Prompt, PromptRanking, PromptRun } from "@/types";

const INTENT_OPTIONS = [
	{ value: "awareness", label: "Awareness" },
	{ value: "recommendation", label: "Recomendacion" },
	{ value: "comparison", label: "Comparacion" },
	{ value: "alternatives", label: "Alternativas" },
	{ value: "pricing", label: "Precio" },
	{ value: "risk", label: "Riesgos" },
	{ value: "local", label: "Local / mercado" },
	{ value: "branded", label: "Branded" },
];

function providerLabel(provider: string) {
	const labels: Record<string, string> = {
		chatgpt: "ChatGPT",
		claude: "Claude",
		gemini: "Gemini",
		perplexity: "Perplexity",
		deepseek: "DeepSeek",
	};
	return labels[provider] ?? provider;
}

function average(values: number[]) {
	if (!values.length) return 0;
	return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function promptVisibility(ranking?: PromptRanking | null) {
	return Number(ranking?.visibility_score ?? 0);
}

function promptStatus(
	prompt: Prompt,
	ranking?: PromptRanking | null,
): "defend" | "recover" | "expand" | "monitor" {
	const visibility = promptVisibility(ranking);
	if (ranking?.brand_mentioned && visibility >= 60) return "defend";
	if (!ranking?.brand_mentioned && ranking?.competitors_mentioned?.length) {
		return "recover";
	}
	if (visibility < 40 && prompt.status === "active") return "expand";
	return "monitor";
}

function statusLabel(status: ReturnType<typeof promptStatus>) {
	const labels = {
		defend: "Defender",
		recover: "Recuperar",
		expand: "Expandir",
		monitor: "Monitorizar",
	};
	return labels[status];
}

function statusClass(status: ReturnType<typeof promptStatus>) {
	const classes = {
		defend: "border-emerald-400/30 bg-emerald-400/10 text-emerald-200",
		recover: "border-red-400/30 bg-red-400/10 text-red-200",
		expand: "border-amber-400/30 bg-amber-400/10 text-amber-200",
		monitor: "border-sky-400/30 bg-sky-400/10 text-sky-200",
	};
	return classes[status];
}

function formatPercent(value: number) {
	return `${value.toFixed(0)}%`;
}

function smeRelativeDate(dateStr: string): string {
	const date = new Date(dateStr);
	const diffDays = Math.floor(
		(Date.now() - date.getTime()) / (1000 * 60 * 60 * 24),
	);
	if (diffDays === 0) return "Hoy";
	if (diffDays < 7) return `Hace ${diffDays} días`;
	return date.toLocaleDateString("es-ES", { day: "numeric", month: "short" });
}

function normalizeSearch(value: string) {
	return value
		.normalize("NFD")
		.replace(/[\u0300-\u036f]/g, "")
		.toLowerCase();
}

function promptRiskLabel(ranking?: PromptRanking | null) {
	if (!ranking?.brand_mentioned && ranking?.competitors_mentioned?.length) {
		return `Competidor dominante: ${ranking.competitors_mentioned[0]}`;
	}
	if (!ranking?.brand_mentioned) return "Marca ausente en las respuestas";
	if ((ranking.source_count ?? 0) === 0)
		return "Sin fuentes citadas suficientes";
	if (ranking.sentiment === "negative") return "Sentimiento negativo detectado";
	return "Sin riesgo urgente";
}

export default async function Page({
	params,
	searchParams,
}: {
	params: Promise<{ workspace: string }>;
	searchParams: Promise<{
		error?: string;
		saved?: string;
		ran?: string;
		generated?: string;
		accepted?: string;
		rejected?: string;
		imported?: string;
		bulkAccepted?: string;
		promptFilter?: string;
		q?: string;
	}>;
}) {
	const { workspace: slug } = await params;
	const status = await searchParams;
	const workspace = await requireWorkspace(slug);
	const prefs = await getUserPreferences();
	const isSme = prefs.mode === "sme";
	const isPro = prefs.mode === "pro";
	const {
		company,
		competitors,
		prompts,
		llmConfigs,
		rankings,
		runs,
		sources,
		promptGenerationBatches,
		promptCandidates,
	} = await getWorkspaceOverview(workspace.id);
	const createAction = createPromptAction.bind(
		null,
		workspace.id,
		workspace.slug,
	);
	const generateAction = generatePromptCandidatesAction.bind(
		null,
		workspace.id,
		workspace.slug,
	);
	const importAction = importPromptCandidatesAction.bind(
		null,
		workspace.id,
		workspace.slug,
	);
	const bulkAcceptAction = acceptPromptCandidatesBulkAction.bind(
		null,
		workspace.id,
		workspace.slug,
	);
	const activeConfigs = llmConfigs.filter((config) => config.enabled);
	const usageShare = activeConfigs.length ? 100 / activeConfigs.length : 0;
	const activePrompts = prompts.filter((prompt) => prompt.status === "active");
	const rankingsByPrompt = new Map(
		rankings.map((item) => [item.prompt_id, item]),
	);
	const runsByPrompt = new Map<string, PromptRun[]>();
	for (const run of runs) {
		if (!run.prompt_id) continue;
		runsByPrompt.set(run.prompt_id, [
			...(runsByPrompt.get(run.prompt_id) ?? []),
			run,
		]);
	}
	const promptIdByRunId = new Map<string, string>();
	for (const run of runs) {
		if (run.prompt_id) promptIdByRunId.set(run.id, run.prompt_id);
	}
	const sourcesByPromptId = new Map<string, string[]>();
	for (const src of sources) {
		const promptId = promptIdByRunId.get(src.prompt_run_id);
		if (!promptId) continue;
		const list = sourcesByPromptId.get(promptId) ?? [];
		if (!list.includes(src.domain)) list.push(src.domain);
		sourcesByPromptId.set(promptId, list);
	}
	const visiblePrompts = prompts.filter(
		(prompt) => rankingsByPrompt.get(prompt.id)?.brand_mentioned,
	).length;
	const competitorWinningPrompts = prompts.filter((prompt) => {
		const ranking = rankingsByPrompt.get(prompt.id);
		return (
			!ranking?.brand_mentioned &&
			Boolean(ranking?.competitors_mentioned?.length)
		);
	}).length;
	const avgPosition = average(
		rankings
			.map((ranking) => ranking.brand_position)
			.filter((value): value is number => typeof value === "number"),
	);
	const sourceGapPrompts = prompts.filter((prompt) => {
		const ranking = rankingsByPrompt.get(prompt.id);
		return ranking?.source_count && !ranking.brand_mentioned;
	}).length;
	const latestBatch = promptGenerationBatches[0];
	const latestCandidates = latestBatch
		? promptCandidates.filter(
				(candidate) => candidate.batch_id === latestBatch.id,
			)
		: promptCandidates;
	const coverageRows = INTENT_OPTIONS.map((intent) => {
		const current = prompts.filter(
			(prompt) => intentFromPrompt(prompt).toLowerCase() === intent.value,
		).length;
		const incoming = latestCandidates.filter(
			(candidate) =>
				candidate.intent.toLowerCase().includes(intent.value) ||
				candidate.category.toLowerCase().includes(intent.value),
		).length;
		const target = ["comparison", "alternatives", "pricing", "risk"].includes(
			intent.value,
		)
			? 4
			: 3;
		return { ...intent, current, incoming, target };
	});
	const competitorList = competitors
		.map((competitor) => competitor.name)
		.join(", ");
	const countryCode =
		"country_code" in workspace ? String(workspace.country_code) : "ES";
	const promptFilter = status.promptFilter ?? "all";
	const promptQuery = status.q ?? "";
	const libraryPrompts = prompts.filter((prompt) => prompt.status === "active");
	const filteredPrompts = libraryPrompts.filter((prompt) => {
		const ranking = rankingsByPrompt.get(prompt.id);
		const rowStatus = promptStatus(prompt, ranking);
		if (promptFilter !== "all" && rowStatus !== promptFilter) return false;
		if (!promptQuery.trim()) return true;
		const haystack = normalizeSearch(
			[
				prompt.title,
				prompt.body,
				...prompt.tags,
				intentFromPrompt(prompt),
				...(ranking?.competitors_mentioned ?? []),
			].join(" "),
		);
		return haystack.includes(normalizeSearch(promptQuery));
	});

	if (isSme) {
		const smePrompts = filteredPrompts;
		const brandMentionRate = prompts.length
			? Math.round((visiblePrompts / prompts.length) * 100)
			: 0;
		const coverageScore = coverageRows.length
			? Math.round(
					(coverageRows.filter((r) => r.current >= r.target).length /
						coverageRows.length) *
						100,
				)
			: 0;
		const competitorWinRate = prompts.length
			? Math.round((competitorWinningPrompts / prompts.length) * 100)
			: 0;
		const sourceGapRate = prompts.length
			? Math.round((sourceGapPrompts / prompts.length) * 100)
			: 0;
		return (
			<main className="flex-1 overflow-auto p-4 pb-24 lg:p-6 lg:pb-8">
				<div className="mx-auto grid max-w-3xl gap-6">
					<div>
						<p className="text-xs font-black uppercase tracking-[0.2em] text-[var(--brand)]">
							citame.ai
						</p>
						<h1 className="mt-2 text-3xl font-black tracking-[-0.03em] text-[var(--foreground)]">
							Prompts
						</h1>
						<p className="mt-2 text-sm text-[var(--muted)]">
							Prompts reales que tus clientes hacen a ChatGPT, Gemini o Claude.
							Aqui puedes ver si apareces y que hacer para mejorar.
						</p>
					</div>

					<Message status={status} />

					<div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
						<div className="neo-card p-4">
							<p className="text-xs font-black uppercase tracking-[0.12em] text-[var(--muted)]">
								Coverage score
							</p>
							<p className="mt-2 text-4xl font-black text-[var(--foreground)]">
								{coverageScore}
								<span className="text-sm text-[var(--muted)]">%</span>
							</p>
							<p className="mt-1 text-xs text-[var(--muted)]">
								Intenciones cubiertas
							</p>
						</div>
						<div className="neo-card p-4">
							<p className="text-xs font-black uppercase tracking-[0.12em] text-[var(--muted)]">
								Brand mention rate
							</p>
							<p className="mt-2 text-4xl font-black text-[var(--brand)]">
								{brandMentionRate}
								<span className="text-sm text-[var(--muted)]">%</span>
							</p>
							<p className="mt-1 text-xs text-[var(--muted)]">
								Apareces en los LLMs
							</p>
						</div>
						<div className="neo-card p-4">
							<p className="text-xs font-black uppercase tracking-[0.12em] text-[var(--muted)]">
								Avg position
							</p>
							<p className="mt-2 text-4xl font-black text-[var(--foreground)]">
								{avgPosition ? `#${avgPosition.toFixed(1)}` : "—"}
							</p>
							<p className="mt-1 text-xs text-[var(--muted)]">
								Ranking medio de marca
							</p>
						</div>
						<div className="neo-card p-4">
							<p className="text-xs font-black uppercase tracking-[0.12em] text-[var(--muted)]">
								Competitor win rate
							</p>
							<p className="mt-2 text-4xl font-black text-red-400">
								{competitorWinRate}
								<span className="text-sm text-[var(--muted)]">%</span>
							</p>
							<p className="mt-1 text-xs text-[var(--muted)]">
								{competitorWinningPrompts} prompts con rival dominante
							</p>
						</div>
						<div className="neo-card p-4">
							<p className="text-xs font-black uppercase tracking-[0.12em] text-[var(--muted)]">
								Source gap rate
							</p>
							<p className="mt-2 text-4xl font-black text-amber-400">
								{sourceGapRate}
								<span className="text-sm text-[var(--muted)]">%</span>
							</p>
							<p className="mt-1 text-xs text-[var(--muted)]">
								Fuentes sin presencia de marca
							</p>
						</div>
						<div className="neo-card p-4">
							<p className="text-xs font-black uppercase tracking-[0.12em] text-[var(--muted)]">
								LLM usage split
							</p>
							<p className="mt-2 text-4xl font-black text-[var(--foreground)]">
								{activeConfigs.length ? `${usageShare.toFixed(0)}%` : "0%"}
							</p>
							<p className="mt-1 text-xs text-[var(--muted)]">
								{activeConfigs.length} LLM
								{activeConfigs.length !== 1 ? "s" : ""} activo
								{activeConfigs.length !== 1 ? "s" : ""}
							</p>
						</div>
					</div>

					{/* Interactive coverage + intent selector */}
					<section className="neo-card overflow-hidden">
						<div className="border-b border-[var(--border)] px-5 py-4">
							<div className="flex items-center gap-2">
								<Layers3 className="size-4 text-[var(--brand)]" />
								<h2 className="font-semibold text-[var(--foreground)]">
									Cobertura de PROMPTs
								</h2>
							</div>
							<p className="mt-1 text-xs text-[var(--muted)]">
								Selecciona los tipos de PROMPTs que quieres cubrir. Los marcados
								con Gap necesitan más prompts.
							</p>
						</div>
						<form action={generateAction} className="p-5">
							<input
								name="brandName"
								type="hidden"
								value={company?.brand_name ?? workspace.name}
							/>
							<input
								name="website"
								type="hidden"
								value={company?.website ?? ""}
							/>
							<input
								name="description"
								type="hidden"
								value={company?.description ?? ""}
							/>
							<input
								name="market"
								type="hidden"
								value={company?.markets?.[0] ?? ""}
							/>
							<input
								name="services"
								type="hidden"
								value={company?.products?.join(", ") ?? ""}
							/>
							<input name="competitors" type="hidden" value={competitorList} />
							<input name="promptCount" type="hidden" value="15" />
							<input name="language" type="hidden" value="es" />
							<input name="country" type="hidden" value={countryCode || "ES"} />
							<input name="returnTo" type="hidden" value="prompts" />
							<div className="grid gap-3 sm:grid-cols-2">
								{coverageRows.map((row) => {
									const score = Math.min(100, (row.current / row.target) * 100);
									const isGap = row.current < row.target;
									return (
										<label
											className={`flex cursor-pointer gap-3 rounded-xl border p-3 transition hover:border-[var(--brand)] ${
												isGap
													? "border-[rgba(244,149,39,0.4)] bg-[rgba(244,149,39,0.04)]"
													: "border-[var(--border)] bg-[var(--surface-subtle)]"
											}`}
											key={row.value}
										>
											<input
												className="mt-0.5 shrink-0"
												defaultChecked={isGap}
												name="intents"
												type="checkbox"
												value={row.value}
											/>
											<div className="min-w-0 flex-1">
												<div className="flex items-center justify-between gap-2">
													<span className="text-sm font-semibold text-[var(--foreground)]">
														{row.label}
													</span>
													<span
														className={`rounded-full px-2 py-0.5 text-[10px] font-black uppercase tracking-[0.08em] ${
															row.current >= row.target
																? "bg-emerald-400/10 text-emerald-300"
																: "bg-amber-400/10 text-amber-300"
														}`}
													>
														{row.current >= row.target
															? "OK"
															: `Gap ${row.current}/${row.target}`}
													</span>
												</div>
												<div className="mt-2 h-1.5 overflow-hidden rounded-full bg-[rgba(231,233,238,0.08)]">
													<div
														className="h-full rounded-full bg-[var(--brand)]"
														style={{ width: `${score}%` }}
													/>
												</div>
											</div>
										</label>
									);
								})}
							</div>
							<button
								className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[var(--brand)] px-4 py-3 text-sm font-black text-[#1b1000] transition hover:brightness-110"
								type="submit"
							>
								<Beaker className="size-4" />
								Generar PROMPTs para los seleccionados
							</button>
						</form>
					</section>

					<AddManualPromptPanel action={createAction} />

					<section className="neo-card overflow-hidden">
						<div className="border-b border-[var(--border)] px-5 py-4">
							<h2 className="font-semibold text-[var(--foreground)]">
								Tus PROMPTs activos
							</h2>
							<p className="text-sm text-[var(--muted)]">
								{smePrompts.length} PROMPTs monitorizados.
							</p>
						</div>
						<div className="grid gap-4 p-5">
							{smePrompts.length === 0 ? (
								<EmptyState text="Aún no tienes PROMPTs activos. Genera algunos arriba o crea uno manualmente." />
							) : null}
							{smePrompts.map((prompt) => {
								const ranking = rankingsByPrompt.get(prompt.id);
								const promptRuns = runsByPrompt.get(prompt.id) ?? [];
								const hasRuns = promptRuns.length > 0;
								const rowStatus = promptStatus(prompt, ranking);
								const runAction = runPromptAcrossEnabledLlmsAction.bind(
									null,
									workspace.id,
									workspace.slug,
									prompt.id,
								);
								const smeStatusLabel = {
									defend: "Bien posicionado",
									recover: "Recuperar",
									expand: "Mejorar",
									monitor: "Vigilar",
								}[rowStatus];
								const smeStatusColor = {
									defend: "border-emerald-200 bg-emerald-50 text-emerald-700",
									recover: "border-red-200 bg-red-50 text-red-700",
									expand: "border-amber-200 bg-amber-50 text-amber-700",
									monitor: "border-sky-200 bg-sky-50 text-sky-700",
								}[rowStatus];
								const latestRun = promptRuns.sort(
									(a, b) =>
										new Date(b.created_at).getTime() -
										new Date(a.created_at).getTime(),
								)[0];
								return (
									<article
										className="grid gap-3 rounded-xl border border-[var(--border)] bg-[var(--surface-subtle)] p-4"
										key={prompt.id}
									>
										<div className="flex flex-wrap gap-2">
											<span
												className={`rounded-full border px-2.5 py-0.5 text-xs font-semibold ${ranking?.brand_mentioned ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-red-200 bg-red-50 text-red-700"}`}
											>
												{ranking?.brand_mentioned
													? "✓ Apareces"
													: "✗ No apareces"}
											</span>
											{ranking?.competitors_mentioned?.[0] ? (
												<span className="rounded-full border border-[var(--border)] px-2.5 py-0.5 text-xs text-[var(--muted)]">
													Gana: {ranking.competitors_mentioned[0]}
												</span>
											) : null}
											<span
												className={`rounded-full border px-2.5 py-0.5 text-xs font-semibold ${smeStatusColor}`}
											>
												{smeStatusLabel}
											</span>
											{!hasRuns ? (
												<span className="rounded-full border border-amber-300/50 bg-amber-400/10 px-2.5 py-0.5 text-xs font-semibold text-amber-300">
													Sin ejecutar
												</span>
											) : null}
										</div>
										<p className="text-sm font-semibold text-[var(--foreground)]">
											{prompt.body}
										</p>
										<div className="grid grid-cols-3 gap-2">
											<div className="rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2">
												<p className="text-[10px] font-black uppercase tracking-[0.12em] text-[var(--muted)]">
													Visibilidad
												</p>
												<p className="mt-1 text-sm font-black text-[var(--foreground)]">
													{formatPercent(
														Number(ranking?.visibility_score ?? 0),
													)}
												</p>
											</div>
											<div className="rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2">
												<p className="text-[10px] font-black uppercase tracking-[0.12em] text-[var(--muted)]">
													Posicion
												</p>
												<p className="mt-1 text-sm font-black text-[var(--foreground)]">
													{ranking?.brand_position
														? `#${ranking.brand_position}`
														: "—"}
												</p>
											</div>
											<div className="rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2">
												<p className="text-[10px] font-black uppercase tracking-[0.12em] text-[var(--muted)]">
													Fuentes
												</p>
												<p className="mt-1 text-sm font-black text-[var(--foreground)]">
													{ranking?.source_count ?? 0}
												</p>
											</div>
										</div>
										<div className="flex items-center justify-between gap-3">
											<p className="text-xs text-[var(--muted)]">
												{latestRun
													? `Último run: ${smeRelativeDate(latestRun.created_at)}`
													: "Nunca ejecutado"}
											</p>
											<form action={runAction}>
												<input name="body" type="hidden" value={prompt.body} />
												<button
													className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition disabled:opacity-40 ${
														!hasRuns
															? "bg-[var(--brand)] text-[#1b1000] hover:brightness-110"
															: "border border-[var(--border)] bg-[var(--surface-raised)] text-[var(--foreground)] hover:border-[var(--brand)]"
													}`}
													disabled={activeConfigs.length === 0}
													type="submit"
												>
													<Play className="size-3.5" />
													Ejecutar
												</button>
											</form>
										</div>
									</article>
								);
							})}
						</div>
					</section>
				</div>
			</main>
		);
	}

	return (
		<main className="flex-1 overflow-auto p-4 pb-24 lg:p-6 lg:pb-8">
			<div className="mx-auto grid max-w-[1440px] gap-6">
				<section className="flex flex-col justify-between gap-4 xl:flex-row xl:items-end">
					<div>
						<p className="text-xs font-black uppercase tracking-[0.2em] text-[var(--brand)]">
							Prompt Operations
						</p>
						<h1 className="mt-2 text-3xl font-black tracking-[-0.03em] text-[var(--foreground)] md:text-4xl">
							{isPro ? "Prompts y Cobertura" : "GEO Prompt Command Center"}
						</h1>
						<p className="mt-2 max-w-3xl text-sm leading-6 text-[var(--muted)]">
							Monitoriza PROMPTs reales que tus clientes harían a ChatGPT,
							Gemini, Claude o Perplexity antes de elegir una marca. Cada prompt
							activo se ejecuta contra todos los LLMs habilitados con reparto
							igualitario.
						</p>
					</div>
					<div className="flex flex-wrap gap-2">
						<a
							className="inline-flex items-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--surface-subtle)] px-3 py-2 text-xs font-black uppercase tracking-[0.04em] text-[var(--foreground)] transition hover:border-[var(--brand)]"
							href="#prompt-generator"
						>
							<Beaker className="size-4 text-[var(--brand)]" />
							Generar candidatos
						</a>
						<a
							className="inline-flex items-center gap-2 rounded-lg bg-[var(--brand)] px-3 py-2 text-xs font-black uppercase tracking-[0.04em] text-[#1b1000] transition hover:brightness-110"
							href="#prompt-library"
						>
							<Search className="size-4" />
							Ver biblioteca
						</a>
					</div>
				</section>

				<Message status={status} />

				<section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
					<Stat
						label="Prompts activos"
						value={activePrompts.length}
						helper="Prompts monitorizados"
						icon={ReceiptText}
					/>
					<Stat
						label="Coverage score"
						value={Math.round(
							(coverageRows.filter((row) => row.current >= row.target).length /
								coverageRows.length) *
								100,
						)}
						helper="Intenciones cubiertas"
						icon={Layers3}
						suffix="%"
					/>
					<Stat
						label="Brand mention rate"
						value={
							prompts.length
								? Math.round((visiblePrompts / prompts.length) * 100)
								: 0
						}
						helper="Prompts donde aparece la marca"
						icon={Target}
						suffix="%"
					/>
					<Stat
						label="Avg position"
						value={Number(avgPosition ? avgPosition.toFixed(1) : 0)}
						helper="Ranking medio de marca"
						icon={Cpu}
						prefix="#"
					/>
				</section>

				<section className="grid gap-4 lg:grid-cols-3">
					<InsightCard
						label="Competitor win rate"
						value={`${prompts.length ? Math.round((competitorWinningPrompts / prompts.length) * 100) : 0}%`}
						tone="risk"
						text={`${competitorWinningPrompts} prompts tienen competidores visibles sin presencia clara de marca.`}
					/>
					<InsightCard
						label="Source gap rate"
						value={`${prompts.length ? Math.round((sourceGapPrompts / prompts.length) * 100) : 0}%`}
						tone="watch"
						text="Detecta PROMPTs donde hay fuentes/citas, pero aún no se convierten en presencia de marca."
					/>
					<InsightCard
						label="LLM usage split"
						value={activeConfigs.length ? `${usageShare.toFixed(0)}%` : "0%"}
						tone="healthy"
						text="El porcentaje no se configura por prompt: se reparte automaticamente entre LLMs activos."
					/>
				</section>

				<section className="neo-card p-5">
					<div className="flex flex-wrap items-start justify-between gap-4">
						<div>
							<h2 className="text-lg font-black text-[var(--foreground)]">
								LLMs activos y reparto
							</h2>
							<p className="mt-1 text-sm text-[var(--muted)]">
								Si hay 4 LLMs activos, cada prompt genera 4 runs y cada modelo
								representa el 25% del uso.
							</p>
						</div>
						<span className="rounded-lg border border-[var(--border)] bg-[var(--surface-subtle)] px-3 py-1 text-xs font-black uppercase tracking-[0.08em] text-[var(--brand)]">
							{activeConfigs.length
								? `${usageShare.toFixed(0)}% por LLM`
								: "Sin LLMs activos"}
						</span>
					</div>
					<div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-5">
						{activeConfigs.map((config) => (
							<div
								className="rounded-lg border border-[var(--border)] bg-[rgba(7,19,38,0.55)] p-3"
								key={`${config.provider}-${config.model}`}
							>
								<p className="text-sm font-bold text-[var(--foreground)]">
									{providerLabel(config.provider)}
								</p>
								<p className="mt-1 truncate text-xs text-[var(--muted)]">
									{config.model}
								</p>
								<div className="mt-3 h-2 overflow-hidden rounded-full bg-[var(--background)]">
									<div
										className="h-full rounded-full bg-[var(--brand)]"
										style={{ width: `${usageShare}%` }}
									/>
								</div>
								<p className="mt-2 text-2xl font-black text-[var(--brand)]">
									{usageShare.toFixed(0)}%
								</p>
							</div>
						))}
						{activeConfigs.length === 0 ? (
							<p className="rounded-lg border border-dashed border-[var(--border)] p-4 text-sm text-[var(--muted)] md:col-span-2 xl:col-span-5">
								Activa al menos un proveedor en Ajustes para ejecutar prompts.
							</p>
						) : null}
					</div>
				</section>

				<section className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_420px]">
					<PromptGenerator
						company={{
							brandName: company?.brand_name ?? workspace.name,
							website: company?.website ?? "",
							description: company?.description ?? "",
							countryCode,
							market: company?.markets?.[0] ?? "",
							segment: company?.markets?.join(", ") ?? "",
							services: company?.products?.join(", ") ?? "",
							audience: company?.tone ?? "",
							differentiators: company?.keywords?.join(", ") ?? "",
							competitors: competitorList,
						}}
						generateAction={generateAction}
					/>
					<CoveragePanel rows={coverageRows} />
				</section>

				<PromptImportPanel importAction={importAction} />

				<CandidateReviewPanel
					bulkAcceptAction={bulkAcceptAction}
					candidatesWithActions={latestCandidates.map((c) => ({
						candidate: c,
						acceptAction: acceptPromptCandidateAction.bind(
							null,
							workspace.id,
							workspace.slug,
							c.id,
						),
						rejectAction: rejectPromptCandidateAction.bind(
							null,
							workspace.slug,
							c.id,
						),
					}))}
				/>

				<PromptsTable
					addPromptAction={createAction}
					deleteAction={deletePromptAction.bind(null, workspace.slug)}
					locale={prefs.locale}
					prompts={prompts}
					rankings={rankings}
					runs={runs}
					sourcesByPromptId={sourcesByPromptId}
					toggleStatusAction={togglePromptStatusAction.bind(
						null,
						workspace.slug,
					)}
					workspaceCountryCode={countryCode}
				/>
			</div>
		</main>
	);
}

function PromptGenerator({
	company,
	generateAction,
}: {
	company: {
		brandName: string;
		website: string;
		description: string;
		countryCode: string;
		market: string;
		segment: string;
		services: string;
		audience: string;
		differentiators: string;
		competitors: string;
	};
	generateAction: (formData: FormData) => Promise<void>;
}) {
	return (
		<form
			action={generateAction}
			className="neo-card grid gap-5 p-5"
			id="prompt-generator"
		>
			<input name="returnTo" type="hidden" value="prompts" />
			<div>
				<div className="flex items-center gap-2">
					<Beaker className="size-5 text-[var(--brand)]" />
					<h2 className="text-lg font-black text-[var(--foreground)]">
						GEO Research Studio
					</h2>
				</div>
				<p className="mt-2 text-sm leading-6 text-[var(--muted)]">
					Contexto pre-rellenado desde Company Bio y Competidores. Puedes editar
					cualquier campo antes de generar candidatos.
				</p>
			</div>

			<div className="rounded-xl border border-[rgba(88,110,255,0.28)] bg-[rgba(88,110,255,0.08)] p-3 text-sm text-[#bfc7ff]">
				Contexto pre-rellenado. Ajusta mercado, servicios, audiencia o
				diferenciales si quieres prompts mas precisos.
			</div>

			<div className="grid gap-4 lg:grid-cols-2">
				<Field label="Nombre de la marca">
					<input defaultValue={company.brandName} name="brandName" required />
				</Field>
				<Field label="Dominio web">
					<input defaultValue={company.website} name="website" />
				</Field>
			</div>
			<Field label="Descripcion de la marca">
				<textarea
					defaultValue={company.description}
					name="description"
					rows={3}
				/>
			</Field>
			<div className="grid gap-4 lg:grid-cols-2">
				<Field label="Pais">
					<select defaultValue={company.countryCode || "ES"} name="country">
						<option value="ES">ES</option>
						<option value="US">US</option>
						<option value="MX">MX</option>
						<option value="GB">GB</option>
						<option value="FR">FR</option>
					</select>
				</Field>
				<Field label="Ciudad o mercado principal">
					<input
						defaultValue={company.market}
						name="market"
						placeholder="Madrid"
					/>
				</Field>
			</div>
			<Field label="Segmento / posicionamiento">
				<input
					defaultValue={company.segment}
					name="segment"
					placeholder="SaaS B2B, e-commerce, clinica local, aerolinea..."
				/>
			</Field>
			<Field label="Servicios principales">
				<textarea
					defaultValue={company.services}
					name="services"
					placeholder="ej. auditoria SEO, automatizacion, vuelos baratos..."
					rows={2}
				/>
			</Field>
			<Field label="Audiencia objetivo">
				<input
					defaultValue={company.audience}
					name="audience"
					placeholder="Pymes, directores de marketing, viajeros de negocio..."
				/>
			</Field>
			<Field label="Diferenciadores">
				<textarea
					defaultValue={company.differentiators}
					name="differentiators"
					placeholder="ej. soporte rapido, mejor precio, datos propios, cobertura local..."
					rows={2}
				/>
			</Field>
			<Field label="Competidores">
				<input defaultValue={company.competitors} name="competitors" />
			</Field>

			<div className="grid gap-4 lg:grid-cols-[1fr_180px_180px]">
				<Field label="Numero de prompts">
					<input
						defaultValue="30"
						max="60"
						min="6"
						name="promptCount"
						type="number"
					/>
				</Field>
				<Field label="Idioma">
					<select defaultValue="es" name="language">
						<option value="es">Espanol</option>
						<option value="en">English</option>
					</select>
				</Field>
				<Field label="Especificidad">
					<select defaultValue="medium" name="specificity">
						<option value="low">Baja</option>
						<option value="medium">Media</option>
						<option value="high">Alta</option>
					</select>
				</Field>
			</div>

			<div>
				<p className="mb-2 text-sm font-bold text-[var(--muted)]">
					Intenciones a cubrir
				</p>
				<div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
					{INTENT_OPTIONS.map((intent) => (
						<label
							className="flex items-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--surface-subtle)] px-3 py-2 text-sm text-[var(--foreground)]"
							key={intent.value}
						>
							<input
								className="size-4"
								defaultChecked
								name="intents"
								type="checkbox"
								value={intent.value}
							/>
							{intent.label}
						</label>
					))}
				</div>
			</div>

			<button
				className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[var(--brand)] px-4 py-3 text-sm font-black text-[#1b1000] transition hover:brightness-110"
				type="submit"
			>
				<Beaker className="size-4" />
				Generar prompts candidatos
			</button>
		</form>
	);
}

function PromptImportPanel({
	importAction,
}: {
	importAction: (formData: FormData) => Promise<void>;
}) {
	return (
		<section className="neo-card grid gap-4 p-5">
			<div className="flex flex-wrap items-start justify-between gap-4">
				<div>
					<p className="text-xs font-black uppercase tracking-[0.18em] text-[var(--brand)]">
						Importar prompts
					</p>
					<h2 className="mt-1 text-lg font-black text-[var(--foreground)]">
						CSV/Excel a candidatos revisables
					</h2>
					<p className="mt-1 max-w-3xl text-sm leading-6 text-[var(--muted)]">
						Sube un archivo con PROMPTs existentes, keywords o PROMPTs de
						cliente. La app detecta columnas como title, prompt, intent,
						category, funnel_stage, priority y tags; si el archivo viene
						desordenado, intentara normalizarlo antes de crear candidatos
						pendientes.
					</p>
				</div>
				<span className="rounded-full border border-[var(--border)] bg-[var(--surface-subtle)] px-3 py-1 text-xs font-black uppercase tracking-[0.08em] text-[var(--muted)]">
					Revisar primero
				</span>
			</div>
			<form
				action={importAction}
				className="grid gap-3 rounded-xl border border-dashed border-[var(--border)] bg-[rgba(7,19,38,0.45)] p-4 sm:grid-cols-[minmax(0,1fr)_auto]"
			>
				<label className="grid gap-2 text-sm font-bold text-[var(--foreground)]">
					Archivo CSV, XLS o XLSX
					<input
						accept=".csv,.xlsx,.xls"
						className="cursor-pointer"
						name="file"
						required
						type="file"
					/>
				</label>
				<button
					className="self-end rounded-lg bg-[var(--brand)] px-4 py-2 text-sm font-black text-[#1b1000] transition hover:brightness-110"
					type="submit"
				>
					Importar como candidatos
				</button>
			</form>
			<div className="grid gap-3 text-xs text-[var(--muted)] md:grid-cols-3">
				<p>
					<strong className="text-[var(--foreground)]">
						Seguro por defecto:
					</strong>{" "}
					no activa nada sin que lo selecciones.
				</p>
				<p>
					<strong className="text-[var(--foreground)]">Limite v1:</strong> 200
					filas por importacion para evitar latencia y costes.
				</p>
				<p>
					<strong className="text-[var(--foreground)]">Etiquetas:</strong>{" "}
					decision, precio, comparacion, alternativas, riesgo, local, branded y
					awareness.
				</p>
			</div>
		</section>
	);
}

function CoveragePanel({
	rows,
}: {
	rows: Array<{
		value: string;
		label: string;
		current: number;
		incoming: number;
		target: number;
	}>;
}) {
	return (
		<section className="neo-card p-5">
			<div className="flex items-center gap-2">
				<Layers3 className="size-5 text-[var(--brand)]" />
				<h2 className="text-lg font-black text-[var(--foreground)]">
					Cobertura de prompts
				</h2>
			</div>
			<p className="mt-2 text-sm leading-6 text-[var(--muted)]">
				Comprueba si estás midiendo todos los PROMPTs clave del funnel antes de
				activar nuevos candidatos.
			</p>
			<div className="mt-5 grid gap-3">
				{rows.map((row) => {
					const total = row.current + row.incoming;
					const score = Math.min(100, (total / row.target) * 100);
					return (
						<div
							className="rounded-xl border border-[var(--border)] bg-[rgba(231,233,238,0.03)] p-3"
							key={row.value}
						>
							<div className="flex items-center justify-between gap-3">
								<div>
									<p className="font-bold text-[var(--foreground)]">
										{row.label}
									</p>
									<p className="text-xs text-[var(--muted)]">
										Actual {row.current} - Nuevos +{row.incoming} - Objetivo{" "}
										{row.target}
									</p>
								</div>
								<span
									className={`rounded-full px-2 py-1 text-[10px] font-black uppercase tracking-[0.08em] ${
										total >= row.target
											? "bg-emerald-400/10 text-emerald-200"
											: "bg-amber-400/10 text-amber-200"
									}`}
								>
									{total >= row.target ? "OK" : "Gap"}
								</span>
							</div>
							<div className="mt-3 h-2 overflow-hidden rounded-full bg-[rgba(231,233,238,0.08)]">
								<div
									className="h-full rounded-full bg-[var(--brand)]"
									style={{ width: `${score}%` }}
								/>
							</div>
						</div>
					);
				})}
			</div>
		</section>
	);
}

function _PromptLibrary({
	prompts,
	rankingsByPrompt,
	runsByPrompt,
	activeConfigs,
	workspaceId,
	workspaceSlug,
	totalPrompts,
	filter,
	query,
}: {
	prompts: Prompt[];
	rankingsByPrompt: Map<string, PromptRanking>;
	runsByPrompt: Map<string, PromptRun[]>;
	activeConfigs: Array<{ provider: string; model: string; enabled: boolean }>;
	workspaceId: string;
	workspaceSlug: string;
	totalPrompts: number;
	filter: string;
	query: string;
}) {
	const filters = [
		{ label: "Todos", value: "all" },
		{ label: "Recuperar", value: "recover" },
		{ label: "Expandir", value: "expand" },
		{ label: "Defender", value: "defend" },
		{ label: "Monitorizar", value: "monitor" },
	];
	return (
		<section className="neo-card overflow-hidden">
			<div className="border-b border-[var(--border)] px-5 py-4">
				<h2 className="text-lg font-black text-[var(--foreground)]">
					Prompts activos y monitorizacion
				</h2>
				<p className="text-sm text-[var(--muted)]">
					Estos son los prompts que ya se ejecutan contra todos los LLMs
					activos. Filtra por estado GEO para saber que recuperar, expandir,
					defender o simplemente monitorizar.
				</p>
			</div>
			<div className="grid gap-4 border-b border-[var(--border)] p-5">
				<form
					action={`/${workspaceSlug}/prompts#prompt-library`}
					className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_220px_auto]"
				>
					<label className="grid gap-2 text-sm font-bold text-[var(--foreground)]">
						Buscar por texto, intencion, competidor o tag
						<input
							defaultValue={query}
							name="q"
							placeholder="ej. precio, Iberia, alternativas..."
						/>
					</label>
					<label className="grid gap-2 text-sm font-bold text-[var(--foreground)]">
						Estado estrategico
						<select defaultValue={filter} name="promptFilter">
							{filters.map((item) => (
								<option key={item.value} value={item.value}>
									{item.label}
								</option>
							))}
						</select>
					</label>
					<button
						className="self-end rounded-lg border border-[var(--border)] bg-[var(--surface-subtle)] px-4 py-2 text-sm font-black text-[var(--foreground)] transition hover:border-[var(--brand)]"
						type="submit"
					>
						Aplicar filtros
					</button>
				</form>
				<div className="flex flex-wrap gap-2">
					{filters.map((item) => (
						<a
							className={`rounded-full border px-3 py-1 text-xs font-black uppercase tracking-[0.06em] transition ${
								filter === item.value
									? "border-[var(--brand)] bg-[var(--brand-soft)] text-[var(--brand)]"
									: "border-[var(--border)] text-[var(--muted)] hover:border-[var(--brand)] hover:text-[var(--foreground)]"
							}`}
							href={`/${workspaceSlug}/prompts?promptFilter=${item.value}${query ? `&q=${encodeURIComponent(query)}` : ""}#prompt-library`}
							key={item.value}
						>
							{item.label}
						</a>
					))}
				</div>
				<div className="grid gap-3 md:grid-cols-4">
					<MiniMetric label="Que mide" value="Intencion + funnel" />
					<MiniMetric label="Estado GEO" value="Accion recomendada" />
					<MiniMetric label="Rendimiento" value="Visibilidad, posicion" />
					<MiniMetric label="Riesgo" value="Marca ausente / rival" />
				</div>
				<p className="text-xs text-[var(--muted)]">
					Mostrando {prompts.length} de {totalPrompts} prompts activos.
				</p>
			</div>
			<div className="grid gap-4 p-5">
				{prompts.map((prompt) => {
					const ranking = rankingsByPrompt.get(prompt.id);
					const promptRuns = runsByPrompt.get(prompt.id) ?? [];
					const runAction = runPromptAcrossEnabledLlmsAction.bind(
						null,
						workspaceId,
						workspaceSlug,
						prompt.id,
					);
					const rowStatus = promptStatus(prompt, ranking);
					return (
						<article
							className="rounded-xl border border-[var(--border)] bg-[rgba(231,233,238,0.03)] p-4"
							key={prompt.id}
						>
							<div className="flex flex-wrap items-start justify-between gap-4">
								<div className="min-w-0 flex-1">
									<div className="flex flex-wrap gap-2 text-[10px] font-black uppercase tracking-[0.08em]">
										<span
											className={`rounded-full border px-2 py-1 ${statusClass(rowStatus)}`}
										>
											{statusLabel(rowStatus)}
										</span>
										<Badge>{intentFromPrompt(prompt)}</Badge>
										<Badge>P{prompt.priority}</Badge>
										<Badge>{prompt.frequency}</Badge>
										<Badge>{prompt.status}</Badge>
									</div>
									<h3 className="mt-3 text-lg font-black text-[var(--foreground)]">
										{prompt.title}
									</h3>
									<p className="mt-2 max-w-4xl text-sm leading-6 text-[var(--muted)]">
										{prompt.body}
									</p>
									<div className="mt-4 grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
										<MiniMetric
											label="Que mide"
											value={`${intentFromPrompt(prompt)} / ${prompt.frequency}`}
										/>
										<MiniMetric
											label="Estado GEO"
											value={statusLabel(rowStatus)}
										/>
										<MiniMetric
											label="Rendimiento"
											value={`${formatPercent(promptVisibility(ranking))} - ${
												ranking?.brand_position
													? `#${ranking.brand_position}`
													: "sin posicion"
											}`}
										/>
										<MiniMetric
											label="Riesgo"
											value={promptRiskLabel(ranking)}
										/>
									</div>
									<div className="mt-3 grid gap-2 sm:grid-cols-3">
										<MiniMetric
											label="Sentiment"
											value={ranking?.sentiment ?? "no_data"}
										/>
										<MiniMetric
											label="Top competitor"
											value={ranking?.competitors_mentioned?.[0] ?? "-"}
										/>
										<MiniMetric
											label="Sources"
											value={String(ranking?.source_count ?? 0)}
										/>
									</div>
									<div className="mt-4 flex flex-wrap gap-2">
										{prompt.tags.map((tag) => (
											<span
												className="rounded border border-[var(--border)] bg-[var(--surface-subtle)] px-2 py-1 text-xs text-[var(--muted)]"
												key={`${prompt.id}-${tag}`}
											>
												#{tag}
											</span>
										))}
										{activeConfigs.map((config) => {
											const latest = promptRuns.find(
												(run) => run.provider === config.provider,
											);
											return (
												<span
													className="rounded border border-[var(--border)] bg-[var(--surface-subtle)] px-2 py-1 text-xs text-[var(--muted)]"
													key={`${prompt.id}-${config.provider}`}
												>
													{providerLabel(config.provider)}:{" "}
													{latest ? latest.status : "sin run"}
												</span>
											);
										})}
									</div>
								</div>
								<form action={runAction}>
									<input name="body" type="hidden" value={prompt.body} />
									<button
										className="inline-flex items-center gap-2 rounded-lg bg-[var(--brand)] px-3 py-2 text-sm font-black text-[#1b1000] transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-45"
										disabled={activeConfigs.length === 0}
										type="submit"
									>
										<Play className="size-4" />
										Ejecutar todos
									</button>
								</form>
							</div>
						</article>
					);
				})}
				{prompts.length === 0 ? (
					<EmptyState text="No hay prompts que coincidan con los filtros. Prueba con Todos o importa/genera nuevos candidatos." />
				) : null}
			</div>
		</section>
	);
}

function _CreatePromptForm({
	createAction,
}: {
	createAction: (formData: FormData) => Promise<void>;
}) {
	return (
		<form action={createAction} className="neo-card grid gap-4 p-5">
			<div className="flex items-center gap-2">
				<Plus className="size-5 text-[var(--brand)]" />
				<h2 className="text-lg font-black text-[var(--foreground)]">
					Crear prompt manual
				</h2>
			</div>
			<Field label="Titulo">
				<input name="title" required />
			</Field>
			<div className="grid gap-4 sm:grid-cols-2">
				<Field label="Prioridad">
					<input
						defaultValue="3"
						max="5"
						min="1"
						name="priority"
						type="number"
					/>
				</Field>
				<Field label="Frecuencia">
					<input defaultValue="daily" name="frequency" />
				</Field>
			</div>
			<Field label="Prompt">
				<textarea name="body" required rows={5} />
			</Field>
			<Field label="Tags">
				<input name="tags" placeholder="awareness, pricing, alternatives" />
			</Field>
			<button
				className="w-fit rounded-lg bg-[var(--brand)] px-4 py-2 text-sm font-black text-[#1b1000] transition hover:brightness-110"
				type="submit"
			>
				Crear prompt
			</button>
		</form>
	);
}

function Field({ label, children }: { label: string; children: ReactNode }) {
	return (
		<div className="grid gap-2 text-sm font-bold text-[var(--muted)]">
			<span>{label}</span>
			{children}
		</div>
	);
}

function Stat({
	label,
	value,
	icon: Icon,
	helper,
	suffix = "",
	prefix = "",
}: {
	label: string;
	value: number;
	icon: ComponentType<{ className?: string }>;
	helper: string;
	suffix?: string;
	prefix?: string;
}) {
	return (
		<div className="neo-card p-4">
			<div className="flex items-start justify-between gap-3">
				<div>
					<p className="text-[11px] font-black uppercase tracking-[0.14em] text-[var(--muted)]">
						{label}
					</p>
					<p className="mt-3 text-4xl font-black tracking-[-0.04em] text-[var(--foreground)]">
						{prefix}
						{value}
						<span className="text-sm text-[var(--muted)]">{suffix}</span>
					</p>
					<p className="mt-1 text-xs text-[var(--muted)]">{helper}</p>
				</div>
				<div className="grid size-10 place-items-center rounded-lg border border-[rgba(244,149,39,0.24)] bg-[var(--brand-soft)] text-[var(--brand)]">
					<Icon className="size-5" />
				</div>
			</div>
		</div>
	);
}

function InsightCard({
	label,
	value,
	text,
	tone,
}: {
	label: string;
	value: string;
	text: string;
	tone: "healthy" | "watch" | "risk";
}) {
	const toneClass = {
		healthy: "border-emerald-400/30 bg-emerald-400/10 text-emerald-200",
		watch: "border-amber-400/30 bg-amber-400/10 text-amber-200",
		risk: "border-red-400/30 bg-red-400/10 text-red-200",
	}[tone];
	return (
		<article className={`rounded-xl border p-4 ${toneClass}`}>
			<p className="text-[11px] font-black uppercase tracking-[0.14em] opacity-80">
				{label}
			</p>
			<p className="mt-2 text-3xl font-black tracking-[-0.05em]">{value}</p>
			<p className="mt-2 text-sm leading-5 opacity-85">{text}</p>
		</article>
	);
}

function MiniMetric({ label, value }: { label: string; value: string }) {
	return (
		<div className="rounded-lg border border-[var(--border)] bg-[var(--background)] p-3">
			<p className="text-[10px] font-black uppercase tracking-[0.12em] text-[var(--muted)]">
				{label}
			</p>
			<p className="mt-1 truncate text-sm font-black text-[var(--foreground)]">
				{value}
			</p>
		</div>
	);
}

function Badge({ children }: { children: ReactNode }) {
	return (
		<span className="rounded border border-[var(--border)] bg-[var(--surface-subtle)] px-2 py-1 text-[var(--muted)]">
			{children}
		</span>
	);
}

function EmptyState({ text }: { text: string }) {
	return (
		<p className="rounded-lg border border-dashed border-[var(--border)] p-6 text-sm text-[var(--muted)]">
			{text}
		</p>
	);
}

function Message({
	status,
}: {
	status: {
		error?: string;
		saved?: string;
		ran?: string;
		generated?: string;
		accepted?: string;
		rejected?: string;
		imported?: string;
		bulkAccepted?: string;
	};
}) {
	if (status.error) {
		return (
			<p className="rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-[#ffb4ab]">
				{status.error}
			</p>
		);
	}
	if (status.generated) {
		return (
			<p className="rounded-lg border border-[rgba(244,149,39,0.3)] bg-[var(--brand-soft)] p-3 text-sm text-[var(--brand)]">
				Generados {status.generated} candidatos.
			</p>
		);
	}
	if (status.imported) {
		return (
			<p className="rounded-lg border border-[rgba(244,149,39,0.3)] bg-[var(--brand-soft)] p-3 text-sm text-[var(--brand)]">
				Importados {status.imported} candidatos desde archivo. Revisa y activa
				solo los que quieras monitorizar.
			</p>
		);
	}
	if (status.bulkAccepted) {
		return (
			<p className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-3 text-sm text-[#7ee3a2]">
				{status.bulkAccepted} candidatos guardados como prompts activos.
			</p>
		);
	}
	if (status.accepted) {
		return (
			<p className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-3 text-sm text-[#7ee3a2]">
				Candidato guardado como prompt activo.
			</p>
		);
	}
	if (status.rejected) {
		return (
			<p className="rounded-lg border border-[var(--border)] bg-[var(--surface-subtle)] p-3 text-sm text-[var(--muted)]">
				Candidato descartado.
			</p>
		);
	}
	if (status.saved) {
		return (
			<p className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-3 text-sm text-[#7ee3a2]">
				Prompt guardado.
			</p>
		);
	}
	if (status.ran) {
		return (
			<p className="rounded-lg border border-[rgba(244,149,39,0.3)] bg-[var(--brand-soft)] p-3 text-sm text-[var(--brand)]">
				Prompt ejecutado contra {status.ran} LLMs activos.
			</p>
		);
	}
	return null;
}
