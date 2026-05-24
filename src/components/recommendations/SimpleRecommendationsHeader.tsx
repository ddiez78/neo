"use client";

import { MoreVertical, RotateCw } from "lucide-react";

type ServerAction = () => void | Promise<void>;

interface Props {
	activeCount: number;
	highPriorityCount: number;
	mediumPriorityCount: number;
	lowPriorityCount: number;
	regenerateAction: ServerAction;
	importAction: ServerAction;
	translateAction: ServerAction;
	locale: "es" | "en";
}

function formatActiveCount(count: number, isEn: boolean) {
	if (isEn) {
		return `${count} active recommendation${count === 1 ? "" : "s"}`;
	}
	return `${count} recomendaci${count === 1 ? "ón activa" : "ones activas"}`;
}

export function SimpleRecommendationsHeader({
	activeCount,
	highPriorityCount,
	mediumPriorityCount,
	lowPriorityCount,
	regenerateAction,
	importAction,
	translateAction,
	locale,
}: Props) {
	const isEn = locale === "en";

	const summaryParts: { label: string; tone: string }[] = [];
	if (highPriorityCount > 0) {
		summaryParts.push({
			label: isEn
				? `${highPriorityCount} high priority`
				: `${highPriorityCount} alta prioridad`,
			tone: "text-red-600",
		});
	}
	if (mediumPriorityCount > 0) {
		summaryParts.push({
			label: isEn
				? `${mediumPriorityCount} medium`
				: `${mediumPriorityCount} media`,
			tone: "text-amber-600",
		});
	}
	if (lowPriorityCount > 0) {
		summaryParts.push({
			label: isEn ? `${lowPriorityCount} low` : `${lowPriorityCount} baja`,
			tone: "text-emerald-600",
		});
	}

	return (
		<div className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-slate-200 bg-white p-4">
			<div>
				<p className="text-sm font-semibold text-slate-950">
					{formatActiveCount(activeCount, isEn)}
				</p>
				{summaryParts.length > 0 ? (
					<p className="mt-0.5 flex flex-wrap items-center gap-x-1 text-xs">
						{summaryParts.map((part, index) => (
							<span className={`font-medium ${part.tone}`} key={part.label}>
								{part.label}
								{index < summaryParts.length - 1 ? (
									<span className="ml-1 text-slate-300">·</span>
								) : null}
							</span>
						))}
					</p>
				) : null}
			</div>

			<div className="flex items-center gap-2">
				<div className="flex flex-col items-end gap-0.5">
					<form action={regenerateAction}>
						<button
							className="inline-flex items-center gap-2 rounded-md bg-violet-600 px-3.5 py-2 text-sm font-semibold text-white hover:bg-violet-700"
							type="submit"
						>
							<RotateCw aria-hidden="true" className="size-4" />
							{isEn ? "Regenerate" : "Regenerar"}
						</button>
					</form>
					<span className="text-[10px] text-slate-400">
						{isEn ? "Uses 2 AI executions" : "Usará 2 ejecuciones IA"}
					</span>
				</div>

				<details className="relative">
					<summary
						aria-label={isEn ? "More options" : "Más opciones"}
						className="inline-flex size-9 cursor-pointer list-none items-center justify-center rounded-md border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 [&::-webkit-details-marker]:hidden"
					>
						<MoreVertical aria-hidden="true" className="size-4" />
					</summary>
					<div className="absolute right-0 z-10 mt-1 w-56 rounded-md border border-slate-200 bg-white p-1 shadow-md">
						<form action={importAction}>
							<button
								className="block w-full rounded-md px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-50"
								type="submit"
							>
								{isEn ? "Import MD sources" : "Importar fuentes MD"}
							</button>
						</form>
						<form action={translateAction}>
							<button
								className="block w-full rounded-md px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-50"
								type="submit"
							>
								{isEn ? "Translate to Spanish" : "Traducir a inglés"}
							</button>
						</form>
					</div>
				</details>
			</div>
		</div>
	);
}
