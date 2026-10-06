<script lang="ts">
	import { Command as CommandPrimitive } from "bits-ui";
	import { cn } from "#lib/utils.js";

	let { ref = $bindable(null), class: className, ...restProps }: CommandPrimitive.EmptyProps = $props();
</script>

<CommandPrimitive.Empty
	bind:ref
	data-slot="search-view-empty"
	class={cn("type-body-lg px-4 py-6 text-center text-on-surface-variant", className)}
	{...restProps}
/>
