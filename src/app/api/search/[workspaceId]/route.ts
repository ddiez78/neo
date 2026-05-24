import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

type SearchResult = {
	kind: "prompt" | "recommendation" | "source" | "competitor";
	id: string;
	title: string;
	subtitle?: string;
	href: string;
};

export async function GET(
	request: Request,
	{ params }: { params: Promise<{ workspaceId: string }> },
) {
	const { workspaceId } = await params;
	const url = new URL(request.url);
	const q = (url.searchParams.get("q") ?? "").trim().toLowerCase();
	if (q.length < 2) {
		return NextResponse.json({ results: [] });
	}

	const supabase = await createClient();
	const { data: user } = await supabase.auth.getUser();
	if (!user.user) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	const { data: workspace } = await supabase
		.from("workspaces")
		.select("slug")
		.eq("id", workspaceId)
		.maybeSingle();
	if (!workspace) {
		return NextResponse.json({ results: [] });
	}
	const slug = workspace.slug as string;

	const [promptsRes, recsRes, sourcesRes, competitorsRes] = await Promise.all([
		supabase
			.from("prompts")
			.select("id, body, intent, status")
			.eq("workspace_id", workspaceId)
			.ilike("body", `%${q}%`)
			.limit(8),
		supabase
			.from("recommendations")
			.select("id, title, category")
			.eq("workspace_id", workspaceId)
			.ilike("title", `%${q}%`)
			.limit(8),
		supabase
			.from("prompt_run_sources")
			.select("id, domain, source_type")
			.eq("workspace_id", workspaceId)
			.ilike("domain", `%${q}%`)
			.limit(8),
		supabase
			.from("competitors")
			.select("id, name, domain")
			.eq("workspace_id", workspaceId)
			.ilike("name", `%${q}%`)
			.limit(8),
	]);

	const results: SearchResult[] = [];

	for (const p of promptsRes.data ?? []) {
		results.push({
			kind: "prompt",
			id: p.id,
			title: p.body?.slice(0, 100) ?? "Untitled",
			subtitle: p.intent ?? p.status ?? "",
			href: `/${slug}/prompts`,
		});
	}
	for (const r of recsRes.data ?? []) {
		results.push({
			kind: "recommendation",
			id: r.id,
			title: r.title ?? "Recommendation",
			subtitle: r.category ?? "",
			href: `/${slug}/recommendations`,
		});
	}
	for (const s of sourcesRes.data ?? []) {
		results.push({
			kind: "source",
			id: s.id,
			title: s.domain ?? "Source",
			subtitle: s.source_type ?? "",
			href: `/${slug}/sources`,
		});
	}
	for (const c of competitorsRes.data ?? []) {
		results.push({
			kind: "competitor",
			id: c.id,
			title: c.name ?? "Competitor",
			subtitle: c.domain ?? "",
			href: `/${slug}/competitors`,
		});
	}

	return NextResponse.json({ results });
}
