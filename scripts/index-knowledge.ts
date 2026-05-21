import { createHash } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { createAdminClient } from "@/lib/supabase/admin";

const KNOWLEDGE_DIR = path.join(process.cwd(), "content", "geo-knowledge");
const EMBEDDING_MODEL = "text-embedding-3-small";
const MIN_CHARS = 100;
const MAX_CHARS = 6000;
const BATCH_SIZE = 100;

type MarkdownDoc = {
	filePath: string;
	relativePath: string;
	title: string;
	url?: string;
	domain?: string;
	tags: string[];
	category?: string;
	authorityTier: number;
	publishedAt?: string;
	content: string;
};

type KnowledgeChunk = {
	source_file: string;
	source_title: string;
	source_url?: string;
	source_domain?: string;
	heading_path: string[];
	content: string;
	content_hash: string;
	tags: string[];
	category?: string;
	authority_tier: number;
	published_at?: string;
	token_count: number;
};

const categoryRules: Array<{ category: string; pattern: RegExp }> = [
	{
		category: "measurement",
		pattern:
			/\b(sov|share of voice|visibility score|ai visibility|metric|measurement|benchmark|sentiment|mention frequency|citation frequency|visibilidad|medici[oó]n)\b/i,
	},
	{
		category: "entity",
		pattern:
			/\b(entity|knowledge graph|brand authority|organization|sameas|aboutpage|knowsabout|entidad|marca)\b/i,
	},
	{
		category: "extractability",
		pattern:
			/\b(extract|chunk|self-contained|standalone|passage|heading|answer early|front-loaded|reuse|retrieval|RAG)\b/i,
	},
	{
		category: "authority",
		pattern:
			/\b(citation|cited|source|third-party|reddit|youtube|review|directory|earned mention|citas|fuentes|menciones)\b/i,
	},
	{
		category: "technical",
		pattern:
			/\b(crawl|index|robots|render|javascript|performance|canonical|sitemap|technical|crawler|googlebot|ai crawler)\b/i,
	},
	{
		category: "structured_data",
		pattern:
			/\b(schema|structured data|json-ld|schema\.org|rich result|markup)\b/i,
	},
	{
		category: "content",
		pattern:
			/\b(content gap|topic cluster|query fan-out|semantic|comparison|alternatives|funnel|prompt coverage|contenido)\b/i,
	},
	{
		category: "freshness",
		pattern:
			/\b(fresh|freshness|updated|recent|2026|2025|recency|actualizado)\b/i,
	},
];

const highAuthorityDomains = [
	"developers.google.com",
	"search.google.com",
	"support.google.com",
	"schema.org",
	"openai.com",
	"anthropic.com",
	"microsoft.com",
	"semrush.com",
	"ahrefs.com",
	"searchengineland.com",
	"ipullrank.com",
	"backlinko.com",
];

