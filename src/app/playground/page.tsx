import type { Metadata } from "next";
import Link from "next/link";
import { Icons } from "@/components/icons/Icons";
import { GitPlayground } from "@/components/playground/GitPlayground";

export const metadata: Metadata = {
	title: "The Sandbox",
	description:
		"Drive one in-memory Git repository by clicking commands — add, commit, branch, switch, merge, reset — and watch the working tree, staging area and commit graph react together.",
};

const PlaygroundPage = () => (
	<main className="mx-auto max-w-5xl px-6 py-14">
		<header className="mb-10 border-b border-border pb-8">
			<span className="section-label">[ The Sandbox ]</span>
			<h1 className="mt-1 text-3xl font-bold tracking-tighter sm:text-5xl">
				Every command, one repo
			</h1>
			<p className="mt-4 max-w-2xl text-muted-foreground md:text-lg">
				This is a single Git repository living in your browser. Click commands on the left and watch
				the three areas, the branch pointers, and the commit graph all update from the same state —
				exactly the way the real commands compose. Nothing is saved; hit{" "}
				<span className="font-mono text-foreground">start over</span> anytime.
			</p>
		</header>

		<GitPlayground />

		<section className="mt-12 border-t border-border pt-8">
			<p className="font-mono text-xs text-muted-foreground">
				Want the why behind each of these?{" "}
				<Link
					href="/git"
					className="inline-flex items-center gap-1 text-foreground underline decoration-border underline-offset-4 hover:decoration-foreground"
				>
					Read the guide <Icons.arrowRight className="size-3" />
				</Link>
			</p>
		</section>
	</main>
);

export default PlaygroundPage;
