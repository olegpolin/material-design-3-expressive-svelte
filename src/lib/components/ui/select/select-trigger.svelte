<script lang="ts">
	import { Select as SelectPrimitive } from "bits-ui";
	import { cn, type WithoutChild } from "#lib/utils.js";
	import { Icon } from "#lib/components/ui/icon/index.js";

	/**
	 * M3 outlined text-field look (inputs-selection.md §5.1/§5.4): 56dp, 4dp corner, 1dp `outline`
	 * → `on-surface` hover → 2dp `primary` focused/open, `error` when aria-invalid, 24dp trailing arrow.
	 * `size="sm"` is a dense 40dp variant (not an M3 spec size) kept for shadcn compatibility.
	 *
	 * `label` adds the outlined field's floating label: it rests in the field while nothing is selected and
	 * floats into a notch in the outline once a value is chosen or the menu is open / focused. While it rests,
	 * the `select-value` child (your placeholder text) is hidden, like a text field placeholder.
	 */
	let {
		ref = $bindable(null),
		class: className,
		children,
		size = "default",
		label,
		required = false,
		...restProps
	}: WithoutChild<SelectPrimitive.TriggerProps> & {
		size?: "sm" | "default";
		/** Floating label (default size only). */
		label?: string;
		/** Adds the required asterisk after the label. */
		required?: boolean;
	} = $props();

	const labelled = $derived(!!label && size === "default");
</script>

<SelectPrimitive.Trigger
	bind:ref
	data-slot="select-trigger"
	data-size={size}
	data-labelled={labelled || undefined}
	class={cn(
		"group/select-trigger type-body-lg relative flex w-fit min-w-0 cursor-pointer items-center justify-between gap-4 rounded-m3-xs border border-outline bg-transparent ps-4 pe-3 text-start whitespace-nowrap text-on-surface outline-none select-none",
		"data-[size=default]:h-14 data-[size=sm]:h-10",
		"transition-[border-color,box-shadow] duration-spring-fast-effects ease-spring-fast-effects",
		"hover:border-on-surface",
		"focus-visible:border-m3-primary focus-visible:shadow-[inset_0_0_0_1px_var(--md-sys-color-primary)]",
		"data-open:border-m3-primary data-open:shadow-[inset_0_0_0_1px_var(--md-sys-color-primary)]",
		"data-placeholder:text-on-surface-variant",
		"aria-invalid:border-error aria-invalid:hover:border-on-error-container aria-invalid:focus-visible:border-error aria-invalid:focus-visible:shadow-[inset_0_0_0_1px_var(--md-sys-color-error)] aria-invalid:data-open:border-error aria-invalid:data-open:shadow-[inset_0_0_0_1px_var(--md-sys-color-error)]",
		"disabled:pointer-events-none disabled:cursor-default disabled:border-on-surface/12 disabled:text-on-surface/38",
		"*:data-[slot=select-value]:flex *:data-[slot=select-value]:items-center *:data-[slot=select-value]:gap-3 *:data-[slot=select-value]:truncate",
		"[&_[data-slot=icon]]:pointer-events-none",
		// with a floating label the outline is drawn by the notched segments below
		"data-labelled:border-0 data-labelled:shadow-none!",
		className
	)}
	{...restProps}
