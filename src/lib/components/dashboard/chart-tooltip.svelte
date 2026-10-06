<script lang="ts">
	import type { ComponentProps } from 'svelte';
	import * as Chart from '#lib/components/ui/chart/index.js';
	import { cn } from '#lib/utils.js';

	/**
	 * shadcn `Chart.Tooltip` restyled as an M3 plain/rich tooltip surface: surface-container-high,
	 * 12dp corners, level 2, label-large heading, body-small rows with tabular numbers.
	 */
	let { class: className, labelClassName, ...restProps }: ComponentProps<typeof Chart.Tooltip> = $props();
</script>

<Chart.Tooltip
	class={cn(
		'min-w-36 gap-2 rounded-m3-md border-0 bg-surface-container-high px-3 py-2 text-on-surface shadow-m3-2 type-body-sm',
		'[&_.font-mono]:font-plain [&_.font-mono]:text-on-surface [&_.text-muted-foreground]:text-on-surface-variant',
		className
	)}
	labelClassName={cn('type-label-lg text-on-surface', labelClassName)}
	{...restProps}
/>
