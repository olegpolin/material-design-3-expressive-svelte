<script lang="ts">
	import { ripple } from "#lib/m3/ripple.svelte.js";
	import { cn, type WithElementRef } from "#lib/utils.js";
	import type { Snippet } from "svelte";
	import type { HTMLAnchorAttributes, HTMLAttributes } from "svelte/elements";

	/**
	 * One carousel slide (navigation-containment.md §14): 28dp corners, `surface-container-highest`
	 * placeholder behind the image, level0 → level1 on hover with an on-surface state layer when
	 * interactive. In keyline layouts the image keeps the large-item size and is masked (clipped) by
	 * the item, and the label fades out as the item shrinks.
	 */
	let {
		ref = $bindable(null),
		class: className,
		src,
		alt = "",
		label,
		supportingText,
		href,
		onclick,
		children,
		...restProps
	}: WithElementRef<HTMLAttributes<HTMLDivElement>> & {
		src?: string;
		alt?: string;
		/** Text overlay at the bottom (title-medium); also the slide's accessible name. */
		label?: string;
		supportingText?: string;
		href?: HTMLAnchorAttributes["href"];
		onclick?: (e: MouseEvent) => void;
		/** Custom content, rendered over the image. */
		children?: Snippet;
	} = $props();

	const RIPPLE = { color: "var(--md-sys-color-on-surface)" };

	const ITEM =
		"relative block size-full overflow-hidden rounded-m3-xl bg-surface-container-highest p-0 text-start text-on-surface no-underline focus-visible:outline-offset-[-3px] [transition:box-shadow_var(--md-sys-motion-spring-default-effects-duration)_var(--md-sys-motion-spring-default-effects-easing)] " +
		// keyline layouts: positioned + masked by the carousel (CSS vars written on the slide)
		"group-data-keylines/carousel:absolute group-data-keylines/carousel:inset-y-0 group-data-keylines/carousel:start-0 group-data-keylines/carousel:w-[var(--carousel-w,100%)] group-data-keylines/carousel:translate-x-[var(--carousel-x,0px)]";
</script>

{#snippet content()}
	{#if src}
		<img
			{src}
			{alt}
			draggable="false"
			loading="lazy"
			class="pointer-events-none absolute inset-0 size-full max-w-none object-cover select-none group-data-keylines/carousel:right-auto group-data-keylines/carousel:left-1/2 group-data-keylines/carousel:w-[var(--carousel-large,100%)] group-data-keylines/carousel:-translate-x-1/2"
		/>
	{/if}
	{@render children?.()}
	{#if label || supportingText}
		<span
			class="pointer-events-none absolute inset-x-0 bottom-0 flex flex-col bg-linear-to-t from-scrim/60 to-transparent px-4 pt-10 pb-4 text-white opacity-[var(--carousel-largeness,1)]"
		>
			{#if label}<span class="truncate type-title-md">{label}</span>{/if}
			{#if supportingText}<span class="truncate type-body-md opacity-80">{supportingText}</span>{/if}
		</span>
	{/if}
{/snippet}

<div
	bind:this={ref}
	data-slot="carousel-item"
	role="group"
	aria-roledescription="slide"
	aria-label={label ?? (alt || undefined)}
	class={cn(
		"relative h-full min-w-0 flex-none",
		"group-data-keylines/carousel:w-[var(--carousel-step,200px)] group-data-keylines/carousel:last:me-[var(--carousel-end,0px)]",
		"group-data-[layout=uncontained]/carousel:w-(--carousel-item-width) group-data-[layout=uncontained]/carousel:me-2 group-data-[layout=uncontained]/carousel:last:me-4",
		"group-data-[layout=full-screen]/carousel:basis-full group-data-[axis=x]/carousel:group-data-[layout=full-screen]/carousel:me-4 group-data-[axis=y]/carousel:group-data-[layout=full-screen]/carousel:mb-4 group-data-[layout=full-screen]/carousel:last:m-0",
		className
	)}
	{...restProps}
>
	{#if href}
		<a {href} class={cn(ITEM, "cursor-pointer hover:shadow-m3-1")} {onclick} {@attach ripple(RIPPLE)}>
			{@render content()}
		</a>
	{:else if onclick}
		<button
			type="button"
			class={cn(ITEM, "cursor-pointer hover:shadow-m3-1")}
			{onclick}
			{@attach ripple(RIPPLE)}
		>
			{@render content()}
		</button>
	{:else}
		<!-- not interactive: still focusable so the carousel's arrow-key navigation can reach it -->
		<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
		<div class={ITEM} tabindex="0">
			{@render content()}
		</div>
	{/if}
</div>
