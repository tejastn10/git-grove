import type { CSSProperties, FC, ReactNode } from "react";
import { cx } from "@/utils/tailwind";

type BlurFadeProps = {
	children: ReactNode;
	className?: string;
	/** Extra delay (seconds) before the reveal. */
	delay?: number;
	/** Vertical travel distance in px. */
	yOffset?: number;
	blur?: string;
	duration?: number;
	/** Kept for API compatibility; the reveal always runs on mount. */
	inView?: boolean;
};

/**
 * Blur + slide-up entrance. Pure CSS: a one-shot `@keyframes` (see globals.css)
 * with `animation-fill-mode: both`. If CSS animations are unavailable or the
 * reader prefers reduced motion, the content simply renders in place — it is
 * never gated behind JS state, so a section can't get stuck invisible.
 */
export const BlurFade: FC<BlurFadeProps> = ({
	children,
	className,
	delay = 0,
	yOffset = 8,
	blur = "6px",
	duration = 0.4,
}) => {
	const style = {
		"--bf-duration": `${duration}s`,
		"--bf-delay": `${0.04 + delay}s`,
		"--bf-y": `${yOffset}px`,
		"--bf-blur": blur,
	} as CSSProperties;

	return (
		<div className={cx("blur-fade", className)} style={style}>
			{children}
		</div>
	);
};
