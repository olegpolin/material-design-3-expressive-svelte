<script lang="ts">
	import { cn, type WithElementRef, type WithoutChildren } from "#lib/utils.js";
	import type { HTMLAttributes } from "svelte/elements";

	/**
	 * M3 skeleton placeholder. `on-surface` at 10% (not a surface role), so it stays visible on every
	 * container: surface, surface-container-low … highest (filled cards), and in dark mode.
	 * Default corner small (8dp); pass `rounded-m3-full` / `rounded-m3-xs` … for avatars and lines.
	 * A subtle synchronized opacity pulse (all skeletons breathe together); slower under reduced motion.
	 * Content should fade in quickly once loaded (motion.md §4.1).
	 */
	let {
		ref = $bindable(null),
		class: className,
		...restProps
	}: WithoutChildren<WithElementRef<HTMLAttributes<HTMLDivElement>>> = $props();

	/** Pin the pulse to the document timeline so skeletons mounted at different times stay in phase. */
	function syncPulse(el: HTMLElement) {
		for (const animation of el.getAnimations()) animation.startTime = 0;
	}
</script>

<div
	bind:this={ref}
	data-slot="skeleton"
	aria-hidden="true"
	class={cn("m3-skeleton rounded-m3-sm bg-on-surface/10", className)}
	{...restProps}
	{@attach syncPulse}
></div>

<style>
	.m3-skeleton {
		animation: m3-skeleton-pulse 2s var(--md-sys-motion-easing-standard) infinite;
	}
	@keyframes m3-skeleton-pulse {
		50% {
			opacity: 0.5;
		}
	}
	@media (prefers-reduced-motion: reduce) {
		.m3-skeleton {
			animation-duration: 4s;
		}
	}
</style>
