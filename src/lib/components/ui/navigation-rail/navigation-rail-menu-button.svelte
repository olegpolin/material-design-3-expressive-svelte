<script lang="ts">
	import type { HTMLButtonAttributes } from 'svelte/elements';
	import { Icon } from '#lib/components/ui/icon/index.js';
	import { ripple } from '#lib/m3/ripple.svelte.js';
	import { cn, type WithElementRef } from '#lib/utils.js';
	import { getNavigationRailContext } from './context.js';

	/**
	 * Rail header menu button: standard icon button (40dp container, 48dp target, 24dp icon,
	 * on-surface-variant) that toggles the rail. Its icon sits at x = 36dp like the item icons.
	 */
	let {
		ref = $bindable(null),
		icon,
		class: className,
		onclick,
		...restProps
	}: WithElementRef<HTMLButtonAttributes> & {
		/** Defaults to `menu` / `menu_open`. */
		icon?: string;
	} = $props();

	const ctx = getNavigationRailContext();
</script>

<button
	bind:this={ref}
	type="button"
	data-slot="navigation-rail-menu-button"
	aria-label={ctx.expanded ? 'Collapse navigation' : 'Expand navigation'}
	aria-expanded={ctx.expanded}
	class={cn(
		'relative ms-7 my-1 grid size-10 shrink-0 place-items-center rounded-m3-full text-on-surface-variant',
		'after:absolute after:-inset-1',
		className
	)}
	onclick={(e) => {
		onclick?.(e);
		if (!e.defaultPrevented) ctx.toggle();
	}}
	{@attach ripple()}
	{...restProps}
>
	<Icon name={icon ?? (ctx.expanded ? 'menu_open' : 'menu')} />
</button>
