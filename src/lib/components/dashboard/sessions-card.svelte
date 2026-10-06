<script lang="ts">
	import { Area, AreaChart, LinearGradient } from 'layerchart';
	import * as Chart from '#lib/components/ui/chart/index.js';
	import { cn } from '#lib/utils.js';
	import { CHART_CLASS, fadeStops } from './chart-theme.js';
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

	// Identity follows the entity: hiding one series never repaints the other. Web = primary, solid
	// line + 20% fill; Mobile = tertiary, dashed line + a fainter fill (lightness + pattern, not hue only).
	const config = {
		web: { label: 'Web', color: 'var(--md-sys-color-primary)' },
		mobile: { label: 'Mobile', color: 'var(--md-sys-color-tertiary)' }
	} satisfies Chart.ChartConfig;

	const series = $derived(
		[
			showWeb && { key: 'web', label: config.web.label, color: config.web.color },
			showMobile && { key: 'mobile', label: config.mobile.label, color: config.mobile.color }
		].filter((s) => !!s)
	);

	// Explicit ticks on real data points (auto ticks put two "Wed" labels on a 7-day UTC scale),
	// thinned on narrow charts so labels never collide.
	let width = $state(0);
	const xTicks = $derived.by(() => {
		const narrow = width > 0 && width < 480;
		const every = range === 'day' ? (narrow ? 6 : 3) : range === 'week' ? 1 : range === 'month' ? 7 : narrow ? 3 : 1;
		const last = data.length - 1;
		// anchor on the newest point so the most recent label is always shown
		return data.filter((_, i) => (last - i) % every === 0).map((d) => d.date);
	});

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
	<ul class="mb-3 flex flex-wrap gap-x-8 gap-y-2" aria-label="Series totals" bind:clientWidth={width}>
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
		<!-- a new range changes the point count; tweening between unequal paths scribbles, so the
		     chart is rebuilt per range (moving the end date keeps the count and tweens) -->
		{#key range}
			<Chart.Container {config} class={cn('aspect-auto h-64 w-full min-[1200px]:h-72', CHART_CLASS)}>
				<AreaChart
					{data}
					x="date"
					xScale={scaleUtc()}
					yNice={4}
					yPadding={[0, 12]}
					padding={{ left: 36, bottom: 24, top: 8, right: 16 }}
					{series}
					seriesLayout="overlap"
					props={{
						xAxis: { format: (d: Date) => tickLabel(range, d), ticks: xTicks },
						// the 0 baseline is implied by the area; leaving it unlabeled keeps it off the first x label
						yAxis: { format: (v: number) => (v === 0 ? '' : formatCompact(v)), ticks: 4 },
						highlight: { points: { r: 5, class: 'stroke-surface-container-low stroke-2' } }
					}}
				>
					{#snippet marks({ context })}
						{#each context.series.visibleSeries as s (s.key)}
							{@const dashed = s.key === 'mobile'}
							<LinearGradient stops={fadeStops(s.color ?? '', dashed ? 8 : 20)} vertical>
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
						<ChartTooltip swatch="line" dashed={['mobile']} labelFormatter={(d: Date) => tickLabel(range, d, true)} />
					{/snippet}
				</AreaChart>
			</Chart.Container>
		{/key}
	{/if}
</Panel>
