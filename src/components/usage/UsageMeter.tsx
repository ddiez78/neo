import Link from "next/link";

interface Props {
	used: number;
	limit: number;
	href?: string;
	compact?: boolean;
	locale?: "es" | "en";
}

function formatNumber(n: number): string {
	return n.toLocaleString("es-ES");
}

function toneFor(pct: number): {
	bar: string;
	text: string;
	border: string;
} {
	if (pct >= 0.8) {
		return {
			bar: "bg-red-500",
			text: "text-red-400",
			border: "border-red-400/40",
		};
	}
	if (pct >= 0.6) {
		return {
			bar: "bg-amber-500",
			text: "text-amber-400",
			border: "border-amber-400/40",
		};
	}
	return {
		bar: "bg-emerald-500",
		text: "text-emerald-400",
		border: "border-emerald-400/30",
	};
}

export function UsageMeter({
	used,
	limit,
	href,
	compact = false,
	locale = "es",
}: Props) {
	const pct = limit > 0 ? Math.min(1, used / limit) : 0;
	const tone = toneFor(pct);
	const isEn = locale === "en";

	if (compact) {
		const content = (
			<span
				className={`inline-flex items-center gap-2 rounded-lg border bg-[var(--surface-subtle)] px-2.5 py-1.5 text-xs font-medium text-[var(--foreground)] transition hover:border-[var(--brand)] ${tone.border}`}
				title={
					isEn
						? "AI executions used this month"
						: "Ejecuciones IA usadas este mes"
				}
			>
				<span className="relative block h-1.5 w-14 overflow-hidden rounded-full bg-[var(--border)]">
					<span
						className={`absolute inset-y-0 left-0 ${tone.bar}`}
						style={{ width: `${pct * 100}%` }}
					/>
				</span>
				<span className={`tabular-nums ${tone.text}`}>
					{formatNumber(used)}/{formatNumber(limit)}
				</span>
			</span>
		);
		return href ? <Link href={href}>{content}</Link> : content;
	}

	return (
		<div className="rounded-lg border border-[var(--border)] bg-[var(--surface-subtle)] p-4">
			<div className="flex items-baseline justify-between">
				<p className="text-sm font-semibold text-[var(--foreground)]">
					{isEn ? "AI executions this month" : "Ejecuciones IA este mes"}
				</p>
				<p className={`text-sm font-bold tabular-nums ${tone.text}`}>
					{formatNumber(used)} / {formatNumber(limit)}
				</p>
			</div>
			<div className="mt-3 h-2 overflow-hidden rounded-full bg-[var(--border)]">
				<div
					className={`h-full transition-all ${tone.bar}`}
					style={{ width: `${pct * 100}%` }}
				/>
			</div>
			<p className="mt-2 text-xs text-[var(--muted)]">
				{pct >= 1
					? isEn
						? "Quota exhausted. New executions are paused until next cycle or plan upgrade."
						: "Cupo agotado. Las ejecuciones nuevas están pausadas hasta el próximo ciclo o hasta que subas de plan."
					: isEn
						? "1 question executed on 1 model = 1 execution."
						: "1 pregunta ejecutada en 1 modelo = 1 ejecución."}
			</p>
		</div>
	);
}
