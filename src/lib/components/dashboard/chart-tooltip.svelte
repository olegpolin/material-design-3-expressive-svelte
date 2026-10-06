<script lang="ts">
	import type { ComponentProps } from 'svelte';
	import type { Tooltip } from 'layerchart';
	import * as Chart from '#lib/components/ui/chart/index.js';
	import { cn } from '#lib/utils.js';
	import { formatInteger } from './data.js';

	/**
	 * shadcn `Chart.Tooltip` restyled as an M3 rich-tooltip surface: surface-container-high, 12dp
	 * corners, level 2, label-large heading, body-small rows with tabular numbers. Rows are rendered
	 * here so each swatch repeats the mark's encoding (dot for bars / arcs, solid or dashed line for
	 * lines) and the value is formatted consistently.
	 */
	let {
		class: className,
		labelClassName,
		swatch = 'dot',
		dashed = [],
		valueFormat = formatInteger,
		names = {},
		...restProps
	}: Omit<ComponentProps<typeof Chart.Tooltip>, 'formatter' | 'indicator'> & {
		swatch?: 'dot' | 'line';
		/** Series keys drawn with a dashed line. */
		dashed?: string[];
		valueFormat?: (v: number) => string;
		/** Display names by series / slice key (pie slices otherwise show their raw key). */
		names?: Record<string, string>;
	} = $props();
</script>

{#snippet row({
	value,
	name,
	item
}: {
	value: unknown;
	name: string;
	item: Tooltip.TooltipSeries;
	index: number;
	payload: Tooltip.TooltipSeries[];
})}
	<span class="flex w-full items-center gap-2">
		{#if swatch === 'line'}
			<svg width="16" height="4" aria-hidden="true" class="shrink-0 overflow-visible">
				<line
					x1="1"
					x2="15"
					y1="2"
					y2="2"
					stroke={item.color}
					stroke-width="3"
					stroke-linecap="round"
					stroke-dasharray={dashed.includes(item.key) ? '3 4' : undefined}
				/>
			</svg>
		{:else}
			<span class="size-2.5 shrink-0 rounded-m3-full" style:background-color={item.color}></span>
		{/if}
		<span class="flex-1 text-on-surface-variant">{names[item.key] ?? name}</span>
		<span class="ms-4 type-label-lg text-on-surface tabular-nums">
			{typeof value === 'number' ? valueFormat(value) : String(value)}
		</span>
	</span>
{/snippet}

<Chart.Tooltip
	class={cn(
		'min-w-40 gap-2 rounded-m3-md border-0 bg-surface-container-high px-3 py-2 text-on-surface shadow-m3-2 type-body-sm',
		className
	)}
	labelClassName={cn('type-label-lg text-on-surface', labelClassName)}
	formatter={row}
	{...restProps}
/>
