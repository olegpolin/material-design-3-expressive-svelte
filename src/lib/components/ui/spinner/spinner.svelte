<script lang="ts">
	import type { ComponentProps } from "svelte";
	import { cn } from "#lib/utils.js";
	import { LoadingIndicator } from "#lib/components/ui/loading-indicator/index.js";

	/**
	 * shadcn-compatible `Spinner`, rendered as the M3 Expressive loading indicator (shape morph).
	 * Sized by the host button's icon token (`--btn-icon`: 20dp for xs/s, 24dp for m …) and 20dp
	 * elsewhere, in `currentColor`, so it replaces a button's leading icon 1:1.
	 * Pass `class="size-12"` (48dp) for the standalone spec size.
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
	class={cn("size-[var(--btn-icon,20px)]", className)}
	{...restProps}
/>
