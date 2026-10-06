<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';
	import { Icon } from '#lib/components/ui/icon/index.js';
	import NavigationBadge, {
		hasBadge,
		type NavigationBadgeValue
	} from '#lib/components/ui/navigation-bar/navigation-badge.svelte';
	import { ripple } from '#lib/m3/ripple.svelte.js';
	import { springCss } from '#lib/m3/motion.js';
	import { cn, type WithElementRef } from '#lib/utils.js';
	import { getNavigationRailContext } from './context.js';

	/**
	 * Rail item (navigation-containment.md §2 Items).
	 * Collapsed: 64dp tall, 56×32dp indicator centered in 96dp, label-medium below (active `secondary`).
	 * Expanded: 56dp tall, full-width (20dp insets) 56dp pill, label-large inline 8dp after the icon
	 * (active `on-secondary-container`), badge next to the label.
	 * Every part is absolutely positioned so the collapsed ↔ expanded morph is a pure geometry
	 * transition on defaultSpatial (labels cross-fade on defaultEffects). The icon never moves
	 * horizontally: x = 36dp in both states.
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
		icon: string;
		label: string;
		selected?: boolean;
		badge?: NavigationBadgeValue;
		href?: string;
		disabled?: boolean;
	} = $props();

	const ctx = getNavigationRailContext();
	let expanded = $derived(ctx.expanded);
	let tag = $derived(href && !disabled ? 'a' : 'button');
	// <a href> for links, <button type=button> otherwise (svelte:element types only know global attributes)
	let elementAttrs = $derived<Record<string, unknown>>(
		tag === 'a' ? { href } : { type: 'button', disabled, 'aria-disabled': disabled && href ? 'true' : undefined }
	);
	let badgeWidth = $state(0);

	const spatial = springCss('default-spatial').transition;
	const effects = springCss('default-effects').transition;
	const geometry = `top ${spatial}, width ${spatial}, height ${spatial}, border-radius ${spatial}`;

	function handleClick(e: MouseEvent & { currentTarget: EventTarget & HTMLElement }) {
		onclick?.(e);
		if (!e.defaultPrevented && !disabled) ctx.itemActivated();
	}
</script>

<li data-slot="navigation-rail-item" class="relative">
	<svelte:element
		this={tag}
		bind:this={ref}
		{...elementAttrs}
		aria-current={selected ? 'page' : undefined}
		data-selected={selected ? '' : undefined}
		data-expanded={expanded ? '' : undefined}
		class={cn(
			'rail-item group relative block w-full cursor-pointer outline-none select-none',
			disabled && 'cursor-default text-on-surface/38',
			className
		)}
		style:height={expanded ? '56px' : '64px'}
		style:transition="height {spatial}"
		onclick={handleClick}
		{@attach ripple({ color: 'var(--md-sys-color-on-secondary-container)' })}
		{...restProps}
	>
		<!-- active indicator: 56×32 → full width × 56, grows from the center when selected -->
		<span
			aria-hidden="true"
			class={cn(
				'absolute start-5 bg-secondary-container',
				selected ? 'scale-x-100 opacity-100' : 'scale-x-0 opacity-0'
			)}
			style:top={expanded ? '0px' : '6px'}
			style:width={expanded ? 'calc(100% - 40px)' : '56px'}
			style:height={expanded ? '56px' : '32px'}
			style:border-radius={expanded ? '28px' : '16px'}
			style:transition="{geometry}, scale {spatial}, opacity {effects}"
		></span>

		<span
			class={cn(
				'absolute start-9 flex size-6 transition-colors duration-spring-default-effects ease-spring-default-effects',
				selected ? 'text-on-secondary-container' : 'text-on-surface-variant',
				disabled && 'text-on-surface/38'
			)}
			style:top={expanded ? '16px' : '10px'}
			style:transition="top {spatial}, color {effects}"
		>
			<Icon name={icon} fill={selected} />
			{#if !expanded}<NavigationBadge value={badge} placement="icon" />{/if}
		</span>

		<!-- collapsed label (below the indicator) -->
		<span
			aria-hidden={expanded ? 'true' : undefined}
			class={cn(
				'type-label-md absolute start-0 top-[42px] w-24 truncate px-1 text-center',
				selected ? 'text-m3-secondary' : 'text-on-surface-variant',
				disabled && 'text-on-surface/38',
				expanded ? 'opacity-0' : 'opacity-100'
			)}
			style:transition="opacity {springCss(expanded ? 'fast-effects' : 'default-effects').transition}, color {effects}"
		>
			{label}
		</span>

		<!-- expanded label (inline, 8dp after the icon) + trailing badge -->
		<span
			aria-hidden={expanded ? undefined : 'true'}
			class={cn(
				'absolute start-[68px] end-9 top-[18px] flex items-center gap-2',
				expanded ? 'opacity-100' : 'opacity-0'
			)}
			style:transition="opacity {springCss(expanded ? 'default-effects' : 'fast-effects').transition}"
		>
			<span
				data-rail-measure={104 + (badgeWidth ? badgeWidth + 8 : 0)}
				class={cn(
					'type-label-lg min-w-0 truncate transition-colors duration-spring-default-effects ease-spring-default-effects',
					selected ? 'text-on-secondary-container' : 'text-on-surface-variant',
					disabled && 'text-on-surface/38'
				)}
			>
				{label}
			</span>
			{#if hasBadge(badge)}
				<span class="flex shrink-0" bind:offsetWidth={badgeWidth}>
					<NavigationBadge value={badge} />
				</span>
			{/if}
		</span>
	</svelte:element>
</li>

<style>
	/* State layer only inside the indicator geometry (§2: on-secondary-container 8/10/10%), following
	   the same collapsed ↔ expanded morph. The whole row stays the target (full rail width, [M-NR]). */
	.rail-item > :global([data-m3-ripple]) {
		inset: auto;
		inset-inline-start: 20px;
		top: 6px;
		width: 56px;
		height: 32px;
		border-radius: 16px;
		z-index: 1;
		transition-property: top, width, height, border-radius;
		transition-duration: var(--md-sys-motion-spring-default-spatial-duration);
		transition-timing-function: var(--md-sys-motion-spring-default-spatial-easing);
	}
	.rail-item[data-expanded] > :global([data-m3-ripple]) {
		top: 0;
		width: calc(100% - 40px);
		height: 56px;
		border-radius: 28px;
	}
	.rail-item:focus-visible > :global([data-m3-ripple]) {
		outline: 3px solid var(--md-sys-color-secondary);
		outline-offset: 2px;
	}
</style>
