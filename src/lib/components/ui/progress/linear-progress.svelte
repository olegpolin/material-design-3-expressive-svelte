<script lang="ts">
	import { Progress as ProgressPrimitive } from "bits-ui";
	import { cn, type WithoutChildrenOrChild } from "#lib/utils.js";
	import { ProgressAnimator } from "./progress-animator.svelte.js";
	import { PROGRESS, linearIndeterminateLines, linearSegmentPath } from "./geometry.js";

	/**
	 * M3 Expressive linear progress indicator (navigation-containment.md §17).
	 * Flat or wavy, determinate (`value` 0–`max`) or indeterminate (`indeterminate` or `value={null}`).
	 * Track `secondary-container`, active indicator + stop `primary`, 4dp gap, 4dp stop dot.
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
		...restProps
	}: WithoutChildrenOrChild<ProgressPrimitive.RootProps> & {
		/** Indeterminate animation (1750ms two-line cycle). Also implied by `value={null}`. */
		indeterminate?: boolean;
		/** Wavy active indicator: amplitude 3dp, wavelength 40dp (20dp indeterminate), 1 wavelength/s. */
		wavy?: boolean;
		/** 8dp track/indicator instead of 4dp (wavy container 14dp). */
		thick?: boolean;
	} = $props();

	let isIndeterminate = $derived(indeterminate || value == null);
	let fraction = $derived(isIndeterminate ? 0 : Math.min(1, Math.max(0, (value ?? 0) / (max || 100))));

	const anim = new ProgressAnimator(() => ({ fraction, indeterminate: isIndeterminate, wavy }));

	let width = $state(0);
	let t = $derived(thick ? PROGRESS.thickThickness : PROGRESS.thickness);
	let amplitudePx = $derived(PROGRESS.linear.amplitude * anim.amplitude);
	// Wavy container = 2 × amplitude + thickness (10dp / 14dp thick); flat = thickness.
	let height = $derived(wavy ? 2 * PROGRESS.linear.amplitude + t : t);
	let wavelength = $derived(isIndeterminate ? PROGRESS.linear.indeterminateWavelength : PROGRESS.linear.wavelength);
	// The wave travels one wavelength per second.
	let phase = $derived(((anim.now / 1000) * wavelength) % wavelength);

	let geometry = $derived.by(() => {
		const W = width;
		const mid = height / 2;
		const cap = t / 2;
		const gap = PROGRESS.trackGap;
		// Stable ids per slot so the DOM paths are reused frame to frame.
		const indicator: { id: string; d: string }[] = [];
		const track: { id: string; d: string }[] = [];
		const add = (list: typeof track, d: string) => d && list.push({ id: `${list.length}`, d });
		let stop: { cx: number; r: number } | null = null;
		if (W <= 0) return { indicator, track, stop, mid };

		if (isIndeterminate) {
			const segs = linearIndeterminateLines(anim.now)
				.map(([tail, head]) => [tail * W, head * W] as const)
				.filter(([a, b]) => b - a > 0.5)
				.sort((x, y) => x[0] - y[0]);
			let cursor = 0;
			for (const [a, b] of segs) {
				add(indicator, linearSegmentPath(a, Math.max(b, a + t), mid, cap, amplitudePx, wavelength, phase));
				if (a - gap > cursor) add(track, linearSegmentPath(cursor, a - gap, mid, cap));
				cursor = Math.max(b, a + t) + gap;
			}
			if (cursor < W) add(track, linearSegmentPath(cursor, W, mid, cap));
		} else {
			const p = anim.shown;
			const end = p > 0 ? Math.max(p * W, t) : 0;
			if (p > 0) add(indicator, linearSegmentPath(0, end, mid, cap, amplitudePx, wavelength, phase));
			const trackStart = p > 0 ? end + gap : 0;
			if (trackStart < W) {
				add(track, linearSegmentPath(trackStart, W, mid, cap));
				// Stop indicator: 4dp dot centred thickness/2 from the end (2dp trailing space when thick);
				// it shrinks once the track gets shorter than the dot.
				const room = W - trackStart;
				const r = Math.min(PROGRESS.stopSize / 2, room / 2);
				if (r > 0.25) stop = { cx: W - Math.max(cap, r), r };
			}
		}
		return { indicator, track, stop, mid };
	});
</script>

<ProgressPrimitive.Root
	bind:ref
	data-slot="progress"
	data-variant={wavy ? "wavy" : "flat"}
	data-indeterminate={isIndeterminate ? "" : undefined}
	value={isIndeterminate ? null : value}
	{max}
	class={cn("relative block w-full min-w-10", className)}
	style="height: {height}px; {style ?? ''}"
	{...restProps}
>
	<div class="size-full" bind:clientWidth={width}>
		{#if width > 0}
			<svg
				width={width}
				height={height}
				viewBox="0 0 {width} {height}"
				class="block overflow-visible"
				aria-hidden="true"
			>
				<g fill="none" stroke-width={t} stroke-linecap="round" stroke-linejoin="round">
					{#each geometry.track as seg (seg.id)}
						<path d={seg.d} data-slot="progress-track" class="stroke-secondary-container" />
					{/each}
					{#each geometry.indicator as seg (seg.id)}
						<path d={seg.d} data-slot="progress-indicator" class="stroke-m3-primary" />
					{/each}
				</g>
				{#if geometry.stop}
					<circle
						data-slot="progress-stop"
						cx={geometry.stop.cx}
						cy={geometry.mid}
						r={geometry.stop.r}
						class="fill-m3-primary"
					/>
				{/if}
			</svg>
		{/if}
	</div>
</ProgressPrimitive.Root>
