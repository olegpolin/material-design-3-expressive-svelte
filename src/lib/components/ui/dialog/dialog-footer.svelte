<script lang="ts">
	import { cn, type WithElementRef } from "#lib/utils.js";
	import type { HTMLAttributes } from "svelte/elements";
	import { getDialogLayout } from "./context.svelte.js";

	/**
	 * Actions row: end-aligned, 8dp between buttons on both axes; 24dp below the body
	 * (16dp container gap + 8dp). Full-screen: a 56dp bottom action bar.
	 */
	let {
		ref = $bindable(null),
		class: className,
		children,
		...restProps
	}: WithElementRef<HTMLAttributes<HTMLDivElement>> = $props();

	const layout = getDialogLayout();
</script>

<div
	bind:this={ref}
	data-slot="dialog-footer"
	class={cn(
		"flex shrink-0 flex-wrap items-center justify-end gap-2",
		layout.fullscreen ? "h-14 border-t border-outline-variant px-6" : "pt-2",
		className
	)}
	{...restProps}
>
	{@render children?.()}
</div>
