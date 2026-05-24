import { BookOpen, HelpCircle, Sparkles } from "lucide-react";
import { GLOSSARY } from "@/lib/glossary";
import { getUserPreferences } from "@/lib/preferences-server";

const FAQ_ES = [
	{
		q: "Como funciona neo-geo?",
		a: "Ejecutamos preguntas reales (prompts) contra los principales asistentes de IA (ChatGPT, Claude, Gemini, Perplexity) y medimos si tu marca aparece, en que posicion, con que sentimiento y citando que fuentes. Con esos datos generamos recomendaciones priorizadas.",
	},
	{
		q: "Cuanto tarda en mostrar resultados utiles?",
		a: "Tras configurar tu Company Bio y aprobar 5-10 prompts, los primeros runs tardan menos de 30 minutos. Las tendencias y recomendaciones de calidad empiezan a tener sentido a partir de la primera semana de datos.",
	},
	{
		q: "Que diferencia hay entre Starter, Pro y Agency?",
		a: "Starter: vista simple para duenos de negocio, enfocada en acciones concretas. Pro: anade competidores, tareas y metricas ampliadas para freelancers y agencias pequeñas. Agency: experiencia completa con todas las metricas, reporting multi-audiencia y configuracion avanzada de LLMs.",
	},
	{
		q: "Cada cuanto se actualizan los datos?",
		a: "Por defecto cada 6 horas. Cada prompt activo se ejecuta segun su frecuencia (diaria, semanal o mensual) contra todos los LLMs habilitados.",
	},
	{
		q: "Mis datos son privados?",
		a: "Si. Cada workspace esta aislado y solo el administrador y miembros invitados pueden acceder. No compartimos datos entre clientes.",
	},
];

const FAQ_EN = [
	{
		q: "How does neo-geo work?",
		a: "We run real questions (prompts) against major AI assistants (ChatGPT, Claude, Gemini, Perplexity) and measure if your brand appears, at what position, with what sentiment, citing which sources. From that data we generate prioritized recommendations.",
	},
	{
		q: "How long until I see useful results?",
		a: "After configuring your Company Bio and approving 5-10 prompts, the first runs take less than 30 minutes. Quality trends and recommendations begin making sense after the first week of data.",
	},
	{
		q: "What is the difference between Starter, Pro and Agency?",
		a: "Starter: simple view for business owners focused on concrete actions. Pro: adds competitors, tasks and expanded metrics for freelancers and small agencies. Agency: full experience with all metrics, multi-audience reporting and advanced LLM configuration.",
	},
	{
		q: "How often is data refreshed?",
		a: "By default every 6 hours. Each active prompt runs according to its frequency (daily, weekly, monthly) against all enabled LLMs.",
	},
	{
		q: "Is my data private?",
		a: "Yes. Each workspace is isolated and only the administrator and invited members can access it. We do not share data between clients.",
	},
];

export default async function Page() {
	const prefs = await getUserPreferences();
	const isEn = prefs.locale === "en";
	const faq = isEn ? FAQ_EN : FAQ_ES;
	const glossaryEntries = Object.values(GLOSSARY).sort((a, b) =>
		(isEn ? a.titleEn : a.titleEs).localeCompare(isEn ? b.titleEn : b.titleEs),
	);

	return (
		<main className="flex-1 overflow-auto p-4 pb-24 lg:p-6 lg:pb-8">
			<div className="mx-auto grid max-w-4xl gap-8">
				<section>
					<p className="text-xs font-black uppercase tracking-[0.2em] text-[var(--brand)]">
						{isEn ? "Help Center" : "Centro de ayuda"}
					</p>
					<h1 className="mt-2 text-3xl font-black tracking-[-0.03em] text-[var(--foreground)]">
						{isEn ? "Learn neo-geo" : "Aprende neo-geo"}
					</h1>
					<p className="mt-2 max-w-2xl text-sm text-[var(--muted)]">
						{isEn
							? "Glossary, FAQs and concepts to get the most out of your GEO monitoring."
							: "Glosario, FAQs y conceptos para sacar el maximo partido a tu monitorizacion GEO."}
					</p>
				</section>

				<section className="neo-card p-6">
					<div className="flex items-center gap-3">
						<div className="grid size-10 place-items-center rounded-lg bg-[var(--brand-soft)] text-[var(--brand)]">
							<HelpCircle className="size-5" />
						</div>
						<h2 className="text-xl font-bold text-[var(--foreground)]">
							{isEn ? "Frequently asked" : "Preguntas frecuentes"}
						</h2>
					</div>
					<div className="mt-5 grid gap-3">
						{faq.map((item) => (
							<details
								className="rounded-lg border border-[var(--border)] bg-[var(--surface-subtle)] p-4 transition open:bg-[var(--surface-raised)]"
								key={item.q}
							>
								<summary className="cursor-pointer text-sm font-semibold text-[var(--foreground)]">
									{item.q}
								</summary>
								<p className="mt-2 text-sm leading-relaxed text-[var(--muted)]">
									{item.a}
								</p>
							</details>
						))}
					</div>
				</section>

				<section className="neo-card p-6" id="glosario">
					<div className="flex items-center gap-3">
						<div className="grid size-10 place-items-center rounded-lg bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-400">
							<BookOpen className="size-5" />
						</div>
						<h2 className="text-xl font-bold text-[var(--foreground)]">
							{isEn ? "GEO Glossary" : "Glosario GEO"}
						</h2>
					</div>
					<p className="mt-2 text-sm text-[var(--muted)]">
						{isEn
							? `${glossaryEntries.length} terms used across the product.`
							: `${glossaryEntries.length} terminos usados en el producto.`}
					</p>
					<div className="mt-5 grid gap-3 md:grid-cols-2">
						{glossaryEntries.map((entry) => (
							<div
								className="rounded-lg border border-[var(--border)] bg-[var(--surface-subtle)] p-4"
								key={entry.term}
							>
								<p className="text-sm font-semibold text-[var(--foreground)]">
									{isEn ? entry.titleEn : entry.titleEs}
								</p>
								<p className="mt-1.5 text-xs leading-relaxed text-[var(--muted)]">
									{isEn ? entry.descEn : entry.descEs}
								</p>
							</div>
						))}
					</div>
				</section>

				<section className="rounded-xl border border-indigo-200 bg-indigo-50 p-6 dark:border-indigo-800/50 dark:bg-indigo-950/30">
					<div className="flex items-start gap-4">
						<div className="grid size-10 shrink-0 place-items-center rounded-lg bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-400">
							<Sparkles className="size-5" />
						</div>
						<div>
							<h2 className="text-base font-bold text-indigo-900 dark:text-indigo-200">
								{isEn ? "Need more help?" : "Necesitas mas ayuda?"}
							</h2>
							<p className="mt-1 text-sm text-indigo-700 dark:text-indigo-300">
								{isEn
									? "Hover any icon labelled with ℹ in the product to see contextual definitions, or contact support."
									: "Pasa el raton sobre cualquier icono marcado con ℹ en el producto para ver definiciones contextuales, o contacta con soporte."}
							</p>
						</div>
					</div>
				</section>
			</div>
		</main>
	);
}
