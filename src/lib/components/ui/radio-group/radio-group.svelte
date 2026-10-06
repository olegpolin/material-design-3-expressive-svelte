<script lang="ts">
	import { RadioGroup as RadioGroupPrimitive } from "bits-ui";
	import { cn } from "#lib/utils.js";

	let {
		ref = $bindable(null),
		class: className,
		value = $bindable(""),
		...restProps
	}: RadioGroupPrimitive.RootProps = $props();
</script>

<RadioGroupPrimitive.Root
	bind:ref
	bind:value
	data-slot="radio-group"
	class={cn("flex flex-col gap-1 data-[orientation=horizontal]:flex-row data-[orientation=horizontal]:flex-wrap", className)}
	{...restProps}
/>
