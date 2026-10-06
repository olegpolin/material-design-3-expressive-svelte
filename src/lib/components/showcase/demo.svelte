<script lang="ts">
	import type { Snippet } from "svelte";
	import { cn } from "#lib/utils.js";

	/**
	 * A single demo panel: a surface-container-low tile holding live components,
	 * with a label and the spec values (e.g. "Height 40dp · Corner full") underneath.
	 */
	let {
		label,
		spec,
		class: className,
		children,
	}: { label: string; spec?: string; class?: string; children: Snippet } = $props();
</script>

<div class="flex min-w-0 flex-col gap-2">
	<div
		class={cn(
			"flex flex-wrap items-center gap-4 rounded-m3-xl bg-surface-container-low p-6",
			className
		)}
	>
		{@render children()}
	</div>
	<div class="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 px-2">
		<span class="type-label-lg text-on-surface">{label}</span>
		{#if spec}
			<span class="type-label-sm text-on-surface-variant">{spec}</span>
		{/if}
	</div>
</div>
