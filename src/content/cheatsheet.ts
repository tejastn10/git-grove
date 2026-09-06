/**
 * The dense command reference at the bottom of the guide. Each row links back
 * up to the section (`anchor`) that explains it in full.
 */

export type CheatRow = { cmd: string; desc: string; anchor: string };
export type CheatGroup = { title: string; rows: CheatRow[] };

export const CHEAT_SHEET: CheatGroup[] = [
	{
		title: "Setup",
		rows: [
			{
				cmd: 'git config --global user.name "…"',
				desc: "Set the name on your commits",
				anchor: "install-setup",
			},
			{
				cmd: 'git config --global user.email "…"',
				desc: "Set the email on your commits",
				anchor: "install-setup",
			},
			{
				cmd: "git config --global init.defaultBranch main",
				desc: "Name new repos' first branch `main`",
				anchor: "install-setup",
			},
			{
				cmd: "git config --list --show-origin",
				desc: "Show every setting and which file it came from",
				anchor: "install-setup",
			},
		],
	},
	{
		title: "Everyday",
		rows: [
			{
				cmd: "git init",
				desc: "Turn the current directory into a repository",
				anchor: "first-commit",
			},
			{ cmd: "git status", desc: "What's modified, staged, and untracked", anchor: "first-commit" },
			{ cmd: "git add <path>", desc: "Stage a file's current contents", anchor: "first-commit" },
			{ cmd: "git add -p", desc: "Stage selected hunks interactively", anchor: "first-commit" },
			{ cmd: 'git commit -m "…"', desc: "Record the staged snapshot", anchor: "first-commit" },
			{
				cmd: "git commit --amend",
				desc: "Replace the last commit (rewrites it)",
				anchor: "interactive-rebase",
			},
			{ cmd: "git diff", desc: "Working tree vs. staged", anchor: "first-commit" },
			{ cmd: "git diff --staged", desc: "Staged vs. last commit", anchor: "first-commit" },
			{
				cmd: "git restore <path>",
				desc: "Discard working-tree changes to a file",
				anchor: "working-with-branches",
			},
			{
				cmd: "git restore --staged <path>",
				desc: "Unstage a file, keep the changes",
				anchor: "first-commit",
			},
		],
	},
	{
		title: "History",
		rows: [
			{
				cmd: "git log --oneline --graph --all",
				desc: "Compact, visual history of every branch",
				anchor: "viewing-history",
			},
			{
				cmd: "git log -p <path>",
				desc: "Every change to one file, with diffs",
				anchor: "viewing-history",
			},
			{
				cmd: "git show <commit>",
				desc: "Inspect one commit's message and diff",
				anchor: "viewing-history",
			},
			{
				cmd: "git blame <path>",
				desc: "Which commit last touched each line",
				anchor: "viewing-history",
			},
			{ cmd: "git reflog", desc: "Every position HEAD has held — your undo log", anchor: "reflog" },
		],
	},
	{
		title: "Branching",
		rows: [
			{ cmd: "git branch", desc: "List local branches", anchor: "working-with-branches" },
			{
				cmd: "git switch -c <name>",
				desc: "Create a branch and check it out",
				anchor: "working-with-branches",
			},
			{
				cmd: "git switch <name>",
				desc: "Check out an existing branch",
				anchor: "working-with-branches",
			},
			{
				cmd: "git branch -d <name>",
				desc: "Delete a merged branch (pointer only)",
				anchor: "working-with-branches",
			},
			{ cmd: "git merge <name>", desc: "Merge a branch into the current one", anchor: "merging" },
			{
				cmd: "git rebase <base>",
				desc: "Replay current branch's commits onto `base`",
				anchor: "rebase-vs-merge",
			},
			{
				cmd: "git rebase -i <base>",
				desc: "Squash / reword / reorder / drop commits",
				anchor: "interactive-rebase",
			},
			{
				cmd: "git cherry-pick <commit>",
				desc: "Copy one commit onto the current branch",
				anchor: "cherry-pick",
			},
		],
	},
	{
		title: "Remotes",
		rows: [
			{
				cmd: "git clone <url>",
				desc: "Copy a remote repo and its history",
				anchor: "fetch-and-pull",
			},
			{ cmd: "git remote -v", desc: "List configured remotes", anchor: "remotes" },
			{
				cmd: "git fetch <remote>",
				desc: "Download new commits; move remote-tracking refs only",
				anchor: "fetch-and-pull",
			},
			{
				cmd: "git pull",
				desc: "fetch + merge (or --rebase) the upstream branch",
				anchor: "fetch-and-pull",
			},
			{ cmd: "git push", desc: "Upload commits to the upstream branch", anchor: "pushing" },
			{
				cmd: "git push -u <remote> <branch>",
				desc: "Push and set the upstream tracking branch",
				anchor: "pushing",
			},
			{
				cmd: "git push --force-with-lease",
				desc: "Overwrite remote history, but only if nobody else pushed",
				anchor: "pushing",
			},
		],
	},
	{
		title: "Undo & rescue",
		rows: [
			{
				cmd: "git reset --soft <commit>",
				desc: "Move HEAD; keep index and working tree",
				anchor: "reset",
			},
			{
				cmd: "git reset --mixed <commit>",
				desc: "Move HEAD and index; keep working tree (default)",
				anchor: "reset",
			},
			{
				cmd: "git reset --hard <commit>",
				desc: "Move all three — discards uncommitted work",
				anchor: "reset",
			},
			{
				cmd: "git revert <commit>",
				desc: "New commit that undoes another (safe on shared branches)",
				anchor: "revert-vs-reset",
			},
			{ cmd: "git stash", desc: "Shelve working-tree changes", anchor: "stashing" },
			{ cmd: "git stash pop", desc: "Re-apply the most recent stash", anchor: "stashing" },
			{ cmd: "git reflog", desc: "Find a 'lost' commit and reset back to it", anchor: "reflog" },
		],
	},
	{
		title: "Tags & internals",
		rows: [
			{ cmd: "git tag <name>", desc: "Lightweight tag — a bare pointer", anchor: "tags" },
			{
				cmd: 'git tag -a <name> -m "…"',
				desc: "Annotated tag — a real object with metadata",
				anchor: "tags",
			},
			{
				cmd: "git cat-file -p <hash>",
				desc: "Print any object: commit, tree, or blob",
				anchor: "object-model",
			},
			{ cmd: "git rev-parse HEAD", desc: "Resolve a ref to its full SHA", anchor: "refs-and-head" },
			{ cmd: "git gc", desc: "Compress loose objects into a packfile", anchor: "packfiles-gc" },
		],
	},
];
