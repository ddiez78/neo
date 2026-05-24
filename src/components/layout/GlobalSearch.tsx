"use client";

import {
	BarChart3,
	ClipboardList,
	Globe2,
	Lightbulb,
	Loader2,
	Search,
	X,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useId, useRef, useState } from "react";

type SearchResult = {
	kind: "prompt" | "recommendation" | "source" | "competitor";
	id: string;
	title: string;
	subtitle?: string;
	href: string;
};

const KIND_META: Record<
	SearchResult["kind"],
	{
		icon: typeof ClipboardList;
		labelEs: string;
		labelEn: string;
		color: string;
	}
> = {
	prompt: {
		icon: ClipboardList,
		labelEs: "Prompt",
		labelEn: "Prompt",
		color: "text-blue-500",
	},
	recommendation: {
		icon: Lightbulb,
		labelEs: "Recomendacion",
		labelEn: "Recommendation",
		color: "text-amber-500",
	},
	source: {
		icon: Globe2,
		labelEs: "Fuente",
		labelEn: "Source",
		color: "text-cyan-500",
	},
	competitor: {
		icon: BarChart3,
		labelEs: "Competidor",
		labelEn: "Competitor",
		color: "text-orange-500",
	},
};

export function GlobalSearch({
	workspaceId,
	isEn = false,
	placeholder,
}: {
	workspaceId: string;
	isEn?: boolean;
	placeholder?: string;
}) {
	const [open, setOpen] = useState(false);
	const [query, setQuery] = useState("");
	const [results, setResults] = useState<SearchResult[]>([]);
	const [loading, setLoading] = useState(false);
	const inputRef = useRef<HTMLInputElement>(null);
	const inputId = useId();

	useEffect(() => {
		function onKey(e: KeyboardEvent) {
			if ((e.metaKey || e.ctrlKey) && e.key === "k") {
				e.preventDefault();
				setOpen(true);
			}
			if (e.key === "Escape") setOpen(false);
		}
		window.addEventListener("keydown", onKey);
		return () => window.removeEventListener("keydown", onKey);
	}, []);

	useEffect(() => {
		if (open && inputRef.current) {
			inputRef.current.focus();
		}
	}, [open]);

	useEffect(() => {
		if (!open || query.trim().length < 2) {
			setResults([]);
			return;
		}
		setLoading(true);
		const controller = new AbortController();
		const timer = setTimeout(async () => {
			try {
				const res = await fetch(
					`/api/search/${workspaceId}?q=${encodeURIComponent(query)}`,
					{ signal: controller.signal },
				);
				const data = await res.json();
				setResults(data.results ?? []);
			} catch (err) {
				if (err instanceof Error && err.name !== "AbortError") {
					setResults([]);
				}
			} finally {
				setLoading(false);
			}
		}, 250);
		return () => {
			clearTimeout(timer);
			controller.abort();
		};
	}, [query, open, workspaceId]);

	const groupedResults = (
		["prompt", "recommendation", "source", "competitor"] as const
	)
		.map((kind) => ({
			kind,
			items: results.filter((r) => r.kind === kind),
		}))
		.filter((g) => g.items.length > 0);

	return (
		<>
			<button
				className="relative hidden h-9 w-full max-w-md items-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 text-left text-sm text-[var(--muted)] outline-none transition placeholder:text-[var(--muted)] hover:border-[var(--brand)] sm:flex"
				onClick={() => setOpen(true)}
				type="button"
			>
				<Search className="size-4" />
				<span className="flex-1 truncate">
					{placeholder ??
						(isEn
							? "Search prompts, sources, competitors..."
							: "Buscar prompts, fuentes, competidores...")}
				</span>
				<kbd className="hidden rounded border border-[var(--border)] bg-[var(--surface-subtle)] px-1.5 py-0.5 text-[10px] font-semibold text-[var(--muted)] lg:inline-block">
					⌘K
				</kbd>
			</button>
			{open ? (
				<div
					className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
					onClick={(e) => {
						if (e.target === e.currentTarget) setOpen(false);
					}}
					onKeyDown={(e) => {
						if (e.key === "Escape") setOpen(false);
					}}
					role="dialog"
					tabIndex={-1}
				>
					<div className="mx-auto mt-24 w-full max-w-2xl rounded-xl border border-[var(--border)] bg-[var(--surface-raised,_white)] shadow-2xl">
						<div className="flex items-center gap-2 border-b border-[var(--border)] px-4 py-3">
							<Search className="size-4 text-[var(--muted)]" />
							<input
								className="flex-1 bg-transparent text-sm text-[var(--foreground)] outline-none placeholder:text-[var(--muted)]"
								id={inputId}
								onChange={(e) => setQuery(e.target.value)}
								placeholder={
									isEn ? "Search anything..." : "Buscar lo que sea..."
								}
								ref={inputRef}
								type="search"
								value={query}
							/>
							{loading ? (
								<Loader2 className="size-4 animate-spin text-[var(--muted)]" />
							) : null}
							<button
								className="rounded p-1 text-[var(--muted)] hover:text-[var(--foreground)]"
								onClick={() => setOpen(false)}
								type="button"
							>
								<X className="size-4" />
							</button>
						</div>
						<div className="max-h-96 overflow-auto">
							{query.length < 2 ? (
								<div className="px-4 py-8 text-center text-sm text-[var(--muted)]">
									{isEn
										? "Type at least 2 characters to search."
										: "Escribe al menos 2 caracteres para buscar."}
								</div>
							) : groupedResults.length === 0 && !loading ? (
								<div className="px-4 py-8 text-center text-sm text-[var(--muted)]">
									{isEn
										? `No results for "${query}"`
										: `Sin resultados para "${query}"`}
								</div>
							) : (
								<div className="divide-y divide-[var(--border)]">
									{groupedResults.map((group) => {
										const Icon = KIND_META[group.kind].icon;
										return (
											<div key={group.kind}>
												<div className="px-4 pb-1 pt-3 text-[10px] font-bold uppercase tracking-wider text-[var(--muted)]">
													{isEn
														? KIND_META[group.kind].labelEn
														: KIND_META[group.kind].labelEs}
												</div>
												<ul>
													{group.items.map((item) => (
														<li key={item.id}>
															<Link
																className="flex items-center gap-3 px-4 py-2.5 hover:bg-[var(--surface-subtle)]"
																href={item.href}
																onClick={() => setOpen(false)}
															>
																<Icon
																	className={`size-4 shrink-0 ${KIND_META[group.kind].color}`}
																/>
																<div className="min-w-0 flex-1">
																	<p className="truncate text-sm font-medium text-[var(--foreground)]">
																		{item.title}
																	</p>
																	{item.subtitle ? (
																		<p className="truncate text-xs text-[var(--muted)]">
																			{item.subtitle}
																		</p>
																	) : null}
																</div>
															</Link>
														</li>
													))}
												</ul>
											</div>
										);
									})}
								</div>
							)}
						</div>
					</div>
				</div>
			) : null}
		</>
	);
}
