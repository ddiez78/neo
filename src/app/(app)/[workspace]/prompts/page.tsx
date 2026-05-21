import { Bot, Cpu, Play, Plus, ReceiptText } from "lucide-react";
import {
	createPromptAction,
	runPromptAcrossEnabledLlmsAction,
} from "@/actions/prompts";
import { getWorkspaceOverview, requireWorkspace } from "@/lib/data/workspace";

function providerLabel(provider: string) {
	const labels: Record<string, string> = {
		chatgpt: "ChatGPT",
		claude: "Claude",
		gemini: "Gemini",
		perplexity: "Perplexity",
		deepseek: "DeepSeek",
	};
	return labels[provider] ?? provider;
}

export default async function Page({
	params,
	searchParams,
}: {
	params: Promise<{ workspace: string }>;
	searchParams: Promise<{ error?: string; saved?: string; ran?: string }>;
}) {
	const { workspace: slug } = await params;
	const status = await searchParams;
	const workspace = await requireWorkspace(slug);
	const { prompts, llmConfigs, rankings, runs } = await getWorkspaceOverview(
		workspace.id,
	);
	const createAction = createPromptAction.bind(
		null,
		workspace.id,
		workspace.slug,
	);
	const activeConfigs = llmConfigs.filter((config) => config.enabled);
	const usageShare = activeConfigs.length ? 100 / activeConfigs.length : 0;
	const recentRuns = runs.length;
	const recentCost = runs.reduce((sum, run) => sum + Number(run.total_cost), 0);
	const activePrompts = prompts.filter((prompt) => prompt.status === "active");

	return (
		<main className="flex-1 overflow-auto p-4 pb-24 lg:p-6 lg:pb-8">
			<div className="mx-auto grid max-w-[1440px] gap-6">
				<section>
					<p className="text-xs font-black uppercase tracking-[0.2em] text-[var(--brand)]">
						Prompt Operations
					</p>
					<h1 className="mt-2 text-3xl font-black tracking-[-0.03em] text-[var(--foreground)]">
						Prompt Distribution Matrix
					</h1>
					<p className="mt-2 max-w-3xl text-sm text-[var(--muted)]">
						Cada prompt activo se ejecuta contra todos los LLMs habilitados. El
						reparto de uso es automatico e igualitario entre modelos activos.
					</p>
				</section>

				<Message status={status} />

				<section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
					<Stat
						label="Prompts activos"
						value={activePrompts.length}
						icon={ReceiptText}
					/>
					<Stat label="LLMs activos" value={activeConfigs.length} icon={Bot} />
					<Stat label="Runs recientes" value={recentRuns} icon={Play} />
					<Stat
						label="Coste reciente"
						value={Number(recentCost.toFixed(4))}
						icon={Cpu}
						suffix=" EUR"
					/>
				</section>

				<section className="neo-card p-5">
					<div className="flex flex-wrap items-start justify-between gap-4">
						<div>
							<h2 className="text-lg font-bold text-[var(--foreground)]">
								LLMs activos y reparto
							</h2>
							<p className="mt-1 text-sm text-[var(--muted)]">
								El porcentaje de uso se calcula como 100 dividido entre los LLMs
								activos.
							</p>
						</div>
						<span className="rounded-lg border border-[var(--border)] bg-[var(--surface-subtle)] px-3 py-1 text-xs font-black uppercase tracking-[0.08em] text-[var(--brand)]">
							{activeConfigs.length
								? `${usageShare.toFixed(0)}% por LLM`
								: "Sin LLMs activos"}
						</span>
					</div>
					<div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-5">
						{activeConfigs.map((config) => (
							<div
								className="rounded-lg border border-[var(--border)] bg-[rgba(7,19,38,0.55)] p-3"
								key={`${config.provider}-${config.model}`}
							>
								<p className="text-sm font-bold text-[var(--foreground)]">
									{providerLabel(config.provider)}
								</p>
								<p className="mt-1 truncate text-xs text-[var(--muted)]">
									{config.model}
								</p>
								<div className="mt-3 h-2 overflow-hidden rounded-full bg-[var(--background)]">
									<div
										className="h-full rounded-full bg-[var(--brand)]"
										style={{ width: `${usageShare}%` }}
									/>
								</div>
								<p className="mt-2 text-2xl font-black text-[var(--brand)]">
									{usageShare.toFixed(0)}%
								</p>
							</div>
						))}
						{activeConfigs.length === 0 ? (
							<p className="rounded-lg border border-dashed border-[var(--border)] p-4 text-sm text-[var(--muted)] md:col-span-2 xl:col-span-5">
								Activa al menos un proveedor en Ajustes para ejecutar prompts.
							</p>
						) : null}
					</div>
				</section>

				<form action={createAction} className="neo-card grid gap-4 p-5">
					<div className="flex items-center gap-2">
						<Plus className="size-5 text-[var(--brand)]" />
						<h2 className="text-lg font-bold text-[var(--foreground)]">
							Crear prompt
						</h2>
					</div>
					<div className="grid gap-4 lg:grid-cols-[1fr_180px_160px]">
						<label className="grid gap-2 text-sm font-semibold text-[var(--muted)]">
							Titulo
							<input name="title" required />
						</label>
						<label className="grid gap-2 text-sm font-semibold text-[var(--muted)]">
							Prioridad
							<input
								defaultValue="3"
								max="5"
								min="1"
								name="priority"
								type="number"
							/>
						</label>
						<label className="grid gap-2 text-sm font-semibold text-[var(--muted)]">
							Frecuencia
							<input defaultValue="daily" name="frequency" />
						</label>
					</div>
					<label className="grid gap-2 text-sm font-semibold text-[var(--muted)]">
						Prompt
						<textarea className="min-h-24" name="body" required />
					</label>
					<label className="grid gap-2 text-sm font-semibold text-[var(--muted)]">
						Tags
						<input name="tags" placeholder="awareness, pricing, alternatives" />
					</label>
					<button
						className="w-fit rounded-lg bg-[var(--brand)] px-4 py-2 text-sm font-black text-[#1b1000] transition hover:brightness-110"
						type="submit"
					>
						Crear prompt
					</button>
				</form>

				<div className="grid gap-4">
					{prompts.map((prompt) => {
						const ranking = rankings.find(
							(item) => item.prompt_id === prompt.id,
						);
						const promptRuns = runs.filter(
							(run) => run.prompt_id === prompt.id,
						);
						const runAction = runPromptAcrossEnabledLlmsAction.bind(
							null,
							workspace.id,
							workspace.slug,
							prompt.id,
						);
						return (
							<article className="neo-card p-4" key={prompt.id}>
								<div className="flex flex-wrap items-start justify-between gap-4">
									<div className="min-w-0 flex-1">
										<h2 className="text-lg font-black text-[var(--foreground)]">
											{prompt.title}
										</h2>
										<p className="mt-2 max-w-4xl text-sm leading-6 text-[var(--muted)]">
											{prompt.body}
										</p>
										<div className="mt-3 flex flex-wrap gap-2 text-[10px] font-black uppercase tracking-[0.08em]">
											<Badge>{prompt.status}</Badge>
											<Badge>prioridad {prompt.priority}</Badge>
											<Badge>{prompt.frequency}</Badge>
											<Badge>
												{ranking?.brand_mentioned
													? "brand visible"
													: "brand missing"}
											</Badge>
											<Badge>pos {ranking?.brand_position ?? "-"}</Badge>
											<Badge>
												score{" "}
												{Number(ranking?.visibility_score ?? 0).toFixed(0)}
											</Badge>
											<Badge>{ranking?.sentiment ?? "no_data"}</Badge>
										</div>
										<div className="mt-4 flex flex-wrap gap-2">
											{activeConfigs.map((config) => {
												const latest = promptRuns.find(
													(run) => run.provider === config.provider,
												);
												return (
													<span
														className="rounded border border-[var(--border)] bg-[var(--surface-subtle)] px-2 py-1 text-xs text-[var(--muted)]"
														key={`${prompt.id}-${config.provider}`}
													>
														{providerLabel(config.provider)}:{" "}
														{latest ? latest.status : "sin run"}
													</span>
												);
											})}
										</div>
									</div>
									<form action={runAction}>
										<input name="body" type="hidden" value={prompt.body} />
										<button
											className="inline-flex items-center gap-2 rounded-lg bg-[var(--brand)] px-3 py-2 text-sm font-black text-[#1b1000] transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-45"
											disabled={activeConfigs.length === 0}
											type="submit"
										>
											<Play className="size-4" />
											Ejecutar todos
										</button>
									</form>
								</div>
							</article>
						);
					})}
					{prompts.length === 0 ? (
						<p className="rounded-lg border border-dashed border-[var(--border)] p-6 text-sm text-[var(--muted)]">
							Sin prompts todavia.
						</p>
					) : null}
				</div>
			</div>
		</main>
	);
}

