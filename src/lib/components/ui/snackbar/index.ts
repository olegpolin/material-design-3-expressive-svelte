import Root from "./snackbar.svelte";
import SnackbarToast from "./snackbar-toast.svelte";

export {
	snackbar,
	dismissSnackbar,
	SNACKBAR_DURATION,
	type SnackbarOptions,
	type SnackbarDuration,
} from "./snackbar.js";

export { Root, Root as Snackbar, SnackbarToast };
