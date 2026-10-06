<script lang="ts" module>
	export type ListItemAvatar = string | { src: string; alt?: string };
</script>

<script lang="ts">
	import { Icon } from "#lib/components/ui/icon/index.js";
	import { ripple } from "#lib/m3/ripple.svelte.js";
	import { cn, type WithElementRef } from "#lib/utils.js";
	import type { Snippet } from "svelte";
	import type { HTMLAnchorAttributes, HTMLLiAttributes } from "svelte/elements";

	/**
	 * M3 Expressive list item (navigation-containment.md §12).
	 * Heights 56 / 72 / 88dp for one / two / three lines; 16dp leading / trailing padding, 10dp
	 * top / bottom around the text, 12dp between leading, content and trailing. Three-line items top-align their
	 * leading / trailing elements, shorter ones center them.
	 * Type: headline body-large on-surface, supporting body-medium on-surface-variant, overline and
	 * trailing text label-small on-surface-variant. Selected: secondary-container /
	 * on-secondary-container, emphasized headline, 16dp corners.
	 * Shape morph (fast-spatial): hover 12dp, focus / press 16dp; segmented rest 4dp inner / 16dp outer.
	 * Colors change on default-effects.
	 */
	type Props = WithElementRef<Omit<HTMLLiAttributes, "onclick">> & {
		headline?: string;
		supportingText?: string;
		overline?: string;
		/** Line count (sets the height); inferred from overline / supporting text when omitted. */
		lines?: 1 | 2 | 3;
		leading?: Snippet;
		/** Material Symbol name, 24dp, on-surface-variant. */
		leadingIcon?: string;
		/** 40dp avatar: initials / text, or `{ src, alt }`. primary-container / on-primary-container. */
		leadingAvatar?: ListItemAvatar;
		/** 56 × 56dp image, 8dp corners. */
		leadingImage?: string;
		/** 114 × 64dp video thumbnail, 8dp corners. */
		leadingVideo?: string;
		leadingAlt?: string;
		trailing?: Snippet;
		trailingIcon?: string;
		/** Trailing supporting text (label-small), e.g. "100+" or a time. */
		trailingText?: string;
		/** Makes the item a link. */
		href?: HTMLAnchorAttributes["href"];
		/** Makes the item a button. */
		onclick?: (e: MouseEvent) => void;
		selected?: boolean;
		disabled?: boolean;
		/** Headline content when no `headline` string is given. */
		children?: Snippet;
	};

	let {
		ref = $bindable(null),
		class: className,
		headline,
		supportingText,
		overline,
		lines,
		leading,
		leadingIcon,
		leadingAvatar,
		leadingImage,
		leadingVideo,
		leadingAlt = "",
		trailing,
		trailingIcon,
		trailingText,
		href,
		onclick,
		selected,
		disabled = false,
		children,
		...restProps
	}: Props = $props();

	let lineCount = $derived(lines ?? (overline && supportingText ? 3 : overline || supportingText ? 2 : 1));
	let interactive = $derived(!!href || !!onclick);

	function innerClass(count: number) {
		return cn(
			"flex w-full gap-3 rounded-[inherit] ps-4 pe-4 text-start text-inherit outline-offset-[-3px]",
			"group-data-disabled/list-item:opacity-38",
			// Three-line items top-align everything inside 10dp padding. Shorter items center their
			// slots: the row has 8dp padding (a 40dp avatar still fits 56dp) and the text column
			// adds 2dp, so text keeps the expressive 10dp. Tall media (56dp image, 64dp video)
			// grows the item to 72 / 80dp.
			count === 3
				? "min-h-[88px] items-start py-2.5"
				: count === 2
					? "min-h-[72px] items-center py-2"
					: "min-h-14 items-center py-2"
		);
	}
</script>

