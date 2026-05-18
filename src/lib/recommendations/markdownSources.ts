import { readFile } from "node:fs/promises";
import path from "node:path";
import type { RecommendationCategory } from "@/types";

const sourceFiles: Array<{
	slug: string;
	title: string;
	category: RecommendationCategory;
	file: string;
}> = [
	{
		slug: "entity-optimization",
		title: "Entity Optimization",
		category: "entity",
		file: "entity-optimization.md",
	},
	{
		slug: "source-authority",
		title: "Source Authority",
		category: "authority",
		file: "source-authority.md",
	},
	{
		slug: "content-gap-analysis",
		title: "Content Gap Analysis",
		category: "content",
		file: "content-gap-analysis.md",
	},
	{
		slug: "sentiment-and-positioning",
		title: "Sentiment And Positioning",
		category: "sentiment",
		file: "sentiment-and-positioning.md",
	},
	{
		slug: "prompt-coverage",
		title: "Prompt Coverage",
		category: "prompts",
		file: "prompt-coverage.md",
	},
];

export async function loadMarkdownRecommendationSources() {
	const basePath = path.join(process.cwd(), "knowledge", "recommendations");

	return Promise.all(
		sourceFiles.map(async (source) => ({
			...source,
			content: await readFile(path.join(basePath, source.file), "utf8"),
			version: "v1",
		})),
	);
}
