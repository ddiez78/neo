"use client";

import { Info } from "lucide-react";
import { type ReactNode, useState } from "react";
import { getGlossaryEntry } from "@/lib/glossary";

export function GlossaryTip({
	term,
	isEn = false,
	children,
	showIcon = true,
}: {
	term: string;
	isEn?: boolean;
	children?: ReactNode;
	showIcon?: boolean;
}) {
	const [open, setOpen] = useState(false);
	const entry = getGlossaryEntry(term);
	if (!entry) {
		return <>{children}</>;
	}

	const title = isEn ? entry.titleEn : entry.titleEs;
	const desc = isEn ? entry.descEn : entry.descEs;

	return (
		<span className="relative inline-flex items-center gap-1">
			{children}
			{showIcon ? (
				<button
					aria-label={isEn ? `What is ${title}` : `Que es ${title}`}
					className="inline-flex size-3.5 cursor-help items-center justify-center rounded-full text-[var(--muted)] opacity-60 transition hover:opacity-100"
					onBlur={() => setOpen(false)}
					onClick={(e) => {
						e.preventDefault();
						setOpen((v) => !v);
					}}
					onFocus={() => setOpen(true)}
					onMouseEnter={() => setOpen(true)}
					onMouseLeave={() => setOpen(false)}
					type="button"
				>
					<Info className="size-3" />
				</button>
			) : null}
			{open ? (
				<span
					className="absolute left-0 top-full z-50 mt-1.5 w-72 rounded-lg border border-[var(--border)] bg-[var(--surface-raised,_white)] p-3 text-left text-xs shadow-[0_10px_30px_rgba(15,23,42,0.18)]"
					role="tooltip"
				>
					<span className="block text-sm font-semibold text-[var(--foreground)]">
						{title}
					</span>
					<span className="mt-1.5 block leading-relaxed text-[var(--muted)]">
						{desc}
					</span>
				</span>
			) : null}
		</span>
	);
}
