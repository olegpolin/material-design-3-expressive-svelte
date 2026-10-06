import { createCn } from "cn/config";

/**
 * `cn` configured so the M3 token utilities from `src/routes/layout.css`
 * take part in Tailwind conflict resolution. Without this, a class such as
 * `rounded-m3-full` passed by a consumer would not replace a component's
 * default `rounded-md`.
 */
const isM3 = (value: string) => value.startsWith("m3-");
const isSpring = (value: string) => value.startsWith("spring-");
const isTypeScale = (value: string) =>
	/^(display|headline|title|body|label)-(lg|md|sm)(-emphasized)?$/.test(value);

export const cn = createCn({
	extend: {
		theme: {
			radius: [isM3],
			shadow: [isM3],
			text: [isTypeScale],
			ease: [isM3, isSpring],
		},
		classGroups: {
			duration: [{ duration: [isM3, isSpring] }],
			// `type-*` sets family + size + weight + tracking; treat them as one group.
			"m3-type": [{ type: [isTypeScale] }],
		},
		conflictingClassGroups: {
			"m3-type": ["font-size", "font-family", "font-weight", "tracking", "leading"],
			"font-size": ["m3-type"],
		},
	},
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type WithoutChild<T> = T extends { child?: any } ? Omit<T, "child"> : T;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type WithoutChildren<T> = T extends { children?: any } ? Omit<T, "children"> : T;
export type WithoutChildrenOrChild<T> = WithoutChildren<WithoutChild<T>>;
export type WithElementRef<T, U extends HTMLElement = HTMLElement> = T & { ref?: U | null };
