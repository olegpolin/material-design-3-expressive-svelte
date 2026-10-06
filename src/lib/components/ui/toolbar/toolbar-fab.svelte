<script lang="ts">
	import type { HTMLButtonAttributes } from 'svelte/elements';
	import { Icon } from '#lib/components/ui/icon/index.js';
	import { ripple } from '#lib/m3/ripple.svelte.js';
	import { cn, type WithElementRef } from '#lib/utils.js';
	import { getToolbarContext } from './context.js';

	/**
	 * FAB paired with a floating toolbar (navigation-containment.md §5 "Floating toolbar + FAB"):
	 * 56dp (corner 16, icon 24) or medium 80dp (corner 20, icon 28), elevation level2 → level3 on hover
	 * (Compose FloatingToolbar). Color: standard = secondary-container (material-web), vibrant =
	 * tertiary-container. Place it in the toolbar's `fab` snippet (8dp gap).
	 */
	let {
		ref = $bindable(null),
		icon,
		label,
		size = 'default',
		class: className,
		...restProps
	}: WithElementRef<HTMLButtonAttributes> & {
		icon: string;
		/** Accessible name. */
		label: string;
		size?: 'default' | 'medium';
	} = $props();

	const ctx = getToolbarContext();
</script>

<button
	bind:this={ref}
	type="button"
	data-slot="toolbar-fab"
	aria-label={label}
	class={cn(
		'relative grid shrink-0 cursor-pointer place-items-center shadow-m3-2 hover:shadow-m3-3',
		'transition-shadow duration-spring-default-effects ease-spring-default-effects',
		size === 'medium' ? 'size-20 rounded-m3-lg-increased' : 'size-14 rounded-m3-lg',
		ctx.color === 'vibrant'
			? 'bg-tertiary-container text-on-tertiary-container'
			: 'bg-secondary-container text-on-secondary-container',
		className
	)}
	{@attach ripple()}
	{...restProps}
>
	<Icon name={icon} size={size === 'medium' ? 28 : 24} />
</button>
