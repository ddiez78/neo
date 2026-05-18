import { Filter, RefreshCcw } from "lucide-react";

export function FiltersPanel() {
	return (
		<div className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-slate-200 bg-white p-3">
			<div className="flex items-center gap-2 text-sm font-medium text-slate-700">
				<Filter className="size-4" />
				Ultimos 30 dias
			</div>
			<div className="flex flex-wrap gap-2">
				{["Todos los modelos", "Prompts activos", "Marca + competidores"].map(
					(label) => (
						<button
							className="rounded-md border border-slate-200 px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50"
							key={label}
							type="button"
						>
							{label}
						</button>
					),
				)}
				<button
					className="inline-flex items-center gap-2 rounded-md bg-slate-950 px-3 py-1.5 text-sm font-medium text-white hover:bg-slate-800"
					type="button"
				>
					<RefreshCcw className="size-4" />
					Actualizar
				</button>
			</div>
		</div>
	);
}
