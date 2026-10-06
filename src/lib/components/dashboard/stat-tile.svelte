<script lang="ts">
	import { prefersReducedMotion, Tween } from 'svelte/motion';
	import * as Card from '#lib/components/ui/card/index.js';
	import { Icon } from '#lib/components/ui/icon/index.js';
	import { Skeleton } from '#lib/components/ui/skeleton/index.js';
	import { DURATION } from '#lib/m3/motion.js';
	import { cn } from '#lib/utils.js';
	import type { Kpi } from './data.js';
	import Sparkline from './sparkline.svelte';
	import TrendChip from './trend-chip.svelte';

	/**
	 * KPI stat tile: filled card (surface-container-highest), 28dp corners, label-large metric name
	 * with an 18dp icon, display-small-emphasized value, trend chip and a bleeding sparkline.
	 * The value tweens when the period changes (emphasized-decelerate feel, skipped under reduced motion).
	 */
	let { kpi, loading = false, class: className }: { kpi: Kpi; loading?: boolean; class?: string } = $props();

	// Starts at the server-rendered value, so hydration matches; later changes animate.
	const value = Tween.of(() => kpi.value, {
		duration: () => (prefersReducedMotion.current ? 0 : DURATION.long2),
		easing: (t) => 1 - Math.pow(1 - t, 3)
	});
	const shown = $derived(value.current === kpi.value ? kpi.display : kpi.format(value.current));
</script>

<Card.Root variant="filled" shape="xl" class={cn('gap-3 pb-0 [--card-spacing:--spacing(5)]', className)} aria-busy={loading}>
	<Card.Header class="grid-cols-[1fr_auto] items-center">
		<h3 class="flex min-w-0 items-center gap-2 type-label-lg text-on-surface-variant">
			<Icon name={kpi.icon} size={18} class="shrink-0" />
			<span class="truncate">{kpi.label}</span>
		</h3>
		<Card.Action class="row-span-1">
			{#if loading}
				<Skeleton class="h-8 w-18 rounded-m3-sm bg-on-surface/10" />
			{:else}
				<TrendChip delta={kpi.delta} upIsGood={kpi.upIsGood} />
			{/if}
		</Card.Action>
	</Card.Header>
	<Card.Content class="flex flex-col gap-1">
		{#if loading}
			<Skeleton class="h-11 w-36 rounded-m3-sm bg-on-surface/10" />
			<Skeleton class="mt-1 h-4 w-24 rounded-m3-xs bg-on-surface/10" />
		{:else}
			<p class="type-display-sm-emphasized text-on-surface tabular-nums">
				<span aria-hidden="true">{shown}</span><span class="sr-only">{kpi.display}</span>
			</p>
			<p class="type-label-md text-on-surface-variant">vs previous period</p>
		{/if}
	</Card.Content>
	<div class="-mt-1">
		{#if loading}
			<Skeleton class="mx-5 mb-4 h-10 rounded-m3-md bg-on-surface/10" />
		{:else}
			<Sparkline values={kpi.spark} color={kpi.color} label="{kpi.label} trend" />
		{/if}
	</div>
</Card.Root>
