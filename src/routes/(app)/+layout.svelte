<script lang="ts">
	import { afterNavigate, onNavigate } from '$app/navigation';
	import { page } from '$app/state';
	import { MediaQuery } from 'svelte/reactivity';
	import * as NavigationBar from '#lib/components/ui/navigation-bar/index.js';
	import * as NavigationRail from '#lib/components/ui/navigation-rail/index.js';
	import { AppBarAction, TopAppBar } from '#lib/components/ui/top-app-bar/index.js';
	import * as Tooltip from '#lib/components/ui/tooltip/index.js';
	import { Snackbar } from '#lib/components/ui/snackbar/index.js';
	import { setAppShell, ThemePanel, ThemeToggleButton } from '#lib/components/app/index.js';
	import { DURATION, EASING } from '#lib/m3/motion.js';
	import { cn } from '#lib/utils.js';
	import type { LayoutProps } from './$types';

	/**
	 * Showcase shell, adapting to the M3 window size classes:
	 * - expanded (≥ 840px): standard navigation rail on the start edge (expanded by default ≥ 1200px,
	 *   collapsible with its menu button), a "Theme" FAB in the rail header, dark-mode toggle at the foot.
	 * - medium (600–839px): small top app bar + short navigation bar with horizontal items.
	 * - compact (< 600px): small top app bar + tall (80dp) navigation bar with vertical items.
	 * Every window-size switch is pure CSS, so the server render is already right for every width
	 * (no flash, no animated jump on hydration): the medium / large rails are two instances (collapsed /
	 * expanded by default) and the compact / medium navigation bars are two instances; only the one
	 * matching the window is displayed (the others are `display: none`, out of the a11y tree).
	 * The window scrolls (so SvelteKit's scroll restoration and hash links keep working); the rail is
	 * sticky, the app bar sticks to the top and the navigation bar to the bottom.
	 */
	let { children }: LayoutProps = $props();

	/** `short`: label for the compact navigation bar (82dp-wide items at 412dp truncate "Components"). */
	type Destination = { href: string; label: string; short?: string; icon: string };
	const destinations: Destination[] = [
		{ href: '/', label: 'Home', icon: 'home' },
		{ href: '/components', label: 'Components', short: 'Library', icon: 'widgets' },
		{ href: '/dashboard', label: 'Dashboard', icon: 'dashboard' },
		{ href: '/mobile', label: 'Mobile', icon: 'smartphone' },
		{ href: '/components/styles', label: 'Styles', icon: 'style' }
	];

	// The most specific destination whose href prefixes the path ("/components/styles" beats "/components").
	let current = $derived.by(() => {
		const path = page.url.pathname.replace(/\/$/, '') || '/';
		let best: Destination | undefined;
		for (const d of destinations) {
			const hit = d.href === '/' ? path === '/' : path === d.href || path.startsWith(`${d.href}/`);
			if (hit && (!best || d.href.length > best.href.length)) best = d;
		}
		return best?.href;
	});

	const expandedWindow = new MediaQuery('min-width: 840px', false);

	// Rail: collapsed by default on expanded windows (840–1199px), expanded on large ones (≥ 1200px).
	// The menu button's choice is remembered per window class for the session (the layout persists
	// across navigations), so resizing back and forth restores what the user picked for each size.
	const rails = [
		{ large: false, class: 'min-[1200px]:hidden' },
		{ large: true, class: 'hidden min-[1200px]:block' }
	];
	let railExpanded = $state({ medium: false, large: true });

	// Navigation bar: tall (80dp) with vertical items on compact windows, short (64dp) with horizontal
	// items on medium windows.
	const bars = [
		{ medium: false, variant: 'tall', layout: 'vertical', class: 'min-[600px]:hidden' },
		{ medium: true, variant: 'short', layout: 'horizontal', class: 'hidden min-[600px]:flex' }
	] as const;

	let themeOpen = $state(false);

	setAppShell({
		get themePanelOpen() {
			return themeOpen;
		},
		openThemePanel: () => (themeOpen = true),
		closeThemePanel: () => (themeOpen = false)
	});

	// Snackbars sit above the navigation bar in compact / medium windows (bar height + 8 / 12dp).
	let snackbarOffset = $derived(expandedWindow.current ? 12 : { bottom: 76, left: 12, right: 12 });
	const snackbarMobileOffset = { bottom: 88, left: 8, right: 8 };

	let mainEl = $state<HTMLElement | null>(null);

	// ---------------------------------------------------------------- page transition
	// M3 fade-through (MaterialFadeThrough: long1 = 450ms on the emphasized curve, motion.md §4.1) via
	// the View Transitions API. The outgoing page fades out over the first 35% of the *eased* progress
	// (so it is gone after ~70ms), then the incoming page fades in and scales 0.92 → 1. The keyframes
	// run through WAAPI because only an effect-level easing gives the threshold that meaning. Only the
	// page area is captured (the rail / bars stay live, so their indicators animate normally); the
	// transition name is set only while a transition runs, so the page area is not a permanent
	// stacking context. Reduced motion: cross-fade only. Skipped where the API is missing and in hidden
	// documents (no rendering there, so the transition would hold the navigation back).
	onNavigate((navigation) => {
		if (!document.startViewTransition || document.visibilityState === 'hidden') return;
		const from = navigation.from?.url.pathname;
		const to = navigation.to?.url.pathname;
		if (!from || !to || from === to) return;

		const root = document.documentElement;
		return new Promise<void>((resolve) => {
			root.dataset.pageTransition = '';
			const transition = document.startViewTransition(async () => {
				resolve();
				// An aborted / failed navigation still has to let the transition finish.
				await navigation.complete.catch(() => {});
			});
			transition.ready.then(() => fadeThrough(root)).catch(() => {});
			transition.updateCallbackDone.catch(() => {});
			transition.finished.catch(() => {}).finally(() => delete root.dataset.pageTransition);
		});
	});

	function fadeThrough(root: HTMLElement) {
		const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
		const timing: KeyframeAnimationOptions = { duration: DURATION.long1, easing: EASING.emphasized, fill: 'both' };
		const offset = [0, 0.35, 1];
		root.animate({ opacity: [1, 0, 0], offset }, { ...timing, pseudoElement: '::view-transition-old(page)' });
		root.animate(
			reduce ? { opacity: [0, 0, 1], offset } : { opacity: [0, 0, 1], scale: [0.92, 0.92, 1], offset },
			{ ...timing, pseudoElement: '::view-transition-new(page)' }
		);
	}

	// ---------------------------------------------------------------- focus management
	// After a client-side route change, move focus to the new page's main heading (or the main
	// container) so keyboard and screen-reader users start at the content, not at the nav item.
	// Hash navigations keep SvelteKit's default (focus the target).
	afterNavigate(({ from, to, type }) => {
		if (type === 'enter' || !from || !to || to.url.hash) return;
		if (from.url.pathname === to.url.pathname) return;
		focusMain(true);
	});

	function focusMain(preferHeading: boolean) {
		if (!mainEl) return;
		const target = (preferHeading && mainEl.querySelector<HTMLElement>('h1')) || mainEl;
		if (!target.hasAttribute('tabindex')) target.setAttribute('tabindex', '-1');
		target.focus({ preventScroll: true });
	}

	function skipToContent(e: MouseEvent) {
		e.preventDefault();
		focusMain(false);
		mainEl?.scrollIntoView({ block: 'start' });
	}
