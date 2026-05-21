import { Globe2, Radio, ShieldCheck, SignalHigh } from "lucide-react";
import { getWorkspaceOverview, requireWorkspace } from "@/lib/data/workspace";

export default async function Page({
	params,
}: {
	params: Promise<{ workspace: string }>;
}) {
	const { workspace: slug } = await params;
	const workspace = await requireWorkspace(slug);
	const { sources } = await getWorkspaceOverview(workspace.id);
	const clientSources = sources.filter(
		(source) => source.is_client_domain,
	).length;
	const competitorSources = sources.filter(
		(source) => source.is_competitor_domain,
	).length;
	const authorityAverage = sources.length
		? Math.round(
				sources.reduce(
					(sum, source) => sum + Number(source.authority_score ?? 0),
					0,
				) / sources.length,
			)
		: 0;

	const stats = [
		{ label: "Total sources", value: sources.length, icon: Globe2 },
		{ label: "Client citations", value: clientSources, icon: ShieldCheck },
		{ label: "Competitor citations", value: competitorSources, icon: Radio },
		{ label: "Authority avg.", value: authorityAverage, icon: SignalHigh },
	];

	return (
		<main className="flex-1 overflow-auto p-4 pb-24 lg:p-6 lg:pb-8">
			<div className="mx-auto grid max-w-[1440px] gap-6">
				<section>
					<p className="text-xs font-black uppercase tracking-[0.2em] text-[var(--brand)]">
						Intelligence Sources
					</p>
					<h1 className="mt-2 text-3xl font-black tracking-[-0.03em] text-[var(--foreground)]">
						Validated Citation Network
					</h1>
					<p className="mt-2 max-w-3xl text-sm text-[var(--muted)]">
						URLs y dominios citados por los modelos. Esta vista ayuda a ver que
						fuentes alimentan la visibilidad de la marca y donde aparecen
						competidores.
					</p>
				</section>

				<section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
					{stats.map((stat) => {
						const Icon = stat.icon;
						return (
							<div className="neo-card p-4" key={stat.label}>
								<div className="flex items-start justify-between gap-3">
									<div>
										<p className="text-[11px] font-black uppercase tracking-[0.14em] text-[var(--muted)]">
											{stat.label}
										</p>
										<p className="mt-3 text-4xl font-black tracking-[-0.04em] text-[var(--foreground)]">
											{stat.value}
										</p>
									</div>
									<div className="grid size-10 place-items-center rounded-lg border border-[rgba(244,149,39,0.24)] bg-[var(--brand-soft)] text-[var(--brand)]">
										<Icon className="size-5" />
									</div>
								</div>
							</div>
						);
					})}
				</section>

				<section className="neo-card overflow-hidden">
					<div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--border)] px-4 py-3">
						<div>
							<h2 className="text-lg font-bold text-[var(--foreground)]">
								Active Data Feeds
							</h2>
							<p className="text-xs text-[var(--muted)]">
								Monitoring citation telemetry from model answers.
							</p>
						</div>
						<span className="rounded-lg border border-[var(--border)] bg-[var(--surface-subtle)] px-3 py-1 text-xs font-black uppercase tracking-[0.08em] text-[var(--brand)]">
							{sources.length} feeds
						</span>
					</div>
					<div className="overflow-x-auto">
						<table className="w-full min-w-[860px] text-left text-sm">
							<thead className="bg-[var(--background)] text-[10px] font-black uppercase tracking-[0.14em] text-[var(--muted)]">
								<tr>
									<th className="px-4 py-3">Dominio</th>
									<th className="px-4 py-3">Tipo</th>
									<th className="px-4 py-3">URL</th>
									<th className="px-4 py-3">Marca</th>
									<th className="px-4 py-3">Competidores</th>
									<th className="px-4 py-3">Autoridad</th>
								</tr>
							</thead>
							<tbody className="divide-y divide-[var(--border)]">
								{sources.map((source) => (
									<tr
										className="transition hover:bg-[rgba(244,149,39,0.04)]"
										key={source.id}
									>
										<td className="px-4 py-3 font-bold text-[var(--foreground)]">
											{source.domain}
										</td>
										<td className="px-4 py-3 text-[var(--muted)]">
											{source.source_type ?? "unknown"}
										</td>
										<td className="max-w-sm truncate px-4 py-3 text-[var(--muted)]">
											{source.url}
										</td>
										<td className="px-4 py-3">
											<span
												className={
													source.is_client_domain || source.mentioned_brand
														? "text-[var(--success)]"
														: "text-[var(--muted)]"
												}
											>
												{source.is_client_domain || source.mentioned_brand
													? "Si"
													: "No"}
											</span>
										</td>
										<td className="px-4 py-3 text-[var(--muted)]">
											{source.mentioned_competitors?.join(", ") || "-"}
										</td>
										<td className="px-4 py-3 font-mono text-xs text-[var(--brand)]">
											{source.authority_score ?? "-"}
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
					{sources.length === 0 ? (
						<p className="p-6 text-sm text-[var(--muted)]">
							Sin fuentes detectadas todavia.
						</p>
					) : null}
				</section>
			</div>
		</main>
	);
}
