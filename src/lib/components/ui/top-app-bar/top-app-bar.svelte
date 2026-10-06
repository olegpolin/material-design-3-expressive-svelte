<script lang="ts" module>
	export type TopAppBarVariant = 'small' | 'center-aligned' | 'medium-flexible' | 'large-flexible' | 'search';
</script>

<script lang="ts">
	import { untrack, type Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import { Icon } from '#lib/components/ui/icon/index.js';
	import { activeSpring, animateSpring } from '#lib/m3/motion.js';
	import { cn, type WithElementRef } from '#lib/utils.js';
	import {
		fastOutLinearIn,
		findScrollParent,
		getScrollTop,
		setScrollTop,
		topTitleAlphaEasing,
		type ScrollTarget
	} from './scroll.js';

	/**
	 * M3 Expressive top app bar (navigation-containment.md §4).
	 * - small: 64dp, title-large (+ label-medium subtitle); center-aligned = small with a centered title.
	 * - medium-flexible: 112dp (136 with subtitle) → 64, headline-medium + label-large subtitle.
	 * - large-flexible: 120dp (152 with subtitle) → 64, display-small + title-medium subtitle.
	 * - search: 64dp bar hosting a 56dp full-radius search field (surface-container → -highest on scroll).
	 * Container surface → surface-container when content scrolls under it (defaultEffects). Flexible bars
	 * collapse with the scroll ("exit until collapsed": the top 64dp row is pinned, the headline row scrolls
	 * under it, the big title fades out while the small one fades in on TopTitleAlphaEasing), and snap to
	 * expanded/collapsed on scroll end with the defaultEffects spring (Compose `snapAnimationSpec`).
	 * Horizontal padding 4dp; the title starts 16dp from the edge, or right after a leading 48dp action.
	 */
	let {
		ref = $bindable(null),
		variant = 'small',
		title,
		subtitle,
		leading,
		trailing,
		scrolled = $bindable(false),
		scrollContainer,
		snap = true,
		searchValue = $bindable(''),
		placeholder = 'Search',
		searchTrailing,
		class: className,
		children,
		...restProps
	}: WithElementRef<HTMLAttributes<HTMLElement>> & {
		variant?: TopAppBarVariant;
		title?: string;
		subtitle?: string;
		/** Navigation icon slot (on-surface). */
		leading?: Snippet;
		/** Action slot (on-surface-variant). */
		trailing?: Snippet;
		/** True while content is scrolled under the bar. Written by the bar when it tracks a scroll container. */
		scrolled?: boolean;
		/**
		 * Element (or window) whose scroll drives the bar. `undefined` (default) = nearest scrolling
		 * ancestor, falling back to window. `null` = don't track; drive `scrolled` yourself.
		 * The bar is `position: sticky`, so it should be the first child of that scroll container.
		 */
		scrollContainer?: ScrollTarget | null;
		/** Flexible bars: snap to fully expanded / collapsed when scrolling stops mid-way. */
		snap?: boolean;
		/** Search variant: bound input value. */
		searchValue?: string;
		placeholder?: string;
		/** Search variant: content at the end of the field (e.g. an avatar or mic icon button). */
		searchTrailing?: Snippet;
		/** Extra content under the title row (flexible variants), e.g. chips. */
		children?: Snippet;
	} = $props();

	const COLLAPSED = 64;

	let flexible = $derived(variant === 'medium-flexible' || variant === 'large-flexible');
	let tracking = $derived(scrollContainer !== null);
	let scrollTop = $state(0);
	let headerHeight = $state(0);
	let range = $derived(flexible ? Math.max(0, headerHeight - COLLAPSED) : 0);
	/** Collapsed fraction 0 (expanded) … 1 (collapsed). */
	let fraction = $derived(flexible && tracking && range > 0 ? Math.min(1, Math.max(0, scrollTop / range)) : 0);

	// Flexible bars lerp the container color with the collapsed fraction (Compose TwoRowsTopAppBar,
	// FastOutLinearIn); untracked / single-row bars switch on `scrolled` with the defaultEffects spring.
	let colorMix = $derived(flexible && tracking ? fastOutLinearIn(fraction) * 100 : scrolled ? 100 : 0);
	let containerColor = $derived(
		`color-mix(in srgb, var(--md-sys-color-surface-container) ${colorMix.toFixed(2)}%, var(--md-sys-color-surface))`
	);
	let colorTransition = $derived(
		flexible && tracking
			? undefined
			: 'background-color var(--md-sys-motion-spring-default-effects-duration) var(--md-sys-motion-spring-default-effects-easing)'
	);
	let topTitleAlpha = $derived(flexible ? topTitleAlphaEasing(fraction) : 1);
	let bottomTitleAlpha = $derived(1 - fraction);

	/** Headline row min height (the bar hugs its text when the title wraps). */
	let headlineMinHeight = $derived(
		variant === 'medium-flexible' ? (subtitle ? 72 : 48) : variant === 'large-flexible' ? (subtitle ? 88 : 56) : 0
	);

	function track(node: HTMLElement) {
		if (scrollContainer === null) return;
		const target = scrollContainer ?? findScrollParent(node);
		let cancelSnap: (() => void) | undefined;
		let snapping = false;
		let driven = 0;
		let idle: ReturnType<typeof setTimeout> | undefined;

		const update = () => {
			scrollTop = Math.max(0, getScrollTop(target));
			scrolled = scrollTop > 0;
		};

		const settle = () => {
			if (!snap || !flexible || snapping || range <= 0) return;
			const f = scrollTop / range;
			if (f <= 0 || f >= 1) return;
			snapping = true;
			driven = scrollTop;
			cancelSnap = animateSpring(
				scrollTop,
				f < 0.5 ? 0 : range,
				activeSpring('default-effects', node),
				(v) => {
					driven = v;
					setScrollTop(target, v);
				},
				{ onComplete: () => (snapping = false) }
			);
		};

		const onScroll = () => {
			// a scroll we didn't drive (scrollbar drag, programmatic scrollTo…) cancels the snap
			if (snapping && Math.abs(getScrollTop(target) - driven) > 2) interrupt();
			update();
			if (!('onscrollend' in window)) {
				clearTimeout(idle);
				idle = setTimeout(settle, 150);
			}
		};
		const interrupt = () => {
			cancelSnap?.();
			snapping = false;
		};

		untrack(update);
		target.addEventListener('scroll', onScroll, { passive: true });
		target.addEventListener('scrollend', settle);
		for (const type of ['wheel', 'touchstart', 'pointerdown', 'keydown'] as const) {
			target.addEventListener(type, interrupt, { passive: true });
		}
		return () => {
			interrupt();
			clearTimeout(idle);
			target.removeEventListener('scroll', onScroll);
			target.removeEventListener('scrollend', settle);
			for (const type of ['wheel', 'touchstart', 'pointerdown', 'keydown'] as const) {
				target.removeEventListener(type, interrupt);
			}
		};
	}
</script>

{#snippet leadingSlot()}
	{#if leading}
		<div class="flex shrink-0 items-center text-on-surface">{@render leading()}</div>
	{/if}
{/snippet}

{#snippet trailingSlot()}
	{#if trailing}
		<div class="flex shrink-0 items-center justify-end text-on-surface-variant">{@render trailing()}</div>
	{/if}
{/snippet}

{#if flexible}
	<header
		bind:this={ref}
		bind:offsetHeight={headerHeight}
		data-slot="top-app-bar"
		data-variant={variant}
		data-scrolled={scrolled ? '' : undefined}
		class={cn('sticky z-10 flex w-full shrink-0 flex-col text-on-surface', className)}
		style:top="{-range}px"
		style:background-color={containerColor}
		style:transition={colorTransition}
		{@attach track}
		{...restProps}
	>
		<!-- pinned 64dp row -->
		<div
			class="sticky top-0 z-[1] flex h-16 shrink-0 items-center px-1"
			style:background-color={containerColor}
			style:transition={colorTransition}
		>
			{@render leadingSlot()}
			<div
				aria-hidden="true"
				class={cn('type-title-lg min-w-0 flex-1 truncate', !leading && 'ps-3')}
				style:opacity={topTitleAlpha}
			>
				{title}
			</div>
			{@render trailingSlot()}
		</div>
		<!-- expanded headline row -->
		<div
			class={cn('flex flex-col justify-end px-4', variant === 'medium-flexible' ? 'pb-4' : 'pb-5')}
			style:min-height="{headlineMinHeight}px"
			style:opacity={bottomTitleAlpha}
		>
			<div class={cn('flex flex-col', variant === 'medium-flexible' ? '-mt-1' : '-mt-2')}>
				<div
					data-slot="top-app-bar-title"
					class={variant === 'medium-flexible' ? 'type-headline-md' : 'type-display-sm'}
				>
					{title}
				</div>
				{#if subtitle}
					<div
						data-slot="top-app-bar-subtitle"
						class={cn(
							'text-on-surface-variant',
							variant === 'medium-flexible' ? 'type-label-lg' : 'type-title-md'
						)}
					>
						{subtitle}
					</div>
				{/if}
			</div>
			{@render children?.()}
		</div>
	</header>
{:else if variant === 'search'}
	<header
		bind:this={ref}
		data-slot="top-app-bar"
		data-variant="search"
		data-scrolled={scrolled ? '' : undefined}
		class={cn('sticky top-0 z-10 flex h-16 w-full shrink-0 items-center bg-surface px-1 text-on-surface', className)}
		{@attach track}
		{...restProps}
	>
		{@render leadingSlot()}
		<label
			class={cn(
				'mx-2 flex h-14 min-w-0 flex-1 cursor-text items-center gap-4 rounded-m3-full ps-4 pe-1',
				'transition-colors duration-spring-default-effects ease-spring-default-effects',
				'has-[input:focus-visible]:outline-3 has-[input:focus-visible]:outline-offset-2 has-[input:focus-visible]:outline-m3-secondary',
				scrolled ? 'bg-surface-container-highest' : 'bg-surface-container',
				!searchTrailing && 'pe-4'
			)}
		>
			{#if !leading}
				<Icon name="search" class="text-on-surface" />
			{/if}
			<input
				type="search"
				bind:value={searchValue}
				{placeholder}
				aria-label={placeholder}
				class="type-body-lg h-full min-w-0 flex-1 bg-transparent text-on-surface outline-none placeholder:text-on-surface-variant [&::-webkit-search-cancel-button]:hidden"
			/>
			{#if searchTrailing}
				<div class="flex shrink-0 items-center text-on-surface-variant">{@render searchTrailing()}</div>
			{/if}
		</label>
		{@render trailingSlot()}
	</header>
{:else}
	<header
		bind:this={ref}
		data-slot="top-app-bar"
		data-variant={variant}
		data-scrolled={scrolled ? '' : undefined}
		class={cn(
			'sticky top-0 z-10 h-16 w-full shrink-0 items-center px-1 text-on-surface',
			// side columns never shrink below their actions; the title column takes what is left and truncates
			variant === 'center-aligned'
				? 'grid grid-cols-[minmax(max-content,1fr)_minmax(0,auto)_minmax(max-content,1fr)]'
				: 'flex',
			className
		)}
		style:background-color={containerColor}
		style:transition={colorTransition}
		{@attach track}
		{...restProps}
	>
		{#if variant === 'center-aligned'}
			<div class="flex min-w-0 items-center text-on-surface">{@render leading?.()}</div>
		{:else}
			{@render leadingSlot()}
		{/if}
		<div
			class={cn(
				'flex min-w-0 flex-col',
				variant === 'center-aligned' ? 'items-center px-1 text-center' : ['flex-1', !leading && 'ps-3']
			)}
		>
			<div data-slot="top-app-bar-title" class="type-title-lg max-w-full truncate">{title}</div>
			{#if subtitle}
				<div data-slot="top-app-bar-subtitle" class="type-label-md max-w-full truncate text-on-surface-variant">
					{subtitle}
				</div>
			{/if}
		</div>
		{#if variant === 'center-aligned'}
			<div class="flex min-w-0 items-center justify-end text-on-surface-variant">{@render trailing?.()}</div>
		{:else}
			{@render trailingSlot()}
		{/if}
	</header>
{/if}
