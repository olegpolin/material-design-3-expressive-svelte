<script lang="ts">
	import { mode } from "mode-watcher";
	import { Toaster as Sonner, type ToasterProps as SonnerProps } from "svelte-sonner";
	import { Icon } from "#lib/components/ui/icon/index.js";
	import { LoadingIndicator } from "#lib/components/ui/loading-indicator/index.js";

	/**
	 * svelte-sonner host restyled as the M3 snackbar (navigation-containment.md §19):
	 * inverse-surface, 4dp corner, level 3, body-medium, 48dp single line / 68dp two lines,
	 * inverse-primary text-button actions, enter/exit scale 0.8 ↔ 1 (fast-spatial) + fade (fast-effects).
	 * One snackbar at a time (`visibleToasts = 1`), bottom-center, 12dp margin (8dp on phones).
	 * `toast()` from svelte-sonner and `snackbar()` from `#lib/components/ui/snackbar` both render here;
	 * mount it once.
	 */
	let {
		position = "bottom-center",
		offset = 12,
		mobileOffset = 8,
		visibleToasts = 1,
		closeButtonAriaLabel = "Dismiss",
		// Swipe sideways (or down, toward the edge it came from) to dismiss, like Android snackbars.
		swipeDirections = ["left", "right", "bottom"],
		...restProps
	}: SonnerProps = $props();
</script>

<Sonner
	theme={mode.current}
	data-m3-toaster=""
	class="toaster group"
	{position}
	{offset}
	{mobileOffset}
	{visibleToasts}
	{closeButtonAriaLabel}
	{...restProps}
