import {
	AlertTriangle,
	CheckCircle2,
	Clock3,
	type LucideIcon,
	ShieldAlert,
} from "lucide-react";
import {
	createRecommendationAction,
	createRecommendationTaskAction,
	generateRecommendationsAction,
	importRecommendationSourcesAction,
	startRecommendationTaskAction,
	translateRecommendationsAction,
	updateRecommendationStatusAction,
} from "@/actions/recommendations";
import { requireUser, requireWorkspace } from "@/lib/data/workspace";
import { getUserPreferences } from "@/lib/preferences-server";
import type {
	Recommendation,
	RecommendationCategory,
	RecommendationSource,
	RecommendationStatus,
} from "@/types";

const categories: RecommendationCategory[] = [
	"entity",
	"content",
	"sources",
	"competitors",
	"prompts",
	"technical",
	"authority",
	"sentiment",
];

const statusLabels: Record<RecommendationStatus, string> = {
	pending: "Pendiente",
	in_progress: "En curso",
	done: "Completada",
	dismissed: "Descartada",
};

type RecommendationSeverity = "critical" | "complaint" | "medium" | "low";

type SeverityConfig = {
	key: RecommendationSeverity;
	title: string;
	shortLabel: string;
	description: string;
	empty: string;
	tone: string;
	card: string;
	chip: string;
	icon: LucideIcon;
};

const severityConfigs: SeverityConfig[] = [
	{
		key: "critical",
		title: "Críticas",
		shortLabel: "Requiere acción inmediata",
		description:
			"Problemas que pueden estar reduciendo visibilidad, SOV o presencia frente a competidores.",
		empty: "No hay recomendaciones críticas ahora mismo.",
		tone: "text-red-800",
		card: "border-red-200 bg-red-50/55",
		chip: "border-red-200 bg-red-100 text-red-800",
		icon: AlertTriangle,
	},
	{
		key: "complaint",
		title: "Denuncias",
		shortLabel: "Riesgo de percepción o confianza",
		description:
			"Alertas reputacionales: sentimiento negativo, fuentes problemáticas o mensajes que pueden dañar la confianza.",
		empty: "No hay alertas reputacionales detectadas.",
		tone: "text-rose-800",
		card: "border-rose-200 bg-rose-50/55",
		chip: "border-rose-200 bg-rose-100 text-rose-800",
		icon: ShieldAlert,
	},
	{
		key: "medium",
		title: "Nivel intermedio",
		shortLabel: "Prioridad recomendada",
		description:
			"Acciones importantes para mejorar claridad, autoridad y cobertura sin ser una urgencia inmediata.",
		empty: "No hay recomendaciones intermedias.",
		tone: "text-amber-800",
		card: "border-amber-200 bg-amber-50/60",
		chip: "border-amber-200 bg-amber-100 text-amber-800",
		icon: Clock3,
	},
	{
		key: "low",
		title: "Nivel bajo",
		shortLabel: "Mejora incremental",
		description:
			"Optimizaciones y mantenimiento para seguir ganando consistencia cuando lo urgente ya está controlado.",
		empty: "No hay mejoras de bajo riesgo pendientes.",
		tone: "text-emerald-800",
		card: "border-emerald-200 bg-emerald-50/60",
		chip: "border-emerald-200 bg-emerald-100 text-emerald-800",
		icon: CheckCircle2,
	},
];

function scoreTone(score: number) {
	if (score >= 85) {
		return "border-red-200 bg-red-50 text-red-800";
	}
	if (score >= 60) {
		return "border-amber-200 bg-amber-50 text-amber-800";
	}
	return "border-emerald-200 bg-emerald-50 text-emerald-800";
}

function stringArrayFromEvidence(
	evidence: unknown,
	key: "actionItems" | "ragSources",
) {
	if (!evidence || typeof evidence !== "object") {
		return [];
	}
	const record = evidence as Record<string, unknown>;
	const value = record[key];
	return Array.isArray(value) ? value.map(String).filter(Boolean) : [];
}

