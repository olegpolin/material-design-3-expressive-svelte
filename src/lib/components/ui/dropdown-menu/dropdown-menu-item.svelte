<script lang="ts">
	import { DropdownMenu as DropdownMenuPrimitive } from "bits-ui";
	import { cn } from "#lib/utils.js";
	import { ripple } from "#lib/m3/ripple.svelte.js";
	import { menuItemVariants, useMenuVariant } from "./context.js";

	let {
		ref = $bindable(null),
		class: className,
		inset,
		variant = "default",
		...restProps
	}: DropdownMenuPrimitive.ItemProps & {
		inset?: boolean;
		variant?: "default" | "destructive";
	} = $props();

	const menu = useMenuVariant();
</script>

<DropdownMenuPrimitive.Item
	bind:ref
	data-slot="dropdown-menu-item"
	data-inset={inset}
	data-variant={variant}
	class={cn(menuItemVariants({ variant: menu.variant, destructive: variant === "destructive" }), className)}
	{...restProps}
	{@attach ripple()}
/>
