<script lang="ts" module>
	import { tv, type VariantProps } from "tailwind-variants";

	/**
	 * M3 Expressive list (navigation-containment.md §12).
	 *   standard   `surface` container, 8dp vertical padding, square items (they round on hover /
	 *              press / selection).
	 *   segmented  items are separate tiles 2dp apart: 16dp outer corners on the first / last item,
	 *              4dp inner corners; container is transparent so place it on a contrasting surface.
	 * `dividers` draws 1dp outline-variant dividers between items, inset 16dp on both sides.
	 */
	export const listVariants = tv({
		base: "group/list m-0 flex list-none flex-col p-0",
		variants: {
			variant: {
				standard: "bg-surface py-2",
				segmented: "gap-0.5",
			},
		},
		defaultVariants: { variant: "standard" },
	});

	export type ListVariant = VariantProps<typeof listVariants>["variant"];
</script>

<script lang="ts">
	import { cn, type WithElementRef } from "#lib/utils.js";
	import type { HTMLAttributes } from "svelte/elements";

	let {
		ref = $bindable(null),
		class: className,
		variant = "standard",
		dividers = false,
		children,
		...restProps
	}: WithElementRef<HTMLAttributes<HTMLUListElement>> & {
		variant?: ListVariant;
		dividers?: boolean;
	} = $props();
</script>

<ul
	bind:this={ref}
	data-slot="list"
	data-variant={variant}
	data-dividers={dividers || undefined}
	class={cn(listVariants({ variant }), className)}
	{...restProps}
>
	{@render children?.()}
</ul>
