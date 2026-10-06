<script lang="ts" module>
	import { tv } from 'tailwind-variants';

	/**
	 * M3 Expressive navigation bar (navigation-containment.md §1).
	 * short = flexible bar, 64dp · tall = baseline bar, 80dp. surface-container, level2, corner none.
	 */
	export const navigationBarVariants = tv({
		base: 'flex w-full shrink-0 rounded-m3-none bg-surface-container shadow-m3-2',
		variants: {
			variant: {
				short: 'h-16',
				tall: 'h-20'
			}
		},
		defaultVariants: { variant: 'short' }
	});
</script>

<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';
	import { cn, type WithElementRef } from '#lib/utils.js';
	import { setNavigationBarContext, type NavigationBarLayout, type NavigationBarVariant } from './context.js';

	let {
		ref = $bindable(null),
		variant = 'short',
		layout,
		class: className,
		children,
		...restProps
	}: WithElementRef<HTMLAttributes<HTMLElement>> & {
		/** `short` (64dp flexible bar) or `tall` (80dp baseline bar, always vertical items). */
		variant?: NavigationBarVariant;
		/**
		 * Item layout for the short bar. `horizontal` (default): icon to the start of the label in a 40dp pill,
		 * meant for medium windows. `vertical`: icon above label with a 56×32dp indicator (compact windows).
		 */
		layout?: NavigationBarLayout;
	} = $props();

	let resolvedLayout = $derived<NavigationBarLayout>(variant === 'tall' ? 'vertical' : (layout ?? 'horizontal'));

	setNavigationBarContext({
		get variant() {
			return variant;
		},
		get layout() {
			return resolvedLayout;
		}
	});
</script>

<nav
	bind:this={ref}
	data-slot="navigation-bar"
	data-variant={variant}
	data-layout={resolvedLayout}
	class={cn(navigationBarVariants({ variant }), className)}
	{...restProps}
>
	<ul data-layout={resolvedLayout} class="nb-list mx-auto flex h-full">
		{@render children?.()}
	</ul>
</nav>

<style>
	/* Vertical items share the width equally. */
	.nb-list[data-layout='vertical'] {
		width: 100%;
	}
	/* Horizontal items (Compose ShortNavigationBar `Centered`): the item group takes 60/70/80/90% of the bar
	   for 3/4/5/6 items, the extra space goes to the ends; never narrower than its content. */
	.nb-list[data-layout='horizontal'] {
		width: 100%;
		min-width: max-content;
	}
	.nb-list[data-layout='horizontal']:has(> :global(:nth-child(3):last-child)) {
		width: 60%;
	}
	.nb-list[data-layout='horizontal']:has(> :global(:nth-child(4):last-child)) {
		width: 70%;
	}
	.nb-list[data-layout='horizontal']:has(> :global(:nth-child(5):last-child)) {
		width: 80%;
	}
	.nb-list[data-layout='horizontal']:has(> :global(:nth-child(6):last-child)) {
		width: 90%;
	}
</style>
