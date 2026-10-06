<script lang="ts">
	import type { Snippet } from 'svelte';
	import * as Card from '#lib/components/ui/card/index.js';
	import { LoadingIndicator } from '#lib/components/ui/loading-indicator/index.js';
	import { cn } from '#lib/utils.js';

	/**
	 * Dashboard content card: elevated (surface-container-low, level 1), 28dp corners, 24dp padding
	 * (16 on compact), a title-large `<h2>` + body-medium description, optional trailing action.
	 * While `loading`, the body is replaced by a centered M3 loading indicator (or the `skeleton`
	 * snippet when given) and the card is marked `aria-busy`.
	 */
	let {
		title,
		description,
		action,
		footer,
		skeleton,
		loading = false,
		variant = 'elevated',
		class: className,
		contentClass,
		children,
		...restProps
	}: {
		title: string;
		description?: string;
		action?: Snippet;
		footer?: Snippet;
		skeleton?: Snippet;
		loading?: boolean;
		variant?: 'elevated' | 'filled' | 'outlined';
		class?: string;
		contentClass?: string;
		children: Snippet;
		id?: string;
	} = $props();
</script>

<Card.Root
	{variant}
	shape="xl"
	class={cn('min-w-0 gap-4 [--card-spacing:--spacing(6)] max-[599px]:[--card-spacing:--spacing(4)]', className)}
	aria-busy={loading}
	{...restProps}
>
	<Card.Header class={cn(action && 'grid-cols-[1fr_auto]')}>
		<Card.Title><h2 class="type-title-lg text-on-surface">{title}</h2></Card.Title>
		{#if description}
			<Card.Description>{description}</Card.Description>
		{/if}
		{#if action}
			<Card.Action class="-me-2 -mt-1 flex items-center gap-1">{@render action()}</Card.Action>
		{/if}
	</Card.Header>
	<Card.Content class={cn('relative flex min-h-0 flex-1 flex-col text-on-surface', contentClass)}>
		{#if loading}
			{#if skeleton}
				{@render skeleton()}
			{:else}
				<div class="grid min-h-48 flex-1 place-items-center">
					<LoadingIndicator contained aria-label="Loading {title.toLowerCase()}" />
				</div>
			{/if}
		{:else}
			{@render children()}
		{/if}
	</Card.Content>
	{#if footer}
		<Card.Footer>{@render footer()}</Card.Footer>
	{/if}
</Card.Root>
