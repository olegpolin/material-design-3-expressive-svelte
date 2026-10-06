<script lang="ts">
	import { Area, AreaChart, LinearGradient } from 'layerchart';
	import * as Chart from '#lib/components/ui/chart/index.js';
	import { fadeStops } from './chart-theme.js';
	import { curveMonotoneX } from './d3.js';

	/**
	 * Decorative trend line for a stat tile (the tile's number carries the information): a 2dp line
	 * in the metric's role color over a 12% → 0 area fill of the same color.
	 */
	let { values, color, label }: { values: number[]; color: string; label: string } = $props();

	const data = $derived(values.map((v, i) => ({ i, v })));
	const config = $derived({ v: { label, color } } satisfies Chart.ChartConfig);
</script>

<Chart.Container {config} class="aspect-auto h-14 w-full" aria-hidden="true">
	<AreaChart
		{data}
		x="i"
		y="v"
		axis={false}
		grid={false}
		rule={false}
		tooltipContext={false}
		highlight={false}
		padding={{ top: 4, bottom: 0, left: 0, right: 0 }}
		yPadding={[8, 0]}
		series={[{ key: 'v', label, color }]}
	>
		{#snippet marks({ context })}
			{#each context.series.visibleSeries as s (s.key)}
				<LinearGradient stops={fadeStops(color, 12)} vertical>
					{#snippet children({ gradient })}
						<Area seriesKey={s.key} curve={curveMonotoneX} line={{ class: 'stroke-2', stroke: color }} fill={gradient} />
					{/snippet}
				</LinearGradient>
			{/each}
		{/snippet}
	</AreaChart>
</Chart.Container>
