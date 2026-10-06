import { createContext } from "svelte";

export type SplitButtonVariant = "filled" | "tonal" | "outlined" | "elevated";
export type SplitButtonSize = "xs" | "sm" | "md" | "lg" | "xl";

export interface SplitButtonContext {
	readonly variant: SplitButtonVariant;
	readonly size: SplitButtonSize;
}

export const [getSplitButtonContext, setSplitButtonContext] = createContext<SplitButtonContext>();
