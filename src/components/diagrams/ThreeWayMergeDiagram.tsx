"use client";

import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { cx } from "@/utils/tailwind";
import { Commit, DIAGRAM, DiagramFrame, Edge, RefTag, useDiagramMotion } from "./primitives";

/*
 * Fast-forward vs. three-way merge. The reader toggles the scenario, then runs
 * `git merge` and watches the difference: a pointer move vs. a new merge commit.
 */

type N = { id: string; x: number; y: number; parent?: string; parent2?: string; isNew?: boolean };

const scenarios = {
	ff: {
		label: "Fast-forward",
		before: [
			{ id: "C1", x: 60, y: 90 },
			{ id: "C2", x: 150, y: 90, parent: "C1" },
			{ id: "C3", x: 240, y: 90, parent: "C2" },
			{ id: "C4", x: 330, y: 90, parent: "C3" },
		] as N[],
		beforeRefs: [
			{ name: "main", at: "C2", accent: true },
			{ name: "feature", at: "C4" },
		],
		after: [
			{ id: "C1", x: 60, y: 90 },
			{ id: "C2", x: 150, y: 90, parent: "C1" },
			{ id: "C3", x: 240, y: 90, parent: "C2" },
			{ id: "C4", x: 330, y: 90, parent: "C3" },
		] as N[],
		afterRefs: [
			{ name: "feature", at: "C4" },
			{ name: "main", at: "C4", accent: true },
		],
		note: "`main` had no commits of its own since C2, so Git just slides the `main` pointer forward to C4. No merge commit — the history stays linear.",
	},
	threeway: {
		label: "Divergent",
		before: [
			{ id: "C1", x: 60, y: 90 },
			{ id: "C2", x: 150, y: 90, parent: "C1" },
			{ id: "C3", x: 250, y: 54, parent: "C2" },
			{ id: "F1", x: 250, y: 126, parent: "C2" },
		] as N[],
		beforeRefs: [
			{ name: "main", at: "C3", accent: true },
			{ name: "feature", at: "F1" },
		],
		after: [
			{ id: "C1", x: 60, y: 90 },
			{ id: "C2", x: 150, y: 90, parent: "C1" },
			{ id: "C3", x: 250, y: 54, parent: "C2" },
			{ id: "F1", x: 250, y: 126, parent: "C2" },
			{ id: "M", x: 350, y: 90, parent: "C3", parent2: "F1", isNew: true },
		] as N[],
		afterRefs: [
			{ name: "feature", at: "F1" },
			{ name: "main", at: "M", accent: true },
		],
		note: "Both branches moved on from C2, so Git finds the common ancestor (C2), builds a new snapshot from all three, and records it as merge commit M — a commit with two parents.",
	},
};

type Key = keyof typeof scenarios;

export const ThreeWayMergeDiagram = () => {
	const reduced = useDiagramMotion();
	const [key, setKey] = useState<Key>("threeway");
	const [merged, setMerged] = useState(false);
	const sc = scenarios[key];
	const nodes = merged ? sc.after : sc.before;
	const refs = merged ? sc.afterRefs : sc.beforeRefs;
	const byId = Object.fromEntries(nodes.map((n) => [n.id, n]));

	return (
		<DiagramFrame
			title="Fast-forward vs. three-way merge"
			caption="pick a scenario, then merge"
			footer={
				<div className="flex flex-col gap-3">
					<div className="flex flex-wrap gap-2">
						{(Object.keys(scenarios) as Key[]).map((k) => (
							<button
								key={k}
								type="button"
								onClick={() => {
									setKey(k);
									setMerged(false);
								}}
								className={cx(
									"border px-2.5 py-1 font-mono text-xs uppercase tracking-wide transition-colors",
									key === k
										? "border-foreground text-foreground"
										: "border-border text-muted-foreground hover:text-foreground"
								)}
							>
								{scenarios[k].label}
							</button>
						))}
						<button
							type="button"
							onClick={() => setMerged((m) => !m)}
							className="ml-auto border border-git bg-git px-2.5 py-1 font-mono text-xs uppercase tracking-wide text-git-foreground"
						>
							{merged ? "Undo merge" : "git merge feature"}
						</button>
					</div>
					<p className="font-mono text-xs leading-relaxed text-muted-foreground">{sc.note}</p>
				</div>
			}
		>
			<svg
				viewBox="0 0 420 170"
				className="h-auto w-full min-w-[400px]"
				role="img"
				aria-label={sc.label}
			>
				{nodes.map((n) => {
					const p = n.parent ? byId[n.parent] : undefined;
					const p2 = n.parent2 ? byId[n.parent2] : undefined;
					return (
						<g key={`e-${n.id}`}>
							{p ? <Edge x1={p.x} y1={p.y} x2={n.x} y2={n.y} /> : null}
							{p2 ? <Edge x1={p2.x} y1={p2.y} x2={n.x} y2={n.y} /> : null}
						</g>
					);
				})}
				<AnimatePresence>
					{nodes.map((n) => (
						<motion.g
							key={`${key}-${n.id}`}
							initial={reduced ? false : { opacity: 0, scale: 0.6 }}
							animate={{ opacity: 1, scale: 1 }}
							exit={{ opacity: 0 }}
						>
							<Commit cx={n.x} cy={n.y} label={n.id} isNew={n.isNew} reduced={reduced} />
						</motion.g>
					))}
				</AnimatePresence>
				{refs.map((r, i) => {
					const c = byId[r.at];
					if (!c) return null;
					return (
						<RefTag
							key={r.name}
							x={c.x - (r.name.length * 7 + 12) / 2}
							y={c.y - 46 - (i % 2) * 6}
							label={r.name}
							accent={"accent" in r ? r.accent : false}
							anchorY={c.y - DIAGRAM.commitR}
						/>
					);
				})}
			</svg>
		</DiagramFrame>
	);
};
