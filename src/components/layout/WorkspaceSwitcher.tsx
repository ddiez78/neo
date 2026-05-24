"use client";

import { Check, ChevronDown, LayoutGrid } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
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
	const [open, setOpen] = useState(false);
	const ref = useRef<HTMLDivElement>(null);
	const current = workspaces.find((w) => w.slug === currentSlug);
	const isEn = locale === "en";

	useEffect(() => {
		function onClickOutside(e: MouseEvent) {
			if (ref.current && !ref.current.contains(e.target as Node)) {
				setOpen(false);
			}
		}
		window.addEventListener("click", onClickOutside);
		return () => window.removeEventListener("click", onClickOutside);
	}, []);

	return (
		<div className="relative" ref={ref}>
			{/* Trigger chip */}
			<button
				className="hidden max-w-[200px] items-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--surface-subtle)] px-3 py-2 text-sm font-medium text-[var(--foreground)] transition hover:border-[var(--brand)] md:inline-flex"
				onClick={() => setOpen((v) => !v)}
				type="button"
			>
				<span className="truncate">{current?.name ?? currentSlug}</span>
				<ChevronDown
					className={`size-3.5 shrink-0 text-[var(--muted)] transition-transform ${open ? "rotate-180" : ""}`}
				/>
			</button>

			{/* Dropdown */}
			{open ? (
				<div className="absolute right-0 top-11 z-50 w-60 overflow-hidden rounded-lg border border-[var(--border)] bg-[var(--surface-raised,_white)] shadow-[0_10px_30px_rgba(0,0,0,0.28)]">
					{/* Workspace list */}
					<div className="py-1">
						{workspaces.map((ws) => (
							<Link
								className="flex items-center gap-3 px-3 py-2.5 text-sm transition hover:bg-[var(--surface-subtle)]"
								href={`/${ws.slug}/dashboard`}
								key={ws.id}
								onClick={() => setOpen(false)}
							>
								<span className="flex size-4 shrink-0 items-center justify-center">
									{ws.slug === currentSlug ? (
										<Check className="size-3.5 text-[var(--brand)]" />
									) : null}
								</span>
								<span
									className={`truncate ${
										ws.slug === currentSlug
											? "font-semibold text-[var(--foreground)]"
											: "text-[var(--muted)]"
									}`}
								>
									{ws.name}
								</span>
							</Link>
						))}
					</div>
					{/* Footer: manage */}
					<div className="border-t border-[var(--border)] py-1">
						<Link
							className="flex items-center gap-3 px-3 py-2.5 text-sm text-[var(--muted)] transition hover:bg-[var(--surface-subtle)] hover:text-[var(--foreground)]"
							href="/workspaces"
							onClick={() => setOpen(false)}
						>
							<LayoutGrid className="size-4" />
							{isEn ? "Manage workspaces" : "Gestionar workspaces"}
						</Link>
					</div>
				</div>
			) : null}
		</div>
	);
}
