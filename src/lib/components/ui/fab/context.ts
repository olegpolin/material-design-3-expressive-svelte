import { createContext } from "svelte";

export type FabMenuColor = "primary" | "secondary" | "tertiary";

export interface FabMenuContext {
	readonly color: FabMenuColor;
	readonly open: boolean;
	/** Registers an item; returns its live index accessor and an unregister function. */
	register(key: symbol): () => void;
	indexOf(key: symbol): number;
	/** Whether item `index` is revealed by the open/close stagger. */
	isVisible(index: number): boolean;
	close(options?: { focusToggle?: boolean }): void;
}

export const [getFabMenuContext, setFabMenuContext] = createContext<FabMenuContext>();

/** Item colors per FAB-menu color set (buttons.md §4.2). */
export const FAB_MENU_ITEM_COLORS: Record<FabMenuColor, string> = {
	primary: "bg-primary-container text-on-primary-container",
	secondary: "bg-secondary-container text-on-secondary-container",
	tertiary: "bg-tertiary-container text-on-tertiary-container",
};
