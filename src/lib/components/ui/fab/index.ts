import Fab, {
	FAB_CONTAINER_SIZE,
	FAB_CORNER,
	FAB_ICON_SIZE,
	fabColors,
	fabVariants,
	type FabColor,
	type FabProps,
	type FabSize,
} from "./fab.svelte";
import ExtendedFab, {
	EXTENDED_FAB_ICON_SIZE,
	extendedFabVariants,
	type ExtendedFabProps,
	type ExtendedFabSize,
} from "./extended-fab.svelte";
import FabMenu from "./fab-menu.svelte";
import FabMenuItem from "./fab-menu-item.svelte";
import type { FabMenuColor } from "./context.js";

export {
	Fab,
	ExtendedFab,
	FabMenu,
	FabMenuItem,
	fabVariants,
	fabColors,
	extendedFabVariants,
	FAB_CONTAINER_SIZE,
	FAB_CORNER,
	FAB_ICON_SIZE,
	EXTENDED_FAB_ICON_SIZE,
	type FabColor,
	type FabProps,
	type FabSize,
	type ExtendedFabProps,
	type ExtendedFabSize,
	type FabMenuColor,
};
