"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { FC } from "react";
import { Icons } from "@/components/icons/Icons";
import { SITE } from "@/data/site";
import { cx } from "@/utils/tailwind";

const TopNavbar: FC = () => {
	const pathname = usePathname();

	return (
		<header className="fixed inset-x-0 top-0 z-40 border-b border-border bg-background/80 backdrop-blur-md">
			<nav
				className="mx-auto flex h-12 max-w-5xl items-center justify-between px-6"
				aria-label="Primary"
			>
				<Link href="/" className="flex items-center gap-2" aria-label={`${SITE.name} home`}>
					<Image
						src="/logo.svg"
						alt=""
						width={18}
						height={18}
						className="size-[18px]"
						priority
						unoptimized
					/>

					<span className="font-mono text-xs tracking-widest text-foreground">{SITE.logoName}</span>
				</Link>

				<div className="flex items-center gap-5">
					{SITE.nav.map((link) => {
						const active = pathname === link.href || pathname.startsWith(`${link.href}/`);
						return (
							<Link
								key={link.href}
								href={link.href}
								className={cx(
									"font-mono text-xs uppercase tracking-wide transition-colors duration-200",
									active ? "text-foreground" : "text-muted-foreground hover:text-foreground"
								)}
							>
								{link.label}
							</Link>
						);
					})}
					<a
						href={SITE.repo}
						target="_blank"
						rel="noopener noreferrer"
						className="text-muted-foreground transition-colors hover:text-foreground"
						aria-label="GitHub repository"
					>
						<Icons.github className="size-4" />
					</a>
				</div>
			</nav>
		</header>
	);
};

export { TopNavbar };