function Stat({
	label,
	value,
	icon: Icon,
	suffix = "",
}: {
	label: string;
	value: number;
	icon: typeof Bot;
	suffix?: string;
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
						<span className="text-sm text-[var(--muted)]">{suffix}</span>
					</p>
				</div>
				<div className="grid size-10 place-items-center rounded-lg border border-[rgba(244,149,39,0.24)] bg-[var(--brand-soft)] text-[var(--brand)]">
					<Icon className="size-5" />
				</div>
			</div>
		</div>
	);
}

function Badge({ children }: { children: React.ReactNode }) {
	return (
		<span className="rounded border border-[var(--border)] bg-[var(--surface-subtle)] px-2 py-1 text-[var(--muted)]">
			{children}
		</span>
	);
}

function Message({
	status,
}: {
	status: { error?: string; saved?: string; ran?: string };
}) {
	if (status.error) {
		return (
			<p className="rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-[#ffb4ab]">
				{status.error}
			</p>
		);
	}
	if (status.saved) {
		return (
			<p className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-3 text-sm text-[#7ee3a2]">
				Prompt guardado.
			</p>
		);
	}
	if (status.ran) {
		return (
			<p className="rounded-lg border border-[rgba(244,149,39,0.3)] bg-[var(--brand-soft)] p-3 text-sm text-[var(--brand)]">
				Prompt ejecutado contra {status.ran} LLMs activos.
			</p>
		);
	}
	return null;
}
