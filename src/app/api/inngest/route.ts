import { serve } from "inngest/next";
import { inngest } from "@/inngest/client";
import { aggregateDailyMetrics } from "@/inngest/functions/aggregateDailyMetrics";
import { generatePromptCandidatesInngest } from "@/inngest/functions/generatePromptCandidates";
import { runPromptManual } from "@/inngest/functions/runPromptManual";
import { runPromptScheduled } from "@/inngest/functions/runPromptScheduled";

export const { GET, POST, PUT } = serve({
	client: inngest,
	functions: [
		runPromptManual,
		runPromptScheduled,
		aggregateDailyMetrics,
		generatePromptCandidatesInngest,
	],
});
