<script lang="ts">
	import { onDestroy } from 'svelte';
	import { toggleMode } from 'mode-watcher';
	import { prefersReducedMotion } from 'svelte/motion';
	import { Button } from '#lib/components/ui/button/index.js';
	import { Icon } from '#lib/components/ui/icon/index.js';
	import { getTheme, SCHEME_VARIANTS, type SpecVersion } from '#lib/m3/theme.svelte.js';
	import type { ColorRole } from '#lib/m3/color-roles.js';
	import { animateSpring, SPRINGS, type MotionScheme } from '#lib/m3/motion.js';
	import { ripple, stateLayer } from '#lib/m3/ripple.svelte.js';
	import { morphPath, shapePath, SHAPE_LABELS, SHAPE_NAMES, type ShapeName } from '#lib/m3/shapes.js';

	const theme = getTheme();
	const SPEC_VERSIONS: SpecVersion[] = ['2021', '2025'];
	const MOTION_SCHEMES: MotionScheme[] = ['expressive', 'standard'];

	// ---------------------------------------------------------------- (a) color roles
	// Class strings are written out literally so Tailwind generates (and thereby verifies) every utility.
	type Swatch = { role: ColorRole; cls: string };
	const colorGroups: { title: string; swatches: Swatch[] }[] = [
		{
			title: 'Primary',
			swatches: [
				{ role: 'primary', cls: 'bg-m3-primary text-on-primary' },
				{ role: 'on-primary', cls: 'bg-on-primary text-m3-primary' },
				{ role: 'primary-container', cls: 'bg-primary-container text-on-primary-container' },
				{ role: 'on-primary-container', cls: 'bg-on-primary-container text-primary-container' },
				{ role: 'primary-fixed', cls: 'bg-primary-fixed text-on-primary-fixed' },
				{ role: 'primary-fixed-dim', cls: 'bg-primary-fixed-dim text-on-primary-fixed-variant' },
				{ role: 'on-primary-fixed', cls: 'bg-on-primary-fixed text-primary-fixed' },
				{ role: 'on-primary-fixed-variant', cls: 'bg-on-primary-fixed-variant text-primary-fixed' },
				{ role: 'inverse-primary', cls: 'bg-inverse-primary text-inverse-surface' },
				{ role: 'surface-tint', cls: 'bg-surface-tint text-on-primary' }
			]
		},
		{
			title: 'Secondary',
			swatches: [
				{ role: 'secondary', cls: 'bg-m3-secondary text-on-secondary' },
				{ role: 'on-secondary', cls: 'bg-on-secondary text-m3-secondary' },
				{ role: 'secondary-container', cls: 'bg-secondary-container text-on-secondary-container' },
				{ role: 'on-secondary-container', cls: 'bg-on-secondary-container text-secondary-container' },
				{ role: 'secondary-fixed', cls: 'bg-secondary-fixed text-on-secondary-fixed' },
				{ role: 'secondary-fixed-dim', cls: 'bg-secondary-fixed-dim text-on-secondary-fixed-variant' },
				{ role: 'on-secondary-fixed', cls: 'bg-on-secondary-fixed text-secondary-fixed' },
				{ role: 'on-secondary-fixed-variant', cls: 'bg-on-secondary-fixed-variant text-secondary-fixed' }
			]
		},
		{
			title: 'Tertiary',
			swatches: [
				{ role: 'tertiary', cls: 'bg-tertiary text-on-tertiary' },
				{ role: 'on-tertiary', cls: 'bg-on-tertiary text-tertiary' },
				{ role: 'tertiary-container', cls: 'bg-tertiary-container text-on-tertiary-container' },
				{ role: 'on-tertiary-container', cls: 'bg-on-tertiary-container text-tertiary-container' },
				{ role: 'tertiary-fixed', cls: 'bg-tertiary-fixed text-on-tertiary-fixed' },
				{ role: 'tertiary-fixed-dim', cls: 'bg-tertiary-fixed-dim text-on-tertiary-fixed-variant' },
				{ role: 'on-tertiary-fixed', cls: 'bg-on-tertiary-fixed text-tertiary-fixed' },
				{ role: 'on-tertiary-fixed-variant', cls: 'bg-on-tertiary-fixed-variant text-tertiary-fixed' }
			]
		},
		{
			title: 'Error',
			swatches: [
				{ role: 'error', cls: 'bg-error text-on-error' },
				{ role: 'on-error', cls: 'bg-on-error text-error' },
				{ role: 'error-container', cls: 'bg-error-container text-on-error-container' },
				{ role: 'on-error-container', cls: 'bg-on-error-container text-error-container' }
			]
		},
		{
			title: 'Surface',
			swatches: [
				{ role: 'surface-dim', cls: 'bg-surface-dim text-on-surface' },
				{ role: 'surface', cls: 'bg-surface text-on-surface' },
				{ role: 'surface-bright', cls: 'bg-surface-bright text-on-surface' },
				{ role: 'surface-container-lowest', cls: 'bg-surface-container-lowest text-on-surface' },
				{ role: 'surface-container-low', cls: 'bg-surface-container-low text-on-surface' },
				{ role: 'surface-container', cls: 'bg-surface-container text-on-surface' },
				{ role: 'surface-container-high', cls: 'bg-surface-container-high text-on-surface' },
				{ role: 'surface-container-highest', cls: 'bg-surface-container-highest text-on-surface' },
				{ role: 'on-surface', cls: 'bg-on-surface text-surface' },
				{ role: 'surface-variant', cls: 'bg-surface-variant text-on-surface-variant' },
				{ role: 'on-surface-variant', cls: 'bg-on-surface-variant text-surface-variant' },
				{ role: 'background', cls: 'bg-m3-background text-on-background' },
				{ role: 'on-background', cls: 'bg-on-background text-m3-background' }
			]
		},
		{
			title: 'Outline, inverse, scrim',
			swatches: [
				{ role: 'outline', cls: 'bg-outline text-surface' },
				{ role: 'outline-variant', cls: 'bg-outline-variant text-on-surface' },
				{ role: 'inverse-surface', cls: 'bg-inverse-surface text-inverse-on-surface' },
				{ role: 'inverse-on-surface', cls: 'bg-inverse-on-surface text-inverse-surface' },
				{ role: 'scrim', cls: 'bg-scrim text-white' },
				{ role: 'shadow', cls: 'bg-shadow text-white' }
			]
		}
	];

	// ---------------------------------------------------------------- (c) type scale
	type TypeRow = { name: string; base: string; emph: string; spec: string };
	const typeRows: TypeRow[] = [
		{ name: 'Display large', base: 'type-display-lg', emph: 'type-display-lg-emphasized', spec: '57/64 · brand · 400 / 500' },
		{ name: 'Display medium', base: 'type-display-md', emph: 'type-display-md-emphasized', spec: '45/52 · brand · 400 / 500' },
		{ name: 'Display small', base: 'type-display-sm', emph: 'type-display-sm-emphasized', spec: '36/44 · brand · 400 / 500' },
		{ name: 'Headline large', base: 'type-headline-lg', emph: 'type-headline-lg-emphasized', spec: '32/40 · brand · 400 / 500' },
		{ name: 'Headline medium', base: 'type-headline-md', emph: 'type-headline-md-emphasized', spec: '28/36 · brand · 400 / 500' },
		{ name: 'Headline small', base: 'type-headline-sm', emph: 'type-headline-sm-emphasized', spec: '24/32 · brand · 400 / 500' },
		{ name: 'Title large', base: 'type-title-lg', emph: 'type-title-lg-emphasized', spec: '22/28 · brand · 400 / 500' },
		{ name: 'Title medium', base: 'type-title-md', emph: 'type-title-md-emphasized', spec: '16/24 · plain · 500 / 600 · +0.15' },
		{ name: 'Title small', base: 'type-title-sm', emph: 'type-title-sm-emphasized', spec: '14/20 · plain · 500 / 600 · +0.1' },
		{ name: 'Body large', base: 'type-body-lg', emph: 'type-body-lg-emphasized', spec: '16/24 · plain · 400 / 500 · +0.5' },
		{ name: 'Body medium', base: 'type-body-md', emph: 'type-body-md-emphasized', spec: '14/20 · plain · 400 / 500 · +0.25' },
		{ name: 'Body small', base: 'type-body-sm', emph: 'type-body-sm-emphasized', spec: '12/16 · plain · 400 / 500 · +0.4' },
		{ name: 'Label large', base: 'type-label-lg', emph: 'type-label-lg-emphasized', spec: '14/20 · plain · 500 / 600 · +0.1' },
		{ name: 'Label medium', base: 'type-label-md', emph: 'type-label-md-emphasized', spec: '12/16 · plain · 500 / 600 · +0.5' },
		{ name: 'Label small', base: 'type-label-sm', emph: 'type-label-sm-emphasized', spec: '11/16 · plain · 500 / 600 · +0.5' }
	];

	// ---------------------------------------------------------------- shape corners
	const corners: { name: string; cls: string; px: string }[] = [
		{ name: 'none', cls: 'rounded-m3-none', px: '0' },
		{ name: 'xs', cls: 'rounded-m3-xs', px: '4' },
		{ name: 'sm', cls: 'rounded-m3-sm', px: '8' },
		{ name: 'md', cls: 'rounded-m3-md', px: '12' },
		{ name: 'lg', cls: 'rounded-m3-lg', px: '16' },
		{ name: 'lg-increased', cls: 'rounded-m3-lg-increased', px: '20' },
		{ name: 'xl', cls: 'rounded-m3-xl', px: '28' },
		{ name: 'xl-increased', cls: 'rounded-m3-xl-increased', px: '32' },
		{ name: 'xxl', cls: 'rounded-m3-xxl', px: '48' },
		{ name: 'full', cls: 'rounded-m3-full', px: 'full' }
	];

	// ---------------------------------------------------------------- (d) morph tile
	let morphFrom = $state<ShapeName>('circle');
	let morphTo = $state<ShapeName>('cookie9Sided');
	let morphProgress = $state(0);
	let morphTarget = 0;
	let morphVelocity = 0;
	let cancelMorph: (() => void) | null = null;
	const morphD = $derived(morphPath(morphFrom, morphTo, morphProgress));

	function toggleMorph() {
		morphTarget = morphTarget === 0 ? 1 : 0;
		cancelMorph?.();
		// Interruptible: restart from the current progress, carrying the current velocity.
		cancelMorph = animateSpring(
			morphProgress,
			morphTarget,
			SPRINGS[theme.motionScheme]['fast-spatial'],
			(value, velocity) => {
				morphProgress = value;
				morphVelocity = velocity;
			},
			{ velocity: morphVelocity, reducedMotion: prefersReducedMotion.current }
		);
	}

	onDestroy(() => cancelMorph?.());

	// ---------------------------------------------------------------- (e) motion demo
	type MotionRow = { label: string; cls: string; note: string };
	const springRows: MotionRow[] = [
		{ label: 'fast spatial', cls: 'ease-spring-fast-spatial duration-spring-fast-spatial', note: 'ζ 0.6 · k 800 (expressive)' },
		{ label: 'default spatial', cls: 'ease-spring-default-spatial duration-spring-default-spatial', note: 'ζ 0.8 · k 380' },
		{ label: 'slow spatial', cls: 'ease-spring-slow-spatial duration-spring-slow-spatial', note: 'ζ 0.8 · k 200' },
		{ label: 'fast effects', cls: 'ease-spring-fast-effects duration-spring-fast-effects', note: 'ζ 1 · k 3800' },
		{ label: 'default effects', cls: 'ease-spring-default-effects duration-spring-default-effects', note: 'ζ 1 · k 1600' },
		{ label: 'slow effects', cls: 'ease-spring-slow-effects duration-spring-slow-effects', note: 'ζ 1 · k 800' }
	];
	const legacyRows: MotionRow[] = [
		{ label: 'emphasized', cls: 'ease-m3-emphasized duration-m3-long2', note: '500ms (linear() path)' },
		{ label: 'standard', cls: 'ease-m3-standard duration-m3-medium2', note: '300ms' },
		{ label: 'emph. decelerate', cls: 'ease-m3-emphasized-decelerate duration-m3-medium4', note: '400ms (enter)' },
		{ label: 'emph. accelerate', cls: 'ease-m3-emphasized-accelerate duration-m3-short4', note: '200ms (exit)' }
	];
	let moved = $state<Record<string, boolean>>({});
	const allMoved = $derived(springRows.every((r) => moved[r.label]));
	function toggleAll() {
		const next = !allMoved;
		for (const r of [...springRows, ...legacyRows]) moved[r.label] = next;
	}

	// ---------------------------------------------------------------- (f) elevation
	const elevations = [
		{ level: 0, cls: 'shadow-m3-0', dp: '0dp' },
		{ level: 1, cls: 'shadow-m3-1', dp: '1dp' },
		{ level: 2, cls: 'shadow-m3-2', dp: '3dp' },
		{ level: 3, cls: 'shadow-m3-3', dp: '6dp' },
		{ level: 4, cls: 'shadow-m3-4', dp: '8dp' },
		{ level: 5, cls: 'shadow-m3-5', dp: '12dp' }
	];

	// ---------------------------------------------------------------- (g) ripple demo
	let rippleClicks = $state(0);
