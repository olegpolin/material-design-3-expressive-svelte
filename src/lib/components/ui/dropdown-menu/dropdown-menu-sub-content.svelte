<script lang="ts">
	import { DropdownMenu as DropdownMenuPrimitive } from "bits-ui";
	import { cn, type WithoutChildrenOrChild } from "#lib/utils.js";
	import DropdownMenuPortal from "./dropdown-menu-portal.svelte";
	import { menuContentVariants, useMenuVariant } from "./context.js";
	import type { ComponentProps } from "svelte";

	let {
		ref = $bindable(null),
		class: className,
		align = "start",
		alignOffset,
		sideOffset,
		portalProps,
		...restProps
	}: DropdownMenuPrimitive.SubContentProps & {
		portalProps?: WithoutChildrenOrChild<ComponentProps<typeof DropdownMenuPortal>>;
	} = $props();

	const menu = useMenuVariant();
	// Align the first submenu item with its trigger: baseline lists have 8dp top padding, expressive 4dp.
	const offset = $derived(alignOffset ?? (menu.variant === "baseline" ? -8 : -4));
</script>

<DropdownMenuPortal {...portalProps}>
	<DropdownMenuPrimitive.SubContent
		bind:ref
		data-slot="dropdown-menu-sub-content"
		data-menu-surface=""
		data-variant={menu.variant}
		{align}
		alignOffset={offset}
		sideOffset={sideOffset ?? (menu.variant === "baseline" ? 0 : 4)}
		class={cn(menuContentVariants({ variant: menu.variant }), className)}
		{...restProps}
	/>
</DropdownMenuPortal>
