import { ArrowRight, CheckCircle2, Circle } from "lucide-react";
import Link from "next/link";

export type SetupChecklistStatus = {
	companyConfigured: boolean;
	competitorsAdded: boolean;
	llmsActive: boolean;
	promptsCreated: boolean;
	runsExecuted: boolean;
};

export function getSetupCompleteness(status: SetupChecklistStatus): number {
	const total = 5;
	const done =
		(status.companyConfigured ? 1 : 0) +
		(status.competitorsAdded ? 1 : 0) +
		(status.llmsActive ? 1 : 0) +
		(status.promptsCreated ? 1 : 0) +
		(status.runsExecuted ? 1 : 0);
	return Math.round((done / total) * 100);
}

export function SetupChecklist({
	status,
	workspaceSlug,
	isEn,
}: {
	status: SetupChecklistStatus;
	workspaceSlug: string;
	isEn: boolean;
}) {
	const completeness = getSetupCompleteness(status);
	if (completeness === 100) return null;

	const steps: {
		key: string;
		done: boolean;
		labelEs: string;
		labelEn: string;
		descEs: string;
		descEn: string;
		href: string;
		ctaEs: string;
		ctaEn: string;
	}[] = [
		{
			key: "company",
			done: status.companyConfigured,
			labelEs: "Define tu marca",
			labelEn: "Define your brand",
			descEs: "Rellena el Company Bio para que la IA entienda tu negocio.",
			descEn: "Fill the Company Bio so AI understands your business.",
			href: `/${workspaceSlug}/company-bio`,
			ctaEs: "Configurar",
			ctaEn: "Configure",
		},
		{
			key: "competitors",
			done: status.competitorsAdded,
			labelEs: "Anade competidores",
			labelEn: "Add competitors",
			descEs: "Sin competidores no hay benchmark de Share of Voice.",
			descEn: "Without competitors there is no Share of Voice benchmark.",
			href: `/${workspaceSlug}/competitors`,
			ctaEs: "Anadir",
			ctaEn: "Add",
		},
		{
			key: "llms",
			done: status.llmsActive,
			labelEs: "Activa al menos un LLM",
			labelEn: "Enable at least one LLM",
			descEs:
				"Elige ChatGPT, Claude, Gemini o Perplexity para ejecutar prompts.",
			descEn:
				"Choose ChatGPT, Claude, Gemini or Perplexity to execute prompts.",
			href: `/${workspaceSlug}/settings#providers`,
			ctaEs: "Activar",
			ctaEn: "Enable",
		},
		{
			key: "prompts",
			done: status.promptsCreated,
			labelEs: "Crea tus primeros prompts",
			labelEn: "Create your first prompts",
			descEs: "Prompts reales que tus clientes hacen a la IA.",
			descEn: "Real questions your customers ask AI.",
			href: `/${workspaceSlug}/prompts`,
			ctaEs: "Crear",
			ctaEn: "Create",
		},
		{
			key: "runs",
			done: status.runsExecuted,
			labelEs: "Ejecuta tu primer analisis",
			labelEn: "Run your first analysis",
			descEs: "Lanza tus prompts contra los LLMs activos para empezar a medir.",
			descEn: "Run your prompts against active LLMs to start measuring.",
			href: `/${workspaceSlug}/prompts`,
			ctaEs: "Ejecutar",
			ctaEn: "Run",
		},
	];

	const completedCount = steps.filter((s) => s.done).length;
	const nextStep = steps.find((s) => !s.done);

	return (
		<section className="neo-card overflow-hidden p-0">
			<div className="border-b border-[var(--border)] bg-[var(--surface-subtle)] px-5 py-4">
				<div className="flex flex-wrap items-center justify-between gap-3">
					<div>
						<p className="text-xs font-black uppercase tracking-[0.16em] text-[var(--brand)]">
							{isEn ? "Setup" : "Configuracion"}
						</p>
						<h2 className="mt-1 text-lg font-bold text-[var(--foreground)]">
							{isEn ? "Get your workspace ready" : "Configura tu workspace"}
						</h2>
					</div>
					<div className="flex items-center gap-3">
						<span className="text-sm font-semibold text-[var(--muted)]">
							{completedCount}/5
						</span>
						<div className="relative h-2 w-24 overflow-hidden rounded-full bg-[var(--border)]">
							<div
								className="h-full rounded-full bg-[var(--brand)] transition-all duration-500"
								style={{ width: `${completeness}%` }}
							/>
						</div>
						<span className="text-sm font-black text-[var(--foreground)]">
							{completeness}%
						</span>
					</div>
				</div>
			</div>
			<ul className="divide-y divide-[var(--border)]">
				{steps.map((step) => {
					const Icon = step.done ? CheckCircle2 : Circle;
					const isNext = !step.done && step === nextStep;
					return (
						<li
							className={`flex items-center gap-4 px-5 py-3.5 transition ${
								isNext ? "bg-[var(--brand-soft)]/30" : ""
							}`}
							key={step.key}
						>
							<Icon
								className={`size-5 shrink-0 ${
									step.done
										? "text-emerald-500"
										: isNext
											? "text-[var(--brand)]"
											: "text-[var(--muted)]"
								}`}
							/>
							<div className="min-w-0 flex-1">
								<p
									className={`text-sm font-semibold ${
										step.done
											? "text-[var(--muted)] line-through"
											: "text-[var(--foreground)]"
									}`}
								>
									{isEn ? step.labelEn : step.labelEs}
								</p>
								{!step.done ? (
									<p className="mt-0.5 text-xs text-[var(--muted)]">
										{isEn ? step.descEn : step.descEs}
									</p>
								) : null}
							</div>
							{!step.done ? (
								<Link
									className={`inline-flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition ${
										isNext
											? "bg-[var(--brand)] text-[#1b1000] hover:brightness-110"
											: "border border-[var(--border)] text-[var(--foreground)] hover:border-[var(--brand)]"
									}`}
									href={step.href}
								>
									{isEn ? step.ctaEn : step.ctaEs}
									<ArrowRight className="size-3" />
								</Link>
							) : null}
						</li>
					);
				})}
			</ul>
		</section>
	);
}
