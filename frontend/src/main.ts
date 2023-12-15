import "./app.css";
import App from "./App.svelte";

declare global {
	interface Window {
		apiHost: string;
	}
}

if (import.meta.env.DEV) {
	window.apiHost = "http://localhost:3001";
} else {
	window.apiHost = "";
}

const app = new App({
	target: document.getElementById("app"),
});

export default app;
