<script lang="ts">
	import { cn, type WithElementRef } from "#lib/utils.js";
	import { ripple } from "#lib/m3/ripple.svelte.js";
	import type { HTMLButtonAttributes } from "svelte/elements";

	/** Rich-tooltip action: text button, label-large, `primary`, 36dp min height, full corner. */
	let {
		ref = $bindable(null),
		class: className,
		type = "button",
		children,
		...restProps
	}: WithElementRef<HTMLButtonAttributes> = $props();
</script>

<button
	bind:this={ref}
	{type}
	data-slot="tooltip-action"
	class={cn(
		"type-label-lg inline-flex min-h-9 items-center justify-center rounded-m3-full px-3 text-m3-primary outline-offset-2 disabled:text-on-surface/38",
		className
	)}
	{@attach ripple()}
	{...restProps}
>
	{@render children?.()}
</button>
