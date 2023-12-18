import Dashboard from "./pages/Dashboard.svelte";
import Settings from "./pages/Settings.svelte";
import Management from "./pages/Management.svelte";
import Login from "./pages/Login.svelte";
import NotFound from "./pages/NotFound.svelte";

export default {
	// Exact path
	"/": Dashboard,

	"/management": Management,

	"/login": Login,

	"/settings": Settings,
	"/settings/*": Settings,

	"*": NotFound,
};
