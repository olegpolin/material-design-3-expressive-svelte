<script lang="ts">
	import { Dialog as DialogPrimitive } from "bits-ui";
	import { cn } from "#lib/utils.js";
	import { getDialogLayout } from "./context.svelte.js";

	// Basic: headline-small (24/32) on-surface. Full-screen header: title-large (22/28).
	let {
		ref = $bindable(null),
		class: className,
		...restProps
	}: DialogPrimitive.TitleProps = $props();

	const layout = getDialogLayout();
</script>

<DialogPrimitive.Title
	bind:ref
	data-slot="dialog-title"
	class={cn("text-on-surface", layout.fullscreen ? "type-title-lg" : "type-headline-sm", className)}
	{...restProps}
/>
