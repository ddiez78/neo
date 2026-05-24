export type ForecastPoint = {
	day: number;
	value: number;
};

export type Forecast = {
	current: number;
	in30Days: number;
	in60Days: number;
	in90Days: number;
	slopePerDay: number;
	daysToTarget75: number | null;
	hasEnoughData: boolean;
	projection: ForecastPoint[];
};

export function linearRegression(values: number[]): {
	slope: number;
	intercept: number;
} {
	const n = values.length;
	if (n < 2) return { slope: 0, intercept: values[0] ?? 0 };

	const xs = values.map((_, i) => i);
	const meanX = (n - 1) / 2;
	const meanY = values.reduce((s, v) => s + v, 0) / n;

	let numerator = 0;
	let denominator = 0;
	for (let i = 0; i < n; i++) {
		numerator += (xs[i] - meanX) * (values[i] - meanY);
		denominator += (xs[i] - meanX) ** 2;
	}

	const slope = denominator === 0 ? 0 : numerator / denominator;
	const intercept = meanY - slope * meanX;
	return { slope, intercept };
}

export function computeForecast(
	historicalValues: number[],
	targetScore = 75,
): Forecast {
	const hasEnoughData = historicalValues.length >= 7;
	if (!hasEnoughData) {
		const last = historicalValues[historicalValues.length - 1] ?? 0;
		return {
			current: last,
			in30Days: last,
			in60Days: last,
			in90Days: last,
			slopePerDay: 0,
			daysToTarget75: null,
			hasEnoughData: false,
			projection: [],
		};
	}

	const { slope, intercept } = linearRegression(historicalValues);
	const lastDay = historicalValues.length - 1;
	const current = slope * lastDay + intercept;

	const clamp = (v: number) => Math.max(0, Math.min(100, v));
	const in30 = clamp(slope * (lastDay + 30) + intercept);
	const in60 = clamp(slope * (lastDay + 60) + intercept);
	const in90 = clamp(slope * (lastDay + 90) + intercept);

	let daysToTarget: number | null = null;
	if (slope > 0 && current < targetScore) {
		const daysFromStart = (targetScore - intercept) / slope;
		const daysFromNow = Math.ceil(daysFromStart - lastDay);
		if (daysFromNow > 0 && daysFromNow < 730) daysToTarget = daysFromNow;
	} else if (current >= targetScore) {
		daysToTarget = 0;
	}

	const projection: ForecastPoint[] = [];
	for (let d = 1; d <= 90; d++) {
		projection.push({
			day: d,
			value: clamp(slope * (lastDay + d) + intercept),
		});
	}

	return {
		current: clamp(current),
		in30Days: in30,
		in60Days: in60,
		in90Days: in90,
		slopePerDay: slope,
		daysToTarget75: daysToTarget,
		hasEnoughData: true,
		projection,
	};
}
