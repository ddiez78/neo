"use client";

import { Plus, X } from "lucide-react";
import { useState } from "react";

export function AddManualPromptPanel({
	action,
}: {
	action: (formData: FormData) => Promise<void>;
}) {
	const [open, setOpen] = useState(false);

	return (
		<section className="neo-card overflow-hidden">
			<div className="flex items-center justify-between px-5 py-4">
				<div>
					<h2 className="text-base font-black text-[var(--foreground)]">
						Añadir PROMPT manual
					</h2>
					<p className="text-xs text-[var(--muted)]">
						Escribe tu propio PROMPT para monitorizarlo directamente.
					</p>
				</div>
				<button
					className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--border)] px-3 py-2 text-sm font-bold text-[var(--muted)] transition hover:border-[var(--brand)] hover:text-[var(--foreground)]"
					onClick={() => setOpen((v) => !v)}
					type="button"
				>
					{open ? <X className="size-4" /> : <Plus className="size-4" />}
					{open ? "Cancelar" : "Nuevo PROMPT"}
				</button>
			</div>
			{open && (
				<div className="border-t border-[var(--border)] p-5">
					<form
						action={async (formData) => {
							await action(formData);
							setOpen(false);
						}}
						className="grid gap-4"
					>
						<Field label="Texto del PROMPT">
							<textarea
								name="body"
								placeholder="¿Cuál es el mejor software de gestión para pymes?"
								required
								rows={3}
							/>
						</Field>
						<Field label="Título interno (para referencia)">
							<input name="title" placeholder="Software gestión - awareness" />
						</Field>
						<Field label="Etiquetas separadas por comas">
							<input name="tags" placeholder="awareness, software, gestion" />
						</Field>
						<input name="priority" type="hidden" value="3" />
						<input name="frequency" type="hidden" value="daily" />
						<button
							className="inline-flex w-fit items-center gap-2 rounded-lg bg-[var(--brand)] px-4 py-2.5 text-sm font-black text-[#1b1000] transition hover:brightness-110"
							type="submit"
						>
							Añadir PROMPT
						</button>
					</form>
				</div>
			)}
		</section>
	);
}

function Field({
	label,
	children,
}: {
	label: string;
	children: React.ReactNode;
}) {
	return (
		<label className="grid gap-1.5">
			<span className="text-xs font-semibold text-[var(--muted)]">{label}</span>
			{children}
		</label>
	);
}
