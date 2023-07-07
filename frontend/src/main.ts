import "./app.css";
import App from "./App.svelte";

window.apiHost = "http://localhost:3001";

const app = new App({
	target: document.getElementById("app"),
});

export default app;
