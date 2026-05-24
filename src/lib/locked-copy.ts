import type { TierFeature } from "./tiers";

export type LockedCopy = {
	titleEs: string;
	titleEn: string;
	descEs: string;
	descEn: string;
	bulletsEs: string[];
	bulletsEn: string[];
};

export const LOCKED_COPY: Partial<Record<TierFeature, LockedCopy>> = {
	roi: {
		titleEs: "ROI: Acciones a Resultados",
		titleEn: "ROI: Actions to Results",
		descEs:
			"Conecta cada accion que implementas con la mejora real en tus metricas. Mide el retorno de cada decision.",
		descEn:
			"Connect each action you implement with the real improvement in your metrics. Measure the return on every decision.",
		bulletsEs: [
			"Timeline de acciones completadas con su impacto",
			"Visibilidad antes/despues por accion",
			"Impacto agregado por trimestre o periodo",
			"Justificacion clara para informes a cliente",
		],
		bulletsEn: [
			"Timeline of completed actions with their impact",
			"Visibility before/after per action",
			"Aggregated impact per quarter or period",
			"Clear justification for client reports",
		],
	},
	tasks: {
		titleEs: "Gestion de Tareas",
		titleEn: "Task Management",
		descEs:
			"Convierte cada recomendacion en una tarea ejecutable y haz seguimiento del estado en un tablero kanban.",
		descEn:
			"Turn each recommendation into an executable task and track progress in a kanban board.",
		bulletsEs: [
			"Kanban con estados Pendiente / En curso / Hecha",
			"Asignacion de responsables y prioridades",
			"Vinculo directo entre recomendacion y accion",
			"Conteo de tareas pendientes por workspace",
		],
		bulletsEn: [
			"Kanban with Pending / In progress / Done states",
			"Assignment of owners and priorities",
			"Direct link between recommendation and action",
			"Pending task count per workspace",
		],
	},
	templates: {
		titleEs: "Plantillas por Sector",
		titleEn: "Sector Templates",
		descEs:
			"Empieza con prompts y competidores precargados segun tu sector. Restaurante, clinica, despacho, ecommerce y mas.",
		descEn:
			"Start with prompts and competitors preloaded for your sector. Restaurant, clinic, office, ecommerce and more.",
		bulletsEs: [
			"6 plantillas por sector listas para usar",
			"10-15 prompts por plantilla",
			"3-5 competidores tipicos sugeridos",
			"Brand bio prerellenada con USPs comunes",
		],
		bulletsEn: [
			"6 ready-to-use sector templates",
			"10-15 prompts per template",
			"3-5 typical suggested competitors",
			"Pre-filled brand bio with common USPs",
		],
	},
	"company-bio": {
		titleEs: "Company Bio Avanzado",
		titleEn: "Advanced Company Bio",
		descEs:
			"Perfil de empresa completo con extracción IA, verificación de campos y deteccion de entity gaps para mejorar como te entienden los LLMs.",
		descEn:
			"Complete company profile with AI extraction, field verification and entity gap detection to improve how LLMs understand you.",
		bulletsEs: [
			"Extraccion automatica desde tu web",
			"Verificacion campo a campo con auditoria",
			"Deteccion de entity gaps priorizada",
			"Mejor scoring de visibilidad GEO",
		],
		bulletsEn: [
			"Automatic extraction from your website",
			"Field-by-field verification with audit trail",
			"Prioritized entity gap detection",
			"Better GEO visibility scoring",
		],
	},
};
