"use client";

import { useEffect, useMemo, useReducer, useRef } from "react";
import { Icons } from "@/components/icons/Icons";
import { cx } from "@/utils/tailwind";

/*
 * A single in-memory Git repository you drive by clicking commands. Every button
 * dispatches into one reducer, and the whole view — the three areas, the commit
 * graph, the transcript — re-derives from that one state. This is the "all the
 * commands, together" view: add, commit, branch, switch, merge, rebase,
 * cherry-pick, revert, tag, stash and reset compose exactly the way the real
 * ones do.
 */

// ── Model ───────────────────────────────────────────────────────

type Commit = {
	id: string;
	parents: string[];
	lane: number;
	label: string;
	/** rewritten / abandoned — kept on screen dimmed, "still in the reflog" */
	orphan?: boolean;
};
type Branch = { name: string; tip: string; lane: number };
type Tag = { name: string; target: string };
type Stash = { working: number; staged: number };

type LogLine = { cmd: string; note?: string; kind: "cmd" | "info" | "warn" };

type State = {
	commits: Commit[];
	branches: Branch[];
	tags: Tag[];
	stashes: Stash[];
	head: string; // branch name — the sandbox always keeps you on a branch
	working: number; // uncommitted edits in the working tree
	staged: number; // edits copied into the index
	nextCommit: number;
	nextLane: number;
	nextTag: number;
	log: LogLine[];
	hint: string;
};

const BRANCH_POOL = ["feature", "hotfix", "release", "experiment", "docs", "wip"];

const ROOT: Commit = { id: "c1", parents: [], lane: 0, label: "c1" };

const initialState = (): State => ({
	commits: [ROOT],
	branches: [{ name: "main", tip: "c1", lane: 0 }],
	tags: [],
	stashes: [],
	head: "main",
	working: 0,
	staged: 0,
	nextCommit: 2,
	nextLane: 1,
	nextTag: 1,
	log: [{ cmd: "git init", note: "empty repository + first commit c1", kind: "info" }],
	hint: "You're on main. Edit a file, or branch off and explore.",
});

type Action =
	| { type: "edit" }
	| { type: "add" }
	| { type: "commit" }
	| { type: "amend" }
	| { type: "branch" }
	| { type: "switch"; name: string }
	| { type: "merge"; name: string }
	| { type: "rebase"; name: string }
	| { type: "cherry"; id: string }
	| { type: "revert"; id: string }
	| { type: "tag" }
	| { type: "stash" }
	| { type: "stashPop" }
	| { type: "reset" }
	| { type: "restart" };

const tipOf = (s: State, name: string) => s.branches.find((b) => b.name === name)?.tip;
const commitById = (s: State, id: string) => s.commits.find((c) => c.id === id);
const branchOf = (s: State, name: string) => s.branches.find((b) => b.name === name);

/** every ancestor id of `id`, inclusive */
const ancestors = (s: State, id: string): Set<string> => {
	const seen = new Set<string>();
	const stack = [id];
	while (stack.length) {
		const cur = stack.pop();
		if (!cur || seen.has(cur)) continue;
		seen.add(cur);
		const parents = commitById(s, cur)?.parents ?? [];
		for (const p of parents) stack.push(p);
	}
	return seen;
};

const freshId = (s: State, base: string): string => {
	let id = `${base}'`;
	while (s.commits.some((c) => c.id === id)) id += "'";
	return id;
};

const moveTip = (s: State, tip: string): Branch[] =>
	s.branches.map((b) => (b.name === s.head ? { ...b, tip } : b));

