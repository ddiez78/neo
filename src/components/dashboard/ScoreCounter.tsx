"use client";

import { useEffect, useRef, useState } from "react";

export function ScoreCounter({
	target,
	className,
}: {
	target: number;
	className?: string;
}) {
	const [displayed, setDisplayed] = useState(0);
	const rafRef = useRef<number | null>(null);
	const startRef = useRef<number | null>(null);
	const duration = 900;

	useEffect(() => {
		const start = performance.now();
		startRef.current = start;

		function step(now: number) {
			const elapsed = now - start;
			const progress = Math.min(elapsed / duration, 1);
			const eased = 1 - (1 - progress) ** 3;
			setDisplayed(Math.round(eased * target));
			if (progress < 1) {
				rafRef.current = requestAnimationFrame(step);
			}
		}

		rafRef.current = requestAnimationFrame(step);
		return () => {
			if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
		};
	}, [target]);

	return <span className={className}>{displayed}</span>;
}
