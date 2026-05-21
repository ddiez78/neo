import {
	acceptPromptCandidateAction,
	generatePromptCandidatesAction,
	rejectPromptCandidateAction,
} from "@/actions/prompts";
import { getWorkspaceOverview, requireWorkspace } from "@/lib/data/workspace";

export default async function Page({
	params,
	searchParams,
}: {
	params: Promise<{ workspace: string }>;
	searchParams: Promise<{
		error?: string;
		generated?: string;
		accepted?: string;
		rejected?: string;
	}>;
}) {
	const { workspace: slug } = await params;
	const status = await searchParams;
	const workspace = await requireWorkspace(slug);
	const {
		company,
		competitors,
		prompts,
		promptGenerationBatches,
		promptCandidates,
	} = await getWorkspaceOverview(workspace.id);
	const generateAction = generatePromptCandidatesAction.bind(
		null,
		workspace.id,
		workspace.slug,
	);
	const latestBatch = promptGenerationBatches[0];
	const latestCandidates = latestBatch
		? promptCandidates.filter(
				(candidate) => candidate.batch_id === latestBatch.id,
			)
		: promptCandidates;
	const pendingCandidates = latestCandidates.filter(
		(candidate) => candidate.status === "pending",
	);

	return (
		<main className="flex-1 overflow-auto p-4 lg:p-6">
			<div className="grid gap-6">
				<div className="flex flex-wrap items-start justify-between gap-4">
					<div>
						<h1 className="text-2xl font-semibold text-slate-950">
							Prompt Research
						</h1>
						<p className="mt-2 max-w-3xl text-slate-600">
							Pipeline propietario multi-etapa para generar candidatos de
							prompts GEO a partir de marca, mercado, competidores y gaps de
							cobertura.
						</p>
					</div>
					<form action={generateAction}>
						<button
							className="rounded-md bg-slate-950 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
							type="submit"
						>
							Generar candidatos
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
						Generados {status.generated} candidatos.
					</p>
				) : null}
				{status.accepted ? (
					<p className="rounded-md bg-emerald-50 p-3 text-sm text-emerald-700">
						Candidato guardado como prompt activo.
					</p>
				) : null}
				{status.rejected ? (
					<p className="rounded-md bg-slate-100 p-3 text-sm text-slate-700">
						Candidato descartado.
					</p>
				) : null}

				<section className="grid gap-4 lg:grid-cols-4">
					<div className="rounded-md border border-slate-200 bg-white p-4">
						<p className="text-sm text-slate-500">Prompts actuales</p>
						<p className="mt-2 text-3xl font-semibold">{prompts.length}</p>
					</div>
					<div className="rounded-md border border-slate-200 bg-white p-4">
						<p className="text-sm text-slate-500">Competidores</p>
						<p className="mt-2 text-3xl font-semibold">{competitors.length}</p>
					</div>
					<div className="rounded-md border border-cyan-200 bg-cyan-50/50 p-4">
						<p className="text-sm text-cyan-700">Candidatos pendientes</p>
						<p className="mt-2 text-3xl font-semibold text-cyan-950">
							{pendingCandidates.length}
						</p>
					</div>
					<div className="rounded-md border border-slate-200 bg-white p-4">
						<p className="text-sm text-slate-500">Pipeline</p>
						<p className="mt-2 text-sm font-semibold text-slate-950">
							{latestBatch?.pipeline_version ?? "proprietary-v1"}
						</p>
						<p className="mt-1 text-xs text-slate-500">
							{latestBatch?.status ?? "sin ejecuciones"}
						</p>
					</div>
				</section>

				<section className="rounded-md border border-slate-200 bg-white p-5">
					<h2 className="text-lg font-semibold text-slate-950">
						Etapas del pipeline
					</h2>
					<div className="mt-4 grid gap-3 md:grid-cols-3 xl:grid-cols-6">
						{[
							"Context builder",
							"Intent expansion",
							"Multi-model generation",
							"Proprietary refinement",
							"Scoring",
							"Final selection",
						].map((stage, index) => (
							<div
								className="rounded-md border border-slate-200 bg-slate-50 p-3"
								key={stage}
							>
								<p className="text-xs font-semibold uppercase text-cyan-700">
									{index + 1}
								</p>
								<p className="mt-1 text-sm font-semibold text-slate-950">
									{stage}
								</p>
							</div>
						))}
					</div>
				</section>

				<div className="grid gap-4">
					{latestCandidates.map((candidate) => {
						const acceptAction = acceptPromptCandidateAction.bind(
							null,
							workspace.id,
							workspace.slug,
							candidate.id,
						);
						const rejectAction = rejectPromptCandidateAction.bind(
							null,
							workspace.slug,
							candidate.id,
						);

						return (
							<article
								className="rounded-md border border-slate-200 bg-white p-4"
								key={candidate.id}
							>
								<div className="flex flex-wrap items-start justify-between gap-4">
									<div className="min-w-0 flex-1">
										<div className="flex flex-wrap gap-2 text-xs font-semibold uppercase">
											<span className="rounded-md bg-cyan-50 px-2 py-1 text-cyan-700">
												Score {Number(candidate.score).toFixed(0)}
											</span>
											<span className="rounded-md bg-slate-100 px-2 py-1 text-slate-700">
												{candidate.intent}
											</span>
											<span className="rounded-md bg-slate-100 px-2 py-1 text-slate-700">
												{candidate.funnel_stage}
											</span>
											<span className="rounded-md bg-slate-100 px-2 py-1 text-slate-700">
												{candidate.status}
											</span>
										</div>
										<h2 className="mt-3 font-semibold text-slate-950">
											{candidate.title}
										</h2>
										<p className="mt-2 text-sm leading-6 text-slate-600">
											{candidate.body}
										</p>
										<p className="mt-3 text-sm text-slate-500">
											{candidate.rationale}
										</p>
									</div>
									<form action={rejectAction}>
										<button
											className="rounded-md border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
											disabled={candidate.status !== "pending"}
											type="submit"
										>
											Descartar
										</button>
									</form>
								</div>

								<form action={acceptAction} className="mt-4 grid gap-3">
									<input
										className="rounded-md border border-slate-300 px-3 py-2 text-sm"
										defaultValue={candidate.title}
										name="title"
									/>
									<textarea
										className="min-h-20 rounded-md border border-slate-300 px-3 py-2 text-sm"
										defaultValue={candidate.body}
										name="body"
									/>
									<button
										className="w-fit rounded-md bg-slate-950 px-3 py-2 text-sm font-semibold text-white disabled:bg-slate-300"
										disabled={candidate.status !== "pending"}
										type="submit"
									>
										Guardar como prompt
									</button>
								</form>
							</article>
						);
					})}
					{latestCandidates.length === 0 ? (
						<p className="rounded-md border border-dashed border-slate-300 bg-white p-6 text-sm text-slate-500">
							No hay candidatos todavia. Ejecuta el pipeline para generar la
							primera propuesta.
						</p>
					) : null}
				</div>

				{company ? null : (
					<p className="rounded-md bg-amber-50 p-3 text-sm text-amber-800">
						Completa el perfil de empresa para mejorar la calidad del pipeline.
					</p>
				)}
			</div>
		</main>
	);
}
