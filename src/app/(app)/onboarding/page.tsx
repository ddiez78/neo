import { WorkspaceForm } from "@/components/workspace/WorkspaceForm";
import { requireUser } from "@/lib/data/workspace";

export default async function Page({
	searchParams,
}: {
	searchParams: Promise<{ error?: string }>;
}) {
	await requireUser();
	const params = await searchParams;

	return (
		<main className="min-h-screen bg-slate-100 p-6">
			<section className="mx-auto grid max-w-5xl gap-8 py-10 lg:grid-cols-[1fr_420px]">
				<div>
					<p className="text-sm font-semibold uppercase text-cyan-700">
						Onboarding
					</p>
					<h1 className="mt-3 text-4xl font-semibold tracking-tight text-slate-950">
						Configura tu primer monitor GEO
					</h1>
					<p className="mt-4 max-w-2xl text-lg text-slate-600">
						Creamos un workspace para agrupar perfil de marca, prompts,
						competidores, fuentes y ejecuciones LLM.
					</p>
					<div className="mt-8 grid gap-3 text-sm text-slate-600">
						<p className="rounded-md border border-slate-200 bg-white p-4">
							1. Define marca y mercado.
						</p>
						<p className="rounded-md border border-slate-200 bg-white p-4">
							2. Activa proveedores LLM.
						</p>
						<p className="rounded-md border border-slate-200 bg-white p-4">
							3. Ejecuta prompts y mide visibilidad.
						</p>
					</div>
				</div>
				<div className="rounded-md border border-slate-200 bg-white p-6 shadow-sm">
					{params.error ? (
						<p className="mb-4 rounded-md bg-red-50 p-3 text-sm text-red-700">
							{params.error}
						</p>
					) : null}
					<WorkspaceForm />
				</div>
			</section>
		</main>
	);
}
