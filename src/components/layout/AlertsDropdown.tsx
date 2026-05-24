"use client";

import {
	AlertTriangle,
	Bell,
	CheckCircle2,
	Gauge,
	Info,
	Lightbulb,
	TrendingDown,
	Users,
	XCircle,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { markAllAlertsSeenAction } from "@/actions/alerts";
import type { Alert, AlertKind } from "@/types/alerts";

const KIND_ICONS: Record<AlertKind, typeof AlertTriangle> = {
	visibility_drop: TrendingDown,
	new_competitor: Users,
	negative_sentiment: XCircle,
	prompt_failed: AlertTriangle,
	critical_recommendation: Lightbulb,
	cost_spike: AlertTriangle,
	run_complete: CheckCircle2,
	usage_warning: Gauge,
	usage_limit_reached: Gauge,
};

function timeAgo(iso: string, isEn: boolean): string {
	const diff = Date.now() - new Date(iso).getTime();
	const m = Math.floor(diff / 60_000);
	if (m < 1) return isEn ? "just now" : "ahora";
	if (m < 60) return isEn ? `${m}m ago` : `hace ${m}m`;
	const h = Math.floor(m / 60);
	if (h < 24) return isEn ? `${h}h ago` : `hace ${h}h`;
	const d = Math.floor(h / 24);
	return isEn ? `${d}d ago` : `hace ${d}d`;
}

export function AlertsDropdown({
	alerts,
	unseenCount,
	workspaceSlug,
	workspaceId,
	isEn = false,
}: {
	alerts: Alert[];
	unseenCount: number;
	workspaceSlug: string;
	workspaceId: string;
	isEn?: boolean;
}) {
	const [open, setOpen] = useState(false);
	const boxRef = useRef<HTMLDivElement | null>(null);

	useEffect(() => {
		function onClick(event: MouseEvent) {
			if (!boxRef.current) return;
			if (!boxRef.current.contains(event.target as Node)) setOpen(false);
		}
		window.addEventListener("click", onClick);
		return () => window.removeEventListener("click", onClick);
	}, []);

	const recent = alerts.slice(0, 10);

	return (
		<div className="relative" ref={boxRef}>
			<button
				className="relative grid size-9 place-items-center rounded-lg border border-transparent text-[var(--muted)] transition hover:border-[var(--border)] hover:bg-[var(--surface-subtle)] hover:text-[var(--brand)]"
				onClick={() => setOpen((v) => !v)}
				type="button"
			>
				<Bell className="size-4" />
				{unseenCount > 0 ? (
					<span className="absolute right-1 top-1 grid min-h-4 min-w-4 place-items-center rounded-full bg-[var(--brand)] px-1 text-[9px] font-black text-[#1b1000]">
						{unseenCount > 9 ? "9+" : unseenCount}
					</span>
				) : null}
			</button>
			{open ? (
				<div className="absolute right-0 top-11 z-50 w-80 overflow-hidden rounded-lg border border-[var(--border)] bg-[var(--surface-raised,_white)] shadow-[0_10px_30px_rgba(15,23,42,0.18)]">
					<div className="flex items-center justify-between border-b border-[var(--border)] px-4 py-3">
						<p className="text-sm font-bold text-[var(--foreground)]">
							{isEn ? "Notifications" : "Notificaciones"}
						</p>
						{unseenCount > 0 ? (
							<form
								action={async () => {
									await markAllAlertsSeenAction(workspaceSlug, workspaceId);
								}}
							>
								<button
									className="text-xs font-semibold text-[var(--brand)] hover:underline"
									type="submit"
								>
									{isEn ? "Mark all read" : "Marcar leidas"}
								</button>
							</form>
						) : null}
					</div>
					<div className="max-h-96 overflow-auto">
						{recent.length === 0 ? (
							<div className="grid place-items-center px-4 py-10 text-center">
								<Info className="size-6 text-[var(--muted)]" />
								<p className="mt-2 text-sm font-medium text-[var(--foreground)]">
									{isEn ? "All caught up" : "Todo al dia"}
								</p>
								<p className="mt-1 text-xs text-[var(--muted)]">
									{isEn
										? "Alerts will appear here when something changes."
										: "Las alertas apareceran aqui cuando algo cambie."}
								</p>
							</div>
						) : (
							<ul className="divide-y divide-[var(--border)]">
								{recent.map((alert) => {
									const Icon = KIND_ICONS[alert.kind] ?? Info;
									const isUnseen = alert.seen_at === null;
									const severityColor =
										alert.severity === "critical"
											? "text-red-500"
											: alert.severity === "warning"
												? "text-amber-500"
												: "text-blue-500";
									const content = (
										<div className="flex items-start gap-3 px-4 py-3">
											<div
												className={`mt-0.5 grid size-7 shrink-0 place-items-center rounded-full bg-[var(--surface-subtle)] ${severityColor}`}
											>
												<Icon className="size-3.5" />
											</div>
											<div className="min-w-0 flex-1">
												<p
													className={`text-sm ${
														isUnseen
															? "font-bold text-[var(--foreground)]"
															: "font-medium text-[var(--muted)]"
													}`}
												>
													{alert.title}
												</p>
												{alert.message ? (
													<p className="mt-0.5 line-clamp-2 text-xs text-[var(--muted)]">
														{alert.message}
													</p>
												) : null}
												<p className="mt-1 text-[10px] uppercase tracking-wider text-[var(--muted)]">
													{timeAgo(alert.created_at, isEn)}
												</p>
											</div>
											{isUnseen ? (
												<span className="mt-1 size-2 shrink-0 rounded-full bg-[var(--brand)]" />
											) : null}
										</div>
									);
									return (
										<li
											className="hover:bg-[var(--surface-subtle)]"
											key={alert.id}
										>
											{alert.link ? (
												<Link href={alert.link} onClick={() => setOpen(false)}>
													{content}
												</Link>
											) : (
												content
											)}
										</li>
									);
								})}
							</ul>
						)}
					</div>
					<div className="border-t border-[var(--border)] px-4 py-2.5">
						<Link
							className="block text-center text-xs font-semibold text-[var(--brand)] hover:underline"
							href={`/${workspaceSlug}/alerts`}
							onClick={() => setOpen(false)}
						>
							{isEn ? "View all alerts" : "Ver todas las alertas"}
						</Link>
					</div>
				</div>
			) : null}
		</div>
	);
}
