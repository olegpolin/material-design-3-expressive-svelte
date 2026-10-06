import Body from "./side-sheet-body.svelte";
import Close from "./side-sheet-close.svelte";
import Content from "./side-sheet-content.svelte";
import Description from "./side-sheet-description.svelte";
import Footer from "./side-sheet-footer.svelte";
import Header from "./side-sheet-header.svelte";
import Title from "./side-sheet-title.svelte";
import Trigger from "./side-sheet-trigger.svelte";
import Root from "./side-sheet.svelte";

export type { SideSheetSide, SideSheetVariant } from "./context.js";

export {
	Root,
	Trigger,
	Content,
	Header,
	Title,
	Description,
	Body,
	Footer,
	Close,
	//
	Root as SideSheet,
	Trigger as SideSheetTrigger,
	Content as SideSheetContent,
	Header as SideSheetHeader,
	Title as SideSheetTitle,
	Description as SideSheetDescription,
	Body as SideSheetBody,
	Footer as SideSheetFooter,
	Close as SideSheetClose,
};
