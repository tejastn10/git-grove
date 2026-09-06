/**
 * Central site configuration for GitGrove.
 * Edit copy, navigation, and metadata here — pages read from this object.
 */
export const SITE = {
	name: "GitGrove",
	logoName: "git-grove",
	tagline: "Learn Git the way it actually works — visually.",
	description:
		"An interactive Git explainer: animated, step-through diagrams that take you from your first commit to Git's object model — with a live badge tracking the current stable release.",

	// Used for metadataBase / Open Graph. Update to the real deployment URL.
	url: "https://git-grove.vercel.app",

	repo: "https://github.com/tejastn10/git-grove",
	author: {
		name: "Tejas Nikhar",
		url: "https://github.com/tejastn10",
	},

	nav: [
		{ href: "/git", label: "The Guide" },
		{ href: "/history", label: "History" },
	],

	// External references surfaced across the site — the "ground truth" links.
	links: {
		gitScm: "https://git-scm.com",
		gitScmDownloads: "https://git-scm.com/downloads",
		proGitBook: "https://git-scm.com/book/en/v2",
		mailingList: "https://lore.kernel.org/git/",
		sourceRepo: "https://github.com/git/git",
		referenceDocs: "https://git-scm.com/docs",
	},
} as const;
