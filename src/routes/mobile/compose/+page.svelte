<script lang="ts">
	import { tick } from 'svelte';
	import { SvelteSet } from 'svelte/reactivity';
	import { goto } from '$app/navigation';
	import * as BottomSheet from '#lib/components/ui/bottom-sheet/index.js';
	import { Button } from '#lib/components/ui/button/index.js';
	import { Checkbox } from '#lib/components/ui/checkbox/index.js';
	import { Chip, ChipSet } from '#lib/components/ui/chip/index.js';
	import * as Dialog from '#lib/components/ui/dialog/index.js';
	import { Icon } from '#lib/components/ui/icon/index.js';
	import { List, ListItem } from '#lib/components/ui/list/index.js';
	import * as RadioGroup from '#lib/components/ui/radio-group/index.js';
	import * as Select from '#lib/components/ui/select/index.js';
	import { Slider } from '#lib/components/ui/slider/index.js';
	import { snackbar } from '#lib/components/ui/snackbar/index.js';
	import { TextField } from '#lib/components/ui/text-field/index.js';
	import * as Toolbar from '#lib/components/ui/toolbar/index.js';
	import { AppBarAction, TopAppBar } from '#lib/components/ui/top-app-bar/index.js';
	import ExitAction from '#lib/components/mobile/exit-action.svelte';
	import { attachmentOptions, noteCategories } from '#lib/components/mobile/data.js';

	const uid = $props.id();
	const priorities = ['Low', 'Normal', 'Medium', 'High', 'Urgent'];
	const visibilities = [
		{ value: 'private', label: 'Only me', icon: 'lock' },
		{ value: 'followers', label: 'Followers', icon: 'group' },
		{ value: 'public', label: 'Everyone', icon: 'public' }
	];

	let title = $state('');
	let body = $state('');
	let category = $state<string>('');
	let tags = $state<string[]>(['lo-fi', 'focus']);
	let tagDraft = $state('');
	let priority = $state(2);
	let pinned = $state(true);
	let notify = $state(false);
	let visibility = $state('followers');
	let attachments = $state<string[]>([]);
	const formatting = new SvelteSet<string>();

	let submitted = $state(false);
	let sheetOpen = $state(false);
	let discardOpen = $state(false);
	let titleRef = $state<HTMLInputElement | HTMLTextAreaElement | null>(null);

	let titleError = $derived(submitted && !title.trim());
	let bodyError = $derived(submitted && !body.trim());
	let categoryError = $derived(submitted && !category);
	let categoryLabel = $derived(noteCategories.find((c) => c.value === category));
	let dirty = $derived(
		!!title || !!body || !!category || attachments.length > 0 || tags.join() !== 'lo-fi,focus'
	);

	function addTag() {
		const tag = tagDraft.trim().replace(/^#/, '').toLowerCase();
		if (tag && !tags.includes(tag)) tags = [...tags, tag];
		tagDraft = '';
	}

	function reset() {
		title = '';
		body = '';
		category = '';
		tags = ['lo-fi', 'focus'];
		priority = 2;
		attachments = [];
		formatting.clear();
		submitted = false;
	}

	async function save() {
		submitted = true;
		if (titleError || bodyError || categoryError) {
			await tick();
			if (titleError) titleRef?.focus();
			snackbar('Fill in the highlighted fields');
			return;
		}
		const saved = title.trim();
		reset();
		snackbar(`Note “${saved}” saved`, { action: 'View', onAction: () => goto('/mobile') });
	}

	function close() {
		if (dirty) discardOpen = true;
		else goto('/mobile');
	}

	function attach(id: string) {
		const option = attachmentOptions.find((o) => o.id === id);
		sheetOpen = false;
		if (option && !attachments.includes(option.headline)) attachments = [...attachments, option.headline];
	}

	function toggleFormat(id: string) {
		if (formatting.has(id)) formatting.delete(id);
		else formatting.add(id);
	}
</script>

<TopAppBar variant="center-aligned" title="New note">
	{#snippet leading()}
		<AppBarAction icon="close" label="Close" onclick={close} />
	{/snippet}
	{#snippet trailing()}
		<ExitAction />
		<Button variant="text" size="sm" class="me-1" onclick={save}>Save</Button>
	{/snippet}
</TopAppBar>

<form
	class="flex flex-col gap-6 px-4 pt-2 pb-24"
	novalidate
	onsubmit={(e) => {
		e.preventDefault();
		save();
	}}
>
	<TextField
		bind:ref={titleRef}
		bind:value={title}
		variant="outlined"
		label="Title"
		leadingIcon="title"
		maxlength={60}
		required
		error={titleError}
		errorText="Give your note a title"
		supportingText="Shown on your profile"
		class="w-full"
	/>

	<TextField
		bind:value={body}
		variant="filled"
		label="Note"
		multiline
		rows={4}
		maxlength={500}
		required
		error={bodyError}
		errorText="Write something first"
		supportingText="Markdown supported"
		class="w-full"
		inputClass={[
			formatting.has('bold') && 'font-semibold',
			formatting.has('italic') && 'italic',
			formatting.has('underline') && 'underline'
		]
			.filter(Boolean)
			.join(' ')}
	/>

	<!-- category: select styled as an outlined text field -->
	<div class="flex flex-col gap-1">
		<Select.Root type="single" bind:value={category}>
			<Select.Trigger
				id="{uid}-category"
				class="w-full"
				aria-label="Category"
				aria-invalid={categoryError || undefined}
			>
				<span data-slot="select-value">
					{#if categoryLabel}
						<Icon name={categoryLabel.icon} class="text-on-surface-variant" />
						{categoryLabel.label}
					{:else}
						<Icon name="category" class="text-on-surface-variant" />
						Category
					{/if}
				</span>
			</Select.Trigger>
			<Select.Content>
				<Select.Group>
					{#each noteCategories as c (c.value)}
						<Select.Item value={c.value} label={c.label}>
							<Icon name={c.icon} class="text-on-surface-variant" />
							{c.label}
						</Select.Item>
					{/each}
				</Select.Group>
			</Select.Content>
		</Select.Root>
		<p class={['type-body-sm px-4', categoryError ? 'text-error' : 'text-on-surface-variant']}>
			{categoryError ? 'Choose a category' : 'Helps followers find your note'}
		</p>
	</div>

	<!-- tags: input chips -->
	<fieldset class="flex flex-col gap-2">
		<legend class="type-title-sm mb-2 text-on-surface">Tags</legend>
		<ChipSet aria-label="Tags">
			{#each tags as tag (tag)}
				<Chip variant="input" removable onremove={() => (tags = tags.filter((t) => t !== tag))}>#{tag}</Chip>
			{/each}
		</ChipSet>
		<TextField
			bind:value={tagDraft}
			variant="outlined"
			label="Add a tag"
			prefix="#"
			trailingIcon="add"
			trailingIconLabel="Add tag"
			ontrailingclick={addTag}
			onkeydown={(e: KeyboardEvent) => {
				if (e.key === 'Enter') {
					e.preventDefault();
					addTag();
				}
			}}
			class="w-full"
		/>
	</fieldset>

	<!-- priority -->
	<div class="flex flex-col gap-2">
		<div class="flex items-baseline justify-between">
			<span id="{uid}-priority" class="type-title-sm text-on-surface">Priority</span>
			<span class="type-label-lg text-m3-primary">{priorities[priority - 1]}</span>
		</div>
		<Slider
			bind:value={priority}
			size="xs"
			min={1}
			max={5}
			step={1}
			ticks
			valueIndicator
			format={(v) => priorities[v - 1] ?? String(v)}
			aria-labelledby="{uid}-priority"
		/>
	</div>

	<!-- options -->
	<fieldset class="flex flex-col">
		<legend class="type-title-sm mb-1 text-on-surface">Options</legend>
		<label class="flex min-h-12 cursor-pointer items-center gap-2">
			<Checkbox bind:checked={pinned} />
			<span class="type-body-lg flex-1">Pin to Home</span>
		</label>
		<label class="flex min-h-12 cursor-pointer items-center gap-2">
			<Checkbox bind:checked={notify} />
			<span class="type-body-lg flex-1">Notify followers</span>
		</label>
	</fieldset>

	<fieldset class="flex flex-col">
		<legend class="type-title-sm mb-1 text-on-surface">Visibility</legend>
		<RadioGroup.Root bind:value={visibility} class="flex flex-col gap-0" aria-label="Visibility">
			{#each visibilities as v (v.value)}
				<label class="flex min-h-12 cursor-pointer items-center gap-2">
					<RadioGroup.Item value={v.value} aria-label={v.label} />
					<span class="type-body-lg flex-1">{v.label}</span>
					<Icon name={v.icon} class="me-2 text-on-surface-variant" />
				</label>
			{/each}
		</RadioGroup.Root>
	</fieldset>

	<!-- attachments -->
	<div class="flex flex-col gap-3">
		{#if attachments.length}
			<ChipSet aria-label="Attachments">
				{#each attachments as a (a)}
					<Chip
						variant="input"
						removable
						removeLabel="Remove {a}"
						onremove={() => (attachments = attachments.filter((x) => x !== a))}
					>
						{a}
					</Chip>
				{/each}
			</ChipSet>
		{/if}
		<Button variant="tonal" size="md" class="self-start" onclick={() => (sheetOpen = true)}>
			<Icon name="attach_file" data-icon="inline-start" />
			Add attachment
		</Button>
	</div>
</form>

<!-- formatting: docked toolbar pinned to the bottom of the phone's content area -->
<Toolbar.Docked aria-label="Formatting" class="fixed inset-x-0 bottom-0 z-20">
	<Toolbar.Button icon="format_bold" label="Bold" selected={formatting.has('bold')} onclick={() => toggleFormat('bold')} />
	<Toolbar.Button
		icon="format_italic"
		label="Italic"
		selected={formatting.has('italic')}
		onclick={() => toggleFormat('italic')}
	/>
	<Toolbar.Button
		icon="format_underlined"
		label="Underline"
		selected={formatting.has('underline')}
		onclick={() => toggleFormat('underline')}
	/>
	<Toolbar.Button icon="format_list_bulleted" label="Bulleted list" onclick={() => (body += `${body ? '\n' : ''}• `)} />
	<Toolbar.Button icon="checklist" label="Checklist" onclick={() => (body += `${body ? '\n' : ''}☐ `)} />
	<Toolbar.Button icon="mic" label="Dictate" onclick={() => snackbar('Listening…')} />
</Toolbar.Docked>

<!-- attachment picker -->
<BottomSheet.Root bind:open={sheetOpen}>
	<!-- the sheet's > 640dp window rules (side margins, 56dp top) key off the browser viewport;
	     inside the 412dp phone the compact layout applies -->
	<BottomSheet.Content class="min-[640px]:max-h-[calc(100%-72px)] min-[640px]:max-w-full">
		<BottomSheet.Header>
			<BottomSheet.Title>Add attachment</BottomSheet.Title>
			<BottomSheet.Description>Attach media to your note.</BottomSheet.Description>
		</BottomSheet.Header>
		<List class="bg-transparent pb-6">
			{#each attachmentOptions as o (o.id)}
				<ListItem
					headline={o.headline}
					supportingText={o.supportingText}
					leadingIcon={o.icon}
					trailingIcon={attachments.includes(o.headline) ? 'check' : undefined}
					onclick={() => attach(o.id)}
				/>
			{/each}
		</List>
	</BottomSheet.Content>
</BottomSheet.Root>

<!-- discard confirmation -->
<Dialog.Root bind:open={discardOpen}>
	<Dialog.Content icon="delete" class="max-w-[calc(100%-48px)]">
		<Dialog.Header>
			<Dialog.Title>Discard changes?</Dialog.Title>
			<Dialog.Description>Your note and its attachments will be lost.</Dialog.Description>
		</Dialog.Header>
		<Dialog.Footer>
			<Button variant="text" onclick={() => (discardOpen = false)}>Keep editing</Button>
			<Button
				variant="text"
				onclick={() => {
					discardOpen = false;
					reset();
					goto('/mobile');
				}}
			>
				Discard
			</Button>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>
