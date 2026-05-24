"use client";

import { CheckCircle2, MousePointer2, SquareCheckBig } from "lucide-react";
import { useMemo, useState } from "react";
import type { PromptCandidate } from "@/types";

export function CandidateBulkPanel({
	action,
	candidates,
}: {
	action: (formData: FormData) => void | Promise<void>;
	candidates: PromptCandidate[];
}) {
	const pendingCandidates = useMemo(
		() => candidates.filter((candidate) => candidate.status === "pending"),
		[candidates],
	);
	const [selectedIds, setSelectedIds] = useState<string[]>([]);
	const allSelected =
		pendingCandidates.length > 0 &&
		selectedIds.length === pendingCandidates.length;

	function toggleCandidate(id: string) {
		setSelectedIds((current) =>
			current.includes(id)
				? current.filter((candidateId) => candidateId !== id)
				: [...current, id],
		);
	}

	function toggleAll() {
		setSelectedIds(
			allSelected ? [] : pendingCandidates.map((candidate) => candidate.id),
		);
	}

	if (pendingCandidates.length === 0) {
		return null;
	}

	return (
		<form
			action={action}
			className="rounded-xl border border-[var(--border)] bg-[rgba(244,149,39,0.05)] p-4"
		>
			<div className="flex flex-wrap items-start justify-between gap-3">
				<div>
					<div className="flex items-center gap-2">
						<SquareCheckBig className="size-4 text-[var(--brand)]" />
						<h3 className="font-black text-[var(--foreground)]">
							Activacion en lote
						</h3>
					</div>
					<p className="mt-1 max-w-2xl text-sm leading-6 text-[var(--muted)]">
						Selecciona los candidatos que ya tienen sentido para tu estrategia.
						Se guardaran como prompts activos y empezaran a ejecutarse contra
						todos los LLMs habilitados.
					</p>
				</div>
				<div className="flex flex-wrap gap-2">
					<button
						className="inline-flex items-center gap-2 rounded-lg border border-[var(--border)] bg-[rgba(7,19,38,0.65)] px-3 py-2 text-xs font-black uppercase tracking-[0.06em] text-[var(--foreground)] transition hover:border-[var(--brand)]"
						onClick={toggleAll}
						type="button"
					>
						<MousePointer2 className="size-4" />
						{allSelected ? "Quitar seleccion" : "Seleccionar pendientes"}
					</button>
					<button
						className="inline-flex items-center gap-2 rounded-lg bg-[var(--brand)] px-3 py-2 text-xs font-black uppercase tracking-[0.06em] text-[#1b1000] transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-45"
						disabled={selectedIds.length === 0}
						type="submit"
					>
						<CheckCircle2 className="size-4" />
						Guardar {selectedIds.length || ""} seleccionados
					</button>
				</div>
			</div>

			<div className="mt-4 grid gap-2">
				{pendingCandidates.map((candidate) => {
					const checked = selectedIds.includes(candidate.id);
					return (
						<label
							className={`flex cursor-pointer gap-3 rounded-lg border p-3 transition ${
								checked
									? "border-[var(--brand)] bg-[rgba(244,149,39,0.08)]"
									: "border-[var(--border)] bg-[rgba(7,19,38,0.45)] hover:border-[var(--brand)]"
							}`}
							key={candidate.id}
						>
							<input
								checked={checked}
								className="mt-1"
								name="candidateIds"
								onChange={() => toggleCandidate(candidate.id)}
								type="checkbox"
								value={candidate.id}
							/>
							<div className="min-w-0 flex-1">
								<div className="flex flex-wrap items-center gap-2">
									<p className="font-bold text-[var(--foreground)]">
										{candidate.title}
									</p>
									<span className="rounded-full border border-[var(--border)] px-2 py-0.5 text-[10px] font-black uppercase tracking-[0.08em] text-[var(--muted)]">
										{candidate.intent}
									</span>
									<span className="rounded-full border border-[var(--border)] px-2 py-0.5 text-[10px] font-black uppercase tracking-[0.08em] text-[var(--muted)]">
										Score {Number(candidate.score).toFixed(0)}
									</span>
								</div>
								<p className="mt-1 line-clamp-2 text-sm text-[var(--muted)]">
									{candidate.body}
								</p>
							</div>
						</label>
					);
				})}
			</div>
		</form>
	);
}
