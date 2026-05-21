import type { Metadata } from "next";
import { Geist_Mono, Inter } from "next/font/google";
import { getUserPreferences } from "@/lib/preferences-server";
import "./globals.css";

const inter = Inter({
	variable: "--font-inter",
	subsets: ["latin"],
});

const geistMono = Geist_Mono({
	variable: "--font-geist-mono",
	subsets: ["latin"],
});

export const metadata: Metadata = {
	title: "citame.ai",
	description: "AI visibility and SEO intelligence for brands.",
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
			className={`${inter.variable} ${geistMono.variable} ${prefs.theme === "dark" ? "dark" : ""} h-full antialiased`}
		>
			<body className="min-h-full flex flex-col" suppressHydrationWarning>
				{children}
			</body>
		</html>
	);
}
