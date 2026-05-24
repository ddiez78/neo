import { CheckCircle2, ClipboardCheck, ShieldCheck } from "lucide-react";
import type { ReactNode } from "react";
import { upsertCompanyProfileAction } from "@/actions/workspace";
import { LockedFeature } from "@/components/ui/LockedFeature";
import { scoreCompanyUnderstanding } from "@/lib/company-bio/context";
import { getWorkspaceOverview, requireWorkspace } from "@/lib/data/workspace";
import { getUserPreferences } from "@/lib/preferences-server";
import { hasAccess } from "@/lib/tiers";

const businessTypes = [
	{ value: "local", label: "Pyme local" },
	{ value: "ecommerce", label: "Ecommerce" },
	{ value: "professional_services", label: "Servicios profesionales" },
	{ value: "tourism_restaurant", label: "Turismo / restauracion" },
	{ value: "education", label: "Formacion" },
	{ value: "other", label: "Otro" },
];

function join(values?: string[] | null) {
	return (values ?? []).join(", ");
}

function verified(
	verification: Record<string, boolean> | undefined,
	field: string,
) {
	return verification?.[field] ?? false;
}

function Field({
	label,
	name,
	defaultValue,
	verified: isVerified,
	children,
	helper,
}: {
	label: string;
	name: string;
	defaultValue?: string | null;
	verified: boolean;
	children?: ReactNode;
	helper?: string;
}) {
	return (
		<label className="grid gap-2 text-sm font-bold text-[var(--foreground)]">
			<div className="flex flex-wrap items-center justify-between gap-2">
				<span>{label}</span>
				<span className="inline-flex items-center gap-2 text-xs font-semibold text-[var(--muted)]">
					<input
						className="size-4"
						defaultChecked={isVerified}
						name={`verified_${name}`}
						type="checkbox"
					/>
					Verificado
				</span>
			</div>
			{children ?? (
				<input
					defaultValue={defaultValue ?? ""}
					name={name}
					className="rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2"
				/>
			)}
			{helper ? (
				<span className="text-xs text-[var(--muted)]">{helper}</span>
			) : null}
		</label>
	);
}

