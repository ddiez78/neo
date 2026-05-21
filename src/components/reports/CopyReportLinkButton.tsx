"use client";

export function CopyReportLinkButton({ url }: { url: string }) {
	return (
		<button
			className="rounded-md border border-[var(--border)] px-3 py-2 text-sm font-semibold text-slate-700 print:hidden"
			onClick={() => navigator.clipboard.writeText(url)}
			type="button"
		>
			Copy client link
		</button>
	);
}
