<script lang="ts" module>
	import { tv, type VariantProps } from "tailwind-variants";

	/** navigation-containment.md §15. Arrow-less (the 16 × 8dp caret is optional in M3). */
	export const tooltipVariants = tv({
		base: [
			"z-50 w-fit origin-(--bits-tooltip-content-transform-origin)",
			// Enter/exit: scale 0.8 → 1 (fast-spatial) + opacity 0 → 1 (fast-effects).
			"scale-100 opacity-100 starting:scale-80 starting:opacity-0",
			"data-[state=closed]:scale-80 data-[state=closed]:opacity-0",
		],
		variants: {
			variant: {
				// Plain: 24dp min height, 40–200dp wide, 8dp × 4dp padding, 4dp corner, inverse-surface, body-small.
				plain:
					"type-body-sm flex min-h-6 min-w-10 max-w-[200px] items-center rounded-m3-xs bg-inverse-surface px-2 py-1 text-inverse-on-surface",
				// Rich: ≤ 320dp, 12dp corner, surface-container, level 2, 12dp top / 16dp sides padding.
				rich: "flex max-w-80 flex-col rounded-m3-md bg-surface-container px-4 pt-3 pb-3 text-on-surface-variant shadow-m3-2 has-data-[slot=tooltip-actions]:pb-2",
			},
		},
		defaultVariants: { variant: "plain" },
	});

	export type TooltipVariant = VariantProps<typeof tooltipVariants>["variant"];
</script>

<script lang="ts">
	import { Tooltip as TooltipPrimitive } from "bits-ui";
	import type { ComponentProps, Snippet } from "svelte";
	import { cn, type WithoutChildrenOrChild } from "#lib/utils.js";
	import { springTransition } from "#lib/m3/motion.js";
	import TooltipPortal from "./tooltip-portal.svelte";

	let {
		ref = $bindable(null),
		class: className,
		style,
		variant = "plain",
		subhead,
		actions,
		sideOffset = 4,
		side = "top",
		children,
		portalProps,
		...restProps
	}: TooltipPrimitive.ContentProps & {
		/** `plain` (default) or `rich` (subhead, supporting text, actions; stays open while hovered). */
		variant?: TooltipVariant;
		/** Rich only: title-small subhead. */
		subhead?: string;
		/** Rich only: up to two `Tooltip.Action` text buttons. */
		actions?: Snippet;
		portalProps?: WithoutChildrenOrChild<ComponentProps<typeof TooltipPortal>>;
	} = $props();

	const transition = `${springTransition("fast-spatial", "scale")}, ${springTransition("fast-effects", "opacity")}`;
</script>

<TooltipPortal {...portalProps}>
	<TooltipPrimitive.Content
		bind:ref
		data-slot="tooltip-content"
		data-variant={variant}
		role={variant === "plain" ? "tooltip" : undefined}
		{sideOffset}
		{side}
		class={cn(tooltipVariants({ variant }), className)}
		style="transition: {transition}; {style ?? ''}"
		{...restProps}
	>
		{#if variant === "rich"}
			{#if subhead}
				<p data-slot="tooltip-subhead" class="type-title-sm mb-1 text-on-surface-variant">{subhead}</p>
			{/if}
			<div data-slot="tooltip-text" class="type-body-md text-on-surface-variant">
				{@render children?.()}
			</div>
			{#if actions}
				<div data-slot="tooltip-actions" class="-ms-3 mt-2 flex flex-wrap gap-2">
					{@render actions()}
				</div>
			{/if}
		{:else}
			{@render children?.()}
		{/if}
	</TooltipPrimitive.Content>
</TooltipPortal>