</script>

<svelte:head>
	<title>Styles · M3 Expressive</title>
</svelte:head>

{#snippet sectionTitle(title: string, subtitle: string)}
	<header class="mb-6 flex flex-col gap-1">
		<h2 class="type-headline-md text-on-surface">{title}</h2>
		<p class="type-body-md text-on-surface-variant">{subtitle}</p>
	</header>
{/snippet}

<main class="mx-auto flex max-w-7xl flex-col gap-16 px-4 py-10 sm:px-8">
	<header class="flex flex-col gap-3">
		<p class="type-label-lg-emphasized text-m3-primary">Foundation</p>
		<h1 class="type-display-lg-emphasized text-on-surface">Styles</h1>
		<p class="type-body-lg max-w-2xl text-on-surface-variant">
			Color roles, type scale, shape library, motion springs, elevation and state layers — every token
			below comes from <code class="font-mono text-body-md">src/routes/layout.css</code> and follows the theme
			controls live.
		</p>
	</header>

	<!-- (b) theme controls -->
	<section aria-labelledby="theme-controls" class="rounded-m3-xl bg-surface-container-low p-6 shadow-m3-1">
		<h2 id="theme-controls" class="type-title-lg mb-6 text-on-surface">Theme</h2>
		<div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
			<label class="flex flex-col gap-2">
				<span class="type-label-lg text-on-surface-variant">Seed color</span>
				<span class="flex items-center gap-3">
					<input
						type="color"
						aria-label="Seed color picker"
						value={/^#[0-9a-f]{6}$/i.test(theme.seed) ? theme.seed.toLowerCase() : '#6750a4'}
						oninput={(e) => (theme.seed = e.currentTarget.value)}
						class="size-12 cursor-pointer rounded-m3-md border border-outline bg-transparent p-1"
					/>
					<input
						type="text"
						bind:value={theme.seed}
						spellcheck="false"
						class="type-body-lg h-12 w-full min-w-0 rounded-m3-xs border border-outline bg-transparent px-3 font-mono text-on-surface focus-visible:border-m3-primary"
					/>
				</span>
			</label>

			<label class="flex flex-col gap-2">
				<span class="type-label-lg text-on-surface-variant">Scheme variant</span>
				<select
					bind:value={theme.variant}
					class="type-body-lg h-12 rounded-m3-xs border border-outline bg-surface-container-low px-3 text-on-surface"
				>
					{#each SCHEME_VARIANTS as v (v.value)}
						<option value={v.value}>{v.label}</option>
					{/each}
				</select>
			</label>

			<label class="flex flex-col gap-2">
				<span class="type-label-lg flex justify-between text-on-surface-variant">
					<span>Contrast</span>
					<span class="tabular-nums">{theme.contrast.toFixed(1)}</span>
				</span>
				<input
					type="range"
					min="-1"
					max="1"
					step="0.1"
					bind:value={theme.contrast}
					class="h-12 accent-[var(--md-sys-color-primary)]"
				/>
			</label>

			<div class="flex flex-col gap-2">
				<span class="type-label-lg text-on-surface-variant">Spec version</span>
				<div class="flex h-12 overflow-hidden rounded-m3-full border border-outline">
					{#each SPEC_VERSIONS as v (v)}
						<button
							type="button"
							class={[
								'type-label-lg flex-1 transition-colors duration-spring-fast-effects ease-spring-fast-effects',
								theme.specVersion === v ? 'bg-secondary-container text-on-secondary-container' : 'text-on-surface'
							]}
							aria-pressed={theme.specVersion === v}
							onclick={() => (theme.specVersion = v)}
							{@attach ripple()}
						>
							{v}
						</button>
					{/each}
				</div>
			</div>
		</div>

		<div class="mt-6 flex flex-wrap items-center gap-3">
			<button
				type="button"
				class="type-label-lg inline-flex h-10 items-center gap-2 rounded-m3-full bg-m3-primary px-4 text-on-primary"
				onclick={toggleMode}
				{@attach ripple()}
			>
				<Icon name={theme.dark ? 'light_mode' : 'dark_mode'} size={20} />
				{theme.dark ? 'Light mode' : 'Dark mode'}
			</button>

			<div class="flex h-10 overflow-hidden rounded-m3-full border border-outline" role="group" aria-label="Motion scheme">
				{#each MOTION_SCHEMES as s (s)}
					<button
						type="button"
						class={[
							'type-label-lg px-4 capitalize transition-colors duration-spring-fast-effects ease-spring-fast-effects',
							theme.motionScheme === s ? 'bg-secondary-container text-on-secondary-container' : 'text-on-surface'
						]}
						aria-pressed={theme.motionScheme === s}
						onclick={() => (theme.motionScheme = s)}
						{@attach ripple()}
					>
						{s} motion
					</button>
				{/each}
			</div>

			<button
				type="button"
				class="type-label-lg inline-flex h-10 items-center gap-2 rounded-m3-full px-4 text-m3-primary disabled:text-on-surface/38"
				disabled={theme.isBaseline}
				onclick={() => theme.reset()}
				{@attach ripple()}
			>
				<Icon name="restart_alt" size={20} />
				Reset to baseline
			</button>

			<span class="type-body-sm text-on-surface-variant">
				{#if !theme.ready}
					Loading material-color-utilities…
				{:else if theme.isBaseline}
					Static M3 baseline (layout.css)
				{:else}
					Generated with MCU · {theme.variant} · contrast {theme.contrast.toFixed(1)} · spec {theme.specVersion}
				{/if}
			</span>
		</div>

		<div class="mt-6 flex flex-wrap items-center gap-3 border-t border-outline-variant pt-6">
			<span class="type-label-md text-on-surface-variant">Untouched shadcn components (bridge):</span>
			<Button>Default</Button>
			<Button variant="secondary">Secondary</Button>
			<Button variant="outline">Outline</Button>
			<Button variant="destructive">Destructive</Button>
		</div>
	</section>

	<!-- (a) color roles -->
	<section aria-labelledby="colors">
		<div id="colors">
			{@render sectionTitle(
				'Color roles',
				`All 49 md.sys.color roles for the active ${theme.dark ? 'dark' : 'light'} scheme. Utility: bg-<role> / text-<role> (collisions: m3-primary, m3-secondary, m3-background).`
			)}
		</div>
		<div class="flex flex-col gap-8">
			{#each colorGroups as group (group.title)}
				<div>
					<h3 class="type-title-md mb-3 text-on-surface">{group.title}</h3>
					<ul class="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
						{#each group.swatches as s (s.role)}
							<li
								class={[
									'flex min-h-24 flex-col justify-between rounded-m3-md p-3 ring-1 ring-outline-variant/40 ring-inset',
									s.cls
								]}
							>
								<span class="type-label-lg break-words">{s.role}</span>
								<span class="type-body-sm font-mono uppercase opacity-80">{theme.colors[s.role]}</span>
							</li>
						{/each}
					</ul>
				</div>
			{/each}
		</div>
	</section>

	<!-- (c) type scale -->
	<section aria-labelledby="type">
		<div id="type">
			{@render sectionTitle(
				'Type scale',
				'Baseline and emphasized styles. type-* sets family + size + line height + tracking + weight; text-* sets everything but the family. Brand = Google Sans Flex, plain = Roboto Flex; emphasized adds ROND 100.'
			)}
		</div>
		<div class="flex flex-col divide-y divide-outline-variant">
			{#each typeRows as row (row.base)}
				<div class="grid gap-2 py-4 xl:grid-cols-[12rem_1fr_1fr] xl:items-baseline xl:gap-6">
					<div class="flex flex-col">
						<span class="type-label-lg text-on-surface">{row.name}</span>
						<span class="type-body-sm text-on-surface-variant">{row.spec}</span>
						<code class="type-body-sm font-mono text-on-surface-variant">.{row.base}</code>
					</div>
					<p class={['truncate text-on-surface', row.base]}>Expressive type</p>
					<p class={['truncate text-on-surface', row.emph]}>Emphasized type</p>
				</div>
			{/each}
		</div>
		<div class="mt-6 grid gap-4 rounded-m3-lg bg-surface-container p-4 sm:grid-cols-2">
			<div>
				<code class="type-label-md font-mono text-on-surface-variant">text-headline-md (no family → font-sans)</code>
				<p class="text-headline-md text-on-surface">Roboto Flex headline</p>
			</div>
			<div>
				<code class="type-label-md font-mono text-on-surface-variant">type-headline-md (brand family)</code>
				<p class="type-headline-md text-on-surface">Google Sans Flex headline</p>
			</div>
			<div>
				<code class="type-label-md font-mono text-on-surface-variant">text-label-lg-emphasized font-brand</code>
				<p class="text-label-lg-emphasized font-brand text-on-surface">Label emphasized, brand family</p>
			</div>
			<div>
				<code class="type-label-md font-mono text-on-surface-variant">text-body-lg font-plain</code>
				<p class="text-body-lg font-plain text-on-surface">Body large via text-* utility</p>
			</div>
		</div>
	</section>

	<!-- shape corners -->
	<section aria-labelledby="corners">
		<div id="corners">
			{@render sectionTitle('Corner radius', 'rounded-m3-* — the 10-step M3 Expressive corner scale.')}
		</div>
		<ul class="grid grid-cols-2 gap-4 sm:grid-cols-5">
			{#each corners as c (c.name)}
				<li class="flex flex-col items-center gap-2">
					<div class={['size-24 bg-tertiary-container', c.cls]}></div>
					<span class="type-label-md text-on-surface">{c.name}</span>
					<span class="type-body-sm text-on-surface-variant">{c.px}</span>
				</li>
			{/each}
		</ul>
	</section>

	<!-- (d) shapes -->
	<section aria-labelledby="shapes">
		<div id="shapes">
			{@render sectionTitle(
				'Shape library',
				'The 35 M3 Expressive shapes (RoundedPolygon port of androidx.graphics.shapes). Tap the first tile to morph with a fast-spatial spring.'
			)}
		</div>
		<ul class="grid grid-cols-3 gap-3 sm:grid-cols-5 lg:grid-cols-7">
			<li class="col-span-3 sm:col-span-2 lg:col-span-2">
				<div class="flex h-full flex-col gap-3 rounded-m3-xl bg-primary-container p-4 text-on-primary-container">
					<button
						type="button"
						class="mx-auto block size-36 rounded-m3-full"
						aria-label="Morph {SHAPE_LABELS[morphFrom]} to {SHAPE_LABELS[morphTo]}"
						onclick={toggleMorph}
					>
						<svg viewBox="0 0 100 100" class="size-full overflow-visible">
							<path
								d={morphD}
								class="fill-m3-primary"
								transform="rotate({morphProgress * 90} 50 50)"
							/>
						</svg>
					</button>
					<div class="flex gap-2">
						<select
							bind:value={morphFrom}
							aria-label="From shape"
							class="type-label-md min-w-0 flex-1 rounded-m3-sm border border-outline bg-transparent p-1"
						>
							{#each SHAPE_NAMES as n (n)}
								<option value={n}>{SHAPE_LABELS[n]}</option>
							{/each}
						</select>
						<select
							bind:value={morphTo}
							aria-label="To shape"
							class="type-label-md min-w-0 flex-1 rounded-m3-sm border border-outline bg-transparent p-1"
						>
							{#each SHAPE_NAMES as n (n)}
								<option value={n}>{SHAPE_LABELS[n]}</option>
							{/each}
						</select>
					</div>
					<span class="type-body-sm tabular-nums">progress {morphProgress.toFixed(3)}</span>
				</div>
			</li>
			{#each SHAPE_NAMES as name (name)}
				<li class="flex flex-col items-center gap-2 rounded-m3-lg bg-surface-container-low p-3">
					<svg viewBox="0 0 100 100" class="size-16 sm:size-20" role="img" aria-label={SHAPE_LABELS[name]}>
						<path d={shapePath(name)} class="fill-primary-container stroke-on-primary-container" stroke-width="1.5" />
					</svg>
					<span class="type-label-sm text-center text-on-surface-variant">{SHAPE_LABELS[name]}</span>
				</li>
			{/each}
		</ul>
	</section>

	<!-- (e) motion -->
	<section aria-labelledby="motion">
		<div id="motion">
			{@render sectionTitle(
				'Motion',
				`Springs for the ${theme.motionScheme} scheme as CSS linear() easings (ease-spring-* duration-spring-*), plus legacy easing tokens (ease-m3-* duration-m3-*). Spatial springs overshoot; effects springs never do.`
			)}
		</div>
		<div class="mb-4">
			<button
				type="button"
				class="type-label-lg inline-flex h-10 items-center gap-2 rounded-m3-full bg-secondary-container px-4 text-on-secondary-container"
				onclick={toggleAll}
				{@attach ripple()}
			>
				<Icon name="play_arrow" size={20} fill />
				Play all
			</button>
		</div>
		{#snippet motionRow(row: MotionRow)}
			<button
				type="button"
				class="grid w-full grid-cols-[8.5rem_1fr] items-center gap-3 rounded-m3-md px-2 py-2 text-left sm:grid-cols-[12rem_1fr]"
				onclick={() => (moved[row.label] = !moved[row.label])}
				{@attach stateLayer()}
			>
				<span class="flex flex-col">
					<span class="type-label-lg text-on-surface">{row.label}</span>
					<span class="type-body-sm text-on-surface-variant">{row.note}</span>
				</span>
				<span class="relative h-12 w-[248px] max-w-full rounded-m3-full bg-surface-container-highest">
					<span
						class={[
							'absolute top-0 left-0 size-12 rounded-m3-full bg-m3-primary transition-transform',
							row.cls,
							moved[row.label] && 'translate-x-[200px]'
						]}
					></span>
				</span>
			</button>
		{/snippet}
		<div class="flex flex-col gap-1">
			{#each springRows as row (row.label)}
				{@render motionRow(row)}
			{/each}
		</div>
		<h3 class="type-title-md mt-6 mb-2 text-on-surface">Easing & duration tokens</h3>
		<div class="flex flex-col gap-1">
			{#each legacyRows as row (row.label)}
				{@render motionRow(row)}
			{/each}
		</div>
	</section>

	<!-- (f) elevation -->
	<section aria-labelledby="elevation">
		<div id="elevation">
			{@render sectionTitle(
				'Elevation',
				'shadow-m3-0 … shadow-m3-5 (key 30% + ambient 15% shadows). Prefer tonal surface-container roles for separation; levels 4–5 are for hover/drag only.'
			)}
		</div>
		<ul class="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-6">
			{#each elevations as e (e.level)}
				<li class={['flex aspect-square flex-col justify-end rounded-m3-lg bg-surface-container-low p-4', e.cls]}>
					<span class="type-title-md text-on-surface">Level {e.level}</span>
					<span class="type-body-sm text-on-surface-variant">{e.dp}</span>
					<code class="type-body-sm font-mono text-on-surface-variant">{e.cls}</code>
				</li>
			{/each}
		</ul>
	</section>

	<!-- (g) ripple -->
	<section aria-labelledby="ripple">
		<div id="ripple">
			{@render sectionTitle(
				'State layers & ripple',
				'{@attach ripple()} — hover 8%, focus-visible 10%, pressed 10% of the content color, ripple grows from the pointer (450ms, min press 225ms). Keyboard: Tab to focus, Space/Enter to press.'
			)}
		</div>
		<div class="grid gap-4 md:grid-cols-[2fr_3fr]">
			<div
				role="button"
				tabindex="0"
				class="flex min-h-48 flex-col justify-end rounded-m3-xl bg-surface-container-highest p-6 text-on-surface select-none"
				onclick={() => rippleClicks++}
				onkeydown={(e) => {
					if (e.key === 'Enter' || e.key === ' ') {
						e.preventDefault();
						rippleClicks++;
					}
				}}
				{@attach ripple()}
			>
				<span class="type-title-lg">Ripple surface</span>
				<span class="type-body-md text-on-surface-variant">Pressed {rippleClicks} times · role="button"</span>
			</div>
			<div class="flex flex-wrap content-start items-center gap-3">
				<button
					type="button"
					class="type-label-lg h-10 rounded-m3-full bg-m3-primary px-6 text-on-primary"
					{@attach ripple()}>Filled</button
				>
				<button
					type="button"
					class="type-label-lg h-10 rounded-m3-full bg-secondary-container px-6 text-on-secondary-container"
					{@attach ripple()}>Tonal</button
				>
				<button
					type="button"
					class="type-label-lg h-10 rounded-m3-full border border-outline-variant px-6 text-on-surface-variant"
					{@attach ripple()}>Outlined</button
				>
				<button
					type="button"
					class="type-label-lg h-10 rounded-m3-full bg-surface-container-low px-6 text-m3-primary shadow-m3-1 transition-shadow duration-spring-fast-effects ease-spring-fast-effects hover:shadow-m3-2"
					{@attach ripple()}>Elevated</button
				>
				<button
					type="button"
					class="type-label-lg-emphasized h-14 rounded-m3-lg bg-tertiary-container px-6 text-on-tertiary-container"
					{@attach ripple({ color: 'var(--md-sys-color-tertiary)' })}>Custom color</button
				>
				<button
					type="button"
					class="type-label-lg h-10 rounded-m3-full px-4 text-m3-primary"
					{@attach stateLayer()}>stateLayer()</button
				>
				<button
					type="button"
					aria-label="Favorite"
					class="inline-flex size-10 items-center justify-center rounded-m3-full text-on-surface-variant"
					{@attach ripple({ centered: true })}
				>
					<Icon name="favorite" size={24} />
				</button>
				<button
					type="button"
					disabled
					class="type-label-lg h-10 rounded-m3-full bg-on-surface/12 px-6 text-on-surface/38"
					{@attach ripple()}>Disabled</button
				>
			</div>
		</div>
	</section>
</main>
