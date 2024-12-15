import type { z } from "zod";

export function zodRegex<
	GroupSchema extends z.ZodType<Record<string, unknown>>,
>(groupSchema: GroupSchema, regex: RegExp, ...alternateRegexes: Array<RegExp>) {
	const allRegexes = [regex, ...alternateRegexes];
	return (testString: string) => {
		let match: RegExpMatchArray | null = null;
		for (const reg of allRegexes) {
			match = testString.match(reg);
			if (match) {
				break;
			}
		}
		if (!match) {
			return null;
		}
		const { groups } = match;
		if (!groups) {
			return null;
		}
		const res = groupSchema.safeParse(groups) as z.SafeParseReturnType<
			z.input<GroupSchema>,
			z.output<GroupSchema>
		>;
		if (!res.success) {
			return null;
		}
		return res.data;
	};
}
