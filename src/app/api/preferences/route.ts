import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import {
	type AppLocale,
	type AppTheme,
	normalizeLocale,
	normalizeTheme,
} from "@/lib/preferences";

type Payload = {
	locale?: AppLocale;
	theme?: AppTheme;
};

export async function POST(request: Request) {
	const body = (await request.json().catch(() => ({}))) as Payload;
	const locale = body.locale ? normalizeLocale(body.locale) : undefined;
	const theme = body.theme ? normalizeTheme(body.theme) : undefined;
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

	return NextResponse.json({ ok: true });
}
