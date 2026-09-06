"use client";

import { useEffect, useMemo, useReducer, useRef } from "react";
import { Icons } from "@/components/icons/Icons";
import { cx } from "@/utils/tailwind";

/*
 * A single in-memory Git repository you drive by clicking commands. Every button
 * dispatches into one reducer, and the whole view — the three areas, the commit
 * graph, the transcript — re-derives from that one state. This is the "all the
 * commands, together" view: they compose exactly the way the real ones do.
 */

// ── Model ───────────────────────────────────────────────────────

type Commit = { id: string; parents: string[]; lane: number; label: string };
type Branch = { name: string; tip: string; lane: number };

type State = {
	commits: Commit[];
	branches: Branch[];
	head: string; // branch name — the sandbox always keeps you on a branch
	working: number; // uncommitted edits in the working tree
	staged: number; // edits copied into the index
	nextCommit: number;
	nextLane: number;
	log: LogLine[];
	hint: string;
};

type LogLine = { cmd: string; note?: string; kind: "cmd" | "info" | "warn" };

const BRANCH_POOL = ["feature", "hotfix", "release", "experiment", "docs", "wip"];

const ROOT: Commit = { id: "c1", parents: [], lane: 0, label: "init" };

const initialState = (): State => ({
	commits: [ROOT],
	branches: [{ name: "main", tip: "c1", lane: 0 }],
	head: "main",
	working: 0,
	staged: 0,
	nextCommit: 2,
	nextLane: 1,
	log: [{ cmd: "git init", note: "initialized empty repository + first commit", kind: "info" }],
	hint: "You're on main. Edit a file to get started.",
});

type Action =
	| { type: "edit" }
	| { type: "add" }
	| { type: "commit" }
	| { type: "branch" }
	| { type: "switch"; name: string }
	| { type: "merge"; name: string }
	| { type: "reset" }
	| { type: "restart" };

const tipOf = (s: State, name: string) => s.branches.find((b) => b.name === name)?.tip;
const commitById = (s: State, id: string) => s.commits.find((c) => c.id === id);

/** every ancestor id of `id`, inclusive */
const ancestors = (s: State, id: string): Set<string> => {
	const seen = new Set<string>();
	const stack = [id];
	while (stack.length) {
		const cur = stack.pop();
		if (!cur || seen.has(cur)) continue;
		seen.add(cur);
		const c = commitById(s, cur);
		if (c) stack.push(...c.parents);
	}
	return seen;
};

