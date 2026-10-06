import { createContext } from 'svelte';

export type TabsVariant = 'primary' | 'secondary';

export interface TabsListContext {
	readonly variant: TabsVariant;
	readonly scrollable: boolean;
}

const [get, setTabsListContext, has] = createContext<TabsListContext>();

export { setTabsListContext };

export function getTabsListContext(): TabsListContext {
	return has() ? get() : { variant: 'primary', scrollable: false };
}
