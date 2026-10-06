<script lang="ts">
	import { Dialog as SheetPrimitive } from "bits-ui";
	import { cn } from "#lib/utils.js";
	import type { HTMLAttributes } from "svelte/elements";
	import { getSideSheetContext } from "./context.js";

	// Headline: title-large, on-surface-variant (material-web side sheet token).
	let {
		ref = $bindable(null),
		class: className,
		children,
		...restProps
	}: SheetPrimitive.TitleProps = $props();

	const ctx = getSideSheetContext();
	let classes = $derived(cn("truncate type-title-lg text-on-surface-variant", className));
</script>

{#if ctx.variant === "modal"}
	<SheetPrimitive.Title bind:ref data-slot="side-sheet-title" class={classes} {children} {...restProps} />
{:else}
	<h2
		bind:this={ref}
		id={ctx.titleId}
		data-slot="side-sheet-title"
		class={classes}
		{...restProps as HTMLAttributes<HTMLHeadingElement>}
	>
		{@render children?.()}
	</h2>
{/if}
