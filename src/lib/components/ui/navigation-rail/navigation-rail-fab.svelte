<script lang="ts" module>
	export type NavigationRailFabColor = 'primary' | 'secondary' | 'tertiary';
</script>

<script lang="ts">
	import type { HTMLButtonAttributes } from 'svelte/elements';
	import { Icon } from '#lib/components/ui/icon/index.js';
	import { ripple } from '#lib/m3/ripple.svelte.js';
	import { springCss } from '#lib/m3/motion.js';
	import { cn, type WithElementRef } from '#lib/utils.js';
	import { getNavigationRailContext } from './context.js';

	/**
	 * FAB in the rail header. Elevation level0 inside the rail [M-NR-G]; becomes a small extended FAB
	 * when the rail expands (56dp, corner 16, padding 16/16, icon → label 8dp, title-medium; buttons.md §3.4).
	 * Expand: width fastSpatial + label fade defaultEffects. Collapse: width defaultSpatial + fade fastEffects.
	 */
	let {
		ref = $bindable(null),
		icon,
		label,
		color = 'primary',
		class: className,
		...restProps
	}: WithElementRef<HTMLButtonAttributes> & {
		icon: string;
		label: string;
		/** Container color set (primary-container by default). */
		color?: NavigationRailFabColor;
	} = $props();

	const ctx = getNavigationRailContext();
	let expanded = $derived(ctx.expanded);

	const colors: Record<NavigationRailFabColor, string> = {
		primary: 'bg-primary-container text-on-primary-container',
		secondary: 'bg-secondary-container text-on-secondary-container',
		tertiary: 'bg-tertiary-container text-on-tertiary-container'
	};
</script>

<button
	bind:this={ref}
	type="button"
	data-slot="navigation-rail-fab"
	class={cn(
		'relative ms-5 flex h-14 shrink-0 items-center rounded-m3-lg px-4 shadow-m3-0 transition-shadow duration-spring-default-effects ease-spring-default-effects hover:shadow-m3-1',
		colors[color],
		className
	)}
	{@attach ripple()}
	{...restProps}
>
	<Icon name={icon} />
	<span
		class="grid"
		style:grid-template-columns={expanded ? '1fr' : '0fr'}
		style:transition="grid-template-columns {springCss(expanded ? 'fast-spatial' : 'default-spatial').transition}"
	>
		<span class="overflow-hidden">
			<span
				data-rail-measure="96"
				class={cn('type-title-md block ps-2 whitespace-nowrap', expanded ? 'opacity-100' : 'opacity-0')}
				style:transition="opacity {springCss(expanded ? 'default-effects' : 'fast-effects').transition}"
			>
				{label}
			</span>
		</span>
	</span>
</button>
