<script lang="ts">
	import { AlertDialog as AlertDialogPrimitive } from "bits-ui";
	import {
		buttonVariants,
		type ButtonVariant,
		type ButtonSize,
	} from "#lib/components/ui/button/index.js";
	import { ripple } from "#lib/m3/ripple.svelte.js";
	import { cn } from "#lib/utils.js";

	// Dialog actions are M3 text buttons (label-large, primary, 40dp) by default.
	let {
		ref = $bindable(null),
		class: className,
		variant = "text",
		size = "sm",
		children,
		...restProps
	}: AlertDialogPrimitive.ActionProps & {
		variant?: ButtonVariant;
		size?: ButtonSize;
	} = $props();
</script>

<AlertDialogPrimitive.Action bind:ref data-slot="alert-dialog-action" {...restProps}>
	{#snippet child({ props })}
		<button
			{...props}
			class={cn(buttonVariants({ variant, size }), className)}
			{@attach ripple()}
		>
			{@render children?.()}
		</button>
	{/snippet}
</AlertDialogPrimitive.Action>
