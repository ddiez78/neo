import { ArrowRight, Sparkles } from "lucide-react";
import { applySectorTemplateAction } from "@/actions/templates";
import { LockedFeature } from "@/components/ui/LockedFeature";
import { requireWorkspace } from "@/lib/data/workspace";
import { getUserPreferences } from "@/lib/preferences-server";
import { SECTOR_TEMPLATES } from "@/lib/templates/sectors";
import { hasAccess } from "@/lib/tiers";

export default async function Page({
	params,
	searchParams,
}: {
	params: Promise<{ workspace: string }>;
	searchParams: Promise<{
		applied?: string;
		competitors?: string;
		error?: string;
	}>;
}) {
	const { workspace: slug } = await params;
	const status = await searchParams;
	const workspace = await requireWorkspace(slug);
	const prefs = await getUserPreferences();
	const isEn = prefs.locale === "en";

	if (!hasAccess(prefs.mode, "templates")) {
		return <LockedFeature feature="templates" isEn={isEn} />;
	}

	return (
		<main className="flex-1 overflow-auto p-4 pb-24 lg:p-6 lg:pb-8">
			<div className="mx-auto grid max-w-5xl gap-6">
				<section>
					<p className="text-xs font-black uppercase tracking-[0.2em] text-[var(--brand)]">
						Templates
					</p>
					<h1 className="mt-2 text-3xl font-black tracking-[-0.03em] text-[var(--foreground)]">
						{isEn ? "Quick start by sector" : "Empieza rapido por sector"}
					</h1>
					<p className="mt-2 max-w-2xl text-sm text-[var(--muted)]">
						{isEn
							? "Pick a template that matches your business. We will create the first prompts and suggest competitors automatically."
							: "Elige una plantilla que encaje con tu negocio. Crearemos los primeros prompts y sugeriremos competidores automaticamente."}
					</p>
				</section>

				{status.applied ? (
					<div className="rounded-lg border border-emerald-300 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 dark:border-emerald-900/50 dark:bg-emerald-950/30 dark:text-emerald-300">
						{isEn
							? `✓ Applied: ${status.applied} prompts created${status.competitors ? `, ${status.competitors} competitors added` : ""}.`
							: `✓ Aplicada: ${status.applied} prompts creados${status.competitors ? `, ${status.competitors} competidores anadidos` : ""}.`}
					</div>
				) : null}
				{status.error ? (
					<div className="rounded-lg border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700">
						{status.error}
					</div>
				) : null}

				<section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
					{SECTOR_TEMPLATES.map((template) => {
						const apply = applySectorTemplateAction.bind(
							null,
							workspace.id,
							workspace.slug,
						);
						return (
							<article
								className="neo-card flex flex-col gap-3 p-5"
								key={template.id}
							>
								<div className="flex items-start justify-between">
									<span className="text-3xl">{template.emoji}</span>
									<span className="rounded-full bg-[var(--surface-subtle)] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[var(--muted)]">
										{template.industry}
									</span>
								</div>
								<div>
									<h3 className="text-base font-bold text-[var(--foreground)]">
										{isEn ? template.nameEn : template.nameEs}
									</h3>
									<p className="mt-1 text-xs text-[var(--muted)]">
										{isEn ? template.descEn : template.descEs}
									</p>
								</div>
								<div className="flex flex-wrap gap-1 text-[10px]">
									<span className="rounded-full bg-[var(--surface-subtle)] px-2 py-0.5 font-bold text-[var(--muted)]">
										{template.prompts.length} prompts
									</span>
									<span className="rounded-full bg-[var(--surface-subtle)] px-2 py-0.5 font-bold text-[var(--muted)]">
										{template.competitorExamples.length}{" "}
										{isEn ? "competitors" : "competidores"}
									</span>
								</div>
								<details className="text-xs text-[var(--muted)]">
									<summary className="cursor-pointer font-semibold">
										{isEn ? "Preview prompts" : "Ver prompts"}
									</summary>
									<ul className="mt-2 space-y-1">
										{template.prompts.slice(0, 4).map((p) => (
											<li className="flex items-start gap-1.5" key={p.body}>
												<ArrowRight className="mt-1 size-2.5 shrink-0 text-[var(--brand)]" />
												<span className="line-clamp-2">{p.body}</span>
											</li>
										))}
										{template.prompts.length > 4 ? (
											<li className="text-[var(--muted)]">
												... +{template.prompts.length - 4}{" "}
												{isEn ? "more" : "mas"}
											</li>
										) : null}
									</ul>
								</details>
								<form action={apply} className="mt-auto pt-2">
									<input name="templateId" type="hidden" value={template.id} />
									<button
										className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[var(--brand)] px-3 py-2 text-sm font-bold text-[#1b1000] transition hover:brightness-110"
										type="submit"
									>
										<Sparkles className="size-4" />
										{isEn ? "Apply template" : "Aplicar plantilla"}
									</button>
								</form>
							</article>
						);
					})}
				</section>
			</div>
		</main>
	);
}
