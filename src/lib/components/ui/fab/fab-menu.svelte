<script lang="ts">
	import { tick, untrack, type Snippet } from "svelte";
	import { cn } from "#lib/utils.js";
	import { Icon } from "#lib/components/ui/icon/index.js";
	import { ripple } from "#lib/m3/ripple.svelte.js";
	import { activeSpring, animateSpring } from "#lib/m3/motion.js";
	import { FAB_CONTAINER_SIZE, FAB_CORNER, FAB_ICON_SIZE } from "./fab.svelte";
	import { setFabMenuContext, type FabMenuColor } from "./context.js";

	/*
	 * M3 Expressive FAB menu (docs/research/buttons.md §4, motion.md §4).
	 * - The FAB morphs into the 56dp round close button anchored at its top-trailing corner
	 *   (size 56/80/96 → 56, corner 16/20/28 → 28, icon 24/28/36 → 20, container → solid color)
	 *   on the fast-spatial spring.
	 * - Items appear bottom-up driven by a slow-effects "stagger" spring (0 → item count); each
	 *   revealed item grows out of its trailing edge (fast-spatial) and fades in (fast-effects).
	 */

	type FabMenuSize = "default" | "medium" | "large";

	let {
		open = $bindable(false),
		onOpenChange,
		color = "primary",
		size = "default",
		icon = "add",
		closeIcon = "close",
		label = "Open menu",
		closeLabel = "Close menu",
		scrim = false,
		class: className,
		children,
	}: {
		open?: boolean;
		onOpenChange?: (open: boolean) => void;
		/** Color set: `primary` | `secondary` | `tertiary` (FAB = *-container, close button = solid). */
		color?: FabMenuColor;
		/** Size of the FAB that opens the menu: `default` 56 | `medium` 80 | `large` 96. */
		size?: FabMenuSize;
		icon?: string;
		closeIcon?: string;
		/** Accessible name of the FAB while closed / open. */
		label?: string;
		closeLabel?: string;
		/** Dim the page behind the open menu (scrim at 32%). */
		scrim?: boolean;
		class?: string;
		/** `FabMenuItem`s (2–6). */
		children?: Snippet;
	} = $props();

	const menuId = $props.id();
	let root = $state<HTMLDivElement | null>(null);
	let toggleButton = $state<HTMLButtonElement | null>(null);
	let list = $state<HTMLDivElement | null>(null);

	// ---- item registry (order of registration = visual order, top → bottom)
	let items = $state.raw<symbol[]>([]);

	// ---- springs
	let progress = $state(0);
	let progressVelocity = 0;
	let cancelProgress: (() => void) | undefined;
	let stagger = $state(0);
	let staggerVelocity = 0;
	let cancelStagger: (() => void) | undefined;

	function animateTo(isOpen: boolean) {
		cancelProgress?.();
		cancelProgress = animateSpring(
			progress,
			isOpen ? 1 : 0,
			activeSpring("fast-spatial", root),
			(v, dv) => {
				progress = v;
				progressVelocity = dv;
			},
			{ velocity: progressVelocity }
		);
		cancelStagger?.();
		cancelStagger = animateSpring(
			stagger,
			isOpen ? items.length : 0,
			activeSpring("slow-effects", root),
			(v, dv) => {
				stagger = v;
				staggerVelocity = dv;
			},
			{ velocity: staggerVelocity, threshold: 0.01 }
		);
	}

	$effect(() => {
		const isOpen = open;
		untrack(() => animateTo(isOpen));
		return () => {
			cancelProgress?.();
			cancelStagger?.();
		};
	});

	// Compose animates an Int with visibilityThreshold 1: opening snaps the last step in.
	const visibleCount = $derived(
		open && items.length - stagger < 1 ? items.length : Math.max(0, Math.floor(stagger))
	);

	function setOpen(value: boolean) {
		if (open === value) return;
		open = value;
		onOpenChange?.(value);
	}

	async function toggle() {
		const opening = !open;
		setOpen(opening);
		if (opening) {
			await tick();
			list?.querySelector<HTMLElement>("[role=menuitem]:not([disabled])")?.focus();
		}
	}

	function close({ focusToggle = true } = {}) {
		setOpen(false);
		if (focusToggle) toggleButton?.focus();
	}

	setFabMenuContext({
		get color() {
			return color;
		},
		get open() {
			return open;
		},
		register(key) {
			items = [...items, key];
			return () => {
				items = items.filter((k) => k !== key);
			};
		},
		indexOf: (key) => items.indexOf(key),
		isVisible: (index) => index >= 0 && index >= items.length - visibleCount,
		close,
	});

	// ---- toggle FAB → close button morph (lerp on progress)
	const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
	const startSize = $derived(FAB_CONTAINER_SIZE[size]);
	const boxSize = $derived(lerp(startSize, 56, progress));
	const radius = $derived(Math.max(0, lerp(FAB_CORNER[size], 28, progress)));
	const iconSize = $derived(Math.max(1, lerp(FAB_ICON_SIZE[size], 20, progress)));
	const mix = $derived(Math.round(Math.min(1, Math.max(0, progress)) * 1000) / 10);
	const showScrim = $derived(scrim && (open || progress > 0.001));

	function onDocumentPointerDown(e: PointerEvent) {
		if (open && root && e.target instanceof Node && !root.contains(e.target)) close({ focusToggle: false });
	}

	function onDocumentKeyDown(e: KeyboardEvent) {
		if (open && e.key === "Escape") {
			e.preventDefault();
			close();
		}
	}

	function onFocusOut(e: FocusEvent) {
		if (open && root && !(e.relatedTarget instanceof Node && root.contains(e.relatedTarget)) && e.relatedTarget) {
			close({ focusToggle: false });
		}
	}

	function onListKeyDown(e: KeyboardEvent) {
		const entries = [...(list?.querySelectorAll<HTMLElement>("[role=menuitem]:not([disabled])") ?? [])];
		const i = entries.indexOf(document.activeElement as HTMLElement);
		let next = -1;
		if (e.key === "ArrowDown") next = (i + 1) % entries.length;
		else if (e.key === "ArrowUp") next = (i - 1 + entries.length) % entries.length;
		else if (e.key === "Home") next = 0;
		else if (e.key === "End") next = entries.length - 1;
		if (next < 0) return;
		e.preventDefault();
		entries[next]?.focus();
	}
