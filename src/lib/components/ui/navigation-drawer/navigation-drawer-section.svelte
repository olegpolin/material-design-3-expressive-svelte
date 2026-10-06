<script lang="ts">
	import type { HTMLLiAttributes } from 'svelte/elements';
	import { Separator as SeparatorPrimitive } from 'bits-ui';
	import { cn, type WithElementRef } from '#lib/utils.js';

	/**
	 * Drawer section: optional 1dp outline-variant divider (inset 28dp from both drawer edges, §3 / §13)
	 * and a section headline (title-small, on-surface-variant, 56dp row, 28dp start inset).
	 */
	let {
		ref = $bindable(null),
		headline,
		divider = true,
		class: className,
		children,
		...restProps
	}: WithElementRef<HTMLLiAttributes> & {
		headline?: string;
		/** Draw a divider above the section. */
		divider?: boolean;
	} = $props();
</script>

<li bind:this={ref} data-slot="navigation-drawer-section" class={cn('flex flex-col', className)} {...restProps}>
	{#if divider}
		<SeparatorPrimitive.Root decorative class="mx-4 my-2 h-px shrink-0 bg-outline-variant" />
	{/if}
	{#if headline}
		<span class="type-title-sm flex h-14 items-center px-4 text-on-surface-variant">{headline}</span>
	{/if}
	<ul class="flex flex-col">
		{@render children?.()}
	</ul>
</li>
