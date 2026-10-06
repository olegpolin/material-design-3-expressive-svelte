<script lang="ts">
	import './layout.css';
	import favicon from '#lib/assets/favicon.svg';
	// Latin subsets of the two text faces (all axes, see layout.css), preloaded so the first paint
	// doesn't wait for the stylesheet to discover them. Same files the @font-face rules point at.
	import robotoFlexLatin from '@fontsource-variable/roboto-flex/files/roboto-flex-latin-full-normal.woff2?url';
	import googleSansFlexLatin from '@fontsource-variable/google-sans-flex/files/google-sans-flex-latin-full-normal.woff2?url';
	import { ModeWatcher } from 'mode-watcher';
	import { createTheme, THEME_BOOT_SCRIPT } from '#lib/m3/theme.svelte.js';
	import type { LayoutProps } from './$types';

	let { children }: LayoutProps = $props();

	// Runtime M3 theme (seed / variant / contrast / motion scheme), available via getTheme().
	// Must run synchronously during component initialisation (it sets context and creates effects).
	const theme = createTheme();
	theme.start();

	// Applies the saved custom scheme + motion scheme before the first paint (no baseline flash).
	const bootScript = `<script>${THEME_BOOT_SCRIPT}</` + `script>`;
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<link rel="preload" href={robotoFlexLatin} as="font" type="font/woff2" crossorigin="anonymous" />
	<link rel="preload" href={googleSansFlexLatin} as="font" type="font/woff2" crossorigin="anonymous" />
	<!-- eslint-disable-next-line svelte/no-at-html-tags -- static, trusted inline script -->
	{@html bootScript}
</svelte:head>

<ModeWatcher />

{@render children()}
