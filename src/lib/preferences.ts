export type AppLocale = "es" | "en";
export type AppTheme = "light" | "dark";
export type AppMode = "sme" | "pro" | "agency";

export const DEFAULT_LOCALE: AppLocale = "es";
export const DEFAULT_THEME: AppTheme = "dark";
export const DEFAULT_MODE: AppMode = "sme";

export function normalizeLocale(value?: string | null): AppLocale {
	return value === "en" ? "en" : "es";
}

export function normalizeTheme(value?: string | null): AppTheme {
	return value === "dark" ? "dark" : "light";
}

export function normalizeMode(value?: string | null): AppMode {
	if (value === "agency") return "agency";
	if (value === "pro") return "pro";
	return "sme";
}

type Copy = {
	common: {
		workspace: string;
		manage: string;
		switch: string;
		settings: string;
		language: string;
		theme: string;
		light: string;
		dark: string;
		logout: string;
	};
};

export const copy: Record<AppLocale, Copy> = {
	es: {
		common: {
			workspace: "Workspace",
			manage: "Gestionar",
			switch: "Cambiar",
			settings: "Ajustes",
			language: "Idioma",
			theme: "Tema",
			light: "Claro",
			dark: "Oscuro",
			logout: "Cerrar sesion",
		},
	},
	en: {
		common: {
			workspace: "Workspace",
			manage: "Manage",
			switch: "Switch",
			settings: "Settings",
			language: "Language",
			theme: "Theme",
			light: "Light",
			dark: "Dark",
			logout: "Log out",
		},
	},
};
