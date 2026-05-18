import { LogOut } from "lucide-react";
import Link from "next/link";
import { signOutAction } from "@/actions/auth";
import type { Workspace } from "@/types";
import { WorkspaceSwitcher } from "./WorkspaceSwitcher";

export function TopBar({
	workspace,
	workspaces,
}: {
	workspace: Workspace;
	workspaces: Workspace[];
}) {
	return (
		<header className="flex min-h-16 items-center justify-between border-b border-slate-200 bg-white px-4 lg:px-6">
			<div>
				<p className="text-xs font-medium uppercase tracking-wide text-slate-500">
					Workspace
				</p>
				<h1 className="text-lg font-semibold text-slate-950">
					{workspace.name}
				</h1>
			</div>
			<div className="flex items-center gap-3">
				<WorkspaceSwitcher
					currentSlug={workspace.slug}
					workspaces={workspaces}
				/>
				<Link
					className="hidden rounded-md border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 md:block"
					href="/workspaces"
				>
					Gestionar
				</Link>
				<form action={signOutAction}>
					<button
						className="grid size-9 place-items-center rounded-md border border-slate-200 text-slate-600 hover:bg-slate-50"
						title="Cerrar sesion"
						type="submit"
					>
						<LogOut className="size-4" />
					</button>
				</form>
			</div>
		</header>
	);
}
