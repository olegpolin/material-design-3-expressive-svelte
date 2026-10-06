<script lang="ts">
	import { Area, AreaChart, LinearGradient } from 'layerchart';
	import * as Chart from '#lib/components/ui/chart/index.js';
	import { curveMonotoneX } from './d3.js';

	/** Decorative trend line for a stat tile (the tile's number carries the information). */
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
		padding={{ top: 4, bottom: 2, left: 0, right: 0 }}
		yPadding={[8, 0]}
		series={[{ key: 'v', label, color: 'var(--color-v)' }]}
	>
		{#snippet marks({ context })}
			{#each context.series.visibleSeries as s (s.key)}
				<LinearGradient stops={[`color-mix(in srgb, ${s.color} 32%, transparent)`, `color-mix(in srgb, ${s.color} 0%, transparent)`]} vertical>
					{#snippet children({ gradient })}
						<Area
							seriesKey={s.key}
							curve={curveMonotoneX}
							line={{ class: 'stroke-2', stroke: s.color }}
							fill={gradient}
						/>
					{/snippet}
				</LinearGradient>
			{/each}
		{/snippet}
	</AreaChart>
</Chart.Container>
