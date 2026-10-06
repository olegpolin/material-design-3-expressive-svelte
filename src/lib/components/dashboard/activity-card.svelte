<script lang="ts">
	import { Button } from '#lib/components/ui/button/index.js';
	import { List, ListItem } from '#lib/components/ui/list/index.js';
	import { Skeleton } from '#lib/components/ui/skeleton/index.js';
	import MemberAvatar from './member-avatar.svelte';
	import Panel from './panel.svelte';
	import { ACTIVITY, memberById } from './data.js';

	let { loading = false, class: className }: { loading?: boolean; class?: string } = $props();
</script>

<Panel title="Activity" description="Latest from your team" {loading} class={className} contentClass="px-0">
	{#snippet action()}
		<Button variant="text" size="sm">View all</Button>
	{/snippet}
	{#snippet skeleton()}
		<div class="flex flex-col gap-4 px-6 py-2">
			{#each [0, 1, 2, 3] as i (i)}
				<div class="flex items-center gap-4">
					<Skeleton class="size-10 rounded-m3-full bg-on-surface/10" />
					<div class="flex flex-1 flex-col gap-2">
						<Skeleton class="h-4 w-1/2 rounded-m3-xs bg-on-surface/10" />
						<Skeleton class="h-3.5 w-4/5 rounded-m3-xs bg-on-surface/10" />
					</div>
				</div>
			{/each}
		</div>
	{/snippet}
	<List class="bg-transparent px-2 py-0">
		{#each ACTIVITY as a (a.id)}
			{@const m = memberById(a.memberId)}
			<ListItem headline={m.name} supportingText={a.action} trailingText={a.time} lines={2}>
				{#snippet leading()}
					<MemberAvatar member={m} size="lg" />
				{/snippet}
			</ListItem>
		{/each}
	</List>
</Panel>
