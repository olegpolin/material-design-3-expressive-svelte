<script lang="ts">
	import { Command as CommandPrimitive } from "bits-ui";
	import { cn } from "#lib/utils.js";
	import { Icon } from "#lib/components/ui/icon/index.js";
	import { ripple } from "#lib/m3/ripple.svelte.js";
	import { useSearchView } from "./context.js";

	/**
	 * Suggestion row: an M3 list item (one line 56dp / two lines 72dp, 16dp side padding,
	 * 24dp leading icon, 16dp gap). Selecting it fills the query and submits.
	 */
	let {
		ref = $bindable(null),
		value,
		label,
		supportingText,
		icon = "history",
		trailingIcon,
		onSelect,
		class: className,
		...restProps
	}: Omit<CommandPrimitive.ItemProps, "children" | "child" | "value"> & {
		/** Query text this suggestion stands for (also used for filtering). */
		value: string;
		/** Display text (defaults to `value`). */
		label?: string;
		supportingText?: string;
		/** Leading Material Symbol (default `history`). `null` hides it. */
		icon?: string | null;
		trailingIcon?: string;
	} = $props();

	const view = useSearchView();

	function select() {
		onSelect?.();
		view?.select(value);
	}
</script>

<CommandPrimitive.Item
	bind:ref
	{value}
	onSelect={select}
	data-slot="search-view-item"
	class={cn(
		"relative flex shrink-0 cursor-pointer items-center gap-4 px-4 text-on-surface outline-none select-none",
		supportingText ? "h-18" : "h-14",
		"data-selected:not-hover:bg-on-surface/10",
		"data-disabled:pointer-events-none data-disabled:opacity-(--md-sys-state-disabled-content-opacity)",
		className
	)}
	{...restProps}
	{@attach ripple()}
>
	{#if icon}
		<Icon name={icon} class="text-on-surface-variant" />
	{/if}
	<span class="flex min-w-0 flex-1 flex-col">
		<span class="type-body-lg truncate">{label ?? value}</span>
		{#if supportingText}
			<span class="type-body-md truncate text-on-surface-variant">{supportingText}</span>
		{/if}
	</span>
	{#if trailingIcon}
		<Icon name={trailingIcon} class="text-on-surface-variant" />
	{/if}
</CommandPrimitive.Item>
