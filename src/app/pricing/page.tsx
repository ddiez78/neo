import { ArrowRight, Check } from "lucide-react";
import Link from "next/link";

// ─── Icon components ─────────────────────────────────────────────────────────

function StarterIcon() {
	return (
		<svg
			aria-hidden="true"
			fill="none"
			height="44"
			viewBox="0 0 44 44"
			width="44"
			xmlns="http://www.w3.org/2000/svg"
		>
			<style>{`
				@keyframes starter-pulse {
					0%, 100% { opacity: .9; transform: scale(1); }
					50% { opacity: 1; transform: scale(1.08); }
				}
				@keyframes starter-ring {
					0% { transform: rotate(0deg); }
					100% { transform: rotate(360deg); }
				}
				.starter-core { animation: starter-pulse 2.8s ease-in-out infinite; transform-origin: 22px 22px; }
				.starter-ring { animation: starter-ring 8s linear infinite; transform-origin: 22px 22px; }
			`}</style>
			{/* Outer glow ring */}
			<circle
				className="starter-ring"
				cx="22"
				cy="22"
				fill="none"
				r="19"
				stroke="url(#sg1)"
				strokeDasharray="6 4"
				strokeWidth="1"
			/>
			{/* Mid ring */}
			<circle
				cx="22"
				cy="22"
				fill="none"
				r="14"
				stroke="url(#sg2)"
				strokeOpacity="0.5"
				strokeWidth="1.5"
			/>
			{/* Core bulb shape */}
			<g className="starter-core">
				<circle cx="22" cy="20" fill="url(#sg3)" r="7" />
				{/* Filament lines */}
				<rect fill="#0891b2" height="2" rx="1" width="6" x="19" y="27" />
				<rect fill="#0e7490" height="2" rx="1" width="6" x="19" y="29" />
				{/* Shine */}
				<ellipse
					cx="19.5"
					cy="17.5"
					fill="white"
					fillOpacity="0.45"
					rx="2"
					ry="1.2"
				/>
			</g>
			<defs>
				<linearGradient
					gradientUnits="userSpaceOnUse"
					id="sg1"
					x1="3"
					x2="41"
					y1="3"
					y2="41"
				>
					<stop offset="0%" stopColor="#22d3ee" />
					<stop offset="100%" stopColor="#0891b2" stopOpacity="0" />
				</linearGradient>
				<linearGradient
					gradientUnits="userSpaceOnUse"
					id="sg2"
					x1="8"
					x2="36"
					y1="8"
					y2="36"
				>
					<stop offset="0%" stopColor="#67e8f9" />
					<stop offset="100%" stopColor="#0891b2" />
				</linearGradient>
				<radialGradient
					cx="35%"
					cy="30%"
					gradientUnits="objectBoundingBox"
					id="sg3"
					r="80%"
				>
					<stop offset="0%" stopColor="#a5f3fc" />
					<stop offset="55%" stopColor="#06b6d4" />
					<stop offset="100%" stopColor="#0e7490" />
				</radialGradient>
			</defs>
		</svg>
	);
}

