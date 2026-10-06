import Root, { buttonGroupVariants, type ButtonGroupVariant } from "./button-group.svelte";
import Item from "./button-group-item.svelte";
import type { ButtonGroupSize } from "./context.js";

export { squeeze } from "./squeeze.js";

export {
	Root,
	Item,
	//
	Root as ButtonGroup,
	Item as ButtonGroupItem,
	buttonGroupVariants,
	type ButtonGroupVariant,
	type ButtonGroupSize,
};
