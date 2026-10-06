<script lang="ts">
	import { cn, type WithElementRef } from "#lib/utils.js";
	import type { Attachment } from "svelte/attachments";
	import type { HTMLAttributes } from "svelte/elements";
	import { getDialogLayout } from "./context.svelte.js";

	/**
	 * Scrollable dialog content between the header and the actions.
	 * Basic: bleeds to the dialog edges and shows 1dp `outline` dividers above / below while the
	 * content overflows (navigation-containment.md §11 "Divider (optional)").
	 * Full-screen: fills the remaining height with 24dp side padding; scrolling it elevates the header.
	 */
	let {
		ref = $bindable(null),
		class: className,
		children,
		onscroll,
		...restProps
	}: WithElementRef<HTMLAttributes<HTMLDivElement>> = $props();

	const layout = getDialogLayout();
	let overflowing = $state(false);

	const measure: Attachment<HTMLDivElement> = (node) => {
		const update = () => (overflowing = node.scrollHeight > node.clientHeight + 1);
		const ro = new ResizeObserver(update);
		ro.observe(node);
		for (const child of node.children) ro.observe(child);
		update();
		return () => ro.disconnect();
	};
</script>

<div
	bind:this={ref}
	data-slot="dialog-body"
	data-overflowing={overflowing || undefined}
	class={cn(
		"min-h-0 overflow-y-auto overscroll-contain type-body-md text-on-surface-variant",
		layout.fullscreen
			? "flex-1 px-6 pt-2 pb-6"
			: "-mx-6 border-y border-transparent px-6 data-overflowing:border-outline",
		className
	)}
	onscroll={(e) => {
		layout.scrolled = e.currentTarget.scrollTop > 0;
		onscroll?.(e);
	}}
	{...restProps}
	{@attach measure}
>
	{@render children?.()}
</div>
