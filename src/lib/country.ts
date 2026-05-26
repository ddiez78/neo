const REGIONAL_INDICATOR_OFFSET = 0x1f1e6 - 65;

/**
 * Returns a flag emoji for an ISO-3166 alpha-2 country code (case-insensitive).
 * Falls back to a globe glyph when the input is missing or malformed.
 */
export function countryFlag(code: string | undefined | null): string {
	if (!code || code.length !== 2) return "🌐";
	const upper = code.toUpperCase();
	if (!/^[A-Z]{2}$/.test(upper)) return "🌐";
	const codePoints = upper
		.split("")
		.map((char) => REGIONAL_INDICATOR_OFFSET + char.charCodeAt(0));
	return String.fromCodePoint(...codePoints);
}
