import type { LucideIcon } from "lucide-react";
import Link from "next/link";

export function EmptyState({
	icon: Icon,
	title,
	description,
	primaryHref,
	primaryLabel,
	secondaryHref,
	secondaryLabel,
}: {
	icon: LucideIcon;
	title: string;
	description: string;
	primaryHref?: string;
	primaryLabel?: string;
	secondaryHref?: string;
	secondaryLabel?: string;
}) {
	return (
		<div className="grid place-items-center rounded-xl border border-dashed border-[var(--border)] bg-[var(--surface-subtle)] px-6 py-12 text-center">
			<div className="grid size-14 place-items-center rounded-full bg-[var(--brand-soft)] text-[var(--brand)]">
				<Icon className="size-7" />
			</div>
			<h3 className="mt-4 text-lg font-bold text-[var(--foreground)]">
				{title}
			</h3>
			<p className="mt-1.5 max-w-md text-sm text-[var(--muted)]">
				{description}
			</p>
			{(primaryHref || secondaryHref) && (
				<div className="mt-5 flex flex-wrap items-center justify-center gap-2">
					{primaryHref && primaryLabel ? (
						<Link
							className="inline-flex items-center gap-1.5 rounded-lg bg-[var(--brand)] px-4 py-2 text-sm font-bold text-[#1b1000] transition hover:brightness-110"
							href={primaryHref}
						>
							{primaryLabel}
						</Link>
					) : null}
					{secondaryHref && secondaryLabel ? (
						<Link
							className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--border)] px-4 py-2 text-sm font-bold text-[var(--foreground)] transition hover:border-[var(--brand)]"
							href={secondaryHref}
						>
							{secondaryLabel}
						</Link>
					) : null}
				</div>
			)}
		</div>
	);
}
