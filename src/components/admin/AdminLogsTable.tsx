import type { PromptRun } from "@/types";

export function AdminLogsTable({ runs }: { runs: PromptRun[] }) {
	return (
		<div className="overflow-hidden rounded-md border border-slate-200 bg-white">
			<table className="w-full min-w-[760px] text-left text-sm">
				<thead className="bg-slate-50 text-xs uppercase text-slate-500">
					<tr>
						<th className="px-4 py-3">Fecha</th>
						<th className="px-4 py-3">Proveedor</th>
						<th className="px-4 py-3">Modelo</th>
						<th className="px-4 py-3">Estado</th>
						<th className="px-4 py-3">Coste</th>
						<th className="px-4 py-3">Error</th>
					</tr>
				</thead>
				<tbody className="divide-y divide-slate-100">
					{runs.map((run) => (
						<tr key={run.id}>
							<td className="px-4 py-3 text-slate-600">
								{new Date(run.created_at).toLocaleString("es-ES")}
							</td>
							<td className="px-4 py-3 font-medium text-slate-950">
								{run.provider}
							</td>
							<td className="px-4 py-3 text-slate-600">{run.model}</td>
							<td className="px-4 py-3 text-slate-600">{run.status}</td>
							<td className="px-4 py-3 text-slate-600">
								{Number(run.total_cost).toFixed(4)}
							</td>
							<td className="px-4 py-3 text-slate-600">
								{run.error_message ?? "-"}
							</td>
						</tr>
					))}
				</tbody>
			</table>
		</div>
	);
}
