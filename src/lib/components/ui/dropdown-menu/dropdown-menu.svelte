<script lang="ts">
	import { DropdownMenu as DropdownMenuPrimitive } from "bits-ui";
	import { setMenuContext, type MenuVariant } from "./context.js";

	let {
		open = $bindable(false),
		variant = "baseline",
		...restProps
	}: DropdownMenuPrimitive.RootProps & {
		/** M3 menu style for every part of this menu: `baseline` (default) | `expressive` | `vibrant`. */
		variant?: MenuVariant;
	} = $props();

	setMenuContext({
		get variant() {
			return variant;
		},
	});
</script>

<DropdownMenuPrimitive.Root bind:open {...restProps} />
