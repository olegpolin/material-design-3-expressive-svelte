<script lang="ts">
	import * as AlertDialog from '#lib/components/ui/alert-dialog/index.js';
	import * as Avatar from '#lib/components/ui/avatar/index.js';
	import { Button } from '#lib/components/ui/button/index.js';
	import { ButtonGroup, ButtonGroupItem } from '#lib/components/ui/button-group/index.js';
	import * as Card from '#lib/components/ui/card/index.js';
	import { Chip, ChipSet } from '#lib/components/ui/chip/index.js';
	import * as Dialog from '#lib/components/ui/dialog/index.js';
	import { Icon } from '#lib/components/ui/icon/index.js';
	import { List, ListItem } from '#lib/components/ui/list/index.js';
	import { LoadingIndicator } from '#lib/components/ui/loading-indicator/index.js';
	import { CircularProgress } from '#lib/components/ui/progress/index.js';
	import { Slider } from '#lib/components/ui/slider/index.js';
	import { snackbar } from '#lib/components/ui/snackbar/index.js';
	import { Switch } from '#lib/components/ui/switch/index.js';
	import { AppBarAction, TopAppBar } from '#lib/components/ui/top-app-bar/index.js';
	import type { MotionScheme } from '#lib/m3/motion.js';
	import { shapePath } from '#lib/m3/shapes.js';
	import { getTheme } from '#lib/m3/theme.svelte.js';
	import ExitAction from '#lib/components/mobile/exit-action.svelte';
	import { getMobileShell } from '#lib/components/mobile/shell.svelte.js';
	import { seedColors, user } from '#lib/components/mobile/data.js';

	const theme = getTheme();
	const shell = getMobileShell();

	let crossfade = $state(true);
	let gapless = $state(true);
	let normalize = $state(false);
	let episodes = $state(true);
	let volume = $state(72);
	let syncing = $state(true);
	let aboutOpen = $state(false);
	let signOutOpen = $state(false);

	const stats = [
		{ label: 'Following', value: user.stats.following },
		{ label: 'Followers', value: user.stats.followers },
		{ label: 'Notes', value: user.stats.notes }
	];

	let volumeIcon = $derived(volume === 0 ? 'volume_off' : volume < 40 ? 'volume_down' : 'volume_up');

	const playback = [
		{
			id: 'crossfade',
			icon: 'blur_linear',
			headline: 'Crossfade',
			supportingText: 'Blend the end of a song into the next',
			get: () => crossfade,
			set: (v: boolean) => (crossfade = v)
		},
		{
			id: 'gapless',
			icon: 'all_inclusive',
			headline: 'Gapless playback',
			supportingText: 'No silence between album tracks',
			get: () => gapless,
			set: (v: boolean) => (gapless = v)
		},
		{
			id: 'normalize',
			icon: 'equalizer',
			headline: 'Normalize volume',
			supportingText: 'Same loudness for every track',
			get: () => normalize,
			set: (v: boolean) => (normalize = v)
		}
	];
</script>

