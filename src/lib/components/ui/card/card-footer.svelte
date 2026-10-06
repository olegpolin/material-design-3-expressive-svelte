<script lang="ts">
	import { cn, type WithElementRef } from "#lib/utils.js";
	import type { HTMLAttributes } from "svelte/elements";

	/** Actions row: end-aligned, 8dp between buttons. */
	let {
		ref = $bindable(null),
		class: className,
		children,
		...restProps
	}: WithElementRef<HTMLAttributes<HTMLDivElement>> = $props();
</script>

<div
	bind:this={ref}
	data-slot="card-footer"
	class={cn("flex flex-wrap items-center justify-end gap-2 px-(--card-spacing)", className)}
	{...restProps}
>
	{@render children?.()}
</div>
