import { createContext } from "svelte";

export interface BottomSheetContext {
	/** Modal sheets get a 32% scrim and block the page; standard sheets coexist with it. */
	readonly modal: boolean;
	/** Custom container: the sheet is positioned inside it (absolute) instead of the viewport. */
	readonly container: HTMLElement | null;
	readonly hasSnapPoints: boolean;
}

export const [getBottomSheetContext, setBottomSheetContext] = createContext<BottomSheetContext>();
