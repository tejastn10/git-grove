import Link from "next/link";
import { Suspense } from "react";
import { BlurFade } from "@/components/animated/BlurFade";
import { CommitGraphBackground } from "@/components/animated/CommitGraphBackground";
import { Icons } from "@/components/icons/Icons";
import { GitVersionBadge, GitVersionBadgeSkeleton } from "@/components/ui/GitVersionBadge";
import { GUIDE_LANDMARKS } from "@/content/git/sections";
import { SITE } from "@/data/site";

const BLUR = 0.05;

const SectionLabel = ({ label }: { label: string }) => (
	<span className="section-label">[ {label} ]</span>
);

const Home = () => (
	<main className="mx-auto max-w-5xl px-6 pb-24">
		{/* ── Hero ───────────────────────────────────────────────── */}
		<section className="relative overflow-hidden pt-16 sm:pt-24">
			<CommitGraphBackground />
			<BlurFade delay={BLUR}>
				<span className="section-label">[ {SITE.logoName} ]</span>
				<h1 className="mt-2 max-w-3xl text-4xl font-bold leading-[1.05] tracking-tighter sm:text-6xl">
					Learn Git the way it <span className="text-git">actually works</span> — visually.
				</h1>
			</BlurFade>
			<BlurFade delay={BLUR * 2}>
				<p className="mt-5 max-w-xl text-muted-foreground md:text-lg">{SITE.description}</p>
			</BlurFade>
			<BlurFade delay={BLUR * 3}>
				<div className="mt-8 flex flex-wrap items-center gap-3">
					<Link
						href="/git"
						className="inline-flex items-center gap-2 rounded-md border border-git bg-git px-4 py-2 font-mono text-xs uppercase tracking-wide text-git-foreground transition-opacity hover:opacity-90"
					>
						Open the guide <Icons.arrowRight className="size-3.5" />
					</Link>
					<Link
						href="/playground"
						className="inline-flex items-center gap-2 rounded-md border border-border px-4 py-2 font-mono text-xs uppercase tracking-wide text-muted-foreground transition-colors hover:text-foreground"
					>
						Open the sandbox
					</Link>
				</div>
			</BlurFade>
			<BlurFade delay={BLUR * 4}>
				<div className="mt-8">
					<Suspense fallback={<GitVersionBadgeSkeleton />}>
						<GitVersionBadge />
					</Suspense>
				</div>
			</BlurFade>
		</section>

		{/* ── Why Git ────────────────────────────────────────────── */}
		<section className="mt-24 border-t border-border pt-10">
			<BlurFade inView>
				<SectionLabel label="Why bother" />
				<p className="mt-2 max-w-2xl text-lg leading-relaxed md:text-xl">
					Git isn&rsquo;t hard because the concepts are deep — it&rsquo;s hard because the words
					(&ldquo;checkout&rdquo;, &ldquo;HEAD&rdquo;, &ldquo;reset&rdquo;) hide a small, consistent
					model underneath. Once you can <em>see</em> commits as snapshots and branches as pointers,
					every command becomes obvious. That&rsquo;s the whole idea here: one visual language,
					built up from your first commit to the object database.
				</p>
			</BlurFade>
		</section>

		{/* ── Section grid ───────────────────────────────────────── */}
		<section className="mt-24 border-t border-border pt-10">
			<BlurFade inView>
				<SectionLabel label="The map" />
				<h2 className="mt-2 text-2xl font-bold tracking-tighter sm:text-3xl">Nine landmarks</h2>
				<p className="mt-2 max-w-lg text-sm text-muted-foreground">
					Each jumps straight to that part of the guide.
				</p>
			</BlurFade>

			<BlurFade inView className="mt-8 block">
				<div className="grid gap-px overflow-hidden rounded-lg border border-border bg-border sm:grid-cols-2 lg:grid-cols-3">
					{GUIDE_LANDMARKS.map((item, i) => (
						<Link
							key={item.anchor}
							href={`/git#${item.anchor}`}
							className="group flex h-full flex-col justify-between gap-6 bg-background p-5 transition-colors hover:bg-card"
						>
							<div>
								<p className="font-mono text-[10px] uppercase tracking-[0.1em] text-muted-foreground/60">
									{String(i + 1).padStart(2, "0")}
								</p>
								<h3 className="mt-1 font-bold tracking-tight">{item.title}</h3>
								<p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">{item.blurb}</p>
							</div>
							<span className="inline-flex items-center gap-1 font-mono text-[10px] uppercase tracking-wide text-muted-foreground transition-colors group-hover:text-git">
								Read <Icons.arrowRight className="size-3" />
							</span>
						</Link>
					))}
				</div>
			</BlurFade>
		</section>

		{/* ── Sandbox ────────────────────────────────────────────── */}
		<section className="mt-24 border-t border-border pt-10">
			<BlurFade inView>
				<SectionLabel label="Hands-on" />
				<h2 className="mt-2 text-2xl font-bold tracking-tighter sm:text-3xl">The Sandbox</h2>
				<p className="mt-2 max-w-2xl text-muted-foreground md:text-base">
					One in-browser repository you drive by clicking commands. Add, commit, branch, switch,
					merge, reset — and watch the three areas and the commit graph react together, exactly the
					way the real commands compose.
				</p>
				<Link
					href="/playground"
					className="mt-5 inline-flex items-center gap-2 rounded-md border border-git bg-git px-4 py-2 font-mono text-xs uppercase tracking-wide text-git-foreground transition-opacity hover:opacity-90"
				>
					Open the sandbox <Icons.arrowRight className="size-3.5" />
				</Link>
			</BlurFade>
		</section>

		{/* ── History teaser ─────────────────────────────────────── */}
		<section className="mt-24 border-t border-border pt-10">
			<BlurFade inView>
				<SectionLabel label="Origin" />
				<p className="mt-2 max-w-2xl text-muted-foreground md:text-lg">
					Git was written in about ten days in April 2005, after the Linux kernel project lost
					access to its previous version-control tool.{" "}
					<Link
						href="/history"
						className="text-foreground underline decoration-border underline-offset-4 hover:decoration-foreground"
					>
						Read the history →
					</Link>
				</p>
			</BlurFade>
		</section>
	</main>
);

export default Home;
