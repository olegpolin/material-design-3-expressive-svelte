<script lang="ts">
	import type { Snippet } from "svelte";
	import { ToggleGroup as ToggleGroupPrimitive } from "bits-ui";
	import { cn } from "#lib/utils.js";
	import { Icon } from "#lib/components/ui/icon/index.js";
	import { ripple } from "#lib/m3/ripple.svelte.js";

	/*
	 * Segment: 40dp high, 1dp `outline` stroke (neighbours overlap by 1dp, the selected one on top),
	 * 12dp min side padding, label-large. Selected: secondary-container + an 18dp checkmark that
	 * scales in from the bottom-left (fast-spatial) and fades in (default-effects) while the label
	 * slides over. An optional `icon` shows while unselected and is replaced by the checkmark.
	 */
	let {
		ref = $bindable(null),
		value,
		icon,
		disabled = false,
		class: className,
		children,
		...restProps
	}: Omit<ToggleGroupPrimitive.ItemProps, "children" | "child"> & {
		children?: Snippet;
		/** Optional Material Symbols icon shown while unselected. */
		icon?: string;
	} = $props();
</script>

<ToggleGroupPrimitive.Item bind:ref {value} {disabled} {...restProps}>
	{#snippet child({ props, pressed })}
		<button
			{...props}
			data-slot="segmented-button-item"
			class={cn(
				"group/segment relative -ms-px inline-flex h-10 min-w-12 cursor-pointer items-center justify-center px-3 whitespace-nowrap select-none type-label-lg first:ms-0",
				"border border-outline text-on-surface first:rounded-s-full last:rounded-e-full",
				// 48dp touch target (the segment is only 40dp high)
				"after:absolute after:inset-x-0 after:top-1/2 after:h-12 after:-translate-y-1/2 after:content-['']",
				"transition-[background-color,color] duration-spring-default-effects ease-spring-default-effects",
				"data-[state=on]:z-[1] data-[state=on]:bg-secondary-container data-[state=on]:text-on-secondary-container focus-visible:z-[2]",
				"disabled:pointer-events-none disabled:border-on-surface/12 disabled:text-on-surface/38 disabled:data-[state=on]:bg-on-surface/12",
				className
			)}
			{@attach ripple()}
		>
			<span
				aria-hidden="true"
				class={cn(
					"relative inline-flex h-[18px] shrink-0 overflow-visible transition-[width] duration-spring-fast-spatial ease-spring-fast-spatial",
					icon || pressed ? "w-[26px]" : "w-0"
				)}
			>
				<span
					class={cn(
						"absolute start-0 top-0 inline-flex origin-bottom-left [transition:scale_var(--md-sys-motion-spring-fast-spatial-duration)_var(--md-sys-motion-spring-fast-spatial-easing),opacity_var(--md-sys-motion-spring-default-effects-duration)_var(--md-sys-motion-spring-default-effects-easing)]",
						pressed ? "scale-100 opacity-100" : "scale-0 opacity-0"
					)}
				>
					<Icon name="check" size={18} />
				</span>
				{#if icon}
					<span
						class={cn(
							"absolute start-0 top-0 inline-flex transition-opacity duration-spring-default-effects ease-spring-default-effects",
							pressed ? "opacity-0" : "opacity-100"
						)}
					>
						<Icon name={icon} size={18} />
					</span>
				{/if}
			</span>
			{@render children?.()}
		</button>
	{/snippet}
</ToggleGroupPrimitive.Item>
