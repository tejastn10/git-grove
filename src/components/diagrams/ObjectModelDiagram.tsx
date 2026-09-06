"use client";

import { motion } from "motion/react";
import { DIAGRAM, DiagramFrame, StepControls, useDiagramMotion, useSteps } from "./primitives";

/*
 * A commit is a pointer to a tree; a tree is a list of pointers to blobs and
 * other trees; every object is named by the hash of its own content.
 */

const box = (
	x: number,
	y: number,
	w: number,
	h: number,
	kind: string,
	hash: string,
	extra?: string
) => ({
	x,
	y,
	w,
	h,
	kind,
	hash,
	extra,
});

const OBJECTS = [
	box(20, 70, 128, 58, "commit", "a1b2c3d", "tree 9f8e7d6\nparent …\nauthor …"),
	box(196, 24, 128, 58, "tree", "9f8e7d6", "README.md → 4d5e…\nsrc/ → 7a8b…"),
	box(196, 128, 128, 44, "tree  src/", "7a8b9c0", "index.ts → 1122…"),
	box(372, 12, 120, 34, "blob", "4d5e6f7", "# GitGrove"),
	box(372, 74, 120, 34, "blob", "1122334", "export const …"),
];

const EDGES = [
	[0, 1],
	[0, 2],
	[1, 3],
	[2, 4],
];

const STEP_VISIBLE = [1, 3, 5];
const STEP_LABEL = [
	"The commit object stores metadata (author, message, parent) and one pointer: the root tree for this snapshot.",
	"The tree object is a directory listing — names paired with the hash of a blob (file) or another tree (subdirectory).",
	"Blobs hold raw file content. Two identical files anywhere in history share one blob, because the name *is* the SHA-1 (SHA-256 in newer repos) of the content.",
];

export const ObjectModelDiagram = () => {
	const reduced = useDiagramMotion();
	const { step, next, prev, reset } = useSteps(3);
	const shown = STEP_VISIBLE[step];

	return (
		<DiagramFrame
			title="Git's object model"
			caption="commit → tree → blob"
			footer={
				<StepControls
					step={step}
					total={3}
					onPrev={prev}
					onNext={next}
					onReset={reset}
					command={
						["git cat-file -p HEAD", "git cat-file -p HEAD^{tree}", "git cat-file -p 4d5e6f7"][step]
					}
					labels={STEP_LABEL}
				/>
			}
		>
			<svg
				viewBox="0 0 512 190"
				className="h-auto w-full min-w-[480px]"
				role="img"
				aria-label={STEP_LABEL[step]}
			>
				{EDGES.map(([a, b]) =>
					b < shown ? (
						<line
							key={`${a}-${b}`}
							x1={OBJECTS[a].x + OBJECTS[a].w}
							y1={OBJECTS[a].y + OBJECTS[a].h / 2}
							x2={OBJECTS[b].x}
							y2={OBJECTS[b].y + OBJECTS[b].h / 2}
							stroke={DIAGRAM.muted}
							strokeWidth={1.25}
						/>
					) : null
				)}
				{OBJECTS.slice(0, shown).map((o, i) => (
					<motion.g
						key={o.hash}
						initial={reduced ? false : { opacity: 0, x: -8 }}
						animate={{ opacity: 1, x: 0 }}
						transition={{ delay: reduced ? 0 : i * 0.05 }}
					>
						<rect
							x={o.x}
							y={o.y}
							width={o.w}
							height={o.h}
							fill={DIAGRAM.card}
							stroke={o.kind.startsWith("commit") ? DIAGRAM.accent : DIAGRAM.stroke}
							strokeWidth={o.kind.startsWith("commit") ? 2 : 1.25}
						/>
						<text
							x={o.x + 8}
							y={o.y + 15}
							fontSize={9}
							fill={DIAGRAM.muted}
							style={{ letterSpacing: "0.06em" }}
						>
							{o.kind.toUpperCase()} · {o.hash}
						</text>
						{o.extra?.split("\n").map((line, li) => (
							<text key={line} x={o.x + 8} y={o.y + 29 + li * 11} fontSize={8.5}>
								{line}
							</text>
						))}
					</motion.g>
				))}
			</svg>
		</DiagramFrame>
	);
};
