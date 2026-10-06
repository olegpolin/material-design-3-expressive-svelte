<script lang="ts">
	import { cn, type WithElementRef } from "#lib/utils.js";
	import type { HTMLButtonAttributes } from "svelte/elements";
	import { ripple } from "#lib/m3/ripple.svelte.js";

	/** 30dp round avatar centred in a 48dp tap target (inputs-selection.md §7.1). */
	let {
		ref = $bindable(null),
		src,
		alt = "",
		initials,
		label = "Account",
		class: className,
		type = "button",
		...restProps
	}: WithElementRef<HTMLButtonAttributes, HTMLButtonElement> & {
		src?: string;
		alt?: string;
		/** Shown when there is no image. */
		initials?: string;
		/** Accessible name of the button. */
		label?: string;
	} = $props();
</script>

<button
	bind:this={ref}
	{type}
	data-slot="search-bar-avatar"
	aria-label={label}
	class={cn("relative grid size-12 shrink-0 cursor-pointer place-items-center rounded-m3-full", className)}
	{...restProps}
	{@attach ripple()}
>
	{#if src}
		<img {src} {alt} class="size-[30px] rounded-m3-full object-cover" />
	{:else}
		<span
			class="type-label-md grid size-[30px] place-items-center rounded-m3-full bg-tertiary-container text-on-tertiary-container"
		>
			{initials}
		</span>
	{/if}
</button>
