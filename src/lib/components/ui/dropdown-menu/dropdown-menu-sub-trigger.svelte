<script lang="ts">
	import { DropdownMenu as DropdownMenuPrimitive } from "bits-ui";
	import { cn } from "#lib/utils.js";
	import { Icon } from "#lib/components/ui/icon/index.js";
	import { ripple } from "#lib/m3/ripple.svelte.js";
	import { menuItemVariants, useMenuVariant } from "./context.js";

	let {
		ref = $bindable(null),
		class: className,
		inset,
		children,
		...restProps
	}: DropdownMenuPrimitive.SubTriggerProps & {
		inset?: boolean;
	} = $props();

	const menu = useMenuVariant();
</script>

<DropdownMenuPrimitive.SubTrigger
	bind:ref
	data-slot="dropdown-menu-sub-trigger"
	data-inset={inset}
	class={cn(menuItemVariants({ variant: menu.variant }), className)}
	{...restProps}
	{@attach ripple()}
>
	{@render children?.()}
	<Icon name="arrow_right" class="ms-auto rtl:-scale-x-100" />
</DropdownMenuPrimitive.SubTrigger>
