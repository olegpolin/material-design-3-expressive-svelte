import { createContext } from "svelte";
import type { ButtonShape, ButtonVariant } from "#lib/components/ui/button/index.js";

export type ButtonGroupSize = "xs" | "sm" | "md" | "lg" | "xl";

export interface ButtonGroupContext {
	readonly variant: "standard" | "connected";
	readonly size: ButtonGroupSize;
	readonly shape: ButtonShape;
	/** Default color style for `ButtonGroupItem`s. */
	readonly itemVariant: ButtonVariant;
	/** Selection mode (`undefined` = plain action buttons). */
	readonly type: "single" | "multiple" | undefined;
}

export const [getButtonGroupContext, setButtonGroupContext] = createContext<ButtonGroupContext>();
