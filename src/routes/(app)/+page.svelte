<script lang="ts">
	import { Hero, LiveTheme, Highlights, PageTiles, LandingFooter } from '#lib/components/landing/index.js';
</script>

<svelte:head>
	<title>Material 3 Expressive · Svelte</title>
	<meta
		name="description"
		content="A Material Design 3 Expressive component library and showcase for Svelte 5, Tailwind 4 and shadcn-svelte."
	/>
</svelte:head>

<div class="flex min-h-full flex-col bg-surface text-on-surface">
	<Hero />

	<div class="mx-auto flex w-full max-w-[1440px] flex-col gap-16 px-4 py-12 sm:px-6 lg:gap-24 lg:px-10 lg:py-16">
		<LiveTheme />
		<Highlights />
		<PageTiles />
	</div>

	<LandingFooter />
</div>
