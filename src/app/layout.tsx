import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { getUserPreferences } from "@/lib/preferences-server";
import "./globals.css";

const geistSans = Geist({
	variable: "--font-geist-sans",
	subsets: ["latin"],
});

const geistMono = Geist_Mono({
	variable: "--font-geist-mono",
	subsets: ["latin"],
});

export const metadata: Metadata = {
	title: "NEO GEO",
	description: "LLM visibility monitoring for brands.",
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	const prefsPromise = getUserPreferences();
	return (
		<RootLayoutInner prefsPromise={prefsPromise}>{children}</RootLayoutInner>
	);
}

async function RootLayoutInner({
	children,
	prefsPromise,
}: Readonly<{
	children: React.ReactNode;
	prefsPromise: ReturnType<typeof getUserPreferences>;
}>) {
	const prefs = await prefsPromise;

	return (
		<html
			lang={prefs.locale}
			className={`${geistSans.variable} ${geistMono.variable} ${prefs.theme === "dark" ? "dark" : ""} h-full antialiased`}
		>
			<body className="min-h-full flex flex-col">{children}</body>
		</html>
	);
}
