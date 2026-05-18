import { upsertCompanyProfileAction } from "@/actions/workspace";
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
	const { company } = await getWorkspaceOverview(workspace.id);
	const action = upsertCompanyProfileAction.bind(
		null,
		workspace.id,
		workspace.slug,
	);

	return (
		<main className="flex-1 overflow-auto p-4 lg:p-6">
			<div className="max-w-4xl">
				<h1 className="text-2xl font-semibold text-slate-950">Company Bio</h1>
				<p className="mt-2 text-slate-600">
					Contexto de marca usado para prompts, deteccion y research.
				</p>
				{status.error ? (
					<p className="mt-4 rounded-md bg-red-50 p-3 text-sm text-red-700">
						{status.error}
					</p>
				) : null}
				{status.saved ? (
					<p className="mt-4 rounded-md bg-emerald-50 p-3 text-sm text-emerald-700">
						Perfil guardado.
					</p>
				) : null}
				<form
					action={action}
					className="mt-6 grid gap-4 rounded-md border border-slate-200 bg-white p-5"
				>
					<label className="grid gap-2 text-sm font-medium text-slate-700">
						Marca
						<input
							className="rounded-md border border-slate-300 px-3 py-2"
							name="brand_name"
							defaultValue={company?.brand_name ?? workspace.name}
							required
						/>
					</label>
					<label className="grid gap-2 text-sm font-medium text-slate-700">
						Web
						<input
							className="rounded-md border border-slate-300 px-3 py-2"
							name="website"
							defaultValue={company?.website ?? workspace.website ?? ""}
							type="url"
						/>
					</label>
					<label className="grid gap-2 text-sm font-medium text-slate-700">
						Descripcion
						<textarea
							className="min-h-32 rounded-md border border-slate-300 px-3 py-2"
							name="description"
							defaultValue={company?.description ?? ""}
							required
						/>
					</label>
					<div className="grid gap-4 md:grid-cols-2">
						<label className="grid gap-2 text-sm font-medium text-slate-700">
							Productos
							<input
								className="rounded-md border border-slate-300 px-3 py-2"
								name="products"
								defaultValue={company?.products?.join(", ") ?? ""}
							/>
						</label>
						<label className="grid gap-2 text-sm font-medium text-slate-700">
							Keywords
							<input
								className="rounded-md border border-slate-300 px-3 py-2"
								name="keywords"
								defaultValue={company?.keywords?.join(", ") ?? ""}
							/>
						</label>
						<label className="grid gap-2 text-sm font-medium text-slate-700">
							Mercados
							<input
								className="rounded-md border border-slate-300 px-3 py-2"
								name="markets"
								defaultValue={company?.markets?.join(", ") ?? ""}
							/>
						</label>
						<label className="grid gap-2 text-sm font-medium text-slate-700">
							Tono
							<input
								className="rounded-md border border-slate-300 px-3 py-2"
								name="tone"
								defaultValue={company?.tone ?? ""}
							/>
						</label>
					</div>
					<label className="grid gap-2 text-sm font-medium text-slate-700">
						URLs oficiales
						<input
							className="rounded-md border border-slate-300 px-3 py-2"
							name="official_urls"
							defaultValue={company?.official_urls?.join(", ") ?? ""}
						/>
					</label>
					<button
						className="w-fit rounded-md bg-slate-950 px-4 py-2 text-sm font-semibold text-white"
						type="submit"
					>
						Guardar perfil
					</button>
				</form>
			</div>
		</main>
	);
}
