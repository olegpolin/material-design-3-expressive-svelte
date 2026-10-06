<script lang="ts">
	import { cn, type WithElementRef } from "#lib/utils.js";
	import type { HTMLAttributes } from "svelte/elements";

	/**
	 * Media area. As the first child of `Card.Root` it is full-bleed and takes the card's top
	 * corners (the card clips its content). `inset` places it inside the 16dp padding with its own
	 * corner-medium (12dp) radius instead. Pass `src`/`alt` for an image or `children` for custom media.
	 */
	let {
		ref = $bindable(null),
		class: className,
		src,
		alt = "",
		inset = false,
		children,
		...restProps
	}: WithElementRef<HTMLAttributes<HTMLDivElement>> & {
		src?: string;
		alt?: string;
		inset?: boolean;
	} = $props();
</script>

<div
	bind:this={ref}
	data-slot="card-media"
	class={cn(
		"relative aspect-video shrink-0 overflow-hidden bg-surface-container-highest",
		inset && "mx-(--card-spacing) rounded-m3-md",
		className
	)}
	{...restProps}
>
	{#if src}
		<img {src} {alt} class="size-full object-cover" loading="lazy" draggable="false" />
	{/if}
	{@render children?.()}
</div>
