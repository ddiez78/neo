import { Plus, Radar, ShieldAlert, TrendingUp } from "lucide-react";
import { createCompetitorAction } from "@/actions/competitors";
import { getWorkspaceOverview, requireWorkspace } from "@/lib/data/workspace";

export default async function Page({
	params,
	searchParams,
}: {
	params: Promise<{ workspace: string }>;
	searchParams: Promise<{ error?: string; saved?: string }>;
}) {
	const { workspace: slug } = await params;
	const status = await searchParams;
	const workspace = await requireWorkspace(slug);
	const { competitors, runs } = await getWorkspaceOverview(workspace.id);
	const action = createCompetitorAction.bind(
		null,
		workspace.id,
		workspace.slug,
	);
	const totalMentions = competitors.reduce(
		(sum, competitor) =>
			sum +
			runs.filter((run) => run.competitors_mentioned?.includes(competitor.name))
				.length,
		0,
	);

	return (
		<main className="flex-1 overflow-auto p-4 pb-24 lg:p-6 lg:pb-8">
			<div className="mx-auto grid max-w-[1440px] gap-6">
				<section className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
					<div>
						<p className="text-xs font-black uppercase tracking-[0.2em] text-[var(--brand)]">
							Competitor Intelligence
						</p>
						<h1 className="mt-2 text-3xl font-black tracking-[-0.03em] text-[var(--foreground)]">
							Competitive Analysis Matrix
						</h1>
						<p className="mt-2 max-w-3xl text-sm text-[var(--muted)]">
							Marcas rivales comparadas por presencia en respuestas, menciones y
							presión competitiva dentro de LLMs.
						</p>
					</div>
					<div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
						<Metric label="Competidores" value={competitors.length} />
						<Metric label="Menciones" value={totalMentions} />
						<Metric label="Runs" value={runs.length} />
					</div>
				</section>

				{status.error ? (
					<p className="rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-[#ffb4ab]">
						{status.error}
					</p>
				) : null}

				<form
					action={action}
					className="neo-card grid gap-4 p-5 lg:grid-cols-[1fr_1fr_1fr_auto]"
				>
					<input name="name" placeholder="Competidor" required />
					<input name="domain" placeholder="competidor.com" />
					<input name="aliases" placeholder="aliases separados por coma" />
					<button
						className="inline-flex items-center justify-center gap-2 rounded-lg bg-[var(--brand)] px-4 py-2 text-sm font-black text-[#1b1000] transition hover:brightness-110"
						type="submit"
					>
						<Plus className="size-4" />
						Anadir
					</button>
				</form>

				<section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
					{competitors.map((competitor) => {
						const mentions = runs.filter((run) =>
							run.competitors_mentioned?.includes(competitor.name),
						).length;
						const pressure = runs.length
							? Math.round((mentions / runs.length) * 100)
							: 0;
						return (
							<article className="neo-card p-4" key={competitor.id}>
								<div className="flex items-start justify-between gap-3">
									<div className="min-w-0">
										<div className="mb-3 grid size-10 place-items-center rounded-lg border border-[rgba(244,149,39,0.24)] bg-[var(--brand-soft)] text-[var(--brand)]">
											<Radar className="size-5" />
										</div>
										<h2 className="truncate text-lg font-black text-[var(--foreground)]">
											{competitor.name}
										</h2>
										<p className="mt-1 text-sm text-[var(--muted)]">
											{competitor.domain || "Sin dominio"}
										</p>
									</div>
									<span className="rounded-lg border border-[var(--border)] bg-[var(--surface-subtle)] px-2 py-1 text-xs font-black uppercase text-[var(--brand)]">
										{mentions} menciones
									</span>
								</div>
								<div className="mt-5 grid gap-2">
									<div className="flex items-center justify-between text-xs font-semibold uppercase tracking-[0.08em] text-[var(--muted)]">
										<span>Competitive pressure</span>
										<span className="text-[var(--brand)]">{pressure}%</span>
									</div>
									<div className="h-2 overflow-hidden rounded-full bg-[var(--background)]">
										<div
											className="h-full rounded-full bg-[var(--brand)]"
											style={{ width: `${Math.max(5, pressure)}%` }}
										/>
									</div>
								</div>
								<p className="mt-4 text-sm leading-6 text-[var(--muted)]">
									{competitor.aliases?.join(", ") || "Sin aliases"}
								</p>
								<div className="mt-4 flex items-center gap-2 text-xs text-[var(--muted)]">
									{pressure >= 35 ? (
										<ShieldAlert className="size-4 text-[#ffb4ab]" />
									) : (
										<TrendingUp className="size-4 text-[var(--success)]" />
									)}
									{pressure >= 35 ? "Amenaza activa" : "Monitorizacion estable"}
								</div>
							</article>
						);
					})}
				</section>
			</div>
		</main>
	);
}

function Metric({ label, value }: { label: string; value: number }) {
	return (
		<div className="neo-card min-w-28 p-3 text-right">
			<p className="text-[10px] font-black uppercase tracking-[0.12em] text-[var(--muted)]">
				{label}
			</p>
			<p className="mt-1 text-2xl font-black text-[var(--foreground)]">
				{value}
			</p>
		</div>
	);
}