function textFromEvidence(evidence: unknown, key: string) {
	if (!evidence || typeof evidence !== "object") {
		return "";
	}
	const record = evidence as Record<string, unknown>;
	const value = record[key];
	return typeof value === "string" ? value : "";
}

function getRecommendationSeverity(
	recommendation: Recommendation,
): RecommendationSeverity {
	const evidenceReason = textFromEvidence(recommendation.evidence, "reason");
	const haystack = [
		recommendation.title,
		recommendation.description,
		evidenceReason,
		recommendation.related_source_domains.join(" "),
	]
		.join(" ")
		.toLowerCase();

	if (
		recommendation.category === "sentiment" ||
		evidenceReason === "weak_sentiment" ||
		haystack.includes("negative") ||
		haystack.includes("sentiment") ||
		haystack.includes("reputation") ||
		haystack.includes("trust")
	) {
		return "complaint";
	}

	if (
		recommendation.priority >= 5 ||
		Number(recommendation.impact_score) >= 85
	) {
		return "critical";
	}

	if (
		recommendation.priority <= 2 ||
		Number(recommendation.impact_score) < 60
	) {
		return "low";
	}

	return "medium";
}

function statusRank(status: RecommendationStatus) {
	if (status === "pending") return 0;
	if (status === "in_progress") return 1;
	if (status === "done") return 2;
	return 3;
}

function sortRecommendations(items: Recommendation[]) {
	return [...items].sort((a, b) => {
		const statusDelta = statusRank(a.status) - statusRank(b.status);
		if (statusDelta !== 0) return statusDelta;
		const priorityDelta = b.priority - a.priority;
		if (priorityDelta !== 0) return priorityDelta;
		return Number(b.impact_score) - Number(a.impact_score);
	});
}

function plainMeaning(recommendation: Recommendation) {
	const severity = getRecommendationSeverity(recommendation);
	if (severity === "complaint") {
		return "La IA puede estar mostrando la marca con dudas, tono negativo o fuentes que no ayudan a generar confianza.";
	}
	if (severity === "critical") {
		return "Este punto puede estar frenando la visibilidad de la marca cuando los usuarios preguntan a sistemas de IA.";
	}
	if (severity === "medium") {
		return "Hay una mejora clara que puede aumentar presencia, autoridad o consistencia sin bloquear el resto del trabajo.";
	}
	return "Es una optimización útil para consolidar avances cuando las prioridades altas ya estÃ¡n en marcha.";
}

function technicalReference(recommendation: Recommendation) {
	const domains = recommendation.related_source_domains.slice(0, 3).join(", ");
	const refs = [
		`${recommendation.related_prompt_ids.length} prompts`,
		`${recommendation.related_competitor_ids.length} competidores`,
		domains ? `fuentes: ${domains}` : "",
	].filter(Boolean);

	return refs.join(" · ");
}

function groupedRecommendations(recommendations: Recommendation[]) {
	return severityConfigs.map((config) => ({
		...config,
		items: sortRecommendations(
			recommendations.filter(
				(recommendation) =>
					getRecommendationSeverity(recommendation) === config.key,
			),
		),
	}));
}

function ScoreBadge({ label, value }: { label: string; value: number }) {
	return (
		<div
			className={`rounded-md border px-3 py-2 text-center ${scoreTone(value)}`}
		>
			<p className="text-[11px] font-semibold uppercase tracking-[0.08em]">
				{label}
			</p>
			<p className="mt-1 text-lg font-semibold">{value.toFixed(0)}</p>
		</div>
	);
}

