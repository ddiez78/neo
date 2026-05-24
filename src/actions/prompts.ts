"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import * as XLSX from "xlsx";
import { getWorkspaceOverview, requireUser } from "@/lib/data/workspace";
import { executePromptRun } from "@/lib/llm/executePromptRun";
import { getUserPreferences } from "@/lib/preferences-server";
import { generatePromptCandidates } from "@/lib/prompts/generationPipeline";
import { PROMPT_LIMIT } from "@/lib/tiers";
import {
	csvToArray,
	promptSchema,
	providerKeys,
} from "@/lib/validations/schemas";
import type { ActionResult, LlmProviderKey, Workspace } from "@/types";

type ImportedPromptCandidate = {
	title: string;
	body: string;
	intent: string;
	funnel_stage: string;
	category: string;
	score: number;
	rationale: string;
};

const IMPORT_LIMIT = 200;

function stripAccents(value: string) {
	return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

function normalizeText(value: unknown) {
	return stripAccents(
		String(value ?? "")
			.trim()
			.toLowerCase(),
	);
}

function normalizeHeader(value: string) {
	return normalizeText(value).replace(/[^a-z0-9]/g, "");
}

function normalizePromptTags(values: Array<unknown>) {
	const map: Record<string, string> = {
		alternative: "alternativas",
		alternatives: "alternativas",
		alternativa: "alternativas",
		alternativas: "alternativas",
		awareness: "awareness",
		brand: "branded",
		branded: "branded",
		comparacion: "comparacion",
		comparison: "comparacion",
		compare: "comparacion",
		decision: "decision",
		local: "local",
		marca: "branded",
		price: "precio",
		pricing: "precio",
		precio: "precio",
		recommendation: "decision",
		recomendacion: "decision",
		riesgo: "riesgo",
		risk: "riesgo",
	};
	const tags = values
		.flatMap((value) => String(value ?? "").split(","))
		.map((value) => normalizeText(value))
		.map((value) => map[value] ?? value)
		.filter(Boolean);
	return [...new Set(tags)].slice(0, 10);
}

function getRowValue(row: Record<string, unknown>, aliases: string[]) {
	const normalizedAliases = aliases.map(normalizeHeader);
	for (const [key, value] of Object.entries(row)) {
		if (normalizedAliases.includes(normalizeHeader(key))) {
			return String(value ?? "").trim();
		}
	}
	return "";
}

function hasAnyColumn(row: Record<string, unknown>, aliases: string[]) {
	const normalizedAliases = aliases.map(normalizeHeader);
	return Object.keys(row).some((key) =>
		normalizedAliases.includes(normalizeHeader(key)),
	);
}

function detectIntent(value: string) {
	const text = normalizeText(value);
	if (
		text.includes("precio") ||
		text.includes("price") ||
		text.includes("cost")
	) {
		return "precio";
	}
	if (text.includes("alternativa") || text.includes("alternative")) {
		return "alternativas";
	}
	if (text.includes("compar") || text.includes(" vs ")) {
		return "comparacion";
	}
	if (
		text.includes("riesgo") ||
		text.includes("risk") ||
		text.includes("problem")
	) {
		return "riesgo";
	}
	if (
		text.includes("local") ||
		text.includes("ciudad") ||
		text.includes("near me")
	) {
		return "local";
	}
	if (text.includes("marca") || text.includes("brand")) {
		return "branded";
	}
	if (
		text.includes("mejor") ||
		text.includes("best") ||
		text.includes("recommend")
	) {
		return "decision";
	}
	return "awareness";
}

function detectFunnelStage(intent: string) {
	if (["precio", "decision", "comparacion", "alternativas"].includes(intent)) {
		return "decision";
	}
	if (["riesgo", "local", "branded"].includes(intent)) return "consideration";
	return "awareness";
}

function buildImportedCandidate(
	row: Record<string, unknown>,
	index: number,
	fileName: string,
): ImportedPromptCandidate | null {
	const rawCells = Object.values(row)
		.map((value) => String(value ?? "").trim())
		.filter(Boolean);
	const body =
		getRowValue(row, [
			"prompt",
			"body",
			"texto",
			"text",
			"pregunta",
			"question",
			"consulta",
		]) ||
		rawCells.find((cell) => cell.length > 25) ||
		rawCells[0] ||
		"";
	if (!body) return null;

	const title =
		getRowValue(row, ["title", "titulo", "título", "nombre", "name"]) ||
		body.slice(0, 90);
	const explicitIntent = getRowValue(row, ["intent", "intencion", "intención"]);
	const intent =
		normalizePromptTags([
			explicitIntent || detectIntent(`${title} ${body}`),
		])[0] ?? "awareness";
	const category =
		normalizePromptTags([
			getRowValue(row, [
				"category",
				"categoria",
				"categoría",
				"type",
				"tipo",
			]) || intent,
		])[0] ?? intent;
	const funnelStage =
		getRowValue(row, ["funnel_stage", "funnel", "stage", "etapa"]) ||
		detectFunnelStage(intent);
	const score = Number(
		getRowValue(row, [
			"score",
			"puntuacion",
			"puntuación",
			"priority",
			"prioridad",
		]),
	);

	return {
		title,
		body,
		intent,
		funnel_stage: funnelStage,
		category,
		score: Number.isFinite(score) ? Math.min(Math.max(score, 1), 100) : 70,
		rationale: `Importado desde ${fileName}, fila ${index + 2}. Revisar antes de activar.`,
	};
}

async function normalizeRowsWithLlm(
	rows: Array<Record<string, unknown>>,
	fileName: string,
): Promise<ImportedPromptCandidate[] | null> {
	const apiKey = process.env.OPENROUTER_API_KEY;
	if (!apiKey) return null;

	try {
		const response = await fetch(
			"https://openrouter.ai/api/v1/chat/completions",
			{
				body: JSON.stringify({
					messages: [
						{
							content:
								"Normaliza filas de CSV/Excel a candidatos de prompts GEO. Devuelve solo JSON valido con {candidates:[{title,body,intent,funnel_stage,category,score,rationale}]}. Usa espanol por defecto. Intents permitidos: decision, precio, comparacion, alternativas, riesgo, local, branded, awareness.",
							role: "system",
						},
						{
							content: JSON.stringify({
								fileName,
								rows: rows
									.slice(0, IMPORT_LIMIT)
									.map((row) =>
										Object.fromEntries(
											Object.entries(row).map(([key, value]) => [
												key,
												String(value ?? "").slice(0, 500),
											]),
										),
									),
							}),
							role: "user",
						},
					],
					model: process.env.OPENROUTER_PROMPT_MODEL ?? "openai/gpt-4o-mini",
					response_format: { type: "json_object" },
					temperature: 0.2,
				}),
				headers: {
					Authorization: `Bearer ${apiKey}`,
					"Content-Type": "application/json",
				},
				method: "POST",
			},
		);
		if (!response.ok) return null;
		const json = await response.json();
		const content = json.choices?.[0]?.message?.content;
		const parsed = JSON.parse(content ?? "{}");
		if (!Array.isArray(parsed.candidates)) return null;
		return parsed.candidates
			.map((candidate: Partial<ImportedPromptCandidate>) => ({
				title: String(candidate.title ?? "").trim(),
				body: String(candidate.body ?? "").trim(),
				intent: normalizePromptTags([candidate.intent])[0] ?? "awareness",
				funnel_stage: String(candidate.funnel_stage ?? "awareness").trim(),
				category: normalizePromptTags([candidate.category])[0] ?? "awareness",
				score: Number(candidate.score ?? 70),
				rationale:
					String(candidate.rationale ?? "").trim() ||
					`Normalizado por LLM desde ${fileName}.`,
			}))
			.filter(
				(candidate: ImportedPromptCandidate) =>
					candidate.title && candidate.body,
			)
			.slice(0, IMPORT_LIMIT);
	} catch {
		return null;
	}
}

export async function placeholderAction(): Promise<ActionResult> {
	return { success: true };
}

export async function createPromptAction(
	workspaceId: string,
	workspaceSlug: string,
	formData: FormData,
) {
	const { supabase } = await requireUser();
	const prefs = await getUserPreferences();
	const limit = PROMPT_LIMIT[prefs.mode];
	const { count: existingCount } = await supabase
		.from("prompts")
		.select("id", { count: "exact", head: true })
		.eq("workspace_id", workspaceId);
	if ((existingCount ?? 0) >= limit) {
		redirect(
			`/${workspaceSlug}/prompts?error=${encodeURIComponent(`Tu plan permite ${limit} prompts. Sube de plan para crear más.`)}`,
		);
	}

	const raw = Object.fromEntries(formData);
	const providers = formData.getAll("providers");
	const legacyProviders = providers.length > 0 ? providers : providerKeys;
	const parsed = promptSchema.safeParse({ ...raw, providers: legacyProviders });
	if (!parsed.success) {
		redirect(
			`/${workspaceSlug}/prompts?error=${encodeURIComponent(parsed.error.issues[0]?.message ?? "Datos invalidos")}`,
		);
	}

	const { error } = await supabase.from("prompts").insert({
		workspace_id: workspaceId,
		title: parsed.data.title,
		body: parsed.data.body,
		status: parsed.data.status,
		priority: parsed.data.priority,
		frequency: parsed.data.frequency,
		providers: providerKeys,
		tags: csvToArray(parsed.data.tags),
	});

	if (error) {
		redirect(
			`/${workspaceSlug}/prompts?error=${encodeURIComponent(error.message)}`,
		);
	}

	revalidatePath(`/${workspaceSlug}/prompts`);
	redirect(`/${workspaceSlug}/prompts?saved=1`);
}

export async function runPromptAcrossEnabledLlmsAction(
	workspaceId: string,
	workspaceSlug: string,
	promptId: string,
	formData: FormData,
) {
	const { supabase } = await requireUser();
	const promptBody = String(formData.get("body") ?? "");
	const [{ data: workspace }, overview] = await Promise.all([
		supabase.from("workspaces").select("*").eq("id", workspaceId).single(),
		getWorkspaceOverview(workspaceId),
	]);

	if (!workspace) {
		redirect(
			`/${workspaceSlug}/prompts?error=${encodeURIComponent("Workspace not found")}`,
		);
	}

	const enabledConfigs = overview.llmConfigs.filter((config) => config.enabled);
	if (enabledConfigs.length === 0) {
		redirect(
			`/${workspaceSlug}/prompts?error=${encodeURIComponent("Activa al menos un LLM antes de ejecutar prompts.")}`,
		);
	}

	await Promise.all(
		enabledConfigs.map((config) =>
			executePromptRun({
				supabase,
				workspace: workspace as Workspace,
				company: overview.company,
				competitors: overview.competitors,
				promptId,
				promptBody,
				provider: config.provider as LlmProviderKey,
				model: config.model,
			}),
		),
	);

	revalidatePath(`/${workspaceSlug}/prompts`);
	revalidatePath(`/${workspaceSlug}/dashboard`);
	revalidatePath(`/${workspaceSlug}/sources`);
	redirect(`/${workspaceSlug}/prompts?ran=${enabledConfigs.length}`);
}

export const runPromptAction = runPromptAcrossEnabledLlmsAction;

export async function generatePromptCandidatesAction(
	workspaceId: string,
	workspaceSlug: string,
	formData?: FormData,
) {
	const { supabase, user } = await requireUser();
	const overview = await getWorkspaceOverview(workspaceId);
	const returnTo = String(formData?.get("returnTo") ?? "prompt-research");
	const promptCount = Number(formData?.get("promptCount") ?? 12);
	const competitorsRaw = String(formData?.get("competitors") ?? "");
	const intents = formData?.getAll("intents").map(String).filter(Boolean) ?? [];
	const context = formData
		? {
				brandName: String(formData.get("brandName") ?? ""),
				website: String(formData.get("website") ?? ""),
				description: String(formData.get("description") ?? ""),
				country: String(formData.get("country") ?? ""),
				market: String(formData.get("market") ?? ""),
				segment: String(formData.get("segment") ?? ""),
				services: String(formData.get("services") ?? ""),
				audience: String(formData.get("audience") ?? ""),
				differentiators: String(formData.get("differentiators") ?? ""),
				competitors: csvToArray(competitorsRaw),
				language: String(formData.get("language") ?? "es"),
				promptCount: Number.isFinite(promptCount) ? promptCount : 12,
				intents,
				specificity: String(formData.get("specificity") ?? "medium"),
			}
		: undefined;
	const { data: batch, error: batchError } = await supabase
		.from("prompt_generation_batches")
		.insert({
			workspace_id: workspaceId,
			requested_by: user.id,
			status: "running",
			pipeline_version: "proprietary-v1",
			metadata: {
				stages: [
					"context_builder",
					"intent_expansion",
					"multi_model_generation",
					"proprietary_refinement",
					"scoring",
					"final_selection",
				],
				context,
			},
		})
		.select("*")
		.single();

	if (batchError || !batch) {
		redirect(
			`/${workspaceSlug}/prompt-research?error=${encodeURIComponent(batchError?.message ?? "No se pudo crear el batch.")}`,
		);
	}

	let generatedCount = 0;
	try {
		const candidates = await generatePromptCandidates({
			workspaceName:
				context?.brandName || overview.company?.brand_name || workspaceSlug,
			company: overview.company,
			competitors: overview.competitors,
			existingPrompts: overview.prompts,
			context,
		});
		generatedCount = candidates.length;

		if (candidates.length > 0) {
			const { error: candidateError } = await supabase
				.from("prompt_candidates")
				.insert(
					candidates.map((candidate) => ({
						workspace_id: workspaceId,
						batch_id: batch.id,
						...candidate,
					})),
				);

			if (candidateError) throw new Error(candidateError.message);
		}

		await supabase
			.from("prompt_generation_batches")
			.update({
				status: "completed",
				completed_at: new Date().toISOString(),
				updated_at: new Date().toISOString(),
				metadata: { generated_count: generatedCount },
			})
			.eq("id", batch.id);
	} catch (error) {
		const message =
			error instanceof Error ? error.message : "Fallo el pipeline de prompts.";
		await supabase
			.from("prompt_generation_batches")
			.update({
				status: "failed",
				error_message: message,
				updated_at: new Date().toISOString(),
			})
			.eq("id", batch.id);
		redirect(
			`/${workspaceSlug}/${returnTo}?error=${encodeURIComponent(message)}`,
		);
	}

	revalidatePath(`/${workspaceSlug}/prompt-research`);
	revalidatePath(`/${workspaceSlug}/prompts`);
	redirect(`/${workspaceSlug}/${returnTo}?generated=${generatedCount}`);
}

export async function acceptPromptCandidateAction(
	workspaceId: string,
	workspaceSlug: string,
	candidateId: string,
	formData?: FormData,
) {
	const { supabase } = await requireUser();
	const { data: candidate, error: candidateError } = await supabase
		.from("prompt_candidates")
		.select("*")
		.eq("id", candidateId)
		.eq("workspace_id", workspaceId)
		.single();

	if (candidateError || !candidate) {
		redirect(
			`/${workspaceSlug}/prompt-research?error=${encodeURIComponent(candidateError?.message ?? "Candidato no encontrado.")}`,
		);
	}

	const title = String(formData?.get("title") ?? candidate.title).trim();
	const body = String(formData?.get("body") ?? candidate.body).trim();
	const returnTo = String(formData?.get("returnTo") ?? "prompt-research");
	const { data: prompt, error: promptError } = await supabase
		.from("prompts")
		.insert({
			workspace_id: workspaceId,
			title,
			body,
			status: "active",
			priority: 3,
			frequency: "weekly",
			providers: providerKeys,
			tags: normalizePromptTags([
				"generated",
				candidate.intent,
				candidate.category,
				candidate.funnel_stage,
			]),
		})
		.select("*")
		.single();

	if (promptError || !prompt) {
		redirect(
			`/${workspaceSlug}/prompt-research?error=${encodeURIComponent(promptError?.message ?? "No se pudo guardar el prompt.")}`,
		);
	}

	await supabase
		.from("prompt_candidates")
		.update({
			title,
			body,
			status:
				title === candidate.title && body === candidate.body
					? "accepted"
					: "edited",
			created_prompt_id: prompt.id,
			updated_at: new Date().toISOString(),
		})
		.eq("id", candidateId);

	revalidatePath(`/${workspaceSlug}/prompt-research`);
	revalidatePath(`/${workspaceSlug}/prompts`);
	redirect(`/${workspaceSlug}/${returnTo}?accepted=1`);
}

export async function acceptPromptCandidatesBulkAction(
	workspaceId: string,
	workspaceSlug: string,
	formData: FormData,
) {
	const { supabase } = await requireUser();
	const candidateIds = formData
		.getAll("candidateIds")
		.map(String)
		.filter(Boolean);
	if (candidateIds.length === 0) {
		redirect(
			`/${workspaceSlug}/prompts?error=${encodeURIComponent("Selecciona al menos un candidato pendiente.")}`,
		);
	}

	const { data: candidates, error: candidateError } = await supabase
		.from("prompt_candidates")
		.select("*")
		.eq("workspace_id", workspaceId)
		.eq("status", "pending")
		.in("id", candidateIds);

	if (candidateError || !candidates?.length) {
		redirect(
			`/${workspaceSlug}/prompts?error=${encodeURIComponent(candidateError?.message ?? "No se encontraron candidatos pendientes.")}`,
		);
	}

	const { data: prompts, error: promptError } = await supabase
		.from("prompts")
		.insert(
			candidates.map((candidate) => ({
				workspace_id: workspaceId,
				title: candidate.title,
				body: candidate.body,
				status: "active",
				priority: 3,
				frequency: "weekly",
				providers: providerKeys,
				tags: normalizePromptTags([
					"generated",
					candidate.intent,
					candidate.category,
					candidate.funnel_stage,
				]),
			})),
		)
		.select("id");

	if (promptError || !prompts) {
		redirect(
			`/${workspaceSlug}/prompts?error=${encodeURIComponent(promptError?.message ?? "No se pudieron activar los candidatos.")}`,
		);
	}

	await Promise.all(
		candidates.map((candidate, index) =>
			supabase
				.from("prompt_candidates")
				.update({
					created_prompt_id: prompts[index]?.id,
					status: "accepted",
					updated_at: new Date().toISOString(),
				})
				.eq("id", candidate.id),
		),
	);

	revalidatePath(`/${workspaceSlug}/prompt-research`);
	revalidatePath(`/${workspaceSlug}/prompts`);
	revalidatePath(`/${workspaceSlug}/dashboard`);
	redirect(`/${workspaceSlug}/prompts?bulkAccepted=${prompts.length}`);
}

export async function importPromptCandidatesAction(
	workspaceId: string,
	workspaceSlug: string,
	formData: FormData,
) {
	const { supabase, user } = await requireUser();
	const file = formData.get("file");
	if (!(file instanceof File) || file.size === 0) {
		redirect(
			`/${workspaceSlug}/prompts?error=${encodeURIComponent("Sube un archivo CSV, XLS o XLSX con prompts.")}`,
		);
	}

	const fileName = file.name || "prompts-import";
	const allowed = [".csv", ".xlsx", ".xls"].some((extension) =>
		fileName.toLowerCase().endsWith(extension),
	);
	if (!allowed) {
		redirect(
			`/${workspaceSlug}/prompts?error=${encodeURIComponent("Formato no soportado. Usa CSV, XLS o XLSX.")}`,
		);
	}

	const buffer = Buffer.from(await file.arrayBuffer());
	const workbook = XLSX.read(buffer, { type: "buffer" });
	const sheetName = workbook.SheetNames[0];
	const sheet = sheetName ? workbook.Sheets[sheetName] : null;
	if (!sheet) {
		redirect(
			`/${workspaceSlug}/prompts?error=${encodeURIComponent("No se encontro ninguna hoja con datos.")}`,
		);
	}

	const rows = XLSX.utils
		.sheet_to_json<Record<string, unknown>>(sheet, { defval: "" })
		.slice(0, IMPORT_LIMIT);
	if (rows.length === 0) {
		redirect(
			`/${workspaceSlug}/prompts?error=${encodeURIComponent("El archivo no contiene filas importables.")}`,
		);
	}

	const heuristicCandidates = rows
		.map((row, index) => buildImportedCandidate(row, index, fileName))
		.filter((candidate): candidate is ImportedPromptCandidate =>
			Boolean(candidate),
		);
	const hasAmbiguousRows = rows.some(
		(row) =>
			!hasAnyColumn(row, [
				"prompt",
				"body",
				"texto",
				"text",
				"pregunta",
				"question",
				"consulta",
			]) || !hasAnyColumn(row, ["title", "titulo", "título", "nombre", "name"]),
	);
	const shouldUseLlm =
		heuristicCandidates.length < rows.length || hasAmbiguousRows;
	const llmCandidates = shouldUseLlm
		? await normalizeRowsWithLlm(rows, fileName)
		: null;
	const candidates: ImportedPromptCandidate[] = llmCandidates?.length
		? llmCandidates
		: heuristicCandidates;
	if (!candidates.length) {
		redirect(
			`/${workspaceSlug}/prompts?error=${encodeURIComponent("No se pudieron extraer prompts del archivo.")}`,
		);
	}

	const { data: batch, error: batchError } = await supabase
		.from("prompt_generation_batches")
		.insert({
			workspace_id: workspaceId,
			requested_by: user.id,
			status: "completed",
			pipeline_version: "file-import-v1",
			completed_at: new Date().toISOString(),
			metadata: {
				file_name: fileName,
				imported_count: candidates.length,
				normalized_with: llmCandidates?.length ? "llm" : "heuristic",
				source: "file_import",
				source_rows: rows.length,
			},
		})
		.select("*")
		.single();

	if (batchError || !batch) {
		redirect(
			`/${workspaceSlug}/prompts?error=${encodeURIComponent(batchError?.message ?? "No se pudo crear el batch de importacion.")}`,
		);
	}

	const { error: insertError } = await supabase
		.from("prompt_candidates")
		.insert(
			candidates.map((candidate) => ({
				workspace_id: workspaceId,
				batch_id: batch.id,
				title: candidate.title,
				body: candidate.body,
				intent: normalizePromptTags([candidate.intent])[0] ?? "awareness",
				funnel_stage:
					candidate.funnel_stage || detectFunnelStage(candidate.intent),
				category: normalizePromptTags([candidate.category])[0] ?? "awareness",
				score: Math.min(Math.max(Number(candidate.score) || 70, 1), 100),
				rationale: candidate.rationale,
				status: "pending",
			})),
		);

	if (insertError) {
		redirect(
			`/${workspaceSlug}/prompts?error=${encodeURIComponent(insertError.message)}`,
		);
	}

	revalidatePath(`/${workspaceSlug}/prompt-research`);
	revalidatePath(`/${workspaceSlug}/prompts`);
	redirect(`/${workspaceSlug}/prompts?imported=${candidates.length}`);
}

export async function rejectPromptCandidateAction(
	workspaceSlug: string,
	candidateId: string,
	formData?: FormData,
) {
	const { supabase } = await requireUser();
	const returnTo = String(formData?.get("returnTo") ?? "prompt-research");
	const { error } = await supabase
		.from("prompt_candidates")
		.update({ status: "rejected", updated_at: new Date().toISOString() })
		.eq("id", candidateId);

	if (error) {
		redirect(
			`/${workspaceSlug}/prompt-research?error=${encodeURIComponent(error.message)}`,
		);
	}

	revalidatePath(`/${workspaceSlug}/prompt-research`);
	revalidatePath(`/${workspaceSlug}/prompts`);
	redirect(`/${workspaceSlug}/${returnTo}?rejected=1`);
}
