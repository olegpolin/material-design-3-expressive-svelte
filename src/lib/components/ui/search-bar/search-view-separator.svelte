<script lang="ts">
	import { Command as CommandPrimitive } from "bits-ui";
	import { cn } from "#lib/utils.js";

	let { ref = $bindable(null), class: className, ...restProps }: CommandPrimitive.SeparatorProps = $props();
</script>

<CommandPrimitive.Separator
	bind:ref
	data-slot="search-view-separator"
	class={cn("my-2 h-px shrink-0 bg-outline-variant", className)}
	{...restProps}
/>