{#snippet body()}
	{#if leading}
		{@render leading()}
	{:else if leadingIcon}
		<Icon
			name={leadingIcon}
			size={24}
			fill={selected}
			class="text-on-surface-variant group-data-selected/list-item:text-on-secondary-container"
		/>
	{:else if leadingAvatar}
		<span
			class="flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-m3-full bg-primary-container type-title-md text-on-primary-container"
		>
			{#if typeof leadingAvatar === "string"}
				{leadingAvatar}
			{:else}
				<img src={leadingAvatar.src} alt={leadingAvatar.alt ?? ""} class="size-full object-cover" />
			{/if}
		</span>
	{:else if leadingImage}
		<img
			src={leadingImage}
			alt={leadingAlt}
			class="size-14 shrink-0 rounded-m3-sm bg-surface-container-highest object-cover"
			loading="lazy"
		/>
	{:else if leadingVideo}
		<span
			class="relative flex h-16 w-[114px] shrink-0 items-center justify-center overflow-hidden rounded-m3-sm bg-surface-container-highest"
		>
			<img src={leadingVideo} alt={leadingAlt} class="absolute inset-0 size-full object-cover" loading="lazy" />
			<span
				class="relative flex size-8 items-center justify-center rounded-m3-full bg-scrim/40 text-white"
			>
				<Icon name="play_arrow" fill size={20} />
			</span>
		</span>
	{/if}
	<span class={["flex min-w-0 flex-1 flex-col", lineCount < 3 && "py-0.5"]}>
		{#if overline}
			<span
				class="truncate type-label-sm text-on-surface-variant group-data-selected/list-item:text-on-secondary-container"
			>
				{overline}
			</span>
		{/if}
		<span
			class={cn(
				"truncate text-on-surface group-data-selected/list-item:text-on-secondary-container",
				selected ? "type-body-lg-emphasized" : "type-body-lg"
			)}
		>
			{#if headline}{headline}{:else}{@render children?.()}{/if}
		</span>
		{#if supportingText}
			<span
				class={cn(
					"type-body-md text-on-surface-variant group-data-selected/list-item:text-on-secondary-container",
					lineCount === 3 && !overline ? "line-clamp-2" : "truncate"
				)}
			>
				{supportingText}
			</span>
		{/if}
	</span>
	{#if trailing}
		{@render trailing()}
	{:else if trailingIcon}
		<Icon
			name={trailingIcon}
			size={24}
			class="text-on-surface-variant group-data-selected/list-item:text-on-secondary-container"
		/>
	{:else if trailingText}
		<span
			class="shrink-0 type-label-sm text-on-surface-variant group-data-selected/list-item:text-on-secondary-container"
		>
			{trailingText}
		</span>
	{/if}
{/snippet}

<li
	bind:this={ref}
	data-slot="list-item"
	data-lines={lineCount}
	data-selected={selected || undefined}
	data-disabled={disabled || undefined}
	class={cn(
		"group/list-item relative list-none rounded-m3-none text-on-surface",
		"[transition:border-radius_var(--md-sys-motion-spring-fast-spatial-duration)_var(--md-sys-motion-spring-fast-spatial-easing),background-color_var(--md-sys-motion-spring-default-effects-duration)_var(--md-sys-motion-spring-default-effects-easing)]",
		// segmented: tiles on surface-container, 4dp inner / 16dp outer corners (also around subheaders)
		"group-data-[variant=segmented]/list:rounded-m3-xs group-data-[variant=segmented]/list:bg-surface-container",
		"group-data-[variant=segmented]/list:first:rounded-t-m3-lg group-data-[variant=segmented]/list:[:not([data-slot=list-item])+&]:rounded-t-m3-lg",
		"group-data-[variant=segmented]/list:[&:not(:has(+[data-slot=list-item]))]:rounded-b-m3-lg",
		// dividers between items, inset 16dp
		"group-data-dividers/list:[&+&]:before:absolute group-data-dividers/list:[&+&]:before:inset-x-4 group-data-dividers/list:[&+&]:before:top-0 group-data-dividers/list:[&+&]:before:h-px group-data-dividers/list:[&+&]:before:bg-outline-variant group-data-dividers/list:[&+&]:before:content-['']",
		// interaction shape morph
		interactive &&
			!disabled &&
			!selected &&
			"hover:rounded-m3-md! has-focus-visible:rounded-m3-lg! active:rounded-m3-lg!",
		selected && "rounded-m3-lg! bg-secondary-container! text-on-secondary-container",
		disabled && "pointer-events-none",
		className
	)}
	{...restProps}
>
	{#if href && !disabled}
		<a
			{href}
			aria-current={selected ? "page" : undefined}
			class={cn(innerClass(lineCount), "no-underline")}
			{onclick}
			{@attach ripple()}
		>
			{@render body()}
		</a>
	{:else if onclick}
		<button
			type="button"
			{disabled}
			aria-pressed={selected === undefined ? undefined : selected}
			class={cn(innerClass(lineCount), "cursor-pointer disabled:cursor-default")}
			{onclick}
			{@attach ripple()}
		>
			{@render body()}
		</button>
	{:else}
		<div class={innerClass(lineCount)} aria-disabled={disabled || undefined}>
			{@render body()}
		</div>
	{/if}
</li>

