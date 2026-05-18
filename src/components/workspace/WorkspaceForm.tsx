import { createWorkspaceAndRedirectAction } from "@/actions/workspace";

export function WorkspaceForm() {
	return (
		<form action={createWorkspaceAndRedirectAction} className="grid gap-4">
			<label className="grid gap-2 text-sm font-medium text-slate-700">
				Nombre de empresa
				<input
					className="rounded-md border border-slate-300 px-3 py-2"
					name="name"
					placeholder="GEO"
					required
				/>
			</label>
			<label className="grid gap-2 text-sm font-medium text-slate-700">
				Web
				<input
					className="rounded-md border border-slate-300 px-3 py-2"
					name="website"
					placeholder="https://example.com"
					type="url"
				/>
			</label>
			<label className="grid gap-2 text-sm font-medium text-slate-700">
				Sector
				<input
					className="rounded-md border border-slate-300 px-3 py-2"
					name="industry"
					placeholder="SaaS, Legal, Retail..."
				/>
			</label>
			<div className="grid gap-3 sm:grid-cols-2">
				<label className="grid gap-2 text-sm font-medium text-slate-700">
					Idioma
					<input
						className="rounded-md border border-slate-300 px-3 py-2"
						defaultValue="es-ES"
						name="locale"
					/>
				</label>
				<label className="grid gap-2 text-sm font-medium text-slate-700">
					Zona horaria
					<input
						className="rounded-md border border-slate-300 px-3 py-2"
						defaultValue="Europe/Madrid"
						name="timezone"
					/>
				</label>
			</div>
			<button
				className="rounded-md bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800"
				type="submit"
			>
				Crear workspace
			</button>
		</form>
	);
}
