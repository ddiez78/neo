import Link from "next/link";
import { signInAction } from "@/actions/auth";
import { getUserPreferences } from "@/lib/preferences-server";

export default async function Page({
	searchParams,
}: {
	searchParams: Promise<{ error?: string }>;
}) {
	const params = await searchParams;
	const { locale } = await getUserPreferences();
	const isEn = locale === "en";

	return (
		<main className="relative grid min-h-screen place-items-center overflow-hidden bg-[var(--background)] p-4 sm:p-6">
			<div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,#c9f1ea_0,transparent_40%),radial-gradient(circle_at_80%_0%,#dce9ff_0,transparent_35%)]" />
			<section className="neo-card relative w-full max-w-md p-6 shadow-[0_8px_24px_rgba(16,24,40,0.08)]">
				<p className="text-xs font-semibold uppercase tracking-[0.08em] text-teal-700">
					NEO GEO Intelligence
				</p>
				<h1 className="mt-2 text-2xl font-semibold text-[var(--foreground)]">
					{isEn ? "Sign in" : "Entrar"}
				</h1>
				<p className="mt-2 text-sm text-slate-600">
					{isEn
						? "Access your LLM visibility dashboard."
						: "Accede a tu panel de visibilidad en LLMs."}
				</p>
				{params.error ? (
					<p className="mt-4 rounded-md bg-red-50 p-3 text-sm text-red-700">
						{params.error}
					</p>
				) : null}
				<form action={signInAction} className="mt-6 grid gap-4">
					<label className="grid gap-2 text-sm font-medium text-slate-700">
						Email
						<input
							className="rounded-md border border-[var(--border)] bg-white px-3 py-2 outline-none transition focus:border-teal-600"
							name="email"
							required
							type="email"
						/>
					</label>
					<label className="grid gap-2 text-sm font-medium text-slate-700">
						{isEn ? "Password" : "Password"}
						<input
							className="rounded-md border border-[var(--border)] bg-white px-3 py-2 outline-none transition focus:border-teal-600"
							name="password"
							required
							type="password"
						/>
					</label>
					<button
						className="rounded-md bg-[var(--brand-deep)] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-teal-700"
						type="submit"
					>
						{isEn ? "Sign in" : "Entrar"}
					</button>
				</form>
				<p className="mt-4 text-sm text-slate-500">
					{isEn ? "No account?" : "Sin cuenta?"}{" "}
					<Link className="font-medium text-cyan-700" href="/register">
						{isEn ? "Create account" : "Crear cuenta"}
					</Link>
				</p>
			</section>
		</main>
	);
}
