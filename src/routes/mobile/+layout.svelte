<script lang="ts">
	import type { TransitionConfig } from 'svelte/transition';
	import { prefersReducedMotion } from 'svelte/motion';
	import { BitsConfig } from 'bits-ui';
	import { page } from '$app/state';
	import { afterNavigate, onNavigate } from '$app/navigation';
	import { Button } from '#lib/components/ui/button/index.js';
	import { ButtonGroup } from '#lib/components/ui/button-group/index.js';
	import { Icon } from '#lib/components/ui/icon/index.js';
	import { NavigationBar, NavigationBarItem } from '#lib/components/ui/navigation-bar/index.js';
	import {
		NavigationDrawer,
		NavigationDrawerItem,
		NavigationDrawerSection
	} from '#lib/components/ui/navigation-drawer/index.js';
	import { Snackbar, snackbar } from '#lib/components/ui/snackbar/index.js';
	import { Switch } from '#lib/components/ui/switch/index.js';
	import { cubicBezier } from '#lib/components/ui/top-app-bar/index.js';
	import { getTheme } from '#lib/m3/theme.svelte.js';
	import { destinations, drawerPlaylists } from '#lib/components/mobile/data.js';
	import { MobileShell, setMobileShell } from '#lib/components/mobile/shell.svelte.js';
	import type { LayoutProps } from './$types';

	/**
	 * Pulse mobile shell.
	 * - ≥ 600px: a 412 × 915 phone (12px bezel, 48px corners, status bar, gesture bar) centred on a
	 *   surface-container-low backdrop with screen switcher / exit / dark-mode controls.
	 * - < 600px: full-bleed app; the tall navigation bar sits at the bottom above the safe-area inset.
	 * Both layouts are pure CSS (min-[600px]: variants), so nothing flashes on load.
	 *
	 * `#pulse-screen` and `.pulse-content` are transformed, which makes them the containing block of
	 * `position: fixed` descendants: FABs / toolbars (`fixed` inside a page), the snackbar host and
	 * every bits-ui portal (dialogs, sheets, menus, the search view — redirected with BitsConfig)
	 * stay inside the phone instead of covering the browser viewport.
	 */
	let { children }: LayoutProps = $props();

	const theme = getTheme();
	const shell = new MobileShell();
	setMobileShell(shell);

	function indexOf(pathname: string) {
		const path = pathname.replace(/\/+$/, '') || '/';
		const i = destinations.findIndex((d) => d.href === path);
		return i < 0 ? 0 : i;
	}

	let activeIndex = $derived(indexOf(page.url.pathname));

	/** Bottom chrome each screen floats over its content (mini player, floating / docked toolbar),
	 * so snackbars appear above it instead of covering it. */
	const SNACKBAR_INSET: Record<string, number> = { home: 88, library: 80, compose: 64, settings: 0 };
	let snackbarInset = $derived(SNACKBAR_INSET[destinations[activeIndex].id] ?? 0);
	let libraryBadge = $state<number | undefined>(3);

	// ---- shared-axis X between destinations (M3 motion: 30dp slide + fade-through, 300ms emphasized)
	/** +1 when moving to a destination further right in the nav bar, −1 when moving left. */
	let direction = 1;
	const emphasized = cubicBezier(0.2, 0, 0, 1);
	const clamp01 = (v: number) => Math.min(1, Math.max(0, v));

	onNavigate(({ from, to }) => {
		if (!from || !to) return;
		direction = indexOf(to.url.pathname) >= indexOf(from.url.pathname) ? 1 : -1;
	});

	afterNavigate(() => {
		statusBg = undefined;
		statusTransition = undefined;
		if (page.url.pathname.startsWith('/mobile/library')) libraryBadge = undefined;
	});

	/**
	 * Slides with `left`/`right` instead of `transform`, so the page never becomes the containing block
	 * of its own `position: fixed` FABs / toolbars mid-transition. Outgoing content fades out over the
	 * first 30%, incoming fades in over the remaining 70% (fade-through). Reduced motion: crossfade only.
	 */
	function sharedAxisX(_node: Element, { incoming }: { incoming: boolean }): TransitionConfig {
		if (prefersReducedMotion.current) {
			return { duration: 150, css: (t) => `opacity: ${t}` };
		}
		const dir = direction;
		return {
			duration: 300,
			css: (t) => {
				// intro: t 0 → 1 · outro: t 1 → 0; p = elapsed fraction either way
				const p = incoming ? t : 1 - t;
				const e = emphasized(p);
				const x = (incoming ? (1 - e) * 30 : -e * 30) * dir;
				const opacity = incoming ? clamp01((p - 0.3) / 0.7) : clamp01(1 - p / 0.3);
				return `left: ${x}px; right: ${-x}px; opacity: ${opacity}`;
			}
		};
	}

	// ---- status bar mirrors the active top app bar's container color (frame only)
	let statusBg = $state<string>();
	let statusTransition = $state<string>();
	let statusFrame: ReturnType<typeof setTimeout> | undefined;

	function onContentScroll(e: Event) {
		const scroller = e.target as HTMLElement;
		if (!scroller.hasAttribute?.('data-pulse-scroller')) return;
		clearTimeout(statusFrame);
		// capture phase runs before the app bar's own scroll handler: read its color after that
		// handler and the Svelte flush (a task, not rAF, so it also works in a throttled tab)
		statusFrame = setTimeout(() => {
			const bar = scroller.querySelector<HTMLElement>('[data-slot=top-app-bar]');
			statusBg = bar?.style.backgroundColor || undefined;
			// flexible bars lerp their color per scroll frame (no transition): follow them 1:1
			statusTransition = bar?.style.backgroundColor ? bar.style.transition || 'none' : undefined;
		}, 0);
	}

	// ---- mini player clock
	$effect(() => {
		if (!shell.playing) return;
		const id = setInterval(() => shell.tick(1), 1000);
		return () => clearInterval(id);
	});
