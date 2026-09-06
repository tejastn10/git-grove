"use client";

import { useEffect, useState } from "react";
import type { GitSection, Tier } from "@/content/git/sections";
import { cx } from "@/utils/tailwind";

type Group = { tier: Tier; label: string; sections: GitSection[] };

/**
 * Sticky sidebar table of contents with scroll-spy. Highlights the section
 * currently nearest the top of the viewport.
 */
export const GuideToc = ({ groups }: { groups: Group[] }) => {
	const [activeId, setActiveId] = useState<string>(groups[0]?.sections[0]?.id ?? "");

	useEffect(() => {
		const ids = groups.flatMap((g) => g.sections.map((s) => s.id));
		const headings = ids
			.map((id) => document.getElementById(id))
			.filter((el): el is HTMLElement => el !== null);

		const observer = new IntersectionObserver(
			(entries) => {
				const visible = entries
					.filter((e) => e.isIntersecting)
					.sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
				if (visible[0]) setActiveId(visible[0].target.id);
			},
			// Trigger when a heading sits in the top third of the viewport.
			{ rootMargin: "-72px 0px -66% 0px", threshold: [0, 1] }
		);

		for (const h of headings) observer.observe(h);
		return () => observer.disconnect();
	}, [groups]);

	return (
		<nav aria-label="On this page" className="text-xs">
			{groups.map((group) => (
				<div key={group.tier} className="mb-5">
					<p className="mb-2 font-mono text-[10px] uppercase tracking-[0.1em] text-muted-foreground/70">
						{group.tier}. {group.label}
					</p>
					<ul className="space-y-1 border-l border-border">
						{group.sections.map((section) => {
							const active = section.id === activeId;
							return (
								<li key={section.id}>
									<a
										href={`#${section.id}`}
										className={cx(
											"-ml-px block border-l py-1 pl-3 leading-snug transition-colors",
											active
												? "border-git text-foreground"
												: "border-transparent text-muted-foreground hover:text-foreground"
										)}
									>
										{section.title}
									</a>
								</li>
							);
						})}
					</ul>
				</div>
			))}
			<a
				href="#cheat-sheet"
				className="mt-2 inline-block font-mono text-[10px] uppercase tracking-[0.1em] text-muted-foreground underline decoration-border underline-offset-4 hover:text-foreground"
			>
				↓ Cheat sheet
			</a>
		</nav>
	);
};
