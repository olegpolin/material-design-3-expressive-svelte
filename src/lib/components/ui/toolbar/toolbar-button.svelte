<script lang="ts">
	import { Toolbar as ToolbarPrimitive } from 'bits-ui';
	import { Icon } from '#lib/components/ui/icon/index.js';
	import { ripple } from '#lib/m3/ripple.svelte.js';
	import { cn } from '#lib/utils.js';
	import { getToolbarContext } from './context.js';

	/**
	 * Toolbar icon button (bits-ui Toolbar.Button → roving focus, arrow keys). S icon button:
	 * 40dp container in a 48dp slot (64 − 2×8 padding), 24dp icon, full radius, color inherited from
	 * the toolbar. Toggle (`selected` defined): selected = secondary-container / on-secondary-container
	 * (standard) or surface-container / on-surface (vibrant), icon filled (navigation-containment.md §5).
	 */
	let {
		ref = $bindable(null),
		icon,
		label,
		selected,
		disabled = false,
		class: className,
		children,
		...restProps
	}: ToolbarPrimitive.ButtonProps & {
		icon?: string;
		/** Accessible name for icon-only buttons. */
		label?: string;
		/** Toggle state; `undefined` = plain action. */
		selected?: boolean;
	} = $props();

	const ctx = getToolbarContext();
</script>

<ToolbarPrimitive.Button
	bind:ref
	data-slot="toolbar-button"
	aria-label={label}
	aria-pressed={selected}
	{disabled}
	class={cn(
		'relative m-1 grid size-10 shrink-0 cursor-pointer place-items-center rounded-m3-full text-inherit select-none',
		'after:absolute after:-inset-1',
		'transition-colors duration-spring-default-effects ease-spring-default-effects',
		'disabled:cursor-default disabled:text-on-surface/38',
		selected &&
			(ctx.color === 'vibrant'
				? 'bg-surface-container text-on-surface'
				: 'bg-secondary-container text-on-secondary-container'),
		className
	)}
	{@attach ripple()}
	{...restProps}
>
	{#if icon}
		<Icon name={icon} fill={!!selected} />
	{/if}
	{@render children?.()}
</ToolbarPrimitive.Button>
