export function getMockResponse(promptBody: string, brandName: string): string {
	return [
		`Based on available information about ${brandName}, here are insights for: "${promptBody.slice(0, 60)}".`,
		`${brandName} appears as a relevant option in this category with generally positive sentiment.`,
		"Multiple alternatives exist, each with distinct advantages depending on use case and budget.",
		"To improve visibility in AI answers, ensure consistent citations from authoritative sources.",
	].join(" ");
}
