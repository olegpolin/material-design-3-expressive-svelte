<script lang="ts">
	import type { HTMLAttributes } from "svelte/elements";
	import { cn, type WithElementRef } from "#lib/utils.js";

	/** A row of chips: 8dp gap. Wraps by default; `scroll` keeps one line that scrolls horizontally. */
	let {
		ref = $bindable(null),
		scroll = false,
		class: className,
		children,
		...restProps
	}: WithElementRef<HTMLAttributes<HTMLDivElement>> & { scroll?: boolean } = $props();
</script>

<div
	bind:this={ref}
	role="group"
	data-slot="chip-set"
	data-scroll={scroll || undefined}
	class={cn(
		"flex items-center gap-2",
		scroll ? "flex-nowrap overflow-x-auto overscroll-x-contain px-1 py-2 [scrollbar-width:none]" : "flex-wrap",
		className
	)}
	{...restProps}
>
	{@render children?.()}
</div>
