"use client";

import { motion, useReducedMotion } from "motion/react";
import { type ReactNode, useCallback, useState } from "react";
import { Icons } from "@/components/icons/Icons";
import { cx } from "@/utils/tailwind";

/* ───────────────────────────────────────────────────────────────
   Shared visual language for every GitGrove diagram:

   - commits are always circles
   - branch / HEAD labels are always small tags on a thin leader line
   - the working tree / staging area / repository are always the same
     three bordered "zones"
   - the Git-orange accent (`--git`) only ever marks what's *active*:
     HEAD, the current branch, the step being explained
   ─────────────────────────────────────────────────────────────── */

export const DIAGRAM = {
	commitR: 17,
	stroke: "hsl(var(--foreground))",
	muted: "hsl(var(--muted-foreground))",
	accent: "hsl(var(--git))",
	bg: "hsl(var(--background))",
	card: "hsl(var(--card))",
	border: "hsl(var(--border))",
};

/* ── Step state ─────────────────────────────────────────────── */

export const useSteps = (total: number, initial = 0) => {
	const [step, setStep] = useState(initial);
	const next = useCallback(() => setStep((s) => Math.min(s + 1, total - 1)), [total]);
	const prev = useCallback(() => setStep((s) => Math.max(s - 1, 0)), []);
	const reset = useCallback(() => setStep(initial), [initial]);
	return { step, setStep, next, prev, reset, atStart: step === 0, atEnd: step === total - 1 };
};

/* ── Frame ──────────────────────────────────────────────────── */

type DiagramFrameProps = {
	title: string;
	caption?: string;
	children: ReactNode;
	/** Rendered under the diagram, e.g. step explanation or a legend. */
	footer?: ReactNode;
};

export const DiagramFrame = ({ title, caption, children, footer }: DiagramFrameProps) => (
	<figure className="diagram-frame my-6 select-none">
		<figcaption className="flex items-baseline justify-between gap-3 border-b border-border px-4 py-2.5">
			<span className="font-mono text-xs font-semibold uppercase tracking-[0.08em]">{title}</span>
			{caption ? (
				<span className="font-mono text-[11px] text-muted-foreground">{caption}</span>
			) : null}
		</figcaption>
		<div className="overflow-x-auto px-4 py-5">{children}</div>
		{footer ? (
			<div className="border-t border-border px-4 py-3 font-mono text-xs text-muted-foreground">
				{footer}
			</div>
		) : null}
	</figure>
);

/* ── Step controls ──────────────────────────────────────────── */

type StepControlsProps = {
	step: number;
	total: number;
	onPrev: () => void;
	onNext: () => void;
	onReset: () => void;
	/** Short label per step, shown as the "you are here" caption. */
	labels?: string[];
	/** Optional command that produced this step, rendered monospace. */
	command?: string;
};

export const StepControls = ({
	step,
	total,
	onPrev,
	onNext,
	onReset,
	labels,
	command,
}: StepControlsProps) => (
	<div className="flex flex-col gap-3">
		<div className="flex flex-wrap items-center gap-2">
			<button
				type="button"
				onClick={onPrev}
				disabled={step === 0}
				className="inline-flex items-center gap-1 rounded-md border border-border px-2.5 py-1 font-mono text-xs uppercase tracking-wide text-muted-foreground transition-colors hover:text-foreground disabled:pointer-events-none disabled:opacity-40"
			>
				<Icons.arrowLeft className="size-3" /> Prev
			</button>
			<button
				type="button"
				onClick={onNext}
				disabled={step === total - 1}
				className="inline-flex items-center gap-1 rounded-md border border-git bg-git px-2.5 py-1 font-mono text-xs uppercase tracking-wide text-git-foreground transition-opacity hover:opacity-90 disabled:pointer-events-none disabled:opacity-40"
			>
				Next step <Icons.arrowRight className="size-3" />
			</button>
			<button
				type="button"
				onClick={onReset}
				disabled={step === 0}
				className="ml-auto font-mono text-[11px] uppercase tracking-wide text-muted-foreground underline decoration-border underline-offset-4 transition-colors hover:text-foreground disabled:pointer-events-none disabled:opacity-40"
			>
				Reset
			</button>
		</div>

		<div className="flex gap-1">
			{Array.from({ length: total }).map((_, i) => (
				<span
					key={i}
					className={cx(
						"h-1 flex-1 rounded-full transition-colors",
						i <= step ? "bg-git" : "bg-border"
					)}
				/>
			))}
		</div>

		{command ? (
			<p className="font-mono text-xs text-foreground">
				<span className="text-muted-foreground">$ </span>
				{command}
			</p>
		) : null}
		{labels?.[step] ? (
			<p className="font-mono text-xs leading-relaxed text-muted-foreground">
				<span className="text-foreground">
					{step + 1}/{total}
				</span>{" "}
				— {labels[step]}
			</p>
		) : null}
	</div>
);

