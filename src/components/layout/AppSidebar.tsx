"use client";

import {
	BarChart3,
	Bot,
	Building2,
	ClipboardList,
	FileText,
	Gauge,
	Globe2,
	HelpCircle,
	Lightbulb,
	Settings,
	SquareCheckBig,
	Zap,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const navItems = [
	{
		href: "dashboard",
		labelEs: "Overview",
		labelEn: "Overview",
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
	{
		href: "company-bio",
		labelEs: "Company Bio",
		labelEn: "Company Bio",
		icon: Building2,
	},
	{ href: "tasks", labelEs: "Tareas", labelEn: "Tasks", icon: SquareCheckBig },
	{ href: "reports", labelEs: "Informes", labelEn: "Reports", icon: FileText },
	{
		href: "competitors",
		labelEs: "Performance",
		labelEn: "Performance",
		icon: BarChart3,
	},
	{ href: "sources", labelEs: "Fuentes", labelEn: "Sources", icon: Globe2 },
	{ href: "settings", labelEs: "AI Models", labelEn: "AI Models", icon: Bot },
];

export function AppSidebar({
	workspaceSlug,
	locale,
}: {
	workspaceSlug: string;
	locale: "es" | "en";
}) {
	const pathname = usePathname();
	const isEn = locale === "en";

	return (
		<>
			<aside className="fixed left-0 top-0 z-40 hidden h-screen w-64 flex-col border-r border-[var(--sidebar-border)] bg-[var(--sidebar)] text-[var(--sidebar-foreground)] lg:flex">
				<div className="px-6 py-6">
					<Link className="block" href={`/${workspaceSlug}/dashboard`}>
						<Image
							alt="citame.ai"
							className="h-auto w-44 object-contain"
							height={92}
							priority
							src="/brand/citame-logo.png"
							width={320}
						/>
						<span className="mt-2 block text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">
							SEO Intelligence
						</span>
					</Link>
				</div>

				<nav className="flex flex-1 flex-col gap-1 px-3">
					{navItems.map((item) => {
						const Icon = item.icon;
						const href = `/${workspaceSlug}/${item.href}`;
						const active =
							pathname === href || pathname?.startsWith(`${href}/`);
						return (
							<Link
								className={cn(
									"group flex items-center gap-3 border-l-4 px-3 py-2.5 text-xs font-semibold uppercase tracking-[0.04em] transition-all",
									active
										? "border-[var(--brand)] bg-[var(--surface-raised)] text-[var(--brand)] shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]"
										: "border-transparent text-[var(--muted)] hover:border-[rgba(244,149,39,0.42)] hover:bg-[var(--surface-subtle)] hover:text-[var(--foreground)]",
								)}
								href={href}
								key={item.href}
							>
								<Icon className="size-4" />
								{isEn ? item.labelEn : item.labelEs}
							</Link>
						);
					})}
				</nav>

				<div className="mt-auto border-t border-[var(--border)] px-6 py-5">
					<Link
						className="mb-5 flex w-full items-center justify-center gap-2 rounded-lg bg-[var(--brand)] px-4 py-2.5 text-sm font-black text-[#1b1000] shadow-[0_0_22px_rgba(244,149,39,0.22)] transition hover:brightness-110 active:scale-[0.98]"
						href={`/${workspaceSlug}/reports`}
					>
						<Zap className="size-4" />
						{isEn ? "Upgrade Plan" : "Mejorar plan"}
					</Link>
					<div className="grid gap-3 text-xs font-medium text-[var(--muted)]">
						<Link
							className="flex items-center gap-3 transition hover:text-[var(--foreground)]"
							href={`/${workspaceSlug}/settings`}
						>
							<HelpCircle className="size-4" />
							Help
						</Link>
						<Link
							className="flex items-center gap-3 transition hover:text-[var(--foreground)]"
							href={`/${workspaceSlug}/settings`}
						>
							<Settings className="size-4" />
							{isEn ? "Settings" : "Ajustes"}
						</Link>
					</div>
				</div>
			</aside>

			<nav className="fixed inset-x-0 bottom-0 z-40 border-t border-[var(--border)] bg-[rgba(10,25,44,0.94)] px-2 py-2 backdrop-blur-xl lg:hidden">
				<div className="grid grid-cols-5 gap-1">
					{navItems.slice(0, 5).map((item) => {
						const Icon = item.icon;
						const href = `/${workspaceSlug}/${item.href}`;
						const active =
							pathname === href || pathname?.startsWith(`${href}/`);
						return (
							<Link
								className={cn(
									"flex flex-col items-center rounded-lg px-2 py-1.5 text-[10px] font-semibold transition",
									active
										? "bg-[var(--brand-soft)] text-[var(--brand)]"
										: "text-[var(--muted)]",
								)}
								href={href}
								key={item.href}
							>
								<Icon className="mb-1 size-4" />
								<span className="truncate">
									{isEn ? item.labelEn : item.labelEs}
								</span>
							</Link>
						);
					})}
				</div>
			</nav>
		</>
	);
}
