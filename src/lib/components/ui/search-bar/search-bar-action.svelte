<script lang="ts">
	import { cn, type WithElementRef } from "#lib/utils.js";
	import type { HTMLButtonAttributes } from "svelte/elements";
	import { Icon } from "#lib/components/ui/icon/index.js";
	import { ripple } from "#lib/m3/ripple.svelte.js";

	/** A 24dp icon in a 48dp round tap target, for the leading/trailing slots of the search bar and view. */
	let {
		ref = $bindable(null),
		icon,
		label,
		class: className,
		type = "button",
		...restProps
	}: WithElementRef<HTMLButtonAttributes, HTMLButtonElement> & {
		/** Material Symbols name. */
		icon: string;
		/** Accessible name. */
		label: string;
	} = $props();
</script>

<button
	bind:this={ref}
	{type}
	data-slot="search-bar-action"
	aria-label={label}
	class={cn(
		"relative grid size-12 shrink-0 cursor-pointer place-items-center rounded-m3-full disabled:cursor-default disabled:opacity-(--md-sys-state-disabled-content-opacity)",
		className
	)}
	{...restProps}
	{@attach ripple()}
>
	<Icon name={icon} />
</button>
