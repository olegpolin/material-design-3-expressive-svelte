<script lang="ts" module>
	import { tv } from 'tailwind-variants';

	/**
	 * Docked toolbar (navigation-containment.md §5): full width, 64dp, corner none, 16dp leading/trailing
	 * padding, standard = surface-container (vibrant = primary-container). Items spread evenly
	 * (`between`, Compose FlexibleBottomAppBar default) or centered with 32dp spacing (`center`).
	 */
	export const dockedToolbarVariants = tv({
		base: 'flex h-16 w-full shrink-0 items-center rounded-m3-none px-4',
		variants: {
			color: {
				standard: 'bg-surface-container text-on-surface-variant',
				vibrant: 'bg-primary-container text-on-primary-container'
			},
			arrangement: {
				between: 'justify-between gap-1',
				center: 'justify-center gap-8'
			}
		},
		defaultVariants: { color: 'standard', arrangement: 'between' }
	});
</script>

<script lang="ts">
	import type { Snippet } from 'svelte';
	import { Toolbar as ToolbarPrimitive } from 'bits-ui';
	import { cn } from '#lib/utils.js';
	import { setToolbarContext, type ToolbarColor } from './context.js';

	let {
		ref = $bindable(null),
		color = 'standard',
		arrangement = 'between',
		class: className,
		children,
		...restProps
	}: ToolbarPrimitive.RootProps & {
		color?: ToolbarColor;
		arrangement?: 'between' | 'center';
		children?: Snippet;
	} = $props();

	setToolbarContext({
		get color() {
			return color;
		}
	});
</script>

<ToolbarPrimitive.Root
	bind:ref
	data-slot="docked-toolbar"
	data-color={color}
	orientation="horizontal"
	class={cn(dockedToolbarVariants({ color, arrangement }), className)}
	{...restProps}
>
	{@render children?.()}
</ToolbarPrimitive.Root>
