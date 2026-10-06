<script lang="ts">
	import { DropdownMenu as DropdownMenuPrimitive } from "bits-ui";
	import { cn } from "#lib/utils.js";
	import { menuGroupVariants, useMenuVariant } from "./context.js";

	let { ref = $bindable(null), class: className, ...restProps }: DropdownMenuPrimitive.GroupProps = $props();

	const menu = useMenuVariant();
</script>

<DropdownMenuPrimitive.Group
	bind:ref
	data-slot="dropdown-menu-group"
	data-menu-group=""
	class={cn(menuGroupVariants({ variant: menu.variant }), className)}
	{...restProps}
/>
