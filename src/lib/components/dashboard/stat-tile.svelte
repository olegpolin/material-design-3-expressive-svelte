<script lang="ts">
	import * as Card from '#lib/components/ui/card/index.js';
	import { Icon } from '#lib/components/ui/icon/index.js';
	import { Skeleton } from '#lib/components/ui/skeleton/index.js';
	import { cn } from '#lib/utils.js';
	import type { Kpi } from './data.js';
	import Sparkline from './sparkline.svelte';
	import TrendChip from './trend-chip.svelte';

	let { kpi, loading = false, class: className }: { kpi: Kpi; loading?: boolean; class?: string } = $props();
</script>

<Card.Root variant="filled" shape="xl" class={cn('gap-3 pb-0 [--card-spacing:--spacing(5)]', className)} aria-busy={loading}>
	<Card.Header class="grid-cols-[1fr_auto] items-center">
		<h3 class="flex items-center gap-2 type-label-md text-on-surface-variant uppercase">
			<Icon name={kpi.icon} size={18} class="text-on-surface-variant" />
			{kpi.label}
		</h3>
		<Card.Action class="row-span-1">
			{#if loading}
				<Skeleton class="bg-on-surface/10 h-8 w-18 rounded-m3-sm" />
			{:else}
				<TrendChip delta={kpi.delta} upIsGood={kpi.upIsGood} />
			{/if}
		</Card.Action>
	</Card.Header>
	<Card.Content class="flex flex-col gap-1">
		{#if loading}
			<Skeleton class="bg-on-surface/10 h-11 w-36 rounded-m3-sm" />
			<Skeleton class="bg-on-surface/10 mt-1 h-4 w-24 rounded-m3-xs" />
		{:else}
			<p class="type-display-sm-emphasized text-on-surface tabular-nums">{kpi.display}</p>
			<p class="type-body-sm text-on-surface-variant">vs previous period</p>
		{/if}
	</Card.Content>
	<div class="-mt-1 px-0">
		{#if loading}
			<Skeleton class="bg-on-surface/10 mx-5 mb-4 h-10 rounded-m3-md" />
		{:else}
			<Sparkline values={kpi.spark} color={kpi.color} label="{kpi.label} trend" />
		{/if}
	</div>
</Card.Root>
