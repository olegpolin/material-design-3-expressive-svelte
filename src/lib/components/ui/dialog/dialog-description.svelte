<script lang="ts">
	import { Dialog as DialogPrimitive } from "bits-ui";
	import { cn } from "#lib/utils.js";

	// Supporting text: body-medium, on-surface-variant.
	let {
		ref = $bindable(null),
		class: className,
		...restProps
	}: DialogPrimitive.DescriptionProps = $props();
</script>

<DialogPrimitive.Description
	bind:ref
	data-slot="dialog-description"
	class={cn(
		"type-body-md text-on-surface-variant *:[a]:text-m3-primary *:[a]:underline *:[a]:underline-offset-3",
		className
	)}
	{...restProps}
/>
