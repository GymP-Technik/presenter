import "./app.css";
import App from "./App.svelte";

declare global {
	interface Window {
		apiHost: string;
	}
}

window.apiHost = "";

const app = new App({
	target: document.getElementById("app"),
});

export default app;
