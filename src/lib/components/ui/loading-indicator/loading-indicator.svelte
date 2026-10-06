<script lang="ts" module>
	import {
		LOADING_INDICATOR_SHAPES,
		Morph,
		SHAPES,
		cubicsToSvgPath,
		materialShape,
		morphPath,
	} from "#lib/m3/shapes.js";

	/** Spec (navigation-containment.md §18, typography-shape.md §6, motion.md §4). */
	export const LOADING_INDICATOR = {
		/** Container 48dp; scales 24–240dp keeping the 38/48 ratio. */
		containerSize: 48,
		indicatorSize: 38,
		morphIntervalMs: 650,
		/** spring(dampingRatio 0.6, stiffness 200, visibilityThreshold 0.1); overshoots. */
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
	import { animateSpring } from "#lib/m3/motion.js";
	import { cn, type WithElementRef, type WithoutChildren } from "#lib/utils.js";
	import type { HTMLAttributes } from "svelte/elements";

	/**
	 * M3 Expressive loading indicator: the 7-shape morph (SoftBurst → Cookie9Sided → Pentagon →
	 * Pill → Sunny → Cookie4Sided → Oval). A morph starts every 650ms on spring ζ 0.6 / k 200,
	 * each adds +90°, on top of a 360°/4666ms linear spin. Pass `value` (0–100) for determinate.
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
	let reduced = $derived(prefersReducedMotion.current);

	const SHAPE_COUNT = LOADING_INDICATOR_SHAPES.length;
	let index = $state(0);
	let morph = $state(0);
	let quarterTurns = $state(0);

	// Indeterminate loop: every 650ms snap to the next pair and spring 0 → 1 (raw, overshooting).
	$effect(() => {
		if (determinate || reduced) return;
		let cancel = () => {};
		const step = () => {
			cancel();
			cancel = animateSpring(0, 1, LOADING_INDICATOR.morphSpring, (v) => (morph = v), {
				threshold: 0.001,
				reducedMotion: false,
			});
		};
		step();
		const id = setInterval(() => {
			index = (index + 1) % SHAPE_COUNT;
			quarterTurns = (quarterTurns + 1) % 4;
			morph = 0;
			step();
		}, LOADING_INDICATOR.morphIntervalMs);
		return () => {
			clearInterval(id);
			cancel();
		};
	});

	// Reduced motion: no shape morph (motion.md §5), only the global spin.
	let progress = $derived(reduced ? 0 : morph);
	let d = $derived(
		determinate
			? determinatePath(fraction)
			: morphPath(LOADING_INDICATOR_SHAPES[index], LOADING_INDICATOR_SHAPES[(index + 1) % SHAPE_COUNT], progress, 100, 2)
	);
	// Drawn rotation = morph × 90° + accumulated quarter turns (+ the CSS global spin);
	// determinate rotates −progress × 180° (counter-clockwise).
	let rotation = $derived(
		determinate ? -fraction * 180 : progress * LOADING_INDICATOR.quarterRotation + quarterTurns * LOADING_INDICATOR.quarterRotation
	);
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
		contained ? "bg-primary-container text-on-primary-container" : "text-m3-primary",
		className
	)}
	style="{size ? `width: ${size}px; height: ${size}px; ` : ''}{style ?? ''}"
	{...restProps}
>
	<svg
		viewBox="0 0 100 100"
		class={cn("size-full overflow-visible", !determinate && "m3-loading-spin")}
		aria-hidden="true"
	>
		<path
			{d}
			fill={color ?? "currentColor"}
			transform="rotate({rotation} 50 50) translate(50 50) scale({SCALE}) translate(-50 -50)"
		/>
	</svg>
</div>

<style>
	/* Global rotation: 0 → 360° linear, 4666ms, infinite. Kept under reduced motion (the morph stops). */
	.m3-loading-spin {
		animation: m3-loading-spin 4666ms linear infinite;
	}
	@keyframes m3-loading-spin {
		to {
			rotate: 360deg;
		}
	}
</style>
