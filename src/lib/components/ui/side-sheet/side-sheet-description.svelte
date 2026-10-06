<script lang="ts">
	import { Dialog as SheetPrimitive } from "bits-ui";
	import { cn } from "#lib/utils.js";
	import type { HTMLAttributes } from "svelte/elements";
	import { getSideSheetContext } from "./context.js";

	let {
		ref = $bindable(null),
		class: className,
		children,
		...restProps
	}: SheetPrimitive.DescriptionProps = $props();

	const ctx = getSideSheetContext();
	let classes = $derived(cn("type-body-md text-on-surface-variant", className));
</script>

{#if ctx.variant === "modal"}
	<SheetPrimitive.Description
		bind:ref
		data-slot="side-sheet-description"
		class={classes}
		{children}
		{...restProps}
	/>
{:else}
	<p
		bind:this={ref}
		data-slot="side-sheet-description"
		class={classes}
		{...restProps as HTMLAttributes<HTMLParagraphElement>}
	>
		{@render children?.()}
	</p>
{/if}
