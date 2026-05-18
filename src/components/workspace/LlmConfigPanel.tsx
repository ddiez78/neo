import { upsertLlmConfigAction } from "@/actions/llm-config";
import type { LlmConfig } from "@/types";

const defaults = [
	["chatgpt", "gpt-4o-mini"],
	["claude", "claude-3-5-sonnet"],
	["gemini", "gemini-1.5-pro"],
	["perplexity", "sonar"],
	["deepseek", "deepseek-chat"],
] as const;

export function LlmConfigPanel({
	configs,
	workspaceId,
	workspaceSlug,
}: {
	configs: LlmConfig[];
	workspaceId: string;
	workspaceSlug: string;
}) {
	return (
		<div className="grid gap-3">
			{defaults.map(([provider, fallbackModel]) => {
				const config = configs.find((item) => item.provider === provider) ?? {
					provider,
					model: fallbackModel,
					enabled: false,
					api_key_configured: false,
					daily_run_limit: 25,
				};
				const action = upsertLlmConfigAction.bind(
					null,
					workspaceId,
					workspaceSlug,
				);

				return (
					<form
						action={action}
						className="grid gap-3 rounded-md border border-slate-200 bg-white p-4 md:grid-cols-[120px_1fr_120px_120px_120px]"
						key={provider}
					>
						<input name="provider" type="hidden" value={provider} />
						<div>
							<p className="text-sm font-semibold uppercase text-slate-950">
								{provider}
							</p>
							<p className="text-xs text-slate-500">Proveedor LLM</p>
						</div>
						<input
							className="rounded-md border border-slate-300 px-3 py-2 text-sm"
							name="model"
							defaultValue={config.model}
						/>
						<label className="flex items-center gap-2 text-sm text-slate-700">
							<input
								defaultChecked={config.enabled}
								name="enabled"
								type="checkbox"
							/>
							Activo
						</label>
						<label className="flex items-center gap-2 text-sm text-slate-700">
							<input
								defaultChecked={config.api_key_configured}
								name="api_key_configured"
								type="checkbox"
							/>
							API key
						</label>
						<div className="flex gap-2">
							<input
								className="w-20 rounded-md border border-slate-300 px-2 py-2 text-sm"
								name="daily_run_limit"
								defaultValue={config.daily_run_limit}
								type="number"
							/>
							<button
								className="rounded-md bg-slate-950 px-3 py-2 text-sm font-medium text-white"
								type="submit"
							>
								Guardar
							</button>
						</div>
					</form>
				);
			})}
		</div>
	);
}