const reducer = (s: State, a: Action): State => {
	switch (a.type) {
		case "restart":
			return initialState();

		case "edit":
			return {
				...s,
				working: s.working + 1,
				log: [...s.log, { cmd: "# edit a file", kind: "cmd" }],
				hint: "Changes in the working tree. `git add` to stage them.",
			};

		case "add": {
			if (s.working === 0)
				return {
					...s,
					log: [...s.log, { cmd: "git add .", note: "nothing to stage", kind: "warn" }],
				};
			return {
				...s,
				staged: s.staged + s.working,
				working: 0,
				log: [...s.log, { cmd: "git add .", note: `staged ${s.working} change(s)`, kind: "cmd" }],
				hint: "Staged. `git commit` to record a snapshot.",
			};
		}

		case "commit": {
			if (s.staged === 0)
				return {
					...s,
					log: [...s.log, { cmd: "git commit", note: "nothing staged to commit", kind: "warn" }],
				};
			const branch = s.branches.find((b) => b.name === s.head);
			if (!branch) return s;
			const id = `c${s.nextCommit}`;
			const newCommit: Commit = { id, parents: [branch.tip], lane: branch.lane, label: id };
			return {
				...s,
				commits: [...s.commits, newCommit],
				branches: s.branches.map((b) => (b.name === s.head ? { ...b, tip: id } : b)),
				staged: 0,
				nextCommit: s.nextCommit + 1,
				log: [...s.log, { cmd: `git commit -m "${id}"`, note: `[${s.head} ${id}]`, kind: "cmd" }],
				hint: `Committed ${id} on ${s.head}.`,
			};
		}

		case "branch": {
			const name = BRANCH_POOL.find((n) => !s.branches.some((b) => b.name === n));
			if (!name)
				return {
					...s,
					log: [...s.log, { cmd: "git branch", note: "out of demo names", kind: "warn" }],
				};
			const here = tipOf(s, s.head);
			if (!here) return s;
			return {
				...s,
				branches: [...s.branches, { name, tip: here, lane: s.nextLane }],
				nextLane: s.nextLane + 1,
				log: [
					...s.log,
					{ cmd: `git switch -c ${name}`, note: `new branch at ${here}`, kind: "cmd" },
				],
				head: name,
				hint: `Created ${name} (a pointer at ${here}) and switched to it.`,
			};
		}

		case "switch": {
			if (a.name === s.head) return s;
			return {
				...s,
				head: a.name,
				log: [...s.log, { cmd: `git switch ${a.name}`, kind: "cmd" }],
				hint: `On ${a.name}. Working-tree changes (${s.working}) come with you.`,
			};
		}

		case "merge": {
			if (a.name === s.head) return s;
			const headTip = tipOf(s, s.head);
			const otherTip = tipOf(s, a.name);
			const branch = s.branches.find((b) => b.name === s.head);
			if (!headTip || !otherTip || !branch) return s;

			if (headTip === otherTip)
				return {
					...s,
					log: [...s.log, { cmd: `git merge ${a.name}`, note: "already up to date", kind: "warn" }],
				};

			// fast-forward: head's tip is an ancestor of the other tip
			if (ancestors(s, otherTip).has(headTip)) {
				return {
					...s,
					branches: s.branches.map((b) => (b.name === s.head ? { ...b, tip: otherTip } : b)),
					log: [
						...s.log,
						{ cmd: `git merge ${a.name}`, note: `fast-forward → ${otherTip}`, kind: "cmd" },
					],
					hint: `${s.head} fast-forwarded to ${otherTip}. No merge commit.`,
				};
			}

			// three-way merge commit
			const id = `c${s.nextCommit}`;
			const mergeCommit: Commit = {
				id,
				parents: [headTip, otherTip],
				lane: branch.lane,
				label: id,
			};
			return {
				...s,
				commits: [...s.commits, mergeCommit],
				branches: s.branches.map((b) => (b.name === s.head ? { ...b, tip: id } : b)),
				nextCommit: s.nextCommit + 1,
				log: [
					...s.log,
					{
						cmd: `git merge ${a.name}`,
						note: `merge commit ${id} (2 parents)`,
						kind: "cmd",
					},
				],
				hint: `Created merge commit ${id} with parents ${headTip} and ${otherTip}.`,
			};
		}

		case "reset": {
			const here = tipOf(s, s.head);
			const c = here ? commitById(s, here) : undefined;
			if (!c || c.parents.length === 0)
				return {
					...s,
					log: [
						...s.log,
						{ cmd: "git reset --hard HEAD~1", note: "already at the root", kind: "warn" },
					],
				};
			return {
				...s,
				branches: s.branches.map((b) => (b.name === s.head ? { ...b, tip: c.parents[0] } : b)),
				working: 0,
				staged: 0,
				log: [
					...s.log,
					{ cmd: "git reset --hard HEAD~1", note: `${s.head} → ${c.parents[0]}`, kind: "cmd" },
				],
				hint: `${s.head} moved back to ${c.parents[0]}. ${c.id} is unreachable (but in the reflog).`,
			};
		}

		default:
			return s;
	}
};

// ── Graph layout ────────────────────────────────────────────────

const COL_W = 66;
const ROW_H = 62;
const PAD_X = 34;
const PAD_Y = 30;
const R = 14;

const useLayout = (s: State) => {
	return useMemo(() => {
		const col = new Map<string, number>();
		for (const c of s.commits) {
			const parentCols = c.parents.map((p) => col.get(p) ?? 0);
			col.set(c.id, c.parents.length ? Math.max(...parentCols) + 1 : 0);
		}
		const pos = new Map<string, { x: number; y: number }>();
		let maxCol = 0;
		let maxLane = 0;
		for (const c of s.commits) {
			const cc = col.get(c.id) ?? 0;
			maxCol = Math.max(maxCol, cc);
			maxLane = Math.max(maxLane, c.lane);
			pos.set(c.id, { x: PAD_X + cc * COL_W, y: PAD_Y + c.lane * ROW_H });
		}
		return {
			pos,
			width: PAD_X * 2 + maxCol * COL_W + 90,
			height: PAD_Y * 2 + maxLane * ROW_H,
		};
	}, [s.commits]);
};

