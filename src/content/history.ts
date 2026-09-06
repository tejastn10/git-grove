/**
 * History of Git — timeline data.
 *
 * Everything here is written to be **current-as-of-writing (September 2026)** and
 * easy to update, per the project brief. Where a specific date or wording was not
 * certain at authoring time it is flagged with `// TODO: verify` — check against
 * git-scm.com, the Wikipedia "Git" article, and the linux-kernel / git mailing
 * list archives before treating it as gospel.
 */

export type Era = {
	year: string;
	title: string;
	body: string;
};

export const TIMELINE: Era[] = [
	{
		year: "Early 2005",
		title: "The BitKeeper fallout",
		body: "Since 2002 the Linux kernel had been developed with BitKeeper, a proprietary distributed VCS offered to the kernel community under a free-of-charge licence. In April 2005 that arrangement broke down and the free licence was withdrawn, leaving the kernel — thousands of contributors, a huge history — with no tool that fit how it worked.",
	},
	{
		year: "April 2005",
		title: "Linus builds Git",
		body: "Linus Torvalds stepped back from kernel work for a couple of weeks to write a replacement himself. Development started on 3 April 2005; within a few days Git was managing its own source code, and the first tagged commits land on 7 April 2005. The goals were explicit: speed, a simple and verifiable design, strong support for non-linear development across thousands of parallel branches, fully distributed operation, and the ability to handle a project the size of the kernel efficiently.", // TODO: verify exact "self-hosting by day N" phrasing
	},
	{
		year: "April 2005",
		title: "About the name",
		body: "Torvalds has said he tends to name projects after himself, and described 'git' — British slang for an unpleasant person — as a self-deprecating joke in the same vein as 'Linux'. Git's own documentation leans into it with a list of tongue-in-cheek expansions ('global information tracker' on a good day, less flattering ones otherwise). Any tidy backronym you see is applied after the fact.", // TODO: verify against the exact wording in the git man page / early LKML posts before quoting directly
	},
	{
		year: "July 2005",
		title: "Junio Hamano takes over maintenance",
		body: "Having proved the design, Torvalds handed day-to-day maintenance to Junio Hamano, who had quickly become the most prolific early contributor. Hamano became the project's maintainer on 26 July 2005 and shepherded the 1.0 release.",
	},
	{
		year: "December 2005",
		title: "Git 1.0",
		body: "Git 1.0 was released on 21 December 2005 — roughly eight months after the first commit. The kernel had already moved its own development onto Git earlier that year.", // TODO: verify the precise kernel-cutover milestone (2.6.12-rc era)
	},
	{
		year: "2008",
		title: "GitHub, and the network effect",
		body: "GitHub launched in 2008 and made hosting and collaborating on Git repositories easy for everyone, not just kernel-scale projects. Combined with Git's speed and cheap branching, adoption accelerated sharply across open source and industry; other hosts (GitLab, Bitbucket, Gitea, and others) followed.",
	},
	{
		year: "2020 onward",
		title: "The SHA-256 transition",
		body: "Git's object names were originally SHA-1 hashes. Work to support SHA-256 repositories has been in progress for years and is available experimentally; interoperability between SHA-1 and SHA-256 histories is still being finished. Most repositories in the wild remain SHA-1 for now.", // TODO: verify current interop status against the latest release notes
	},
	{
		year: "Today",
		title: "A community project",
		body: "Git is not a single-company product. It is developed in the open by a large contributor base, coordinated on a public mailing list, with Junio Hamano continuing as the long-standing maintainer of the canonical git.git repository. Releases come out on a regular cadence — the badge elsewhere on this site tracks the current stable one.",
	},
];

export const GROUND_TRUTH: { label: string; href: string }[] = [
	{ label: "git-scm.com — official site & Pro Git book", href: "https://git-scm.com" },
	{ label: "The git.git source repository", href: "https://github.com/git/git" },
	{ label: "Git development mailing list archive", href: "https://lore.kernel.org/git/" },
	{ label: 'Wikipedia — "Git"', href: "https://en.wikipedia.org/wiki/Git" },
];
