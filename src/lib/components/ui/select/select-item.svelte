<script lang="ts">
	import { Select as SelectPrimitive } from "bits-ui";
	import { cn, type WithoutChild } from "#lib/utils.js";
	import { Icon } from "#lib/components/ui/icon/index.js";
	import { ripple } from "#lib/m3/ripple.svelte.js";
	import { menuItemVariants } from "#lib/components/ui/dropdown-menu/context.js";

	let {
		ref = $bindable(null),
		class: className,
		value,
		label,
		children: childrenProp,
		...restProps
	}: WithoutChild<SelectPrimitive.ItemProps> = $props();
</script>

<!-- Focus stays on the listbox (aria-activedescendant), so the keyboard highlight is drawn here
     while pointer hover/press come from the ripple state layer. -->
<SelectPrimitive.Item
	bind:ref
	{value}
	{label}
	data-slot="select-item"
	class={cn(
		menuItemVariants({ variant: "baseline" }),
		"w-full data-highlighted:not-hover:bg-on-surface/10",
		"data-selected:bg-secondary-container data-selected:text-on-secondary-container data-selected:[&_[data-slot=icon]]:text-on-secondary-container",
		className
	)}
	{...restProps}
	{@attach ripple()}
>
	{#snippet children({ selected, highlighted })}
		<span class="flex min-w-0 flex-1 items-center gap-3 truncate">
			{#if childrenProp}
				{@render childrenProp({ selected, highlighted })}
			{:else}
				{label || value}
			{/if}
		</span>
		{#if selected}
			<Icon name="check" class="ms-auto" />
		{/if}
	{/snippet}
</SelectPrimitive.Item>
