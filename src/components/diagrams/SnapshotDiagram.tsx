"use client";

import { motion } from "motion/react";
import {
	Commit,
	DIAGRAM,
	DiagramFrame,
	Edge,
	StepControls,
	useDiagramMotion,
	useSteps,
} from "./primitives";

/*
 * Each commit records a *complete snapshot* of every file — not a diff. Files
 * that didn't change just point at the blob the previous snapshot already used,
 * so a snapshot is cheap.
 */

// file -> blob id per commit. Same blob id across commits = unchanged = reused.
const SNAPSHOTS = [
	{ commit: "C1", files: { "a.txt": "b0", "b.txt": "b1", "c.txt": "b2" } },
	{ commit: "C2", files: { "a.txt": "b0", "b.txt": "b3", "c.txt": "b2" } },
	{ commit: "C3", files: { "a.txt": "b4", "b.txt": "b3", "c.txt": "b2" } },
];

const LABELS = [
	"C1 snapshots three files, storing a blob for each.",
	"C2 changed only b.txt. a.txt and c.txt point at the exact same blobs as C1 — no copy, no diff.",
	"C3 changed a.txt. Across all three commits Git stored 5 blobs, not 9. Branching just adds one more 20-byte commit that reuses this whole tree.",
];

const COL_X = [70, 190, 310];

export const SnapshotDiagram = () => {
	const reduced = useDiagramMotion();
	const { step, next, prev, reset } = useSteps(3);
	const shown = step + 1;

	return (
		<DiagramFrame
			title="Snapshots, not diffs"
			caption="unchanged files reuse blobs"
			footer={
				<StepControls
					step={step}
					total={3}
					onPrev={prev}
					onNext={next}
					onReset={reset}
					command={`git cat-file -p ${SNAPSHOTS[step].commit}^{tree}`}
					labels={LABELS}
				/>
			}
		>
			<svg
				viewBox="0 0 400 210"
				className="h-auto w-full min-w-[380px]"
				role="img"
				aria-label={LABELS[step]}
			>
				{SNAPSHOTS.slice(0, shown).map((snap, i) => (
					<g key={snap.commit}>
						{i > 0 ? (
							<Edge
								x1={COL_X[i - 1] + DIAGRAM.commitR}
								y1={40}
								x2={COL_X[i] - DIAGRAM.commitR}
								y2={40}
							/>
						) : null}
						<Commit
							cx={COL_X[i]}
							cy={40}
							label={snap.commit}
							head={i === shown - 1}
							reduced={reduced}
						/>
						{Object.entries(snap.files).map(([name, blob], fi) => {
							// reused if the previous shown snapshot has the same blob for this file
							const prev = i > 0 ? SNAPSHOTS[i - 1].files[name as keyof typeof snap.files] : null;
							const reused = prev === blob;
							return (
								<motion.g
									key={name}
									initial={reduced ? false : { opacity: 0, y: 6 }}
									animate={{ opacity: 1, y: 0 }}
									transition={{ delay: reduced ? 0 : fi * 0.06 }}
								>
									<rect
										x={COL_X[i] - 40}
										y={74 + fi * 40}
										width={80}
										height={30}
										fill={DIAGRAM.card}
										stroke={reused ? DIAGRAM.border : DIAGRAM.accent}
										strokeWidth={reused ? 1 : 1.75}
										strokeDasharray={reused ? "3 3" : undefined}
									/>
									<text x={COL_X[i]} y={74 + fi * 40 + 13} fontSize={8.5} textAnchor="middle">
										{name}
									</text>
									<text
										x={COL_X[i]}
										y={74 + fi * 40 + 24}
										fontSize={8}
										textAnchor="middle"
										fill={reused ? DIAGRAM.muted : DIAGRAM.accent}
									>
										{reused ? `↩ ${blob}` : blob}
									</text>
								</motion.g>
							);
						})}
					</g>
				))}
			</svg>
		</DiagramFrame>
	);
};
