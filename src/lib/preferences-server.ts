import { cookies } from "next/headers";
import {
	type AppLocale,
	type AppTheme,
	DEFAULT_LOCALE,
	DEFAULT_THEME,
	normalizeLocale,
	normalizeTheme,
} from "./preferences";

export async function getUserPreferences(): Promise<{
	locale: AppLocale;
	theme: AppTheme;
}> {
	const store = await cookies();
	return {
		locale: normalizeLocale(store.get("neo_locale")?.value ?? DEFAULT_LOCALE),
		theme: normalizeTheme(store.get("neo_theme")?.value ?? DEFAULT_THEME),
	};
}