// ── UI ──────────────────────────────────────────────────────────

const CmdButton = ({
	onClick,
	disabled,
	children,
	primary,
}: {
	onClick: () => void;
	disabled?: boolean;
	children: React.ReactNode;
	primary?: boolean;
}) => (
	<button
		type="button"
		onClick={onClick}
		disabled={disabled}
		className={cx(
			"rounded-md border px-2.5 py-1.5 text-left font-mono text-xs transition-colors disabled:pointer-events-none disabled:opacity-35",
			primary
				? "border-git bg-git text-git-foreground hover:opacity-90"
				: "border-border text-foreground hover:bg-muted"
		)}
	>
		{children}
	</button>
);

export const GitPlayground = () => {
	const [s, dispatch] = useReducer(reducer, undefined, initialState);
	const { pos, width, height } = useLayout(s);
	const logRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		logRef.current?.scrollTo({ top: logRef.current.scrollHeight });
	}, [s.log.length]);

	const otherBranches = s.branches.filter((b) => b.name !== s.head);
	const headTip = tipOf(s, s.head);
	const graphH = Math.max(height + PAD_Y, 110);
	const reduced =
		typeof window !== "undefined" &&
		window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

	return (
		<div className="grid gap-6 lg:grid-cols-[15rem_1fr]">
			{/* ── Command palette ─────────────────────────────── */}
			<div className="flex flex-col gap-4">
				<Panel label="Working tree">
					<CmdButton onClick={() => dispatch({ type: "edit" })}>
						edit a file <span className="text-muted-foreground">— touch the working tree</span>
					</CmdButton>
					<CmdButton onClick={() => dispatch({ type: "add" })} disabled={s.working === 0}>
						git add .
					</CmdButton>
					<CmdButton onClick={() => dispatch({ type: "commit" })} disabled={s.staged === 0} primary>
						git commit
					</CmdButton>
				</Panel>

				<Panel label="Branches">
					<CmdButton
						onClick={() => dispatch({ type: "branch" })}
						disabled={s.branches.length >= BRANCH_POOL.length + 1}
					>
						git switch -c &lt;new&gt;
					</CmdButton>
					{otherBranches.length > 0 && (
						<div className="flex flex-col gap-1.5">
							<p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
								switch to
							</p>
							<div className="flex flex-wrap gap-1.5">
								{otherBranches.map((b) => (
									<button
										key={b.name}
										type="button"
										onClick={() => dispatch({ type: "switch", name: b.name })}
										className="rounded-md border border-border px-2 py-1 font-mono text-[11px] hover:bg-muted"
									>
										{b.name}
									</button>
								))}
							</div>
							<p className="mt-1 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
								merge into {s.head}
							</p>
							<div className="flex flex-wrap gap-1.5">
								{otherBranches.map((b) => (
									<button
										key={b.name}
										type="button"
										onClick={() => dispatch({ type: "merge", name: b.name })}
										className="rounded-md border border-border px-2 py-1 font-mono text-[11px] hover:bg-muted"
									>
										{b.name}
									</button>
								))}
							</div>
						</div>
					)}
				</Panel>

				<Panel label="Undo">
					<CmdButton onClick={() => dispatch({ type: "reset" })}>git reset --hard HEAD~1</CmdButton>
					<CmdButton onClick={() => dispatch({ type: "restart" })}>start over</CmdButton>
				</Panel>
			</div>

			{/* ── Visualization ───────────────────────────────── */}
			<div className="flex min-w-0 flex-col gap-4">
				{/* three areas strip */}
				<div className="grid grid-cols-3 gap-3 font-mono text-xs">
					<Stat label="working tree" value={s.working} unit="edit" accent={s.working > 0} />
					<Stat label="staging area" value={s.staged} unit="staged" accent={s.staged > 0} />
					<Stat label="HEAD" value={0} display={`${s.head} → ${headTip ?? "?"}`} accent />
				</div>

				{/* commit graph */}
				<div className="overflow-x-auto rounded-lg border border-border bg-card p-3">
					<svg
						width={width}
						height={graphH}
						viewBox={`0 0 ${width} ${graphH}`}
						className="block h-auto"
						role="img"
						aria-label="Commit graph"
					>
						<title>Commit graph</title>
						{/* edges */}
						{s.commits.map((c) =>
							c.parents.map((p) => {
								const a = pos.get(p);
								const b = pos.get(c.id);
								if (!a || !b) return null;
								const mid = (a.x + b.x) / 2;
								return (
									<path
										key={`${p}-${c.id}`}
										d={`M ${a.x} ${a.y} C ${mid} ${a.y}, ${mid} ${b.y}, ${b.x} ${b.y}`}
										fill="none"
										stroke="hsl(var(--muted-foreground))"
										strokeWidth={1.5}
										opacity={0.75}
									/>
								);
							})
						)}
						{/* commits */}
						{s.commits.map((c) => {
							const p = pos.get(c.id);
							if (!p) return null;
							const isHeadTip = c.id === headTip;
							return (
								<g
									key={c.id}
									style={{
										transition: reduced ? undefined : "transform .3s ease-out",
									}}
								>
									<circle
										cx={p.x}
										cy={p.y}
										r={R}
										fill="hsl(var(--card))"
										stroke={isHeadTip ? "hsl(var(--git))" : "hsl(var(--foreground))"}
										strokeWidth={isHeadTip ? 2.5 : 1.5}
									/>
									<text
										x={p.x}
										y={p.y + 3}
										fontSize={9}
										textAnchor="middle"
										fill="hsl(var(--foreground))"
									>
										{c.label}
									</text>
								</g>
							);
						})}
						{/* branch tags */}
						{s.branches.map((b, i) => {
							const p = pos.get(b.tip);
							if (!p) return null;
							const isHead = b.name === s.head;
							const w = b.name.length * 6.5 + (isHead ? 52 : 14);
							return (
								<g
									key={b.name}
									transform={`translate(${p.x + R + 8} ${p.y - 10 + (i % 2 ? 22 : 0)})`}
								>
									<rect
										width={w}
										height={20}
										rx={4}
										fill={isHead ? "hsl(var(--git))" : "transparent"}
										stroke={isHead ? "hsl(var(--git))" : "hsl(var(--border))"}
									/>
									<text
										x={7}
										y={14}
										fontSize={10}
										fill={isHead ? "hsl(var(--git-foreground))" : "hsl(var(--foreground))"}
									>
										{isHead ? `HEAD → ${b.name}` : b.name}
									</text>
								</g>
							);
						})}
					</svg>
				</div>

				{/* hint */}
				<p className="flex items-start gap-2 font-mono text-xs text-muted-foreground">
					<Icons.sparkles className="mt-0.5 size-3.5 shrink-0 text-git" />
					{s.hint}
				</p>

				{/* transcript */}
				<div
					ref={logRef}
					className="max-h-52 overflow-y-auto rounded-lg border border-border bg-muted p-3 font-mono text-xs leading-relaxed"
				>
					{s.log.map((l, i) => (
						<div key={i} className="flex flex-wrap gap-x-2">
							<span
								className={cx(
									l.kind === "warn"
										? "text-git"
										: l.kind === "info"
											? "text-muted-foreground"
											: "text-foreground"
								)}
							>
								{l.kind === "cmd" ? "$ " : "  "}
								{l.cmd}
							</span>
							{l.note ? <span className="text-muted-foreground">— {l.note}</span> : null}
						</div>
					))}
				</div>
			</div>
		</div>
	);
};

const Panel = ({ label, children }: { label: string; children: React.ReactNode }) => (
	<div className="rounded-lg border border-border p-3">
		<p className="mb-2 font-mono text-[10px] uppercase tracking-[0.1em] text-muted-foreground">
			{label}
		</p>
		<div className="flex flex-col gap-2">{children}</div>
	</div>
);

const Stat = ({
	label,
	value,
	unit,
	display,
	accent,
}: {
	label: string;
	value: number;
	unit?: string;
	display?: string;
	accent?: boolean;
}) => (
	<div
		className={cx(
			"rounded-lg border px-3 py-2",
			accent ? "border-git/50 bg-git/5" : "border-border"
		)}
	>
		<p className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</p>
		<p className="mt-0.5 truncate text-foreground">
			{display ?? (value > 0 ? `${value} ${unit}${value > 1 ? "s" : ""}` : "clean")}
		</p>
	</div>
);
