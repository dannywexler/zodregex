import type { z } from "zod";

export function zodRegex<Groups extends CaptureGroups>(
	groupSchema: Groups,
	regex: RegExp,
	...alternateRegexes: Array<RegExp>
) {
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
			z.input<Groups>,
			z.output<Groups>
		>;
		if (!res.success) {
			return null;
		}
		return res.data;
	};
}

export type CaptureGroups = z.ZodType<Record<string, unknown>>;
