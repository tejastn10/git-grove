import { CHEAT_SHEET } from "@/content/cheatsheet";

export const CheatSheet = () => (
	<div className="grid gap-x-8 gap-y-10 sm:grid-cols-2">
		{CHEAT_SHEET.map((group) => (
			<section key={group.title}>
				<h3 className="mb-3 border-b border-border pb-1 font-mono text-xs font-bold uppercase tracking-[0.1em] text-muted-foreground">
					{group.title}
				</h3>
				<table className="w-full border-collapse text-xs">
					<tbody>
						{group.rows.map((row) => (
							<tr key={row.cmd} className="border-b border-border/60 align-top">
								<td className="py-1.5 pr-3">
									<a href={`#${row.anchor}`} className="text-foreground hover:text-git">
										<code className="whitespace-nowrap">{row.cmd}</code>
									</a>
								</td>
								<td className="py-1.5 text-muted-foreground">{row.desc}</td>
							</tr>
						))}
					</tbody>
				</table>
			</section>
		))}
	</div>
);
