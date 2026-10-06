<script lang="ts">
	import { DropdownMenu as DropdownMenuPrimitive } from "bits-ui";
	import { cn, type WithoutChildrenOrChild } from "#lib/utils.js";
	import DropdownMenuPortal from "./dropdown-menu-portal.svelte";
	import { menuContentVariants, useMenuVariant } from "./context.js";
	import type { ComponentProps } from "svelte";

	let {
		ref = $bindable(null),
		sideOffset = 4,
		align = "start",
		portalProps,
		class: className,
		...restProps
	}: DropdownMenuPrimitive.ContentProps & {
		portalProps?: WithoutChildrenOrChild<ComponentProps<typeof DropdownMenuPortal>>;
	} = $props();

	const menu = useMenuVariant();
</script>

<DropdownMenuPortal {...portalProps}>
	<DropdownMenuPrimitive.Content
		bind:ref
		data-slot="dropdown-menu-content"
		data-menu-surface=""
		data-variant={menu.variant}
		{sideOffset}
		{align}
		class={cn(menuContentVariants({ variant: menu.variant }), className)}
		{...restProps}
	/>
</DropdownMenuPortal>

<style>
	/* M3 menu open: scale 0.8 → 1 on FastSpatial + fade on FastEffects, from the anchor (inputs-selection.md §8.1).
	   Global because the surface element is rendered by bits-ui; also used by sub-menus and the select listbox. */
	:global(.m3-menu-surface[data-state="open"]) {
		animation:
			m3-menu-scale-in var(--md-sys-motion-spring-fast-spatial-duration) var(--md-sys-motion-spring-fast-spatial-easing),
			m3-menu-fade-in var(--md-sys-motion-spring-fast-effects-duration) var(--md-sys-motion-spring-fast-effects-easing);
	}
	:global(.m3-menu-surface[data-state="closed"]) {
		animation:
			m3-menu-scale-out var(--md-sys-motion-spring-fast-effects-duration) var(--md-sys-motion-spring-fast-effects-easing),
			m3-menu-fade-out var(--md-sys-motion-spring-fast-effects-duration) var(--md-sys-motion-spring-fast-effects-easing)
			forwards;
	}
	@keyframes -global-m3-menu-scale-in {
		from {
			scale: 0.8;
		}
	}
	@keyframes -global-m3-menu-fade-in {
		from {
			opacity: 0;
		}
	}
	@keyframes -global-m3-menu-scale-out {
		to {
			scale: 0.8;
		}
	}
	@keyframes -global-m3-menu-fade-out {
		to {
			opacity: 0;
		}
	}
</style>