const reducer = (s: State, a: Action): State => {
	const warn = (cmd: string, note: string): State => ({
		...s,
		log: [...s.log, { cmd, note, kind: "warn" }],
	});

	switch (a.type) {
		case "restart":
			return initialState();

		case "edit":
			return {
				...s,
				working: s.working + 1,
				log: [...s.log, { cmd: "# edit a file", kind: "cmd" }],
				hint: "Working-tree changes. `git add` to stage them.",
			};

		case "add": {
			if (s.working === 0) return warn("git add .", "nothing to stage");
			return {
				...s,
				staged: s.staged + s.working,
				working: 0,
				log: [...s.log, { cmd: "git add .", note: `staged ${s.working} change(s)`, kind: "cmd" }],
				hint: "Staged. `git commit` records a snapshot.",
			};
		}

		case "commit": {
			if (s.staged === 0) return warn("git commit", "nothing staged to commit");
			const branch = branchOf(s, s.head);
			if (!branch) return s;
			const id = `c${s.nextCommit}`;
			return {
				...s,
				commits: [...s.commits, { id, parents: [branch.tip], lane: branch.lane, label: id }],
				branches: moveTip(s, id),
				staged: 0,
				nextCommit: s.nextCommit + 1,
				log: [...s.log, { cmd: `git commit -m "${id}"`, note: `[${s.head} ${id}]`, kind: "cmd" }],
				hint: `Committed ${id} on ${s.head}.`,
			};
		}

		case "amend": {
			const branch = branchOf(s, s.head);
			const old = branch ? commitById(s, branch.tip) : undefined;
			if (!branch || !old) return s;
			const id = freshId(s, old.label);
			return {
				...s,
				commits: [
					...s.commits.map((c) => (c.id === old.id ? { ...c, orphan: true } : c)),
					{ id, parents: old.parents, lane: branch.lane, label: id },
				],
				branches: moveTip(s, id),
				staged: 0,
				log: [
					...s.log,
					{ cmd: "git commit --amend", note: `${old.id} → ${id} (new hash)`, kind: "cmd" },
				],
				hint: `Amend replaced ${old.id} with a brand-new commit ${id}. The original is unreachable.`,
			};
		}

		case "branch": {
			const name = BRANCH_POOL.find((n) => !s.branches.some((b) => b.name === n));
			if (!name) return warn("git switch -c", "out of demo branch names");
			const here = tipOf(s, s.head);
			if (!here) return s;
			return {
				...s,
				branches: [...s.branches, { name, tip: here, lane: s.nextLane }],
				nextLane: s.nextLane + 1,
				head: name,
				log: [...s.log, { cmd: `git switch -c ${name}`, note: `branch at ${here}`, kind: "cmd" }],
				hint: `Created ${name} (a 41-byte pointer at ${here}) and switched to it.`,
			};
		}

		case "switch":
			if (a.name === s.head) return s;
			return {
				...s,
				head: a.name,
				log: [...s.log, { cmd: `git switch ${a.name}`, kind: "cmd" }],
				hint: `On ${a.name}. Any working-tree changes come with you.`,
			};

		case "merge": {
			if (a.name === s.head) return s;
			const headTip = tipOf(s, s.head);
			const otherTip = tipOf(s, a.name);
			const branch = branchOf(s, s.head);
			if (!headTip || !otherTip || !branch) return s;
			if (headTip === otherTip) return warn(`git merge ${a.name}`, "already up to date");

			if (ancestors(s, otherTip).has(headTip)) {
				return {
					...s,
					branches: moveTip(s, otherTip),
					log: [
						...s.log,
						{ cmd: `git merge ${a.name}`, note: `fast-forward → ${otherTip}`, kind: "cmd" },
					],
					hint: `${s.head} fast-forwarded to ${otherTip}. No merge commit needed.`,
				};
			}

			const id = `c${s.nextCommit}`;
			return {
				...s,
				commits: [...s.commits, { id, parents: [headTip, otherTip], lane: branch.lane, label: id }],
				branches: moveTip(s, id),
				nextCommit: s.nextCommit + 1,
				log: [
					...s.log,
					{ cmd: `git merge ${a.name}`, note: `merge commit ${id} · 2 parents`, kind: "cmd" },
				],
				hint: `Merge commit ${id} joins ${headTip} and ${otherTip} — history keeps both sides.`,
			};
		}

		case "rebase": {
			if (a.name === s.head) return s;
			const headTip = tipOf(s, s.head);
			const targetTip = tipOf(s, a.name);
			const branch = branchOf(s, s.head);
			if (!headTip || !targetTip || !branch) return s;
			if (headTip === targetTip) return warn(`git rebase ${a.name}`, "already up to date");

			const targetAnc = ancestors(s, targetTip);
			if (ancestors(s, headTip).has(targetTip)) {
				return warn(`git rebase ${a.name}`, `nothing to replay — ${s.head} is ahead`);
			}
			if (targetAnc.has(headTip)) {
				return {
					...s,
					branches: moveTip(s, targetTip),
					log: [
						...s.log,
						{ cmd: `git rebase ${a.name}`, note: `fast-forward → ${targetTip}`, kind: "cmd" },
					],
					hint: `${s.head} had no commits of its own — fast-forwarded onto ${a.name}.`,
				};
			}

			const headAnc = ancestors(s, headTip);
			const toReplay = s.commits.filter(
				(c) => !c.orphan && headAnc.has(c.id) && !targetAnc.has(c.id)
			);
			if (toReplay.length === 0) return warn(`git rebase ${a.name}`, "nothing to replay");

			let parent = targetTip;
			const replayed: Commit[] = [];
			let commits = s.commits.slice();
			for (const oc of toReplay) {
				const id = freshId({ ...s, commits: [...commits, ...replayed] }, oc.label);
				replayed.push({ id, parents: [parent], lane: branch.lane, label: id });
				parent = id;
				commits = commits.map((c) => (c.id === oc.id ? { ...c, orphan: true } : c));
			}
			return {
				...s,
				commits: [...commits, ...replayed],
				branches: moveTip(s, parent),
				log: [
					...s.log,
					{
						cmd: `git rebase ${a.name}`,
						note: `replayed ${toReplay.length} commit(s) → ${replayed.map((c) => c.id).join(", ")}`,
						kind: "cmd",
					},
				],
				hint: `${toReplay.map((c) => c.id).join(", ")} were re-created on top of ${a.name} with new hashes. Linear history; originals now unreachable.`,
			};
		}

		case "cherry": {
			const src = commitById(s, a.id);
			const branch = branchOf(s, s.head);
			if (!src || !branch) return s;
			const id = `c${s.nextCommit}`;
			return {
				...s,
				commits: [...s.commits, { id, parents: [branch.tip], lane: branch.lane, label: id }],
				branches: moveTip(s, id),
				nextCommit: s.nextCommit + 1,
				log: [
					...s.log,
					{ cmd: `git cherry-pick ${src.label}`, note: `copied as ${id}`, kind: "cmd" },
				],
				hint: `${src.label}'s change was copied onto ${s.head} as a new commit ${id}.`,
			};
		}

		case "revert": {
			const src = commitById(s, a.id);
			const branch = branchOf(s, s.head);
			if (!src || !branch) return s;
			const id = `c${s.nextCommit}`;
			return {
				...s,
				commits: [...s.commits, { id, parents: [branch.tip], lane: branch.lane, label: id }],
				branches: moveTip(s, id),
				nextCommit: s.nextCommit + 1,
				log: [
					...s.log,
					{
						cmd: `git revert ${src.label}`,
						note: `new commit ${id} undoes ${src.label}`,
						kind: "cmd",
					},
				],
				hint: `${id} applies the inverse of ${src.label}. History only grows — safe on a shared branch.`,
			};
		}

		case "tag": {
			const here = tipOf(s, s.head);
			if (!here) return s;
			const name = `v${s.nextTag}`;
			return {
				...s,
				tags: [...s.tags, { name, target: here }],
				nextTag: s.nextTag + 1,
				log: [...s.log, { cmd: `git tag ${name}`, note: `points at ${here}`, kind: "cmd" }],
				hint: `Tag ${name} is a fixed name for ${here} — it will never move.`,
			};
		}

		case "stash": {
			if (s.working === 0 && s.staged === 0) return warn("git stash", "no local changes to save");
			return {
				...s,
				stashes: [{ working: s.working, staged: s.staged }, ...s.stashes],
				working: 0,
				staged: 0,
				log: [...s.log, { cmd: "git stash", note: "working tree is clean again", kind: "cmd" }],
				hint: "Changes shelved on the stash stack. Switch branches freely, then `git stash pop`.",
			};
		}

		case "stashPop": {
			if (s.stashes.length === 0) return warn("git stash pop", "nothing in the stash");
			const [top, ...rest] = s.stashes;
			return {
				...s,
				stashes: rest,
				working: s.working + top.working + top.staged,
				log: [
					...s.log,
					{ cmd: "git stash pop", note: "re-applied to the working tree", kind: "cmd" },
				],
				hint: "The stashed changes are back in the working tree (unstaged).",
			};
		}

		case "reset": {
			const branch = branchOf(s, s.head);
			const c = branch ? commitById(s, branch.tip) : undefined;
			if (!c || c.parents.length === 0)
				return warn("git reset --hard HEAD~1", "already at the root commit");
			return {
				...s,
				branches: moveTip(s, c.parents[0]),
				working: 0,
				staged: 0,
				log: [
					...s.log,
					{ cmd: "git reset --hard HEAD~1", note: `${s.head} → ${c.parents[0]}`, kind: "cmd" },
				],
				hint: `${s.head} moved back to ${c.parents[0]}. ${c.id} is unreachable now — but the reflog still has it.`,
			};
		}

		default:
			return s;
	}
};

