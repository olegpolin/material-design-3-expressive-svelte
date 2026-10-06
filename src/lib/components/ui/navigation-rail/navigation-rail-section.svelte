<script lang="ts">
	import type { HTMLLiAttributes } from 'svelte/elements';
	import { springCss } from '#lib/m3/motion.js';
	import { cn, type WithElementRef } from '#lib/utils.js';
	import { getNavigationRailContext } from './context.js';

	/**
	 * Group of rail items with a section label. The label (title-small, on-surface-variant, 56dp row,
	 * aligned with the item icons) is shown only in the expanded rail; it collapses to 0 height
	 * (defaultSpatial) and fades (defaultEffects) when the rail collapses.
	 */
	let {
		ref = $bindable(null),
		label,
		class: className,
		children,
		...restProps
	}: WithElementRef<HTMLLiAttributes> & { label?: string } = $props();

	const ctx = getNavigationRailContext();
	let expanded = $derived(ctx.expanded);
</script>

<li bind:this={ref} data-slot="navigation-rail-section" class={cn('flex flex-col', className)} {...restProps}>
	{#if label}
		<div
			aria-hidden={expanded ? undefined : 'true'}
			class={cn('grid', expanded ? 'opacity-100' : 'opacity-0')}
			style:grid-template-rows={expanded ? '1fr' : '0fr'}
			style:transition="grid-template-rows {springCss('default-spatial').transition}, opacity {springCss(
				'default-effects'
			).transition}"
		>
			<div class="overflow-hidden">
				<span
					data-rail-measure="0"
					class="type-title-sm flex h-14 items-center truncate ps-9 pe-5 text-on-surface-variant"
				>
					{label}
				</span>
			</div>
		</div>
	{/if}
	<ul
		class="flex flex-col"
		style:gap={expanded ? '0px' : '4px'}
		style:transition="gap {springCss('default-spatial').transition}"
	>
		{@render children?.()}
	</ul>
</li>
