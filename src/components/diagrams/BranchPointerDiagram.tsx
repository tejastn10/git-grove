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
 * "A branch is a 41-byte file containing a commit hash." This walks the reader
 * from one branch, through `git branch` (which creates a pointer, not a copy),
 * to a genuine divergence.
 */

type Ref = { name: string; at: string; head?: boolean };

type Frame = {
	label: string;
	command: string;
	commits: { id: string; x: number; y: number; parent?: string }[];
	refs: Ref[];
};

const ROW = 108;
const C = (id: string, i: number, parent?: string, y = ROW) => ({ id, x: 70 + i * 96, y, parent });

const FRAMES: Frame[] = [
	{
		label: "One branch. `main` is just a pointer to commit C3, and HEAD points to `main`.",
		command: "git log --oneline",
		commits: [C("C1", 0), C("C2", 1, "C1"), C("C3", 2, "C2")],
		refs: [
			{ name: "main", at: "C3" },
			{ name: "HEAD", at: "C3", head: true },
		],
	},
	{
		label:
			"`git branch feature` creates a new pointer at the current commit. No files are copied — it writes 41 bytes.",
		command: "git branch feature",
		commits: [C("C1", 0), C("C2", 1, "C1"), C("C3", 2, "C2")],
		refs: [
			{ name: "main", at: "C3" },
			{ name: "feature", at: "C3" },
			{ name: "HEAD", at: "C3", head: true },
		],
	},
	{
		label:
			"`git switch feature` just moves HEAD. The working tree is identical — both branches point at C3.",
		command: "git switch feature",
		commits: [C("C1", 0), C("C2", 1, "C1"), C("C3", 2, "C2")],
		refs: [
			{ name: "main", at: "C3" },
			{ name: "feature", at: "C3", head: true },
			{ name: "HEAD", at: "C3", head: true },
		],
	},
	{
		label:
			"Commit on `feature`: C4 is created, and only the checked-out branch pointer (`feature`) advances.",
		command: 'git commit -m "Add feature"',
		commits: [C("C1", 0), C("C2", 1, "C1"), C("C3", 2, "C2"), C("C4", 3, "C3")],
		refs: [
			{ name: "main", at: "C3" },
			{ name: "feature", at: "C4", head: true },
		],
	},
	{
		label:
			"Switch back and commit on `main` too: C5 branches off C3. The history is now genuinely divergent.",
		command: "git switch main && git commit",
		commits: [
			C("C1", 0),
			C("C2", 1, "C1"),
			C("C3", 2, "C2"),
			C("C4", 3, "C3", ROW + 44),
			C("C5", 3, "C3", ROW - 44),
		],
		refs: [
			{ name: "main", at: "C5", head: true },
			{ name: "feature", at: "C4" },
		],
	},
];

export const BranchPointerDiagram = () => {
	const reduced = useDiagramMotion();
	const { step, next, prev, reset } = useSteps(FRAMES.length);
	const f = FRAMES[step];
	const byId = Object.fromEntries(f.commits.map((c) => [c.id, c]));

	// Tag lane: refs above the row, HEAD tag sits highest.
	const tagFor = (r: Ref, idx: number) => {
		const c = byId[r.at];
		if (!c) return null;
		const isHead = r.name === "HEAD";
		const y = isHead ? c.y - 74 : c.y - 46 - idx * 2;
		return (
			<RefTag
				key={r.name}
				x={c.x - (r.name.length * 7 + 12) / 2}
				y={y}
				label={r.name}
				accent={r.head}
				anchorY={isHead ? undefined : c.y - DIAGRAM.commitR}
			/>
		);
	};

	return (
		<DiagramFrame
			title="A branch is a pointer"
			caption="step through branch + switch + commit"
			footer={
				<StepControls
					step={step}
					total={FRAMES.length}
					onPrev={prev}
					onNext={next}
					onReset={reset}
					command={f.command}
					labels={FRAMES.map((x) => x.label)}
				/>
			}
		>
			<svg
				viewBox="0 -18 480 236"
				className="h-auto w-full min-w-[440px]"
				role="img"
				aria-label={f.label}
			>
				{/* edges */}
				{f.commits.map((c) =>
					c.parent && byId[c.parent] ? (
						<Edge
							key={`${c.parent}-${c.id}`}
							x1={byId[c.parent].x + DIAGRAM.commitR}
							y1={byId[c.parent].y}
							x2={c.x - DIAGRAM.commitR}
							y2={c.y}
						/>
					) : null
				)}

				<AnimatePresence>
					{f.commits.map((c, i) => (
						<motion.g
							key={c.id}
							initial={reduced ? false : { opacity: 0 }}
							animate={{ opacity: 1 }}
							exit={{ opacity: 0 }}
						>
							<Commit
								cx={c.x}
								cy={c.y}
								label={c.id}
								head={f.refs.some((r) => r.head && r.at === c.id && r.name !== "HEAD")}
								isNew={i === f.commits.length - 1 && step > 0}
								reduced={reduced}
							/>
						</motion.g>
					))}
				</AnimatePresence>

				{f.refs.filter((r) => r.name !== "HEAD").map(tagFor)}
				{f.refs.filter((r) => r.name === "HEAD").map(tagFor)}
			</svg>
		</DiagramFrame>
	);
};
