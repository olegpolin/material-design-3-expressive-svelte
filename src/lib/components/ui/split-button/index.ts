import Root, { splitButtonVariants } from "./split-button.svelte";
import Leading from "./split-button-leading.svelte";
import Trailing from "./split-button-trailing.svelte";
import type { SplitButtonSize, SplitButtonVariant } from "./context.js";

export {
	Root,
	Leading,
	Trailing,
	//
	Root as SplitButton,
	Leading as SplitButtonLeading,
	Trailing as SplitButtonTrailing,
	splitButtonVariants,
	type SplitButtonSize,
	type SplitButtonVariant,
};