function ProIcon() {
	return (
		<svg
			aria-hidden="true"
			fill="none"
			height="44"
			viewBox="0 0 44 44"
			width="44"
			xmlns="http://www.w3.org/2000/svg"
		>
			<style>{`
				@keyframes pro-zap { 0%,100%{opacity:.85;transform:translateY(0)} 45%{opacity:1;transform:translateY(-2px)} 55%{transform:translateY(1px)} }
				@keyframes pro-arc { 0%{stroke-dashoffset:60} 100%{stroke-dashoffset:0} }
				@keyframes pro-spark { 0%,100%{opacity:0;transform:scale(0.5)} 50%{opacity:1;transform:scale(1)} }
				.pro-bolt { animation: pro-zap 1.8s ease-in-out infinite; transform-origin: 22px 22px; }
				.pro-arc { animation: pro-arc 2s ease-out forwards; }
				.pro-spark1 { animation: pro-spark 1.8s 0.2s ease-in-out infinite; transform-origin: 32px 12px; }
				.pro-spark2 { animation: pro-spark 1.8s 0.7s ease-in-out infinite; transform-origin: 12px 32px; }
			`}</style>
			{/* Hexagon base */}
			<path
				d="M22 3l17.32 10v20L22 43 4.68 33V13z"
				fill="url(#pg1)"
				fillOpacity="0.18"
				stroke="url(#pg2)"
				strokeWidth="1.2"
			/>
			{/* Inner hex */}
			<path
				d="M22 9l12.12 7v14L22 37 9.88 30V16z"
				fill="url(#pg3)"
				fillOpacity="0.25"
			/>
			{/* Bolt */}
			<g className="pro-bolt">
				<path
					d="M25.5 10L17 23h7.5L18.5 34 29 19h-7.5z"
					fill="url(#pg4)"
					stroke="url(#pg5)"
					strokeLinejoin="round"
					strokeWidth="0.5"
				/>
			</g>
			{/* Arc sparks */}
			<circle className="pro-spark1" cx="32" cy="12" fill="#fbbf24" r="2" />
			<circle className="pro-spark2" cx="12" cy="32" fill="#f97316" r="1.5" />
			<defs>
				<linearGradient
					gradientUnits="userSpaceOnUse"
					id="pg1"
					x1="4"
					x2="40"
					y1="3"
					y2="43"
				>
					<stop offset="0%" stopColor="#fef3c7" />
					<stop offset="100%" stopColor="#f97316" />
				</linearGradient>
				<linearGradient
					gradientUnits="userSpaceOnUse"
					id="pg2"
					x1="4"
					x2="40"
					y1="3"
					y2="43"
				>
					<stop offset="0%" stopColor="#fde68a" />
					<stop offset="100%" stopColor="#ea580c" stopOpacity="0.6" />
				</linearGradient>
				<linearGradient
					gradientUnits="userSpaceOnUse"
					id="pg3"
					x1="10"
					x2="34"
					y1="9"
					y2="37"
				>
					<stop offset="0%" stopColor="#fef9c3" stopOpacity="0.5" />
					<stop offset="100%" stopColor="#f97316" stopOpacity="0.1" />
				</linearGradient>
				<linearGradient
					gradientUnits="userSpaceOnUse"
					id="pg4"
					x1="17"
					x2="29"
					y1="10"
					y2="34"
				>
					<stop offset="0%" stopColor="#fef08a" />
					<stop offset="45%" stopColor="#f59e0b" />
					<stop offset="100%" stopColor="#ea580c" />
				</linearGradient>
				<linearGradient
					gradientUnits="userSpaceOnUse"
					id="pg5"
					x1="17"
					x2="29"
					y1="10"
					y2="34"
				>
					<stop offset="0%" stopColor="#fde68a" />
					<stop offset="100%" stopColor="#fb923c" />
				</linearGradient>
			</defs>
		</svg>
	);
}

function AgencyIcon() {
	return (
		<svg
			aria-hidden="true"
			fill="none"
			height="44"
			viewBox="0 0 44 44"
			width="44"
			xmlns="http://www.w3.org/2000/svg"
		>
			<style>{`
				@keyframes ag-bar1 { 0%,100%{transform:scaleY(1)} 50%{transform:scaleY(1.18)} }
				@keyframes ag-bar2 { 0%,100%{transform:scaleY(1)} 50%{transform:scaleY(0.82)} }
				@keyframes ag-bar3 { 0%,100%{transform:scaleY(1)} 50%{transform:scaleY(1.12)} }
				@keyframes ag-orbit { 0%{transform:rotate(0deg)} 100%{transform:rotate(360deg)} }
				.ag-b1 { animation: ag-bar1 2.2s ease-in-out infinite; transform-origin: 14px 34px; }
				.ag-b2 { animation: ag-bar2 2.2s 0.4s ease-in-out infinite; transform-origin: 22px 34px; }
				.ag-b3 { animation: ag-bar3 2.2s 0.8s ease-in-out infinite; transform-origin: 30px 34px; }
				.ag-orbit { animation: ag-orbit 6s linear infinite; transform-origin: 22px 22px; }
			`}</style>
			{/* Background arc */}
			<path
				d="M8 38 A16 16 0 0 1 36 38"
				fill="none"
				stroke="url(#agg1)"
				strokeLinecap="round"
				strokeWidth="2"
				opacity="0.35"
			/>
			{/* Bars */}
			<rect
				className="ag-b1"
				fill="url(#agg2)"
				height="16"
				rx="2"
				width="6"
				x="11"
				y="18"
			/>
			<rect
				className="ag-b2"
				fill="url(#agg3)"
				height="22"
				rx="2"
				width="6"
				x="19"
				y="12"
			/>
			<rect
				className="ag-b3"
				fill="url(#agg4)"
				height="12"
				rx="2"
				width="6"
				x="27"
				y="22"
			/>
			{/* Orbit dot */}
			<g className="ag-orbit">
				<circle cx="22" cy="6" fill="#fb923c" r="2.5" />
			</g>
			{/* Top dot accent */}
			<circle cx="22" cy="10" fill="#fde68a" fillOpacity="0.5" r="1.5" />
			<defs>
				<linearGradient
					gradientUnits="userSpaceOnUse"
					id="agg1"
					x1="8"
					x2="36"
					y1="30"
					y2="38"
				>
					<stop offset="0%" stopColor="#fb923c" />
					<stop offset="100%" stopColor="#f43f5e" />
				</linearGradient>
				<linearGradient
					gradientUnits="userSpaceOnUse"
					id="agg2"
					x1="11"
					x2="17"
					y1="18"
					y2="34"
				>
					<stop offset="0%" stopColor="#fdba74" />
					<stop offset="100%" stopColor="#ea580c" />
				</linearGradient>
				<linearGradient
					gradientUnits="userSpaceOnUse"
					id="agg3"
					x1="19"
					x2="25"
					y1="12"
					y2="34"
				>
					<stop offset="0%" stopColor="#fca5a1" />
					<stop offset="100%" stopColor="#f43f5e" />
				</linearGradient>
				<linearGradient
					gradientUnits="userSpaceOnUse"
					id="agg4"
					x1="27"
					x2="33"
					y1="22"
					y2="34"
				>
					<stop offset="0%" stopColor="#fcd34d" />
					<stop offset="100%" stopColor="#fb923c" />
				</linearGradient>
			</defs>
		</svg>
	);
}

