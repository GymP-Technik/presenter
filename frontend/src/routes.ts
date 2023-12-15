import Dashboard from "./pages/Dashboard.svelte";
import Settings from "./pages/Settings.svelte";
import Login from "./pages/Login.svelte";
import NotFound from "./pages/NotFound.svelte";

export default {
	// Exact path
	"/": Dashboard,

	"/login": Login,

	"/settings": Settings,
	"/settings/*": Settings,

	"*": NotFound,
};
