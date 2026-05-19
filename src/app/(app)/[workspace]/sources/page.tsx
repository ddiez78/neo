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

	return (
		<main className="flex-1 overflow-auto p-4 lg:p-6">
			<div className="grid gap-6">
				<div>
					<h1 className="text-2xl font-semibold text-slate-950">Sources</h1>
					<p className="mt-2 text-slate-600">
						URLs y dominios citados por los modelos en las respuestas.
					</p>
				</div>
				<section className="grid gap-4 md:grid-cols-3">
					<div className="neo-card p-4">
						<p className="text-sm text-slate-500">Total sources</p>
						<p className="mt-2 text-3xl font-semibold text-[var(--foreground)]">
							{sources.length}
						</p>
					</div>
					<div className="neo-card p-4">
						<p className="text-sm text-slate-500">Client citations</p>
						<p className="mt-2 text-3xl font-semibold text-[var(--foreground)]">
							{clientSources}
						</p>
					</div>
					<div className="neo-card p-4">
						<p className="text-sm text-slate-500">Competitor citations</p>
						<p className="mt-2 text-3xl font-semibold text-[var(--foreground)]">
							{competitorSources}
						</p>
					</div>
				</section>
				<div className="overflow-hidden rounded-md border border-slate-200 bg-white">
					<table className="w-full min-w-[760px] text-left text-sm">
						<thead className="bg-slate-50 text-xs uppercase text-slate-500">
							<tr>
								<th className="px-4 py-3">Dominio</th>
								<th className="px-4 py-3">Tipo</th>
								<th className="px-4 py-3">URL</th>
								<th className="px-4 py-3">Marca</th>
								<th className="px-4 py-3">Competidores</th>
								<th className="px-4 py-3">Autoridad</th>
							</tr>
						</thead>
						<tbody className="divide-y divide-slate-100">
							{sources.map((source) => (
								<tr key={source.id}>
									<td className="px-4 py-3 font-medium text-slate-950">
										{source.domain}
									</td>
									<td className="px-4 py-3 text-slate-600">
										{source.source_type ?? "unknown"}
									</td>
									<td className="px-4 py-3 text-slate-600">{source.url}</td>
									<td className="px-4 py-3 text-slate-600">
										{source.is_client_domain || source.mentioned_brand
											? "Si"
											: "No"}
									</td>
									<td className="px-4 py-3 text-slate-600">
										{source.mentioned_competitors?.join(", ") || "-"}
									</td>
									<td className="px-4 py-3 text-slate-600">
										{source.authority_score ?? "-"}
									</td>
								</tr>
							))}
						</tbody>
					</table>
					{sources.length === 0 ? (
						<p className="p-6 text-sm text-slate-500">
							Sin fuentes detectadas todavia.
						</p>
					) : null}
				</div>
			</div>
		</main>
	);
}
