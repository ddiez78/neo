import { AdminLogsTable } from "@/components/admin/AdminLogsTable";
import { getWorkspaceOverview, requireWorkspace } from "@/lib/data/workspace";

export default async function Page({
	params,
}: {
	params: Promise<{ workspace: string }>;
}) {
	const { workspace: slug } = await params;
	const workspace = await requireWorkspace(slug);
	const { runs, llmConfigs } = await getWorkspaceOverview(workspace.id);
	const failed = runs.filter((run) => run.status === "failed").length;

	return (
		<main className="flex-1 overflow-auto p-4 lg:p-6">
			<div className="grid gap-6">
				<div>
					<h1 className="text-2xl font-semibold text-slate-950">Admin</h1>
					<p className="mt-2 text-slate-600">
						Estado tecnico de ejecuciones, proveedores y costes.
					</p>
				</div>
				<div className="grid gap-4 md:grid-cols-3">
					<div className="rounded-md border border-slate-200 bg-white p-4">
						<p className="text-sm text-slate-500">Runs fallidos</p>
						<p className="mt-2 text-3xl font-semibold">{failed}</p>
					</div>
					<div className="rounded-md border border-slate-200 bg-white p-4">
						<p className="text-sm text-slate-500">Proveedores activos</p>
						<p className="mt-2 text-3xl font-semibold">
							{llmConfigs.filter((config) => config.enabled).length}
						</p>
					</div>
					<div className="rounded-md border border-slate-200 bg-white p-4">
						<p className="text-sm text-slate-500">Coste reciente</p>
						<p className="mt-2 text-3xl font-semibold">
							{runs
								.reduce((sum, run) => sum + Number(run.total_cost), 0)
								.toFixed(4)}
						</p>
					</div>
				</div>
				<AdminLogsTable runs={runs} />
			</div>
		</main>
	);
}
