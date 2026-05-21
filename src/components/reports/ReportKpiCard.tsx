type KpiDelta = {
	absolute?: number | null;
	relative?: number | null;
};

export function ReportKpiCard({
	label,
	value,
	delta,
	suffix = "",
}: {
	label: string;
	value: string | number;
	delta?: KpiDelta;
	suffix?: string;
}) {
	const absolute = delta?.absolute ?? null;
	const isPositive = typeof absolute === "number" && absolute >= 0;

	return (
		<div className="rounded-md border border-[var(--border)] bg-[var(--surface)] p-4">
			<p className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">
				{label}
			</p>
			<p className="mt-3 text-3xl font-semibold tracking-[-0.04em] text-[var(--foreground)]">
				{value}
			</p>
			{typeof absolute === "number" ? (
				<p
					className={`mt-2 text-xs font-semibold ${isPositive ? "text-emerald-700" : "text-red-700"}`}
				>
					{isPositive ? "+" : ""}
					{absolute}
					{suffix} vs previous month
				</p>
			) : (
				<p className="mt-2 text-xs font-medium text-slate-500">
					Not enough historical data yet
				</p>
			)}
		</div>
	);
}
