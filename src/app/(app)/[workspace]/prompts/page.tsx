import { createPromptAction, runPromptAction } from "@/actions/prompts";
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
	const { prompts, llmConfigs, rankings } = await getWorkspaceOverview(
		workspace.id,
	);
	const createAction = createPromptAction.bind(
		null,
		workspace.id,
		workspace.slug,
	);
	const activeConfig =
		llmConfigs.find((config) => config.enabled) ?? llmConfigs[0];

	return (
		<main className="flex-1 overflow-auto p-4 lg:p-6">
			<div className="grid gap-6">
				<div>
					<h1 className="text-2xl font-semibold text-slate-950">Prompts</h1>
					<p className="mt-2 text-slate-600">
						Preguntas que se ejecutan contra modelos para medir presencia de
						marca.
					</p>
				</div>
				{status.error ? (
					<p className="rounded-md bg-red-50 p-3 text-sm text-red-700">
						{status.error}
					</p>
				) : null}
				{status.saved ? (
					<p className="rounded-md bg-emerald-50 p-3 text-sm text-emerald-700">
						Prompt guardado.
					</p>
				) : null}
				<form
					action={createAction}
					className="grid gap-4 rounded-md border border-slate-200 bg-white p-5"
				>
					<div className="grid gap-4 lg:grid-cols-[1fr_180px_160px]">
						<label className="grid gap-2 text-sm font-medium text-slate-700">
							Titulo
							<input
								className="rounded-md border border-slate-300 px-3 py-2"
								name="title"
								required
							/>
						</label>
						<label className="grid gap-2 text-sm font-medium text-slate-700">
							Prioridad
							<input
								className="rounded-md border border-slate-300 px-3 py-2"
								defaultValue="3"
								max="5"
								min="1"
								name="priority"
								type="number"
							/>
						</label>
						<label className="grid gap-2 text-sm font-medium text-slate-700">
							Frecuencia
							<input
								className="rounded-md border border-slate-300 px-3 py-2"
								defaultValue="daily"
								name="frequency"
							/>
						</label>
					</div>
					<label className="grid gap-2 text-sm font-medium text-slate-700">
						Prompt
						<textarea
							className="min-h-24 rounded-md border border-slate-300 px-3 py-2"
							name="body"
							required
						/>
					</label>
					<div className="flex flex-wrap gap-4 text-sm text-slate-700">
						{["chatgpt", "claude", "gemini", "perplexity", "deepseek"].map(
							(provider) => (
								<label className="flex items-center gap-2" key={provider}>
									<input
										defaultChecked={provider === "chatgpt"}
										name="providers"
										type="checkbox"
										value={provider}
									/>
									{provider}
								</label>
							),
						)}
					</div>
					<label className="grid gap-2 text-sm font-medium text-slate-700">
						Tags
						<input
							className="rounded-md border border-slate-300 px-3 py-2"
							name="tags"
							placeholder="awareness, pricing, alternatives"
						/>
					</label>
					<button
						className="w-fit rounded-md bg-slate-950 px-4 py-2 text-sm font-semibold text-white"
						type="submit"
					>
						Crear prompt
					</button>
				</form>
				<div className="grid gap-3">
					{prompts.map((prompt) => {
						const ranking = rankings.find(
							(item) => item.prompt_id === prompt.id,
						);
						const runAction = runPromptAction.bind(
							null,
							workspace.id,
							workspace.slug,
							prompt.id,
						);
						return (
							<article
								className="rounded-md border border-slate-200 bg-white p-4"
								key={prompt.id}
							>
								<div className="flex flex-wrap items-start justify-between gap-3">
									<div>
										<h2 className="font-semibold text-slate-950">
											{prompt.title}
										</h2>
										<p className="mt-1 max-w-3xl text-sm text-slate-600">
											{prompt.body}
										</p>
										<p className="mt-3 text-xs uppercase text-slate-400">
											{prompt.status} · prioridad {prompt.priority} ·{" "}
											{prompt.frequency}
										</p>
										<div className="mt-3 flex flex-wrap gap-2 text-xs font-semibold uppercase">
											<span className="rounded-md bg-slate-100 px-2 py-1 text-slate-700">
												{ranking?.brand_mentioned
													? "brand visible"
													: "brand missing"}
											</span>
											<span className="rounded-md bg-slate-100 px-2 py-1 text-slate-700">
												pos {ranking?.brand_position ?? "-"}
											</span>
											<span className="rounded-md bg-slate-100 px-2 py-1 text-slate-700">
												score{" "}
												{Number(ranking?.visibility_score ?? 0).toFixed(0)}
											</span>
											<span className="rounded-md bg-slate-100 px-2 py-1 text-slate-700">
												{ranking?.sentiment ?? "no_data"}
											</span>
										</div>
									</div>
									<form action={runAction}>
										<input
											name="provider"
											type="hidden"
											value={activeConfig?.provider ?? "chatgpt"}
										/>
										<input
											name="model"
											type="hidden"
											value={activeConfig?.model ?? "mock-geo"}
										/>
										<input name="body" type="hidden" value={prompt.body} />
										<button
											className="rounded-md bg-cyan-700 px-3 py-2 text-sm font-semibold text-white"
											type="submit"
										>
											Ejecutar
										</button>
									</form>
								</div>
							</article>
						);
					})}
					{prompts.length === 0 ? (
						<p className="rounded-md border border-dashed border-slate-300 bg-white p-6 text-sm text-slate-500">
							Sin prompts todavia.
						</p>
					) : null}
				</div>
			</div>
		</main>
	);
}
