export type GlossaryEntry = {
	term: string;
	titleEs: string;
	titleEn: string;
	descEs: string;
	descEn: string;
};

export const GLOSSARY: Record<string, GlossaryEntry> = {
	readiness: {
		term: "readiness",
		titleEs: "GEO Readiness Score",
		titleEn: "GEO Readiness Score",
		descEs:
			"Puntuacion 0-100 que mide como de preparada esta tu marca para ser citada por asistentes de IA. Combina visibilidad, posicion media, autoridad de fuentes y sentimiento.",
		descEn:
			"0-100 score measuring how prepared your brand is to be cited by AI assistants. Combines visibility, average position, source authority and sentiment.",
	},
	visibility: {
		term: "visibility",
		titleEs: "Visibilidad",
		titleEn: "Visibility",
		descEs:
			"% de respuestas de IA en las que aparece tu marca. 100% significa que estas presente en todas las consultas relevantes.",
		descEn:
			"% of AI responses where your brand appears. 100% means you are present in all relevant queries.",
	},
	shareOfVoice: {
		term: "shareOfVoice",
		titleEs: "Share of Voice",
		titleEn: "Share of Voice",
		descEs:
			"Porcentaje de menciones que se lleva tu marca frente al total de menciones (tu marca + competidores) en las respuestas de IA.",
		descEn:
			"Percentage of mentions your brand captures versus total mentions (your brand + competitors) in AI responses.",
	},
	brandMentionRate: {
		term: "brandMentionRate",
		titleEs: "Tasa de mencion de marca",
		titleEn: "Brand Mention Rate",
		descEs:
			"Frecuencia con la que la IA menciona tu marca al responder a preguntas de tu sector.",
		descEn:
			"Frequency with which AI mentions your brand when answering questions in your sector.",
	},
	avgPosition: {
		term: "avgPosition",
		titleEs: "Posicion media",
		titleEn: "Average Position",
		descEs:
			"Orden medio en el que aparece tu marca cuando es mencionada. 1 = siempre primera; 5 = quinta posicion. Numeros mas bajos son mejores.",
		descEn:
			"Average order in which your brand appears when mentioned. 1 = always first; 5 = fifth position. Lower is better.",
	},
	sentiment: {
		term: "sentiment",
		titleEs: "Sentimiento",
		titleEn: "Sentiment",
		descEs:
			"Tono con el que la IA habla de tu marca: positivo, neutro o negativo. Refleja como te perciben las fuentes que cita la IA.",
		descEn:
			"Tone with which AI talks about your brand: positive, neutral or negative. Reflects how sources cited by AI perceive you.",
	},
	competitorPressure: {
		term: "competitorPressure",
		titleEs: "Presion competitiva",
		titleEn: "Competitor Pressure",
		descEs:
			"Cuanto te ganan tus competidores en las respuestas de IA. Alta presion = aparecen mas que tu en preguntas donde deberias salir.",
		descEn:
			"How much your competitors beat you in AI responses. High pressure = they appear more than you in queries where you should show up.",
	},
	displacement: {
		term: "displacement",
		titleEs: "Desplazamientos",
		titleEn: "Displacements",
		descEs:
			"Veces que un competidor te ha sustituido en respuestas de IA donde antes aparecias tu.",
		descEn:
			"Times a competitor has replaced you in AI responses where you previously appeared.",
	},
	sourceAuthority: {
		term: "sourceAuthority",
		titleEs: "Autoridad de fuente",
		titleEn: "Source Authority",
		descEs:
			"Reputacion 0-100 de un dominio web. Las IAs confian mas en fuentes con alta autoridad (medios, instituciones, sitios establecidos).",
		descEn:
			"0-100 reputation of a web domain. AIs trust sources with high authority (media, institutions, established sites) more.",
	},
	authorityTier: {
		term: "authorityTier",
		titleEs: "Tier de autoridad",
		titleEn: "Authority Tier",
		descEs:
			"Categoria de calidad de una fuente: Alta (>70), Media (40-70), Baja (<40). Cuanto mayor, mas peso tiene en lo que dice la IA.",
		descEn:
			"Source quality category: High (>70), Medium (40-70), Low (<40). Higher means more weight in what the AI says.",
	},
	citationContext: {
		term: "citationContext",
		titleEs: "Contexto de cita",
		titleEn: "Citation Context",
		descEs:
			"Fragmento de texto alrededor de una mencion en la respuesta de IA. Te permite ver exactamente como te describen.",
		descEn:
			"Text fragment around a mention in the AI response. Lets you see exactly how you are being described.",
	},
	rankGroup: {
		term: "rankGroup",
		titleEs: "Grupo de posicion",
		titleEn: "Rank Group",
		descEs:
			"Tu marca aparece al inicio (Top), en medio (Middle) o al final (Late) de la respuesta de IA. Top es lo mas valioso.",
		descEn:
			"Your brand appears at the start (Top), middle (Middle) or end (Late) of the AI response. Top is most valuable.",
	},
	entityGap: {
		term: "entityGap",
		titleEs: "Gap de entidad",
		titleEn: "Entity Gap",
		descEs:
			"Atributo de tu marca que la IA no conoce o describe mal. Cubrir estos gaps mejora la calidad con la que te citan.",
		descEn:
			"Brand attribute the AI does not know or describes incorrectly. Filling these gaps improves how you are cited.",
	},
	intent: {
		term: "intent",
		titleEs: "Intencion de busqueda",
		titleEn: "Search Intent",
		descEs:
			"Que busca el usuario al hacer una pregunta: informarse (awareness), comparar, decidir, comprar. Cada intent requiere contenido distinto.",
		descEn:
			"What the user seeks when asking: awareness, comparison, decision, purchase. Each intent needs different content.",
	},
	funnelStage: {
		term: "funnelStage",
		titleEs: "Etapa del funnel",
		titleEn: "Funnel Stage",
		descEs:
			"Punto del proceso de compra del cliente: descubrimiento, consideracion, decision. Te ayuda a priorizar prompts.",
		descEn:
			"Customer journey point: discovery, consideration, decision. Helps you prioritize prompts.",
	},
	companyUnderstanding: {
		term: "companyUnderstanding",
		titleEs: "Comprension de la marca",
		titleEn: "Brand Understanding",
		descEs:
			"% que mide cuanto sabe la IA sobre tu empresa. Se basa en campos verificados del Company Bio y senales del web.",
		descEn:
			"% measuring how much the AI knows about your company. Based on verified Company Bio fields and web signals.",
	},
	confidence: {
		term: "confidence",
		titleEs: "Confianza",
		titleEn: "Confidence",
		descEs:
			"Cuan seguros estamos de una mencion. Confianza alta = la IA cita tu marca claramente. Baja = ambigua o indirecta.",
		descEn:
			"How sure we are about a mention. High confidence = AI clearly cites your brand. Low = ambiguous or indirect.",
	},
	impactScore: {
		term: "impactScore",
		titleEs: "Impacto",
		titleEn: "Impact Score",
		descEs:
			"Cuanto puede mover tu readiness score implementar una recomendacion. 0-100; >80 es impacto alto.",
		descEn:
			"How much implementing a recommendation can move your readiness score. 0-100; >80 is high impact.",
	},
	costPerMention: {
		term: "costPerMention",
		titleEs: "Coste por mencion",
		titleEn: "Cost per Mention",
		descEs:
			"Lo que te cuesta en LLMs (en euros) cada mencion conseguida. Util para comparar eficiencia entre proveedores.",
		descEn:
			"What it costs you in LLM spend (euros) per mention obtained. Useful to compare efficiency between providers.",
	},
	tokenEfficiency: {
		term: "tokenEfficiency",
		titleEs: "Eficiencia de tokens",
		titleEn: "Token Efficiency",
		descEs:
			"Cuanta visibilidad obtienes por cada 1000 tokens consumidos. Mide si tus prompts son economicos.",
		descEn:
			"How much visibility you get per 1000 tokens consumed. Measures whether your prompts are cost-effective.",
	},
	llmCoverage: {
		term: "llmCoverage",
		titleEs: "Cobertura LLM",
		titleEn: "LLM Coverage",
		descEs:
			"En cuantos asistentes (ChatGPT, Claude, Gemini, etc.) aparece tu marca. Cuantos mas, mas inmune a cambios de un solo motor.",
		descEn:
			"How many assistants (ChatGPT, Claude, Gemini, etc.) mention your brand. More coverage = more resilience to single-engine changes.",
	},
	gapFinder: {
		term: "gapFinder",
		titleEs: "Gap Finder",
		titleEn: "Gap Finder",
		descEs:
			"Herramienta que detecta preguntas relevantes donde no apareces pero deberias. Las llamamos huecos competitivos.",
		descEn:
			"Tool that detects relevant queries where you do not appear but should. We call these competitive gaps.",
	},
	prompt: {
		term: "prompt",
		titleEs: "Prompt / Pregunta",
		titleEn: "Prompt / Question",
		descEs:
			"Pregunta que un cliente potencial podria hacer a la IA. Tu visibilidad se mide ejecutando estos prompts contra varios LLMs.",
		descEn:
			"Question a potential customer could ask the AI. Your visibility is measured by running these prompts against multiple LLMs.",
	},
	promptRun: {
		term: "promptRun",
		titleEs: "Ejecucion de prompt",
		titleEn: "Prompt Run",
		descEs:
			"Cada vez que un prompt se ejecuta contra un LLM. Cada run produce una respuesta, menciones y citas de fuentes.",
		descEn:
			"Each time a prompt is executed against an LLM. Each run produces a response, mentions and source citations.",
	},
	candidate: {
		term: "candidate",
		titleEs: "Candidato",
		titleEn: "Candidate",
		descEs:
			"Prompt sugerido automaticamente que aun no esta activo. Puedes aprobarlo o rechazarlo tras revisarlo.",
		descEn:
			"Automatically suggested prompt that is not active yet. You can approve or reject it after reviewing.",
	},
	recommendation: {
		term: "recommendation",
		titleEs: "Recomendacion",
		titleEn: "Recommendation",
		descEs:
			"Accion concreta para mejorar tu visibilidad GEO. Incluye categoria, impacto esperado, prioridad y pasos.",
		descEn:
			"Specific action to improve your GEO visibility. Includes category, expected impact, priority and steps.",
	},
	source: {
		term: "source",
		titleEs: "Fuente",
		titleEn: "Source",
		descEs:
			"Sitio web que la IA cita al responder. Las fuentes con alta autoridad refuerzan o debilitan tu posicion.",
		descEn:
			"Website cited by the AI when responding. High-authority sources reinforce or weaken your position.",
	},
	ownedSource: {
		term: "ownedSource",
		titleEs: "Fuente propia",
		titleEn: "Owned Source",
		descEs:
			"Fuente que tu controlas (tu web, blog, redes). Aumentar fuentes propias citadas mejora el control narrativo.",
		descEn:
			"Source you control (your site, blog, social). Increasing owned sources cited improves narrative control.",
	},
	mentionContext: {
		term: "mentionContext",
		titleEs: "Contexto de mencion",
		titleEn: "Mention Context",
		descEs:
			"Las ~180 caracteres alrededor de una mencion en la respuesta IA. Te permite ver el contexto exacto.",
		descEn:
			"The ~180 characters around a mention in the AI response. Lets you see the exact context.",
	},
	geoScore: {
		term: "geoScore",
		titleEs: "GEO Score",
		titleEn: "GEO Score",
		descEs:
			"Puntuacion global 0-100 que resume tu salud GEO. Igual que el Readiness Score.",
		descEn:
			"Global 0-100 score summarizing your GEO health. Same as Readiness Score.",
	},
	weeklyActivity: {
		term: "weeklyActivity",
		titleEs: "Actividad semanal",
		titleEn: "Weekly Activity",
		descEs:
			"Resumen de lo que ha pasado en tu workspace los ultimos 7 dias: prompts ejecutados, nuevas menciones, recomendaciones generadas.",
		descEn:
			"Summary of what happened in your workspace in the last 7 days: prompts executed, new mentions, recommendations generated.",
	},
	roi: {
		term: "roi",
		titleEs: "ROI de acciones",
		titleEn: "Action ROI",
		descEs:
			"Como han impactado tus acciones completadas en las metricas reales. Conecta lo que hiciste con lo que cambio.",
		descEn:
			"How your completed actions have impacted real metrics. Connects what you did with what changed.",
	},
};

export function getGlossaryEntry(term: string): GlossaryEntry | null {
	return GLOSSARY[term] ?? null;
}
