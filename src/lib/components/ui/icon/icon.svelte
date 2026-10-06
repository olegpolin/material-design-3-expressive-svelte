<script lang="ts">
	import { cn, type WithElementRef } from "#lib/utils.js";
	import type { HTMLAttributes } from "svelte/elements";

	/**
	 * Material Symbols Rounded icon (variable font).
	 * `name` is the symbol ligature, e.g. "home", "favorite", "arrow_back".
	 * Sizes follow the M3 icon scale: 18 / 20 / 24 / 32 / 36 / 40 / 48.
	 */
	let {
		ref = $bindable(null),
		name,
		fill = false,
		weight = 400,
		grade = 0,
		size = 24,
		class: className,
		...restProps
	}: WithElementRef<HTMLAttributes<HTMLSpanElement>> & {
		name: string;
		fill?: boolean;
		weight?: 100 | 200 | 300 | 400 | 500 | 600 | 700;
		grade?: -25 | 0 | 200;
		size?: number;
	} = $props();

	let opsz = $derived(Math.max(20, Math.min(48, size)));
</script>

<span
	bind:this={ref}
	data-slot="icon"
	aria-hidden={restProps["aria-label"] ? undefined : "true"}
	class={cn("material-symbols-rounded m3-icon", className)}
	style:--m3-icon-fill={fill ? 1 : 0}
	style:--m3-icon-wght={weight}
	style:--m3-icon-grad={grade}
	style:--m3-icon-opsz={opsz}
	style:--m3-icon-size="{size}px"
	{...restProps}
>
	{name}
</span>
