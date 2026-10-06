<script lang="ts">
	import type { ComponentProps } from "svelte";
	import { cn } from "#lib/utils.js";
	import { LoadingIndicator } from "#lib/components/ui/loading-indicator/index.js";

	/**
	 * shadcn-compatible `Spinner`, rendered as the M3 Expressive loading indicator (shape morph).
	 * Defaults to `size-4` in `currentColor` so it drops into buttons like the old lucide spinner;
	 * pass `class="size-12"` (48dp) for the spec size.
	 */
	let {
		class: className,
		role = "status",
		color = "currentColor",
		"aria-label": ariaLabel = "Loading",
		...restProps
	}: ComponentProps<typeof LoadingIndicator> = $props();
</script>

<LoadingIndicator
	data-slot="spinner"
	{role}
	{color}
	aria-label={ariaLabel}
	class={cn("size-4", className)}
	{...restProps}
/>
