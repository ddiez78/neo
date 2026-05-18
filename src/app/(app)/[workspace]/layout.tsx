import { AppSidebar } from "@/components/layout/AppSidebar";
import { TopBar } from "@/components/layout/TopBar";
import { getWorkspaces, requireWorkspace } from "@/lib/data/workspace";

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

	return (
		<div className="flex min-h-screen bg-slate-100">
			<AppSidebar workspaceSlug={workspace.slug} />
			<div className="flex min-w-0 flex-1 flex-col">
				<TopBar workspace={workspace} workspaces={workspaces} />
				{children}
			</div>
		</div>
	);
}