function RecommendationCard({
	recommendation,
	config,
	workspaceId,
	workspaceSlug,
}: {
	recommendation: Recommendation;
	config: SeverityConfig;
	workspaceId: string;
	workspaceSlug: string;
}) {
	const actionItems = stringArrayFromEvidence(
		recommendation.evidence,
		"actionItems",
	);
	const ragSources = stringArrayFromEvidence(
		recommendation.evidence,
		"ragSources",
	);
	const Icon = config.icon;
	const markInProgress = startRecommendationTaskAction.bind(
		null,
		workspaceId,
		workspaceSlug,
		recommendation,
	);
	const markDone = updateRecommendationStatusAction.bind(
		null,
		workspaceSlug,
		recommendation.id,
		"done",
	);
	const dismiss = updateRecommendationStatusAction.bind(
		null,
		workspaceSlug,
		recommendation.id,
		"dismissed",
	);
	const createTask = createRecommendationTaskAction.bind(
		null,
		workspaceId,
		workspaceSlug,
		recommendation,
	);

	return (
		<article className={`rounded-md border bg-white p-5 ${config.card}`}>
			<div className="flex flex-wrap items-start justify-between gap-4">
				<div className="min-w-0 flex-1">
					<div className="flex flex-wrap items-center gap-2">
						<span
							className={`inline-flex items-center gap-1 rounded-md border px-2 py-1 text-xs font-semibold uppercase ${config.chip}`}
						>
							<Icon aria-hidden="true" className="h-3.5 w-3.5" />
							{config.shortLabel}
						</span>
						<span className="rounded-md bg-white/80 px-2 py-1 text-xs font-semibold uppercase text-slate-700">
							{recommendation.category}
						</span>
						<span className="rounded-md bg-white/80 px-2 py-1 text-xs font-semibold uppercase text-slate-700">
							P{recommendation.priority}
						</span>
						<span className="rounded-md bg-white/80 px-2 py-1 text-xs font-semibold uppercase text-slate-700">
							{statusLabels[recommendation.status]}
						</span>
					</div>
					<h3 className="mt-3 text-lg font-semibold text-slate-950">
						{recommendation.title}
					</h3>
					<p className="mt-2 max-w-4xl text-sm leading-6 text-slate-700">
						{recommendation.description}
					</p>
				</div>
				<div className="grid min-w-40 grid-cols-2 gap-2">
					<ScoreBadge
						label="Impacto"
						value={Number(recommendation.impact_score)}
					/>
					<ScoreBadge
						label="Confianza"
						value={Number(recommendation.confidence_score)}
					/>
				</div>
			</div>

			<div className="mt-4 grid gap-3 md:grid-cols-[1fr_1fr]">
				<div className="rounded-md border border-white/80 bg-white/75 p-3">
					<p className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">
						Qué significa
					</p>
					<p className="mt-2 text-sm leading-6 text-slate-700">
						{plainMeaning(recommendation)}
					</p>
				</div>
				<div className="rounded-md border border-white/80 bg-white/75 p-3">
					<p className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">
						Referencia concreta
					</p>
					<p className="mt-2 text-sm leading-6 text-slate-700">
						{technicalReference(recommendation) || "Sin referencias asociadas."}
					</p>
				</div>
			</div>

			<div className="mt-4 rounded-md border border-white/80 bg-white/80 p-3">
				<p className="text-sm font-semibold text-slate-950">Qué hacer ahora</p>
				{actionItems.length > 0 ? (
					<ol className="mt-3 grid gap-2 text-sm text-slate-700">
						{actionItems.map((item, index) => (
							<li className="flex gap-2" key={item}>
								<span
									className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${config.chip}`}
								>
									{index + 1}
								</span>
								<span>{item}</span>
							</li>
						))}
					</ol>
				) : (
					<p className="mt-2 text-sm text-slate-600">
						Revisar esta recomendación y convertirla en una tarea concreta.
					</p>
				)}
			</div>

			{ragSources.length > 0 ? (
				<div className="mt-4">
					<p className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">
						Basado en
					</p>
					<div className="mt-2 flex flex-wrap gap-2">
						{ragSources.map((source) => (
							<span
								className="rounded-md border border-slate-200 bg-white px-2 py-1 text-xs font-medium text-slate-700"
								key={source}
							>
								{source}
							</span>
						))}
					</div>
				</div>
			) : null}

			<div className="mt-4 flex flex-wrap gap-2">
				<form action={markInProgress}>
					<button
						className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
						type="submit"
					>
						Empezar
					</button>
				</form>
				<form action={markDone}>
					<button
						className="rounded-md bg-emerald-700 px-3 py-2 text-sm font-medium text-white hover:bg-emerald-800"
						type="submit"
					>
						Completada
					</button>
				</form>
				<form action={dismiss}>
					<button
						className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
						type="submit"
					>
						Descartar
					</button>
				</form>
				<form action={createTask}>
					<button
						className="rounded-md bg-slate-950 px-3 py-2 text-sm font-medium text-white hover:bg-slate-800"
						type="submit"
					>
						Crear tarea
					</button>
				</form>
			</div>
		</article>
	);
}

function RecommendationSeveritySection({
	config,
	items,
	workspaceId,
	workspaceSlug,
}: {
	config: SeverityConfig;
	items: Recommendation[];
	workspaceId: string;
	workspaceSlug: string;
}) {
	const Icon = config.icon;

	return (
		<section className="grid gap-3">
			<div className="flex flex-wrap items-start justify-between gap-3">
				<div className="flex items-start gap-3">
					<div
						className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-md border ${config.chip}`}
					>
						<Icon aria-hidden="true" className="h-5 w-5" />
					</div>
					<div>
						<h2 className={`text-lg font-semibold ${config.tone}`}>
							{config.title}
						</h2>
						<p className="mt-1 max-w-3xl text-sm leading-6 text-slate-600">
							{config.description}
						</p>
					</div>
				</div>
				<span className={`rounded-md border px-3 py-1 text-sm ${config.chip}`}>
					{items.length}
				</span>
			</div>

			{items.length === 0 ? (
				<div className="rounded-md border border-dashed border-slate-300 bg-white p-5 text-sm text-slate-500">
					{config.empty}
				</div>
			) : (
				<div className="grid gap-3">
					{items.map((recommendation) => (
						<RecommendationCard
							config={config}
							key={recommendation.id}
							recommendation={recommendation}
							workspaceId={workspaceId}
							workspaceSlug={workspaceSlug}
						/>
					))}
				</div>
			)}
		</section>
	);
}

export default async function Page({
	params,
	searchParams,
}: {
	params: Promise<{ workspace: string }>;
	searchParams: Promise<{
		error?: string;
		imported?: string;
		generated?: string;
		created?: string;
		translated?: string;
	}>;
}) {
	const { workspace: slug } = await params;
	const status = await searchParams;
	const workspace = await requireWorkspace(slug);
	const { supabase } = await requireUser();
	const prefs = await getUserPreferences();
	const isEn = prefs.locale === "en";

	const [recommendationsResult, sourcesResult, actionsResult] =
		await Promise.all([
			supabase
				.from("recommendations")
				.select("*")
				.eq("workspace_id", workspace.id)
				.order("priority", { ascending: false })
				.order("impact_score", { ascending: false }),
			supabase
				.from("recommendation_sources")
				.select("*")
				.eq("workspace_id", workspace.id)
				.order("category", { ascending: true }),
			supabase
				.from("recommendation_actions")
				.select("*, recommendations!inner(workspace_id)")
				.eq("recommendations.workspace_id", workspace.id),
		]);

	const recommendations = (recommendationsResult.data ??
		[]) as Recommendation[];
	const sources = (sourcesResult.data ?? []) as RecommendationSource[];
	const actions = actionsResult.data ?? [];
	const grouped = groupedRecommendations(recommendations);
	const pendingCount = recommendations.filter(
		(item) => item.status === "pending",
	).length;
	const activeCount = recommendations.filter(
		(item) => item.status === "pending" || item.status === "in_progress",
	).length;
	const highImpactCount = recommendations.filter(
		(item) => Number(item.impact_score) >= 80,
	).length;
	const reputationCount =
		grouped.find((group) => group.key === "complaint")?.items.length ?? 0;

	const importAction = importRecommendationSourcesAction.bind(
		null,
		workspace.id,
		workspace.slug,
	);
	const generateAction = generateRecommendationsAction.bind(
		null,
		workspace.id,
		workspace.slug,
	);
	const translateAction = translateRecommendationsAction.bind(
		null,
		workspace.id,
		workspace.slug,
	);
	const createAction = createRecommendationAction.bind(
		null,
		workspace.id,
		workspace.slug,
	);

	return (
		<main className="flex-1 overflow-auto bg-slate-50 p-4 lg:p-6">
			<div className="grid gap-6">
				<div className="flex flex-wrap items-start justify-between gap-4">
					<div>
						<p className="text-sm font-semibold uppercase text-cyan-700">
							AI SEO Recommendations
						</p>
						<h1 className="mt-2 text-2xl font-semibold text-slate-950">
							Recomendaciones por severidad
						</h1>
						<p className="mt-2 max-w-3xl text-slate-600">
							{isEn
								? "Prioritized actions from the RAG algorithm, explained for marketing teams, SEO teams, and clients who need to know what to do first."
								: "Acciones priorizadas a partir del algoritmo RAG, explicadas para equipos de marketing, SEO y clientes que necesitan saber que hacer primero."}
						</p>
					</div>
					<div className="flex flex-wrap gap-2">
						<form action={importAction}>
							<button
								className="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
								type="submit"
							>
								{isEn ? "Import MD sources" : "Importar fuentes MD"}
							</button>
						</form>
						<form action={translateAction}>
							<button
								className="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
								type="submit"
							>
								{isEn ? "Translate to English" : "Traducir a espanol"}
							</button>
						</form>
						<form action={generateAction}>
							<button
								className="rounded-md bg-slate-950 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
								type="submit"
							>
								{isEn ? "Generate recommendations" : "Generar recomendaciones"}
							</button>
						</form>
					</div>
				</div>

				{status.error ? (
					<p className="rounded-md bg-red-50 p-3 text-sm text-red-700">
						{status.error}
					</p>
				) : null}
				{status.imported ? (
					<p className="rounded-md bg-emerald-50 p-3 text-sm text-emerald-700">
						Metodología markdown importada.
					</p>
				) : null}
				{status.generated ? (
					<p className="rounded-md bg-emerald-50 p-3 text-sm text-emerald-700">
						Generadas {status.generated} recomendaciones.
					</p>
				) : null}
				{status.translated ? (
					<p className="rounded-md bg-emerald-50 p-3 text-sm text-emerald-700">
						{isEn
							? `Translated ${status.translated} recommendations.`
							: `Traducidas ${status.translated} recomendaciones.`}
					</p>
				) : null}
				{status.created ? (
					<p className="rounded-md bg-emerald-50 p-3 text-sm text-emerald-700">
						Recomendación creada.
					</p>
				) : null}

				<section className="grid gap-3 md:grid-cols-5">
					<div className="rounded-md border border-slate-200 bg-white p-4">
						<p className="text-sm text-slate-500">Activas</p>
						<p className="mt-2 text-3xl font-semibold text-slate-950">
							{activeCount}
						</p>
					</div>
					<div className="rounded-md border border-slate-200 bg-white p-4">
						<p className="text-sm text-slate-500">Pendientes</p>
						<p className="mt-2 text-3xl font-semibold text-slate-950">
							{pendingCount}
						</p>
					</div>
					<div className="rounded-md border border-red-200 bg-red-50 p-4">
						<p className="text-sm text-red-700">Alto impacto</p>
						<p className="mt-2 text-3xl font-semibold text-red-950">
							{highImpactCount}
						</p>
					</div>
					<div className="rounded-md border border-rose-200 bg-rose-50 p-4">
						<p className="text-sm text-rose-700">Denuncias</p>
						<p className="mt-2 text-3xl font-semibold text-rose-950">
							{reputationCount}
						</p>
					</div>
					<div className="rounded-md border border-slate-200 bg-white p-4">
						<p className="text-sm text-slate-500">Fuentes MD</p>
						<p className="mt-2 text-3xl font-semibold text-slate-950">
							{sources.length}
						</p>
					</div>
				</section>

				<section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
					<div className="grid gap-8">
						{recommendations.length === 0 ? (
							<div className="rounded-md border border-dashed border-slate-300 bg-white p-8 text-center">
								<h2 className="text-lg font-semibold text-slate-950">
									No hay recomendaciones todavía
								</h2>
								<p className="mt-2 text-sm text-slate-500">
									Importa la metodologÃ­a markdown y genera las primeras
									recomendaciones para este workspace.
								</p>
							</div>
						) : null}

						{grouped.map((group) => (
							<RecommendationSeveritySection
								config={group}
								items={group.items}
								key={group.key}
								workspaceId={workspace.id}
								workspaceSlug={workspace.slug}
							/>
						))}
					</div>

					<aside className="grid h-fit gap-4">
						<form
							action={createAction}
							className="grid gap-3 rounded-md border border-slate-200 bg-white p-4"
						>
							<h2 className="font-semibold text-slate-950">
								AÃ±adir recomendación manual
							</h2>
							<input
								className="rounded-md border border-slate-300 px-3 py-2 text-sm"
								name="title"
								placeholder="TÃ­tulo de la recomendación"
								required
							/>
							<textarea
								className="min-h-24 rounded-md border border-slate-300 px-3 py-2 text-sm"
								name="description"
								placeholder="¿Qué debería hacer el equipo?"
								required
							/>
							<div className="grid grid-cols-2 gap-2">
								<select
									className="rounded-md border border-slate-300 px-3 py-2 text-sm"
									name="category"
								>
									{categories.map((category) => (
										<option key={category} value={category}>
											{category}
										</option>
									))}
								</select>
								<input
									className="rounded-md border border-slate-300 px-3 py-2 text-sm"
									defaultValue="3"
									max="5"
									min="1"
									name="priority"
									type="number"
								/>
							</div>
							<button
								className="rounded-md bg-slate-950 px-4 py-2 text-sm font-semibold text-white"
								type="submit"
							>
								Crear
							</button>
						</form>

						<section className="rounded-md border border-slate-200 bg-white p-4">
							<h2 className="font-semibold text-slate-950">
								Archivos de metodologÃ­a
							</h2>
							<div className="mt-3 grid gap-2">
								{sources.length === 0 ? (
									<p className="text-sm text-slate-500">
										Todavía no hay fuentes markdown importadas.
									</p>
								) : null}
								{sources.map((source) => (
									<div
										className="rounded-md border border-slate-100 bg-slate-50 p-3"
										key={source.id}
									>
										<p className="text-sm font-medium text-slate-950">
											{source.title}
										</p>
										<p className="mt-1 text-xs uppercase text-slate-500">
											{source.category} · {source.version}
										</p>
									</div>
								))}
							</div>
						</section>

						<section className="rounded-md border border-slate-200 bg-white p-4">
							<h2 className="font-semibold text-slate-950">Tareas creadas</h2>
							<p className="mt-2 text-3xl font-semibold text-slate-950">
								{actions.length}
							</p>
							<p className="mt-1 text-sm text-slate-500">
								Las recomendaciones pueden convertirse en tareas para asignar
								responsable y seguimiento.
							</p>
						</section>
					</aside>
				</section>
			</div>
		</main>
	);
}
