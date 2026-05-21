import {
	CheckCircle2,
	Clock3,
	ListChecks,
	PlayCircle,
	XCircle,
} from "lucide-react";
import { updateTaskStatusAction } from "@/actions/tasks";
import { getWorkspaceOverview, requireWorkspace } from "@/lib/data/workspace";
import type { RecommendationAction, RecommendationStatus } from "@/types";

type StatusConfig = {
	key: RecommendationStatus;
	label: string;
	description: string;
	accent: string;
	icon: typeof Clock3;
	empty: string;
};

const statusConfigs: StatusConfig[] = [
	{
		key: "pending",
		label: "Pendiente",
		description: "Lista para ejecutar",
		accent: "#F49527",
		icon: Clock3,
		empty: "No hay tareas pendientes.",
	},
	{
		key: "in_progress",
		label: "En curso",
		description: "Trabajo activo",
		accent: "#5B72EE",
		icon: PlayCircle,
		empty: "No hay tareas en curso.",
	},
	{
		key: "done",
		label: "Completada",
		description: "Impacto aplicado",
		accent: "#22C55E",
		icon: CheckCircle2,
		empty: "No hay tareas completadas.",
	},
	{
		key: "dismissed",
		label: "Descartada",
		description: "No prioritaria",
		accent: "#9AA7BA",
		icon: XCircle,
		empty: "No hay tareas descartadas.",
	},
];

function shortDate(value?: string | null) {
	if (!value) return "-";
	return value.slice(0, 10);
}

function statusRank(status: RecommendationStatus) {
	if (status === "pending") return 0;
	if (status === "in_progress") return 1;
	if (status === "done") return 2;
	return 3;
}

function sortedTasks(tasks: RecommendationAction[]) {
	return [...tasks].sort((a, b) => {
		const byStatus = statusRank(a.status) - statusRank(b.status);
		if (byStatus !== 0) return byStatus;
		const byPriority = b.priority - a.priority;
		if (byPriority !== 0) return byPriority;
		return a.created_at.localeCompare(b.created_at);
	});
}

function TaskCard({
	task,
	workspaceSlug,
}: {
	task: RecommendationAction;
	workspaceSlug: string;
}) {
	const actions = [
		{ label: "Pendiente", status: "pending" },
		{ label: "Empezar", status: "in_progress" },
		{ label: "Completar", status: "done" },
		{ label: "Descartar", status: "dismissed" },
	] as const;

	return (
		<article className="rounded-lg border border-[var(--border)] bg-[rgba(7,19,38,0.62)] p-3 transition hover:border-[rgba(244,149,39,0.38)]">
			<div className="flex flex-wrap items-center gap-2">
				<span className="rounded border border-[var(--border)] bg-[var(--surface-subtle)] px-2 py-1 text-[10px] font-black uppercase tracking-[0.08em] text-[var(--muted)]">
					{task.type}
				</span>
				<span className="rounded bg-[var(--brand-soft)] px-2 py-1 text-[10px] font-black uppercase text-[var(--brand)]">
					P{task.priority}
				</span>
			</div>
			<h3 className="mt-3 text-sm font-bold leading-snug text-[var(--foreground)]">
				{task.label}
			</h3>
			<p className="mt-2 text-xs text-[var(--muted)]">
				Creada: {shortDate(task.created_at)} · Completada:{" "}
				{shortDate(task.completed_at)}
			</p>
			<div className="mt-4 flex flex-wrap gap-2">
				{actions.map((item) => {
					const formAction = updateTaskStatusAction.bind(
						null,
						workspaceSlug,
						task.id,
						item.status,
					);
					return (
						<form action={formAction} key={item.status}>
							<button
								className="rounded border border-[var(--border)] bg-[var(--surface-subtle)] px-2.5 py-1.5 text-xs font-semibold text-[var(--muted)] transition hover:border-[var(--brand)] hover:text-[var(--foreground)]"
								type="submit"
							>
								{item.label}
							</button>
						</form>
					);
				})}
			</div>
		</article>
	);
}

