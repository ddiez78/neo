export type AppLocale = "es" | "en";
export type AppTheme = "light" | "dark";

export const DEFAULT_LOCALE: AppLocale = "es";
export const DEFAULT_THEME: AppTheme = "light";

export function normalizeLocale(value?: string | null): AppLocale {
	return value === "en" ? "en" : "es";
}

export function normalizeTheme(value?: string | null): AppTheme {
	return value === "dark" ? "dark" : "light";
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
