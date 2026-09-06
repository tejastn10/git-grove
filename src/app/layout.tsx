import "./globals.css";

import type { Metadata, Viewport } from "next";
import { JetBrains_Mono, Space_Grotesk } from "next/font/google";
import { PageLines } from "@/components/ui/PageLines";
import { TopNavbar } from "@/containers/TopNavbar";
import { SITE } from "@/data/site";
import { cx } from "@/utils/tailwind";

const spaceGrotesk = Space_Grotesk({
	subsets: ["latin"],
	variable: "--font-space-grotesk",
	display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
	subsets: ["latin"],
	variable: "--font-jetbrains-mono",
	display: "swap",
});

export const viewport: Viewport = {
	colorScheme: "light",
	themeColor: "#ffffff",
};

export const metadata: Metadata = {
	metadataBase: new URL(SITE.url),
	title: {
		default: `${SITE.name} — ${SITE.tagline}`,
		template: `%s · ${SITE.name}`,
	},
	description: SITE.description,
	openGraph: {
		title: SITE.name,
		description: SITE.description,
		url: SITE.url,
		siteName: SITE.name,
		locale: "en_US",
		type: "website",
	},
	twitter: {
		card: "summary_large_image",
		title: SITE.name,
		description: SITE.description,
	},
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
	return (
		<html lang="en" className={cx(spaceGrotesk.variable, jetbrainsMono.variable)}>
			<body className="min-h-screen bg-background font-sans text-foreground antialiased">
				<TopNavbar />
				<div className="pt-12">{children}</div>
				<PageLines />
			</body>
		</html>
	);
}
