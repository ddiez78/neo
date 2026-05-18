import Link from "next/link";
import { signInAction } from "@/actions/auth";

export default async function Page({
	searchParams,
}: {
	searchParams: Promise<{ error?: string }>;
}) {
	const params = await searchParams;

	return (
		<main className="grid min-h-screen place-items-center bg-slate-100 p-6">
			<section className="w-full max-w-md rounded-md border border-slate-200 bg-white p-6 shadow-sm">
				<p className="text-sm font-semibold uppercase text-cyan-700">NEO GEO</p>
				<h1 className="mt-2 text-2xl font-semibold text-slate-950">Entrar</h1>
				<p className="mt-2 text-sm text-slate-500">
					Accede a tu panel de visibilidad en LLMs.
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
							className="rounded-md border border-slate-300 px-3 py-2"
							name="email"
							required
							type="email"
						/>
					</label>
					<label className="grid gap-2 text-sm font-medium text-slate-700">
						Password
						<input
							className="rounded-md border border-slate-300 px-3 py-2"
							name="password"
							required
							type="password"
						/>
					</label>
					<button
						className="rounded-md bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800"
						type="submit"
					>
						Entrar
					</button>
				</form>
				<p className="mt-4 text-sm text-slate-500">
					Sin cuenta?{" "}
					<Link className="font-medium text-cyan-700" href="/register">
						Crear cuenta
					</Link>
				</p>
			</section>
		</main>
	);
}
