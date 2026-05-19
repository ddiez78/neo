"use client";

export function PrintReportButton() {
	return (
		<button
			className="rounded-md bg-[var(--brand-deep)] px-4 py-2 text-sm font-semibold text-white print:hidden"
			onClick={() => window.print()}
			type="button"
		>
			Export PDF
		</button>
	);
}
