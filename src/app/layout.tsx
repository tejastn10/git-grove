import "./globals.css";

import { GeistPixelSquare } from "geist/font/pixel";
import type { Metadata } from "next";
import { Geist_Mono } from "next/font/google";
import { ThemeProvider } from "@/components/theme/ThemeProvider";
import { PageLines } from "@/components/ui/PageLines";
import { TopNavbar } from "@/containers/TopNavbar";
import { SITE } from "@/data/site";
import { cx } from "@/utils/tailwind";

const geistMono = Geist_Mono({
	subsets: ["latin"],
	variable: "--font-geist-mono",
	display: "swap",
});

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
		<html
			lang="en"
			suppressHydrationWarning
			className={cx(geistMono.variable, GeistPixelSquare.variable)}
		>
			<body className="min-h-screen bg-background font-mono text-foreground antialiased">
				<ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
					<TopNavbar />
					<div className="pt-12">{children}</div>
					<PageLines />
				</ThemeProvider>
			</body>
		</html>
	);
}
