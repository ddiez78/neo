import { LlmConfigPanel } from "@/components/workspace/LlmConfigPanel";
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
	const { llmConfigs } = await getWorkspaceOverview(workspace.id);

	return (
		<main className="flex-1 overflow-auto p-4 lg:p-6">
			<div className="grid gap-6">
				<div>
					<h1 className="text-2xl font-semibold text-slate-950">Settings</h1>
					<p className="mt-2 text-slate-600">
						Configuracion general, modelos activos y limites de ejecucion.
					</p>
				</div>
				{status.error ? (
					<p className="rounded-md bg-red-50 p-3 text-sm text-red-700">
						{status.error}
					</p>
				) : null}
				{status.saved ? (
					<p className="rounded-md bg-emerald-50 p-3 text-sm text-emerald-700">
						Configuracion guardada.
					</p>
				) : null}
				<section className="rounded-md border border-slate-200 bg-white p-4">
					<h2 className="font-semibold text-slate-950">Workspace</h2>
					<div className="mt-4 grid gap-3 text-sm text-slate-600 md:grid-cols-4">
						<p>
							<span className="block font-medium text-slate-950">Nombre</span>
							{workspace.name}
						</p>
						<p>
							<span className="block font-medium text-slate-950">Slug</span>
							{workspace.slug}
						</p>
						<p>
							<span className="block font-medium text-slate-950">Idioma</span>
							{workspace.locale}
						</p>
						<p>
							<span className="block font-medium text-slate-950">
								Zona horaria
							</span>
							{workspace.timezone}
						</p>
					</div>
				</section>
				<section>
					<h2 className="mb-3 font-semibold text-slate-950">LLM providers</h2>
					<LlmConfigPanel
						configs={llmConfigs}
						workspaceId={workspace.id}
						workspaceSlug={workspace.slug}
					/>
				</section>
			</div>
		</main>
	);
}