</script>

<svelte:head>
	<title>Pulse · M3 Expressive mobile showcase</title>
</svelte:head>

<BitsConfig defaultPortalTo="#pulse-screen">
	<div
		data-slot="pulse-stage"
		class="min-[600px]:flex min-[600px]:min-h-dvh min-[600px]:flex-col min-[600px]:items-center min-[600px]:justify-center min-[600px]:gap-8 min-[600px]:bg-surface-container-low min-[600px]:p-6 min-[1100px]:flex-row min-[1100px]:gap-16"
	>
		<!-- ===================================================== backdrop controls (frame only) -->
		<aside
			aria-label="Showcase controls"
			class="hidden w-full max-w-[436px] flex-col gap-6 text-on-surface min-[600px]:flex min-[1100px]:w-[360px]"
		>
			<div class="flex items-center gap-4">
				<span class="grid size-14 shrink-0 place-items-center rounded-m3-lg bg-primary-container text-on-primary-container">
					<Icon name="graphic_eq" size={32} />
				</span>
				<div class="flex min-w-0 flex-col">
					<h1 class="type-headline-sm-emphasized">Pulse</h1>
					<p class="type-body-md text-on-surface-variant">Material 3 Expressive · mobile showcase</p>
				</div>
			</div>

			<nav aria-label="Screens" class="flex flex-col gap-2">
				<span class="type-label-lg text-on-surface-variant">Screen</span>
				<ButtonGroup variant="connected" size="sm">
					{#each destinations as d, i (d.id)}
						<Button
							href={d.href}
							size="sm"
							variant={i === activeIndex ? 'filled' : 'tonal'}
							data-state={i === activeIndex ? 'on' : undefined}
							aria-current={i === activeIndex ? 'page' : undefined}
						>
							{d.label}
						</Button>
					{/each}
				</ButtonGroup>
			</nav>

			<div class="flex flex-wrap items-center justify-between gap-4">
				<Button href="/" variant="tonal" size="sm">
					<Icon name="arrow_back" data-icon="inline-start" />
					Exit to site
				</Button>
				<label class="flex cursor-pointer items-center gap-3">
					<Icon name="dark_mode" class="text-on-surface-variant" />
					<span class="type-label-lg">Dark theme</span>
					<Switch bind:checked={() => theme.dark, (v) => (theme.dark = v)} icons="checked" />
				</label>
			</div>

			<p class="type-body-sm hidden text-on-surface-variant min-[1100px]:block">
				412 × 915dp compact window. Scroll inside the phone to collapse the app bars and hide the
				toolbar; dialogs, sheets, menus and snackbars stay inside the device.
			</p>
		</aside>

		<!-- ===================================================== device -->
		<div
			data-slot="pulse-device"
			class="fixed inset-0 flex min-[600px]:relative min-[600px]:inset-auto min-[600px]:h-[min(939px,calc(100dvh-48px))] min-[600px]:min-h-[640px] min-[600px]:w-[436px] min-[600px]:shrink-0 min-[600px]:rounded-[48px] min-[600px]:bg-surface-container-highest min-[600px]:p-3 min-[600px]:shadow-m3-3 min-[600px]:ring-1 min-[600px]:ring-outline-variant"
		>
			<div
				id="pulse-screen"
				class="pulse-screen relative flex size-full flex-col overflow-hidden bg-surface text-on-surface min-[600px]:rounded-[36px]"
				style:filter={shell.brightness < 100 ? `brightness(${0.35 + (0.65 * shell.brightness) / 100})` : undefined}
			>
				<!-- status bar -->
				<div
					aria-hidden="true"
					class="type-label-lg relative z-20 hidden h-8 shrink-0 items-center justify-between bg-surface px-6 text-on-surface min-[600px]:flex"
					style:background-color={statusBg}
					style:transition={statusTransition ??
						'background-color var(--md-sys-motion-spring-default-effects-duration) var(--md-sys-motion-spring-default-effects-easing)'}
				>
					<span class="tabular-nums">9:30</span>
					<span class="absolute top-1.5 left-1/2 size-5 -translate-x-1/2 rounded-m3-full bg-scrim"></span>
					<span class="flex items-center gap-1">
						<Icon name="signal_cellular_alt" size={18} fill />
						<Icon name="wifi" size={18} fill />
						<Icon name="battery_5_bar" size={18} fill class="rotate-90" />
					</span>
				</div>

				<!-- content: one scroll container per destination -->
				<div
					class="pulse-content relative min-h-0 flex-1 overflow-hidden"
					onscrollcapture={onContentScroll}
				>
					{#key page.url.pathname}
						<div
							data-pulse-scroller=""
							class="absolute inset-0 overflow-x-hidden overflow-y-auto overscroll-contain [scrollbar-width:none]"
							in:sharedAxisX={{ incoming: true }}
							out:sharedAxisX={{ incoming: false }}
						>
							{@render children()}
						</div>
					{/key}
					<Snackbar
						offset={{ top: 12, right: 12, left: 12, bottom: snackbarInset + 12 }}
						mobileOffset={{ top: 8, right: 8, left: 8, bottom: snackbarInset + 8 }}
					/>
				</div>

				<!-- navigation bar (+ gesture bar in the frame, safe-area inset on phones) -->
				<div class="relative z-20 shrink-0 bg-surface-container pb-[env(safe-area-inset-bottom)] min-[600px]:pb-0">
					<NavigationBar variant="tall" aria-label="Primary">
						{#each destinations as d, i (d.id)}
							<NavigationBarItem
								href={d.href}
								icon={d.icon}
								label={d.label}
								selected={i === activeIndex}
								badge={d.id === 'library' ? libraryBadge : undefined}
							/>
						{/each}
					</NavigationBar>
					<div aria-hidden="true" class="hidden h-6 items-center justify-center min-[600px]:flex">
						<span class="h-1 w-28 rounded-m3-full bg-on-surface/40"></span>
					</div>
				</div>
			</div>
		</div>
	</div>

	<!-- modal navigation drawer (opened from the Home app bar), portalled into the phone -->
	<NavigationDrawer
		variant="modal"
		bind:open={shell.drawerOpen}
		headline="Pulse"
		class="max-w-[calc(100%-56px)]"
	>
		{#each destinations as d, i (d.id)}
			<NavigationDrawerItem
				href={d.href}
				icon={d.icon}
				label={d.label}
				selected={i === activeIndex}
				badge={d.id === 'library' ? libraryBadge : undefined}
			/>
		{/each}
		<NavigationDrawerItem
			icon="download"
			label="Downloads"
			badge="12"
			onclick={() => snackbar('12 episodes available offline')}
		/>
		<NavigationDrawerSection headline="Playlists">
			{#each drawerPlaylists as p (p.id)}
				<NavigationDrawerItem icon={p.icon} label={p.label} onclick={() => snackbar(`Playing ${p.label}`)} />
			{/each}
		</NavigationDrawerSection>
	</NavigationDrawer>
</BitsConfig>

<style>
	/* Containing block for position: fixed descendants (see the comment in <script>). */
	.pulse-screen,
	.pulse-content {
		transform: translateZ(0);
	}

	/* The snackbar lane spans the phone's content area instead of the browser viewport. */
	.pulse-content :global([data-sonner-toaster][data-m3-toaster]) {
		width: calc(100% - 24px);
	}
	@media (max-width: 600px) {
		.pulse-content :global([data-sonner-toaster][data-m3-toaster]) {
			width: calc(100% - 16px);
		}
	}
</style>
