import { Plus } from "lucide-react";
import Link from "next/link";
import { getWorkspaces, requireUser } from "@/lib/data/workspace";

export default async function Page() {
	await requireUser();
	const workspaces = await getWorkspaces();

	return (
		<main className="min-h-screen bg-slate-100 p-6">
			<section className="mx-auto max-w-5xl">
				<div className="flex items-center justify-between gap-4">
					<div>
						<p className="text-sm font-semibold uppercase text-cyan-700">
							NEO GEO
						</p>
						<h1 className="mt-2 text-3xl font-semibold text-slate-950">
							Workspaces
						</h1>
					</div>
					<Link
						className="inline-flex items-center gap-2 rounded-md bg-slate-950 px-4 py-2 text-sm font-semibold text-white"
						href="/onboarding"
					>
						<Plus className="size-4" />
						Nuevo
					</Link>
				</div>
				<div className="mt-6 grid gap-4 md:grid-cols-2">
					{workspaces.map((workspace) => (
						<Link
							className="rounded-md border border-slate-200 bg-white p-5 shadow-sm transition hover:border-cyan-300"
							href={`/${workspace.slug}/dashboard`}
							key={workspace.id}
						>
							<h2 className="text-lg font-semibold text-slate-950">
								{workspace.name}
							</h2>
							<p className="mt-2 text-sm text-slate-500">
								{workspace.website || "Sin web configurada"}
							</p>
							<p className="mt-4 text-xs font-medium uppercase text-slate-400">
								{workspace.industry || "Sin sector"} · {workspace.locale}
							</p>
						</Link>
					))}
					{workspaces.length === 0 ? (
						<div className="rounded-md border border-dashed border-slate-300 bg-white p-8 text-center">
							<p className="text-slate-600">Todavia no tienes workspaces.</p>
							<Link
								className="mt-4 inline-flex rounded-md bg-slate-950 px-4 py-2 text-sm font-semibold text-white"
								href="/onboarding"
							>
								Crear el primero
							</Link>
						</div>
					) : null}
				</div>
			</section>
		</main>
	);
}