const lowSignalLinePatterns = [
	/^!\[Image\b/i,
	/^Image \d+:/i,
	/^blob:http/i,
	/^(advertisement|sponsored|newsletter|webinars|white papers)$/i,
	/^(sign up|subscribe|start free trial|get started|read more)$/i,
	/^(\* )?\[?(facebook|twitter|linkedin|instagram|youtube|podcast|webinars)\]?$/i,
	/^_{0,2}\*{0,2}Further reading:/i,
	/^_?Contributing authors are invited/i,
];

function loadLocalEnv() {
	for (const file of [".env.local", ".env"]) {
		const envPath = path.join(process.cwd(), file);
		if (!existsSync(envPath)) {
			continue;
		}

		const content = readFileSync(envPath, "utf8");
		for (const line of content.split(/\r?\n/)) {
			const trimmed = line.trim();
			if (!trimmed || trimmed.startsWith("#") || !trimmed.includes("=")) {
				continue;
			}
			const [key, ...valueParts] = trimmed.split("=");
			if (process.env[key]) {
				continue;
			}
			process.env[key] = valueParts.join("=").replace(/^["']|["']$/g, "");
		}
	}
}

async function listMarkdownFiles(dir: string): Promise<string[]> {
	const entries = await readdir(dir, { withFileTypes: true });
	const files = await Promise.all(
		entries.map(async (entry) => {
			const fullPath = path.join(dir, entry.name);
			if (entry.isDirectory()) {
				return listMarkdownFiles(fullPath);
			}
			return entry.isFile() && entry.name.endsWith(".md") ? [fullPath] : [];
		}),
	);
	return files.flat();
}

function parseFrontmatter(raw: string) {
	if (!raw.startsWith("---")) {
		return { metadata: new Map<string, string>(), body: raw };
	}

	const end = raw.indexOf("\n---", 3);
	if (end === -1) {
		return { metadata: new Map<string, string>(), body: raw };
	}

	const metadata = new Map<string, string>();
	for (const line of raw.slice(3, end).split(/\r?\n/)) {
		const separator = line.indexOf(":");
		if (separator === -1) {
			continue;
		}
		metadata.set(
			line.slice(0, separator).trim(),
			line.slice(separator + 1).trim(),
		);
	}

	return { metadata, body: raw.slice(end + 4).trim() };
}

function parseTags(value?: string) {
	if (!value) {
		return [];
	}
	return value
		.replace(/^\[|\]$/g, "")
		.split(/[, ]+/)
		.map((tag) => tag.replace(/^#/, "").trim())
		.filter(Boolean);
}

function domainFromUrl(url?: string) {
	if (!url) {
		return undefined;
	}
	try {
		return new URL(url).hostname.replace(/^www\./, "");
	} catch {
		return undefined;
	}
}

function inferCategory(input: {
	title: string;
	url?: string;
	filePath: string;
	body: string;
}) {
	const haystack = `${input.title}\n${input.url ?? ""}\n${input.filePath}\n${input.body.slice(0, 4000)}`;
	return (
		categoryRules.find((rule) => rule.pattern.test(haystack))?.category ??
		"content"
	);
}

function authorityTier(domain?: string) {
	if (!domain) {
		return 3;
	}
	if (highAuthorityDomains.some((trusted) => domain.endsWith(trusted))) {
		return 5;
	}
	if (/(^|\.)gov|(^|\.)edu|arxiv\.org|wikipedia\.org/.test(domain)) {
		return 5;
	}
	if (
		/(semrush|ahrefs|sistrix|brightedge|searchengineland|ipullrank|backlinko|moz|foundationinc)/.test(
			domain,
		)
	) {
		return 4;
	}
	return 3;
}

function cleanMarkdown(raw: string) {
	const withoutCodeBlocks = raw.replace(/```[\s\S]*?```/g, (block) =>
		block.length > 2500 ? "" : block,
	);
	const lines = withoutCodeBlocks
		.split(/\r?\n/)
		.map((line) => line.trimEnd())
		.filter(
			(line) =>
				!lowSignalLinePatterns.some((pattern) => pattern.test(line.trim())),
		);

	return lines
		.join("\n")
		.replace(/\n{4,}/g, "\n\n\n")
		.trim();
}

function contentQualityScore(content: string) {
	const text = content.toLowerCase();
	let score = 0;
	for (const rule of categoryRules) {
		if (rule.pattern.test(text)) {
			score += 2;
		}
	}
	if (
		/\b(should|must|recommend|prioritize|measure|track|audit|optimize|create|improve|avoid)\b/i.test(
			content,
		)
	) {
		score += 2;
	}
	if (
		/\b(schema\.org|json-ld|robots\.txt|sitemap|canonical|crawl|index)\b/i.test(
			content,
		)
	) {
		score += 1;
	}
	if ((content.match(/\[.*?\]\(.*?\)/g) ?? []).length > 25) {
		score -= 2;
	}
	if ((content.match(/blob:http/g) ?? []).length > 0) {
		score -= 3;
	}
	if (
		(content.match(/Example encoded as|Structured representation/g) ?? [])
			.length > 3
	) {
		score -= 2;
	}
	return score;
}

function titleFromMarkdown(body: string, fallback: string) {
	const heading = body.match(/^#\s+(.+)$/m)?.[1]?.trim();
	return heading || fallback.replace(/\.md$/i, "").replace(/[-_]/g, " ");
}

function splitOversizedChunk(content: string) {
	const chunks: string[] = [];
	let remaining = content.trim();
	while (remaining.length > MAX_CHARS) {
		const cutAt = Math.max(
			remaining.lastIndexOf("\n\n", MAX_CHARS),
			remaining.lastIndexOf(". ", MAX_CHARS),
		);
		const size = cutAt > MIN_CHARS ? cutAt : MAX_CHARS;
		chunks.push(remaining.slice(0, size).trim());
		remaining = remaining.slice(size).trim();
	}
	if (remaining.length >= MIN_CHARS) {
		chunks.push(remaining);
	}
	return chunks;
}

function chunkDocument(doc: MarkdownDoc): KnowledgeChunk[] {
	const sections: Array<{ headingPath: string[]; content: string }> = [];
	let currentHeadings: string[] = [];
	let currentLines: string[] = [];

	for (const line of doc.content.split(/\r?\n/)) {
		const heading = line.match(/^(#{2,3})\s+(.+)$/);
		if (heading) {
			if (currentLines.join("\n").trim().length >= MIN_CHARS) {
				sections.push({
					headingPath: currentHeadings,
					content: currentLines.join("\n").trim(),
				});
			}
			const level = heading[1].length;
			const title = heading[2].trim();
			currentHeadings =
				level === 2
					? [title]
					: [...currentHeadings.slice(0, 1), title].filter(Boolean);
			currentLines = [line];
			continue;
		}
		currentLines.push(line);
	}

	if (currentLines.join("\n").trim().length >= MIN_CHARS) {
		sections.push({
			headingPath: currentHeadings,
			content: currentLines.join("\n").trim(),
		});
	}

	const chunks = sections.length
		? sections
		: [{ headingPath: [], content: doc.content.trim() }];

	return chunks
		.flatMap((chunk) =>
			splitOversizedChunk(chunk.content).map((content) => {
				const hashInput = `${doc.relativePath}\n${chunk.headingPath.join(" > ")}\n${content}`;
				return {
					source_file: doc.relativePath,
					source_title: doc.title,
					source_url: doc.url,
					source_domain: doc.domain,
					heading_path: chunk.headingPath,
					content,
					content_hash: createHash("sha256").update(hashInput).digest("hex"),
					tags: doc.tags,
					category: doc.category,
					authority_tier: doc.authorityTier,
					published_at: doc.publishedAt,
					token_count: Math.ceil(content.length / 4),
				};
			}),
		)
		.filter((chunk) => contentQualityScore(chunk.content) >= 1);
}

async function embedTexts(texts: string[]) {
	const apiKey = process.env.OPENAI_API_KEY_EMBEDDINGS;
	if (!apiKey) {
		throw new Error("Missing OPENAI_API_KEY_EMBEDDINGS.");
	}

	const response = await fetch("https://api.openai.com/v1/embeddings", {
		method: "POST",
		headers: {
			Authorization: `Bearer ${apiKey}`,
			"Content-Type": "application/json",
		},
		body: JSON.stringify({
			model: EMBEDDING_MODEL,
			input: texts,
		}),
	});

	if (!response.ok) {
		throw new Error(
			`OpenAI embeddings error ${response.status}: ${await response.text()}`,
		);
	}

	const json = (await response.json()) as {
		data: Array<{ embedding: number[]; index: number }>;
	};
	return json.data
		.sort((a, b) => a.index - b.index)
		.map((item) => item.embedding);
}

async function main() {
	loadLocalEnv();

	if (!existsSync(KNOWLEDGE_DIR)) {
		throw new Error(`Knowledge directory not found: ${KNOWLEDGE_DIR}`);
	}

	const files = await listMarkdownFiles(KNOWLEDGE_DIR);
	const docs = await Promise.all(
		files.map(async (filePath) => {
			const raw = await readFile(filePath, "utf8");
			const { metadata, body } = parseFrontmatter(raw);
			const url = metadata.get("url");
			const domain = domainFromUrl(url);
			const cleanedBody = cleanMarkdown(body);
			const relativePath = path
				.relative(KNOWLEDGE_DIR, filePath)
				.replace(/\\/g, "/");
			return {
				filePath,
				relativePath,
				title:
					metadata.get("title") ??
					titleFromMarkdown(cleanedBody, path.basename(filePath)),
				url,
				domain,
				tags: parseTags(metadata.get("tags")),
				category:
					metadata.get("category") ??
					inferCategory({
						title: metadata.get("title") ?? "",
						url,
						filePath,
						body: cleanedBody,
					}),
				authorityTier: authorityTier(domain),
				publishedAt: metadata.get("publishedTime"),
				content: cleanedBody,
			};
		}),
	);

	const chunks = docs.flatMap(chunkDocument);
	const supabase = createAdminClient();
	const hashes = chunks.map((chunk) => chunk.content_hash);
	const existing = new Set<string>();

	console.log(`Knowledge files: ${docs.length}`);
	console.log(`Candidate chunks after cleaning: ${chunks.length}`);

	for (let index = 0; index < hashes.length; index += 1000) {
		const { data, error } = await supabase
			.from("knowledge_chunks")
			.select("content_hash")
			.in("content_hash", hashes.slice(index, index + 1000));

		if (error) {
			throw new Error(
				[
					error.message,
					JSON.stringify(error),
					"code" in error ? `code=${error.code}` : null,
					"details" in error ? `details=${error.details}` : null,
					"hint" in error ? `hint=${error.hint}` : null,
				]
					.filter(Boolean)
					.join(" | "),
			);
		}
		for (const row of data ?? []) {
			existing.add(row.content_hash);
		}
	}

	const pending = chunks.filter((chunk) => !existing.has(chunk.content_hash));
	console.log(`Chunks total: ${chunks.length}`);
	console.log(`Chunks unchanged: ${chunks.length - pending.length}`);
	console.log(`Chunks to upsert: ${pending.length}`);

	for (let index = 0; index < pending.length; index += BATCH_SIZE) {
		const batch = pending.slice(index, index + BATCH_SIZE);
		const embeddings = await embedTexts(batch.map((chunk) => chunk.content));
		const rows = batch.map((chunk, batchIndex) => ({
			...chunk,
			embedding: `[${embeddings[batchIndex].join(",")}]`,
			updated_at: new Date().toISOString(),
		}));

		const { error } = await supabase
			.from("knowledge_chunks")
			.upsert(rows, { onConflict: "source_file,content_hash" });

		if (error) {
			throw new Error(error.message);
		}

		console.log(
			`Indexed ${Math.min(index + BATCH_SIZE, pending.length)} / ${pending.length}`,
		);
	}
}

main().catch((error) => {
	console.error(error);
	process.exit(1);
});
