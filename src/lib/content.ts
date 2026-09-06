import fs from "node:fs";
import path from "node:path";
import rehypeShiki from "@shikijs/rehype";
import matter from "gray-matter";
import rehypeSlug from "rehype-slug";
import rehypeStringify from "rehype-stringify";
import remarkGfm from "remark-gfm";
import { remarkAlert } from "remark-github-blockquote-alert";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import { unified } from "unified";

const CONTENT_ROOT = path.join(process.cwd(), "src", "content");

const processor = unified()
	.use(remarkParse)
	.use(remarkGfm)
	// GitHub-style alert blockquotes: `> [!WARNING]` becomes a styled callout.
	// We lean on this for every "gotcha" box in the guide.
	.use(remarkAlert)
	.use(remarkRehype)
	// Adds `id` slugs to headings — the sidebar scroll-spy relies on these.
	.use(rehypeSlug)
	.use(rehypeShiki, {
		// Dual theme: Shiki emits `--shiki-light` / `--shiki-dark` custom
		// properties per token and globals.css picks the right one per color
		// scheme (see the `.shiki` rules there).
		themes: { light: "github-light", dark: "github-dark" },
		defaultColor: false,
	})
	.use(rehypeStringify);

/** Compile a Markdown/MDX-ish string to an HTML string. */
export const compileMarkdown = async (markdown: string): Promise<string> => {
	const file = await processor.process(markdown);
	return String(file);
};

export type LoadedDoc = {
	html: string;
	data: Record<string, unknown>;
};

/**
 * Read a content file relative to `src/content` (extension optional) and return
 * compiled HTML plus its frontmatter.
 */
export const loadDoc = async (relPath: string): Promise<LoadedDoc> => {
	const withExt = relPath.endsWith(".mdx") || relPath.endsWith(".md") ? relPath : `${relPath}.mdx`;
	const full = path.join(CONTENT_ROOT, withExt);
	const raw = fs.readFileSync(full, "utf-8");
	const { content, data } = matter(raw);
	const html = await compileMarkdown(content);
	return { html, data };
};
