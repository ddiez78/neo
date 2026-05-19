import { updateTaskStatusAction } from "@/actions/tasks";
import { getWorkspaceOverview, requireWorkspace } from "@/lib/data/workspace";
import type { RecommendationStatus } from "@/types";

const statuses: RecommendationStatus[] = [
	"pending",
	"in_progress",
	"done",
	"dismissed",
];

export default async function Page({
	params,
	searchParams,
}: {
	params: Promise<{ workspace: string }>;
	searchParams: Promise<{ error?: string }>;
}) {
	const { workspace: slug } = await params;
	const status = await searchParams;
	const workspace = await requireWorkspace(slug);
	const { tasks } = await getWorkspaceOverview(workspace.id);

	return (
		<main className="flex-1 overflow-auto p-4 pb-24 lg:p-6 lg:pb-6">
			<div className="grid gap-6">
				<div>
					<p className="text-xs font-semibold uppercase tracking-[0.08em] text-teal-700">
						SEO execution
					</p>
					<h1 className="mt-2 text-2xl font-semibold text-[var(--foreground)]">
						Tasks
					</h1>
					<p className="mt-2 max-w-3xl text-slate-600">
						Recommendation actions for content, schema, sources, comparison
						pages, and technical work.
					</p>
				</div>
				{status.error ? (
					<p className="rounded-md bg-red-50 p-3 text-sm text-red-700">
						{status.error}
					</p>
				) : null}
				<section className="grid gap-4 md:grid-cols-4">
					{statuses.map((taskStatus) => (
						<div className="neo-card p-4" key={taskStatus}>
							<p className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">
								{taskStatus.replace("_", " ")}
							</p>
							<p className="mt-2 text-3xl font-semibold text-[var(--foreground)]">
								{tasks.filter((task) => task.status === taskStatus).length}
							</p>
						</div>
					))}
				</section>
				<section className="grid gap-3">
					{tasks.map((task) => {
						const start = updateTaskStatusAction.bind(
							null,
							workspace.slug,
							task.id,
							"in_progress",
						);
						const done = updateTaskStatusAction.bind(
							null,
							workspace.slug,
							task.id,
							"done",
						);
						const dismiss = updateTaskStatusAction.bind(
							null,
							workspace.slug,
							task.id,
							"dismissed",
						);
						return (
							<article className="neo-card p-4" key={task.id}>
								<div className="flex flex-wrap items-start justify-between gap-4">
									<div>
										<div className="flex flex-wrap gap-2">
											<span className="rounded-md bg-[var(--surface-subtle)] px-2 py-1 text-xs font-semibold uppercase text-slate-600">
												{task.type}
											</span>
											<span className="rounded-md bg-[var(--brand-soft)] px-2 py-1 text-xs font-semibold uppercase text-teal-700">
												P{task.priority}
											</span>
											<span className="rounded-md bg-[var(--surface-subtle)] px-2 py-1 text-xs font-semibold uppercase text-slate-600">
												{task.status.replace("_", " ")}
											</span>
										</div>
										<h2 className="mt-3 font-semibold text-[var(--foreground)]">
											{task.label}
										</h2>
										<p className="mt-1 text-sm text-slate-500">
											{task.due_date ? `Due ${task.due_date}` : "No due date"} -{" "}
											{task.completed_at
												? `Completed ${task.completed_at.slice(0, 10)}`
												: "Open"}
										</p>
									</div>
									<div className="flex flex-wrap gap-2">
										<form action={start}>
											<button
												className="rounded-md border border-[var(--border)] px-3 py-2 text-sm font-medium text-slate-700"
												type="submit"
											>
												Start
											</button>
										</form>
										<form action={done}>
											<button
												className="rounded-md bg-[var(--brand-deep)] px-3 py-2 text-sm font-medium text-white"
												type="submit"
											>
												Done
											</button>
										</form>
										<form action={dismiss}>
											<button
												className="rounded-md border border-[var(--border)] px-3 py-2 text-sm font-medium text-slate-700"
												type="submit"
											>
												Dismiss
											</button>
										</form>
									</div>
								</div>
							</article>
						);
					})}
					{tasks.length === 0 ? (
						<div className="rounded-md border border-dashed border-[var(--border)] bg-[var(--surface)] p-8 text-center">
							<h2 className="font-semibold text-[var(--foreground)]">
								No tasks yet
							</h2>
							<p className="mt-2 text-sm text-slate-500">
								Create tasks from recommendations to build an execution queue.
							</p>
						</div>
					) : null}
				</section>
			</div>
		</main>
	);
}
