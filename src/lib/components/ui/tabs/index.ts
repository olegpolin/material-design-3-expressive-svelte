import Content from './tabs-content.svelte';
import Trigger from './tabs-trigger.svelte';
import Root from './tabs.svelte';
import List, { tabsListVariants, type TabsListVariant } from './tabs-list.svelte';
import type { TabsVariant } from './context.js';

export {
	Root,
	Content,
	List,
	Trigger,
	tabsListVariants,
	type TabsListVariant,
	type TabsVariant,
	//
	Root as Tabs,
	Content as TabsContent,
	List as TabsList,
	Trigger as TabsTrigger
};
