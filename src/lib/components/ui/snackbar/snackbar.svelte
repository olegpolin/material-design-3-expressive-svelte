<script lang="ts">
	import type { ComponentProps } from "svelte";
	import { Toaster } from "#lib/components/ui/sonner/index.js";

	/**
	 * The M3 snackbar host. Mount it once (e.g. in a layout), then call `snackbar(message, options)`.
	 * Bottom-center, 12dp margin (8dp on phones), one snackbar visible at a time.
	 * It is the restyled sonner `Toaster`, so plain `toast()` calls render here too.
	 */
	let { ...restProps }: ComponentProps<typeof Toaster> = $props();
</script>

<Toaster {...restProps} />
