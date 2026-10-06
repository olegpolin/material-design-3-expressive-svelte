<script lang="ts">
	import type { ComponentProps } from "svelte";
	import LinearProgress from "./linear-progress.svelte";

	/**
	 * shadcn-compatible `Progress` (bits-ui `value` / `max`), rendered as the M3 linear
	 * progress indicator. Accepts every `LinearProgress` prop (`indeterminate`, `wavy`, `thick`).
	 */
	let { ref = $bindable(null), ...restProps }: ComponentProps<typeof LinearProgress> = $props();
</script>

<LinearProgress bind:ref {...restProps} />
