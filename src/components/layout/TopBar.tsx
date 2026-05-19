import { LogOut } from "lucide-react";
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
		<header className="flex min-h-16 items-center justify-between border-b border-[var(--border)] bg-[var(--surface)] px-4 lg:px-6">
			<div>
				<p className="text-xs font-semibold uppercase tracking-[0.08em] text-teal-700">
					{isEn ? "Workspace" : "Workspace"}
				</p>
				<h1 className="text-lg font-semibold text-[var(--foreground)]">
					{workspace.name}
				</h1>
			</div>
			<div className="flex items-center gap-3">
				<WorkspaceSwitcher
					currentSlug={workspace.slug}
					locale={locale}
					workspaces={workspaces}
				/>
				<Link
					className="hidden rounded-md border border-[var(--border)] px-3 py-2 text-sm font-medium text-slate-700 hover:bg-[var(--surface-subtle)] md:block"
					href="/workspaces"
				>
					{isEn ? "Manage" : "Gestionar"}
				</Link>
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
						className="grid size-9 place-items-center rounded-md border border-[var(--border)] text-slate-600 hover:bg-[var(--surface-subtle)]"
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
