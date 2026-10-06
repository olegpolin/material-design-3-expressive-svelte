<script lang="ts">
	import * as Avatar from '#lib/components/ui/avatar/index.js';
	import { cn } from '#lib/utils.js';
	import type { Member } from './data.js';

	/** shadcn Avatar with M3 container-role initials (primary / secondary / tertiary container). */
	let {
		member,
		size = 'default',
		online,
		class: className
	}: { member: Member; size?: 'sm' | 'default' | 'lg'; online?: boolean; class?: string } = $props();

	const TONE = {
		primary: 'bg-primary-container text-on-primary-container',
		secondary: 'bg-secondary-container text-on-secondary-container',
		tertiary: 'bg-tertiary-container text-on-tertiary-container'
	} as const;
</script>

<Avatar.Root {size} class={cn('after:border-0', className)}>
	<Avatar.Fallback class={cn('type-label-md', size === 'lg' && 'type-label-lg', TONE[member.tone])}>
		{member.initials}
	</Avatar.Fallback>
	{#if online}
		<Avatar.Badge class="bg-tertiary ring-surface-container-low" aria-label="Online" />
	{/if}
</Avatar.Root>
