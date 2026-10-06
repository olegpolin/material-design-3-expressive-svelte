<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';
	import { Icon } from '#lib/components/ui/icon/index.js';
	import { ripple } from '#lib/m3/ripple.svelte.js';
	import { cn, type WithElementRef } from '#lib/utils.js';
	import { getNavigationDrawerContext } from './context.js';

	/**
	 * Drawer item (navigation-containment.md §3): 56dp tall, full radius, 336dp indicator
	 * (12dp inset from the drawer edge), content padding 16 start / 24 end, icon 24 + 12dp gap,
	 * label-large. Selected: secondary-container / on-secondary-container. Inactive: on-surface-variant,
	 * on-surface while hovered/focused/pressed. Trailing badge text: label-large.
	 */
	let {
		ref = $bindable(null),
		icon,
		label,
		selected = false,
		badge,
		href,
		disabled = false,
		onclick,
		class: className,
		...restProps
	}: WithElementRef<HTMLAttributes<HTMLElement>> & {
		icon?: string;
		label: string;
		selected?: boolean;
		/** Trailing badge label, e.g. a count ("24") or "100+". */
		badge?: string | number;
		href?: string;
		disabled?: boolean;
	} = $props();

	const ctx = getNavigationDrawerContext();
	let tag = $derived(href && !disabled ? 'a' : 'button');
	// <a href> for links, <button type=button> otherwise (svelte:element types only know global attributes)
	let elementAttrs = $derived<Record<string, unknown>>(
		tag === 'a' ? { href } : { type: 'button', disabled, 'aria-disabled': disabled && href ? 'true' : undefined }
	);

	function handleClick(e: MouseEvent & { currentTarget: EventTarget & HTMLElement }) {
		onclick?.(e);
		if (!e.defaultPrevented && !disabled) ctx.itemActivated();
	}
</script>

<li data-slot="navigation-drawer-item" class="flex">
	<svelte:element
		this={tag}
		bind:this={ref}
		{...elementAttrs}
		aria-current={selected ? 'page' : undefined}
		data-selected={selected ? '' : undefined}
		class={cn(
			'flex h-14 w-full cursor-pointer items-center gap-3 rounded-m3-full ps-4 pe-6 text-start select-none',
			'transition-colors duration-spring-default-effects ease-spring-default-effects',
			'focus-visible:outline-offset-0',
			selected
				? 'bg-secondary-container text-on-secondary-container'
				: 'text-on-surface-variant hover:text-on-surface focus-visible:text-on-surface active:text-on-surface',
			disabled && 'cursor-default bg-transparent text-on-surface/38 hover:text-on-surface/38',
			className
		)}
		onclick={handleClick}
		{@attach ripple()}
		{...restProps}
	>
		{#if icon}
			<Icon name={icon} fill={selected} />
		{/if}
		<span class="type-label-lg min-w-0 flex-1 truncate">{label}</span>
		{#if badge !== undefined && badge !== ''}
			<span class={cn('type-label-lg shrink-0', selected ? 'text-on-secondary-container' : 'text-on-surface-variant')}>
				{badge}
			</span>
		{/if}
	</svelte:element>
</li>