type Tier = {
	id: "starter" | "pro" | "agency";
	name: string;
	priceMonth: number;
	priceLabel: string;
	tagline: string;
	features: { text: string; included: boolean }[];
	cta: string;
	highlighted?: boolean;
};

const TIERS_ES: Tier[] = [
	{
		id: "starter",
		name: "Starter",
		priceMonth: 19,
		priceLabel: "19€/mes",
		tagline: "Para dueños de pyme y negocios locales",
		features: [
			{ text: "1 workspace", included: true },
			{ text: "Hasta 20 prompts activos", included: true },
			{ text: "Hasta 3 competidores", included: true },
			{ text: "2 LLMs (ChatGPT + 1)", included: true },
			{ text: "Dashboard de visibilidad GEO", included: true },
			{ text: "Recomendaciones criticas", included: true },
			{ text: "Historico 30 dias", included: true },
			{ text: "Soporte por email", included: true },
			{ text: "Informes PDF", included: false },
			{ text: "ROI, Tareas y Plantillas", included: false },
		],
		cta: "Empezar",
	},
	{
		id: "pro",
		name: "Pro",
		priceMonth: 49,
		priceLabel: "49€/mes",
		tagline: "Freelancers SEO y agencias pequeñas",
		highlighted: true,
		features: [
			{ text: "1 workspace", included: true },
			{ text: "100 prompts activos", included: true },
			{ text: "Hasta 10 competidores", included: true },
			{ text: "5 LLMs (todos disponibles)", included: true },
			{ text: "Todo lo de Starter", included: true },
			{ text: "Informes PDF estandar", included: true },
			{ text: "ROI: acciones → resultados", included: true },
			{ text: "Gestion de tareas (kanban)", included: true },
			{ text: "Plantillas por sector", included: true },
			{ text: "Alertas in-app completas", included: true },
			{ text: "Forecast 30/60/90 dias", included: true },
			{ text: "Historico 90 dias", included: true },
			{ text: "Auto-refresh cada 6h", included: true },
		],
		cta: "Empezar prueba",
	},
	{
		id: "agency",
		name: "Agency",
		priceMonth: 99,
		priceLabel: "99€/mes",
		tagline: "Agencias y profesionales SEO multi-cliente",
		features: [
			{ text: "10 workspaces (multi-cliente)", included: true },
			{ text: "Prompts ilimitados", included: true },
			{ text: "Competidores ilimitados", included: true },
			{ text: "5 LLMs (todos)", included: true },
			{ text: "Todo lo de Pro", included: true },
			{ text: "Informes white-label personalizados", included: true },
			{ text: "Envio automatico por email programado", included: true },
			{ text: "API access (read-only)", included: true },
			{ text: "Alertas en Slack y webhook", included: true },
			{ text: "5 team seats", included: true },
			{ text: "Company Bio avanzado", included: true },
			{ text: "Benchmarks de industria", included: true },
			{ text: "Mention context viewer", included: true },
			{ text: "Historico ilimitado", included: true },
			{ text: "Soporte prioritario", included: true },
		],
		cta: "Contactar",
	},
];

