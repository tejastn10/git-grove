import type { Metadata } from "next";
import Link from "next/link";
import { BlurFade } from "@/components/animated/BlurFade";
import { Timeline } from "@/components/history/Timeline";
import { Icons } from "@/components/icons/Icons";
import { GROUND_TRUTH, TIMELINE } from "@/content/history";
import { SITE } from "@/data/site";

export const metadata: Metadata = {
	title: "History of Git",
	description:
		"How Git came to exist: the BitKeeper fallout, ten days of work by Linus Torvalds in April 2005, Junio Hamano's long maintainership, and Git's spread through open source.",
};

const HistoryPage = () => (
	<main className="mx-auto max-w-3xl px-6 py-14">
		<header className="mb-12 border-b border-border pb-10">
			<span className="section-label">[ History ]</span>
			<h1 className="mt-1 text-3xl font-bold tracking-tighter sm:text-5xl">Where Git came from</h1>
			<p className="mt-4 text-muted-foreground md:text-lg">
				Git is a little over twenty years old. It was built quickly, for one very demanding project,
				and its design still reflects that. Here&rsquo;s the short version — kept honest, with no
				invented quotes or dates.
			</p>
		</header>

		<BlurFade inView>
			<Timeline entries={TIMELINE} />
		</BlurFade>

		<section className="mt-14 border-t border-border pt-8">
			<h2 className="mb-2 font-mono text-xs font-bold uppercase tracking-[0.1em] text-muted-foreground">
				Check the ground truth
			</h2>
			<p className="mb-4 max-w-2xl text-sm text-muted-foreground">
				This page is a summary written from public sources and current as of its last edit.
				Maintainer and contributor details change over time — for anything authoritative, go to the
				project itself:
			</p>
			<ul className="space-y-1.5 text-sm">
				{GROUND_TRUTH.map((link) => (
					<li key={link.href}>
						<a
							href={link.href}
							target="_blank"
							rel="noopener noreferrer"
							className="inline-flex items-center gap-1.5 text-foreground underline decoration-border underline-offset-4 hover:decoration-foreground"
						>
							{link.label}
							<Icons.externalLink className="size-3" />
						</a>
					</li>
				))}
			</ul>
		</section>

		<div className="mt-12">
			<Link
				href="/git"
				className="inline-flex items-center gap-2 rounded-md border border-border px-4 py-2 font-mono text-xs uppercase tracking-wide text-muted-foreground transition-colors hover:text-foreground"
			>
				<Icons.arrowLeft className="size-3.5" /> Back to the guide
			</Link>
		</div>

		<p className="mt-10 font-mono text-[11px] text-muted-foreground/60">
			Source for this project:{" "}
			<a href={SITE.repo} className="underline decoration-border underline-offset-2">
				{SITE.repo.replace("https://", "")}
			</a>
		</p>
	</main>
);

export default HistoryPage;
