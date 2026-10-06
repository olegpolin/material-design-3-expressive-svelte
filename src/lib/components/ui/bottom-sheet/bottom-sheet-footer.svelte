<script lang="ts">
	import { cn, type WithElementRef } from "#lib/utils.js";
	import type { HTMLAttributes } from "svelte/elements";

	// Actions row: end-aligned, 8dp gaps.
	let {
		ref = $bindable(null),
		class: className,
		children,
		...restProps
	}: WithElementRef<HTMLAttributes<HTMLDivElement>> = $props();
</script>

<div
	bind:this={ref}
	data-slot="bottom-sheet-footer"
	class={cn("mt-auto flex shrink-0 flex-wrap items-center justify-end gap-2 px-6 pt-4 pb-6", className)}
	{...restProps}
>
	{@render children?.()}
</div>
