<script lang="ts">
	import { BarChart } from 'layerchart';
	import * as Chart from '#lib/components/ui/chart/index.js';
	import { cn } from '#lib/utils.js';
	import { CHART_CLASS } from './chart-theme.js';
	import ChartTooltip from './chart-tooltip.svelte';
	import Panel from './panel.svelte';
	import { scaleBand } from './d3.js';
	import { formatCompact, type CategoryPoint } from './data.js';

	let { data, loading = false, class: className }: { data: CategoryPoint[]; loading?: boolean; class?: string } = $props();

	// Same hue family, separated by tone: primary vs inverse-primary flips light/dark with the scheme.
	const config = {
		completed: { label: 'Completed', color: 'var(--md-sys-color-primary)' },
		open: { label: 'Open', color: 'var(--md-sys-color-inverse-primary)' }
	} satisfies Chart.ChartConfig;
</script>

<Panel title="Tasks by team" description="Completed vs open in this period" {loading} class={className}>
	<ul class="mb-3 flex gap-6" aria-label="Legend">
		{#each Object.entries(config) as [key, c] (key)}
			<li class="flex items-center gap-2 type-label-lg text-on-surface-variant">
				<span class="size-3 rounded-m3-xs" style:background-color={c.color}></span>{c.label}
			</li>
		{/each}
	</ul>
	<Chart.Container {config} class={cn('aspect-auto h-60 w-full', CHART_CLASS)}>
		<BarChart
			{data}
			x="category"
			xScale={scaleBand().padding(0.28)}
			seriesLayout="group"
			groupPadding={0.12}
			padding={{ left: 28, bottom: 24, top: 8, right: 0 }}
			series={[
				{ key: 'completed', label: config.completed.label, color: config.completed.color },
				{ key: 'open', label: config.open.label, color: config.open.color }
			]}
			props={{
				bars: { radius: 6, rounded: 'top', strokeWidth: 0, motion: 'tween' },
				yAxis: { format: (v: number) => formatCompact(v), ticks: 4 },
				highlight: { area: { class: 'fill-on-surface/8' } }
			}}
		>
			{#snippet tooltip()}
				<ChartTooltip />
			{/snippet}
		</BarChart>
	</Chart.Container>
</Panel>
