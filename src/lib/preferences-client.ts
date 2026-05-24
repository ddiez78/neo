import type { AppLocale, AppMode, AppTheme } from "./preferences";

type UpdatePayload = {
	locale?: AppLocale;
	theme?: AppTheme;
	mode?: AppMode;
};

export async function savePreferences(payload: UpdatePayload) {
	await fetch("/api/preferences", {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(payload),
	});
}
