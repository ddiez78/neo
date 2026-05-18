import Link from "next/link";
import type { Workspace } from "@/types";

export function WorkspaceSwitcher({
	currentSlug,
	workspaces,
}: {
	currentSlug: string;
	workspaces: Workspace[];
}) {
	return (
		<div className="flex items-center gap-2">
			<span className="text-sm text-slate-500">Cambiar</span>
			<div className="flex overflow-hidden rounded-md border border-slate-200">
				{workspaces.slice(0, 3).map((workspace) => (
					<Link
						className={`px-3 py-2 text-sm font-medium ${workspace.slug === currentSlug ? "bg-slate-950 text-white" : "bg-white text-slate-700 hover:bg-slate-50"}`}
						href={`/${workspace.slug}/dashboard`}
						key={workspace.id}
					>
						{workspace.name}
					</Link>
				))}
			</div>
		</div>
	);
}
