/**
 * Keyline math for the M3 multi-browse and hero carousels (navigation-containment.md §14),
 * a simplified port of Compose's `Keylines.kt` / `Strategy.kt`.
 *
 * Every item is laid out at the large size and *masked* to its keyline width, so the content keeps
 * its aspect ratio. The scroll offset moves items from keyline slot to keyline slot (one slot per
 * `step = large + gap` of scroll). Leaving / entering items shrink to a 10dp anchor just outside
 * the viewport. Over the last few steps the slot sizes blend from the start arrangement
 * (`[L…, M, S]`) to the mirrored end arrangement (`[S, M, …L]`) so the last items can become large.
 */

export type KeylineLayout = "multi-browse" | "hero";

export interface Arrangement {
	/** Slot sizes at scroll start, e.g. [L, L, M, S]. */
	sizes: number[];
	/** Large item width actually used (fits the viewport exactly). */
	large: number;
	small: number;
	/** Scroll distance per item: large + gap. */
	step: number;
	/** Number of non-large slots (medium + small); these blend into the end state. */
	shift: number;
}

/** 16dp leading / trailing padding, 8dp gap, 10dp anchor (spec). */
export const CAROUSEL_PADDING = 16;
export const CAROUSEL_GAP = 8;
export const CAROUSEL_ANCHOR = 10;
/** Small item: clamp(large / 3, 40, 56). */
export const SMALL_MIN = 40;
export const SMALL_MAX = 56;

/**
 * Embla's scroll body is a discrete spring: `v += d / duration; v *= 0.68` per 1/60s step.
 * `duration = 14` is the closest fit to the spec's snap spring (stiffness 400 = StiffnessMediumLow,
 * damping ratio 1): same settle time (~0.45s), ~1.6% overshoot instead of none.
 */
export const EMBLA_SNAP_DURATION = 14;

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

export function smallSize(large: number) {
	return clamp(large / 3, SMALL_MIN, SMALL_MAX);
}

/** Pick the arrangement whose large item is closest to `preferredLarge` and fills `viewport`. */
export function arrange(layout: KeylineLayout, viewport: number, preferredLarge: number): Arrangement {
	const avail = Math.max(0, viewport - 2 * CAROUSEL_PADDING);
	const g = CAROUSEL_GAP;

	if (layout === "hero") {
		// 1 large + 1 small; the large item takes the remaining width.
		const small = smallSize(avail);
		const large = Math.max(small, avail - small - g);
		return { sizes: [large, small], large, small, step: large + g, shift: 1 };
	}

	const small = smallSize(preferredLarge);
	let best: Arrangement | null = null;
	let bestCost = Infinity;
	for (let nL = 1; nL <= 8; nL++) {
		for (const nM of [1, 0]) {
			// nL·L + nM·(L + S)/2 + S + gaps = avail
			const gaps = g * (nL + nM);
			const large = (avail - small - gaps - (nM * small) / 2) / (nL + nM / 2);
			if (large < small * 1.5) continue;
			const medium = (large + small) / 2;
			// prefer the medium slot (more expressive) when costs tie
			const cost = Math.abs(large - preferredLarge) + (nM ? 0 : 1);
			if (cost < bestCost) {
				bestCost = cost;
				const sizes = [...Array(nL).fill(large), ...(nM ? [medium] : []), small];
				best = { sizes, large, small, step: large + g, shift: nM + 1 };
			}
		}
	}
	if (!best) {
		// very narrow viewport: one large item + small
		const large = Math.max(1, avail - small - g);
		best = { sizes: [large, small], large, small, step: large + g, shift: 1 };
	}
	return best;
}

export interface ItemFrame {
	/** Left edge inside the viewport (px). */
	x: number;
	/** Mask width (px). */
	width: number;
	/** 0 … 1, how "large" the item currently is (drives label opacity). */
	largeness: number;
	visible: boolean;
}

/**
 * Frames for `count` items at scroll offset `scroll` (px, 0 = start).
 * `maxScroll` = (count − slots) · step (clamped at 0).
 */
export function frames(a: Arrangement, viewport: number, count: number, scroll: number): ItemFrame[] {
	const n = a.sizes.length;
	const maxIndex = Math.max(0, count - n);
	const f = scroll / a.step;
	// blend from start sizes to mirrored end sizes over the last `shift` steps
	const blendStart = Math.max(0, maxIndex - a.shift);
	const span = maxIndex - blendStart;
	const u = span > 0 ? clamp((f - blendStart) / span, 0, 1) : 0;
	const end = [...a.sizes].reverse();
	const sizes = a.sizes.map((s, k) => lerp(s, end[k], u));

	// slot k left edge; slot -1 / n are the 10dp anchors just outside the viewport
	const xs: number[] = [];
	let x = CAROUSEL_PADDING;
	for (let k = 0; k < n; k++) {
		xs.push(x);
		x += sizes[k] + CAROUSEL_GAP;
	}
	const slotX = (k: number) => (k < 0 ? -CAROUSEL_ANCHOR - CAROUSEL_GAP : k >= n ? viewport + CAROUSEL_GAP : xs[k]);
	const slotW = (k: number) => (k < 0 || k >= n ? CAROUSEL_ANCHOR : sizes[k]);

	const mid = (a.large + a.small) / 2;
	const out: ItemFrame[] = [];
	for (let i = 0; i < count; i++) {
		const r = clamp(i - f, -1, n);
		const k0 = Math.floor(r);
		const t = r - k0;
		const k1 = k0 + 1;
		const width = t === 0 ? slotW(k0) : lerp(slotW(k0), slotW(k1), t);
		const left = t === 0 ? slotX(k0) : lerp(slotX(k0), slotX(k1), t);
		out.push({
			x: left,
			width,
			largeness: a.large > mid ? clamp((width - mid) / (a.large - mid), 0, 1) : 1,
			visible: left + width > 0 && left < viewport,
		});
	}
	return out;
}