// ── Graph layout ────────────────────────────────────────────────

const COL_W = 78;
const ROW_H = 76;
const PAD_X = 40;
const PAD_Y = 44;
const R = 16;
/** minimum graph canvas height so a small repo still has breathing room */
const MIN_GRAPH_H = 220;

const useLayout = (s: State) =>
	useMemo(() => {
		const col = new Map<string, number>();
		for (const c of s.commits) {
			const pcols = c.parents.map((p) => col.get(p) ?? 0);
			col.set(c.id, c.parents.length ? Math.max(...pcols) + 1 : 0);
		}
		const realLaneMax = Math.max(0, ...s.commits.filter((c) => !c.orphan).map((c) => c.lane));
		const hasOrphan = s.commits.some((c) => c.orphan);
		const ghostRow = realLaneMax + 1.35;

		const pos = new Map<string, { x: number; y: number }>();
		let maxCol = 0;
		for (const c of s.commits) {
			const cc = col.get(c.id) ?? 0;
			maxCol = Math.max(maxCol, cc);
			const row = c.orphan ? ghostRow : c.lane;
			pos.set(c.id, { x: PAD_X + cc * COL_W, y: PAD_Y + row * ROW_H });
		}
		return {
			pos,
			width: PAD_X * 2 + maxCol * COL_W + 120,
			height: PAD_Y * 2 + (hasOrphan ? ghostRow : realLaneMax) * ROW_H,
			hasOrphan,
		};
	}, [s.commits]);

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

