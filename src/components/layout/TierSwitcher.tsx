"use client";

import { BarChart3, Lightbulb, Zap } from "lucide-react";
import { useState } from "react";
import type { AppMode } from "@/lib/preferences";
import { savePreferences } from "@/lib/preferences-client";

type Tier = {
	id: AppMode;
	labelEs: string;
	labelEn: string;
	icon: typeof Lightbulb;
	activeClass: string;
	inactiveHover: string;
};

const TIERS: Tier[] = [
	{
		id: "sme",
		labelEs: "Starter",
		labelEn: "Starter",
		icon: Lightbulb,
		activeClass:
			"bg-teal-500/20 text-teal-300 border-teal-500/50 dark:bg-teal-500/15 dark:text-teal-300",
		inactiveHover: "hover:text-teal-400 hover:border-teal-500/30",
	},
	{
		id: "pro",
		labelEs: "Pro",
		labelEn: "Pro",
		icon: Zap,
		activeClass:
			"bg-indigo-500/20 text-indigo-300 border-indigo-500/50 dark:bg-indigo-500/15 dark:text-indigo-300",
		inactiveHover: "hover:text-indigo-400 hover:border-indigo-500/30",
	},
	{
		id: "agency",
		labelEs: "Agency",
		labelEn: "Agency",
		icon: BarChart3,
		activeClass:
			"bg-[var(--brand-soft)] text-[var(--brand)] border-[var(--brand)]/50",
		inactiveHover:
			"hover:text-[var(--brand)] hover:border-[rgba(244,149,39,0.3)]",
	},
];

export function TierSwitcher({
	currentMode,
	isEn = false,
}: {
	currentMode: AppMode;
	isEn?: boolean;
}) {
	const [saving, setSaving] = useState(false);

	async function switchTo(next: AppMode) {
		if (next === currentMode || saving) return;
		setSaving(true);
		await savePreferences({ mode: next });
		window.location.reload();
	}

	return (
		<div className="px-4 pb-2">
			<p className="mb-1.5 text-[9px] font-black uppercase tracking-[0.2em] text-[var(--muted)]">
				{isEn ? "Your plan" : "Tu plan"}
			</p>
			<div className="grid grid-cols-3 gap-1 rounded-lg border border-[var(--border)] bg-[var(--surface-subtle)] p-1">
				{TIERS.map((tier) => {
					const Icon = tier.icon;
					const isActive = currentMode === tier.id;
					return (
						<button
							className={`group relative flex flex-col items-center justify-center gap-0.5 rounded-md border px-1 py-1.5 text-[10px] font-bold transition disabled:cursor-default ${
								isActive
									? tier.activeClass
									: `border-transparent text-[var(--muted)] ${tier.inactiveHover}`
							}`}
							disabled={saving}
							key={tier.id}
							onClick={() => switchTo(tier.id)}
							title={
								isEn
									? `Switch to ${tier.labelEn} plan`
									: `Cambiar al plan ${tier.labelEs}`
							}
							type="button"
						>
							<Icon className="size-3" />
							<span className="leading-none">
								{isEn ? tier.labelEn : tier.labelEs}
							</span>
						</button>
					);
				})}
			</div>
		</div>
	);
}
