<script lang="ts">
	import { DropdownMenu as DropdownMenuPrimitive } from "bits-ui";
	import { cn } from "#lib/utils.js";
	import { menuGroupVariants, useMenuVariant } from "./context.js";

	let {
		ref = $bindable(null),
		value = $bindable(),
		class: className,
		...restProps
	}: DropdownMenuPrimitive.RadioGroupProps = $props();

	const menu = useMenuVariant();
</script>

<DropdownMenuPrimitive.RadioGroup
	bind:ref
	bind:value
	data-slot="dropdown-menu-radio-group"
	data-menu-group=""
	class={cn(menuGroupVariants({ variant: menu.variant }), className)}
	{...restProps}
/>
