<script lang="ts">
	import { cn, type WithElementRef } from "#lib/utils.js";
	import type { HTMLAttributes } from "svelte/elements";

	let {
		ref = $bindable(null),
		class: className,
		children,
		...restProps
	}: WithElementRef<HTMLAttributes<HTMLDivElement>> = $props();
</script>

<div
	bind:this={ref}
	data-slot="bottom-sheet-header"
	class={cn("flex shrink-0 flex-col gap-1 px-6 pb-4", className)}
	{...restProps}
>
	{@render children?.()}
</div>
