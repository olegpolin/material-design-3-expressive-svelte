<script lang="ts">
	import { Dialog as SheetPrimitive } from "bits-ui";
	import { getSideSheetContext } from "./context.js";

	let {
		ref = $bindable(null),
		type = "button",
		child,
		children,
		onclick,
		...restProps
	}: SheetPrimitive.CloseProps = $props();

	const ctx = getSideSheetContext();

	let standardProps = $derived({
		...restProps,
		type,
		"data-slot": "side-sheet-close",
		onclick: (e: MouseEvent & { currentTarget: EventTarget & HTMLButtonElement }) => {
			onclick?.(e);
			if (!e.defaultPrevented) ctx.open = false;
		},
	});
</script>

{#if ctx.variant === "modal"}
	<SheetPrimitive.Close
		bind:ref
		data-slot="side-sheet-close"
		{type}
		{child}
		{children}
		{onclick}
		{...restProps}
	/>
{:else if child}
	{@render child({ props: standardProps })}
{:else}
	<button bind:this={ref} {...standardProps}>
		{@render children?.()}
	</button>
{/if}
