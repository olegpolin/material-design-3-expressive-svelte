<script lang="ts">
	import { Separator } from "#lib/components/ui/separator/index.js";
	import { cn } from "#lib/utils.js";
	import type { Separator as SeparatorPrimitive } from "bits-ui";

	let {
		ref = $bindable(null),
		class: className,
		...restProps
	}: SeparatorPrimitive.RootProps = $props();
</script>

<!-- M3 menu divider: 1dp outline-variant, 8dp vertical padding. -->
<Separator
	bind:ref
	data-slot="select-separator"
	class={cn("pointer-events-none my-2 h-px bg-outline-variant", className)}
	{...restProps}
/>
