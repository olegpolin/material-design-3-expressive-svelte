import Content from "./tooltip-content.svelte";
import Portal from "./tooltip-portal.svelte";
import Provider from "./tooltip-provider.svelte";
import Trigger from "./tooltip-trigger.svelte";
import Action from "./tooltip-action.svelte";
import Persistent from "./tooltip-persistent.svelte";
import Root from "./tooltip.svelte";

export { tooltipVariants, type TooltipVariant } from "./tooltip-content.svelte";

export {
	Root,
	Trigger,
	Content,
	Provider,
	Portal,
	Action,
	Persistent,
	//
	Root as Tooltip,
	Content as TooltipContent,
	Trigger as TooltipTrigger,
	Provider as TooltipProvider,
	Portal as TooltipPortal,
	Action as TooltipAction,
	Persistent as TooltipPersistent,
};
