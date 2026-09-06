"use client";

import { AnimatePresence, motion } from "motion/react";
import {
	Commit,
	DIAGRAM,
	DiagramFrame,
	Edge,
	RefTag,
	StepControls,
	useDiagramMotion,
	useSteps,
} from "./primitives";

/*
 * Merge vs. rebase, side by side, on the same starting history:
 *   C1 ─ C2 ─ C3            (main)
 *          └ F1 ─ F2        (feature)
 * Step 1 applies `git merge` on the left and `git rebase` on the right so the
 * reader can compare the resulting shapes and SHAs directly.
 */

type Node = {
	id: string;
	x: number;
	y: number;
	parent?: string;
	parent2?: string;
	ghost?: boolean;
	head?: boolean;
};

const base: Node[] = [
	{ id: "C1", x: 40, y: 100 },
	{ id: "C2", x: 104, y: 100, parent: "C1" },
	{ id: "C3", x: 168, y: 100, parent: "C2" },
	{ id: "F1", x: 132, y: 152, parent: "C2" },
	{ id: "F2", x: 196, y: 152, parent: "F1" },
];

const MERGE_FRAMES: { nodes: Node[]; refs: { name: string; at: string; accent?: boolean }[] }[] = [
	{
		nodes: base,
		refs: [
			{ name: "main", at: "C3" },
			{ name: "feature", at: "F2", accent: true },
		],
	},
	{
		nodes: [...base, { id: "M", x: 244, y: 100, parent: "C3", parent2: "F2" }],
		refs: [
			{ name: "main", at: "M", accent: true },
			{ name: "feature", at: "F2" },
		],
	},
];

const REBASE_FRAMES: { nodes: Node[]; refs: { name: string; at: string; accent?: boolean }[] }[] = [
	{
		nodes: base,
		refs: [
			{ name: "main", at: "C3" },
			{ name: "feature", at: "F2", accent: true },
		],
	},
	{
		nodes: [
			...base.map((n) => (n.id === "F1" || n.id === "F2" ? { ...n, ghost: true } : n)),
			{ id: "F1'", x: 232, y: 100, parent: "C3" },
			{ id: "F2'", x: 296, y: 100, parent: "F1'" },
		],
		refs: [
			{ name: "main", at: "C3" },
			{ name: "feature", at: "F2'", accent: true },
		],
	},
];

const Panel = ({
	title,
	frame,
	reduced,
}: {
	title: string;
	frame: { nodes: Node[]; refs: { name: string; at: string; accent?: boolean }[] };
	reduced: boolean | null;
}) => {
	const byId = Object.fromEntries(frame.nodes.map((n) => [n.id, n]));
	return (
		<div className="min-w-[300px] flex-1 border border-border">
			<p className="border-b border-border px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.08em] text-muted-foreground">
				{title}
			</p>
			<svg viewBox="0 0 340 190" className="h-auto w-full" role="img" aria-label={title}>
				{frame.nodes.map((n) => {
					const p = n.parent ? byId[n.parent] : undefined;
					const p2 = n.parent2 ? byId[n.parent2] : undefined;
					return (
						<g key={`e-${n.id}`}>
							{p ? <Edge x1={p.x} y1={p.y} x2={n.x} y2={n.y} dim={n.ghost} /> : null}
							{p2 ? <Edge x1={p2.x} y1={p2.y} x2={n.x} y2={n.y} /> : null}
						</g>
					);
				})}
				<AnimatePresence>
					{frame.nodes.map((n) => (
						<motion.g
							key={n.id}
							initial={reduced ? false : { opacity: 0, y: -6 }}
							animate={{ opacity: n.ghost ? 0.25 : 1, y: 0 }}
							exit={{ opacity: 0 }}
							transition={{ duration: 0.3 }}
						>
							<Commit cx={n.x} cy={n.y} label={n.id} dim={n.ghost} reduced={reduced} />
						</motion.g>
					))}
				</AnimatePresence>
				{frame.refs.map((r, i) => {
					const c = byId[r.at];
					if (!c) return null;
					return (
						<RefTag
							key={r.name}
							x={c.x - (r.name.length * 7 + 12) / 2}
							y={c.y - 48 - (i % 2) * 4}
							label={r.name}
							accent={r.accent}
							anchorY={c.y - DIAGRAM.commitR}
						/>
					);
				})}
			</svg>
		</div>
	);
};

const LABELS = [
	"Starting point: `feature` (F1, F2) branched off C2, while `main` moved on to C3.",
	"Merge keeps every original commit and records a new merge commit M with two parents. Rebase replays F1 and F2 on top of C3 as brand-new commits (F1′, F2′ — different SHAs); the originals become unreachable.",
];

export const MergeVsRebaseDiagram = () => {
	const reduced = useDiagramMotion();
	const { step, next, prev, reset } = useSteps(2);

	return (
		<DiagramFrame
			title="Merge vs. rebase"
			caption="same history, two strategies"
			footer={
				<StepControls
					step={step}
					total={2}
					onPrev={prev}
					onNext={next}
					onReset={reset}
					command={step === 0 ? "git switch feature" : "git merge main   ·   git rebase main"}
					labels={LABELS}
				/>
			}
		>
			<div className="flex flex-wrap gap-4">
				<Panel title="git merge feature (on main)" frame={MERGE_FRAMES[step]} reduced={reduced} />
				<Panel title="git rebase main (on feature)" frame={REBASE_FRAMES[step]} reduced={reduced} />
			</div>
		</DiagramFrame>
	);
};
