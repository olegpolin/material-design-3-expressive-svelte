<script lang="ts">
	import { Drawer as DrawerPrimitive } from "vaul-svelte";
	import { setBottomSheetContext } from "./context.js";

	/**
	 * M3 bottom sheet root (navigation-containment.md §8), built on vaul-svelte.
	 *   modal (default)  scrim 32%, focus is trapped, drag down / tap the scrim to dismiss.
	 *   standard         `modal={false}`: no scrim, the page stays interactive. Usually combined with
	 *                    `snapPoints` (e.g. `["56px", 0.5, 1]`, the first being the 56dp peek height)
	 *                    and `dismissible={false}` so it can only be collapsed to its peek height.
	 * `container` renders the sheet inside an element (e.g. a phone frame) instead of the viewport.
	 * With `snapPoints` the sheet is as tall as its container and the snap points set how much of it
	 * is visible; keep the largest one below `1` to leave the 72dp top margin.
	 */
	let {
		open = $bindable(false),
		activeSnapPoint = $bindable(null),
		modal = true,
		container = null,
		shouldScaleBackground = false,
		...restProps
	}: DrawerPrimitive.RootProps = $props();

	setBottomSheetContext({
		get modal() {
			return modal;
		},
		get container() {
			return container;
		},
		get hasSnapPoints() {
			// vaul's props are a union on `snapPoints`, so it stays inside restProps
			return !!restProps.snapPoints?.length;
		},
	});
</script>

<DrawerPrimitive.Root
	bind:open
	bind:activeSnapPoint
	{modal}
	{container}
	{shouldScaleBackground}
	{...restProps}
/>
