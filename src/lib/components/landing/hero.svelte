<script lang="ts">
	import { Button } from '#lib/components/ui/button/index.js';
	import { Icon } from '#lib/components/ui/icon/index.js';
	import HeroShapes from './hero-shapes.svelte';

	type CtaSize = 'md' | 'lg' | 'xl';

	/** Emphasized label for the primary action, per size (typography: emphasized for primary buttons). */
	const EMPHASIZED: Record<CtaSize, string> = {
		md: 'type-title-md-emphasized',
		lg: 'type-headline-sm-emphasized',
		xl: 'type-headline-lg-emphasized',
	};

	const FACTS = [
		{ icon: 'interests', label: '35 morphing shapes' },
		{ icon: 'animation', label: '6 motion springs' },
		{ icon: 'palette', label: '49 dynamic color roles' },
		{ icon: 'text_fields', label: '30 type styles' },
	];
</script>

{#snippet ctas(size: CtaSize)}
	<Button href="/components" variant="filled" {size} class={EMPHASIZED[size]}>
		<Icon name="widgets" fill data-icon="inline-start" />
		Explore components
	</Button>
	<Button href="/dashboard" variant="tonal" {size}>
		<Icon name="space_dashboard" data-icon="inline-start" />
		Open the dashboard
	</Button>
{/snippet}

<section
	aria-labelledby="hero-title"
	class="relative isolate overflow-hidden bg-surface-container-low text-on-surface"
>
	<div
		class="@container/hero mx-auto grid w-full max-w-[1440px] grid-cols-1 gap-x-10 gap-y-8 px-4 pt-10 pb-12 sm:px-6 lg:grid-cols-[minmax(0,1.45fr)_minmax(0,1fr)] lg:px-10 lg:pt-16 lg:pb-16"
	>
		<div class="flex flex-col items-start gap-6">
			<span
				class="type-label-lg inline-flex h-8 items-center gap-2 rounded-m3-full bg-tertiary-container ps-3 pe-4 text-on-tertiary-container"
			>
				<Icon name="auto_awesome" fill size={18} />
				Svelte 5 · Tailwind 4 · shadcn-svelte
			</span>

			<h1 id="hero-title" class="hero-title type-display-lg-emphasized text-on-surface">
				Material 3 <span class="text-m3-primary">Expressive</span>, in&nbsp;Svelte
			</h1>

			<p class="type-body-lg max-w-[60ch] text-on-surface-variant @2xl/hero:type-title-lg">
				A component library built to the M3 Expressive spec — springy, interruptible motion, a 35-shape
				morphing library, emphasized type and dynamic color from any seed. Everything on this page is
				live: press it, drag it, recolor it.
			</p>

			<ul class="flex flex-wrap gap-x-5 gap-y-2" aria-label="What's inside">
				{#each FACTS as fact (fact.label)}
					<li class="type-label-lg inline-flex items-center gap-1.5 text-on-surface-variant">
						<Icon name={fact.icon} size={20} class="text-m3-primary" />
						{fact.label}
					</li>
				{/each}
			</ul>
		</div>

		<HeroShapes class="order-last mx-auto max-w-[280px] sm:max-w-[380px] lg:order-none lg:max-w-[520px] lg:self-center" />

		<div class="flex flex-col gap-3 sm:flex-row sm:flex-wrap lg:col-span-2 @2xl/hero:hidden">
			{@render ctas('md')}
		</div>
		<div class="hidden flex-wrap gap-4 lg:col-span-2 @2xl/hero:flex @[66rem]/hero:hidden">
			{@render ctas('lg')}
		</div>
		<div class="hidden flex-wrap gap-4 lg:col-span-2 @[66rem]/hero:flex">
			{@render ctas('xl')}
		</div>
	</div>
</section>

<style>
	/* Editorial hero moment: display-large emphasized, scaled up with the hero's width. */
	.hero-title {
		font-size: clamp(2.75rem, 1.25rem + 6.4cqi, 7.25rem);
		line-height: 1;
		letter-spacing: -0.02em;
		text-wrap: balance;
	}

	/* Light-on-dark text looks heavier; the editorial guidance offsets it with a negative grade, but
	   Google Sans Flex's GRAD axis only goes 0..100, so trim the weight a little instead (500 → 460). */
	:global(.dark) .hero-title {
		font-weight: 460;
	}
</style>
