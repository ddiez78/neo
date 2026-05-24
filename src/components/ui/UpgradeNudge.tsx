import { ArrowRight, Zap } from "lucide-react";
import Link from "next/link";
import type { AppMode } from "@/lib/preferences";

export function UpgradeNudge({
	feature,
	workspaceSlug,
	mode,
	isEn = false,
}: {
	feature: string;
	workspaceSlug: string;
	mode: AppMode;
	isEn?: boolean;
}) {
	if (mode !== "sme") return null;

	return (
		<div className="mb-6 flex items-center gap-4 rounded-xl border border-indigo-200 bg-indigo-50 px-5 py-4 dark:border-indigo-800/50 dark:bg-indigo-950/30">
			<div className="grid size-9 shrink-0 place-items-center rounded-lg bg-indigo-100 text-indigo-600 dark:bg-indigo-900/50 dark:text-indigo-400">
				<Zap className="size-4" />
			</div>
			<div className="min-w-0 flex-1">
				<p className="text-sm font-semibold text-indigo-900 dark:text-indigo-200">
					{isEn
						? `${feature} is available on the Pro plan`
						: `${feature} esta disponible en el plan Pro`}
				</p>
				<p className="text-xs text-indigo-600 dark:text-indigo-400">
					{isEn
						? "Upgrade to unlock competitors, tasks, expanded metrics and more."
						: "Actualiza para acceder a competidores, tareas, metricas ampliadas y mas."}
				</p>
			</div>
			<Link
				className="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-bold text-white transition hover:bg-indigo-700"
				href={`/${workspaceSlug}/settings?section=experience`}
			>
				{isEn ? "Switch to Pro" : "Cambiar a Pro"}
				<ArrowRight className="size-3.5" />
			</Link>
		</div>
	);
}
