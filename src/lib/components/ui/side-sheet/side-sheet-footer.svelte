<script lang="ts">
	import { cn, type WithElementRef } from "#lib/utils.js";
	import type { HTMLAttributes } from "svelte/elements";

	// Bottom actions: 72dp area, 16dp top / 24dp bottom padding, start-aligned, 1dp divider above.
	let {
		ref = $bindable(null),
		class: className,
		children,
		...restProps
	}: WithElementRef<HTMLAttributes<HTMLDivElement>> = $props();
</script>

<div
	bind:this={ref}
	data-slot="side-sheet-footer"
	class={cn(
		"mt-auto flex min-h-[72px] shrink-0 flex-wrap items-center gap-2 border-t border-outline-variant px-6 pt-4 pb-6",
		className
	)}
	{...restProps}
>
	{@render children?.()}
</div>
