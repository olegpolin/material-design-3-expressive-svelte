<script lang="ts">
	import { Popover as PopoverPrimitive } from "bits-ui";
	import type { Snippet } from "svelte";
	import { cn } from "#lib/utils.js";
	import { springTransition } from "#lib/m3/motion.js";
	import { tooltipVariants } from "./tooltip-content.svelte";

	/**
	 * Persistent rich tooltip (M3 "rich tooltip, persistent"): opens on click / tap of the trigger
	 * instead of hover, stays until the user dismisses it (click outside, Escape, an action), and
	 * moves focus into it so keyboard users can reach the actions. Built on bits-ui Popover; the
	 * surface is the same rich variant as `Tooltip.Content variant="rich"`.
	 *
	 * @example
	 * <Tooltip.Persistent subhead="Sync is paused">
	 *   {#snippet trigger({ props })}<IconButton {...props} icon="info" aria-label="About sync" />{/snippet}
	 *   Files upload when you reconnect.
	 *   {#snippet actions()}<Tooltip.Action>Resume</Tooltip.Action>{/snippet}
	 * </Tooltip.Persistent>
	 */
	let {
		open = $bindable(false),
		subhead,
		side = "top",
		align = "center",
		sideOffset = 4,
		class: className,
		trigger,
		actions,
		children,
	}: {
		open?: boolean;
		/** title-small subhead. */
		subhead?: string;
		side?: "top" | "bottom" | "left" | "right";
		align?: "start" | "center" | "end";
		sideOffset?: number;
		class?: string;
		/** The anchor; spread `props` onto your button. */
		trigger: Snippet<[{ props: Record<string, unknown> }]>;
		/** Up to two `Tooltip.Action` text buttons. */
		actions?: Snippet;
		/** Supporting text (body-medium). */
		children?: Snippet;
	} = $props();

	const transition = `${springTransition("fast-spatial", "scale")}, ${springTransition("fast-effects", "opacity")}`;
</script>

<PopoverPrimitive.Root bind:open>
	<PopoverPrimitive.Trigger>
		{#snippet child({ props })}
			{@render trigger({ props })}
		{/snippet}
	</PopoverPrimitive.Trigger>
	<PopoverPrimitive.Portal>
		<PopoverPrimitive.Content
			data-slot="tooltip-content"
			data-variant="rich"
			data-persistent=""
			{side}
			{align}
			{sideOffset}
			collisionPadding={8}
			class={cn(tooltipVariants({ variant: "rich" }), "origin-(--bits-popover-content-transform-origin) outline-none", className)}
			style="transition: {transition};"
		>
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
		</PopoverPrimitive.Content>
	</PopoverPrimitive.Portal>
</PopoverPrimitive.Root>
