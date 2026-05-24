import { BookOpen, HelpCircle, Mail } from "lucide-react";
import Link from "next/link";

export function SupportCard({
	workspaceSlug,
	isEn = false,
}: {
	workspaceSlug: string;
	isEn?: boolean;
}) {
	return (
		<div className="rounded-xl border border-[var(--border)] bg-[var(--surface-subtle)] p-3.5">
			<div className="flex items-center gap-2">
				<div className="grid size-7 place-items-center rounded-lg bg-[var(--brand-soft)] text-[var(--brand)]">
					<HelpCircle className="size-3.5" />
				</div>
				<p className="text-[11px] font-bold text-[var(--foreground)]">
					{isEn ? "Need help?" : "¿Necesitas ayuda?"}
				</p>
			</div>
			<ul className="mt-3 grid gap-1.5 text-[11px] font-medium text-[var(--muted)]">
				<li>
					<Link
						className="flex items-center gap-2 transition hover:text-[var(--foreground)]"
						href={`/${workspaceSlug}/help`}
					>
						<BookOpen className="size-3" />
						{isEn ? "User guide" : "Guía de uso"}
					</Link>
				</li>
				<li>
					<Link
						className="flex items-center gap-2 transition hover:text-[var(--foreground)]"
						href={`/${workspaceSlug}/help#glosario`}
					>
						<BookOpen className="size-3" />
						{isEn ? "GEO Glossary" : "Glosario GEO"}
					</Link>
				</li>
				<li>
					<a
						className="flex items-center gap-2 transition hover:text-[var(--foreground)]"
						href="mailto:hello@neo-geo.app"
					>
						<Mail className="size-3" />
						{isEn ? "Contact" : "Contactar"}
					</a>
				</li>
			</ul>
		</div>
	);
}
