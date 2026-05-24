import {
	ArrowUpRight,
	CheckCircle2,
	Globe2,
	Lightbulb,
	Play,
	Sparkles,
	Users,
} from "lucide-react";
import Link from "next/link";
import { GlossaryTip } from "@/components/ui/GlossaryTip";
import type { WeeklyActivity } from "@/lib/analytics/activity";

export function WeeklyActivityFeed({
	activity,
	workspaceSlug,
	isEn,
}: {
	activity: WeeklyActivity;
	workspaceSlug: string;
	isEn: boolean;
}) {
	const items = [
		{
			icon: Play,
			value: activity.runsExecuted,
			labelEs: "Ejecuciones",
			labelEn: "Runs",
			descEs: "prompts contra LLMs",
			descEn: "prompts against LLMs",
			href: `/${workspaceSlug}/prompts`,
			color: "text-blue-500",
		},
		{
			icon: Sparkles,
			value: activity.mentionsGained,
			labelEs: "Menciones",
			labelEn: "Mentions",
			descEs: "respuestas con tu marca",
			descEn: "responses with your brand",
			href: `/${workspaceSlug}/prompts`,
			color: "text-emerald-500",
		},
		{
			icon: Users,
			value: activity.competitorMentions,
			labelEs: "Menciones rivales",
			labelEn: "Rival mentions",
			descEs: "competidores en respuestas",
			descEn: "competitors in responses",
			href: `/${workspaceSlug}/competitors`,
			color: "text-orange-500",
		},
		{
			icon: Lightbulb,
			value: activity.newRecommendations,
			labelEs: "Nuevas recomendaciones",
			labelEn: "New recommendations",
			descEs: "acciones sugeridas",
			descEn: "suggested actions",
			href: `/${workspaceSlug}/recommendations`,
			color: "text-amber-500",
		},
		{
			icon: CheckCircle2,
			value: activity.tasksCompleted,
			labelEs: "Tareas hechas",
			labelEn: "Tasks done",
			descEs: "acciones completadas",
			descEn: "actions completed",
			href: `/${workspaceSlug}/tasks`,
			color: "text-violet-500",
		},
		{
			icon: Globe2,
			value: activity.sourcesDiscovered,
			labelEs: "Fuentes nuevas",
			labelEn: "New sources",
			descEs: "dominios citados",
			descEn: "domains cited",
			href: `/${workspaceSlug}/sources`,
			color: "text-cyan-500",
		},
	];

	const total = items.reduce((sum, it) => sum + it.value, 0);
	if (total === 0) return null;

	return (
		<section className="neo-card overflow-hidden p-0">
			<div className="border-b border-[var(--border)] bg-[var(--surface-subtle)] px-5 py-4">
				<div className="flex items-center justify-between gap-3">
					<div>
						<p className="text-xs font-black uppercase tracking-[0.16em] text-[var(--brand)]">
							<GlossaryTip isEn={isEn} term="weeklyActivity">
								{isEn ? "Activity" : "Actividad"}
							</GlossaryTip>
						</p>
						<h2 className="mt-1 text-lg font-bold text-[var(--foreground)]">
							{isEn
								? `What happened in the last ${activity.periodDays} days`
								: `Que ha pasado en los ultimos ${activity.periodDays} dias`}
						</h2>
					</div>
				</div>
			</div>
			<div className="grid gap-px bg-[var(--border)] sm:grid-cols-2 lg:grid-cols-3">
				{items.map((item) => {
					const Icon = item.icon;
					return (
						<Link
							className="group flex items-center gap-3 bg-[var(--surface-raised,_white)] px-5 py-4 transition hover:bg-[var(--surface-subtle)]"
							href={item.href}
							key={item.labelEs}
						>
							<div
								className={`grid size-9 shrink-0 place-items-center rounded-lg bg-[var(--surface-subtle)] ${item.color}`}
							>
								<Icon className="size-4" />
							</div>
							<div className="min-w-0 flex-1">
								<p className="flex items-baseline gap-1.5 text-2xl font-black text-[var(--foreground)]">
									{item.value}
									<span className="text-xs font-medium text-[var(--muted)]">
										{isEn ? item.labelEn : item.labelEs}
									</span>
								</p>
								<p className="text-xs text-[var(--muted)]">
									{isEn ? item.descEn : item.descEs}
								</p>
							</div>
							<ArrowUpRight className="size-3.5 text-[var(--muted)] opacity-0 transition group-hover:opacity-100" />
						</Link>
					);
				})}
			</div>
		</section>
	);
}
