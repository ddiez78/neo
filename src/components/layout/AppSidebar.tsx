"use client";

import {
	BarChart3,
	Bot,
	Building2,
	ClipboardList,
	FileText,
	Gauge,
	Globe2,
	Lightbulb,
	Sparkles,
	SquareCheckBig,
	TrendingUp,
	Zap,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { AppMode } from "@/lib/preferences";
import { hasAccess, type TierFeature } from "@/lib/tiers";
import { cn } from "@/lib/utils";
import { SupportCard } from "./SupportCard";
import { TierSwitcher } from "./TierSwitcher";

type NavItem = {
	href: string;
	feature: TierFeature;
	labelEs: string;
	labelEn: string;
	icon: typeof Gauge;
};

const NAV_ITEMS: NavItem[] = [
	{
		href: "dashboard",
		feature: "dashboard",
		labelEs: "Inicio",
		labelEn: "Home",
		icon: Gauge,
	},
	{
		href: "prompts",
		feature: "prompts",
		labelEs: "Prompts",
		labelEn: "Prompts",
		icon: ClipboardList,
	},
	{
		href: "recommendations",
		feature: "recommendations",
		labelEs: "Plan de accion",
		labelEn: "Action Plan",
		icon: Lightbulb,
	},
	{
		href: "competitors",
		feature: "competitors",
		labelEs: "Competidores",
		labelEn: "Competitors",
		icon: BarChart3,
	},
	{
		href: "roi",
		feature: "roi",
		labelEs: "ROI",
		labelEn: "ROI",
		icon: TrendingUp,
	},
	{
		href: "tasks",
		feature: "tasks",
		labelEs: "Tareas",
		labelEn: "Tasks",
		icon: SquareCheckBig,
	},
	{
		href: "templates",
		feature: "templates",
		labelEs: "Plantillas",
		labelEn: "Templates",
		icon: Sparkles,
	},
	{
		href: "company-bio",
		feature: "company-bio",
		labelEs: "Company Bio",
		labelEn: "Company Bio",
		icon: Building2,
	},
	{
		href: "sources",
		feature: "sources",
		labelEs: "Fuentes",
		labelEn: "Sources",
		icon: Globe2,
	},
	{
		href: "reports",
		feature: "reports",
		labelEs: "Informes",
		labelEn: "Reports",
		icon: FileText,
	},
	{
		href: "settings",
		feature: "settings",
		labelEs: "Ajustes",
		labelEn: "Settings",
		icon: Bot,
	},
];

export function AppSidebar({
	workspaceSlug,
	locale,
	mode,
}: {
	workspaceSlug: string;
	locale: "es" | "en";
	mode: AppMode;
}) {
	const pathname = usePathname();
	const isEn = locale === "en";
	const tagline =
		mode === "agency"
			? "SEO Intelligence"
			: mode === "pro"
				? "GEO Intelligence"
				: "IA para tu negocio";

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
							{tagline}
						</span>
					</Link>
				</div>

				<TierSwitcher currentMode={mode} isEn={isEn} />

				<nav className="mt-3 flex flex-1 flex-col gap-0.5 px-3">
					{NAV_ITEMS.filter((item) => hasAccess(mode, item.feature)).map(
						(item) => {
							const Icon = item.icon;
							const href = `/${workspaceSlug}/${item.href}`;
							const active =
								pathname === href || pathname?.startsWith(`${href}/`);
							return (
								<Link
									className={cn(
										"group flex items-center gap-3 border-l-4 px-3 py-2 text-xs font-semibold uppercase tracking-[0.04em] transition-all",
										active
											? "border-[var(--brand)] bg-[var(--surface-raised)] text-[var(--brand)] shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]"
											: "border-transparent text-[var(--muted)] hover:border-[rgba(244,149,39,0.42)] hover:bg-[var(--surface-subtle)] hover:text-[var(--foreground)]",
									)}
									href={href}
									key={item.href}
								>
									<Icon className="size-4" />
									<span className="flex-1 truncate">
										{isEn ? item.labelEn : item.labelEs}
									</span>
								</Link>
							);
						},
					)}
				</nav>

				<div className="mt-auto grid gap-3 border-t border-[var(--border)] px-4 py-4">
					<Link
						className="flex w-full items-center justify-center gap-2 rounded-lg bg-[var(--brand)] px-4 py-2.5 text-sm font-black text-[#1b1000] shadow-[0_0_22px_rgba(244,149,39,0.22)] transition hover:brightness-110 active:scale-[0.98]"
						href="/pricing"
					>
						<Zap className="size-4" />
						{isEn ? "View plans" : "Ver planes"}
					</Link>
					<SupportCard isEn={isEn} workspaceSlug={workspaceSlug} />
				</div>
			</aside>

			<nav className="fixed inset-x-0 bottom-0 z-40 border-t border-[var(--border)] bg-[rgba(10,25,44,0.94)] px-2 py-2 backdrop-blur-xl lg:hidden">
				<div className="grid grid-cols-5 gap-1">
					{NAV_ITEMS.filter((i) => hasAccess(mode, i.feature))
						.slice(0, 5)
						.map((item) => {
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
