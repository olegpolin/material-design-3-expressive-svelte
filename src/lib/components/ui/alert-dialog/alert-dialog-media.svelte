<script lang="ts">
	import { cn, type WithElementRef } from "#lib/utils.js";
	import type { HTMLAttributes } from "svelte/elements";

	// Hero icon slot: 24dp, `secondary`, centered; the header centers itself around it.
	let {
		ref = $bindable(null),
		class: className,
		children,
		...restProps
	}: WithElementRef<HTMLAttributes<HTMLDivElement>> = $props();
</script>

<div
	bind:this={ref}
	data-slot="alert-dialog-media"
	class={cn(
		"inline-flex size-6 items-center justify-center text-m3-secondary [&_[data-slot=icon]]:[--m3-icon-size:24px]! [&_svg]:size-6",
		className
	)}
	{...restProps}
>
	{@render children?.()}
</div>
