"use client";

import { Moon, Sun } from "lucide-react";
import type { AppLocale, AppTheme } from "@/lib/preferences";
import { savePreferences } from "@/lib/preferences-client";

export function AppearanceSettingsPanel({
	locale,
	theme,
}: {
	locale: AppLocale;
	theme: AppTheme;
}) {
	async function setLocale(next: AppLocale) {
		await savePreferences({ locale: next });
		window.location.reload();
	}

	async function setTheme(next: AppTheme) {
		await savePreferences({ theme: next });
		document.documentElement.classList.toggle("dark", next === "dark");
		window.location.reload();
	}

	return (
		<section className="neo-card p-5">
			<div>
				<h2 className="text-lg font-semibold text-[var(--foreground)]">
					Apariencia
				</h2>
				<p className="mt-1 text-sm text-slate-500">
					Configura idioma de interfaz y tema visual para esta sesion.
				</p>
			</div>
			<div className="mt-5 grid gap-5 md:grid-cols-2">
				<div>
					<p className="text-sm font-semibold text-[var(--foreground)]">
						Idioma
					</p>
					<div className="mt-3 grid grid-cols-2 gap-2">
						<button
							className={`rounded-md border px-3 py-2 text-sm font-semibold ${locale === "es" ? "border-teal-600 bg-teal-50 text-teal-700" : "border-[var(--border)] text-slate-700"}`}
							onClick={() => setLocale("es")}
							type="button"
						>
							Espanol
						</button>
						<button
							className={`rounded-md border px-3 py-2 text-sm font-semibold ${locale === "en" ? "border-teal-600 bg-teal-50 text-teal-700" : "border-[var(--border)] text-slate-700"}`}
							onClick={() => setLocale("en")}
							type="button"
						>
							English
						</button>
					</div>
				</div>
				<div>
					<p className="text-sm font-semibold text-[var(--foreground)]">Tema</p>
					<div className="mt-3 grid grid-cols-2 gap-2">
						<button
							className={`inline-flex items-center justify-center gap-2 rounded-md border px-3 py-2 text-sm font-semibold ${theme === "light" ? "border-teal-600 bg-teal-50 text-teal-700" : "border-[var(--border)] text-slate-700"}`}
							onClick={() => setTheme("light")}
							type="button"
						>
							<Sun className="size-4" />
							Claro
						</button>
						<button
							className={`inline-flex items-center justify-center gap-2 rounded-md border px-3 py-2 text-sm font-semibold ${theme === "dark" ? "border-teal-600 bg-teal-50 text-teal-700" : "border-[var(--border)] text-slate-700"}`}
							onClick={() => setTheme("dark")}
							type="button"
						>
							<Moon className="size-4" />
							Oscuro
						</button>
					</div>
				</div>
			</div>
		</section>
	);
}
