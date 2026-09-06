import type { CSSProperties } from "react";
import type { Era } from "@/content/history";

/**
 * Vertical timeline. Each entry runs the shared `blur-fade` entrance with a
 * staggered delay — pure CSS, so nothing can get stuck hidden.
 */
export const Timeline = ({ entries }: { entries: Era[] }) => (
	<ol className="relative border-l border-border">
		{entries.map((era, i) => (
			<li
				key={era.title}
				className="blur-fade ml-6 pb-12 last:pb-0"
				style={{ "--bf-delay": `${0.04 + i * 0.06}s` } as CSSProperties}
			>
				<span
					className="absolute -left-[6.5px] mt-1.5 size-3 rounded-full border-2 border-git bg-background"
					aria-hidden="true"
				/>
				<p className="font-mono text-[11px] uppercase tracking-[0.1em] text-git">{era.year}</p>
				<h3 className="mt-1 text-lg font-bold tracking-tight">{era.title}</h3>
				<p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">{era.body}</p>
			</li>
		))}
	</ol>
);
