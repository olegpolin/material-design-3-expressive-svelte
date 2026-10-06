import { createContext } from 'svelte';

export type ToolbarColor = 'standard' | 'vibrant';

export interface ToolbarContext {
	readonly color: ToolbarColor;
}

const [get, setToolbarContext, has] = createContext<ToolbarContext>();

export { setToolbarContext };

/** Toolbar context, or standard colors when used outside a toolbar. */
export function getToolbarContext(): ToolbarContext {
	return has() ? get() : { color: "standard" };
}
