import Action from "./card-action.svelte";
import Content from "./card-content.svelte";
import Description from "./card-description.svelte";
import Footer from "./card-footer.svelte";
import Header from "./card-header.svelte";
import Media from "./card-media.svelte";
import Title from "./card-title.svelte";
import Root, { cardVariants, type CardShape, type CardVariant } from "./card.svelte";

export {
	Root,
	Content,
	Description,
	Footer,
	Header,
	Media,
	Title,
	Action,
	cardVariants,
	type CardShape,
	type CardVariant,
	//
	Root as Card,
	Content as CardContent,
	Description as CardDescription,
	Footer as CardFooter,
	Header as CardHeader,
	Media as CardMedia,
	Title as CardTitle,
	Action as CardAction,
};