const TIERS_EN: Tier[] = TIERS_ES.map((t) => ({
	...t,
	tagline:
		t.id === "starter"
			? "For SME owners and local businesses"
			: t.id === "pro"
				? "Freelance SEOs and small agencies"
				: "Agencies and SEO professionals",
	cta:
		t.id === "starter"
			? "Get started"
			: t.id === "pro"
				? "Start trial"
				: "Contact",
	features: t.features.map((f) => ({
		...f,
		text: translateFeature(f.text),
	})),
}));

function translateFeature(es: string): string {
	const map: Record<string, string> = {
		"1 workspace": "1 workspace",
		"Hasta 20 prompts activos": "Up to 20 active prompts",
		"100 prompts activos": "100 active prompts",
		"Hasta 3 competidores": "Up to 3 competitors",
		"Hasta 10 competidores": "Up to 10 competitors",
		"Competidores ilimitados": "Unlimited competitors",
		"2 LLMs (ChatGPT + 1)": "2 LLMs (ChatGPT + 1)",
		"5 LLMs (todos disponibles)": "5 LLMs (all available)",
		"5 LLMs (todos)": "5 LLMs (all)",
		"Dashboard de visibilidad GEO": "GEO visibility dashboard",
		"Recomendaciones criticas": "Critical recommendations",
		"Historico 30 dias": "30-day history",
		"Historico 90 dias": "90-day history",
		"Historico ilimitado": "Unlimited history",
		"Soporte por email": "Email support",
		"Informes PDF": "PDF reports",
		"ROI, Tareas y Plantillas": "ROI, Tasks and Templates",
		"Todo lo de Starter": "Everything in Starter",
		"Informes PDF estandar": "Standard PDF reports",
		"ROI: acciones → resultados": "ROI: actions → results",
		"Gestion de tareas (kanban)": "Task management (kanban)",
		"Plantillas por sector": "Sector templates",
		"Alertas in-app completas": "Full in-app alerts",
		"Forecast 30/60/90 dias": "30/60/90 day forecast",
		"Auto-refresh cada 6h": "Auto-refresh every 6h",
		"10 workspaces (multi-cliente)": "10 workspaces (multi-client)",
		"Prompts ilimitados": "Unlimited prompts",
		"Todo lo de Pro": "Everything in Pro",
		"Informes white-label personalizados": "Custom white-label reports",
		"Envio automatico por email programado":
			"Scheduled automatic email reports",
		"API access (read-only)": "API access (read-only)",
		"Alertas en Slack y webhook": "Slack and webhook alerts",
		"5 team seats": "5 team seats",
		"Company Bio avanzado": "Advanced Company Bio",
		"Benchmarks de industria": "Industry benchmarks",
		"Mention context viewer": "Mention context viewer",
		"Soporte prioritario": "Priority support",
	};
	return map[es] ?? es;
}

export default function Page({
	searchParams,
}: {
	searchParams: Promise<{ lang?: string }>;
}) {
	return <PricingContent searchParams={searchParams} />;
}

