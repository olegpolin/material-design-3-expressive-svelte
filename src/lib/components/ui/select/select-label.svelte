<script lang="ts">
	import { cn, type WithElementRef } from "#lib/utils.js";
	import type { HTMLAttributes } from "svelte/elements";
	import { menuLabelVariants } from "#lib/components/ui/dropdown-menu/context.js";

	let {
		ref = $bindable(null),
		class: className,
		children,
		...restProps
	}: WithElementRef<HTMLAttributes<HTMLDivElement>> & {} = $props();
</script>

<div
	bind:this={ref}
	data-slot="select-label"
	class={cn(menuLabelVariants({ variant: "baseline" }), className)}
	{...restProps}
>
	{@render children?.()}
</div>
