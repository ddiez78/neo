"use client";

import { Check } from "lucide-react";
import { useState } from "react";
import { SECTOR_TEMPLATES, type SectorTemplate } from "@/lib/templates/sectors";

export function SectorTemplatePicker({
	isEn = false,
	onSelect,
	selectedId,
}: {
	isEn?: boolean;
	onSelect?: (template: SectorTemplate | null) => void;
	selectedId?: string | null;
}) {
	const [selected, setSelected] = useState<string | null>(selectedId ?? null);

	function handleClick(template: SectorTemplate) {
		const next = selected === template.id ? null : template.id;
		setSelected(next);
		onSelect?.(next === null ? null : template);
	}

	return (
		<div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
			{SECTOR_TEMPLATES.map((template) => {
				const isActive = selected === template.id;
				return (
					<button
						className={`group relative flex flex-col items-start gap-2 rounded-xl border-2 p-4 text-left transition ${
							isActive
								? "border-[var(--brand)] bg-[var(--brand-soft)]"
								: "border-[var(--border)] bg-[var(--surface-subtle)] hover:border-[var(--brand)]"
						}`}
						key={template.id}
						onClick={() => handleClick(template)}
						type="button"
					>
						<div className="flex w-full items-start justify-between">
							<span className="text-2xl">{template.emoji}</span>
							{isActive ? (
								<div className="grid size-5 place-items-center rounded-full bg-[var(--brand)] text-[#1b1000]">
									<Check className="size-3" />
								</div>
							) : null}
						</div>
						<p className="text-sm font-bold text-[var(--foreground)]">
							{isEn ? template.nameEn : template.nameEs}
						</p>
						<p className="text-xs text-[var(--muted)]">
							{isEn ? template.descEn : template.descEs}
						</p>
						<div className="mt-1 flex flex-wrap gap-1 text-[10px]">
							<span className="rounded-full bg-white px-2 py-0.5 font-bold text-[var(--muted)] dark:bg-slate-900">
								{template.prompts.length} {isEn ? "prompts" : "prompts"}
							</span>
							<span className="rounded-full bg-white px-2 py-0.5 font-bold text-[var(--muted)] dark:bg-slate-900">
								{template.competitorExamples.length}{" "}
								{isEn ? "competitors" : "competidores"}
							</span>
						</div>
					</button>
				);
			})}
		</div>
	);
}
