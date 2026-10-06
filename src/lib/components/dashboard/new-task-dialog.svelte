<script lang="ts" module>
	export type NewTask = { title: string; description: string; project: string; assigneeId: string; urgent: boolean };
</script>

<script lang="ts">
	import { Button } from '#lib/components/ui/button/index.js';
	import * as Dialog from '#lib/components/ui/dialog/index.js';
	import * as Select from '#lib/components/ui/select/index.js';
	import { Switch } from '#lib/components/ui/switch/index.js';
	import { TextField } from '#lib/components/ui/text-field/index.js';
	import { ME, PROJECT_NAMES, TEAM } from './data.js';

	let { open = $bindable(false), onsave }: { open?: boolean; onsave: (t: NewTask) => void } = $props();

	const blank = (): NewTask => ({ title: '', description: '', project: PROJECT_NAMES[0], assigneeId: ME.id, urgent: false });
	let form = $state<NewTask>(blank());
	let touched = $state(false);

	const titleInvalid = $derived(touched && form.title.trim().length < 3);
	const assigneeName = $derived(TEAM.find((m) => m.id === form.assigneeId)?.name ?? '');

	function submit(e: SubmitEvent) {
		e.preventDefault();
		touched = true;
		if (form.title.trim().length < 3) return;
		onsave({ ...form, title: form.title.trim() });
		open = false;
		form = blank();
		touched = false;
	}
</script>

<Dialog.Root bind:open>
	<Dialog.Content class="w-[min(560px,calc(100vw-48px))]">
		<form class="contents" onsubmit={submit} novalidate>
			<Dialog.Header>
				<Dialog.Title>New task</Dialog.Title>
				<Dialog.Description>Add a task to one of the Orbit projects.</Dialog.Description>
			</Dialog.Header>
			<Dialog.Body class="flex flex-col gap-4 pt-2">
				<TextField
					variant="outlined"
					label="Title"
					required
					bind:value={form.title}
					maxlength={80}
					error={titleInvalid}
					errorText="Give the task a title (3+ characters)"
					supportingText="What needs to be done?"
					onblur={() => (touched = true)}
					class="w-full"
				/>
				<TextField
					variant="outlined"
					label="Description"
					multiline
					rows={3}
					bind:value={form.description}
					class="w-full"
				/>
				<div class="grid gap-4 min-[600px]:grid-cols-2">
					<Select.Root type="single" bind:value={form.project}>
						<Select.Trigger class="w-full" aria-label="Project">
							<span class="flex min-w-0 flex-col items-start">
								<span class="type-body-sm text-on-surface-variant">Project</span>
								<span data-slot="select-value" class="truncate">{form.project}</span>
							</span>
						</Select.Trigger>
						<Select.Content>
							<Select.Group>
								{#each PROJECT_NAMES as p (p)}
									<Select.Item value={p} label={p} />
								{/each}
							</Select.Group>
						</Select.Content>
					</Select.Root>
					<Select.Root type="single" bind:value={form.assigneeId}>
						<Select.Trigger class="w-full" aria-label="Assignee">
							<span class="flex min-w-0 flex-col items-start">
								<span class="type-body-sm text-on-surface-variant">Assignee</span>
								<span data-slot="select-value" class="truncate">{assigneeName}</span>
							</span>
						</Select.Trigger>
						<Select.Content>
							<Select.Group>
								{#each TEAM as m (m.id)}
									<Select.Item value={m.id} label={m.name} />
								{/each}
							</Select.Group>
						</Select.Content>
					</Select.Root>
				</div>
				<label class="flex min-h-12 cursor-pointer items-center justify-between gap-4" for="new-task-urgent">
					<span class="flex flex-col">
						<span class="type-body-lg text-on-surface">High priority</span>
						<span class="type-body-sm text-on-surface-variant">Notifies the assignee right away</span>
					</span>
					<Switch id="new-task-urgent" bind:checked={form.urgent} icons="checked" />
				</label>
			</Dialog.Body>
			<Dialog.Footer>
				<Dialog.Close>
					{#snippet child({ props })}<Button {...props} variant="text">Cancel</Button>{/snippet}
				</Dialog.Close>
				<Button type="submit" variant="filled">Create</Button>
			</Dialog.Footer>
		</form>
	</Dialog.Content>
</Dialog.Root>
