export type SectorTemplate = {
	id: string;
	nameEs: string;
	nameEn: string;
	emoji: string;
	descEs: string;
	descEn: string;
	industry: string;
	prompts: { body: string; intent: string }[];
	competitorExamples: string[];
	uspIdeas: string[];
};

export const SECTOR_TEMPLATES: SectorTemplate[] = [
	{
		id: "local_restaurant",
		nameEs: "Restaurante local",
		nameEn: "Local restaurant",
		emoji: "🍴",
		descEs: "Bares, restaurantes, cafeterias, bistros de barrio.",
		descEn: "Local bars, restaurants, cafes, neighborhood bistros.",
		industry: "Hospitality",
		prompts: [
			{
				body: "Cual es el mejor restaurante de [ciudad] para una cena romantica?",
				intent: "recommendation",
			},
			{
				body: "Que restaurantes de [ciudad] tienen menu del dia bueno?",
				intent: "comparison",
			},
			{
				body: "Donde comer paella en [ciudad]?",
				intent: "recommendation",
			},
			{
				body: "Restaurantes en [ciudad] abiertos los domingos por la noche.",
				intent: "local",
			},
			{
				body: "Cual es la mejor opcion vegana en [ciudad]?",
				intent: "recommendation",
			},
			{
				body: "Restaurantes con terraza en [ciudad]?",
				intent: "local",
			},
			{
				body: "Mejores reseñas de restaurantes en [ciudad].",
				intent: "awareness",
			},
			{
				body: "Restaurantes que aceptan reservas online en [ciudad].",
				intent: "decision",
			},
		],
		competitorExamples: ["TripAdvisor top 10", "Google Maps 4.5+", "Tenedor"],
		uspIdeas: [
			"Producto local y de temporada",
			"Reservas instantaneas",
			"Menu degustacion",
			"Eventos privados",
		],
	},
	{
		id: "dental_clinic",
		nameEs: "Clinica dental",
		nameEn: "Dental clinic",
		emoji: "🦷",
		descEs: "Dentistas, ortodoncistas, implantologos, esteticos dentales.",
		descEn: "Dentists, orthodontists, implantologists, dental aesthetics.",
		industry: "Healthcare",
		prompts: [
			{
				body: "Cual es la mejor clinica dental en [ciudad]?",
				intent: "recommendation",
			},
			{
				body: "Precio aproximado de un implante dental en [ciudad].",
				intent: "pricing",
			},
			{
				body: "Mejor ortodoncia invisalign en [ciudad]?",
				intent: "comparison",
			},
			{
				body: "Clinicas dentales que financien tratamientos en [ciudad].",
				intent: "decision",
			},
			{
				body: "Que dentista es bueno para niños en [ciudad]?",
				intent: "recommendation",
			},
			{
				body: "Riesgos de no tratar un implante dental.",
				intent: "risk",
			},
			{
				body: "Mejores opiniones de pacientes en clinicas dentales [ciudad].",
				intent: "awareness",
			},
			{
				body: "Tratamiento estetico dental con resultados naturales.",
				intent: "alternatives",
			},
		],
		competitorExamples: ["Vitaldent", "Sanitas Dental", "Adeslas Dental"],
		uspIdeas: [
			"Primera consulta gratis",
			"Financiacion sin intereses",
			"Tecnologia 3D / escaneo intraoral",
			"Especialistas certificados",
		],
	},
	{
		id: "professional_office",
		nameEs: "Despacho profesional",
		nameEn: "Professional office",
		emoji: "📋",
		descEs: "Abogados, asesores fiscales, gestorias, consultorias.",
		descEn: "Lawyers, tax advisors, accountants, consultancies.",
		industry: "Professional services",
		prompts: [
			{
				body: "Mejor asesor fiscal para autonomos en [ciudad]?",
				intent: "recommendation",
			},
			{
				body: "Cuanto cobra una gestoria por hacer la declaracion?",
				intent: "pricing",
			},
			{
				body: "Abogado laboralista recomendado en [ciudad].",
				intent: "recommendation",
			},
			{
				body: "Gestoria online vs presencial: cual es mejor?",
				intent: "comparison",
			},
			{
				body: "Asesor para crear una sociedad limitada paso a paso.",
				intent: "decision",
			},
			{
				body: "Errores comunes al elegir asesor fiscal.",
				intent: "risk",
			},
			{
				body: "Opiniones de gestorias en [ciudad].",
				intent: "awareness",
			},
		],
		competitorExamples: ["Sage", "Quipu", "Holded"],
		uspIdeas: [
			"Atencion personalizada por un unico asesor",
			"Especialistas por sector",
			"Plataforma online 24/7",
			"Primera consulta sin compromiso",
		],
	},
	{
		id: "ecommerce",
		nameEs: "E-commerce",
		nameEn: "E-commerce",
		emoji: "🛒",
		descEs: "Tiendas online, marketplaces, marcas D2C.",
		descEn: "Online stores, marketplaces, D2C brands.",
		industry: "E-commerce",
		prompts: [
			{
				body: "Donde comprar [producto] online con envio rapido?",
				intent: "decision",
			},
			{
				body: "Mejor marca de [producto] calidad-precio.",
				intent: "comparison",
			},
			{
				body: "Tiendas online de [categoria] con devolucion gratuita.",
				intent: "decision",
			},
			{
				body: "Reseñas reales de [marca].",
				intent: "awareness",
			},
			{
				body: "Alternativas a [marca lider] en [categoria].",
				intent: "alternatives",
			},
			{
				body: "Precios de [producto] en distintas tiendas online.",
				intent: "pricing",
			},
			{
				body: "Es seguro comprar en [marca]?",
				intent: "risk",
			},
		],
		competitorExamples: ["Amazon", "El Corte Ingles", "PcComponentes"],
		uspIdeas: [
			"Envio 24h gratuito",
			"Devolucion sin preguntas",
			"Garantia extendida 2 anos",
			"Atencion al cliente personalizada",
		],
	},
	{
		id: "saas_b2b",
		nameEs: "SaaS B2B",
		nameEn: "B2B SaaS",
		emoji: "💼",
		descEs: "Software como servicio para empresas y profesionales.",
		descEn: "Software as a service for businesses and professionals.",
		industry: "Software",
		prompts: [
			{
				body: "Mejor software de [categoria] para [tipo de empresa]?",
				intent: "recommendation",
			},
			{
				body: "Alternativas a [competidor lider] mas baratas.",
				intent: "alternatives",
			},
			{
				body: "Comparativa [marca] vs [competidor].",
				intent: "comparison",
			},
			{
				body: "Plan free vs pago en [marca]: que diferencias hay?",
				intent: "pricing",
			},
			{
				body: "Es [marca] adecuado para pymes?",
				intent: "decision",
			},
			{
				body: "Reseñas de [marca] en G2 / Capterra.",
				intent: "awareness",
			},
			{
				body: "Integraciones disponibles en [marca].",
				intent: "decision",
			},
			{
				body: "Como migrar de [competidor] a [marca].",
				intent: "alternatives",
			},
		],
		competitorExamples: ["HubSpot", "Salesforce", "Zoho"],
		uspIdeas: [
			"Setup en 5 minutos",
			"Sin tarjeta para empezar",
			"Integracion nativa con [X]",
			"Soporte humano 24/7",
		],
	},
	{
		id: "local_store",
		nameEs: "Tienda local",
		nameEn: "Local store",
		emoji: "🏪",
		descEs: "Tiendas fisicas, comercios de proximidad, boutiques.",
		descEn: "Physical stores, local commerce, boutiques.",
		industry: "Retail",
		prompts: [
			{
				body: "Donde comprar [producto] en [ciudad]?",
				intent: "local",
			},
			{
				body: "Tiendas de [categoria] en [barrio o zona].",
				intent: "local",
			},
			{
				body: "Mejor tienda de [producto] cerca de mi.",
				intent: "recommendation",
			},
			{
				body: "Que tiendas de [categoria] abren los domingos en [ciudad]?",
				intent: "local",
			},
			{
				body: "Reseñas de [marca local].",
				intent: "awareness",
			},
		],
		competitorExamples: [
			"Cadenas nacionales del sector",
			"Tiendas de barrio cercanas",
		],
		uspIdeas: [
			"Trato cercano y personalizado",
			"Producto seleccionado a mano",
			"Asesoramiento experto en tienda",
			"Servicio post-venta local",
		],
	},
];

export function getSectorTemplate(id: string): SectorTemplate | undefined {
	return SECTOR_TEMPLATES.find((t) => t.id === id);
}
