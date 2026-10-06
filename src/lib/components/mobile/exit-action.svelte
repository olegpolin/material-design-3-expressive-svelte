<script lang="ts">
	import { Icon } from '#lib/components/ui/icon/index.js';
	import { appBarActionVariants } from '#lib/components/ui/top-app-bar/index.js';
	import { ripple } from '#lib/m3/ripple.svelte.js';
	import { cn } from '#lib/utils.js';

	/**
	 * "Exit to site" app bar action. Only shown full-bleed (< 600px); in the desktop phone frame the
	 * backdrop has its own exit button.
	 */
	let { class: className }: { class?: string } = $props();
</script>

<a
	href="/"
	aria-label="Exit to site"
	title="Exit to site"
	data-sveltekit-preload-data="tap"
	data-sveltekit-reset="true"
	class={cn(appBarActionVariants(), 'min-[600px]:hidden', className)}
	{@attach ripple()}
>
	<Icon name="exit_to_app" />
</a>
