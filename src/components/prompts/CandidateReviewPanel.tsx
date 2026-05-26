"use client";

import { CheckCircle2, XCircle } from "lucide-react";
import { useState } from "react";
import type { PromptCandidate } from "@/types";
import { CandidateBulkPanel } from "./CandidateBulkPanel";

type CandidateEntry = {
	candidate: PromptCandidate;
	acceptAction: (formData: FormData) => Promise<void>;
	rejectAction: (formData: FormData) => Promise<void>;
};

type Tab = "pending" | "accepted" | "rejected";

export function CandidateReviewPanel({
	bulkAcceptAction,
	candidatesWithActions,
}: {
	bulkAcceptAction: (formData: FormData) => void | Promise<void>;
	candidatesWithActions: CandidateEntry[];
}) {
	const [tab, setTab] = useState<Tab>("pending");

	const pending = candidatesWithActions.filter(
		(e) => e.candidate.status === "pending",
	);
	const accepted = candidatesWithActions.filter(
		(e) => e.candidate.status === "accepted",
	);
	const rejected = candidatesWithActions.filter(
		(e) => e.candidate.status === "rejected",
	);

	const tabs: { key: Tab; label: string; count: number }[] = [
		{ key: "pending", label: "Pendientes", count: pending.length },
		{ key: "accepted", label: "Activados", count: accepted.length },
		{ key: "rejected", label: "Descartados", count: rejected.length },
	];

	return (
		<section className="neo-card overflow-hidden">
			<div className="flex flex-wrap items-start justify-between gap-4 border-b border-[var(--border)] px-5 py-4">
				<div>
					<h2 className="text-lg font-black text-[var(--foreground)]">
						Candidatos generados
					</h2>
					<p className="text-sm text-[var(--muted)]">
						Revisa, edita y activa solo los prompts que quieras monitorizar.
					</p>
				</div>
				{pending.length > 0 ? (
					<span className="rounded-full border border-[var(--brand)] bg-[var(--brand-soft)] px-3 py-1 text-xs font-black uppercase tracking-[0.08em] text-[var(--brand)]">
						{pending.length} pendientes
					</span>
				) : null}
			</div>

			{/* Tab bar */}
			<div className="flex border-b border-[var(--border)]">
				{tabs.map(({ key, label, count }) => (
					<button
						className={`px-5 py-3 text-sm font-semibold transition ${
							tab === key
								? "border-b-2 border-[var(--brand)] text-[var(--brand)]"
								: "text-[var(--muted)] hover:text-[var(--foreground)]"
						}`}
						key={key}
						onClick={() => setTab(key)}
						type="button"
					>
						{label}
						<span
							className={`ml-1.5 rounded-full px-1.5 py-0.5 text-[10px] font-black ${
								tab === key
									? "bg-[var(--brand-soft)] text-[var(--brand)]"
									: "bg-[var(--surface-subtle)] text-[var(--muted)]"
							}`}
						>
							{count}
						</span>
					</button>
				))}
			</div>

			<div className="grid gap-4 p-5">
				{tab === "pending" ? (
					<>
						{pending.length === 0 ? (
							<EmptyTabState text="No hay candidatos pendientes. Genera nuevos prompts desde el GEO Research Studio." />
						) : (
							<>
								<CandidateBulkPanel
									action={bulkAcceptAction}
									candidates={candidatesWithActions.map((e) => e.candidate)}
								/>
								{pending.map(({ candidate, acceptAction, rejectAction }) => (
									<PendingCard
										acceptAction={acceptAction}
										candidate={candidate}
										key={candidate.id}
										rejectAction={rejectAction}
									/>
								))}
							</>
						)}
					</>
				) : tab === "accepted" ? (
					<>
						{accepted.length === 0 ? (
							<EmptyTabState text="Aún no has activado ningún candidato." />
						) : (
							<div className="grid gap-2">
								<p className="text-xs text-[var(--muted)]">
									Estos candidatos ya se guardaron como prompts activos y
									aparecen en la tabla de rendimiento.
								</p>
								{accepted.map(({ candidate }) => (
									<CompactCard
										candidate={candidate}
										key={candidate.id}
										tone="emerald"
									/>
								))}
							</div>
						)}
					</>
				) : (
					<>
						{rejected.length === 0 ? (
							<EmptyTabState text="No has descartado ningún candidato." />
						) : (
							<div className="grid gap-2">
								{rejected.map(({ candidate }) => (
									<CompactCard
										candidate={candidate}
										key={candidate.id}
										tone="muted"
									/>
								))}
							</div>
						)}
					</>
				)}
			</div>
		</section>
	);
}

