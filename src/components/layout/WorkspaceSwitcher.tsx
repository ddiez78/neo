import Link from "next/link";
import type { Workspace } from "@/types";

export function WorkspaceSwitcher({
	currentSlug,
	workspaces,
	locale,
}: {
	currentSlug: string;
	workspaces: Workspace[];
	locale: "es" | "en";
}) {
	return (
		<div className="hidden items-center gap-2 xl:flex">
			<span className="text-sm text-slate-500">
				{locale === "en" ? "Switch" : "Cambiar"}
			</span>
			<div className="flex overflow-hidden rounded-md border border-[var(--border)]">
				{workspaces.slice(0, 3).map((workspace) => (
					<Link
						className={`px-3 py-2 text-sm font-medium ${workspace.slug === currentSlug ? "bg-[var(--brand-deep)] text-white" : "bg-white text-slate-700 hover:bg-[var(--surface-subtle)]"}`}
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
