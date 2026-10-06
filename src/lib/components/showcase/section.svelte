<script lang="ts">
	import type { Snippet } from "svelte";

	let {
		id,
		title,
		description,
		children,
	}: { id?: string; title: string; description?: string; children: Snippet } = $props();

	let slug = $derived(id ?? title.toLowerCase().replace(/[^a-z0-9]+/g, "-"));
</script>

<section id={slug} class="flex scroll-mt-24 flex-col gap-5">
	<div class="flex flex-col gap-1">
		<h2 class="type-headline-sm text-on-surface">{title}</h2>
		{#if description}
			<p class="type-body-md max-w-2xl text-on-surface-variant">{description}</p>
		{/if}
	</div>
	{@render children()}
</section>
