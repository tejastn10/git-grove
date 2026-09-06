/**
 * The ordered spine of the `/git` guide.
 *
 * Each entry maps to `src/content/git/<file>.mdx` for its prose, commands and
 * gotcha callouts, and optionally names one diagram component to render inside
 * that section. Reorder / add sections here and both the page and the sidebar
 * table of contents follow automatically.
 */

export type DiagramKey =
	| "staging-flow"
	| "branch-pointer"
	| "three-way-merge"
	| "fetch-vs-pull"
	| "merge-vs-rebase"
	| "reset-modes"
	| "object-model"
	| "snapshot";

export type Tier = 1 | 2 | 3 | 4;

export type GitSection = {
	/** Anchor id — used for deep links from the home page and the sidebar. */
	id: string;
	tier: Tier;
	title: string;
	/** File name (without extension) in `src/content/git/`. */
	file: string;
	/** Optional interactive/animated diagram rendered within the section. */
	diagram?: DiagramKey;
};

export const TIERS: Record<Tier, { label: string; blurb: string }> = {
	1: {
		label: "Beginner",
		blurb: "The mental model, and the five commands you'll use every day.",
	},
	2: {
		label: "Intermediate",
		blurb: "Branches as pointers, merging, and working with other repositories.",
	},
	3: {
		label: "Advanced",
		blurb: "Rewriting history deliberately — and the safety nets that let you.",
	},
	4: {
		label: "Internals",
		blurb: "What Git actually stores on disk, and why branching is nearly free.",
	},
};

export const GIT_SECTIONS: GitSection[] = [
	// ── Tier 1 — Beginner ───────────────────────────────────────
	{ id: "why-git", tier: 1, title: "What version control is (and why Git)", file: "why-git" },
	{
		id: "install-setup",
		tier: 1,
		title: "Installing Git & first-time setup",
		file: "install-setup",
	},
	{
		id: "three-areas",
		tier: 1,
		title: "The mental model: working tree, staging area, repository",
		file: "three-areas",
		diagram: "staging-flow",
	},
	{ id: "first-commit", tier: 1, title: "init, status, add, commit", file: "first-commit" },
	{ id: "gitignore", tier: 1, title: "Ignoring files with .gitignore", file: "gitignore" },
	{ id: "viewing-history", tier: 1, title: "Viewing history: git log", file: "viewing-history" },

	// ── Tier 2 — Intermediate ───────────────────────────────────
	{
		id: "what-is-a-branch",
		tier: 2,
		title: "What a branch really is",
		file: "what-is-a-branch",
		diagram: "branch-pointer",
	},
	{
		id: "working-with-branches",
		tier: 2,
		title: "Creating & switching branches",
		file: "working-with-branches",
	},
	{
		id: "merging",
		tier: 2,
		title: "Merging: fast-forward vs. three-way",
		file: "merging",
		diagram: "three-way-merge",
	},
	{ id: "merge-conflicts", tier: 2, title: "Merge conflicts", file: "merge-conflicts" },
	{ id: "remotes", tier: 2, title: "What a remote actually is", file: "remotes" },
	{
		id: "fetch-and-pull",
		tier: 2,
		title: "clone, fetch vs. pull",
		file: "fetch-and-pull",
		diagram: "fetch-vs-pull",
	},
	{ id: "pushing", tier: 2, title: "push, upstream tracking, rejections", file: "pushing" },
	{ id: "stashing", tier: 2, title: "Setting work aside with git stash", file: "stashing" },

	// ── Tier 3 — Advanced ───────────────────────────────────────
	{
		id: "rebase-vs-merge",
		tier: 3,
		title: "Rebasing vs. merging",
		file: "rebase-vs-merge",
		diagram: "merge-vs-rebase",
	},
	{ id: "interactive-rebase", tier: 3, title: "Interactive rebase", file: "interactive-rebase" },
	{ id: "cherry-pick", tier: 3, title: "Cherry-picking", file: "cherry-pick" },
	{
		id: "reset",
		tier: 3,
		title: "reset: --soft, --mixed, --hard",
		file: "reset",
		diagram: "reset-modes",
	},
	{ id: "revert-vs-reset", tier: 3, title: "revert vs. reset", file: "revert-vs-reset" },
	{ id: "reflog", tier: 3, title: "The reflog: your safety net", file: "reflog" },
	{ id: "tags", tier: 3, title: "Tags: lightweight vs. annotated", file: "tags" },
	{ id: "submodules", tier: 3, title: "Submodules (and when to avoid them)", file: "submodules" },
	{ id: "hooks", tier: 3, title: "Git hooks", file: "hooks" },

	// ── Tier 4 — Internals ──────────────────────────────────────
	{ id: "git-directory", tier: 4, title: "A tour of the .git directory", file: "git-directory" },
	{
		id: "object-model",
		tier: 4,
		title: "The object model: blobs, trees, commits",
		file: "object-model",
		diagram: "object-model",
	},
	{
		id: "snapshots-not-diffs",
		tier: 4,
		title: "Snapshots, not diffs",
		file: "snapshots-not-diffs",
		diagram: "snapshot",
	},
	{
		id: "refs-and-head",
		tier: 4,
		title: "HEAD, refs, and the ref namespace",
		file: "refs-and-head",
	},
	{ id: "packfiles-gc", tier: 4, title: "Packfiles & garbage collection", file: "packfiles-gc" },
];

/**
 * The "major section" cards on the home page. Each deep-links to an anchor
 * within `/git`. Kept deliberately short — a coarse map, not the full TOC.
 */
export const GUIDE_LANDMARKS: { title: string; blurb: string; anchor: string }[] = [
	{
		title: "Getting Started",
		blurb: "Why Git exists, installing it, first-time config",
		anchor: "why-git",
	},
	{
		title: "Local Git",
		blurb: "Working tree, staging area, repository — and the daily commands",
		anchor: "three-areas",
	},
	{
		title: "Branching",
		blurb: "What a branch really is: a movable pointer, not a copy",
		anchor: "what-is-a-branch",
	},
	{
		title: "Merging & Rebasing",
		blurb: "Fast-forward, three-way, and rewriting history cleanly",
		anchor: "merging",
	},
	{
		title: "Remotes & Push / Pull",
		blurb: "Clones, remote-tracking branches, fetch vs. pull, rejections",
		anchor: "remotes",
	},
	{
		title: "Undoing Things",
		blurb: "reset, revert, stash, and the reflog safety net",
		anchor: "reset",
	},
	{
		title: "Advanced Workflows",
		blurb: "Interactive rebase, cherry-pick, tags, submodules, hooks",
		anchor: "interactive-rebase",
	},
	{
		title: "Git Internals",
		blurb: "The .git directory, the object model, snapshots not diffs",
		anchor: "object-model",
	},
	{
		title: "Cheat Sheet",
		blurb: "Every command on one screen, grouped by task",
		anchor: "cheat-sheet",
	},
];

export const SECTIONS_BY_TIER = ([1, 2, 3, 4] as Tier[]).map((tier) => ({
	tier,
	...TIERS[tier],
	sections: GIT_SECTIONS.filter((s) => s.tier === tier),
}));