async function PricingContent({
	searchParams,
}: {
	searchParams: Promise<{ lang?: string }>;
}) {
	const sp = await searchParams;
	const isEn = sp.lang === "en";
	const tiers = isEn ? TIERS_EN : TIERS_ES;

	return (
		<main className="min-h-screen bg-[var(--background)] py-12">
			<div className="mx-auto max-w-6xl px-4 sm:px-6">
				<section className="text-center">
					<p className="text-xs font-black uppercase tracking-[0.24em] text-[var(--brand)]">
						{isEn ? "Pricing" : "Precios"}
					</p>
					<h1 className="mt-3 text-4xl font-black tracking-[-0.03em] text-[var(--foreground)] sm:text-5xl">
						{isEn ? "Monitor your brand in AI" : "Monitoriza tu marca en IA"}
					</h1>
					<p className="mx-auto mt-4 max-w-2xl text-lg text-[var(--muted)]">
						{isEn
							? "Track how ChatGPT, Claude, Gemini and Perplexity recommend your brand. Get actionable insights to win against competitors."
							: "Mide como ChatGPT, Claude, Gemini y Perplexity recomiendan tu marca. Obten insights accionables para ganarles a tus competidores."}
					</p>
					<div className="mt-4 inline-flex items-center gap-2 rounded-full bg-[var(--surface-subtle)] px-4 py-1.5 text-xs font-semibold text-[var(--muted)]">
						<Check className="size-3 text-emerald-500" />
						{isEn ? "14 days free trial" : "14 dias de prueba gratis"}
						<span className="text-[var(--border)]">·</span>
						<Check className="size-3 text-emerald-500" />
						{isEn ? "No card required" : "Sin tarjeta"}
						<span className="text-[var(--border)]">·</span>
						<Check className="size-3 text-emerald-500" />
						{isEn ? "Cancel anytime" : "Cancela cuando quieras"}
					</div>
				</section>

				<section className="mt-12 grid gap-6 lg:grid-cols-3">
					{tiers.map((tier) => {
						return (
							<article
								className={`relative flex flex-col gap-5 rounded-2xl border-2 bg-[var(--surface-raised,_white)] p-6 ${
									tier.highlighted
										? "border-[var(--brand)] shadow-[0_20px_50px_rgba(244,149,39,0.15)]"
										: "border-[var(--border)]"
								}`}
								key={tier.id}
							>
								{tier.highlighted ? (
									<span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-[var(--brand)] px-3 py-1 text-[10px] font-black uppercase tracking-wider text-[#1b1000]">
										{isEn ? "Most popular" : "Mas popular"}
									</span>
								) : null}
								<div className="flex items-center gap-3">
									<div className="grid size-11 place-items-center">
										{tier.id === "starter" ? (
											<StarterIcon />
										) : tier.id === "pro" ? (
											<ProIcon />
										) : (
											<AgencyIcon />
										)}
									</div>
									<h2 className="text-2xl font-black text-[var(--foreground)]">
										{tier.name}
									</h2>
								</div>
								<p className="text-sm text-[var(--muted)]">{tier.tagline}</p>
								<div>
									<p className="flex items-baseline gap-1">
										<span className="text-5xl font-black tracking-tight text-[var(--foreground)]">
											{tier.priceMonth}€
										</span>
										<span className="text-sm font-medium text-[var(--muted)]">
											/{isEn ? "month" : "mes"}
										</span>
									</p>
								</div>
								<ul className="grid gap-2">
									{tier.features.map((f) => (
										<li
											className={`flex items-start gap-2 text-sm ${
												f.included
													? "text-[var(--foreground)]"
													: "text-[var(--muted)] opacity-50 line-through"
											}`}
											key={f.text}
										>
											<Check
												className={`mt-0.5 size-4 shrink-0 ${
													f.included
														? "text-emerald-500"
														: "text-[var(--muted)]"
												}`}
											/>
											{f.text}
										</li>
									))}
								</ul>
								<Link
									className={`mt-auto inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-bold transition ${
										tier.highlighted
											? "bg-[var(--brand)] text-[#1b1000] hover:brightness-110"
											: "border border-[var(--border)] text-[var(--foreground)] hover:border-[var(--brand)]"
									}`}
									href={
										tier.id === "agency"
											? "mailto:hello@neo-geo.app"
											: "/register"
									}
								>
									{tier.cta}
									<ArrowRight className="size-4" />
								</Link>
							</article>
						);
					})}
				</section>

				<section className="mt-16 grid gap-6 md:grid-cols-3">
					<div>
						<h3 className="text-sm font-bold text-[var(--foreground)]">
							{isEn ? "How long is the trial?" : "Cuanto dura la prueba?"}
						</h3>
						<p className="mt-1 text-sm text-[var(--muted)]">
							{isEn
								? "14 days free, no card required. You can cancel anytime."
								: "14 dias gratis, sin tarjeta. Puedes cancelar cuando quieras."}
						</p>
					</div>
					<div>
						<h3 className="text-sm font-bold text-[var(--foreground)]">
							{isEn ? "Can I change plan?" : "Puedo cambiar de plan?"}
						</h3>
						<p className="mt-1 text-sm text-[var(--muted)]">
							{isEn
								? "Yes. Upgrade or downgrade anytime from settings."
								: "Si. Sube o baja de plan cuando quieras desde ajustes."}
						</p>
					</div>
					<div>
						<h3 className="text-sm font-bold text-[var(--foreground)]">
							{isEn ? "Do I own my data?" : "Mis datos son mios?"}
						</h3>
						<p className="mt-1 text-sm text-[var(--muted)]">
							{isEn
								? "Yes. Export to CSV/PDF anytime. We never share."
								: "Si. Exporta a CSV/PDF cuando quieras. Nunca compartimos."}
						</p>
					</div>
				</section>
			</div>
		</main>
	);
}
