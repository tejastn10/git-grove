"use client";

import { useState } from "react";
import { cx } from "@/utils/tailwind";
import { Commit, DIAGRAM, DiagramFrame, Edge, useDiagramMotion } from "./primitives";

/*
 * `git reset --soft|--mixed|--hard <target>` — what actually moves.
 * Interactive: the reader picks a mode (a command button) and the three
 * pointers (HEAD, index, working tree) snap to their resulting positions.
 */

type Mode = "soft" | "mixed" | "hard";

const MODES: Record<
	Mode,
	{ head: string; index: string; work: string; blurb: string; command: string }
> = {
	soft: {
		head: "C1",
		index: "C3",
		work: "C3",
		command: "git reset --soft C1",
		blurb:
			"Only HEAD moves to C1. The index and working tree still hold C3, so everything from C2 and C3 is now staged, ready to re-commit.",
	},
	mixed: {
		head: "C1",
		index: "C1",
		work: "C3",
		command: "git reset --mixed C1   (the default)",
		blurb:
			"HEAD and the index move to C1. The working tree is untouched, so your changes survive — just unstaged.",
	},
	hard: {
		head: "C1",
		index: "C1",
		work: "C1",
		command: "git reset --hard C1",
		blurb:
			"All three move to C1. Uncommitted work in the working tree is discarded. The commits themselves aren't deleted — C2 and C3 stay in the reflog for ~90 days.",
	},
};

const COMMITS = [
	{ id: "C1", x: 70 },
	{ id: "C2", x: 190 },
	{ id: "C3", x: 310 },
];
const xOf = (id: string) => COMMITS.find((c) => c.id === id)?.x ?? 70;

const POINTERS: { key: "head" | "index" | "work"; label: string; y: number }[] = [
	{ key: "head", label: "HEAD", y: 40 },
	{ key: "index", label: "index", y: 66 },
	{ key: "work", label: "working tree", y: 92 },
];

export const ResetModesDiagram = () => {
	const reduced = useDiagramMotion();
	const [mode, setMode] = useState<Mode | null>(null);
	const state = mode ? MODES[mode] : { head: "C3", index: "C3", work: "C3" };

	return (
		<DiagramFrame
			title="reset: --soft / --mixed / --hard"
			caption="pick a mode"
			footer={
				<div className="flex flex-col gap-3">
					<div className="flex flex-wrap gap-2">
						{(Object.keys(MODES) as Mode[]).map((m) => (
							<button
								key={m}
								type="button"
								onClick={() => setMode(m)}
								className={cx(
									"border px-2.5 py-1 font-mono text-xs uppercase tracking-wide transition-colors",
									mode === m
										? "border-git bg-git text-git-foreground"
										: "border-border text-muted-foreground hover:text-foreground"
								)}
							>
								--{m}
							</button>
						))}
						<button
							type="button"
							onClick={() => setMode(null)}
							disabled={mode === null}
							className="ml-auto font-mono text-[11px] uppercase tracking-wide text-muted-foreground underline decoration-border underline-offset-4 hover:text-foreground disabled:pointer-events-none disabled:opacity-40"
						>
							Reset
						</button>
					</div>
					<p className="font-mono text-xs text-foreground">
						<span className="text-muted-foreground">$ </span>
						{mode ? MODES[mode].command : "git reset --<mode> C1"}
					</p>
					<p className="font-mono text-xs leading-relaxed text-muted-foreground">
						{mode
							? MODES[mode].blurb
							: "HEAD, the index and the working tree all currently sit at C3."}
					</p>
				</div>
			}
		>
			<svg
				viewBox="0 0 380 170"
				className="h-auto w-full min-w-[360px]"
				role="img"
				aria-label="git reset modes"
			>
				<Edge
					x1={COMMITS[0].x + DIAGRAM.commitR}
					y1={138}
					x2={COMMITS[1].x - DIAGRAM.commitR}
					y2={138}
				/>
				<Edge
					x1={COMMITS[1].x + DIAGRAM.commitR}
					y1={138}
					x2={COMMITS[2].x - DIAGRAM.commitR}
					y2={138}
				/>
				{COMMITS.map((c) => (
					<Commit key={c.id} cx={c.x} cy={138} label={c.id} reduced={reduced} />
				))}

				{POINTERS.map((p) => {
					const target = xOf(state[p.key]);
					return (
						<g key={p.key}>
							<text x={12} y={p.y + 4} fontSize={10} fill={DIAGRAM.muted}>
								{p.label}
							</text>
							<g
								transform={`translate(${target} 0)`}
								style={{
									transition: reduced ? undefined : "transform 0.45s cubic-bezier(0.4,0,0.2,1)",
								}}
							>
								<circle cx={0} cy={p.y} r={4} fill={DIAGRAM.accent} />
								<line
									x1={0}
									y1={p.y + 4}
									x2={0}
									y2={128}
									stroke={DIAGRAM.accent}
									strokeWidth={1.25}
									strokeDasharray="3 3"
								/>
							</g>
						</g>
					);
				})}
			</svg>
		</DiagramFrame>
	);
};
