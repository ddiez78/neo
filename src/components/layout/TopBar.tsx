import { Settings2 } from "lucide-react";
import Link from "next/link";
import { getAlerts } from "@/lib/data/alerts";
import type { AppLocale, AppMode, AppTheme } from "@/lib/preferences";
import type { Workspace } from "@/types";
import { AlertsDropdown } from "./AlertsDropdown";
import { GlobalSearch } from "./GlobalSearch";
import { UserSettingsMenu } from "./UserSettingsMenu";
import { WorkspaceSwitcher } from "./WorkspaceSwitcher";

export async function TopBar({
	workspace,
	workspaces,
	locale,
	theme,
	mode,
}: {
	workspace: Workspace;
	workspaces: Workspace[];
	locale: AppLocale;
	theme: AppTheme;
	mode: AppMode;
}) {
	const isEn = locale === "en";
	const alerts = await getAlerts(workspace.id, 20).catch(() => []);
	const unseenCount = alerts.filter((a) => a.seen_at === null).length;

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
				<GlobalSearch isEn={isEn} workspaceId={workspace.id} />
			</div>
			<div className="flex items-center gap-2 md:gap-3">
				<WorkspaceSwitcher
					currentSlug={workspace.slug}
					locale={locale}
					workspaces={workspaces}
				/>
				<AlertsDropdown
					alerts={alerts}
					isEn={isEn}
					unseenCount={unseenCount}
					workspaceId={workspace.id}
					workspaceSlug={workspace.slug}
				/>
				<Link
					className="grid size-9 place-items-center rounded-lg border border-[var(--border)] bg-[var(--surface-subtle)] text-[var(--brand)] transition hover:border-[var(--brand)]"
					href={`/${workspace.slug}/settings`}
					title={isEn ? "Settings" : "Ajustes"}
				>
					<Settings2 className="size-4" />
				</Link>
				<UserSettingsMenu
					labels={{
						settings: isEn ? "Settings" : "Ajustes",
						language: isEn ? "Language" : "Idioma",
						theme: isEn ? "Theme" : "Tema",
						light: isEn ? "Light" : "Claro",
						dark: isEn ? "Dark" : "Oscuro",
						mode: isEn ? "Mode" : "Modo",
						modeSme: isEn ? "SME" : "Pyme",
						modePro: "Pro",
						modeAgency: isEn ? "Agency" : "Agencia",
						logout: isEn ? "Log out" : "Cerrar sesión",
					}}
					locale={locale}
					mode={mode}
					theme={theme}
					workspaceSlug={workspace.slug}
				/>
			</div>
		</header>
	);
}
