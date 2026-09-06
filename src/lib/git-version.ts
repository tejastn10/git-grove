/**
 * Live "current stable Git version" lookup.
 *
 * ── How it works ────────────────────────────────────────────────
 * We ask the GitHub API for tags on the canonical `git/git` mirror, keep only
 * clean `vX.Y.Z` tags (dropping `-rcN` pre-releases), and return the highest by
 * semver. The result is cached with `next: { revalidate }` so we hit GitHub at
 * most once a day per deployment, not once per request.
 *
 * ── Swapping the data source ────────────────────────────────────
 * If GitHub's tag API changes shape (or you get rate-limited without a token),
 * replace `fetchTagsFromGitHub` with another source and keep the same return
 * contract (`Promise<string[]>` of raw tag names like "v2.55.0"). Good
 * alternatives:
 *   - https://git-scm.com/downloads  (scrape the "latest release" heading)
 *   - https://www.kernel.org/pub/software/scm/git/  (directory listing of tarballs)
 *   - git ls-remote --tags https://github.com/git/git  (if you have a runtime shell)
 * `parseLatestStable` and the caller below are source-agnostic.
 */

// Last-known-good value. Bump this when you cut a release so the fallback is
// never embarrassingly stale. Verified 2026-09-06.
export const FALLBACK_GIT_VERSION = "2.55.0";

const GITHUB_TAGS_URL = "https://api.github.com/repos/git/git/tags?per_page=100";
const REVALIDATE_SECONDS = 86_400; // once per day

type GitVersion = {
	version: string; // e.g. "2.55.0"
	/** True when we could not reach the live source and fell back to the constant. */
	stale: boolean;
};

const STABLE_TAG = /^v(\d+)\.(\d+)\.(\d+)$/;

const compareSemver = (a: string, b: string): number => {
	const pa = a.split(".").map(Number);
	const pb = b.split(".").map(Number);
	for (let i = 0; i < 3; i++) {
		if (pa[i] !== pb[i]) return pa[i] - pb[i];
	}
	return 0;
};

const parseLatestStable = (tags: string[]): string | null => {
	const stable = tags
		.map((t) => STABLE_TAG.exec(t.trim()))
		.filter((m): m is RegExpExecArray => m !== null)
		.map((m) => `${m[1]}.${m[2]}.${m[3]}`)
		.sort(compareSemver);

	return stable.at(-1) ?? null;
};

const fetchTagsFromGitHub = async (): Promise<string[]> => {
	const res = await fetch(GITHUB_TAGS_URL, {
		headers: { Accept: "application/vnd.github+json" },
		next: { revalidate: REVALIDATE_SECONDS },
	});
	if (!res.ok) {
		throw new Error(`GitHub tags request failed: ${res.status}`);
	}
	const data = (await res.json()) as Array<{ name: string }>;
	return data.map((tag) => tag.name);
};

/**
 * Returns the current stable Git version. Never throws — on any failure it
 * resolves to {@link FALLBACK_GIT_VERSION} with `stale: true`.
 */
export const getLatestGitVersion = async (): Promise<GitVersion> => {
	try {
		const tags = await fetchTagsFromGitHub();
		const latest = parseLatestStable(tags);
		if (!latest) throw new Error("no stable tags found in response");
		return { version: latest, stale: false };
	} catch (error) {
		console.warn("[git-version] falling back to constant:", error);
		return { version: FALLBACK_GIT_VERSION, stale: true };
	}
};
