"use client";

import { useTheme } from "next-themes";
import { type FC, useEffect, useState } from "react";
import { Icons } from "../icons/Icons";
import { Button } from "../ui/Button";

const ThemeToggle: FC = () => {
	const { resolvedTheme, setTheme } = useTheme();
	const [mounted, setMounted] = useState(false);

	useEffect(() => setMounted(true), []);

	const isDark = resolvedTheme === "dark";

	return (
		<Button
			variant="ghost"
			type="button"
			size="icon"
			aria-label="Toggle color theme"
			className="size-8 cursor-pointer"
			onClick={() => setTheme(isDark ? "light" : "dark")}
		>
			{mounted && isDark ? <Icons.moon className="size-4" /> : <Icons.sun className="size-4" />}
		</Button>
	);
};

export { ThemeToggle };
