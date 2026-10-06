<script lang="ts">
	import { AlertDialog as AlertDialogPrimitive } from "bits-ui";
	import { cn } from "#lib/utils.js";

	// Scrim: `scrim` at 32%; fades on default-effects (in) / fast-effects (out).
	let {
		ref = $bindable(null),
		class: className,
		...restProps
	}: AlertDialogPrimitive.OverlayProps = $props();
</script>

<AlertDialogPrimitive.Overlay
	bind:ref
	data-slot="alert-dialog-overlay"
	class={cn(
		"fixed inset-0 z-50 bg-scrim/32 [transition:opacity_var(--md-sys-motion-spring-default-effects-duration)_var(--md-sys-motion-spring-default-effects-easing)] data-starting-style:opacity-0 data-ending-style:opacity-0 data-ending-style:[transition:opacity_var(--md-sys-motion-spring-fast-effects-duration)_var(--md-sys-motion-spring-fast-effects-easing)]",
		className
	)}
	{...restProps}
/>