{#snippet groupTitle(title: string)}
	<h3 class="type-title-sm px-8 pt-6 pb-2 text-m3-primary">{title}</h3>
{/snippet}

<TopAppBar variant="medium-flexible" title="Profile" subtitle="Account and preferences">
	{#snippet trailing()}
		<ExitAction />
		<AppBarAction icon="info" label="About Pulse" onclick={() => (aboutOpen = true)} />
	{/snippet}
</TopAppBar>

<div class="flex flex-col pb-8">
	<!-- profile header -->
	<section aria-label="Profile" class="flex flex-col items-center gap-3 px-4 pt-2 pb-2 text-center">
		<div class="relative grid size-28 place-items-center">
			<svg viewBox="0 0 100 100" class="pulse-spin absolute inset-0 size-full" aria-hidden="true">
				<path d={shapePath('cookie12Sided')} class="fill-primary-container" />
			</svg>
			<Avatar.Root class="size-20 after:border-0">
				<Avatar.Image src={user.avatar} alt="" />
				<Avatar.Fallback class="type-title-lg bg-tertiary-container text-on-tertiary-container">
					{user.initials}
				</Avatar.Fallback>
			</Avatar.Root>
		</div>
		<div class="flex flex-col gap-0.5">
			<h2 class="type-headline-sm text-on-surface">{user.name}</h2>
			<p class="type-body-md text-on-surface-variant">{user.email} · {user.plan}</p>
		</div>
		<dl class="flex gap-6 py-1">
			{#each stats as stat (stat.label)}
				<div class="flex flex-col-reverse items-center">
					<dt class="type-label-md text-on-surface-variant">{stat.label}</dt>
					<dd class="type-title-md text-on-surface tabular-nums">{stat.value.toLocaleString('en-US')}</dd>
				</div>
			{/each}
		</dl>
		<div class="flex flex-wrap justify-center gap-2">
			<Button variant="tonal" onclick={() => snackbar('Profile editor coming soon')}>
				<Icon name="edit" data-icon="inline-start" />
				Edit profile
			</Button>
			<Button variant="tonal" onclick={() => snackbar('Profile link copied')}>
				<Icon name="share" data-icon="inline-start" />
				Share
			</Button>
		</div>
	</section>

	<!-- playback -->
	{@render groupTitle('Playback')}
	<List variant="segmented" class="px-4">
		{#each playback as p (p.id)}
			<ListItem headline={p.headline} supportingText={p.supportingText} leadingIcon={p.icon}>
				{#snippet trailing()}
					<Switch bind:checked={p.get, p.set} aria-label={p.headline} />
				{/snippet}
			</ListItem>
		{/each}
		<ListItem headline="Volume" supportingText="{volume}%" leadingIcon={volumeIcon}>
			{#snippet trailing()}
				<Slider bind:value={volume} size="xs" class="w-36" aria-label="Volume" />
			{/snippet}
		</ListItem>
	</List>

	<!-- display -->
	{@render groupTitle('Display')}
	<List variant="segmented" class="px-4">
		<ListItem headline="Dark theme" supportingText="Follows the system by default" leadingIcon="dark_mode">
			{#snippet trailing()}
				<Switch bind:checked={() => theme.dark, (v) => (theme.dark = v)} icons="checked" aria-label="Dark theme" />
			{/snippet}
		</ListItem>
		<ListItem headline="Brightness" supportingText="{shell.brightness}%" leadingIcon="brightness_6">
			{#snippet trailing()}
				<Slider bind:value={shell.brightness} min={20} max={100} size="xs" class="w-36" aria-label="Brightness" />
			{/snippet}
		</ListItem>
		<ListItem headline="New episode alerts" supportingText="From shows you follow" leadingIcon="notifications">
			{#snippet trailing()}
				<Switch bind:checked={episodes} aria-label="New episode alerts" />
			{/snippet}
		</ListItem>
	</List>

	<!-- theme -->
	{@render groupTitle('Theme')}
	<div class="mx-4 flex flex-col gap-4 rounded-m3-lg bg-surface-container px-4 py-4">
		<div class="flex flex-col gap-2">
			<span class="type-title-sm text-on-surface">Seed color</span>
			<ChipSet aria-label="Seed color">
				{#each seedColors as s (s.hex)}
					<Chip
						variant="filter"
						bind:selected={
							() => theme.seed.toLowerCase() === s.hex.toLowerCase(),
							(v) => {
								if (v) theme.seed = s.hex;
							}
						}
					>
						<span class="inline-flex items-center gap-2">
							<span
								class="size-3.5 rounded-m3-full ring-1 ring-outline-variant"
								style:background-color={s.hex}
								aria-hidden="true"
							></span>
							{s.name}
						</span>
					</Chip>
				{/each}
			</ChipSet>
		</div>
		<div class="flex flex-col gap-2">
			<span id="motion-scheme-label" class="type-title-sm text-on-surface">Motion</span>
			<ButtonGroup
				variant="connected"
				size="sm"
				type="single"
				required
				itemVariant="tonal"
				bind:value={() => theme.motionScheme, (v) => (theme.motionScheme = v as MotionScheme)}
				aria-labelledby="motion-scheme-label"
			>
				<ButtonGroupItem value="expressive" icon="bubble_chart">Expressive</ButtonGroupItem>
				<ButtonGroupItem value="standard" icon="linear_scale">Standard</ButtonGroupItem>
			</ButtonGroup>
			<p class="type-body-sm text-on-surface-variant">
				{theme.motionScheme === 'expressive'
					? 'Springs overshoot slightly for a lively feel.'
					: 'Critically damped springs for calmer motion.'}
			</p>
		</div>
	</div>

	<!-- data usage -->
	{@render groupTitle('Storage')}
	<Card.Root variant="outlined" shape="xl" class="mx-4">
		<Card.Header>
			<Card.Title>Data usage</Card.Title>
			<Card.Description>October · resets on the 31st</Card.Description>
		</Card.Header>
		<Card.Content class="flex flex-col gap-4">
			<div class="flex items-center gap-4">
				<CircularProgress value={68} wavy thick size={72} aria-label="Downloads storage used" />
				<div class="flex min-w-0 flex-col">
					<span class="type-headline-sm text-on-surface">6.8 GB</span>
					<span class="type-body-md">of 10 GB for downloads</span>
				</div>
			</div>
			<div class="flex items-center gap-3 rounded-m3-lg bg-surface-container px-3 py-2">
				{#if syncing}
					<LoadingIndicator size={40} aria-label="Syncing downloads" />
				{:else}
					<span class="grid size-10 place-items-center text-m3-primary"><Icon name="cloud_done" /></span>
				{/if}
				<div class="flex min-w-0 flex-1 flex-col">
					<span class="type-title-sm text-on-surface">{syncing ? 'Syncing downloads' : 'Downloads paused'}</span>
					<span class="type-body-sm truncate">3 episodes · 182 MB left</span>
				</div>
				<Button variant="text" size="sm" onclick={() => (syncing = !syncing)}>
					{syncing ? 'Pause' : 'Resume'}
				</Button>
			</div>
		</Card.Content>
	</Card.Root>

	<!-- account -->
	{@render groupTitle('Account')}
	<List variant="segmented" class="px-4">
		<ListItem
			headline="About Pulse"
			supportingText="Version 2.4.0"
			leadingIcon="info"
			trailingIcon="chevron_right"
			onclick={() => (aboutOpen = true)}
		/>
		<ListItem
			headline="Sign out"
			supportingText={user.email}
			leadingIcon="logout"
			onclick={() => (signOutOpen = true)}
		/>
	</List>
</div>

<!-- basic dialog with hero icon -->
<Dialog.Root bind:open={aboutOpen}>
	<Dialog.Content icon="graphic_eq" class="max-w-[calc(100%-48px)]">
		<Dialog.Header>
			<Dialog.Title>Pulse 2.4</Dialog.Title>
			<Dialog.Description>
				Music, podcasts and listening notes. A Material 3 Expressive showcase built with Svelte 5,
				Tailwind 4 and shadcn-svelte.
			</Dialog.Description>
		</Dialog.Header>
		<Dialog.Footer>
			<Button
				variant="text"
				onclick={() => {
					aboutOpen = false;
					snackbar('Open-source licenses: MIT, Apache 2.0, OFL');
				}}
			>
				Licenses
			</Button>
			<Button variant="text" onclick={() => (aboutOpen = false)}>OK</Button>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>

<!-- confirmation -->
<AlertDialog.Root bind:open={signOutOpen}>
	<AlertDialog.Content class="max-w-[calc(100%-48px)]">
		<AlertDialog.Header>
			<AlertDialog.Media><Icon name="logout" /></AlertDialog.Media>
			<AlertDialog.Title>Sign out of Pulse?</AlertDialog.Title>
			<AlertDialog.Description>
				Downloads stay on this device, but notes won't sync until you sign back in.
			</AlertDialog.Description>
		</AlertDialog.Header>
		<AlertDialog.Footer>
			<AlertDialog.Cancel>Cancel</AlertDialog.Cancel>
			<AlertDialog.Action
				onclick={() => {
					signOutOpen = false;
					snackbar('Signed out (demo)', { action: 'Undo', onAction: () => snackbar(`Welcome back, ${user.firstName}`) });
				}}
			>
				Sign out
			</AlertDialog.Action>
		</AlertDialog.Footer>
	</AlertDialog.Content>
</AlertDialog.Root>

<style>
	.pulse-spin {
		animation: pulse-spin 24s linear infinite;
	}
	@keyframes pulse-spin {
		to {
			rotate: 360deg;
		}
	}
	@media (prefers-reduced-motion: reduce) {
		.pulse-spin {
			animation: none;
		}
	}
</style>
