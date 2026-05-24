import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import {
	type AppLocale,
	type AppMode,
	type AppTheme,
	normalizeLocale,
	normalizeMode,
	normalizeTheme,
} from "@/lib/preferences";
import { createClient } from "@/lib/supabase/server";

type Payload = {
	locale?: AppLocale;
	theme?: AppTheme;
	mode?: AppMode;
};

export async function POST(request: Request) {
	const supabase = await createClient();
	const {
		data: { user },
	} = await supabase.auth.getUser();
	if (!user)
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

	const body = (await request.json().catch(() => ({}))) as Payload;
	const locale = body.locale ? normalizeLocale(body.locale) : undefined;
	const theme = body.theme ? normalizeTheme(body.theme) : undefined;
	const mode = body.mode ? normalizeMode(body.mode) : undefined;
	const store = await cookies();

	if (locale) {
		store.set("neo_locale", locale, {
			path: "/",
			maxAge: 31536000,
			sameSite: "lax",
		});
	}

	if (theme) {
		store.set("neo_theme", theme, {
			path: "/",
			maxAge: 31536000,
			sameSite: "lax",
		});
	}

	if (mode) {
		store.set("neo_mode", mode, {
			path: "/",
			maxAge: 31536000,
			sameSite: "lax",
		});
	}

	return NextResponse.json({ ok: true });
}
