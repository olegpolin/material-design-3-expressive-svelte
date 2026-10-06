<script lang="ts">
	import { Progress as ProgressPrimitive } from "bits-ui";
	import { cn, type WithoutChildrenOrChild } from "#lib/utils.js";
	import { ProgressAnimator } from "./progress-animator.svelte.js";
	import { PROGRESS, arcPath, circularIndeterminate } from "./geometry.js";

	/**
	 * M3 Expressive circular progress indicator (navigation-containment.md §17).
	 * 40dp flat / 48dp wavy (44 / 52 thick), 4dp stroke, 4dp track gap, track `secondary-container`.
	 * Indeterminate: 6000ms cycle (1080° linear spin, +90° steps every 1500ms, arc 10% ↔ 87%).
	 */
	let {
		ref = $bindable(null),
		class: className,
		style,
		value = 0,
		max = 100,
		indeterminate = false,
		wavy = false,
		thick = false,
		size,
		...restProps
	}: WithoutChildrenOrChild<ProgressPrimitive.RootProps> & {
		indeterminate?: boolean;
		/** Wavy active indicator: amplitude 1.6dp, wavelength 15dp, 1 wavelength/s. */
		wavy?: boolean;
		/** 8dp stroke. */
		thick?: boolean;
		/** Outer diameter in px. Default 40 (flat) / 48 (wavy); thick 44 / 52. */
		size?: number;
	} = $props();

	let isIndeterminate = $derived(indeterminate || value == null);
	let fraction = $derived(isIndeterminate ? 0 : Math.min(1, Math.max(0, (value ?? 0) / (max || 100))));

	const anim = new ProgressAnimator(() => ({ fraction, indeterminate: isIndeterminate, wavy }));

	const C = PROGRESS.circular;
	let t = $derived(thick ? PROGRESS.thickThickness : PROGRESS.thickness);
	let diameter = $derived(size ?? (wavy ? (thick ? C.thickWavySize : C.wavySize) : thick ? C.thickSize : C.size));
	let center = $derived(diameter / 2);
	// Stroke centre radius; the wave needs `amplitude` of headroom on the outside.
	let radius = $derived(Math.max(1, (diameter - t) / 2 - (wavy ? C.amplitude : 0)));
	// Wave count: max(5, round(2πr / wavelength)) (Compose CircularWavyProgressIndicator).
	let waves = $derived(Math.max(5, Math.round((2 * Math.PI * radius) / C.wavelength)));
	let amplitudePx = $derived(C.amplitude * anim.amplitude);
	// One wavelength per second = one full wave period per second.
	let phase = $derived(((anim.now / 1000) % 1) * 2 * Math.PI);
	// Gap in degrees: 4dp + one stroke width (round caps eat thickness/2 on each side).
	let gapDeg = $derived(((PROGRESS.trackGap + t) / radius) * (180 / Math.PI));

	let geometry = $derived.by(() => {
		let start = 0;
		let sweep = 0;
		if (isIndeterminate) {
			const s = circularIndeterminate(anim.now);
			start = s.start;
			sweep = s.sweep * 360;
		} else {
			sweep = anim.shown * 360;
		}
		const g = Math.min(sweep, gapDeg);
		const trackSweep = 360 - sweep - 2 * g;
		return {
			indicator: arcPath(center, radius, start, sweep, amplitudePx, waves, phase),
			track: trackSweep > 0 ? arcPath(center, radius, start + sweep + g, trackSweep) : "",
		};
	});
</script>

<ProgressPrimitive.Root
	bind:ref
	data-slot="circular-progress"
	data-variant={wavy ? "wavy" : "flat"}
	data-indeterminate={isIndeterminate ? "" : undefined}
	value={isIndeterminate ? null : value}
	{max}
	class={cn("relative inline-block shrink-0", className)}
	style="width: {diameter}px; height: {diameter}px; {style ?? ''}"
	{...restProps}
>
	<svg
		width={diameter}
		height={diameter}
		viewBox="0 0 {diameter} {diameter}"
		class="block size-full overflow-visible"
		aria-hidden="true"
	>
		<g fill="none" stroke-width={t} stroke-linecap="round" stroke-linejoin="round">
			{#if geometry.track}
				<path d={geometry.track} data-slot="progress-track" class="stroke-secondary-container" />
			{/if}
			{#if geometry.indicator}
				<path d={geometry.indicator} data-slot="progress-indicator" class="stroke-m3-primary" />
			{/if}
		</g>
	</svg>
</ProgressPrimitive.Root>
