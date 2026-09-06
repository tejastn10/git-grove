import type { LucideIcon } from "lucide-react";
import {
	ArrowLeft,
	ArrowRight,
	ArrowUpRight,
	Check,
	ChevronRight,
	Copy,
	GitBranch,
	GitCommitHorizontal,
	GitFork,
	Github,
	GitMerge,
	House,
	Menu,
	Moon,
	Sparkles,
	Sun,
	Tag,
	Terminal,
	TriangleAlert,
	X,
} from "lucide-react";

export type IconProps = React.SVGProps<SVGSVGElement>;

/**
 * Icon set for GitGrove. Backed by `lucide-react`.
 * Use as components: `<Icons.home className="size-4" />`.
 */
export const Icons = {
	home: House,
	github: Github,
	sun: Sun,
	moon: Moon,
	menu: Menu,
	close: X,
	check: Check,
	copy: Copy,
	chevron: ChevronRight,
	arrowRight: ArrowRight,
	arrowLeft: ArrowLeft,
	externalLink: ArrowUpRight,
	terminal: Terminal,
	warning: TriangleAlert,
	sparkles: Sparkles,
	branch: GitBranch,
	commit: GitCommitHorizontal,
	merge: GitMerge,
	fork: GitFork,
	tag: Tag,
} satisfies Record<string, LucideIcon>;
