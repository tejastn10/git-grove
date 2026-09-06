"use client";

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
 * fetch vs. pull. `git fetch` only advances the remote-tracking branch
 * (`origin/main`); `git pull` does that *and* merges it into your local branch.
 */

const COMMITS = [
	{ id: "C1", x: 60 },
	{ id: "C2", x: 150 },
	{ id: "C3", x: 240 },
	{ id: "C4", x: 330 },
];
const xOf = (id: string) => COMMITS.find((c) => c.id === id)?.x ?? 60;

const STEPS = [
	{
		command: "git log origin/main..main",
		label:
			"The remote `origin` has a new commit C4. Locally, both `main` and the remote-tracking ref `origin/main` still point at C3 — Git hasn't talked to the server yet.",
		remote: "C4",
		originMain: "C3",
		main: "C3",
	},
	{
		command: "git fetch origin",
		label:
			"`git fetch` downloads C4 and moves `origin/main` to it. Your `main` and working tree are untouched — nothing is merged.",
		remote: "C4",
		originMain: "C4",
		main: "C3",
	},
	{
		command: "git merge origin/main   ← the second half of git pull",
		label:
			"Merging `origin/main` fast-forwards `main` to C4. `git pull` is exactly this: fetch, then merge (or rebase with --rebase).",
		remote: "C4",
		originMain: "C4",
		main: "C4",
	},
];

export const FetchVsPullDiagram = () => {
	const reduced = useDiagramMotion();
	const { step, next, prev, reset } = useSteps(STEPS.length);
	const s = STEPS[step];
	const visible = COMMITS.filter((c) => xOf(s.remote) >= c.x);

	const Pointer = ({
		y,
		at,
		label,
		accent,
	}: {
		y: number;
		at: string;
		label: string;
		accent?: boolean;
	}) => (
		<g className="glide" style={{ transform: `translate(${xOf(at)}px, 0px)` }}>
			<line
				x1={0}
				y1={y}
				x2={0}
				y2={176 + DIAGRAM.commitR}
				stroke={accent ? DIAGRAM.accent : DIAGRAM.muted}
				strokeWidth={1.25}
			/>
			<RefTag x={-(label.length * 7 + 12) / 2} y={y} label={label} accent={accent} />
		</g>
	);

	return (
		<DiagramFrame
			title="fetch vs. pull"
			caption="step through the sync"
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
				viewBox="0 0 400 250"
				className="h-auto w-full min-w-[380px]"
				role="img"
				aria-label={s.label}
			>
				<text x={16} y={20} fontSize={10} fill={DIAGRAM.muted} style={{ letterSpacing: "0.08em" }}>
					REMOTE — origin
				</text>
				<line x1={16} y1={30} x2={384} y2={30} stroke={DIAGRAM.border} strokeDasharray="4 4" />
				{visible.map((c, i) => (
					<g key={`r-${c.id}`}>
						{i > 0 ? <Edge x1={visible[i - 1].x} y1={64} x2={c.x} y2={64} /> : null}
						<Commit cx={c.x} cy={64} label={c.id} head={c.id === s.remote} reduced={reduced} />
					</g>
				))}

				<text x={16} y={132} fontSize={10} fill={DIAGRAM.muted} style={{ letterSpacing: "0.08em" }}>
					LOCAL clone
				</text>
				<line x1={16} y1={142} x2={384} y2={142} stroke={DIAGRAM.border} strokeDasharray="4 4" />
				{COMMITS.filter((c) => xOf(s.main) >= c.x || xOf(s.originMain) >= c.x).map((c, i, arr) => (
					<g key={`l-${c.id}`}>
						{i > 0 ? <Edge x1={arr[i - 1].x} y1={176} x2={c.x} y2={176} /> : null}
						<Commit cx={c.x} cy={176} label={c.id} reduced={reduced} />
					</g>
				))}
				<Pointer y={196} at={s.main} label="main" accent />
				<Pointer y={222} at={s.originMain} label="origin/main" />
			</svg>
		</DiagramFrame>
	);
};
