import "./app.css";
import App from "./App.svelte";

declare global {
	interface Window {
		apiHost: string;
	}
}

window.apiHost = "http://localhost:3001";

const app = new App({
	target: document.getElementById("app"),
});

export default app;
