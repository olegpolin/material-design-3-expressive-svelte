<script lang="ts">
	import * as Avatar from '#lib/components/ui/avatar/index.js';
	import { Button } from '#lib/components/ui/button/index.js';
	import { Icon } from '#lib/components/ui/icon/index.js';
	import * as Tooltip from '#lib/components/ui/tooltip/index.js';
	import MemberAvatar from './member-avatar.svelte';
	import Panel from './panel.svelte';
	import { TEAM } from './data.js';

	let { loading = false, oninvite, class: className }: { loading?: boolean; oninvite?: () => void; class?: string } = $props();

	const SHOWN = 5;
	const online = $derived(TEAM.filter((m) => m.online));
</script>

<Panel title="Team" description="{TEAM.length} members · {online.length} online" {loading} class={className}>
	<div class="flex flex-col gap-5">
		<Avatar.Group class="-space-x-3 *:data-[slot=avatar]:ring-3 *:data-[slot=avatar]:ring-surface-container-low">
			{#each TEAM.slice(0, SHOWN) as m (m.id)}
				<Tooltip.Root>
					<Tooltip.Trigger>
						{#snippet child({ props })}
							<button {...props} type="button" class="cursor-default rounded-m3-full" aria-label="{m.name}, {m.role}">
								<MemberAvatar member={m} size="lg" class="size-12 ring-3 ring-surface-container-low" />
							</button>
						{/snippet}
					</Tooltip.Trigger>
					<Tooltip.Content>{m.name} · {m.role}</Tooltip.Content>
				</Tooltip.Root>
			{/each}
			<Avatar.GroupCount
				class="size-12 bg-surface-container-highest type-label-lg text-on-surface-variant ring-3 ring-surface-container-low"
				aria-label="{TEAM.length - SHOWN} more members"
			>
				+{TEAM.length - SHOWN}
			</Avatar.GroupCount>
		</Avatar.Group>
		<ul class="flex flex-col gap-3">
			{#each online.slice(0, 3) as m (m.id)}
				<li class="flex items-center gap-3">
					<MemberAvatar member={m} online />
					<span class="min-w-0 flex-1 truncate type-body-md text-on-surface">{m.name}</span>
					<span class="type-label-md text-on-surface-variant">{m.role}</span>
				</li>
			{/each}
		</ul>
		<Button variant="tonal" size="sm" class="self-start" onclick={oninvite}>
			<Icon name="person_add" data-icon="inline-start" />Invite
		</Button>
	</div>
</Panel>
