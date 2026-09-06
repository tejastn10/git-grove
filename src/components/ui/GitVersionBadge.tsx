import { getLatestGitVersion } from "@/lib/git-version";
import { cx } from "@/utils/tailwind";

type Props = {
	className?: string;
};

/**
 * Live "current stable Git" pill. Async server component — the fetch is cached
 * for a day (see `getLatestGitVersion`) and degrades to a bundled constant if
 * the network call fails, so it never blocks a render or the build.
 *
 * Wrap in <Suspense fallback={<GitVersionBadgeSkeleton />}> at the call site.
 */
export const GitVersionBadge = async ({ className }: Props) => {
	const { version, stale } = await getLatestGitVersion();

	return (
		<span
			className={cx(
				"inline-flex items-center gap-2 border border-border bg-card px-3 py-1 font-mono text-xs text-muted-foreground",
				className
			)}
			title={
				stale
					? "Live lookup unavailable — showing the last-known-good version bundled with the site."
					: "Latest stable tag on git/git, refreshed daily."
			}
		>
			<span
				className={cx("size-1.5 rounded-full", stale ? "bg-muted-foreground" : "bg-git")}
				aria-hidden="true"
			/>
			Current stable Git
			<span className="text-foreground">v{version}</span>
		</span>
	);
};

export const GitVersionBadgeSkeleton = ({ className }: Props) => (
	<span
		className={cx(
			"inline-flex items-center gap-2 border border-border bg-card px-3 py-1 font-mono text-xs text-muted-foreground",
			className
		)}
	>
		<span className="size-1.5 rounded-full bg-border" aria-hidden="true" />
		Current stable Git
		<span className="inline-block h-3 w-12 animate-pulse bg-border" />
	</span>
);
