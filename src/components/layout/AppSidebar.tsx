import {
	BarChart3,
	Bot,
	ClipboardList,
	FileText,
	Gauge,
	Globe2,
	Lightbulb,
	Settings,
	SquareCheckBig,
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

const navItems = [
	{
		href: "dashboard",
		labelEs: "Dashboard",
		labelEn: "Dashboard",
		icon: Gauge,
	},
	{
		href: "prompts",
		labelEs: "Prompts",
		labelEn: "Prompts",
		icon: ClipboardList,
	},
	{
		href: "recommendations",
		labelEs: "Recomendaciones",
		labelEn: "Recommendations",
		icon: Lightbulb,
	},
	{ href: "tasks", labelEs: "Tareas", labelEn: "Tasks", icon: SquareCheckBig },
	{ href: "reports", labelEs: "Informes", labelEn: "Reports", icon: FileText },
	{
		href: "competitors",
		labelEs: "Competidores",
		labelEn: "Competitors",
		icon: BarChart3,
	},
	{ href: "sources", labelEs: "Fuentes", labelEn: "Sources", icon: Globe2 },
	{ href: "settings", labelEs: "Ajustes", labelEn: "Settings", icon: Settings },
];

export function AppSidebar({
	workspaceSlug,
	locale,
}: {
	workspaceSlug: string;
	locale: "es" | "en";
}) {
	return (
		<>
			<aside className="hidden w-72 shrink-0 border-r border-[var(--sidebar-border)] bg-[var(--sidebar)] text-[var(--sidebar-foreground)] lg:flex lg:flex-col">
				<div className="flex h-16 items-center gap-3 border-b border-white/10 px-5">
					<div className="grid size-9 place-items-center rounded-md bg-[var(--brand)] text-white">
						<Bot className="size-5" />
					</div>
					<div>
						<p className="text-sm font-semibold tracking-wide text-white">
							NEO GEO
						</p>
						<p className="text-xs text-slate-400">Intelligence</p>
					</div>
				</div>
				<nav className="flex flex-1 flex-col gap-1.5 p-3">
					{navItems.map((item) => {
						const Icon = item.icon;
						return (
							<Link
								className={cn(
									"flex items-center gap-3 rounded-md px-3 py-2.5 text-sm text-slate-300 transition hover:bg-white/8 hover:text-white",
								)}
								href={`/${workspaceSlug}/${item.href}`}
								key={item.href}
							>
								<Icon className="size-4" />
								{locale === "en" ? item.labelEn : item.labelEs}
							</Link>
						);
					})}
				</nav>
			</aside>
			<nav className="fixed inset-x-0 bottom-0 z-40 border-t border-[var(--border)] bg-white/95 px-2 py-2 backdrop-blur lg:hidden">
				<div className="grid grid-cols-5 gap-1">
					{navItems.slice(0, 5).map((item) => {
						const Icon = item.icon;
						return (
							<Link
								className="flex flex-col items-center rounded-md px-2 py-1 text-[11px] font-medium text-slate-600"
								href={`/${workspaceSlug}/${item.href}`}
								key={item.href}
							>
								<Icon className="mb-1 size-4" />
								<span className="truncate">
									{locale === "en" ? item.labelEn : item.labelEs}
								</span>
							</Link>
						);
					})}
				</div>
			</nav>
		</>
	);
}
