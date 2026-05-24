"use client";

import { ChevronDown, FileText } from "lucide-react";
import { useState } from "react";
import type { Recommendation } from "@/types";

export type PriorityTone = "high" | "medium" | "low";

type ServerAction = () => void | Promise<void>;

interface Props {
	recommendation: Recommendation;
	defaultExpanded?: boolean;
	categoryLabel: string;
	priorityLabel: string;
	priorityTone: PriorityTone;
	markInProgressAction: ServerAction;
	markDoneAction: ServerAction;
	dismissAction: ServerAction;
	createTaskAction: ServerAction;
	locale: "es" | "en";
}

const toneStyles: Record<
	PriorityTone,
	{ border: string; badge: string; priorityText: string }
> = {
	high: {
		border: "border-l-4 border-l-red-400",
		badge: "border-violet-200 bg-violet-100 text-violet-800",
		priorityText: "text-red-600",
	},
	medium: {
		border: "border-l-4 border-l-amber-400",
		badge: "border-amber-200 bg-amber-100 text-amber-800",
		priorityText: "text-amber-600",
	},
	low: {
		border: "border-l-4 border-l-emerald-400",
		badge: "border-emerald-200 bg-emerald-100 text-emerald-800",
		priorityText: "text-emerald-600",
	},
};

function stringArrayFromEvidence(
	evidence: unknown,
	key: "actionItems" | "ragSources",
) {
	if (!evidence || typeof evidence !== "object") {
		return [];
	}
	const record = evidence as Record<string, unknown>;
	const value = record[key];
	return Array.isArray(value) ? value.map(String).filter(Boolean) : [];
}

export function SimpleRecommendationCard({
	recommendation,
	defaultExpanded = false,
	categoryLabel,
	priorityLabel,
	priorityTone,
	markInProgressAction,
	markDoneAction,
	dismissAction,
	createTaskAction,
	locale,
}: Props) {
	const [expanded, setExpanded] = useState(defaultExpanded);
	const tone = toneStyles[priorityTone];
	const actionItems = stringArrayFromEvidence(
		recommendation.evidence,
		"actionItems",
	);
	const ragSources = stringArrayFromEvidence(
		recommendation.evidence,
		"ragSources",
	);
	const isEn = locale === "en";
	const canStart = recommendation.status === "pending";
	const canResolve =
		recommendation.status === "pending" ||
		recommendation.status === "in_progress";

	return (
		<article
			className={`rounded-md border border-slate-200 bg-white p-5 ${tone.border}`}
		>
			<button
				className="grid w-full gap-2 text-left"
				onClick={() => setExpanded((value) => !value)}
				type="button"
			>
				<div className="flex items-center justify-between gap-2">
					<div className="flex flex-wrap items-center gap-2">
						<span
							className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${tone.badge}`}
						>
							{categoryLabel}
						</span>
						<span className={`text-xs font-medium ${tone.priorityText}`}>
							{priorityLabel}
						</span>
					</div>
					<ChevronDown
						aria-hidden="true"
						className={`size-4 shrink-0 text-slate-400 transition-transform ${expanded ? "rotate-180" : ""}`}
					/>
				</div>
				<h3 className="text-base font-semibold text-slate-950">
					{recommendation.title}
				</h3>
				{!expanded ? (
					<p className="line-clamp-2 text-sm leading-6 text-slate-500">
						{recommendation.description}
					</p>
				) : null}
			</button>

			{expanded ? (
				<div className="mt-4 grid gap-4 border-t border-slate-100 pt-4">
					<p className="text-sm leading-6 text-slate-700">
						{recommendation.description}
					</p>

					{actionItems.length > 0 ? (
						<div className="grid gap-2">
							<p className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">
								{isEn ? "Actions" : "Acciones"}
							</p>
							<ol className="grid gap-2 text-sm text-slate-700">
								{actionItems.map((item, index) => (
									<li className="flex gap-3" key={item}>
										<span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-semibold text-slate-600">
											{index + 1}
										</span>
										<span className="leading-6">{item}</span>
									</li>
								))}
							</ol>
						</div>
					) : null}

					{ragSources.length > 0 ? (
						<div className="grid gap-2">
							<p className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">
								{isEn ? "Based on" : "Basado en"}
							</p>
							<div className="flex flex-wrap gap-2">
								{ragSources.map((source) => (
									<span
										className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 bg-slate-50 px-2 py-1 text-xs font-medium text-slate-700"
										key={source}
									>
										<FileText
											aria-hidden="true"
											className="size-3.5 text-slate-400"
										/>
										{source}
									</span>
								))}
							</div>
						</div>
					) : null}

					<div className="flex flex-wrap gap-2 pt-1">
						{canStart ? (
							<form action={markInProgressAction}>
								<button
									className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
									type="submit"
								>
									{isEn ? "Start" : "Empezar"}
								</button>
							</form>
						) : null}
						{canResolve ? (
							<form action={markDoneAction}>
								<button
									className="rounded-md bg-emerald-700 px-3 py-1.5 text-sm font-medium text-white hover:bg-emerald-800"
									type="submit"
								>
									{isEn ? "Completed" : "Completada"}
								</button>
							</form>
						) : null}
						{canResolve ? (
							<form action={dismissAction}>
								<button
									className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
									type="submit"
								>
									{isEn ? "Dismiss" : "Descartar"}
								</button>
							</form>
						) : null}
						<form action={createTaskAction}>
							<button
								className="rounded-md bg-slate-950 px-3 py-1.5 text-sm font-medium text-white hover:bg-slate-800"
								type="submit"
							>
								{isEn ? "Create task" : "Crear tarea"}
							</button>
						</form>
					</div>
				</div>
			) : null}
		</article>
	);
}
