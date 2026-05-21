import { Bell, LogOut, Search, Settings2 } from "lucide-react";
import Link from "next/link";
import { signOutAction } from "@/actions/auth";
import type { AppLocale, AppTheme } from "@/lib/preferences";
import type { Workspace } from "@/types";
import { UserSettingsMenu } from "./UserSettingsMenu";
import { WorkspaceSwitcher } from "./WorkspaceSwitcher";

export function TopBar({
	workspace,
	workspaces,
	locale,
	theme,
}: {
	workspace: Workspace;
	workspaces: Workspace[];
	locale: AppLocale;
	theme: AppTheme;
}) {
	const isEn = locale === "en";

	return (
		<header className="sticky top-0 z-30 flex min-h-16 items-center justify-between border-b border-[var(--border)] bg-[rgba(10,25,44,0.92)] px-4 text-[var(--foreground)] backdrop-blur-xl lg:px-6">
			<div className="flex min-w-0 flex-1 items-center gap-4">
				<div className="hidden min-w-0 md:block">
					<p className="text-[10px] font-black uppercase tracking-[0.18em] text-[var(--brand)]">
						{isEn ? "Workspace" : "Workspace"}
					</p>
					<h1 className="truncate text-base font-bold text-[var(--foreground)]">
						{workspace.name}
					</h1>
				</div>
				<div className="relative hidden w-full max-w-md sm:block">
					<Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[var(--muted)]" />
					<input
						className="h-9 w-full rounded-lg border border-[var(--border)] bg-[var(--background)] pl-9 pr-3 text-sm text-[var(--foreground)] outline-none transition placeholder:text-[var(--muted)] focus:border-[var(--brand)] focus:ring-2 focus:ring-[rgba(244,149,39,0.12)]"
						placeholder={
							isEn
								? "Search signals, prompts, or sources..."
								: "Buscar señales, prompts o fuentes..."
						}
						type="search"
					/>
				</div>
			</div>
			<div className="flex items-center gap-2 md:gap-3">
				<WorkspaceSwitcher
					currentSlug={workspace.slug}
					locale={locale}
					workspaces={workspaces}
				/>
				<Link
					className="hidden rounded-lg border border-[var(--border)] bg-[var(--surface-subtle)] px-3 py-2 text-xs font-bold uppercase tracking-[0.04em] text-[var(--muted)] transition hover:border-[var(--brand)] hover:text-[var(--foreground)] md:block"
					href="/workspaces"
				>
					{isEn ? "Manage" : "Gestionar"}
				</Link>
				<button
					className="relative grid size-9 place-items-center rounded-lg border border-transparent text-[var(--muted)] transition hover:border-[var(--border)] hover:bg-[var(--surface-subtle)] hover:text-[var(--brand)]"
					type="button"
				>
					<Bell className="size-4" />
					<span className="absolute right-2 top-2 size-1.5 rounded-full bg-[var(--brand)]" />
				</button>
				<div className="grid size-9 place-items-center rounded-lg border border-[var(--border)] bg-[var(--surface-subtle)] text-[var(--brand)]">
					<Settings2 className="size-4" />
				</div>
				<UserSettingsMenu
					labels={{
						settings: isEn ? "Settings" : "Ajustes",
						language: isEn ? "Language" : "Idioma",
						theme: isEn ? "Theme" : "Tema",
						light: isEn ? "Light" : "Claro",
						dark: isEn ? "Dark" : "Oscuro",
					}}
					locale={locale}
					theme={theme}
					workspaceSlug={workspace.slug}
				/>
				<form action={signOutAction}>
					<button
						className="grid size-9 place-items-center rounded-lg border border-[var(--border)] text-[var(--muted)] transition hover:border-[var(--brand)] hover:bg-[var(--surface-subtle)] hover:text-[var(--brand)]"
						title={isEn ? "Log out" : "Cerrar sesion"}
						type="submit"
					>
						<LogOut className="size-4" />
					</button>
				</form>
			</div>
		</header>
	);
}