</script>

<Tooltip.Provider>
	<a
		href="#main-content"
		class={cn(
			'type-label-lg fixed start-4 top-4 z-[60] inline-flex h-12 items-center rounded-m3-full bg-m3-primary px-6 text-on-primary shadow-m3-3',
			// parked above the viewport until focused; slides in on the fast-spatial spring
			'-translate-y-[calc(100%+32px)] transition-[translate] duration-spring-fast-spatial ease-spring-fast-spatial focus:translate-y-0'
		)}
		onclick={skipToContent}
	>
		Skip to content
	</a>

	<div class="flex min-h-dvh bg-surface text-on-surface">
		<!-- expanded windows: navigation rail -->
		<div class="sticky top-0 hidden h-dvh shrink-0 flex-col min-[840px]:flex">
			{#each rails as rail (rail.large)}
				<NavigationRail.Root
					class={cn('min-h-0 flex-1', rail.class)}
					bind:expanded={
						() => (rail.large ? railExpanded.large : railExpanded.medium),
						(v) => {
							if (rail.large) railExpanded.large = v;
							else railExpanded.medium = v;
						}
					}
				>
					{#snippet header()}
						<NavigationRail.MenuButton />
						<NavigationRail.Fab
							icon="palette"
							label="Theme"
							aria-haspopup="dialog"
							aria-expanded={themeOpen}
							onclick={() => (themeOpen = true)}
						/>
					{/snippet}
					{#each destinations as d (d.href)}
						<NavigationRail.Item href={d.href} icon={d.icon} label={d.label} selected={current === d.href} />
					{/each}
				</NavigationRail.Root>
			{/each}
			<div class="shrink-0 ps-7 pb-5">
				<ThemeToggleButton />
			</div>
		</div>

		<div class="flex min-w-0 flex-1 flex-col">
			<!-- compact / medium windows: small top app bar -->
			<TopAppBar title="M3 Expressive" class="min-[840px]:hidden">
				{#snippet trailing()}
					<ThemeToggleButton />
					<Tooltip.Root>
						<Tooltip.Trigger onclick={() => (themeOpen = true)}>
							{#snippet child({ props })}
								<AppBarAction
									{...props}
									icon="palette"
									label="Theme settings"
									aria-haspopup="dialog"
									aria-expanded={themeOpen}
								/>
							{/snippet}
						</Tooltip.Trigger>
						<Tooltip.Content side="bottom">Theme settings</Tooltip.Content>
					</Tooltip.Root>
				{/snippet}
			</TopAppBar>

			<main id="main-content" bind:this={mainEl} tabindex="-1" class="flex min-w-0 flex-1 flex-col outline-none">
				<div data-page-transition-target class="flex min-w-0 flex-1 flex-col">
					{@render children()}
				</div>
			</main>

			<!-- compact / medium windows: navigation bar (tall + vertical items on compact, short + horizontal on medium) -->
			<div class="sticky bottom-0 z-10 bg-surface-container pb-[env(safe-area-inset-bottom)] min-[840px]:hidden">
				{#each bars as bar (bar.medium)}
					<NavigationBar.Root variant={bar.variant} layout={bar.layout} class={bar.class}>
						{#each destinations as d (d.href)}
							<NavigationBar.Item
								href={d.href}
								icon={d.icon}
								label={bar.medium ? d.label : (d.short ?? d.label)}
								selected={current === d.href}
							/>
						{/each}
					</NavigationBar.Root>
				{/each}
			</div>
		</div>
	</div>

	<ThemePanel bind:open={themeOpen} />
	<Snackbar offset={snackbarOffset} mobileOffset={snackbarMobileOffset} />
</Tooltip.Provider>

<style>
	/* The page heading receives programmatic focus on navigation; it is not a control, so no ring. */
	main :global(h1[tabindex='-1']:focus) {
		outline: none;
	}

	:global {
		:root[data-page-transition] [data-page-transition-target] {
			view-transition-name: page;
		}
		/* Everything outside the page area swaps instantly and stays live; the page's old / new
		   snapshots are animated from script (fadeThrough above). */
		::view-transition-old(root),
		::view-transition-new(root),
		::view-transition-group(page),
		::view-transition-old(page),
		::view-transition-new(page) {
			animation: none;
		}
		::view-transition-new(page) {
			/* scale around the visible part of the page, not the middle of a long document */
			transform-origin: 50% min(40vh, 50%);
		}
	}
</style>