</script>

<svelte:document onpointerdown={onDocumentPointerDown} onkeydown={onDocumentKeyDown} />

<div
	bind:this={root}
	data-slot="fab-menu"
	data-state={open ? "open" : "closed"}
	data-color={color}
	class={cn("relative inline-block shrink-0 align-bottom", showScrim && "z-50", className)}
	style:width="{startSize}px"
	style:height="{startSize}px"
	onfocusout={onFocusOut}
>
	{#if scrim}
		<div
			aria-hidden="true"
			data-slot="fab-menu-scrim"
			class={cn(
				"fixed inset-0 -z-10 bg-scrim/32 transition-opacity duration-spring-default-effects ease-spring-default-effects",
				!showScrim && "pointer-events-none"
			)}
			style:opacity={open ? 1 : 0}
			onclick={() => close()}
		></div>
	{/if}

	<div
		bind:this={list}
		id="{menuId}-menu"
		role="menu"
		aria-label={label}
		data-slot="fab-menu-list"
		tabindex="-1"
		inert={!open}
		class={cn(
			"absolute end-0 bottom-[calc(100%+8px)] flex flex-col items-end gap-1 outline-none",
			!open && visibleCount === 0 && "pointer-events-none"
		)}
		onkeydown={onListKeyDown}
	>
		{@render children?.()}
	</div>

	<button
		bind:this={toggleButton}
		type="button"
		data-slot="fab-menu-toggle"
		aria-label={open ? closeLabel : label}
		aria-haspopup="menu"
		aria-expanded={open}
		aria-controls="{menuId}-menu"
		class="absolute end-0 top-0 inline-flex cursor-pointer items-center justify-center shadow-m3-3 transition-shadow duration-spring-default-effects ease-spring-default-effects select-none hover:shadow-m3-4 focus-visible:shadow-m3-3 active:shadow-m3-3"
		style:width="{boxSize}px"
		style:height="{boxSize}px"
		style:border-radius="{radius}px"
		style:background-color="color-mix(in oklab, var(--md-sys-color-{color}) {mix}%, var(--md-sys-color-{color}-container))"
		style:color="color-mix(in oklab, var(--md-sys-color-on-{color}) {mix}%, var(--md-sys-color-on-{color}-container))"
		onclick={toggle}
		{@attach ripple()}
	>
		<span class="relative inline-block" style:width="{iconSize}px" style:height="{iconSize}px">
			<Icon
				name={icon}
				size={iconSize}
				class="absolute inset-0"
				style="opacity: {Math.max(0, 1 - progress * 2)}; rotate: {progress * 90}deg"
			/>
			<Icon
				name={closeIcon}
				size={iconSize}
				class="absolute inset-0"
				style="opacity: {Math.min(1, Math.max(0, progress * 2 - 1))}; rotate: {(progress - 1) * 90}deg"
			/>
		</span>
	</button>
</div>
