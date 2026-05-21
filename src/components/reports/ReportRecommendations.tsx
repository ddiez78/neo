function textFromItem(item: unknown, key: string) {
	if (!item || typeof item !== "object") return "";
	const value = (item as Record<string, unknown>)[key];
	return typeof value === "string" ? value : "";
}

function numberFromItem(item: unknown, key: string) {
	if (!item || typeof item !== "object") return 0;
	const value = (item as Record<string, unknown>)[key];
	return typeof value === "number" ? value : 0;
}

function listFromItem(item: unknown, key: string) {
	if (!item || typeof item !== "object") return [];
	const value = (item as Record<string, unknown>)[key];
	return Array.isArray(value) ? value.map(String).filter(Boolean) : [];
}

export function ReportRecommendations({
	recommendations,
}: {
	recommendations: unknown[];
}) {
	const groups = ["Quick wins", "Strategic priorities", "Risks to address"];

	return (
		<section className="grid gap-4">
			{groups.map((group) => {
				const items = recommendations.filter(
					(item) => textFromItem(item, "group") === group,
				);
				return (
					<div
						className="rounded-md border border-[var(--border)] bg-[var(--surface)] p-5"
						key={group}
					>
						<h3 className="text-base font-semibold text-[var(--foreground)]">
							{group}
						</h3>
						<div className="mt-4 grid gap-3">
							{items.map((item) => (
								<article
									className="rounded-md bg-[var(--surface-subtle)] p-4"
									key={`${group}-${textFromItem(item, "title")}`}
								>
									<div className="flex flex-wrap items-start justify-between gap-3">
										<div>
											<p className="font-semibold text-[var(--foreground)]">
												{textFromItem(item, "title")}
											</p>
											<p className="mt-2 text-sm leading-6 text-slate-600">
												{textFromItem(item, "description")}
											</p>
										</div>
										<span className="rounded-md bg-white px-2 py-1 text-xs font-semibold text-slate-700">
											Impact {numberFromItem(item, "impact_score").toFixed(0)}
										</span>
									</div>
									{listFromItem(item, "action_items").length > 0 ? (
										<ul className="mt-3 grid gap-1 text-sm text-slate-600">
											{listFromItem(item, "action_items").map((action) => (
												<li key={action}>- {action}</li>
											))}
										</ul>
									) : null}
									{listFromItem(item, "rag_sources").length > 0 ? (
										<div className="mt-3 flex flex-wrap gap-2">
											{listFromItem(item, "rag_sources").map((source) => (
												<span
													className="rounded-md border border-cyan-200 bg-cyan-50 px-2 py-1 text-xs font-medium text-cyan-800"
													key={source}
												>
													{source}
												</span>
											))}
										</div>
									) : null}
								</article>
							))}
							{items.length === 0 ? (
								<p className="text-sm text-slate-500">
									No recommendations in this group.
								</p>
							) : null}
						</div>
					</div>
				);
			})}
		</section>
	);
}
