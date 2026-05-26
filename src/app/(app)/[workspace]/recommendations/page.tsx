import {
	AlertTriangle,
	CheckCircle2,
	Clock3,
	type LucideIcon,
	ShieldAlert,
	Zap,
} from "lucide-react";
import {
	createRecommendationTaskAction,
	generateRecommendationsAction,
	importRecommendationSourcesAction,
	startRecommendationTaskAction,
	translateRecommendationsAction,
	updateRecommendationStatusAction,
} from "@/actions/recommendations";
import {
	type PriorityTone,
	SimpleRecommendationCard,
} from "@/components/recommendations/SimpleRecommendationCard";
import { SimpleRecommendationsHeader } from "@/components/recommendations/SimpleRecommendationsHeader";
import { requireUser, requireWorkspace } from "@/lib/data/workspace";
import { getUserPreferences } from "@/lib/preferences-server";
import type {
	Recommendation,
	RecommendationCategory,
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
		title: "Confianza y reseñas",
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

function getPriorityTone(recommendation: Recommendation): PriorityTone {
	if (recommendation.priority >= 4) return "high";
	if (recommendation.priority === 3) return "medium";
	return "low";
}

function getPriorityLabel(tone: PriorityTone, isEn: boolean): string {
	if (tone === "high") return isEn ? "High priority" : "Alta prioridad";
	if (tone === "medium") return isEn ? "Medium priority" : "Prioridad media";
	return isEn ? "Low priority" : "Prioridad baja";
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

function simpleArea(category: RecommendationCategory) {
	const labels: Record<RecommendationCategory, string> = {
		entity: "Marca",
		content: "Contenido",
		sources: "Fuentes",
		competitors: "Competidores",
		prompts: "PROMPTs",
		technical: "Datos",
		authority: "Fuentes",
		sentiment: "Confianza y reseñas",
	};
	return labels[category];
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

type SmeSection = {
	key: "thisweek" | "upcoming" | "watching";
	title: string;
	description: string;
	empty: string;
	icon: LucideIcon;
	card: string;
	chip: string;
};

const smeSections: SmeSection[] = [
	{
		key: "thisweek",
		title: "Esta semana",
		description:
			"Acciones urgentes para mejorar tu visibilidad en IA de inmediato.",
		empty: "Todo en orden. Ninguna accion urgente.",
		icon: AlertTriangle,
		card: "border-red-500/30 bg-red-500/[0.08]",
		chip: "border-red-500/40 bg-red-500/[0.15] text-red-400",
	},
	{
		key: "upcoming",
		title: "Proximamente",
		description:
			"Mejoras importantes que puedes planificar para las proximas semanas.",
		empty: "No hay mejoras planificadas pendientes.",
		icon: Clock3,
		card: "border-amber-500/30 bg-amber-500/[0.08]",
		chip: "border-amber-500/40 bg-amber-500/[0.15] text-amber-400",
	},
	{
		key: "watching",
		title: "En observacion",
		description: "Acciones en progreso o ya completadas.",
		empty: "Nada en observacion aun.",
		icon: CheckCircle2,
		card: "border-emerald-500/30 bg-emerald-500/[0.08]",
		chip: "border-emerald-500/40 bg-emerald-500/[0.15] text-emerald-400",
	},
];

function smeGroupRecommendations(recommendations: Recommendation[]) {
	return smeSections.map((section) => {
		let items: Recommendation[];
		if (section.key === "thisweek") {
			items = recommendations.filter((r) => {
				const sev = getRecommendationSeverity(r);
				return (
					(sev === "critical" || sev === "complaint") && r.status === "pending"
				);
			});
		} else if (section.key === "upcoming") {
			items = recommendations.filter((r) => {
				const sev = getRecommendationSeverity(r);
				return (sev === "medium" || sev === "low") && r.status === "pending";
			});
		} else {
			items = recommendations.filter(
				(r) => r.status === "in_progress" || r.status === "done",
			);
		}
		return { ...section, items: sortRecommendations(items) };
	});
}

function SmeRecommendationCard({
	recommendation,
	section,
	workspaceId,
	workspaceSlug,
}: {
	recommendation: Recommendation;
	section: SmeSection;
	workspaceId: string;
	workspaceSlug: string;
}) {
	const actionItems = stringArrayFromEvidence(
		recommendation.evidence,
		"actionItems",
	);
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

	return (
		<article className={`rounded-md border p-4 ${section.card}`}>
			<div className="flex flex-wrap items-start gap-2">
				<span
					className={`inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-xs font-semibold ${section.chip}`}
				>
					{simpleArea(recommendation.category)}
				</span>
				<span className="rounded-md bg-[var(--surface-raised)] px-2 py-0.5 text-xs font-semibold text-[var(--foreground)]">
					{statusLabels[recommendation.status]}
				</span>
			</div>
			<h3 className="mt-2 text-base font-semibold text-[var(--foreground)]">
				{recommendation.title}
			</h3>
			<p className="mt-1 text-sm leading-6 text-[var(--muted)]">
				{recommendation.description}
			</p>
			{actionItems.length > 0 ? (
				<div className="mt-3 rounded-md bg-[var(--surface-raised)] p-3">
					<p className="text-xs font-semibold uppercase tracking-[0.06em] text-[var(--muted)]">
						Que hacer:
					</p>
					<ol className="mt-2 grid gap-1.5 text-sm text-[var(--foreground)]">
						{actionItems.slice(0, 3).map((item, i) => (
							<li className="flex gap-2" key={item}>
								<span
									className={`mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${section.chip}`}
								>
									{i + 1}
								</span>
								<span>{item}</span>
							</li>
						))}
					</ol>
				</div>
			) : null}
			<div className="mt-3 flex flex-wrap gap-2">
				{recommendation.status === "pending" ? (
					<form action={markInProgress}>
						<button
							className="rounded-md bg-[var(--brand)] px-3 py-1.5 text-sm font-medium text-[#1b1000] hover:brightness-110"
							type="submit"
						>
							Empezar esta semana
						</button>
					</form>
				) : null}
				<form action={markDone}>
					<button
						className="rounded-md bg-emerald-700 px-3 py-1.5 text-sm font-medium text-white hover:bg-emerald-800"
						type="submit"
					>
						Marcar como hecho
					</button>
				</form>
				<form action={dismiss}>
					<button
						className="rounded-md border border-[var(--border)] bg-[var(--surface-raised)] px-3 py-1.5 text-sm font-medium text-[var(--foreground)] hover:bg-[var(--surface-high)]"
						type="submit"
					>
						Dejar para despues
					</button>
				</form>
			</div>
		</article>
	);
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
							{simpleArea(recommendation.category)}
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
	const isSme = prefs.mode === "sme";
	const isPro = prefs.mode === "pro";

	const recommendationsResult = await supabase
		.from("recommendations")
		.select("*")
		.eq("workspace_id", workspace.id)
		.order("priority", { ascending: false })
		.order("impact_score", { ascending: false });

	const recommendations = (recommendationsResult.data ??
		[]) as Recommendation[];
	const grouped = groupedRecommendations(recommendations);
	const smeGrouped = smeGroupRecommendations(recommendations);

	if (isSme) {
		const smeGenerateAction = generateRecommendationsAction.bind(
			null,
			workspace.id,
			workspace.slug,
		);

		if (recommendations.length === 0) {
			return (
				<main className="flex-1 overflow-auto p-4 pb-24 lg:p-6 lg:pb-8">
					<div className="mx-auto max-w-3xl">
						<section className="neo-card p-8 text-center">
							<div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-[var(--brand-soft)]">
								<Zap className="size-7 text-[var(--brand)]" />
							</div>
							<h1 className="mt-5 text-2xl font-black text-[var(--foreground)]">
								Genera tu Plan de Acción
							</h1>
							<p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-[var(--muted)]">
								Analizamos tu visibilidad en IA y te damos recomendaciones
								concretas para mejorar cómo los asistentes te mencionan y
								recomiendan. Usa 2 ejecuciones de IA.
							</p>
							<form action={smeGenerateAction} className="mt-6">
								<button
									className="inline-flex items-center gap-2 rounded-lg bg-[var(--brand)] px-6 py-3 text-sm font-black text-[#1b1000] transition hover:brightness-110"
									type="submit"
								>
									<Zap className="size-4" />
									Generar mi Plan de Acción
								</button>
							</form>
							<p className="mt-4 text-xs text-[var(--muted)]">
								Se analiza tu historial de PROMPTs, competidores y fuentes
								activas.
							</p>
						</section>
					</div>
				</main>
			);
		}

		const smePendingCount = recommendations.filter(
			(r) => r.status === "pending",
		).length;
		return (
			<main className="flex-1 overflow-auto bg-slate-50 p-4 lg:p-6">
				<div className="mx-auto grid max-w-3xl gap-6">
					<div>
						<p className="text-sm font-semibold uppercase text-cyan-700">
							Plan de accion
						</p>
						<h1 className="mt-2 text-2xl font-semibold text-slate-950">
							{smePendingCount > 0
								? `Tienes ${smePendingCount} accion${smePendingCount > 1 ? "es" : ""} pendiente${smePendingCount > 1 ? "s" : ""}`
								: "Todo al dia"}
						</h1>
						<p className="mt-2 text-slate-600">
							Acciones concretas para mejorar como apareces cuando los clientes
							preguntan a la IA.
						</p>
					</div>

					{smeGrouped.map((section) => {
						const Icon = section.icon;
						return (
							<section key={section.key} className="grid gap-3">
								<div className="flex items-center gap-3">
									<div
										className={`flex size-9 shrink-0 items-center justify-center rounded-md border ${section.chip}`}
									>
										<Icon className="size-4" />
									</div>
									<div>
										<h2 className="font-semibold text-slate-950">
											{section.title}
										</h2>
										<p className="text-xs text-slate-500">
											{section.description}
										</p>
									</div>
									<span
										className={`ml-auto rounded-md border px-2.5 py-0.5 text-sm font-semibold ${section.chip}`}
									>
										{section.items.length}
									</span>
								</div>
								{section.items.length === 0 ? (
									<div className="rounded-md border border-dashed border-slate-300 bg-white p-4 text-sm text-slate-500">
										{section.empty}
									</div>
								) : (
									<div className="grid gap-3">
										{section.items.map((recommendation) => (
											<SmeRecommendationCard
												key={recommendation.id}
												recommendation={recommendation}
												section={section}
												workspaceId={workspace.id}
												workspaceSlug={workspace.slug}
											/>
										))}
									</div>
								)}
							</section>
						);
					})}
				</div>
			</main>
		);
	}

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

	if (isPro) {
		const generateAction = generateRecommendationsAction.bind(
			null,
			workspace.id,
			workspace.slug,
		);
		const categoryGroups = categories
			.map((cat) => ({
				category: cat,
				label: simpleArea(cat),
				items: sortRecommendations(
					recommendations.filter((r) => r.category === cat),
				),
			}))
			.filter((group) => group.items.length > 0);

		const proConfig: SeverityConfig = {
			key: "medium",
			title: "",
			shortLabel: "",
			description: "",
			empty: "Sin recomendaciones en esta categoria.",
			tone: "text-slate-800",
			card: "border-slate-200 bg-white",
			chip: "border-slate-200 bg-slate-100 text-slate-700",
			icon: Clock3,
		};

		return (
			<main className="flex-1 overflow-auto bg-slate-50 p-4 lg:p-6">
				<div className="grid gap-6">
					<div className="flex flex-wrap items-start justify-between gap-4">
						<div>
							<p className="text-sm font-semibold uppercase text-cyan-700">
								Pro
							</p>
							<h1 className="mt-2 text-2xl font-semibold text-slate-950">
								{isEn ? "Recommendations" : "Recomendaciones"}
							</h1>
							<p className="mt-2 max-w-3xl text-slate-600">
								{isEn
									? "Prioritized actions grouped by area. Fix critical issues first."
									: "Acciones priorizadas agrupadas por area. Empieza por lo mas critico."}
							</p>
						</div>
						<form action={generateAction}>
							<button
								className="rounded-md bg-slate-950 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
								type="submit"
							>
								{isEn ? "Generate recommendations" : "Generar recomendaciones"}
							</button>
						</form>
					</div>

					{status.error ? (
						<p className="rounded-md bg-red-50 p-3 text-sm text-red-700">
							{status.error}
						</p>
					) : null}
					{status.generated ? (
						<p className="rounded-md bg-emerald-50 p-3 text-sm text-emerald-700">
							{isEn
								? `Generated ${status.generated} recommendations.`
								: `Generadas ${status.generated} recomendaciones.`}
						</p>
					) : null}

					<section className="grid gap-3 md:grid-cols-4">
						<div className="rounded-md border border-slate-200 bg-white p-4">
							<p className="text-sm text-slate-500">
								{isEn ? "Active" : "Activas"}
							</p>
							<p className="mt-2 text-3xl font-semibold text-slate-950">
								{activeCount}
							</p>
						</div>
						<div className="rounded-md border border-slate-200 bg-white p-4">
							<p className="text-sm text-slate-500">
								{isEn ? "Pending" : "Pendientes"}
							</p>
							<p className="mt-2 text-3xl font-semibold text-slate-950">
								{pendingCount}
							</p>
						</div>
						<div className="rounded-md border border-red-200 bg-red-50 p-4">
							<p className="text-sm text-red-700">
								{isEn ? "High impact" : "Alto impacto"}
							</p>
							<p className="mt-2 text-3xl font-semibold text-red-950">
								{highImpactCount}
							</p>
						</div>
						<div className="rounded-md border border-rose-200 bg-rose-50 p-4">
							<p className="text-sm text-rose-700">
								{isEn ? "Reputation" : "Reputacion"}
							</p>
							<p className="mt-2 text-3xl font-semibold text-rose-950">
								{reputationCount}
							</p>
						</div>
					</section>

					{recommendations.length === 0 ? (
						<div className="rounded-md border border-dashed border-slate-300 bg-white p-8 text-center">
							<h2 className="text-lg font-semibold text-slate-950">
								{isEn
									? "No recommendations yet"
									: "Sin recomendaciones todavia"}
							</h2>
							<p className="mt-2 text-sm text-slate-500">
								{isEn
									? "Generate recommendations to get started."
									: "Genera recomendaciones para empezar."}
							</p>
						</div>
					) : null}

					{categoryGroups.map((group) => (
						<section className="grid gap-3" key={group.category}>
							<div className="flex items-center justify-between">
								<h2 className="text-base font-semibold text-slate-950">
									{group.label}
								</h2>
								<span className="rounded-md border border-slate-200 bg-white px-2.5 py-0.5 text-sm font-semibold text-slate-700">
									{group.items.length}
								</span>
							</div>
							<div className="grid gap-3">
								{group.items.map((recommendation) => (
									<RecommendationCard
										config={proConfig}
										key={recommendation.id}
										recommendation={recommendation}
										workspaceId={workspace.id}
										workspaceSlug={workspace.slug}
									/>
								))}
							</div>
						</section>
					))}
				</div>
			</main>
		);
	}

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

	const activeRecs = recommendations
		.filter(
			(item) => item.status === "pending" || item.status === "in_progress",
		)
		.sort((a, b) => {
			if (b.priority !== a.priority) return b.priority - a.priority;
			return Number(b.impact_score) - Number(a.impact_score);
		});

	const highPriorityCount = activeRecs.filter((r) => r.priority >= 4).length;
	const mediumPriorityCount = activeRecs.filter((r) => r.priority === 3).length;
	const lowPriorityCount = activeRecs.filter((r) => r.priority <= 2).length;
	const brandName = workspace.name;

	return (
		<main className="flex-1 overflow-auto bg-slate-50 p-4 lg:p-6">
			<div className="mx-auto grid max-w-4xl gap-4">
				<header>
					<h1 className="text-2xl font-semibold text-slate-950">
						{isEn ? "GEO Recommendations" : "Recomendaciones GEO"}
					</h1>
					<p className="mt-1 text-sm text-slate-500">
						{isEn
							? `Actions to improve ${brandName}'s visibility in AI search engines.`
							: `Acciones para mejorar la visibilidad de ${brandName} en motores de búsqueda de IA.`}
					</p>
				</header>

				{status.error ? (
					<p className="rounded-md bg-red-50 p-3 text-sm text-red-700">
						{status.error}
					</p>
				) : null}
				{status.imported ? (
					<p className="rounded-md bg-emerald-50 p-3 text-sm text-emerald-700">
						{isEn
							? "Markdown methodology imported."
							: "Metodología markdown importada."}
					</p>
				) : null}
				{status.generated ? (
					<p className="rounded-md bg-emerald-50 p-3 text-sm text-emerald-700">
						{isEn
							? `Generated ${status.generated} recommendations.`
							: `Generadas ${status.generated} recomendaciones.`}
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
						{isEn ? "Recommendation created." : "Recomendación creada."}
					</p>
				) : null}

				<SimpleRecommendationsHeader
					activeCount={activeRecs.length}
					highPriorityCount={highPriorityCount}
					mediumPriorityCount={mediumPriorityCount}
					lowPriorityCount={lowPriorityCount}
					regenerateAction={generateAction}
					importAction={importAction}
					translateAction={translateAction}
					locale={isEn ? "en" : "es"}
				/>

				{activeRecs.length === 0 ? (
					<div className="rounded-md border border-dashed border-slate-300 bg-white p-8 text-center">
						<h2 className="text-lg font-semibold text-slate-950">
							{isEn
								? "No active recommendations yet"
								: "Sin recomendaciones activas"}
						</h2>
						<p className="mt-2 text-sm text-slate-500">
							{isEn
								? "Click Regenerate to create the first batch."
								: "Pulsa Regenerar para crear el primer lote."}
						</p>
					</div>
				) : (
					<ul className="grid gap-3">
						{activeRecs.map((recommendation, index) => {
							const tone = getPriorityTone(recommendation);
							return (
								<li key={recommendation.id}>
									<SimpleRecommendationCard
										categoryLabel={simpleArea(recommendation.category)}
										createTaskAction={createRecommendationTaskAction.bind(
											null,
											workspace.id,
											workspace.slug,
											recommendation,
										)}
										defaultExpanded={index === 0}
										dismissAction={updateRecommendationStatusAction.bind(
											null,
											workspace.slug,
											recommendation.id,
											"dismissed",
										)}
										locale={isEn ? "en" : "es"}
										markDoneAction={updateRecommendationStatusAction.bind(
											null,
											workspace.slug,
											recommendation.id,
											"done",
										)}
										markInProgressAction={startRecommendationTaskAction.bind(
											null,
											workspace.id,
											workspace.slug,
											recommendation,
										)}
										priorityLabel={getPriorityLabel(tone, isEn)}
										priorityTone={tone}
										recommendation={recommendation}
									/>
								</li>
							);
						})}
					</ul>
				)}
			</div>
		</main>
	);
}
