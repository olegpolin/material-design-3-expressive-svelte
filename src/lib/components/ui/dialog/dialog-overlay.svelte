<script lang="ts">
	import { Dialog as DialogPrimitive } from "bits-ui";
	import { cn } from "#lib/utils.js";

	// Scrim: `scrim` at 32% (navigation-containment.md §11); fades on default-effects / fast-effects.
	let {
		ref = $bindable(null),
		class: className,
		...restProps
	}: DialogPrimitive.OverlayProps = $props();
</script>

<DialogPrimitive.Overlay
	bind:ref
	data-slot="dialog-overlay"
	class={cn(
		"fixed inset-0 isolate z-50 bg-scrim/32 [transition:opacity_var(--md-sys-motion-spring-default-effects-duration)_var(--md-sys-motion-spring-default-effects-easing)] data-starting-style:opacity-0 data-ending-style:opacity-0 data-ending-style:[transition:opacity_var(--md-sys-motion-spring-fast-effects-duration)_var(--md-sys-motion-spring-fast-effects-easing)]",
		className
	)}
	{...restProps}
/>
