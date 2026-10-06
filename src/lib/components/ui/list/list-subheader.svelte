<script lang="ts">
	import { cn, type WithElementRef } from "#lib/utils.js";
	import type { HTMLLiAttributes } from "svelte/elements";

	// Section label inside a `List`: title-small, on-surface-variant, aligned with the item text (16dp).
	let {
		ref = $bindable(null),
		class: className,
		children,
		...restProps
	}: WithElementRef<HTMLLiAttributes> = $props();
</script>

<li
	bind:this={ref}
	data-slot="list-subheader"
	class={cn("flex min-h-12 items-end px-4 pt-4 pb-2 type-title-sm text-on-surface-variant", className)}
	{...restProps}
>
	{@render children?.()}
</li>
