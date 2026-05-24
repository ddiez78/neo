"use client";

import { ArrowRight, Zap } from "lucide-react";
import { useState } from "react";
import type { AppMode } from "@/lib/preferences";
import { savePreferences } from "@/lib/preferences-client";

export function UpgradeTierButton({
	targetMode,
	label,
	isEn = false,
}: {
	targetMode: AppMode;
	label: string;
	isEn?: boolean;
}) {
	const [saving, setSaving] = useState(false);

	async function upgrade() {
		if (saving) return;
		setSaving(true);
		await savePreferences({ mode: targetMode });
		window.location.reload();
	}

	return (
		<button
			className="inline-flex items-center gap-2 rounded-lg bg-[var(--brand)] px-6 py-3 text-sm font-black text-[#1b1000] shadow-[0_8px_24px_rgba(244,149,39,0.25)] transition hover:brightness-110 disabled:opacity-60"
			disabled={saving}
			onClick={upgrade}
			type="button"
		>
			<Zap className="size-4" />
			{saving ? (isEn ? "Switching..." : "Cambiando...") : label}
			<ArrowRight className="size-4" />
		</button>
	);
}
