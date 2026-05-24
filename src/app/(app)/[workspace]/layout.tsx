import { AppSidebar } from "@/components/layout/AppSidebar";
import { TopBar } from "@/components/layout/TopBar";
import { getWorkspaces, requireWorkspace } from "@/lib/data/workspace";
import { getUserPreferences } from "@/lib/preferences-server";

export default async function Layout({
	children,
	params,
}: {
	children: React.ReactNode;
	params: Promise<{ workspace: string }>;
}) {
	const { workspace: workspaceSlug } = await params;
	const workspace = await requireWorkspace(workspaceSlug);
	const workspaces = await getWorkspaces();
	const prefs = await getUserPreferences();

	return (
		<div className="flex min-h-screen bg-[var(--background)]">
			<AppSidebar
				locale={prefs.locale}
				mode={prefs.mode}
				workspaceSlug={workspace.slug}
			/>
			<div className="flex min-w-0 flex-1 flex-col lg:ml-64">
				<TopBar
					locale={prefs.locale}
					mode={prefs.mode}
					theme={prefs.theme}
					workspace={workspace}
					workspaces={workspaces}
				/>
				{children}
			</div>
		</div>
	);
}
