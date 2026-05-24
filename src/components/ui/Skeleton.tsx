import { cn } from "@/lib/utils";

export function Skeleton({
	className,
	variant = "line",
}: {
	className?: string;
	variant?: "line" | "card" | "chart" | "circle";
}) {
	const base = "animate-pulse bg-[var(--surface-subtle)]";
	const variants: Record<typeof variant, string> = {
		line: "h-4 w-full rounded",
		card: "h-32 w-full rounded-xl",
		chart: "h-64 w-full rounded-xl",
		circle: "size-10 rounded-full",
	};
	return <div className={cn(base, variants[variant], className)} />;
}

export function SkeletonText({
	lines = 3,
	className,
}: {
	lines?: number;
	className?: string;
}) {
	return (
		<div className={cn("space-y-2", className)}>
			{Array.from({ length: lines }).map((_, i) => (
				<Skeleton
					className={i === lines - 1 ? "w-2/3" : "w-full"}
					// biome-ignore lint/suspicious/noArrayIndexKey: skeleton has stable order
					key={i}
				/>
			))}
		</div>
	);
}

export function SkeletonKpiCard() {
	return (
		<div className="neo-card flex min-h-32 flex-col gap-3 p-4">
			<Skeleton className="h-3 w-20" />
			<Skeleton className="h-8 w-24" />
			<Skeleton className="h-3 w-full" />
			<Skeleton className="h-9 w-full" />
		</div>
	);
}

export function SkeletonTable({ rows = 5 }: { rows?: number }) {
	return (
		<div className="space-y-2">
			{Array.from({ length: rows }).map((_, i) => (
				<div
					className="flex items-center gap-3 rounded-lg border border-[var(--border)] p-3"
					// biome-ignore lint/suspicious/noArrayIndexKey: skeleton has stable order
					key={i}
				>
					<Skeleton variant="circle" className="size-8" />
					<div className="flex-1 space-y-1.5">
						<Skeleton className="h-3 w-3/4" />
						<Skeleton className="h-3 w-1/2" />
					</div>
					<Skeleton className="h-3 w-12" />
				</div>
			))}
		</div>
	);
}