export default async function Page({
	params,
	searchParams,
}: {
	params: Promise<{ workspace: string }>;
	searchParams: Promise<{
		error?: string;
		created?: string;
		existing?: string;
		started?: string;
		updated?: string;
	}>;
}) {
	const { workspace: slug } = await params;
	const status = await searchParams;
	const workspace = await requireWorkspace(slug);
	const { tasks } = await getWorkspaceOverview(workspace.id);
	const allTasks = sortedTasks(tasks);
	const pending = allTasks.filter((task) => task.status === "pending");
	const inProgress = allTasks.filter((task) => task.status === "in_progress");
	const done = allTasks.filter((task) => task.status === "done");

	return (
		<main className="flex-1 overflow-auto p-4 pb-24 lg:p-6 lg:pb-8">
			<div className="mx-auto grid max-w-[1440px] gap-6">
				<section>
					<p className="text-xs font-black uppercase tracking-[0.2em] text-[var(--brand)]">
						SEO Execution Board
					</p>
					<h1 className="mt-2 text-3xl font-black tracking-[-0.03em] text-[var(--foreground)]">
						Tareas de recomendaciones
					</h1>
					<p className="mt-2 max-w-3xl text-sm text-[var(--muted)]">
						Kanban sencillo para ver que recomendaciones estan pendientes, en
						curso, completadas o descartadas.
					</p>
				</section>

				<Message status={status} />

				<section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
					<Stat label="Total" value={allTasks.length} icon={ListChecks} />
					<Stat label="Pendientes" value={pending.length} icon={Clock3} />
					<Stat label="En curso" value={inProgress.length} icon={PlayCircle} />
					<Stat label="Completadas" value={done.length} icon={CheckCircle2} />
				</section>

				<section className="grid gap-4 xl:grid-cols-4">
					{statusConfigs.map((config) => {
						const Icon = config.icon;
						const items = allTasks.filter((task) => task.status === config.key);
						return (
							<div className="neo-card p-3" key={config.key}>
								<div className="mb-3 flex items-center justify-between gap-3">
									<div className="flex items-center gap-2">
										<div
											className="grid size-9 place-items-center rounded-lg border border-[var(--border)]"
											style={{ color: config.accent }}
										>
											<Icon className="size-4" />
										</div>
										<div>
											<h2 className="text-sm font-black uppercase tracking-[0.08em] text-[var(--foreground)]">
												{config.label}
											</h2>
											<p className="text-xs text-[var(--muted)]">
												{config.description}
											</p>
										</div>
									</div>
									<span className="rounded bg-[var(--surface-subtle)] px-2 py-1 text-xs font-black text-[var(--brand)]">
										{items.length}
									</span>
								</div>
								<div className="grid gap-3">
									{items.map((task) => (
										<TaskCard
											key={task.id}
											task={task}
											workspaceSlug={workspace.slug}
										/>
									))}
									{items.length === 0 ? (
										<div className="rounded-lg border border-dashed border-[var(--border)] p-4 text-xs text-[var(--muted)]">
											{config.empty}
										</div>
									) : null}
								</div>
							</div>
						);
					})}
				</section>

				<section className="neo-card overflow-hidden">
					<div className="flex items-center justify-between border-b border-[var(--border)] px-4 py-3">
						<h2 className="text-lg font-bold text-[var(--foreground)]">
							Lista compacta
						</h2>
						<span className="text-sm text-[var(--muted)]">
							{allTasks.length} tareas
						</span>
					</div>
					<div className="overflow-x-auto">
						<table className="min-w-full text-sm">
							<thead className="bg-[var(--background)] text-left text-[10px] font-black uppercase tracking-[0.14em] text-[var(--muted)]">
								<tr>
									<th className="px-4 py-3">Tarea</th>
									<th className="px-4 py-3">Tipo</th>
									<th className="px-4 py-3">Prioridad</th>
									<th className="px-4 py-3">Estado</th>
									<th className="px-4 py-3">Creada</th>
									<th className="px-4 py-3">Completada</th>
								</tr>
							</thead>
							<tbody className="divide-y divide-[var(--border)]">
								{allTasks.map((task) => (
									<tr
										className="transition hover:bg-[rgba(244,149,39,0.04)]"
										key={task.id}
									>
										<td className="px-4 py-3 font-bold text-[var(--foreground)]">
											{task.label}
										</td>
										<td className="px-4 py-3 text-[var(--muted)]">
											{task.type}
										</td>
										<td className="px-4 py-3 text-[var(--muted)]">
											P{task.priority}
										</td>
										<td className="px-4 py-3 text-[var(--muted)]">
											{task.status.replace("_", " ")}
										</td>
										<td className="px-4 py-3 text-[var(--muted)]">
											{shortDate(task.created_at)}
										</td>
										<td className="px-4 py-3 text-[var(--muted)]">
											{shortDate(task.completed_at)}
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
					{allTasks.length === 0 ? (
						<div className="m-4 rounded-lg border border-dashed border-[var(--border)] p-5 text-center text-sm text-[var(--muted)]">
							Crea tareas desde Recomendaciones para empezar a usar el tablero.
						</div>
					) : null}
				</section>
			</div>
		</main>
	);
}

function Stat({
	label,
	value,
	icon: Icon,
}: {
	label: string;
	value: number;
	icon: typeof Clock3;
}) {
	return (
		<div className="neo-card p-4">
			<div className="flex items-start justify-between gap-3">
				<div>
					<p className="text-[11px] font-black uppercase tracking-[0.14em] text-[var(--muted)]">
						{label}
					</p>
					<p className="mt-3 text-4xl font-black tracking-[-0.04em] text-[var(--foreground)]">
						{value}
					</p>
				</div>
				<div className="grid size-10 place-items-center rounded-lg border border-[rgba(244,149,39,0.24)] bg-[var(--brand-soft)] text-[var(--brand)]">
					<Icon className="size-5" />
				</div>
			</div>
		</div>
	);
}

function Message({
	status,
}: {
	status: {
		error?: string;
		created?: string;
		existing?: string;
		started?: string;
		updated?: string;
	};
}) {
	if (status.error) {
		return (
			<p className="rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-[#ffb4ab]">
				{status.error}
			</p>
		);
	}
	const message = status.created
		? "Tarea creada y enviada al tablero."
		: status.existing
			? "Esa recomendacion ya tenia tarea. Te llevamos al tablero."
			: status.started
				? "Recomendacion iniciada y tarea movida a En curso."
				: status.updated
					? "Estado de tarea actualizado."
					: "";
	return message ? (
		<p className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-3 text-sm text-[#7ee3a2]">
			{message}
		</p>
	) : null;
}
