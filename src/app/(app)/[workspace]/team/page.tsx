import { TeamManagementPanel } from "@/components/workspace/TeamManagementPanel";
import { getWorkspaceOverview, requireWorkspace } from "@/lib/data/workspace";

export default async function Page({
	params,
}: {
	params: Promise<{ workspace: string }>;
}) {
	const { workspace: slug } = await params;
	const workspace = await requireWorkspace(slug);
	const { members } = await getWorkspaceOverview(workspace.id);

	return (
		<main className="flex-1 overflow-auto p-4 lg:p-6">
			<div className="grid max-w-4xl gap-6">
				<div>
					<h1 className="text-2xl font-semibold text-slate-950">Team</h1>
					<p className="mt-2 text-slate-600">
						Gestion de miembros y permisos del workspace.
					</p>
				</div>
				<TeamManagementPanel members={members} />
			</div>
		</main>
	);
}