export default async function Page({
	params,
	searchParams,
}: {
	params: Promise<{ workspace: string }>;
	searchParams: Promise<{ error?: string; saved?: string }>;
}) {
	const { workspace: slug } = await params;
	const status = await searchParams;
	const workspace = await requireWorkspace(slug);
	const prefs = await getUserPreferences();

	if (!hasAccess(prefs.mode, "company-bio")) {
		return <LockedFeature feature="company-bio" isEn={prefs.locale === "en"} />;
	}

	const { company, runs, rankings } = await getWorkspaceOverview(workspace.id);
	const understanding = scoreCompanyUnderstanding({ company, runs, rankings });
	const verification = company?.field_verification;
	const action = upsertCompanyProfileAction.bind(
		null,
		workspace.id,
		workspace.slug,
	);

	return (
		<main className="flex-1 overflow-auto p-4 pb-24 lg:p-6 lg:pb-8">
			<div className="mx-auto grid max-w-[1180px] gap-6">
				<section className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_360px]">
					<div>
						<p className="text-xs font-black uppercase tracking-[0.2em] text-[var(--brand)]">
							Fuente de verdad de marca
						</p>
						<h1 className="mt-2 text-3xl font-black tracking-[-0.03em] text-[var(--foreground)] md:text-4xl">
							Company Bio
						</h1>
						<p className="mt-2 max-w-3xl text-sm leading-6 text-[var(--muted)]">
							Define lo que la IA debe entender de la empresa: servicios,
							ubicaciones, pruebas, claims permitidos y puntos que no debe
							inventar. Marca como verificados los campos que ya son verdad
							aprobada.
						</p>
					</div>
					<div className="neo-card p-5">
						<div className="flex items-center gap-2">
							<ShieldCheck className="size-5 text-[var(--brand)]" />
							<h2 className="font-black text-[var(--foreground)]">
								Company Understanding
							</h2>
						</div>
						<p className="mt-4 text-5xl font-black tracking-[-0.05em] text-[var(--brand)]">
							{understanding.score}
							<span className="text-base text-[var(--muted)]">/100</span>
						</p>
						<p className="mt-2 text-sm text-[var(--muted)]">
							{understanding.status} · {understanding.completeness}% completo ·{" "}
							{understanding.verifiedCount} campos verificados
						</p>
					</div>
				</section>

				{status.error ? (
					<p className="rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-[#ffb4ab]">
						{status.error}
					</p>
				) : null}
				{status.saved ? (
					<p className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-3 text-sm text-[#7ee3a2]">
						Company Bio guardada.
					</p>
				) : null}

				<form action={action} className="grid gap-6">
					<section className="neo-card grid gap-5 p-5">
						<div className="flex items-center gap-2">
							<ClipboardCheck className="size-5 text-[var(--brand)]" />
							<h2 className="text-lg font-black text-[var(--foreground)]">
								Perfil guiado para pymes
							</h2>
						</div>
						<div className="grid gap-4 lg:grid-cols-2">
							<Field
								defaultValue={company?.brand_name ?? workspace.name}
								label="Nombre de la marca"
								name="brand_name"
								verified={verified(verification, "brand_name")}
							/>
							<Field
								defaultValue={company?.website ?? workspace.website ?? ""}
								label="Web oficial"
								name="website"
								verified={verified(verification, "website")}
							>
								<input
									className="rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2"
									defaultValue={company?.website ?? workspace.website ?? ""}
									name="website"
									type="url"
								/>
							</Field>
						</div>
						<Field
							defaultValue={company?.description ?? ""}
							helper="Explica en lenguaje claro que hace la empresa, para quien y por que elegirla."
							label="Descripcion de la empresa"
							name="description"
							verified={verified(verification, "description")}
						>
							<textarea
								className="min-h-32 rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2"
								defaultValue={company?.description ?? ""}
								name="description"
								required
							/>
						</Field>
						<div className="grid gap-4 lg:grid-cols-3">
							<Field
								label="Tipo de negocio"
								name="business_type"
								verified={verified(verification, "business_type")}
							>
								<select
									className="rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2"
									defaultValue={company?.business_type ?? "local"}
									name="business_type"
								>
									{businessTypes.map((type) => (
										<option key={type.value} value={type.value}>
											{type.label}
										</option>
									))}
								</select>
							</Field>
							<Field
								defaultValue={
									company?.country ?? workspace.country_code ?? "ES"
								}
								label="Pais"
								name="country"
								verified={verified(verification, "country")}
							/>
							<Field
								defaultValue={company?.language ?? "es"}
								label="Idioma principal"
								name="language"
								verified={verified(verification, "language")}
							/>
						</div>
						<div className="grid gap-4 lg:grid-cols-2">
							<Field
								defaultValue={company?.market ?? company?.markets?.[0] ?? ""}
								label="Ciudad o mercado principal"
								name="market"
								verified={verified(verification, "market")}
							/>
							<Field
								defaultValue={join(company?.locations)}
								label="Ubicaciones o zonas de servicio"
								name="locations"
								verified={verified(verification, "locations")}
							/>
						</div>
						<div className="grid gap-4 lg:grid-cols-2">
							<Field
								defaultValue={join(company?.categories)}
								label="Categorias"
								name="categories"
								verified={verified(verification, "categories")}
							/>
							<Field
								defaultValue={join(company?.subcategories)}
								label="Subcategorias"
								name="subcategories"
								verified={verified(verification, "subcategories")}
							/>
						</div>
						<Field
							defaultValue={
								join(company?.products_services) || join(company?.products)
							}
							label="Productos o servicios principales"
							name="products_services"
							verified={verified(verification, "products_services")}
						/>
						<div className="grid gap-4 lg:grid-cols-2">
							<Field
								defaultValue={company?.value_proposition ?? ""}
								label="Propuesta de valor"
								name="value_proposition"
								verified={verified(verification, "value_proposition")}
							/>
							<Field
								defaultValue={company?.target_audience ?? ""}
								label="Publico objetivo"
								name="target_audience"
								verified={verified(verification, "target_audience")}
							/>
						</div>
						<Field
							defaultValue={join(company?.social_proof)}
							label="Pruebas de confianza"
							name="social_proof"
							verified={verified(verification, "social_proof")}
							helper="Ej. anos de experiencia, clientes, premios, certificaciones, valoraciones."
						/>
					</section>

					<details className="neo-card p-5">
						<summary className="cursor-pointer text-lg font-black text-[var(--foreground)]">
							Avanzado para agencia / SEO
						</summary>
						<div className="mt-5 grid gap-4">
							<div className="grid gap-4 lg:grid-cols-2">
								<Field
									defaultValue={join(company?.key_features)}
									label="Caracteristicas clave"
									name="key_features"
									verified={verified(verification, "key_features")}
								/>
								<Field
									defaultValue={company?.pricing_strategy ?? ""}
									label="Estrategia de precios"
									name="pricing_strategy"
									verified={verified(verification, "pricing_strategy")}
								/>
							</div>
							<div className="grid gap-4 lg:grid-cols-2">
								<Field
									defaultValue={join(company?.revenue_streams)}
									label="Lineas de ingresos"
									name="revenue_streams"
									verified={verified(verification, "revenue_streams")}
								/>
								<Field
									defaultValue={join(company?.partnerships)}
									label="Partners o alianzas"
									name="partnerships"
									verified={verified(verification, "partnerships")}
								/>
							</div>
							<div className="grid gap-4 lg:grid-cols-2">
								<Field
									defaultValue={join(company?.aliases)}
									label="Aliases de marca"
									name="aliases"
									verified={verified(verification, "aliases")}
								/>
								<Field
									defaultValue={join(company?.official_urls)}
									label="URLs oficiales"
									name="official_urls"
									verified={false}
								/>
							</div>
							<div className="grid gap-4 lg:grid-cols-2">
								<Field
									defaultValue={join(company?.approved_claims)}
									label="Claims aprobados"
									name="approved_claims"
									verified={verified(verification, "approved_claims")}
								/>
								<Field
									defaultValue={join(company?.prohibited_claims)}
									label="Claims prohibidos"
									name="prohibited_claims"
									verified={verified(verification, "prohibited_claims")}
								/>
							</div>
							<Field
								defaultValue={company?.legal_notes ?? ""}
								label="Notas legales o restricciones"
								name="legal_notes"
								verified={verified(verification, "legal_notes")}
							>
								<textarea
									className="min-h-24 rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2"
									defaultValue={company?.legal_notes ?? ""}
									name="legal_notes"
								/>
							</Field>
							<div className="grid gap-4 lg:grid-cols-2">
								<Field
									defaultValue={join(company?.misunderstood_facts)}
									label="Hechos que la IA entiende mal"
									name="misunderstood_facts"
									verified={verified(verification, "misunderstood_facts")}
								/>
								<Field
									defaultValue={join(company?.entity_gaps)}
									label="Gaps de entidad detectados"
									name="entity_gaps"
									verified={verified(verification, "entity_gaps")}
								/>
							</div>
							<input
								name="products"
								type="hidden"
								value={join(company?.products)}
							/>
							<input
								name="keywords"
								type="hidden"
								value={join(company?.keywords)}
							/>
							<input
								name="markets"
								type="hidden"
								value={join(company?.markets)}
							/>
							<input name="tone" type="hidden" value={company?.tone ?? ""} />
						</div>
					</details>

					<section className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
						<div className="neo-card p-5">
							<div className="flex items-center gap-2">
								<CheckCircle2 className="size-5 text-[var(--brand)]" />
								<h2 className="font-black text-[var(--foreground)]">
									Que revisar ahora
								</h2>
							</div>
							<div className="mt-4 grid gap-2 text-sm text-[var(--muted)]">
								{[
									...understanding.entityGaps,
									...understanding.misunderstoodFacts,
								]
									.slice(0, 5)
									.map((item) => (
										<p
											className="rounded-lg border border-[var(--border)] bg-[var(--surface-subtle)] p-3"
											key={item}
										>
											{item}
										</p>
									))}
							</div>
						</div>
						<div className="flex items-end">
							<button
								className="w-full rounded-lg bg-[var(--brand)] px-4 py-3 text-sm font-black text-[#1b1000] transition hover:brightness-110"
								type="submit"
							>
								Guardar Company Bio
							</button>
						</div>
					</section>
				</form>
			</div>
		</main>
	);
}
