import { ArrowRight, Check, Lock } from "lucide-react";
import Link from "next/link";
import { LOCKED_COPY } from "@/lib/locked-copy";
import { minTierFor, minTierLabel, type TierFeature } from "@/lib/tiers";
import { UpgradeTierButton } from "./UpgradeTierButton";

export function LockedFeature({
	feature,
	isEn = false,
}: {
	feature: TierFeature;
	isEn?: boolean;
}) {
	const copy = LOCKED_COPY[feature];
	const tierName = minTierLabel(feature);
	const targetMode = minTierFor(feature);
	const tierColor =
		targetMode === "agency"
			? "border-[var(--brand)]/40 bg-[var(--brand-soft)]"
			: targetMode === "pro"
				? "border-indigo-500/30 bg-indigo-500/10 dark:bg-indigo-950/30"
				: "border-teal-500/30 bg-teal-500/10";

	if (!copy) {
		return (
			<main className="flex-1 overflow-auto p-4 pb-24 lg:p-6 lg:pb-8">
				<div className="mx-auto grid max-w-2xl place-items-center py-16 text-center">
					<Lock className="size-12 text-[var(--muted)]" />
					<h1 className="mt-4 text-2xl font-black text-[var(--foreground)]">
						{isEn ? `Available in ${tierName}` : `Disponible en ${tierName}`}
					</h1>
				</div>
			</main>
		);
	}

	const title = isEn ? copy.titleEn : copy.titleEs;
	const desc = isEn ? copy.descEn : copy.descEs;
	const bullets = isEn ? copy.bulletsEn : copy.bulletsEs;

	return (
		<main className="flex-1 overflow-auto p-4 pb-24 lg:p-6 lg:pb-8">
			<div className="mx-auto grid max-w-2xl gap-6 py-12">
				<section
					className={`relative overflow-hidden rounded-2xl border-2 p-8 text-center shadow-lg ${tierColor}`}
				>
					<div className="absolute -right-8 -top-8 size-40 rounded-full bg-white/10 blur-3xl" />
					<div className="relative">
						<div className="mx-auto grid size-16 place-items-center rounded-2xl bg-white/80 text-[var(--brand)] shadow-sm dark:bg-slate-900/60">
							<Lock className="size-7" />
						</div>
						<p className="mt-5 text-[10px] font-black uppercase tracking-[0.24em] text-[var(--brand)]">
							{isEn ? `Available in ${tierName}` : `Disponible en ${tierName}`}
						</p>
						<h1 className="mt-2 text-3xl font-black tracking-[-0.02em] text-[var(--foreground)]">
							{title}
						</h1>
						<p className="mx-auto mt-3 max-w-md text-sm text-[var(--muted)]">
							{desc}
						</p>
					</div>
				</section>

				<section className="neo-card p-6">
					<h2 className="text-sm font-bold text-[var(--foreground)]">
						{isEn ? `What you unlock` : `Lo que desbloqueas`}
					</h2>
					<ul className="mt-4 grid gap-3">
						{bullets.map((b) => (
							<li
								className="flex items-start gap-3 text-sm text-[var(--foreground)]"
								key={b}
							>
								<Check className="mt-0.5 size-4 shrink-0 text-emerald-500" />
								<span>{b}</span>
							</li>
						))}
					</ul>
				</section>

				<section className="flex flex-col items-center gap-3">
					<UpgradeTierButton
						isEn={isEn}
						label={isEn ? `Switch to ${tierName}` : `Cambiar a ${tierName}`}
						targetMode={targetMode}
					/>
					<Link
						className="inline-flex items-center gap-1 text-sm font-semibold text-[var(--muted)] hover:text-[var(--brand)]"
						href="/pricing"
					>
						{isEn ? "Compare all plans" : "Ver todos los planes"}
						<ArrowRight className="size-3.5" />
					</Link>
				</section>
			</div>
		</main>
	);
}
