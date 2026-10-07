<script lang="ts">
	import { ripple } from '#lib/m3/ripple.svelte.js';
	import { shapePath } from '#lib/m3/shapes.js';
	import { Icon } from '#lib/components/ui/icon/index.js';

	const PAGES = [
		{ href: '/components', label: 'Components' },
		{ href: '/components/styles', label: 'Styles' },
		{ href: '/dashboard', label: 'Dashboard' },
		{ href: '/mobile', label: 'Mobile app' },
	];
	const EXTERNAL = [
		{ href: 'https://m3.material.io', label: 'm3.material.io' },
		{ href: 'https://github.com/olegpolin/material-expressive-svelte', label: 'Source on GitHub' },
	];

	const link =
		'type-label-lg inline-flex h-10 items-center gap-1.5 rounded-m3-full px-3 text-on-surface-variant hover:text-on-surface';
</script>

<footer class="border-t border-outline-variant">
	<div
		class="mx-auto flex w-full max-w-[1440px] flex-col gap-6 px-4 py-10 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-10"
	>
		<div class="flex items-center gap-3">
			<svg viewBox="0 0 100 100" aria-hidden="true" class="size-8 shrink-0 fill-m3-primary">
				<path d={shapePath('cookie7Sided')} />
			</svg>
			<p class="type-body-md max-w-[56ch] text-on-surface-variant">
				Built with Svelte 5, Tailwind 4 and shadcn-svelte · Material Design 3 Expressive spec
			</p>
		</div>

		<nav aria-label="Footer" class="-mx-3 flex flex-wrap items-center gap-1">
			{#each PAGES as p (p.href)}
				<a href={p.href} class={link} {@attach ripple()}>{p.label}</a>
			{/each}
			{#each EXTERNAL as p (p.href)}
				<a href={p.href} class={link} target="_blank" rel="noopener noreferrer" {@attach ripple()}>
					{p.label}
					<Icon name="open_in_new" size={18} />
					<span class="sr-only">(opens in a new tab)</span>
				</a>
			{/each}
		</nav>
	</div>
</footer>
