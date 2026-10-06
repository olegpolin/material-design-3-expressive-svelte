<script lang="ts">
	import { DropdownMenu as DropdownMenuPrimitive } from "bits-ui";
	import { cn, type WithoutChild } from "#lib/utils.js";
	import { Icon } from "#lib/components/ui/icon/index.js";
	import { ripple } from "#lib/m3/ripple.svelte.js";
	import { menuItemVariants, useMenuVariant } from "./context.js";

	let {
		ref = $bindable(null),
		class: className,
		inset,
		children: childrenProp,
		closeOnSelect = false,
		...restProps
	}: WithoutChild<DropdownMenuPrimitive.RadioItemProps> & { inset?: boolean } = $props();

	const menu = useMenuVariant();
</script>

<DropdownMenuPrimitive.RadioItem
	bind:ref
	{closeOnSelect}
	data-slot="dropdown-menu-radio-item"
	data-inset={inset}
	class={cn(menuItemVariants({ variant: menu.variant }), className)}
	{...restProps}
	{@attach ripple()}
>
	{#snippet children({ checked })}
		{@render childrenProp?.({ checked })}
		<span class="ms-auto flex shrink-0 items-center" data-slot="dropdown-menu-radio-item-indicator">
			{#if checked}
				<Icon name="check" />
			{/if}
		</span>
	{/snippet}
</DropdownMenuPrimitive.RadioItem>
