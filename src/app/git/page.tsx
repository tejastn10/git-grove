import type { Metadata } from "next";
import { Suspense } from "react";
import { BlurFade } from "@/components/animated/BlurFade";
import { ScrollProgress } from "@/components/animated/ScrollProgress";
import { DIAGRAMS } from "@/components/diagrams/registry";
import { CheatSheet } from "@/components/guide/CheatSheet";
import { GuideToc } from "@/components/guide/GuideToc";
import { ArticleContent } from "@/components/ui/ArticleContent";
import { GitVersionBadge, GitVersionBadgeSkeleton } from "@/components/ui/GitVersionBadge";
import { GIT_SECTIONS, SECTIONS_BY_TIER } from "@/content/git/sections";
import { loadDoc } from "@/lib/content";

export const metadata: Metadata = {
	title: "The Guide",
	description:
		"Git from your first commit to the object model — every concept with a plain-English explanation, the real commands, an animated diagram, and the gotchas.",
};

const GitGuidePage = async () => {
	const docs = await Promise.all(GIT_SECTIONS.map((s) => loadDoc(`git/${s.file}`)));
	const bySection = new Map(GIT_SECTIONS.map((s, i) => [s.id, docs[i]]));

	return (
		<>
			<ScrollProgress className="bg-git" />
			<div className="mx-auto max-w-5xl px-6 py-14">
				{/* ── Header ─────────────────────────────────────────── */}
				<header className="mb-14 border-b border-border pb-10">
					<span className="section-label">[ The Guide ]</span>
					<h1 className="mt-1 text-3xl font-bold tracking-tighter sm:text-5xl">
						How Git actually works
					</h1>
					<p className="mt-4 max-w-2xl text-muted-foreground md:text-lg">
						Four tiers, twenty-nine sections. Every concept gets a plain-English explanation, the
						exact commands, a step-through diagram where the state change matters, and a
						&ldquo;gotchas&rdquo; box for the traps.
					</p>
					<div className="mt-6">
						<Suspense fallback={<GitVersionBadgeSkeleton />}>
							<GitVersionBadge />
						</Suspense>
					</div>
				</header>

				<div className="grid gap-12 lg:grid-cols-[13rem_1fr]">
					{/* ── Sidebar TOC ────────────────────────────────── */}
					<aside className="hidden lg:block">
						<div className="sticky top-16 max-h-[calc(100vh-5rem)] overflow-y-auto pb-8">
							<GuideToc groups={SECTIONS_BY_TIER} />
						</div>
					</aside>

					{/* ── Content ────────────────────────────────────── */}
					<div className="min-w-0">
						{SECTIONS_BY_TIER.map((group) => (
							<div key={group.tier}>
								<div className="mb-8 mt-4 first:mt-0">
									<h2 className="font-mono text-xs uppercase tracking-[0.14em] text-git">
										Tier {group.tier} — {group.label}
									</h2>
									<p className="mt-1 text-sm text-muted-foreground">{group.blurb}</p>
								</div>

								{group.sections.map((section) => {
									const doc = bySection.get(section.id);
									const Diagram = section.diagram ? DIAGRAMS[section.diagram] : null;
									return (
										<section
											key={section.id}
											id={section.id}
											className="mb-16 scroll-mt-20 border-t border-border pt-8"
										>
											<BlurFade inView yOffset={8}>
												<h3 className="mb-4 text-xl font-bold tracking-tight sm:text-2xl">
													{section.title}
												</h3>
												<div className="guide-prose">
													<ArticleContent
														html={doc?.html ?? ""}
														className="prose dark:prose-invert w-full max-w-none text-[0.95rem] leading-relaxed"
													/>
												</div>
												{Diagram ? <Diagram /> : null}
											</BlurFade>
										</section>
									);
								})}
							</div>
						))}

						{/* ── Cheat sheet ────────────────────────────── */}
						<section id="cheat-sheet" className="scroll-mt-20 border-t-2 border-git pt-8">
							<span className="section-label">[ Reference ]</span>
							<h2 className="mt-1 mb-2 text-2xl font-bold tracking-tighter sm:text-3xl">
								Cheat sheet
							</h2>
							<p className="mb-8 max-w-2xl text-sm text-muted-foreground">
								Every command on this page, grouped by task. Click a command to jump back to the
								section that explains it.
							</p>
							<div className="overflow-x-auto">
								<CheatSheet />
							</div>
						</section>
					</div>
				</div>
			</div>
		</>
	);
};

export default GitGuidePage;
