import Link from "next/link";
import type { FC } from "react";
import { Icons } from "@/components/icons/Icons";

const NotFound: FC = () => (
	<div className="flex min-h-[80vh] flex-col items-center justify-center px-6 text-center">
		<span className="section-label">[ 404 ]</span>
		<h1 className="mb-4 text-7xl font-bold tracking-tighter sm:text-8xl">not found.</h1>
		<p className="mb-10 max-w-sm font-mono text-sm leading-relaxed text-muted-foreground">
			This path doesn&rsquo;t resolve — like a ref that points at a commit garbage collection
			already took.
		</p>
		<div className="flex flex-wrap justify-center gap-3">
			<Link
				href="/"
				className="inline-flex items-center gap-2 border border-border px-4 py-2 font-mono text-xs uppercase tracking-wide text-muted-foreground transition-colors hover:text-foreground"
			>
				<Icons.home className="size-3.5" /> Home
			</Link>
			<Link
				href="/git"
				className="inline-flex items-center gap-2 border border-border px-4 py-2 font-mono text-xs uppercase tracking-wide text-muted-foreground transition-colors hover:text-foreground"
			>
				The guide <Icons.arrowRight className="size-3.5" />
			</Link>
		</div>
	</div>
);

export default NotFound;
