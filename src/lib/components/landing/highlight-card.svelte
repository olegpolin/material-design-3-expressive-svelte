<script lang="ts">
	import type { Snippet } from 'svelte';
	import { cn } from '#lib/utils.js';
	import * as Card from '#lib/components/ui/card/index.js';
	import type { CardVariant } from '#lib/components/ui/card/index.js';

	/** Bento tile: title-medium heading, label-medium spec line, and a live demo stage. */
	let {
		title,
		spec,
		variant = 'elevated',
		class: className,
		stageClass,
		action,
		children,
	}: {
		title: string;
		spec: string;
		variant?: CardVariant;
		class?: string;
		/** Classes for the demo stage (layout of the demo). */
		stageClass?: string;
		/** Optional control at the end of the header. */
		action?: Snippet;
		children: Snippet;
	} = $props();
</script>

<Card.Root {variant} shape="xl" class={cn('gap-5 py-6 [--card-spacing:--spacing(6)]', className)}>
	<Card.Header class="items-center">
		<div class="flex min-w-0 flex-col gap-1">
			<h3 class="type-title-md text-on-surface">{title}</h3>
			<p class="type-label-md text-on-surface-variant">{spec}</p>
		</div>
		{#if action}
			<Card.Action class="self-center">{@render action()}</Card.Action>
		{/if}
	</Card.Header>
	<div class={cn('flex flex-1 flex-wrap items-center justify-center gap-4 px-6', stageClass)}>
		{@render children()}
	</div>
</Card.Root>
