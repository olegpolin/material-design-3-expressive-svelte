<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';
	import { Icon } from '#lib/components/ui/icon/index.js';
	import { ripple } from '#lib/m3/ripple.svelte.js';
	import { springCss } from '#lib/m3/motion.js';
	import { cn, type WithElementRef } from '#lib/utils.js';
	import { getNavigationBarContext } from './context.js';
	import NavigationBadge, { type NavigationBadgeValue } from './navigation-badge.svelte';

	let {
		ref = $bindable(null),
		icon,
		label,
		selected = false,
		badge,
		href,
		disabled = false,
		class: className,
		...restProps
	}: WithElementRef<HTMLAttributes<HTMLElement>> & {
		/** Material Symbols name; rendered filled when selected. */
		icon: string;
		label: string;
		selected?: boolean;
		/** `true` = 6dp dot, number = count badge (999+ max). */
		badge?: NavigationBadgeValue;
		/** Renders an `<a>` when set, otherwise a `<button>`. */
		href?: string;
		disabled?: boolean;
	} = $props();

	const ctx = getNavigationBarContext();
	let vertical = $derived(ctx.layout === 'vertical');

	// Short bar items use defaultSpatial for the indicator; the baseline (tall, 80dp) bar uses fastSpatial
	// for the size and defaultEffects for alpha (navigation-containment.md §1 Motion, motion.md §4).
	let indicatorTransition = $derived(
		`scale ${springCss(ctx.variant === 'tall' ? 'fast-spatial' : 'default-spatial').transition}, ` +
			`opacity ${springCss('default-effects').transition}`
	);

	let tag = $derived(href && !disabled ? 'a' : 'button');
	// <a href> for links, <button type=button> otherwise (svelte:element types only know global attributes)
	let elementAttrs = $derived<Record<string, unknown>>(
		tag === 'a' ? { href } : { type: 'button', disabled, 'aria-disabled': disabled && href ? 'true' : undefined }
	);
</script>

<li data-slot="navigation-bar-item" class={cn('flex min-w-0 flex-1', !vertical && 'items-center justify-center')}>
	<svelte:element
		this={tag}
		bind:this={ref}
		{...elementAttrs}
		aria-current={selected ? 'page' : undefined}
		data-selected={selected ? '' : undefined}
		data-layout={ctx.layout}
		data-variant={ctx.variant}
		class={cn(
			'nb-item group relative flex cursor-pointer outline-none select-none',
			'disabled:cursor-default aria-disabled:cursor-default',
			vertical
				? ['w-full flex-col items-center gap-1', ctx.variant === 'tall' ? 'pt-3' : 'pt-1.5']
				: [
						'isolate h-10 items-center gap-1 rounded-m3-full px-4',
						// 64dp touch target for the 40dp pill
						'after:absolute after:inset-x-0 after:-inset-y-3',
						'focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-m3-secondary'
					],
			className
		)}
		{@attach ripple({ color: 'var(--md-sys-color-on-secondary-container)' })}
		{...restProps}
	>
		{#if vertical}
			<span
				class="relative grid h-8 w-14 shrink-0 place-items-center rounded-m3-full group-focus-visible:outline-3 group-focus-visible:outline-offset-2 group-focus-visible:outline-m3-secondary"
			>
				<span
					aria-hidden="true"
					class={cn(
						'absolute inset-0 rounded-m3-full bg-secondary-container',
						selected ? 'scale-x-100 opacity-100' : 'scale-x-0 opacity-0'
					)}
					style:transition={indicatorTransition}
				></span>
				{@render iconWithBadge()}
			</span>
			<span
				class={cn(
					'type-label-md max-w-full truncate px-1 transition-colors duration-spring-default-effects ease-spring-default-effects',
					selected ? 'text-m3-secondary' : 'text-on-surface-variant',
					disabled && 'text-on-surface/38'
				)}
			>
				{label}
			</span>
		{:else}
			<span
				aria-hidden="true"
				class={cn(
					'absolute inset-0 -z-10 rounded-m3-full bg-secondary-container',
					selected ? 'scale-x-100 opacity-100' : 'scale-x-0 opacity-0'
				)}
				style:transition={indicatorTransition}
			></span>
			{@render iconWithBadge()}
			<span
				class={cn(
					'type-label-md whitespace-nowrap transition-colors duration-spring-default-effects ease-spring-default-effects',
					selected ? 'text-on-secondary-container' : 'text-on-surface-variant',
					disabled && 'text-on-surface/38'
				)}
			>
				{label}
			</span>
			<!-- horizontal items: a count badge would collide with the inline label, so it trails the label -->
			{#if badge !== true}<NavigationBadge value={badge} />{/if}
		{/if}
	</svelte:element>
</li>

{#snippet iconWithBadge()}
	<!-- color lives on the wrapper: .m3-icon owns its own (unlayered) transition, children inherit the tween -->
	<span
		class={cn(
			'relative flex size-6 transition-colors duration-spring-default-effects ease-spring-default-effects',
			selected ? 'text-on-secondary-container' : 'text-on-surface-variant',
			disabled && 'text-on-surface/38'
		)}
	>
		<Icon name={icon} fill={selected} />
		{#if vertical || badge === true}<NavigationBadge value={badge} placement="icon" />{/if}
	</span>
{/snippet}

<style>
	/* The state layer of vertical items is drawn only inside the 56×32dp indicator pill (§1, [S-NI]),
	   while the whole item stays the touch target. The ripple overlay (layout.css) fills the host by
	   default; reposition it onto the pill and lift it above the indicator. */
	.nb-item[data-layout='vertical'] > :global([data-m3-ripple]) {
		inset: auto;
		top: 6px;
		left: calc(50% - 28px);
		width: 56px;
		height: 32px;
		border-radius: 16px;
		z-index: 1;
	}
	.nb-item[data-layout='vertical'][data-variant='tall'] > :global([data-m3-ripple]) {
		top: 12px;
	}
</style>
