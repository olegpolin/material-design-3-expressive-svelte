<script lang="ts" module>
	import { tv, type VariantProps } from "tailwind-variants";

	/**
	 * M3 divider (navigation-containment.md §13): 1dp `outline-variant`.
	 * Inset (horizontal): `start` = 16dp leading margin, `middle` = 16dp on both sides.
	 * For vertical dividers the insets apply to the top / bottom instead.
	 */
	export const dividerVariants = tv({
		base: "shrink-0 border-0 bg-outline-variant",
		variants: {
			orientation: {
				horizontal: "h-px w-auto self-stretch",
				vertical: "w-px self-stretch",
			},
			inset: {
				full: "",
				start: "",
				middle: "",
			},
		},
		compoundVariants: [
			{ orientation: "horizontal", inset: "start", class: "ms-4" },
			{ orientation: "horizontal", inset: "middle", class: "mx-4" },
			{ orientation: "vertical", inset: "start", class: "mt-4" },
			{ orientation: "vertical", inset: "middle", class: "my-4" },
		],
		defaultVariants: { orientation: "horizontal", inset: "full" },
	});

	export type DividerInset = VariantProps<typeof dividerVariants>["inset"];
	export type DividerOrientation = VariantProps<typeof dividerVariants>["orientation"];
</script>

<script lang="ts">
	import { Separator as SeparatorPrimitive } from "bits-ui";
	import { cn } from "#lib/utils.js";

	let {
		ref = $bindable(null),
		class: className,
		orientation = "horizontal",
		inset = "full",
		decorative = true,
		...restProps
	}: Omit<SeparatorPrimitive.RootProps, "orientation"> & {
		orientation?: DividerOrientation;
		inset?: DividerInset;
	} = $props();
</script>

<SeparatorPrimitive.Root
	bind:ref
	data-slot="divider"
	data-inset={inset}
	{orientation}
	{decorative}
	class={cn(dividerVariants({ orientation, inset }), className)}
	{...restProps}
/>