>
	{#snippet loadingIcon()}
		<LoadingIndicator class="size-6" color="currentColor" />
	{/snippet}
	{#snippet successIcon()}
		<Icon name="check_circle" size={20} />
	{/snippet}
	{#snippet errorIcon()}
		<Icon name="error" size={20} />
	{/snippet}
	{#snippet infoIcon()}
		<Icon name="info" size={20} />
	{/snippet}
	{#snippet warningIcon()}
		<Icon name="warning" size={20} />
	{/snippet}
	{#snippet closeIcon()}
		<Icon name="close" size={24} />
	{/snippet}
</Sonner>

<style>
	/*
	 * svelte-sonner ships unlayered global CSS, so Tailwind utilities (layered) cannot override it.
	 * These rules use the M3 tokens directly; `:not(#\#)` lifts specificity above sonner's
	 * state selectors (data-mounted / data-removed / data-expanded combos).
	 */
	:global {
		[data-sonner-toaster][data-m3-toaster] {
			/* Compose SnackbarHost: max width 600dp, 12dp outer margin (8dp on Android / phones). */
			width: min(600px, calc(100vw - 2 * var(--offset-left, 12px)));
			font-family: var(--md-ref-typeface-plain);
		}
		@media (max-width: 600px) {
			[data-sonner-toaster][data-m3-toaster] {
				width: calc(100vw - 2 * var(--mobile-offset-left, 8px));
			}
		}

		[data-m3-toaster] [data-sonner-toast]:not(#\#) {
			/* Content-sized, centred inside the 600dp lane. */
			inset-inline: 0;
			margin-inline: auto;
			width: fit-content;
			max-width: 100%;
			transform-origin: center bottom;
			--y: scale(0.8);
			transition:
				transform var(--md-sys-motion-spring-fast-spatial-duration)
					var(--md-sys-motion-spring-fast-spatial-easing),
				opacity var(--md-sys-motion-spring-fast-effects-duration)
					var(--md-sys-motion-spring-fast-effects-easing),
				height var(--md-sys-motion-spring-fast-spatial-duration)
					var(--md-sys-motion-spring-fast-spatial-easing);
		}
		[data-m3-toaster] [data-sonner-toast][data-y-position='top']:not(#\#) {
			transform-origin: center top;
		}
		[data-m3-toaster] [data-sonner-toast][data-mounted='true']:not(#\#) {
			--y: scale(1);
		}
		[data-m3-toaster] [data-sonner-toast][data-mounted='true'][data-removed='true']:not(#\#),
		[data-m3-toaster] [data-sonner-toast][data-visible='false']:not(#\#) {
			--y: scale(0.8);
			opacity: 0;
		}
		[data-m3-toaster] [data-sonner-toast][data-swiping='true']:not(#\#) {
			transition: none;
		}
		/* A swiped-away snackbar leaves at full size (sonner's swipe-out keyframes reuse --y). */
		[data-m3-toaster] [data-sonner-toast][data-swipe-out='true'][data-removed='true']:not(#\#) {
			--y: scale(1);
		}

		/* ---- toast() (styled) toasts → M3 snackbar surface ---- */
		[data-m3-toaster] [data-sonner-toast][data-styled='true']:not(#\#) {
			display: flex;
			align-items: center;
			gap: 0;
			min-height: 48px;
			padding: 14px 16px;
			border: none;
			border-radius: var(--md-sys-shape-corner-extra-small);
			background: var(--md-sys-color-inverse-surface);
			color: var(--md-sys-color-inverse-on-surface);
			box-shadow: var(--md-sys-elevation-level3);
			font-family: var(--md-sys-typescale-body-medium-font);
			font-size: var(--md-sys-typescale-body-medium-size);
			line-height: var(--md-sys-typescale-body-medium-line-height);
			letter-spacing: var(--md-sys-typescale-body-medium-tracking);
			font-weight: var(--md-sys-typescale-body-medium-weight);
		}
		/* Next to a button the end padding drops to 8dp and the text gets 8dp extra spacing. */
		[data-m3-toaster] [data-sonner-toast][data-styled='true']:has([data-button], [data-close-button]):not(#\#) {
			padding-block: 4px;
			padding-inline-end: 8px;
		}
		[data-m3-toaster] [data-sonner-toast][data-styled='true']:has([data-button], [data-close-button]) [data-content]:not(#\#) {
			padding-block: 10px;
			padding-inline-end: 8px;
		}
		[data-m3-toaster] [data-sonner-toast][data-styled='true'] [data-content]:not(#\#) {
			gap: 0;
		}
		[data-m3-toaster] [data-sonner-toast][data-styled='true'] [data-title]:not(#\#),
		[data-m3-toaster] [data-sonner-toast][data-styled='true'] [data-description]:not(#\#) {
			color: inherit;
			font: inherit;
			line-height: inherit;
		}
		[data-m3-toaster] [data-sonner-toast][data-styled='true'] [data-icon]:not(#\#) {
			width: 24px;
			height: 24px;
			margin-inline: 0 12px;
			justify-content: center;
		}
		[data-m3-toaster] [data-sonner-toast][data-styled='true'] [data-button]:not(#\#),
		[data-m3-toaster] [data-sonner-toast][data-styled='true'] [data-close-button]:not(#\#) {
			position: relative;
			height: 40px;
			margin: 0;
			border: none;
			border-radius: var(--md-sys-shape-corner-full);
			background: transparent;
			cursor: pointer;
			transition: background-color var(--md-sys-motion-spring-fast-effects-duration)
				var(--md-sys-motion-spring-fast-effects-easing);
		}
		[data-m3-toaster] [data-sonner-toast][data-styled='true'] [data-button]:not(#\#) {
			padding: 0 12px;
			color: var(--md-sys-color-inverse-primary);
			font-family: var(--md-sys-typescale-label-large-font);
			font-size: var(--md-sys-typescale-label-large-size);
			line-height: var(--md-sys-typescale-label-large-line-height);
			letter-spacing: var(--md-sys-typescale-label-large-tracking);
			font-weight: var(--md-sys-typescale-label-large-weight);
		}
		[data-m3-toaster] [data-sonner-toast][data-styled='true'] [data-cancel]:not(#\#) {
			color: var(--md-sys-color-inverse-on-surface);
		}
		[data-m3-toaster] [data-sonner-toast][data-styled='true'] [data-close-button]:not(#\#) {
			order: 99;
			flex: none;
			display: grid;
			place-items: center;
			width: 40px;
			padding: 0;
			transform: none;
			inset: auto;
			color: var(--md-sys-color-inverse-on-surface);
		}
		/* State layers: hover 8%, focus / pressed 10% of the content color. */
		[data-m3-toaster] [data-sonner-toast][data-styled='true'] :is([data-button], [data-close-button]):hover:not(#\#) {
			background: color-mix(in srgb, currentColor calc(var(--md-sys-state-hover-opacity) * 100%), transparent);
		}
		[data-m3-toaster]
			[data-sonner-toast][data-styled='true']
			:is([data-button], [data-close-button]):is(:focus-visible, :active):not(#\#) {
			background: color-mix(in srgb, currentColor calc(var(--md-sys-state-pressed-opacity) * 100%), transparent);
		}
		[data-m3-toaster] [data-sonner-toast]:focus-visible:not(#\#),
		[data-m3-toaster] [data-sonner-toast] :is([data-button], [data-close-button]):focus-visible:not(#\#) {
			outline: 3px solid var(--md-sys-color-secondary);
			outline-offset: 2px;
		}
	}
</style>
