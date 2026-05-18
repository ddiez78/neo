import { createPromptAction } from "@/actions/prompts";
import { getWorkspaceOverview, requireWorkspace } from "@/lib/data/workspace";

const categories = [
	"alternativas",
	"comparativas",
	"precio",
	"mejor proveedor",
	"casos de uso",
	"riesgos",
];

export default async function Page({
	params,
}: {
	params: Promise<{ workspace: string }>;
}) {
	const { workspace: slug } = await params;
	const workspace = await requireWorkspace(slug);
	const { company, competitors, prompts } = await getWorkspaceOverview(
		workspace.id,
	);
	const action = createPromptAction.bind(null, workspace.id, workspace.slug);
	const brand = company?.brand_name ?? workspace.name;
	const generated = categories.map((category) => ({
		title: `${brand} · ${category}`,
		body: `Que herramientas deberia evaluar una empresa que busca ${category} en ${company?.markets?.[0] ?? "su mercado"}? Incluye ${brand} si es relevante y compara con alternativas.`,
	}));

	return (
		<main className="flex-1 overflow-auto p-4 lg:p-6">
			<div className="grid gap-6">
				<div>
					<h1 className="text-2xl font-semibold text-slate-950">
						Prompt Research
					</h1>
					<p className="mt-2 text-slate-600">
						Candidatos generados desde el perfil de marca, competidores y gaps
						de cobertura.
					</p>
				</div>
				<div className="grid gap-4 lg:grid-cols-3">
					<div className="rounded-md border border-slate-200 bg-white p-4">
						<p className="text-sm text-slate-500">Prompts actuales</p>
						<p className="mt-2 text-3xl font-semibold">{prompts.length}</p>
					</div>
					<div className="rounded-md border border-slate-200 bg-white p-4">
						<p className="text-sm text-slate-500">Competidores</p>
						<p className="mt-2 text-3xl font-semibold">{competitors.length}</p>
					</div>
					<div className="rounded-md border border-slate-200 bg-white p-4">
						<p className="text-sm text-slate-500">Gaps sugeridos</p>
						<p className="mt-2 text-3xl font-semibold">{generated.length}</p>
					</div>
				</div>
				<div className="grid gap-3">
					{generated.map((candidate) => (
						<form
							action={action}
							className="rounded-md border border-slate-200 bg-white p-4"
							key={candidate.title}
						>
							<input name="title" type="hidden" value={candidate.title} />
							<input name="body" type="hidden" value={candidate.body} />
							<input name="priority" type="hidden" value="3" />
							<input name="frequency" type="hidden" value="weekly" />
							<input name="providers" type="hidden" value="chatgpt" />
							<input name="tags" type="hidden" value="research, generated" />
							<h2 className="font-semibold text-slate-950">
								{candidate.title}
							</h2>
							<p className="mt-2 text-sm text-slate-600">{candidate.body}</p>
							<button
								className="mt-4 rounded-md bg-slate-950 px-3 py-2 text-sm font-semibold text-white"
								type="submit"
							>
								Guardar candidato
							</button>
						</form>
					))}
				</div>
			</div>
		</main>
	);
}
