<script lang="ts" module>
	import {
		LOADING_INDICATOR_SHAPES,
		Morph,
		SHAPES,
		cubicsToSvgPath,
		materialShape,
		morphPath,
		shapePath,
	} from "#lib/m3/shapes.js";

	/** Spec (navigation-containment.md §18, typography-shape.md §6, motion.md §4). */
	export const LOADING_INDICATOR = {
		/** Container 48dp; scales 24–240dp keeping the 38/48 ratio. */
		containerSize: 48,
		indicatorSize: 38,
		morphIntervalMs: 650,
		/** spring(dampingRatio 0.6, stiffness 200, visibilityThreshold 0.1); overshoots ~9.5% at ~280ms. */
		morphSpring: { dampingRatio: 0.6, stiffness: 200 },
		quarterRotation: 90,
		globalRotationMs: 4666,
	} as const;

	/**
	 * Compose `calculateScaleFactor`: min over the shapes of max(bounds / maxBounds) so no shape
	 * clips while it rotates, then × 38/48 for the active-indicator size.
	 */
	const SCALE = (() => {
		let s = 1;
		for (const name of LOADING_INDICATOR_SHAPES) {
			const p = materialShape(name);
			const [l, t, r, b] = p.calculateBounds();
			const [ml, mt, mr, mb] = p.calculateMaxBounds();
			s = Math.min(s, Math.max((r - l) / (mr - ml), (b - t) / (mb - mt)));
		}
		return s * (LOADING_INDICATOR.indicatorSize / LOADING_INDICATOR.containerSize);
	})();

	/** Determinate: Circle pre-rotated 360°/20 = 18° → SoftBurst. Built lazily (browser only). */
	let determinateMorph: Morph | null = null;
	function determinatePath(progress: number) {
		determinateMorph ??= new Morph(SHAPES.circle().rotated(18).normalized(), materialShape("softBurst"));
		return cubicsToSvgPath(determinateMorph.asCubics(progress), { scale: 100, digits: 2 });
	}
</script>

<script lang="ts">
	import { prefersReducedMotion } from "svelte/motion";
	import { springValue } from "#lib/m3/motion.js";
	import { whileVisible } from "#lib/components/ui/progress/frame-clock.js";
	import { cn, type WithElementRef, type WithoutChildren } from "#lib/utils.js";
	import type { HTMLAttributes } from "svelte/elements";

	/**
	 * M3 Expressive loading indicator: the 7-shape morph (SoftBurst → Cookie9Sided → Pentagon →
	 * Pill → Sunny → Cookie4Sided → Oval). A morph starts every 650ms on spring ζ 0.6 / k 200
	 * (raw progress, so it overshoots ~9.5%), each adds +90°, on top of a 360°/4666ms linear spin.
	 * Pass `value` (0–`max`) for determinate. All instances share one rAF loop and only draw while
	 * on screen; each frame writes the path `d` and `transform` directly (no reactive updates).
	 */
	let {
		ref = $bindable(null),
		class: className,
		style,
		size,
		contained = false,
		value,
		max = 100,
		color,
		"aria-label": ariaLabel = "Loading",
		...restProps
	}: WithoutChildren<WithElementRef<HTMLAttributes<HTMLDivElement>>> & {
		/** Container size in px (default 48; spec range 24–240). Omit to size with `class`. */
		size?: number;
		/** Shape on a 48dp `primary-container` circle, indicator `on-primary-container`. */
		contained?: boolean;
		/** Determinate progress (0–`max`). Omit for the indeterminate morph loop. */
		value?: number;
		max?: number;
		/** Override the indicator color (any CSS color, e.g. `currentColor`). */
		color?: string;
	} = $props();

	let determinate = $derived(value != null);
	let fraction = $derived(Math.min(1, Math.max(0, (value ?? 0) / (max || 100))));

	const SHAPE_COUNT = LOADING_INDICATOR_SHAPES.length;
	const { morphIntervalMs, morphSpring, quarterRotation, globalRotationMs } = LOADING_INDICATOR;
	const FIRST_SHAPE = shapePath(LOADING_INDICATOR_SHAPES[0], 100, 2);

	function transformFor(rotation: number) {
		return `rotate(${rotation.toFixed(2)} 50 50) translate(50 50) scale(${SCALE}) translate(-50 -50)`;
	}

	// Determinate: Circle (18°) → SoftBurst by progress, rotated −progress × 180° (no animation loop).
	// Indeterminate: the template renders the first shape (SSR); the attachment animates it.
	let d = $derived(determinate ? determinatePath(fraction) : FIRST_SHAPE);
	let transform = $derived(transformFor(determinate ? -fraction * 180 : 0));

	/**
	 * Indeterminate loop, computed analytically from the elapsed time so it is frame-rate
	 * independent: step = ⌊t / 650⌋ picks the shape pair and the quarter turns, the spring
	 * value at (t mod 650) drives the morph and the extra 90°, and the global spin adds t / 4666 × 360°.
	 * Reduced motion: no morph or quarter turns (motion.md §5), only the slow global spin.
	 */
	function animate(path: SVGPathElement) {
		if (determinate) return;
		const reduced = prefersReducedMotion.current;
		if (reduced) path.setAttribute("d", FIRST_SHAPE);
		let start = -1;
		let lastStep = -1;
		return whileVisible(path, (now) => {
			if (start < 0) start = now;
			const elapsed = now - start;
			const global = ((elapsed % globalRotationMs) / globalRotationMs) * 360;
			if (reduced) {
				path.setAttribute("transform", transformFor(global));
				return;
			}
			const step = Math.floor(elapsed / morphIntervalMs);
			const progress = springValue((elapsed - step * morphIntervalMs) / 1000, morphSpring);
			const index = step % SHAPE_COUNT;
			path.setAttribute(
				"d",
				morphPath(LOADING_INDICATOR_SHAPES[index], LOADING_INDICATOR_SHAPES[(index + 1) % SHAPE_COUNT], progress, 100, 2)
			);
			path.setAttribute("transform", transformFor(progress * quarterRotation + (step % 4) * quarterRotation + global));
			if (step !== lastStep) {
				lastStep = step;
				path.dataset.shape = LOADING_INDICATOR_SHAPES[(index + 1) % SHAPE_COUNT];
			}
		});
	}
</script>

<div
	bind:this={ref}
	data-slot="loading-indicator"
	data-contained={contained ? "" : undefined}
	role="progressbar"
	aria-label={ariaLabel}
	aria-valuemin={determinate ? 0 : undefined}
	aria-valuemax={determinate ? max : undefined}
	aria-valuenow={determinate ? value : undefined}
	class={cn(
		"relative inline-grid size-12 shrink-0 place-items-center rounded-m3-full",
		// An explicit `color` (e.g. currentColor in a button) must not be overridden by the primary role.
		contained ? "bg-primary-container text-on-primary-container" : !color && "text-m3-primary",
		className
	)}
	style="{size ? `width: ${size}px; height: ${size}px; ` : ''}{style ?? ''}"
	{...restProps}
>
	<svg viewBox="0 0 100 100" class="size-full overflow-visible" aria-hidden="true">
		<path {d} {transform} fill={color ?? "currentColor"} {@attach animate} />
	</svg>
</div>
