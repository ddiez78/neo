"use client";

import {
	ChevronDown,
	LogOut,
	Moon,
	Settings,
	Sun,
	UserCircle2,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { signOutAction } from "@/actions/auth";
import type { AppLocale, AppMode, AppTheme } from "@/lib/preferences";
import { savePreferences } from "@/lib/preferences-client";

type Labels = {
	settings: string;
	language: string;
	theme: string;
	light: string;
	dark: string;
	mode: string;
	modeSme: string;
	modePro: string;
	modeAgency: string;
	logout: string;
};

export function UserSettingsMenu({
	workspaceSlug,
	locale,
	theme,
	mode,
	labels,
}: {
	workspaceSlug: string;
	locale: AppLocale;
	theme: AppTheme;
	mode: AppMode;
	labels: Labels;
}) {
	const [open, setOpen] = useState(false);
	const boxRef = useRef<HTMLDivElement | null>(null);

	useEffect(() => {
		function onClick(event: MouseEvent) {
			if (!boxRef.current) return;
			if (!boxRef.current.contains(event.target as Node)) {
				setOpen(false);
			}
		}
		window.addEventListener("click", onClick);
		return () => window.removeEventListener("click", onClick);
	}, []);

	async function setLocale(next: AppLocale) {
		await savePreferences({ locale: next });
		window.location.reload();
	}

	async function setTheme(next: AppTheme) {
		await savePreferences({ theme: next });
		document.documentElement.classList.toggle("dark", next === "dark");
		window.location.reload();
	}

	async function setMode(next: AppMode) {
		await savePreferences({ mode: next });
		window.location.reload();
	}

	return (
		<div className="relative" ref={boxRef}>
			<button
				className="inline-flex items-center gap-1 rounded-md border border-[var(--border)] bg-white px-2.5 py-1.5 text-sm text-slate-700 hover:bg-[var(--surface-subtle)]"
				onClick={() => setOpen((value) => !value)}
				type="button"
			>
				<UserCircle2 className="size-4" />
				<ChevronDown className="size-3.5" />
			</button>
			{open ? (
				<div className="absolute right-0 top-11 z-50 w-64 rounded-md border border-[var(--border)] bg-white p-3 shadow-[0_10px_30px_rgba(15,23,42,0.14)]">
					<Link
						className="mb-3 flex items-center gap-2 rounded-md bg-[var(--surface-subtle)] px-3 py-2 text-sm font-medium text-slate-700"
						href={`/${workspaceSlug}/settings`}
						onClick={() => setOpen(false)}
					>
						<Settings className="size-4" />
						{labels.settings}
					</Link>
					<div className="mb-2 text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">
						{labels.language}
					</div>
					<div className="mb-3 grid grid-cols-2 gap-2">
						<button
							className={`rounded-md border px-2 py-1.5 text-sm ${locale === "es" ? "border-teal-600 bg-teal-50 text-teal-700" : "border-[var(--border)] text-slate-700"}`}
							onClick={() => setLocale("es")}
							type="button"
						>
							ES
						</button>
						<button
							className={`rounded-md border px-2 py-1.5 text-sm ${locale === "en" ? "border-teal-600 bg-teal-50 text-teal-700" : "border-[var(--border)] text-slate-700"}`}
							onClick={() => setLocale("en")}
							type="button"
						>
							EN
						</button>
					</div>
					<div className="mb-2 text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">
						{labels.theme}
					</div>
					<div className="mb-3 grid grid-cols-2 gap-2">
						<button
							className={`inline-flex items-center justify-center gap-1 rounded-md border px-2 py-1.5 text-sm ${theme === "light" ? "border-teal-600 bg-teal-50 text-teal-700" : "border-[var(--border)] text-slate-700"}`}
							onClick={() => setTheme("light")}
							type="button"
						>
							<Sun className="size-3.5" />
							{labels.light}
						</button>
						<button
							className={`inline-flex items-center justify-center gap-1 rounded-md border px-2 py-1.5 text-sm ${theme === "dark" ? "border-teal-600 bg-teal-50 text-teal-700" : "border-[var(--border)] text-slate-700"}`}
							onClick={() => setTheme("dark")}
							type="button"
						>
							<Moon className="size-3.5" />
							{labels.dark}
						</button>
					</div>
					<div className="mb-2 text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">
						{labels.mode}
					</div>
					<div className="grid grid-cols-3 gap-1.5">
						<button
							className={`rounded-md border px-1.5 py-1.5 text-xs ${mode === "sme" ? "border-teal-600 bg-teal-50 text-teal-700" : "border-[var(--border)] text-slate-700"}`}
							onClick={() => setMode("sme")}
							type="button"
						>
							{labels.modeSme}
						</button>
						<button
							className={`rounded-md border px-1.5 py-1.5 text-xs ${mode === "pro" ? "border-indigo-600 bg-indigo-50 text-indigo-700" : "border-[var(--border)] text-slate-700"}`}
							onClick={() => setMode("pro")}
							type="button"
						>
							{labels.modePro}
						</button>
						<button
							className={`rounded-md border px-1.5 py-1.5 text-xs ${mode === "agency" ? "border-teal-600 bg-teal-50 text-teal-700" : "border-[var(--border)] text-slate-700"}`}
							onClick={() => setMode("agency")}
							type="button"
						>
							{labels.modeAgency}
						</button>
					</div>
					<div className="mt-3 border-t border-[var(--border)] pt-2">
						<form action={signOutAction}>
							<button
								className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-[var(--danger)] transition hover:bg-[var(--surface-subtle)]"
								type="submit"
							>
								<LogOut className="size-4" />
								{labels.logout}
							</button>
						</form>
					</div>
				</div>
			) : null}
		</div>
	);
}
