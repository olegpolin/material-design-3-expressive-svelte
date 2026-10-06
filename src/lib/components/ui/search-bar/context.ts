import { createContext } from "svelte";

export type SearchViewContext = {
	/** Fill the query with `value`, close the view and fire `onsubmit`. */
	select(value: string): void;
};

const [getContext, setContext] = createContext<SearchViewContext>();

export { setContext as setSearchViewContext };

export function useSearchView(): SearchViewContext | undefined {
	try {
		return getContext();
	} catch {
		return undefined;
	}
}
