<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import { fade } from 'svelte/transition';
	import { activeSpring, springCss } from '#lib/m3/motion.js';
	import { cn, type WithElementRef } from '#lib/utils.js';
	import { moveFocusBetweenItems } from '#lib/components/ui/navigation-bar/keyboard.js';
	import {
		RAIL_COLLAPSED_WIDTH,
		RAIL_EXPANDED_MAX,
		RAIL_EXPANDED_MIN,
		setNavigationRailContext
	} from './context.js';

	/**
	 * M3 Expressive navigation rail (navigation-containment.md §2): collapsed 96dp, expanded 220–360dp
	 * (hugs the widest item), standard or modal. Top space 44dp, header → first item 40dp,
	 * item spacing 4dp collapsed / 0dp expanded, expanded trailing space 20dp.
	 *
	 * Standard: the rail itself animates its width (defaultSpatial) and content reflows next to it.
	 * Modal: a 96dp placeholder stays in the layout; when expanded the rail floats over the content
	 * (surface-container, level2, 16dp end corners) with a 32% scrim, width on fastSpatial. The scrim is
	 * `position: fixed`; give an ancestor `contain: layout` (or a transform) to confine it to a frame.
	 * Opening the modal rail moves focus into it (the selected item) unless it is already inside, Tab is
	 * trapped while open, and closing returns focus to where it came from.
	 * Keyboard: Up / Down / Home / End move focus between the items (all items stay in the tab order).
	 * Transitions are suppressed for the first two frames so a rail whose `expanded` default is resolved
	 * on hydration (e.g. from a media query) appears in place instead of animating open on page load.
	 */
	let {
		ref = $bindable(null),
		expanded = $bindable(false),
		modal = false,
		align = 'top',
		expandedWidth,
		header,
		class: className,
		children,
		'aria-label': ariaLabel = 'Main',
		...restProps
	}: WithElementRef<HTMLAttributes<HTMLDivElement>> & {
		expanded?: boolean;
		/** Modal expanded rail: overlay + scrim, closes on scrim click, Escape or item activation. */
		modal?: boolean;
		/** Vertical alignment of the items (the header always stays at the top). */
		align?: 'top' | 'center';
		/** Fixed expanded width in px; by default the rail hugs its widest item / header (220–360). */
		expandedWidth?: number;
		/** Menu button + FAB slot. */
		header?: Snippet<[{ expanded: boolean }]>;
	} = $props();

	let navEl = $state<HTMLElement | null>(null);
	let measuredWidth = $state(RAIL_EXPANDED_MIN);

	// Hug the widest expanded content: every element with `data-rail-measure="<extra px>"` reports
	// its full (untruncated) scrollWidth plus the space around it.
	$effect(() => {
		if (!expanded || !navEl || expandedWidth) return;
		let w = 0;
		for (const el of navEl.querySelectorAll<HTMLElement>('[data-rail-measure]')) {
			w = Math.max(w, el.scrollWidth + Number(el.dataset.railMeasure || 0));
		}
		measuredWidth = Math.min(RAIL_EXPANDED_MAX, Math.max(RAIL_EXPANDED_MIN, Math.ceil(w)));
	});

	let targetWidth = $derived(
		expanded
			? Math.min(RAIL_EXPANDED_MAX, Math.max(RAIL_EXPANDED_MIN, expandedWidth ?? measuredWidth))
			: RAIL_COLLAPSED_WIDTH
	);

	let floating = $derived(modal && expanded);

	// Skip transitions until the first frames after hydration have painted.
	let settled = $state(false);
	$effect(() => {
		let id = requestAnimationFrame(() => {
			id = requestAnimationFrame(() => (settled = true));
		});
		return () => cancelAnimationFrame(id);
	});

	// Modal rail focus management: move focus in on open (if it is outside), restore it on close.
	$effect(() => {
		if (!floating || !navEl) return;
		const nav = navEl;
		const previous = document.activeElement instanceof HTMLElement ? document.activeElement : null;
		const returnTo = previous && !nav.contains(previous) ? previous : null;
		if (returnTo) {
			(
				nav.querySelector<HTMLElement>('.rail-item[aria-current="page"]') ??
				nav.querySelector<HTMLElement>('a[href], button:not([disabled])')
			)?.focus();
		}
		return () => {
			const active = document.activeElement;
			if (returnTo?.isConnected && (!active || active === document.body || nav.contains(active))) {
				returnTo.focus();
			}
		};
	});

	setNavigationRailContext({
		get expanded() {
			return expanded;
		},
		get modal() {
			return modal;
		},
		toggle() {
			expanded = !expanded;
		},
		itemActivated() {
			if (modal) expanded = false;
		}
	});

	function onNavKeydown(e: KeyboardEvent) {
		moveFocusBetweenItems(e, navEl, '.rail-item', 'vertical');
		trapFocus(e);
	}

	function trapFocus(e: KeyboardEvent) {
		if (!floating || e.key !== 'Tab' || !navEl) return;
		const focusables = [
			...navEl.querySelectorAll<HTMLElement>('a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])')
		];
		if (focusables.length === 0) return;
		const first = focusables[0];
		const last = focusables[focusables.length - 1];
		if (e.shiftKey && document.activeElement === first) {
			e.preventDefault();
			last.focus();
		} else if (!e.shiftKey && document.activeElement === last) {
			e.preventDefault();
			first.focus();
		}
	}

	function onWindowKeydown(e: KeyboardEvent) {
		if (floating && e.key === 'Escape') {
			e.preventDefault();
			expanded = false;
		}
	}
