<script lang="ts">
	import { cn, type WithElementRef } from "#lib/utils.js";
	import type { HTMLAttributes } from "svelte/elements";

	// Scrollable content area, 24dp side padding.
	let {
		ref = $bindable(null),
		class: className,
		children,
		...restProps
	}: WithElementRef<HTMLAttributes<HTMLDivElement>> = $props();
</script>

<div
	bind:this={ref}
	data-slot="side-sheet-body"
	class={cn("min-h-0 flex-1 overflow-y-auto px-6 pb-6 type-body-md text-on-surface-variant", className)}
	{...restProps}
>
	{@render children?.()}
</div>
