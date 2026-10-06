<script lang="ts" module>
	import { tv } from "tailwind-variants";

	/**
	 * M3 dialog container (navigation-containment.md §11).
	 *   basic        min 280 / max 560dp wide, corner extra-large 28dp, 24dp padding,
	 *                surface-container-high, level3; window insets 24dp horizontal / 80dp vertical.
	 *   full-screen  0dp corners, `surface`, 56dp header. With `fullscreen={true}` it only goes
	 *                full-screen below 600dp (compact windows) and keeps the basic shape (max 560dp)
	 *                above; `fullscreen="always"` is full-screen at every width.
	 * Motion (recommendation, §11 Motion): enter = fade (default-effects) + scale 0.8 → 1
	 * (default-spatial); exit = fade + scale to 0.9 on fast-effects. Full-screen layouts slide up
	 * 64dp instead of scaling.
	 */
	export const dialogContentVariants = tv({
		base: [
			"fixed inset-0 z-50 m-auto flex flex-col text-on-surface outline-none",
			"[transition:scale_var(--md-sys-motion-spring-default-spatial-duration)_var(--md-sys-motion-spring-default-spatial-easing),translate_var(--md-sys-motion-spring-default-spatial-duration)_var(--md-sys-motion-spring-default-spatial-easing),opacity_var(--md-sys-motion-spring-default-effects-duration)_var(--md-sys-motion-spring-default-effects-easing)]",
			"data-starting-style:scale-80 data-starting-style:opacity-0",
			"data-ending-style:scale-90 data-ending-style:opacity-0 data-ending-style:[transition:scale_var(--md-sys-motion-spring-fast-effects-duration)_var(--md-sys-motion-spring-fast-effects-easing),translate_var(--md-sys-motion-spring-fast-effects-duration)_var(--md-sys-motion-spring-fast-effects-easing),opacity_var(--md-sys-motion-spring-fast-effects-duration)_var(--md-sys-motion-spring-fast-effects-easing)]",
		],
		variants: {
			layout: {
				basic:
					"h-fit max-h-[calc(100dvh-160px)] w-fit max-w-[min(560px,calc(100vw-48px))] min-w-[280px] gap-4 rounded-m3-xl bg-surface-container-high p-6 shadow-m3-3",
				// full-screen: slides up 64dp + fades instead of scaling
				fullscreen:
					"max-[599px]:data-starting-style:translate-y-16 max-[599px]:data-starting-style:scale-100! max-[599px]:data-ending-style:translate-y-16 max-[599px]:data-ending-style:scale-100! bg-surface min-[600px]:h-fit min-[600px]:max-h-[calc(100dvh-160px)] min-[600px]:w-[min(560px,calc(100vw-48px))] min-[600px]:overflow-hidden min-[600px]:rounded-m3-xl min-[600px]:bg-surface-container-high min-[600px]:shadow-m3-3",
				always:
					"bg-surface data-starting-style:translate-y-16 data-starting-style:scale-100! data-ending-style:translate-y-16 data-ending-style:scale-100!",
			},
		},
		defaultVariants: { layout: "basic" },
	});
</script>

<script lang="ts">
	import { Dialog as DialogPrimitive } from "bits-ui";
	import { Icon } from "#lib/components/ui/icon/index.js";
	import { cn, type WithoutChildrenOrChild } from "#lib/utils.js";
	import DialogOverlay from "./dialog-overlay.svelte";
	import DialogPortal from "./dialog-portal.svelte";
	import { ripple } from "#lib/m3/ripple.svelte.js";
	import { DIALOG_ICON_BUTTON, DialogLayout, setDialogLayout } from "./context.svelte.js";
	import type { ComponentProps, Snippet } from "svelte";

	let {
		ref = $bindable(null),
		class: className,
		portalProps,
		children,
		icon,
		fullscreen = false,
		showCloseButton = false,
		closeIcon = "close",
		closeLabel = "Close",
		...restProps
	}: WithoutChildrenOrChild<DialogPrimitive.ContentProps> & {
		portalProps?: WithoutChildrenOrChild<ComponentProps<typeof DialogPortal>>;
		children: Snippet;
		/** Hero icon (Material Symbol name): 24dp `secondary`, centered; centers the header. */
		icon?: string;
		/** Full-screen dialog: `true` below 600dp, `"always"` at every width. */
		fullscreen?: boolean | "always";
		/** Basic dialogs have no close icon in M3; full-screen dialogs render it in `Dialog.Header`. */
		showCloseButton?: boolean;
		closeIcon?: string;
		closeLabel?: string;
	} = $props();

	const layout = setDialogLayout(
		new DialogLayout(() => ({ fullscreen, hasIcon: !!icon && !fullscreen, closeIcon, closeLabel }))
	);

	let variant = $derived<"basic" | "fullscreen" | "always">(
		fullscreen === "always" ? "always" : fullscreen ? "fullscreen" : "basic"
	);
</script>

<DialogPortal {...portalProps}>
	<DialogOverlay />
	<DialogPrimitive.Content
		bind:ref
		data-slot="dialog-content"
		data-layout={variant}
		data-icon={layout.hasIcon || undefined}
		class={cn(dialogContentVariants({ layout: variant }), className)}
		{...restProps}
	>
		{#if icon && !fullscreen}
			<Icon name={icon} size={24} class="self-center text-m3-secondary" />
		{/if}
		{@render children?.()}
		{#if showCloseButton && !fullscreen}
			<DialogPrimitive.Close data-slot="dialog-close">
				{#snippet child({ props })}
					<button
						{...props}
						type="button"
						class={cn(DIALOG_ICON_BUTTON, "absolute! end-2 top-2")}
						aria-label={closeLabel}
						{@attach ripple()}
					>
						<Icon name={closeIcon} size={24} />
					</button>
				{/snippet}
			</DialogPrimitive.Close>
		{/if}
	</DialogPrimitive.Content>
</DialogPortal>
