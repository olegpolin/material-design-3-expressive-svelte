<script lang="ts">
	import { PieChart, Text } from 'layerchart';
	import * as Chart from '#lib/components/ui/chart/index.js';
	import ChartTooltip from './chart-tooltip.svelte';
	import Panel from './panel.svelte';
	import { formatCompact, formatInteger, type SourcePoint } from './data.js';

	let { data, loading = false, class: className }: { data: SourcePoint[]; loading?: boolean; class?: string } = $props();

	// Fixed categorical order, alternating dark / light tones so neighbouring arcs separate by
	// lightness; the 4th slot picks a different tertiary tone per scheme (tertiary-fixed-dim equals
	// tertiary in the dark baseline).
	const config = {
		visitors: { label: 'Visitors' },
		direct: { label: 'Direct', color: 'var(--md-sys-color-primary)' },
		organic: { label: 'Organic search', color: 'var(--md-sys-color-inverse-primary)' },
		referral: { label: 'Referral', color: 'var(--md-sys-color-tertiary)' },
		social: {
			label: 'Social',
			theme: { light: 'var(--md-sys-color-tertiary-fixed-dim)', dark: 'var(--md-sys-color-tertiary-container)' }
		}
	} satisfies Chart.ChartConfig;

	const rows = $derived(data.map((d) => ({ ...d, color: `var(--color-${d.source})` })));
	const total = $derived(data.reduce((a, d) => a + d.visitors, 0));
</script>

<Panel title="Traffic sources" description="Where visitors came from" {loading} class={className}>
	<!-- one chart scope so the legend can read the same --color-* variables -->
	<Chart.Container {config} class="aspect-auto flex-col items-center gap-4">
		<div class="aspect-square w-full max-w-60">
			<PieChart
				data={rows}
				key="source"
				label="label"
				value="visitors"
				c="color"
				innerRadius={-22}
				cornerRadius={6}
				padAngle={0.03}
				props={{ pie: { motion: 'tween' } }}
			>
				{#snippet aboveMarks()}
					<Text
						value={formatCompact(total)}
						textAnchor="middle"
						verticalAnchor="middle"
						dy={-6}
						class="fill-on-surface font-brand text-[28px]! font-medium"
					/>
					<Text
						value="visitors"
						textAnchor="middle"
						verticalAnchor="middle"
						dy={18}
						class="fill-on-surface-variant! text-xs!"
					/>
				{/snippet}
				{#snippet tooltip()}
					<ChartTooltip hideLabel nameKey="source" />
				{/snippet}
			</PieChart>
		</div>
		<ul class="flex w-full flex-col gap-2" aria-label="Traffic sources">
			{#each data as d (d.source)}
				<li class="flex min-w-0 items-center gap-2">
					<span
						class="size-3 shrink-0 rounded-m3-full"
						style:background-color="var(--color-{d.source})"
					></span>
					<span class="min-w-0 flex-1 truncate type-body-md text-on-surface-variant">{d.label}</span>
					<span class="type-label-lg text-on-surface tabular-nums" title={formatInteger(d.visitors)}>
						{Math.round((d.visitors / total) * 100)}%
					</span>
				</li>
			{/each}
		</ul>
	</Chart.Container>
</Panel>
