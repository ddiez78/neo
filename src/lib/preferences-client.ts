import type { AppLocale, AppTheme } from "./preferences";

type UpdatePayload = {
	locale?: AppLocale;
	theme?: AppTheme;
};

export async function savePreferences(payload: UpdatePayload) {
	await fetch("/api/preferences", {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(payload),
	});
}
