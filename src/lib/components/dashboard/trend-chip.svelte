<script lang="ts">
	import { Icon } from '#lib/components/ui/icon/index.js';
	import { cn } from '#lib/utils.js';

	/**
	 * Non-interactive trend label shaped like an assist chip (32dp, 8dp corners): tonal tertiary
	 * container for good news, the stronger `error` role for bad news (in the baseline scheme the
	 * tertiary and error containers are both pale pinks and read alike), plus an up/down icon and
	 * screen-reader text so the meaning never rests on color alone.
	 */
	let { delta, upIsGood = true, class: className }: { delta: number; upIsGood?: boolean; class?: string } = $props();

	const up = $derived(delta >= 0);
	const good = $derived(up === upIsGood);
	const text = $derived(`${up ? '+' : '−'}${Math.abs(delta).toFixed(1)}%`);
</script>

<span
	class={cn(
		'inline-flex h-8 shrink-0 items-center gap-1 rounded-m3-sm ps-2 pe-3 type-label-lg tabular-nums',
		good ? 'bg-tertiary-container text-on-tertiary-container' : 'bg-error text-on-error',
		className
	)}
>
	<Icon name={up ? 'trending_up' : 'trending_down'} size={18} />
	{text}
	<span class="sr-only">{good ? '(improvement)' : '(decline)'} vs previous period</span>
</span>
