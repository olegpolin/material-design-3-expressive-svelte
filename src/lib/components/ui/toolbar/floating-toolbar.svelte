<script lang="ts" module>
	import { tv } from 'tailwind-variants';

	/**
	 * Floating toolbar (navigation-containment.md §5): 64dp tall (horizontal) / wide (vertical),
	 * corner full, 8dp content padding, 4dp item gap, elevation level3 (material-web token).
	 * standard = surface-container / on-surface-variant · vibrant = primary-container / on-primary-container.
	 */
	export const floatingToolbarVariants = tv({
		base: 'inline-flex shrink-0 items-center gap-1 rounded-m3-full p-2 shadow-m3-3',
		variants: {
			orientation: {
				horizontal: 'h-16 flex-row',
				vertical: 'w-16 flex-col'
			},
			color: {
				standard: 'bg-surface-container text-on-surface-variant',
				vibrant: 'bg-primary-container text-on-primary-container'
			}
		},
		defaultVariants: { orientation: 'horizontal', color: 'standard' }
	});
</script>

<script lang="ts">
	import type { Snippet } from 'svelte';
	import { Toolbar as ToolbarPrimitive } from 'bits-ui';
	import { cn } from '#lib/utils.js';
	import { setToolbarContext, type ToolbarColor } from './context.js';
	import { hideOnScroll as hideOnScrollAttachment, type HideOnScrollOptions } from './hide-on-scroll.js';

	let {
		ref = $bindable(null),
		orientation = 'horizontal',
		color = 'standard',
		fab,
		hideOnScroll = false,
		class: className,
		toolbarClass,
		children,
		'aria-label': ariaLabel,
		...restProps
	}: ToolbarPrimitive.RootProps & {
		color?: ToolbarColor;
		/** Paired FAB (8dp gap) — use `ToolbarFab`. Rendered after the toolbar (below a vertical one). */
		fab?: Snippet;
		/** Snap off-screen after 40dp of scroll (see `hideOnScroll`). `true` = defaults. */
		hideOnScroll?: boolean | HideOnScrollOptions;
		/** Classes for the toolbar itself when a FAB wrapper is rendered (`class` goes on the outermost element). */
		toolbarClass?: string;
		children?: Snippet;
	} = $props();

	setToolbarContext({
		get color() {
			return color;
		}
	});

	let hideAttachment = $derived(
		hideOnScroll
			? hideOnScrollAttachment({
					direction: orientation === 'vertical' ? 'end' : 'bottom',
					...(hideOnScroll === true ? {} : hideOnScroll)
				})
			: undefined
	);
</script>

{#snippet toolbar(cls: string | undefined, attach: typeof hideAttachment)}
	<ToolbarPrimitive.Root
		bind:ref
		data-slot="floating-toolbar"
		data-color={color}
		{orientation}
		aria-label={ariaLabel}
		class={cn(floatingToolbarVariants({ orientation, color }), cls)}
		{@attach attach}
		{...restProps}
	>
		{@render children?.()}
	</ToolbarPrimitive.Root>
{/snippet}

{#if fab}
	<div
		data-slot="floating-toolbar-wrapper"
		class={cn('inline-flex items-center gap-2', orientation === 'vertical' && 'flex-col', className)}
		{@attach hideAttachment}
	>
		{@render toolbar(toolbarClass, undefined)}
		{@render fab()}
	</div>
{:else}
	{@render toolbar(cn(className, toolbarClass), hideAttachment)}
{/if}
