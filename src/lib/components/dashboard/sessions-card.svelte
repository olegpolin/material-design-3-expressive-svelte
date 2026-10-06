<script lang="ts">
	import { Area, AreaChart, LinearGradient } from 'layerchart';
	import * as Chart from '#lib/components/ui/chart/index.js';
	import { cn } from '#lib/utils.js';
	import ChartTooltip from './chart-tooltip.svelte';
	import Panel from './panel.svelte';
	import { curveMonotoneX, scaleUtc } from './d3.js';
	import { formatCompact, formatInteger, tickLabel, type RangeKey, type SessionPoint } from './data.js';

	let {
		data,
		range,
		showWeb = true,
		showMobile = true,
		loading = false,
		class: className
	}: {
		data: SessionPoint[];
		range: RangeKey;
		showWeb?: boolean;
		showMobile?: boolean;
		loading?: boolean;
		class?: string;
	} = $props();

	// Identity follows the entity: hiding one series never repaints the other.
	const config = {
		web: { label: 'Web', color: 'var(--md-sys-color-primary)' },
		mobile: { label: 'Mobile', color: 'var(--md-sys-color-tertiary)' }
	} satisfies Chart.ChartConfig;

	const series = $derived(
		[
			showWeb && { key: 'web', label: config.web.label, color: 'var(--color-web)', dashed: false },
			showMobile && { key: 'mobile', label: config.mobile.label, color: 'var(--color-mobile)', dashed: true }
		].filter((s) => !!s)
	);

	const totals = $derived({
		web: data.reduce((a, d) => a + d.web, 0),
		mobile: data.reduce((a, d) => a + d.mobile, 0)
	});
	const legend = $derived([
		{ key: 'web' as const, shown: showWeb, dashed: false },
		{ key: 'mobile' as const, shown: showMobile, dashed: true }
	]);
</script>

<Panel
	title="Sessions"
	description="Web and mobile sessions, {range === 'day' ? 'hourly' : range === 'year' ? 'monthly' : 'daily'}"
	{loading}
	class={className}
>
	<ul class="mb-3 flex flex-wrap gap-x-8 gap-y-2" aria-label="Series totals">
		{#each legend as l (l.key)}
			<li class={cn('flex items-center gap-3', !l.shown && 'opacity-38')}>
				<svg width="24" height="8" aria-hidden="true" class="shrink-0">
					<line
						x1="1"
						x2="23"
						y1="4"
						y2="4"
						stroke={config[l.key].color}
						stroke-width="3"
						stroke-linecap="round"
						stroke-dasharray={l.dashed ? '5 5' : undefined}
					/>
				</svg>
				<div class="flex flex-col">
					<span class="type-label-md text-on-surface-variant">{config[l.key].label}</span>
					<span class="type-title-lg text-on-surface tabular-nums">{formatInteger(totals[l.key])}</span>
				</div>
				{#if !l.shown}<span class="sr-only">(hidden)</span>{/if}
			</li>
		{/each}
	</ul>
	{#if series.length === 0}
		<div class="grid h-64 place-items-center rounded-m3-lg bg-surface-container type-body-md text-on-surface-variant">
			Turn on Web or Mobile to see sessions.
		</div>
	{:else}
		<Chart.Container {config} class="aspect-auto h-64 w-full min-[1200px]:h-72">
			<AreaChart
				{data}
				x="date"
				xScale={scaleUtc()}
				yNice
				yPadding={[0, 12]}
				padding={{ left: 36, bottom: 24, top: 8, right: 8 }}
				{series}
				seriesLayout="overlap"
				props={{
					xAxis: { format: (d: Date) => tickLabel(range, d), ticks: range === 'month' ? 6 : range === 'day' ? 6 : undefined },
					yAxis: { format: (v: number) => formatCompact(v), ticks: 4 },
					grid: { class: '[&_line]:stroke-outline-variant/60' },
					highlight: { points: { r: 5, class: 'stroke-surface-container-low stroke-2' } }
				}}
			>
				{#snippet marks({ context })}
					{#each context.series.visibleSeries as s (s.key)}
						{@const dashed = s.key === 'mobile'}
						<LinearGradient
							stops={[
								`color-mix(in srgb, ${s.color} ${dashed ? 14 : 30}%, transparent)`,
								`color-mix(in srgb, ${s.color} 0%, transparent)`
							]}
							vertical
						>
							{#snippet children({ gradient })}
								<Area
									seriesKey={s.key}
									curve={curveMonotoneX}
									motion="tween"
									line={{ stroke: s.color, class: cn('stroke-2', dashed && '[stroke-dasharray:6_5]') }}
									fill={gradient}
								/>
							{/snippet}
						</LinearGradient>
					{/each}
				{/snippet}
				{#snippet tooltip()}
					<ChartTooltip indicator="line" labelFormatter={(d: Date) => tickLabel(range, d, true)} />
				{/snippet}
			</AreaChart>
		</Chart.Container>
	{/if}
</Panel>
