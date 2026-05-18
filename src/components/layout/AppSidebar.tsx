import {
	BarChart3,
	Bot,
	Building2,
	ClipboardList,
	FlaskConical,
	Gauge,
	Globe2,
	Settings,
	ShieldCheck,
	Users,
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

const navItems = [
	{ href: "dashboard", label: "Dashboard", icon: Gauge },
	{ href: "company-bio", label: "Company Bio", icon: Building2 },
	{ href: "prompts", label: "Prompts", icon: ClipboardList },
	{ href: "prompt-research", label: "Prompt Research", icon: FlaskConical },
	{ href: "competitors", label: "Competitors", icon: BarChart3 },
	{ href: "sources", label: "Sources", icon: Globe2 },
	{ href: "team", label: "Team", icon: Users },
	{ href: "settings", label: "Settings", icon: Settings },
	{ href: "admin", label: "Admin", icon: ShieldCheck },
];

export function AppSidebar({ workspaceSlug }: { workspaceSlug: string }) {
	return (
		<aside className="hidden w-64 shrink-0 border-r border-slate-200 bg-slate-950 text-white lg:flex lg:flex-col">
			<div className="flex h-16 items-center gap-3 border-b border-white/10 px-5">
				<div className="grid size-9 place-items-center rounded-md bg-cyan-400 text-slate-950">
					<Bot className="size-5" />
				</div>
				<div>
					<p className="text-sm font-semibold">NEO GEO</p>
					<p className="text-xs text-slate-400">LLM visibility ops</p>
				</div>
			</div>
			<nav className="flex flex-1 flex-col gap-1 p-3">
				{navItems.map((item) => {
					const Icon = item.icon;
					return (
						<Link
							className={cn(
								"flex items-center gap-3 rounded-md px-3 py-2 text-sm text-slate-300 transition hover:bg-white/10 hover:text-white",
							)}
							href={`/${workspaceSlug}/${item.href}`}
							key={item.href}
						>
							<Icon className="size-4" />
							{item.label}
						</Link>
					);
				})}
			</nav>
		</aside>
	);
}
