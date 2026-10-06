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
	import { cn } from '#lib/utils.js';
	import type { LayoutProps } from './$types';

	/**
	 * Showcase shell, adapting to the M3 window size classes:
	 * - expanded (≥ 840px): standard navigation rail on the start edge (expanded by default ≥ 1200px,
	 *   collapsible with its menu button), a "Theme" FAB in the rail header, dark-mode toggle at the foot.
	 * - medium (600–839px): small top app bar + short navigation bar with horizontal items.
	 * - compact (< 600px): small top app bar + tall (80dp) navigation bar with vertical items.
	 * Rail vs. bars is switched with CSS so the server render is right for every width; the bar
	 * variant and the rail's default expansion need JS (MediaQuery).
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
	const mediumWindow = new MediaQuery('min-width: 600px', false);
	const largeWindow = new MediaQuery('min-width: 1200px', false);

	// Rail: expanded by default on large windows. A manual toggle sticks until the window crosses
	// the 1200px line again (then the default for the new size wins).
	let railChoice = $state<{ expanded: boolean; large: boolean } | null>(null);
	let railExpanded = $derived(
		railChoice && railChoice.large === largeWindow.current ? railChoice.expanded : largeWindow.current
	);

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
	// M3 fade-through via the View Transitions API: the outgoing page fades out (90ms), the incoming
	// one fades in and scales 0.92 → 1 (210ms, emphasized decelerate) after it. Only the page area is
	// captured (the rail / bars stay live, so their indicators animate normally). The transition name
	// is set only while a transition runs, so the page area is not a permanent stacking context.
	// Browsers without the API simply navigate. Reduced motion: opacity only (see the styles below).
	onNavigate((navigation) => {
		if (!document.startViewTransition) return;
		const from = navigation.from?.url.pathname;
		const to = navigation.to?.url.pathname;
		if (!from || !to || from === to) return;

		const root = document.documentElement;
		return new Promise<void>((resolve) => {
			root.dataset.pageTransition = '';
			const transition = document.startViewTransition(async () => {
				resolve();
				await navigation.complete;
			});
			transition.finished.finally(() => delete root.dataset.pageTransition);
		});
	});

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
			<NavigationRail.Root
				class="min-h-0 flex-1"
				bind:expanded={
					() => railExpanded, (v) => (railChoice = { expanded: v, large: largeWindow.current })
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
				<NavigationBar.Root
					variant={mediumWindow.current ? 'short' : 'tall'}
					layout={mediumWindow.current ? 'horizontal' : 'vertical'}
				>
					{#each destinations as d (d.href)}
						<NavigationBar.Item
							href={d.href}
							icon={d.icon}
							label={mediumWindow.current ? d.label : (d.short ?? d.label)}
							selected={current === d.href}
						/>
					{/each}
				</NavigationBar.Root>
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
		/* Everything outside the page area swaps instantly and stays live. */
		::view-transition-old(root),
		::view-transition-new(root),
		::view-transition-group(page) {
			animation: none;
		}
		::view-transition-old(page) {
			animation: m3-fade-through-out 90ms var(--md-sys-motion-easing-standard-accelerate) both;
		}
		::view-transition-new(page) {
			/* scale around the visible part of the page, not the middle of a long document */
			transform-origin: 50% min(40vh, 50%);
			animation: m3-fade-through-in 210ms var(--md-sys-motion-easing-emphasized-decelerate) 90ms both;
		}
		@media (prefers-reduced-motion: reduce) {
			::view-transition-new(page) {
				animation-name: m3-fade-in;
			}
		}
		@keyframes m3-fade-through-out {
			to {
				opacity: 0;
			}
		}
		@keyframes m3-fade-through-in {
			from {
				opacity: 0;
				scale: 0.92;
			}
		}
		@keyframes m3-fade-in {
			from {
				opacity: 0;
			}
		}
	}
</style>
