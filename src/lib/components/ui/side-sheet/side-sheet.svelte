<script lang="ts">
	import { Dialog as SheetPrimitive } from "bits-ui";
	import type { Snippet } from "svelte";
	import { setSideSheetContext, type SideSheetVariant } from "./context.js";

	/**
	 * M3 side sheet root (navigation-containment.md §9).
	 *   modal (default)  bits-ui Dialog: portal, scrim 32%, focus trap, Esc / scrim click closes.
	 *   standard         no dialog semantics: `Content` renders an inline `<aside>` that sits in the
	 *                    page layout and animates its width open / closed.
	 */
	let {
		open = $bindable(false),
		variant = "modal",
		children,
		...restProps
	}: Omit<SheetPrimitive.RootProps, "children"> & {
		variant?: SideSheetVariant;
		children?: Snippet;
	} = $props();

	const uid = $props.id();

	setSideSheetContext({
		get variant() {
			return variant;
		},
		get open() {
			return open;
		},
		set open(value) {
			open = value;
		},
		contentId: `${uid}-side-sheet`,
		titleId: `${uid}-side-sheet-title`,
	});
</script>

{#if variant === "modal"}
	<SheetPrimitive.Root bind:open {...restProps}>
		{@render children?.()}
	</SheetPrimitive.Root>
{:else}
	{@render children?.()}
{/if}
