<script lang="ts">
	import { cn, type WithElementRef } from "#lib/utils.js";
	import type { HTMLAttributes } from "svelte/elements";

	// Title + supporting text 16dp apart; centered when an `AlertDialog.Media` hero icon is present.
	let {
		ref = $bindable(null),
		class: className,
		children,
		...restProps
	}: WithElementRef<HTMLAttributes<HTMLDivElement>> = $props();
</script>

<div
	bind:this={ref}
	data-slot="alert-dialog-header"
	class={cn(
		"flex flex-col gap-4 has-data-[slot=alert-dialog-media]:items-center has-data-[slot=alert-dialog-media]:text-center",
		className
	)}
	{...restProps}
>
	{@render children?.()}
</div>
