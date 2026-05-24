"use client";

import { BarChart3, Check, Lightbulb, Zap } from "lucide-react";
import { useState } from "react";
import type { AppMode } from "@/lib/preferences";
import { savePreferences } from "@/lib/preferences-client";

const TIERS: {
	mode: AppMode;
	icon: typeof Lightbulb;
	titleEs: string;
	titleEn: string;
	descEs: string;
	descEn: string;
	features: { es: string; en: string }[];
	activeClass: string;
	hoverClass: string;
	iconClass: string;
	badgeClass: string;
}[] = [
	{
		mode: "sme",
		icon: Lightbulb,
		titleEs: "Starter — Pyme",
		titleEn: "Starter — SME",
		descEs: "Vista simplificada y guiada. Ideal para duenos de negocio.",
		descEn: "Simplified, guided view. Ideal for business owners.",
		features: [
			{ es: "Dashboard simplificado", en: "Simplified dashboard" },
			{ es: "Plan de accion", en: "Action plan" },
			{ es: "Fuentes basicas", en: "Basic sources" },
			{ es: "Informes simples", en: "Simple reports" },
		],
		activeClass: "border-teal-500 bg-teal-50 dark:bg-teal-950/30",
		hoverClass:
			"hover:border-teal-300 hover:bg-[var(--surface-subtle)] dark:hover:bg-teal-950/20",
		iconClass:
			"bg-teal-100 text-teal-700 dark:bg-teal-900/50 dark:text-teal-400",
		badgeClass: "text-teal-600 dark:text-teal-400",
	},
	{
		mode: "pro",
		icon: Zap,
		titleEs: "Pro — Freelancer",
		titleEn: "Pro — Freelancer",
		descEs:
			"Metricas ampliadas y gestion de clientes. Para freelancers y agencias pequeñas.",
		descEn:
			"Expanded metrics and client management. For freelancers and small agencies.",
		features: [
			{ es: "Todo lo de Starter", en: "Everything in Starter" },
			{ es: "Competidores y tareas", en: "Competitors and tasks" },
			{ es: "Mas metricas y tendencias", en: "More metrics and trends" },
			{ es: "Plantillas de informes", en: "Report templates" },
		],
		activeClass: "border-indigo-500 bg-indigo-50 dark:bg-indigo-950/30",
		hoverClass:
			"hover:border-indigo-300 hover:bg-[var(--surface-subtle)] dark:hover:bg-indigo-950/20",
		iconClass:
			"bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-400",
		badgeClass: "text-indigo-600 dark:text-indigo-400",
	},
	{
		mode: "agency",
		icon: BarChart3,
		titleEs: "Agency — Agencia",
		titleEn: "Agency — Full",
		descEs:
			"Vista completa con todas las metricas. Para agencias y especialistas en SEO/GEO.",
		descEn: "Full view with all metrics. For agencies and SEO/GEO specialists.",
		features: [
			{ es: "Todo lo de Pro", en: "Everything in Pro" },
			{ es: "Analisis completo de LLMs", en: "Full LLM analysis" },
			{ es: "Reporting multi-audiencia", en: "Multi-audience reporting" },
			{ es: "Configuracion avanzada", en: "Advanced configuration" },
		],
		activeClass: "border-[var(--brand)] bg-[var(--brand-soft)]",
		hoverClass:
			"hover:border-[rgba(244,149,39,0.5)] hover:bg-[var(--surface-subtle)]",
		iconClass: "bg-[var(--brand-deep)] text-[var(--brand)]",
		badgeClass: "text-[var(--brand)]",
	},
];

export function ExperienceModePanel({
	currentMode,
	isEn = false,
}: {
	currentMode: AppMode;
	isEn?: boolean;
}) {
	const [saving, setSaving] = useState(false);

	async function applyMode(next: AppMode) {
		if (next === currentMode) return;
		setSaving(true);
		await savePreferences({ mode: next });
		window.location.reload();
	}

	return (
		<section className="neo-card p-5">
			<h2 className="text-lg font-semibold text-[var(--foreground)]">
				{isEn ? "Experience" : "Experiencia"}
			</h2>
			<p className="mt-1 text-sm text-slate-500">
				{isEn
					? "Choose the view that best fits your workflow. Data stays the same, only the presentation changes."
					: "Elige la vista que mejor se adapta a tu flujo de trabajo. Los datos no cambian, solo la presentacion."}
			</p>
			<div className="mt-5 grid gap-4 lg:grid-cols-3">
				{TIERS.map((tier) => {
					const Icon = tier.icon;
					const isActive = currentMode === tier.mode;
					const title = isEn ? tier.titleEn : tier.titleEs;
					const desc = isEn ? tier.descEn : tier.descEs;
					return (
						<button
							className={`group flex flex-col gap-3 rounded-xl border-2 p-5 text-left transition ${
								isActive
									? tier.activeClass
									: `border-[var(--border)] ${tier.hoverClass}`
							}`}
							disabled={saving}
							key={tier.mode}
							onClick={() => applyMode(tier.mode)}
							type="button"
						>
							<div className="flex items-center gap-3">
								<div
									className={`grid size-10 place-items-center rounded-lg ${tier.iconClass}`}
								>
									<Icon className="size-5" />
								</div>
								<div>
									<p className="font-semibold text-[var(--foreground)]">
										{title}
									</p>
									{isActive ? (
										<span className={`text-xs font-medium ${tier.badgeClass}`}>
											{isEn ? "Active" : "Activo"}
										</span>
									) : null}
								</div>
							</div>
							<p className="text-sm text-slate-500">{desc}</p>
							<ul className="space-y-1">
								{tier.features.map((f) => (
									<li
										className="flex items-center gap-2 text-xs text-[var(--muted)]"
										key={f.es}
									>
										<Check className="size-3 shrink-0 text-[var(--brand)]" />
										{isEn ? f.en : f.es}
									</li>
								))}
							</ul>
						</button>
					);
				})}
			</div>
		</section>
	);
}
