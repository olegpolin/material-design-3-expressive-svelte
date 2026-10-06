<script lang="ts">
	import { AlertDialog as AlertDialogPrimitive } from "bits-ui";
	import { dialogContentVariants } from "#lib/components/ui/dialog/index.js";
	import { cn, type WithoutChild, type WithoutChildrenOrChild } from "#lib/utils.js";
	import AlertDialogOverlay from "./alert-dialog-overlay.svelte";
	import AlertDialogPortal from "./alert-dialog-portal.svelte";
	import type { ComponentProps } from "svelte";

	/**
	 * Same container as the M3 basic dialog (navigation-containment.md §11): 280–560dp, 28dp corners,
	 * 24dp padding, surface-container-high, level3, fade + scale-in motion. `size="sm"` caps the width
	 * at 320dp and stretches the actions.
	 */
	let {
		ref = $bindable(null),
		class: className,
		size = "default",
		portalProps,
		...restProps
	}: WithoutChild<AlertDialogPrimitive.ContentProps> & {
		size?: "default" | "sm";
		portalProps?: WithoutChildrenOrChild<ComponentProps<typeof AlertDialogPortal>>;
	} = $props();
</script>

<AlertDialogPortal {...portalProps}>
	<AlertDialogOverlay />
	<AlertDialogPrimitive.Content
		bind:ref
		data-slot="alert-dialog-content"
		data-size={size}
		class={cn(
			"group/alert-dialog-content",
			dialogContentVariants({ layout: "basic" }),
			size === "sm" && "max-w-[min(320px,calc(100vw-48px))]",
			className
		)}
		{...restProps}
	/>
</AlertDialogPortal>
