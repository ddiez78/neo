import { cookies } from "next/headers";
import {
	type AppLocale,
	type AppMode,
	type AppTheme,
	DEFAULT_LOCALE,
	DEFAULT_MODE,
	DEFAULT_THEME,
	normalizeLocale,
	normalizeMode,
	normalizeTheme,
} from "./preferences";

export async function getUserPreferences(): Promise<{
	locale: AppLocale;
	theme: AppTheme;
	mode: AppMode;
}> {
	const store = await cookies();
	return {
		locale: normalizeLocale(store.get("neo_locale")?.value ?? DEFAULT_LOCALE),
		theme: normalizeTheme(store.get("neo_theme")?.value ?? DEFAULT_THEME),
		mode: normalizeMode(store.get("neo_mode")?.value ?? DEFAULT_MODE),
	};
}
