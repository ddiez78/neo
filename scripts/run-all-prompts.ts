// Load .env before importing modules that read process.env
process.loadEnvFile?.(".env");

import { executePromptRun } from "@/lib/llm/executePromptRun";
import { createAdminClient } from "@/lib/supabase/admin";
import type { LlmProviderKey, Workspace } from "@/types";

const workspaceArg = process.argv.find((arg) => arg.startsWith("--workspace="));
const targetSlug = workspaceArg ? workspaceArg.split("=")[1] : null;
const providersArg = process.argv.find((arg) => arg.startsWith("--providers="));
const targetProviders = providersArg
	? providersArg.split("=")[1]?.split(",")
	: null;
const dryRun = process.argv.includes("--dry-run");

async function main() {
	const supabase = createAdminClient();

	let workspaceQuery = supabase.from("workspaces").select("*");
	if (targetSlug) {
		workspaceQuery = workspaceQuery.eq("slug", targetSlug);
	}
	const { data: workspaces, error: wsError } = await workspaceQuery;
	if (wsError) {
		console.error("Error fetching workspaces:", wsError.message);
		process.exit(1);
	}
	if (!workspaces?.length) {
		console.error(
			targetSlug
				? `Workspace '${targetSlug}' not found.`
				: "No workspaces found.",
		);
		process.exit(1);
	}

	let totalRuns = 0;
	let totalFailed = 0;

	for (const workspace of workspaces) {
		const [promptsResult, companyResult, competitorsResult, configsResult] =
			await Promise.all([
				supabase
					.from("prompts")
					.select("*")
					.eq("workspace_id", workspace.id)
					.eq("status", "active"),
				supabase
					.from("company_profiles")
					.select("*")
					.eq("workspace_id", workspace.id)
					.maybeSingle(),
				supabase
					.from("competitors")
					.select("*")
					.eq("workspace_id", workspace.id),
				supabase
					.from("workspace_llm_configs")
					.select("*")
					.eq("workspace_id", workspace.id)
					.eq("enabled", true),
			]);

		const prompts = promptsResult.data ?? [];
		const allConfigs = configsResult.data ?? [];
		const configs = targetProviders
			? allConfigs.filter((c) => targetProviders.includes(c.provider))
			: allConfigs;

		if (!prompts.length) {
			console.log(`[${workspace.slug}] No active prompts.`);
			continue;
		}
		if (!configs.length) {
			console.log(
				`[${workspace.slug}] No enabled LLM configs${targetProviders ? ` matching ${targetProviders.join(",")}` : ""}.`,
			);
			continue;
		}

		console.log(
			`[${workspace.slug}] Running ${prompts.length} prompt(s) × ${configs.length} LLM(s) = ${prompts.length * configs.length} runs${dryRun ? " (dry run)" : ""}`,
		);

		for (const prompt of prompts) {
			if (dryRun) {
				console.log(`  [dry] Would run: "${prompt.title}"`);
				continue;
			}

			const results = await Promise.allSettled(
				configs.map((config) =>
					executePromptRun({
						supabase,
						workspace: workspace as Workspace,
						company: companyResult.data,
						competitors: competitorsResult.data ?? [],
						promptId: prompt.id,
						promptBody: prompt.body,
						provider: config.provider as LlmProviderKey,
						model: config.model,
					}),
				),
			);

			const completed = results.filter((r) => r.status === "fulfilled").length;
			const failed = results.filter((r) => r.status === "rejected").length;

			totalRuns += completed;
			totalFailed += failed;

			const failedDetails = results
				.filter((r) => r.status === "rejected")
				.map((r) => (r as PromiseRejectedResult).reason);

			if (failed > 0) {
				console.log(
					`  ✗ "${prompt.title}": ${completed} ok, ${failed} failed`,
					failedDetails,
				);
			} else {
				console.log(`  ✓ "${prompt.title}": ${completed} runs completed`);
			}
		}
	}

	if (!dryRun) {
		console.log(`\nDone. ${totalRuns} runs completed, ${totalFailed} failed.`);
	}
}

main().catch((err) => {
	console.error(err);
	process.exit(1);
});
