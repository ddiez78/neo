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

	return (
		<main className="flex-1 overflow-auto p-4 lg:p-6">
			<div className="grid gap-6">
				<div>
					<h1 className="text-2xl font-semibold text-slate-950">Competitors</h1>
					<p className="mt-2 text-slate-600">
						Marcas rivales que se comparan en menciones, share of voice y
						fuentes.
					</p>
				</div>
				{status.error ? (
					<p className="rounded-md bg-red-50 p-3 text-sm text-red-700">
						{status.error}
					</p>
				) : null}
				<form
					action={action}
					className="grid gap-4 rounded-md border border-slate-200 bg-white p-5 lg:grid-cols-[1fr_1fr_1fr_auto]"
				>
					<input
						className="rounded-md border border-slate-300 px-3 py-2"
						name="name"
						placeholder="Competidor"
						required
					/>
					<input
						className="rounded-md border border-slate-300 px-3 py-2"
						name="domain"
						placeholder="competidor.com"
					/>
					<input
						className="rounded-md border border-slate-300 px-3 py-2"
						name="aliases"
						placeholder="aliases separados por coma"
					/>
					<button
						className="rounded-md bg-slate-950 px-4 py-2 text-sm font-semibold text-white"
						type="submit"
					>
						Anadir
					</button>
				</form>
				<div className="grid gap-3 md:grid-cols-2">
					{competitors.map((competitor) => {
						const mentions = runs.filter((run) =>
							run.competitors_mentioned?.includes(competitor.name),
						).length;
						return (
							<article
								className="rounded-md border border-slate-200 bg-white p-4"
								key={competitor.id}
							>
								<div className="flex items-start justify-between gap-3">
									<div>
										<h2 className="font-semibold text-slate-950">
											{competitor.name}
										</h2>
										<p className="mt-1 text-sm text-slate-500">
											{competitor.domain || "Sin dominio"}
										</p>
									</div>
									<span className="rounded-md bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-700">
										{mentions} menciones
									</span>
								</div>
								<p className="mt-3 text-sm text-slate-600">
									{competitor.aliases?.join(", ") || "Sin aliases"}
								</p>
							</article>
						);
					})}
				</div>
			</div>
		</main>
	);
}
