"use client";

import { Plus, X } from "lucide-react";
import { useEffect, useRef } from "react";

interface Props {
	open: boolean;
	onClose: () => void;
	createAction: (formData: FormData) => Promise<void>;
	locale: "es" | "en";
}

export function AddPromptDialog({
	open,
	onClose,
	createAction,
	locale,
}: Props) {
	const isEn = locale === "en";
	const dialogRef = useRef<HTMLDivElement>(null);
	const firstInputRef = useRef<HTMLInputElement>(null);

	useEffect(() => {
		if (!open) return;
		firstInputRef.current?.focus();
		function onKey(e: KeyboardEvent) {
			if (e.key === "Escape") onClose();
		}
		window.addEventListener("keydown", onKey);
		return () => window.removeEventListener("keydown", onKey);
	}, [open, onClose]);

	if (!open) return null;

	return (
		<button
			aria-label={isEn ? "Close dialog" : "Cerrar"}
			className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
			onClick={(e) => {
				if (e.target === e.currentTarget) onClose();
			}}
			onKeyDown={(e) => {
				if (e.key === "Escape") onClose();
			}}
			type="button"
		>
			<div
				className="grid w-full max-w-lg gap-4 rounded-lg border border-[var(--border)] bg-[var(--surface-raised,_white)] p-6 text-left shadow-2xl"
				ref={dialogRef}
			>
				<div className="flex items-center justify-between">
					<div className="flex items-center gap-2">
						<Plus className="size-5 text-[var(--brand)]" />
						<h2 className="text-lg font-bold text-[var(--foreground)]">
							{isEn ? "Add prompt" : "Añadir prompt"}
						</h2>
					</div>
					<button
						aria-label={isEn ? "Close" : "Cerrar"}
						className="rounded p-1 text-[var(--muted)] hover:bg-[var(--surface-subtle)]"
						onClick={onClose}
						type="button"
					>
						<X className="size-4" />
					</button>
				</div>

				<form
					action={async (formData: FormData) => {
						await createAction(formData);
						onClose();
					}}
					className="grid gap-3"
				>
					<label className="grid gap-1 text-sm font-medium text-[var(--muted)]">
						{isEn ? "Title" : "Título"}
						<input
							className="rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm text-[var(--foreground)] outline-none focus:border-[var(--brand)]"
							name="title"
							ref={firstInputRef}
							required
						/>
					</label>

					<div className="grid gap-3 sm:grid-cols-2">
						<label className="grid gap-1 text-sm font-medium text-[var(--muted)]">
							{isEn ? "Priority" : "Prioridad"}
							<input
								className="rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm text-[var(--foreground)] outline-none focus:border-[var(--brand)]"
								defaultValue="3"
								max="5"
								min="1"
								name="priority"
								type="number"
							/>
						</label>
						<label className="grid gap-1 text-sm font-medium text-[var(--muted)]">
							{isEn ? "Frequency" : "Frecuencia"}
							<input
								className="rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm text-[var(--foreground)] outline-none focus:border-[var(--brand)]"
								defaultValue="daily"
								name="frequency"
							/>
						</label>
					</div>

					<label className="grid gap-1 text-sm font-medium text-[var(--muted)]">
						{isEn ? "Prompt text" : "Texto del prompt"}
						<textarea
							className="rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm text-[var(--foreground)] outline-none focus:border-[var(--brand)]"
							name="body"
							required
							rows={5}
						/>
					</label>

					<label className="grid gap-1 text-sm font-medium text-[var(--muted)]">
						{isEn ? "Tags (comma separated)" : "Tags (separados por coma)"}
						<input
							className="rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm text-[var(--foreground)] outline-none focus:border-[var(--brand)]"
							name="tags"
							placeholder="awareness, pricing, alternatives"
						/>
					</label>

					<div className="flex justify-end gap-2 pt-2">
						<button
							className="rounded-md border border-[var(--border)] px-3 py-1.5 text-sm font-medium text-[var(--foreground)] hover:bg-[var(--surface-subtle)]"
							onClick={onClose}
							type="button"
						>
							{isEn ? "Cancel" : "Cancelar"}
						</button>
						<button
							className="rounded-md bg-[var(--brand)] px-3 py-1.5 text-sm font-bold text-[#1b1000] hover:brightness-110"
							type="submit"
						>
							{isEn ? "Create prompt" : "Crear prompt"}
						</button>
					</div>
				</form>
			</div>
		</button>
	);
}
