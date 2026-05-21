import { Plus } from "lucide-react";
import Link from "next/link";
import { getWorkspaces, requireUser } from "@/lib/data/workspace";
import { getUserPreferences } from "@/lib/preferences-server";

export default async function Page() {
	await requireUser();
	const { locale } = await getUserPreferences();
	const isEn = locale === "en";
	const workspaces = await getWorkspaces();

	return (
		<main className="min-h-screen bg-[var(--background)] p-4 sm:p-6">
			<section className="mx-auto max-w-5xl">
				<div className="flex items-center justify-between gap-4 rounded-lg border border-[var(--border)] bg-[var(--surface)] px-4 py-4 sm:px-5">
					<div>
						<p className="text-xs font-semibold uppercase tracking-[0.08em] text-teal-700">
							citame.ai Intelligence
						</p>
						<h1 className="mt-2 text-2xl font-semibold text-[var(--foreground)] sm:text-3xl">
							Workspaces
						</h1>
					</div>
					<Link
						className="inline-flex items-center gap-2 rounded-md bg-[var(--brand-deep)] px-4 py-2 text-sm font-semibold text-white transition hover:bg-teal-700"
						href="/onboarding"
					>
						<Plus className="size-4" />
						{isEn ? "New" : "Nuevo"}
					</Link>
				</div>
				<div className="mt-6 grid gap-4 md:grid-cols-2">
					{workspaces.map((workspace) => (
						<Link
							className="neo-card p-5 transition hover:border-teal-400 hover:shadow-[0_10px_24px_rgba(15,23,42,0.08)]"
							href={`/${workspace.slug}/dashboard`}
							key={workspace.id}
						>
							<h2 className="text-lg font-semibold text-[var(--foreground)]">
								{workspace.name}
							</h2>
							<p className="mt-2 text-sm text-slate-500">
								{workspace.website ||
									(isEn ? "Website not configured" : "Sin web configurada")}
							</p>
							<p className="mt-4 text-xs font-medium uppercase text-slate-400">
								{workspace.industry || (isEn ? "No industry" : "Sin sector")} -{" "}
								{workspace.locale}
							</p>
						</Link>
					))}
					{workspaces.length === 0 ? (
						<div className="rounded-md border border-dashed border-[var(--border)] bg-white p-8 text-center">
							<p className="text-slate-600">
								{isEn
									? "You do not have workspaces yet."
									: "Todavia no tienes workspaces."}
							</p>
							<Link
								className="mt-4 inline-flex rounded-md bg-[var(--brand-deep)] px-4 py-2 text-sm font-semibold text-white"
								href="/onboarding"
							>
								{isEn ? "Create first workspace" : "Crear el primero"}
							</Link>
						</div>
					) : null}
				</div>
			</section>
		</main>
	);
}
