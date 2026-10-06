<script lang="ts">
	import { DropdownMenu as DropdownMenuPrimitive } from "bits-ui";
	import { cn, type WithoutChildrenOrChild } from "#lib/utils.js";
	import { Icon } from "#lib/components/ui/icon/index.js";
	import { ripple } from "#lib/m3/ripple.svelte.js";
	import { menuItemVariants, useMenuVariant } from "./context.js";
	import type { Snippet } from "svelte";

	let {
		ref = $bindable(null),
		checked = $bindable(false),
		indeterminate = $bindable(false),
		class: className,
		inset,
		children: childrenProp,
		closeOnSelect = false,
		...restProps
	}: WithoutChildrenOrChild<DropdownMenuPrimitive.CheckboxItemProps> & {
		inset?: boolean;
		children?: Snippet;
	} = $props();

	const menu = useMenuVariant();
</script>

<DropdownMenuPrimitive.CheckboxItem
	bind:ref
	{closeOnSelect}
	bind:checked
	bind:indeterminate
	data-slot="dropdown-menu-checkbox-item"
	data-inset={inset}
	class={cn(menuItemVariants({ variant: menu.variant }), className)}
	{...restProps}
	{@attach ripple()}
>
	{#snippet children({ checked, indeterminate })}
		{@render childrenProp?.()}
		<span class="ms-auto flex shrink-0 items-center" data-slot="dropdown-menu-checkbox-item-indicator">
			{#if indeterminate}
				<Icon name="remove" />
			{:else if checked}
				<Icon name="check" />
			{/if}
		</span>
	{/snippet}
</DropdownMenuPrimitive.CheckboxItem>
