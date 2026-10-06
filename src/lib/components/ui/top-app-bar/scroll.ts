/** Scroll helpers shared by the app bars and toolbars. */

export type ScrollTarget = HTMLElement | Window;

/** Nearest ancestor that scrolls vertically (overflow-y auto/scroll/overlay), else `window`. */
export function findScrollParent(node: Element | null, axis: 'y' | 'x' = 'y'): ScrollTarget {
	let el = node?.parentElement ?? null;
	while (el && el !== document.body && el !== document.documentElement) {
		const style = getComputedStyle(el);
		const overflow = axis === 'y' ? style.overflowY : style.overflowX;
		if (/(auto|scroll|overlay)/.test(overflow)) return el;
		el = el.parentElement;
	}
	return window;
}

export function getScrollTop(target: ScrollTarget) {
	return target instanceof Window ? target.scrollY : target.scrollTop;
}

export function setScrollTop(target: ScrollTarget, top: number) {
	if (target instanceof Window) target.scrollTo({ top, behavior: 'instant' });
	else target.scrollTop = top;
}

/** Evaluate a CSS cubic-bezier(x1, y1, x2, y2) easing at progress `t` (Newton + bisection). */
export function cubicBezier(x1: number, y1: number, x2: number, y2: number) {
	const bez = (t: number, a: number, b: number) => 3 * a * t * (1 - t) ** 2 + 3 * b * t * t * (1 - t) + t ** 3;
	const dBez = (t: number, a: number, b: number) =>
		3 * a * (1 - t) ** 2 + 6 * (b - a) * t * (1 - t) + 3 * (1 - b) * t * t;
	return (x: number) => {
		if (x <= 0) return 0;
		if (x >= 1) return 1;
		let t = x;
		for (let i = 0; i < 6; i++) {
			const d = dBez(t, x1, x2);
			if (Math.abs(d) < 1e-6) break;
			t -= (bez(t, x1, x2) - x) / d;
		}
		if (t < 0 || t > 1 || Math.abs(bez(t, x1, x2) - x) > 1e-4) {
			let lo = 0;
			let hi = 1;
			t = x;
			for (let i = 0; i < 30; i++) {
				const v = bez(t, x1, x2);
				if (Math.abs(v - x) < 1e-5) break;
				if (v < x) lo = t;
				else hi = t;
				t = (lo + hi) / 2;
			}
		}
		return bez(t, y1, y2);
	};
}

/** Compose `TopTitleAlphaEasing` = CubicBezierEasing(.8, 0, .8, .15) (navigation-containment.md §4). */
export const topTitleAlphaEasing = cubicBezier(0.8, 0, 0.8, 0.15);
/** Compose `FastOutLinearInEasing` = (.4, 0, 1, 1), used for the two-row app bar color lerp. */
export const fastOutLinearIn = cubicBezier(0.4, 0, 1, 1);