>
	{#if labelled}
		<span aria-hidden="true" class="st-outline pointer-events-none absolute inset-0 flex">
			<span class="st-start"></span>
			<span class="st-notch">
				<span class="st-notch-text">{label}{#if required}&nbsp;*{/if}</span>
				<span class="st-notch-top start-0 origin-left rtl:origin-right"></span>
				<span class="st-notch-top end-0 origin-right rtl:origin-left"></span>
			</span>
			<span class="st-end"></span>
		</span>
		<span
			class="st-label type-body-lg pointer-events-none absolute start-4 top-4 origin-[0_50%] whitespace-nowrap select-none rtl:origin-[100%_50%]"
		>
			{label}{#if required}<span aria-hidden="true">&nbsp;*</span>{/if}
		</span>
	{/if}
	{@render children?.()}
	<Icon
		name="arrow_drop_down"
		class="text-on-surface-variant transition-transform duration-spring-fast-spatial ease-spring-fast-spatial group-disabled/select-trigger:text-on-surface/38 group-aria-invalid/select-trigger:text-error group-data-open/select-trigger:rotate-180"
	/>
</SelectPrimitive.Trigger>

<style>
	/* Notched outline + floating label, mirroring text-field.svelte (inputs-selection.md §5). */
	.st-outline {
		color: var(--md-sys-color-outline);
		--st-ow: 1px;
		transition: color var(--md-sys-motion-spring-fast-effects-duration) var(--md-sys-motion-spring-fast-effects-easing);
	}
	.st-outline > span {
		border-color: currentColor;
		border-style: solid;
		transition: border-width var(--md-sys-motion-spring-fast-spatial-duration)
			var(--md-sys-motion-spring-fast-spatial-easing);
	}
	.st-start {
		width: 12px;
		flex-shrink: 0;
		border-width: 0;
		border-block-width: var(--st-ow);
		border-inline-start-width: var(--st-ow);
		border-start-start-radius: var(--md-sys-shape-corner-extra-small);
		border-end-start-radius: var(--md-sys-shape-corner-extra-small);
	}
	.st-notch {
		position: relative;
		flex-shrink: 0;
		max-width: calc(100% - 24px);
		overflow: hidden;
		border-width: 0;
		border-block-end-width: var(--st-ow);
	}
	.st-notch-text {
		display: block;
		visibility: hidden;
		height: 0;
		padding-inline: 4px;
		font-family: var(--md-ref-typeface-plain);
		font-size: 12px;
		letter-spacing: 0.375px;
		white-space: nowrap;
	}
	.st-notch-top {
		position: absolute;
		top: 0;
		width: calc(50% + 0.5px);
		height: 0;
		border-top: var(--st-ow) solid currentColor;
		transition:
			scale var(--md-sys-motion-spring-fast-effects-duration) var(--md-sys-motion-spring-fast-effects-easing),
			border-width var(--md-sys-motion-spring-fast-spatial-duration) var(--md-sys-motion-spring-fast-spatial-easing);
	}
	.st-end {
		flex: 1 1 auto;
		border-width: 0;
		border-block-width: var(--st-ow);
		border-inline-end-width: var(--st-ow);
		border-start-end-radius: var(--md-sys-shape-corner-extra-small);
		border-end-end-radius: var(--md-sys-shape-corner-extra-small);
	}
	.st-label {
		color: var(--md-sys-color-on-surface-variant);
		transition:
			translate var(--md-sys-motion-spring-fast-spatial-duration) var(--md-sys-motion-spring-fast-spatial-easing),
			scale var(--md-sys-motion-spring-fast-spatial-duration) var(--md-sys-motion-spring-fast-spatial-easing),
			color var(--md-sys-motion-spring-fast-effects-duration) var(--md-sys-motion-spring-fast-effects-easing);
	}

	/* states: hover → on-surface; focused / open → 2dp primary; invalid → error; disabled → on-surface 12% */
	:global([data-slot="select-trigger"]:hover) .st-outline {
		color: var(--md-sys-color-on-surface);
	}
	:global([data-slot="select-trigger"]:hover) .st-label {
		color: var(--md-sys-color-on-surface);
	}
	:global([data-slot="select-trigger"]:is(:focus-visible, [data-state="open"])) .st-outline {
		color: var(--md-sys-color-primary);
		--st-ow: 2px;
	}
	:global([data-slot="select-trigger"]:is(:focus-visible, [data-state="open"])) .st-label {
		color: var(--md-sys-color-primary);
	}
	:global([data-slot="select-trigger"][aria-invalid="true"]) .st-outline,
	:global([data-slot="select-trigger"][aria-invalid="true"]) .st-label {
		color: var(--md-sys-color-error);
	}
	:global([data-slot="select-trigger"][aria-invalid="true"]:hover:not([data-state="open"])) .st-outline,
	:global([data-slot="select-trigger"][aria-invalid="true"]:hover:not([data-state="open"])) .st-label {
		color: var(--md-sys-color-on-error-container);
	}
	:global([data-slot="select-trigger"]:disabled) .st-outline {
		color: color-mix(in srgb, var(--md-sys-color-on-surface) 12%, transparent);
	}
	:global([data-slot="select-trigger"]:disabled) .st-label {
		color: color-mix(in srgb, var(--md-sys-color-on-surface) 38%, transparent);
	}

	/* floated: a value is selected, or the menu is open / keyboard-focused */
	:global([data-slot="select-trigger"]:is(:not([data-placeholder]), [data-state="open"], :focus-visible)) .st-label {
		translate: 0 -28px;
		scale: 0.75;
	}
	:global([data-slot="select-trigger"]:is(:not([data-placeholder]), [data-state="open"], :focus-visible))
		.st-notch-top {
		scale: 0 1;
	}
	/* resting label covers the value slot: hide the placeholder text until the label floats */
	:global([data-slot="select-trigger"][data-labelled][data-placeholder]:not([data-state="open"], :focus-visible))
		> :global([data-slot="select-value"]) {
		opacity: 0;
	}
</style>