function PendingCard({
	candidate,
	acceptAction,
	rejectAction,
}: {
	candidate: PromptCandidate;
	acceptAction: (formData: FormData) => Promise<void>;
	rejectAction: (formData: FormData) => Promise<void>;
}) {
	return (
		<article className="rounded-xl border border-[var(--border)] bg-[rgba(231,233,238,0.03)] p-4">
			<div className="flex flex-wrap items-start justify-between gap-4">
				<div className="min-w-0 flex-1">
					<div className="flex flex-wrap gap-2 text-[10px] font-black uppercase tracking-[0.08em]">
						<CandidateBadge>
							Score {Number(candidate.score).toFixed(0)}
						</CandidateBadge>
						<CandidateBadge>{candidate.intent}</CandidateBadge>
						<CandidateBadge>{candidate.funnel_stage}</CandidateBadge>
					</div>
					<h3 className="mt-3 font-black text-[var(--foreground)]">
						{candidate.title}
					</h3>
					<p className="mt-2 text-sm leading-6 text-[var(--muted)]">
						{candidate.body}
					</p>
					{candidate.rationale ? (
						<p className="mt-3 text-xs text-[var(--muted)]">
							{candidate.rationale}
						</p>
					) : null}
				</div>
				<form action={rejectAction}>
					<input name="returnTo" type="hidden" value="prompts" />
					<button
						className="inline-flex items-center gap-2 rounded-lg border border-[var(--border)] px-3 py-2 text-sm font-bold text-[var(--muted)] transition hover:border-red-400/40 hover:text-red-200"
						type="submit"
					>
						<XCircle className="size-4" />
						Descartar
					</button>
				</form>
			</div>
			<form action={acceptAction} className="mt-4 grid gap-3">
				<input name="returnTo" type="hidden" value="prompts" />
				<input defaultValue={candidate.title} name="title" />
				<textarea defaultValue={candidate.body} name="body" rows={3} />
				<button
					className="inline-flex w-fit items-center gap-2 rounded-lg bg-[var(--brand)] px-3 py-2 text-sm font-black text-[#1b1000]"
					type="submit"
				>
					<CheckCircle2 className="size-4" />
					Guardar como prompt activo
				</button>
			</form>
		</article>
	);
}

function CompactCard({
	candidate,
	tone,
}: {
	candidate: PromptCandidate;
	tone: "emerald" | "muted";
}) {
	return (
		<div
			className={`flex items-center gap-3 rounded-lg border px-3 py-2.5 ${
				tone === "emerald"
					? "border-emerald-400/20 bg-emerald-400/5"
					: "border-[var(--border)] bg-[var(--surface-subtle)]"
			}`}
		>
			{tone === "emerald" ? (
				<CheckCircle2 className="size-4 shrink-0 text-emerald-400" />
			) : (
				<XCircle className="size-4 shrink-0 text-[var(--muted)]" />
			)}
			<div className="min-w-0 flex-1">
				<p className="truncate text-sm font-semibold text-[var(--foreground)]">
					{candidate.title}
				</p>
				<p className="text-xs text-[var(--muted)]">{candidate.intent}</p>
			</div>
		</div>
	);
}

function CandidateBadge({ children }: { children: React.ReactNode }) {
	return (
		<span className="rounded border border-[var(--border)] bg-[var(--surface-subtle)] px-2 py-1 text-[var(--muted)]">
			{children}
		</span>
	);
}

function EmptyTabState({ text }: { text: string }) {
	return (
		<p className="rounded-lg border border-dashed border-[var(--border)] p-6 text-center text-sm text-[var(--muted)]">
			{text}
		</p>
	);
}