/* ── SVG atoms ──────────────────────────────────────────────── */

export const Zone = ({
	x,
	y,
	w,
	h,
	label,
	active,
}: {
	x: number;
	y: number;
	w: number;
	h: number;
	label: string;
	active?: boolean;
}) => (
	<g>
		<rect
			x={x}
			y={y}
			width={w}
			height={h}
			rx={6}
			fill="transparent"
			stroke={active ? DIAGRAM.accent : DIAGRAM.border}
			strokeWidth={active ? 2 : 1}
			strokeDasharray="4 4"
		/>
		<text
			x={x + 8}
			y={y + 16}
			fontSize={10}
			fill={DIAGRAM.muted}
			style={{ textTransform: "uppercase", letterSpacing: "0.08em" }}
		>
			{label}
		</text>
	</g>
);

export const Commit = ({
	cx: x,
	cy: y,
	label,
	head,
	dim,
	isNew,
	reduced,
}: {
	cx: number;
	cy: number;
	label: string;
	head?: boolean;
	dim?: boolean;
	isNew?: boolean;
	reduced?: boolean | null;
}) => (
	<motion.g
		initial={isNew && !reduced ? { scale: 0, opacity: 0 } : false}
		animate={{ scale: 1, opacity: dim ? 0.35 : 1 }}
		transition={{ type: "spring", stiffness: 260, damping: 20 }}
		style={{ transformOrigin: `${x}px ${y}px` }}
	>
		<circle
			cx={x}
			cy={y}
			r={DIAGRAM.commitR}
			fill={DIAGRAM.card}
			stroke={head ? DIAGRAM.accent : DIAGRAM.stroke}
			strokeWidth={head ? 2.5 : 1.5}
		/>
		<text x={x} y={y + 4} fontSize={10} textAnchor="middle" fill={DIAGRAM.stroke}>
			{label}
		</text>
	</motion.g>
);

export const Edge = ({
	x1,
	y1,
	x2,
	y2,
	dim,
}: {
	x1: number;
	y1: number;
	x2: number;
	y2: number;
	dim?: boolean;
}) => (
	<line
		x1={x1}
		y1={y1}
		x2={x2}
		y2={y2}
		stroke={DIAGRAM.muted}
		strokeWidth={1.5}
		opacity={dim ? 0.3 : 0.8}
	/>
);

export const RefTag = ({
	x,
	y,
	label,
	accent,
	anchorY,
}: {
	x: number;
	y: number;
	label: string;
	accent?: boolean;
	/** y of the commit this tag points at; draws a leader line when provided. */
	anchorY?: number;
}) => {
	const w = Math.max(30, label.length * 7 + 12);
	return (
		<g>
			{anchorY != null ? (
				<line
					x1={x + w / 2}
					y1={y + 20}
					x2={x + w / 2}
					y2={anchorY}
					stroke={accent ? DIAGRAM.accent : DIAGRAM.muted}
					strokeWidth={1.25}
				/>
			) : null}
			<rect
				x={x}
				y={y}
				width={w}
				height={20}
				rx={4}
				fill={accent ? DIAGRAM.accent : "transparent"}
				stroke={accent ? DIAGRAM.accent : DIAGRAM.border}
				strokeWidth={1}
			/>
			<text
				x={x + w / 2}
				y={y + 14}
				fontSize={10}
				textAnchor="middle"
				fill={accent ? "hsl(var(--git-foreground))" : DIAGRAM.stroke}
			>
				{label}
			</text>
		</g>
	);
};

/** Hook wrapper so diagrams can branch on reduced-motion cheaply. */
export const useDiagramMotion = () => useReducedMotion();
