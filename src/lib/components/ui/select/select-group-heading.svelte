<script lang="ts">
	import { Select as SelectPrimitive } from "bits-ui";
	import { cn } from "#lib/utils.js";
	import { menuLabelVariants } from "#lib/components/ui/dropdown-menu/context.js";
	import type { ComponentProps } from "svelte";

	let {
		ref = $bindable(null),
		class: className,
		children,
		...restProps
	}: ComponentProps<typeof SelectPrimitive.GroupHeading> = $props();
</script>

<SelectPrimitive.GroupHeading
	bind:ref
	data-slot="select-group-heading"
	class={cn(menuLabelVariants({ variant: "baseline" }), className)}
	{...restProps}
>
	{@render children?.()}
</SelectPrimitive.GroupHeading>