const Chip = ({ onClick, children }: { onClick: () => void; children: React.ReactNode }) => (
	<button
		type="button"
		onClick={onClick}
		className="rounded-md border border-border px-2 py-1 font-mono text-[11px] transition-colors hover:bg-muted"
	>
		{children}
	</button>
);

const ChipRow = ({ label, children }: { label: string; children: React.ReactNode }) => (
	<div className="flex flex-col gap-1.5">
		<p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">{label}</p>
		<div className="flex flex-wrap gap-1.5">{children}</div>
	</div>
);

const Panel = ({ label, children }: { label: string; children: React.ReactNode }) => (
	<div className="rounded-lg border border-border p-3">
		<p className="mb-2 font-mono text-[10px] uppercase tracking-[0.1em] text-muted-foreground">
			{label}
		</p>
		<div className="flex flex-col gap-2">{children}</div>
	</div>
);

const Stat = ({ label, value }: { label: string; value: string }) => (
	<div
		className={cx(
			"rounded-lg border px-3 py-2",
			value === "clean" || value === "empty" ? "border-border" : "border-git/50 bg-git/5"
		)}
	>
		<p className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</p>
		<p className="mt-0.5 truncate text-foreground">{value}</p>
	</div>
);

export const GitPlayground = () => {
	const [s, dispatch] = useReducer(reducer, undefined, initialState);
	const { pos, width, height, hasOrphan } = useLayout(s);
	const logRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		logRef.current?.scrollTo({ top: logRef.current.scrollHeight });
	}, [s.log.length]);

	const otherBranches = s.branches.filter((b) => b.name !== s.head);
	const headTip = tipOf(s, s.head);
	const graphH = Math.max(height + PAD_Y + (hasOrphan ? 20 : 0), MIN_GRAPH_H);

	// commits you can cherry-pick (any real commit that isn't the current tip)
	const pickable = s.commits.filter((c) => !c.orphan && c.id !== headTip && c.parents.length > 0);
	// commits you can revert (real ancestors of HEAD)
	const headAnc = headTip ? ancestors(s, headTip) : new Set<string>();
	const revertable = s.commits.filter(
		(c) => !c.orphan && headAnc.has(c.id) && c.parents.length > 0
	);

	const branchesAt = (id: string) => s.branches.filter((b) => b.tip === id);

	return (
		<div className="grid gap-6 lg:grid-cols-[16rem_1fr]">
			{/* ── Command palette ─────────────────────────────── */}
			<div className="flex flex-col gap-4">
				<Panel label="Working tree">
					<CmdButton onClick={() => dispatch({ type: "edit" })}>
						edit a file <span className="text-muted-foreground">— dirty the tree</span>
					</CmdButton>
					<CmdButton onClick={() => dispatch({ type: "add" })} disabled={s.working === 0}>
						git add .
					</CmdButton>
					<CmdButton onClick={() => dispatch({ type: "commit" })} disabled={s.staged === 0} primary>
						git commit
					</CmdButton>
					<CmdButton onClick={() => dispatch({ type: "amend" })}>git commit --amend</CmdButton>
					<CmdButton
						onClick={() => dispatch({ type: "stash" })}
						disabled={s.working === 0 && s.staged === 0}
					>
						git stash
					</CmdButton>
					<CmdButton
						onClick={() => dispatch({ type: "stashPop" })}
						disabled={s.stashes.length === 0}
					>
						git stash pop{s.stashes.length > 0 ? ` (${s.stashes.length})` : ""}
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
						<>
							<ChipRow label="switch to">
								{otherBranches.map((b) => (
									<Chip key={b.name} onClick={() => dispatch({ type: "switch", name: b.name })}>
										{b.name}
									</Chip>
								))}
							</ChipRow>
							<ChipRow label={`merge into ${s.head}`}>
								{otherBranches.map((b) => (
									<Chip key={b.name} onClick={() => dispatch({ type: "merge", name: b.name })}>
										{b.name}
									</Chip>
								))}
							</ChipRow>
							<ChipRow label={`rebase ${s.head} onto`}>
								{otherBranches.map((b) => (
									<Chip key={b.name} onClick={() => dispatch({ type: "rebase", name: b.name })}>
										{b.name}
									</Chip>
								))}
							</ChipRow>
						</>
					)}
				</Panel>

				<Panel label="History">
					<CmdButton onClick={() => dispatch({ type: "tag" })}>git tag v{s.nextTag}</CmdButton>
					{pickable.length > 0 && (
						<ChipRow label="cherry-pick">
							{pickable.map((c) => (
								<Chip key={c.id} onClick={() => dispatch({ type: "cherry", id: c.id })}>
									{c.label}
								</Chip>
							))}
						</ChipRow>
					)}
					{revertable.length > 0 && (
						<ChipRow label="revert">
							{revertable.map((c) => (
								<Chip key={c.id} onClick={() => dispatch({ type: "revert", id: c.id })}>
									{c.label}
								</Chip>
							))}
						</ChipRow>
					)}
				</Panel>

				<Panel label="Undo">
					<CmdButton onClick={() => dispatch({ type: "reset" })}>git reset --hard HEAD~1</CmdButton>
					<CmdButton onClick={() => dispatch({ type: "restart" })}>start over</CmdButton>
				</Panel>
			</div>

			{/* ── Visualization ───────────────────────────────── */}
			<div className="flex min-w-0 flex-col gap-5">
				<div className="grid grid-cols-2 gap-3 font-mono text-xs sm:grid-cols-4">
					<Stat
						label="working tree"
						value={s.working > 0 ? `${s.working} edit${s.working > 1 ? "s" : ""}` : "clean"}
					/>
					<Stat label="staging area" value={s.staged > 0 ? `${s.staged} staged` : "clean"} />
					<Stat
						label="stash"
						value={s.stashes.length > 0 ? `${s.stashes.length} entry` : "empty"}
					/>
					<Stat label="HEAD" value={`${s.head} → ${headTip ?? "?"}`} />
				</div>

				{/* commit graph */}
				<div className="overflow-x-auto rounded-lg border border-border bg-card p-5">
					<svg
						width={width}
						height={graphH}
						viewBox={`0 0 ${width} ${graphH}`}
						className="block h-auto"
						role="img"
						aria-label="Commit graph"
					>
						<title>Commit graph</title>
						<g
							className="glide"
							style={{
								transform: `translate(0px, ${Math.max(0, (graphH - height) / 2 - PAD_Y / 2)}px)`,
							}}
						>
							{/* edges */}
							{s.commits.flatMap((c) =>
								c.parents.map((p) => {
									const from = pos.get(p);
									const to = pos.get(c.id);
									if (!from || !to) return null;
									const mid = (from.x + to.x) / 2;
									const dim = c.orphan || commitById(s, p)?.orphan;
									return (
										<path
											key={`${p}-${c.id}`}
											className="edge-in glide"
											style={{
												transform: `translate(${from.x}px, ${from.y}px)`,
											}}
											d={`M 0 0 C ${mid - from.x} 0, ${mid - from.x} ${to.y - from.y}, ${to.x - from.x} ${to.y - from.y}`}
											fill="none"
											stroke="hsl(var(--muted-foreground))"
											strokeWidth={1.5}
											opacity={dim ? 0.22 : 0.7}
										/>
									);
								})
							)}
							{/* commits — outer <g> glides to position, inner pops in */}
							{s.commits.map((c) => {
								const p = pos.get(c.id);
								if (!p) return null;
								const isHeadTip = c.id === headTip;
								return (
									<g
										key={c.id}
										className="glide"
										style={{ transform: `translate(${p.x}px, ${p.y}px)` }}
										opacity={c.orphan ? 0.3 : 1}
									>
										<g className="node-pop">
											<circle
												r={R}
												fill="hsl(var(--card))"
												stroke={isHeadTip ? "hsl(var(--git))" : "hsl(var(--foreground))"}
												strokeWidth={isHeadTip ? 2.5 : 1.5}
											/>
											<text y={3} fontSize={8.5} textAnchor="middle" fill="hsl(var(--foreground))">
												{c.label}
											</text>
										</g>
									</g>
								);
							})}
							{/* branch pointers — slide with their tip */}
							{s.branches.map((b) => {
								const p = pos.get(b.tip);
								if (!p) return null;
								const isHead = b.name === s.head;
								const row = branchesAt(b.tip).indexOf(b);
								const label = isHead ? `HEAD → ${b.name}` : b.name;
								const w = label.length * 6 + 12;
								return (
									<g
										key={b.name}
										className="glide"
										style={{
											transform: `translate(${p.x + R + 8}px, ${p.y - 10 + row * 22}px)`,
										}}
									>
										<rect
											width={w}
											height={20}
											rx={4}
											fill={isHead ? "hsl(var(--git))" : "transparent"}
											stroke={isHead ? "hsl(var(--git))" : "hsl(var(--border))"}
										/>
										<text
											x={6}
											y={14}
											fontSize={10}
											fill={isHead ? "hsl(var(--git-foreground))" : "hsl(var(--foreground))"}
										>
											{label}
										</text>
									</g>
								);
							})}
							{/* tags */}
							{s.tags.map((t, i) => {
								const p = pos.get(t.target);
								if (!p) return null;
								const above = branchesAt(t.target).length;
								const tagRow = s.tags.filter((x) => x.target === t.target).indexOf(t);
								const w = t.name.length * 6 + 16;
								return (
									<g
										key={`${t.name}-${i}`}
										className="glide"
										style={{
											transform: `translate(${p.x + R + 8}px, ${p.y - 10 + (above + tagRow) * 22}px)`,
										}}
									>
										<g className="node-pop">
											<rect
												width={w}
												height={20}
												rx={4}
												fill="transparent"
												stroke="hsl(var(--muted-foreground))"
												strokeDasharray="3 2"
											/>
											<text x={6} y={14} fontSize={10} fill="hsl(var(--muted-foreground))">
												⌂ {t.name}
											</text>
										</g>
									</g>
								);
							})}
						</g>
					</svg>
				</div>

				{hasOrphan && (
					<p className="font-mono text-[11px] text-muted-foreground">
						Faded commits were rewritten (rebase / amend). They&rsquo;re unreachable from any branch
						now — but <span className="text-foreground">git reflog</span> keeps them for ~90 days.
					</p>
				)}

				{/* hint */}
				<p className="flex items-start gap-2 font-mono text-xs text-muted-foreground">
					<Icons.sparkles className="mt-0.5 size-3.5 shrink-0 text-git" />
					{s.hint}
				</p>

				{/* transcript */}
				<div
					ref={logRef}
					className="max-h-72 min-h-40 overflow-y-auto rounded-lg border border-border bg-muted p-4 font-mono text-xs leading-relaxed"
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