</script>

<svelte:window onkeydown={onWindowKeydown} />

<div
	bind:this={ref}
	data-slot="navigation-rail"
	data-expanded={expanded ? '' : undefined}
	data-modal={modal ? '' : undefined}
	data-settling={settled ? undefined : ''}
	class={cn('rail-root relative h-full shrink-0', className)}
	style:width="{modal ? RAIL_COLLAPSED_WIDTH : targetWidth}px"
	style:transition={modal ? undefined : `width ${springCss('default-spatial').transition}`}
	{...restProps}
>
	{#if floating}
		<div
			data-slot="navigation-rail-scrim"
			aria-hidden="true"
			class="fixed inset-0 z-40 bg-scrim/32"
			transition:fade={{ duration: activeSpring('default-effects').durationMs }}
			onclick={() => (expanded = false)}
		></div>
	{/if}
	<nav
		bind:this={navEl}
		aria-label={ariaLabel}
		aria-modal={floating ? 'true' : undefined}
		role={floating ? 'dialog' : undefined}
		class={cn(
			'flex h-full flex-col overflow-x-hidden pt-11',
			'transition-[background-color,box-shadow,border-radius] duration-spring-default-effects ease-spring-default-effects',
			modal ? 'absolute inset-y-0 start-0 z-50' : 'w-full',
			floating ? 'rounded-e-m3-lg bg-surface-container shadow-m3-2' : 'bg-surface',
			expanded && 'pb-5'
		)}
		style:width={modal ? `${targetWidth}px` : undefined}
		style:transition={modal
			? `width ${springCss('fast-spatial').transition}, background-color ${springCss('default-effects').transition}, box-shadow ${springCss('default-effects').transition}, border-radius ${springCss('default-effects').transition}`
			: undefined}
		onkeydown={onNavKeydown}
	>
		{#if header}
			<div data-slot="navigation-rail-header" class="mb-10 flex shrink-0 flex-col items-start gap-1">
				{@render header({ expanded })}
			</div>
		{/if}
		<div
			class={cn(
				'flex min-h-0 flex-1 flex-col overflow-x-hidden overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden',
				align === 'center' && 'justify-center'
			)}
		>
			<ul
				class="flex flex-col"
				style:gap={expanded ? '0px' : '4px'}
				style:transition="gap {springCss('default-spatial').transition}"
			>
				{@render children?.()}
			</ul>
		</div>
	</nav>
</div>

<style>
	.rail-root[data-settling],
	.rail-root[data-settling] :global(*) {
		transition: none !important;
	}
</style>
