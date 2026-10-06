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
	const online = TEAM.filter((m) => m.online);
</script>

<Panel title="Team" description="{TEAM.length} members · {online.length} online" {loading} class={className}>
	{#snippet action()}
		<Button variant="tonal" size="sm" onclick={oninvite}>
			<Icon name="person_add" data-icon="inline-start" />Invite
		</Button>
	{/snippet}
	<div class="flex flex-col gap-4">
		<!-- 40dp avatars overlapping by 8dp, so the initials stay readable; 2dp ring in the card color -->
		<Avatar.Group class="-space-x-2" aria-label="Members">
			{#each TEAM.slice(0, SHOWN) as m (m.id)}
				<Tooltip.Root>
					<Tooltip.Trigger>
						{#snippet child({ props })}
							<button
								{...props}
								type="button"
								class="relative cursor-default rounded-m3-full ring-2 ring-surface-container-low"
								aria-label="{m.name}, {m.role}"
							>
								<MemberAvatar member={m} size="lg" />
							</button>
						{/snippet}
					</Tooltip.Trigger>
					<Tooltip.Content>{m.name} · {m.role}</Tooltip.Content>
				</Tooltip.Root>
			{/each}
			<Avatar.GroupCount
				class="relative size-10 bg-surface-container-highest type-label-md text-on-surface-variant ring-2 ring-surface-container-low"
				aria-label="{TEAM.length - SHOWN} more members"
			>
				+{TEAM.length - SHOWN}
			</Avatar.GroupCount>
		</Avatar.Group>
		<div class="flex flex-col gap-1">
			<h3 class="type-title-sm text-on-surface-variant">Online now</h3>
			<ul class="flex flex-col">
				{#each online as m (m.id)}
					<li class="flex h-14 items-center gap-4">
						<MemberAvatar member={m} size="lg" online />
						<span class="flex min-w-0 flex-1 flex-col">
							<span class="truncate type-body-lg text-on-surface">{m.name}</span>
							<span class="truncate type-body-sm text-on-surface-variant">{m.role}</span>
						</span>
					</li>
				{/each}
			</ul>
		</div>
	</div>
</Panel>
