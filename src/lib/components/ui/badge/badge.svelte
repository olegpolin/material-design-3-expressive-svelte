<script lang="ts" module>
	import { type VariantProps, tv } from "tailwind-variants";

	/**
	 * M3 badge (navigation-containment.md §16): `error` container, `on-error` label-small text.
	 * Small: 6 × 6dp dot. Large: 16dp tall, min 16dp wide, 4dp horizontal padding, max 34dp ("999+").
	 */
	export const badgeVariants = tv({
		base: "pointer-events-none inline-flex shrink-0 items-center justify-center rounded-m3-full bg-error text-on-error select-none",
		variants: {
			size: {
				small: "size-1.5",
				large: "type-label-sm h-4 min-w-4 max-w-[34px] px-1 tabular-nums whitespace-nowrap",
			},
			/** Placement when the badge wraps an anchor (icon). Offsets per Compose BadgedBox. */
			anchored: {
				true: "absolute",
				false: "",
			},
			/** Kept for shadcn API compatibility. M3 has a single (error) badge color, so it is ignored. */
			variant: {
				default: "",
				secondary: "",
				destructive: "",
				outline: "",
				ghost: "",
				link: "",
			},
		},
		compoundVariants: [
			// Small: badge's bottom-leading corner 6 × 6dp in from the anchor's top-trailing corner.
			{ anchored: true, size: "small", class: "top-0 start-[calc(100%-6px)]" },
			// Large: 14dp vertical overlap (16 − 14 = 2dp above), 12dp horizontal overlap.
			{ anchored: true, size: "large", class: "-top-0.5 start-[calc(100%-12px)]" },
		],
		defaultVariants: {
			size: "small",
			anchored: false,
			variant: "default",
		},
	});

	export type BadgeVariant = VariantProps<typeof badgeVariants>["variant"];
	export type BadgeSize = VariantProps<typeof badgeVariants>["size"];

	/** "999+" style label. */
	export function badgeLabel(count: number, max: number) {
		return count > max ? `${max}+` : `${count}`;
	}
</script>

<script lang="ts">
	import { cn, type WithElementRef } from "#lib/utils.js";
	import type { HTMLAttributes } from "svelte/elements";

	/**
	 * Standalone: `<Badge />` (dot), `<Badge count={3} />`, `<Badge content="New" />`.
	 * Wrapping an icon: `<Badge count={12}><Icon name="mail" /></Badge>`; the badge positions itself
	 * at the anchor's top-trailing corner with the spec offsets.
	 */
	let {
		ref = $bindable(null),
		class: className,
		badgeClass,
		variant = "default",
		count,
		max = 999,
		content,
		dot,
		invisible = false,
		children,
		"aria-label": ariaLabel,
		...restProps
	}: WithElementRef<HTMLAttributes<HTMLSpanElement>> & {
		variant?: BadgeVariant;
		/** Number shown in a large badge; capped at `max` ("999+"). 0 hides the badge unless `dot`. */
		count?: number;
		/** Default 999 (spec max size 16 × 34dp, "999+"). */
		max?: number;
		/** Arbitrary short label for a large badge (overrides `count`). */
		content?: string;
		/** Force the small 6dp dot. Default when neither `count` nor `content` is set. */
		dot?: boolean;
		/** Hide the badge (keeps the anchor). */
		invisible?: boolean;
		/** Classes for the badge itself when wrapping children (`class` goes on the wrapper). */
		badgeClass?: string;
	} = $props();

	let label = $derived(content ?? (count != null && count > 0 ? badgeLabel(count, max) : undefined));
	let size = $derived<BadgeSize>(dot || label === undefined ? "small" : "large");
	let hidden = $derived(invisible || (!dot && content == null && count != null && count <= 0));
	// Screen-reader text (the visual label is aria-hidden): explicit aria-label, else the label.
	let a11yLabel = $derived(ariaLabel ?? label);
</script>

{#snippet badgeContent()}
	{#if size === "large"}<span aria-hidden="true">{label}</span>{/if}
	{#if a11yLabel}<span class="sr-only">{a11yLabel}</span>{/if}
{/snippet}

{#if children}
	<span
		bind:this={ref}
		data-slot="badge-anchor"
		class={cn("relative inline-flex shrink-0 align-middle", className)}
		{...restProps}
	>
		{@render children()}
		{#if !hidden}
			<span
				data-slot="badge"
				data-size={size}
				class={cn(badgeVariants({ size, anchored: true, variant }), badgeClass)}
			>
				{@render badgeContent()}
			</span>
		{/if}
	</span>
{:else if !hidden}
	<span
		bind:this={ref}
		data-slot="badge"
		data-size={size}
		class={cn(badgeVariants({ size, variant }), className)}
		{...restProps}
	>
		{@render badgeContent()}
	</span>
{/if}
