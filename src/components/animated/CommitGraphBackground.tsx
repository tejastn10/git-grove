"use client";

import { motion, useReducedMotion } from "motion/react";
import { useId } from "react";

/*
 * Faint, slowly drifting commit graph behind the hero. Purely decorative —
 * aria-hidden, pointer-events-none, and static when the user prefers reduced
 * motion.
 */

const NODES = [
	{ x: 40, y: 60 },
	{ x: 140, y: 60 },
	{ x: 240, y: 40 },
	{ x: 240, y: 100 },
	{ x: 340, y: 60 },
	{ x: 440, y: 60 },
	{ x: 540, y: 90 },
	{ x: 640, y: 60 },
];
const EDGES: [number, number][] = [
	[0, 1],
	[1, 2],
	[1, 3],
	[2, 4],
	[3, 4],
	[4, 5],
	[5, 6],
	[5, 7],
	[6, 7],
];

export const CommitGraphBackground = () => {
	const reduced = useReducedMotion();
	const gid = useId();

	return (
		<div
			aria-hidden="true"
			className="pointer-events-none absolute inset-0 -z-10 overflow-hidden opacity-[0.08] dark:opacity-[0.12]"
		>
			<motion.svg
				viewBox="0 0 700 150"
				className="absolute left-1/2 top-16 w-[120%] max-w-none -translate-x-1/2"
				initial={false}
				animate={reduced ? undefined : { x: ["-2%", "2%", "-2%"] }}
				transition={{ duration: 24, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
			>
				<title id={gid}>Decorative commit graph</title>
				{EDGES.map(([a, b]) => (
					<line
						key={`${a}-${b}`}
						x1={NODES[a].x}
						y1={NODES[a].y}
						x2={NODES[b].x}
						y2={NODES[b].y}
						stroke="hsl(var(--foreground))"
						strokeWidth={1.5}
					/>
				))}
				{NODES.map((n, i) => (
					<motion.circle
						key={`${n.x}-${n.y}`}
						cx={n.x}
						cy={n.y}
						r={7}
						fill="hsl(var(--background))"
						stroke={i === NODES.length - 1 ? "hsl(var(--git))" : "hsl(var(--foreground))"}
						strokeWidth={2}
						initial={false}
						animate={reduced ? undefined : { opacity: [0.5, 1, 0.5] }}
						transition={{
							duration: 4,
							delay: i * 0.4,
							repeat: Number.POSITIVE_INFINITY,
							ease: "easeInOut",
						}}
					/>
				))}
			</motion.svg>
		</div>
	);
};
