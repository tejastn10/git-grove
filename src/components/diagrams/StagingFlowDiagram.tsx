"use client";

import {
	DIAGRAM,
	DiagramFrame,
	StepControls,
	useDiagramMotion,
	useSteps,
	Zone,
} from "./primitives";

/*
 * The three areas, and how `git add` / `git commit` move a file between them.
 * Interactive: the reader steps through the lifecycle of a single file.
 */

const STEPS = [
	{
		label:
			"You edit file.txt. Git sees it as modified in the working tree — nothing is staged yet.",
		command: "vim file.txt",
		zone: 0,
		commits: 2,
		staged: false,
	},
	{
		label:
			"git add copies the current contents of file.txt into the staging area (the index) — a proposed next snapshot.",
		command: "git add file.txt",
		zone: 1,
		commits: 2,
		staged: true,
	},
	{
		label:
			"git commit writes whatever is staged as a new commit in the repository. The staging area now matches HEAD again.",
		command: 'git commit -m "Update file.txt"',
		zone: 2,
		commits: 3,
		staged: false,
	},
	{
		label: "Edit file.txt again and the cycle repeats. Only the working tree has changed.",
		command: "vim file.txt",
		zone: 0,
		commits: 3,
		staged: false,
	},
];

const ZONE_X = [16, 232, 448];
const ZONE_W = 176;
const FILE_X = [104, 320, 536];
const FILE_Y = 96;

export const StagingFlowDiagram = () => {
	const reduced = useDiagramMotion();
	const { step, next, prev, reset } = useSteps(STEPS.length);
	const s = STEPS[step];

	return (
		<DiagramFrame
			title="Working tree → staging area → repository"
			caption="click through the lifecycle"
			footer={
				<StepControls
					step={step}
					total={STEPS.length}
					onPrev={prev}
					onNext={next}
					onReset={reset}
					command={s.command}
					labels={STEPS.map((x) => x.label)}
				/>
			}
		>
			<svg
				viewBox="0 0 640 190"
				className="h-auto w-full min-w-[560px]"
				role="img"
				aria-label={s.label}
			>
				<Zone x={ZONE_X[0]} y={24} w={ZONE_W} h={140} label="Working tree" active={s.zone === 0} />
				<Zone x={ZONE_X[1]} y={24} w={ZONE_W} h={140} label="Staging area" active={s.zone === 1} />
				<Zone x={ZONE_X[2]} y={24} w={ZONE_W} h={140} label="Repository" active={s.zone === 2} />

				{/* commit dots inside the repository zone */}
				{Array.from({ length: s.commits }).map((_, i) => (
					<circle
						key={i}
						cx={ZONE_X[2] + 40 + i * 42}
						cy={140}
						r={12}
						fill={DIAGRAM.card}
						stroke={i === s.commits - 1 ? DIAGRAM.accent : DIAGRAM.stroke}
						strokeWidth={i === s.commits - 1 ? 2 : 1.4}
					/>
				))}

				{/* the file token — real transform per step, CSS-eased */}
				<g
					transform={`translate(${FILE_X[s.zone] - FILE_X[0]} 0)`}
					style={{ transition: reduced ? undefined : "transform 0.45s cubic-bezier(0.4,0,0.2,1)" }}
				>
					<rect
						x={FILE_X[0] - 34}
						y={FILE_Y - 16}
						width={68}
						height={32}
						rx={4}
						fill={DIAGRAM.bg}
						stroke={s.staged ? DIAGRAM.accent : DIAGRAM.stroke}
						strokeWidth={1.5}
					/>
					<text x={FILE_X[0]} y={FILE_Y + 4} fontSize={10} textAnchor="middle">
						file.txt
					</text>
				</g>
			</svg>
		</DiagramFrame>
	);
};
