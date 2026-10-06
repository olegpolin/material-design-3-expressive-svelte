<script lang="ts">
	import type { Snippet } from "svelte";

	let {
		title,
		description,
		children,
	}: { title: string; description?: string; children: Snippet } = $props();
</script>

<div class="mx-auto flex w-full max-w-5xl flex-col gap-12 px-4 py-8 sm:px-6 lg:py-12">
	<header class="flex flex-col gap-3">
		<h1 class="type-display-sm-emphasized text-on-surface">{title}</h1>
		{#if description}
			<p class="type-body-lg max-w-2xl text-on-surface-variant">{description}</p>
		{/if}
	</header>
	{@render children()}
</div>
