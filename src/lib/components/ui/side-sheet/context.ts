import { createContext } from "svelte";

export type SideSheetVariant = "modal" | "standard";
export type SideSheetSide = "start" | "end";

export interface SideSheetContext {
	readonly variant: SideSheetVariant;
	/** Open state, shared by trigger / close / content (standard sheets have no bits-ui root). */
	open: boolean;
	/** id of the standard sheet's `<aside>`, for the trigger's `aria-controls`. */
	readonly contentId: string;
	readonly titleId: string;
}

export const [getSideSheetContext, setSideSheetContext] = createContext<SideSheetContext>();

/** 40dp icon button (48dp target) for the header close / back icons. */
export const SIDE_SHEET_ICON_BUTTON =
	"relative inline-flex size-10 shrink-0 cursor-pointer items-center justify-center rounded-m3-full text-on-surface-variant select-none after:absolute after:-inset-1 after:content-['']";
