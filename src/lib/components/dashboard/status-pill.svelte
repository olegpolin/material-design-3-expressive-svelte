<script lang="ts">
	import { Icon } from '#lib/components/ui/icon/index.js';
	import { cn } from '#lib/utils.js';
	import { STATUS_LABEL, type TaskStatus } from './data.js';

	/**
	 * Read-only task status, styled like a 24dp input chip without the outline. The M3 `Badge` is
	 * reserved for error-colored counts, so statuses use tonal container roles + an icon.
	 */
	let { status, class: className }: { status: TaskStatus; class?: string } = $props();

	const STYLE: Record<TaskStatus, { cls: string; icon: string }> = {
		todo: { cls: 'bg-surface-container-highest text-on-surface-variant', icon: 'radio_button_unchecked' },
		'in-progress': { cls: 'bg-primary-container text-on-primary-container', icon: 'progress_activity' },
		review: { cls: 'bg-secondary-container text-on-secondary-container', icon: 'rate_review' },
		done: { cls: 'bg-tertiary-container text-on-tertiary-container', icon: 'check_circle' },
		blocked: { cls: 'bg-error-container text-on-error-container', icon: 'block' }
	};
	const s = $derived(STYLE[status]);
</script>

<span class={cn('inline-flex h-6 items-center gap-1 rounded-m3-sm ps-1.5 pe-2 type-label-md whitespace-nowrap', s.cls, className)}>
	<Icon name={s.icon} size={16} fill={status === 'done'} />
	{STATUS_LABEL[status]}
</span>
