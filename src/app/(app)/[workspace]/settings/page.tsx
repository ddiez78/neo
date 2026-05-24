import Link from "next/link";
import { inviteWorkspaceMemberAction } from "@/actions/team";
import { AdminLogsTable } from "@/components/admin/AdminLogsTable";
import { CostDashboard } from "@/components/admin/CostDashboard";
import { AppearanceSettingsPanel } from "@/components/settings/AppearanceSettingsPanel";
import { ExperienceModePanel } from "@/components/settings/ExperienceModePanel";
import { LlmConfigPanel } from "@/components/workspace/LlmConfigPanel";
import { TeamManagementPanel } from "@/components/workspace/TeamManagementPanel";
import { getCostSummary } from "@/lib/analytics/cost";
import { getWorkspaceOverview, requireWorkspace } from "@/lib/data/workspace";
import { getUserPreferences } from "@/lib/preferences-server";

const sections = [
	{ id: "general", label: "General", description: "Workspace, pais e idioma" },
	{ id: "appearance", label: "Apariencia", description: "Tema e idioma UI" },
	{
		id: "experience",
		label: "Experiencia",
		description: "Modo pyme o agencia",
	},
	{ id: "team", label: "Equipo", description: "Usuarios y roles" },
	{
		id: "providers",
		label: "Proveedores IA",
		description: "Modelos y limites",
	},
	{ id: "admin", label: "Admin", description: "Costes y logs" },
];

type SettingsSection = (typeof sections)[number]["id"];

function isSettingsSection(value?: string): value is SettingsSection {
	return sections.some((section) => section.id === value);
}

export default async function Page({
	params,
	searchParams,
}: {
	params: Promise<{ workspace: string }>;
	searchParams: Promise<{
		error?: string;
		saved?: string;
		section?: string;
	}>;
}) {
	const { workspace: slug } = await params;
	const status = await searchParams;
	const workspace = await requireWorkspace(slug);
	const prefs = await getUserPreferences();
	const overview = await getWorkspaceOverview(workspace.id);
	const costSummary = await getCostSummary(workspace.id);
	const activeSection: SettingsSection = isSettingsSection(status.section)
		? status.section
		: "general";
	const failedRuns = overview.runs.filter(
		(run) => run.status === "failed",
	).length;
	const activeProviders = overview.llmConfigs.filter(
		(config) => config.enabled,
	).length;
	const inviteAction = inviteWorkspaceMemberAction.bind(
		null,
		workspace.id,
		workspace.slug,
	);

	return (
		<main className="flex-1 overflow-auto p-4 pb-24 lg:p-6 lg:pb-6">
			<div className="grid gap-6">
				<div>
					<p className="text-xs font-semibold uppercase tracking-[0.08em] text-teal-700">
						Control center
					</p>
					<h1 className="mt-2 text-2xl font-semibold text-[var(--foreground)]">
						Ajustes
					</h1>
					<p className="mt-2 max-w-3xl text-slate-600">
						Configuracion del workspace, equipo, modelos, apariencia y operacion
						tecnica en un unico lugar.
					</p>
				</div>
				{status.error ? (
					<p className="rounded-md bg-red-50 p-3 text-sm text-red-700">
						{status.error}
					</p>
				) : null}
				{status.saved ? (
					<p className="rounded-md bg-emerald-50 p-3 text-sm text-emerald-700">
						Cambios guardados.
					</p>
				) : null}
				<div className="grid gap-5 xl:grid-cols-[280px_1fr]">
					<aside className="neo-card h-fit p-2">
						<nav className="grid gap-1">
							{sections.map((section) => {
								const active = section.id === activeSection;
								return (
									<Link
										className={`rounded-md px-3 py-3 transition ${
											active
												? "bg-[var(--brand-deep)] text-white"
												: "text-slate-600 hover:bg-[var(--surface-subtle)]"
										}`}
										href={`/${workspace.slug}/settings?section=${section.id}`}
										key={section.id}
									>
										<span className="block text-sm font-semibold">
											{section.label}
										</span>
										<span
											className={`mt-1 block text-xs ${
												active ? "text-white/75" : "text-slate-500"
											}`}
										>
											{section.description}
										</span>
									</Link>
								);
							})}
						</nav>
					</aside>
					<div className="grid gap-5">
						{activeSection === "general" ? (
							<section className="neo-card p-5">
								<h2 className="text-lg font-semibold text-[var(--foreground)]">
									General
								</h2>
								<p className="mt-1 text-sm text-slate-500">
									Datos base del workspace usado para separar clientes y
									reporting.
								</p>
								<div className="mt-5 grid gap-3 text-sm text-slate-600 md:grid-cols-2 xl:grid-cols-4">
									<p className="rounded-md bg-[var(--surface-subtle)] p-3">
										<span className="block font-medium text-[var(--foreground)]">
											Nombre
										</span>
										{workspace.name}
									</p>
									<p className="rounded-md bg-[var(--surface-subtle)] p-3">
										<span className="block font-medium text-[var(--foreground)]">
											Slug
										</span>
										{workspace.slug}
									</p>
									<p className="rounded-md bg-[var(--surface-subtle)] p-3">
										<span className="block font-medium text-[var(--foreground)]">
											Idioma workspace
										</span>
										{workspace.locale}
									</p>
									<p className="rounded-md bg-[var(--surface-subtle)] p-3">
										<span className="block font-medium text-[var(--foreground)]">
											Pais
										</span>
										{workspace.country_code}
									</p>
									<p className="rounded-md bg-[var(--surface-subtle)] p-3 md:col-span-2">
										<span className="block font-medium text-[var(--foreground)]">
											Zona horaria
										</span>
										{workspace.timezone}
									</p>
								</div>
							</section>
						) : null}
						{activeSection === "appearance" ? (
							<AppearanceSettingsPanel
								locale={prefs.locale}
								theme={prefs.theme}
							/>
						) : null}
						{activeSection === "experience" ? (
							<ExperienceModePanel
								currentMode={prefs.mode}
								isEn={prefs.locale === "en"}
							/>
						) : null}
						{activeSection === "team" ? (
							<TeamManagementPanel
								action={inviteAction}
								invites={overview.invites}
								members={overview.members}
							/>
						) : null}
						{activeSection === "providers" ? (
							<section>
								<h2 className="mb-3 text-lg font-semibold text-[var(--foreground)]">
									Proveedores IA
								</h2>
								<LlmConfigPanel
									configs={overview.llmConfigs}
									workspaceId={workspace.id}
									workspaceSlug={workspace.slug}
								/>
							</section>
						) : null}
						{activeSection === "admin" ? (
							<section className="grid gap-5">
								<CostDashboard
									isEn={prefs.locale === "en"}
									summary={costSummary}
								/>
								<div className="grid gap-4 md:grid-cols-2">
									<div className="neo-card p-4">
										<p className="text-sm text-slate-500">
											{prefs.locale === "en" ? "Failed runs" : "Runs fallidos"}
										</p>
										<p className="mt-2 text-3xl font-semibold text-[var(--foreground)]">
											{failedRuns}
										</p>
									</div>
									<div className="neo-card p-4">
										<p className="text-sm text-slate-500">
											{prefs.locale === "en"
												? "Active providers"
												: "Proveedores activos"}
										</p>
										<p className="mt-2 text-3xl font-semibold text-[var(--foreground)]">
											{activeProviders}
										</p>
									</div>
								</div>
								<AdminLogsTable runs={overview.runs} />
							</section>
						) : null}
					</div>
				</div>
			</div>
		</main>
	);
}
